/**
 * Battle Brr-oyale — NOAA Data Update Script
 * Fetches current-season snowfall and temperature data from the NOAA CDO API.
 * Writes: season_current.json, snowfall_ny.json, coldest_cities.json
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const NOAA_TOKEN = process.env.NOAA_TOKEN;
if (!NOAA_TOKEN) {
    console.error('❌ NOAA_TOKEN environment variable is required.');
    console.error('   Get a free token at: https://www.ncdc.noaa.gov/cdo-web/token');
    process.exit(1);
}

const BASE_URL = 'https://www.ncei.noaa.gov/cdo-web/api/v2/data';
const STORM_THRESHOLD = 4; // inches — threshold for storm event alerts
const RATE_LIMIT_MS = 260; // ms between API calls

// Load cities registry
const citiesPath = join(__dirname, '..', 'src', 'data', 'cities.json');
const cities = JSON.parse(readFileSync(citiesPath, 'utf-8'));

const OUTPUT_DIR = join(__dirname, '..', 'public', 'data');

// --- Utility Functions ---

function getSeasonDates() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    // Season starts Sep 1 of previous year if we're Jan-Aug, else Sep 1 of this year
    const seasonStartYear = month < 8 ? year - 1 : year;
    const startDate = `${seasonStartYear}-09-01`;
    const endDate = now.toISOString().split('T')[0];
    return { startDate, endDate, seasonStartYear };
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchNOAA(params) {
    const url = new URL(BASE_URL);
    Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

    const response = await fetch(url.toString(), {
        headers: { token: NOAA_TOKEN }
    });

    if (!response.ok) {
        const text = await response.text();
        console.warn(`  ⚠️ NOAA API error (${response.status}): ${text.substring(0, 200)}`);
        return null;
    }

    const data = await response.json();
    return data;
}

async function fetchAllPages(params) {
    let allResults = [];
    let offset = 1;
    const limit = 1000;

    while (true) {
        const result = await fetchNOAA({ ...params, limit: String(limit), offset: String(offset) });
        if (!result || !result.results || result.results.length === 0) break;

        allResults = allResults.concat(result.results);

        if (result.results.length < limit) break;
        offset += limit;
        await sleep(RATE_LIMIT_MS);
    }

    return allResults;
}

function readExistingRanks(filename) {
    const filepath = join(OUTPUT_DIR, filename);
    if (!existsSync(filepath)) return {};
    try {
        const data = JSON.parse(readFileSync(filepath, 'utf-8'));
        const rankings = data.rankings || [];
        const ranks = {};
        rankings.forEach(r => { ranks[r.id] = r.rank; });
        return ranks;
    } catch {
        return {};
    }
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// --- Main Data Fetch ---

async function fetchSnowData(city, startDate, endDate) {
    console.log(`  🌨️ Fetching SNOW for ${city.name}, ${city.state}...`);

    const results = await fetchAllPages({
        datasetid: 'GHCND',
        datatypeid: 'SNOW',
        stationid: city.station_id,
        startdate: startDate,
        enddate: endDate,
        units: 'standard'
    });

    if (!results || results.length === 0) {
        console.log(`    No snow data returned for ${city.name}`);
        return { totalSnow: 0, last24h: 0 };
    }

    // Sum all snow values (in inches) — NOAA GHCND SNOW is in mm, convert
    // Actually with units=standard, it should be in inches
    let totalSnow = 0;
    let last24h = 0;

    // Sort by date to find the most recent
    results.sort((a, b) => new Date(a.date) - new Date(b.date));

    results.forEach(r => {
        const val = r.value;
        if (val > 0) {
            // NOAA SNOW with units=standard returns tenths of inches or just inches
            // The GHCND SNOW datatype is in mm by default; with units=standard it's in inches
            totalSnow += val;
        }
    });

    // Get last entry as most recent
    if (results.length > 0) {
        const lastEntry = results[results.length - 1];
        const lastDate = new Date(lastEntry.date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        // Check if the last data point is from yesterday or today
        if (lastDate >= yesterday) {
            last24h = lastEntry.value > 0 ? lastEntry.value : 0;
        }
    }

    // Round to 1 decimal
    totalSnow = Math.round(totalSnow * 10) / 10;
    last24h = Math.round(last24h * 10) / 10;

    console.log(`    Total: ${totalSnow}" | Last 24h: ${last24h}"`);
    return { totalSnow, last24h };
}

async function fetchTempData(city, startDate, endDate) {
    console.log(`  🥶 Fetching TMIN for ${city.name}, ${city.state}...`);

    const results = await fetchAllPages({
        datasetid: 'GHCND',
        datatypeid: 'TMIN',
        stationid: city.station_id,
        startdate: startDate,
        enddate: endDate,
        units: 'standard'
    });

    if (!results || results.length === 0) {
        console.log(`    No temp data returned for ${city.name}`);
        return { lowestTemp: null, recordDate: null };
    }

    // Find the minimum temperature
    let lowestTemp = Infinity;
    let recordDate = null;

    results.forEach(r => {
        if (r.value < lowestTemp) {
            lowestTemp = r.value;
            recordDate = r.date;
        }
    });

    if (lowestTemp === Infinity) {
        return { lowestTemp: null, recordDate: null };
    }

    lowestTemp = Math.round(lowestTemp);
    console.log(`    Lowest: ${lowestTemp}°F on ${formatDate(recordDate)}`);
    return { lowestTemp, recordDate: formatDate(recordDate) };
}

// --- Build Output ---

async function main() {
    console.log('❄️ Battle Brr-oyale — Data Update');
    console.log('================================\n');

    const { startDate, endDate, seasonStartYear } = getSeasonDates();
    console.log(`📅 Season: ${startDate} → ${endDate}\n`);

    // Read existing ranks for delta tracking
    const prevNationalRanks = readExistingRanks('season_current.json');
    const prevNYRanks = readExistingRanks('snowfall_ny.json');
    const prevColdRanks = readExistingRanks('coldest_cities.json');

    // Collect snow data for all snow-tagged cities
    const snowCities = cities.filter(c => c.tags.includes('US_Top10') || c.tags.includes('NY_Top10'));
    const coldCities = cities.filter(c => c.tags.includes('Coldest_Cities'));

    const snowResults = {};
    const tempResults = {};

    // Fetch snow data
    console.log('📊 Fetching snowfall data...\n');
    for (const city of snowCities) {
        const snow = await fetchSnowData(city, startDate, endDate);
        snowResults[city.id] = snow;
        await sleep(RATE_LIMIT_MS);
    }

    // Fetch temp data for cold cities
    console.log('\n📊 Fetching temperature data...\n');
    for (const city of coldCities) {
        const temp = await fetchTempData(city, startDate, endDate);
        tempResults[city.id] = temp;
        await sleep(RATE_LIMIT_MS);
    }

    const now = new Date().toISOString();

    // --- Build season_current.json (National / US_Top10) ---
    console.log('\n📝 Building season_current.json...');
    const nationalCities = cities.filter(c => c.tags.includes('US_Top10'));
    let nationalRankings = nationalCities.map(c => {
        const snow = snowResults[c.id] || { totalSnow: 0, last24h: 0 };
        return {
            id: c.id,
            city: c.name,
            state: c.state,
            total_snow: snow.totalSnow,
            last_24h: snow.last24h,
            avg_annual: c.annual_average || 0,
            tags: c.tags,
            rank: 0,
            previous_rank: prevNationalRanks[c.id] || 0
        };
    });

    // Sort by total_snow descending
    nationalRankings.sort((a, b) => b.total_snow - a.total_snow);
    nationalRankings.forEach((r, i) => { r.rank = i + 1; });

    // Generate storm events
    const stormEvents = [];
    nationalRankings.forEach(r => {
        if (r.last_24h >= STORM_THRESHOLD) {
            stormEvents.push({
                city: r.city,
                state: r.state,
                snow_24h: r.last_24h,
                message: `${r.city} just got ${r.last_24h}" of fresh powder!`
            });
        }
    });

    writeFileSync(
        join(OUTPUT_DIR, 'season_current.json'),
        JSON.stringify({ last_updated: now, storm_events: stormEvents, rankings: nationalRankings }, null, 2)
    );
    console.log(`  ✅ Written with ${nationalRankings.length} cities, ${stormEvents.length} storm events`);

    // --- Build snowfall_ny.json (NY_Top10) ---
    console.log('📝 Building snowfall_ny.json...');
    const nyCities = cities.filter(c => c.tags.includes('NY_Top10'));
    let nyRankings = nyCities.map(c => {
        const snow = snowResults[c.id] || { totalSnow: 0, last24h: 0 };
        return {
            id: c.id,
            city: c.name,
            state: c.state,
            total_snow: snow.totalSnow,
            last_24h: snow.last24h,
            avg_annual: c.annual_average || 0,
            tags: c.tags,
            rank: 0,
            previous_rank: prevNYRanks[c.id] || 0
        };
    });

    nyRankings.sort((a, b) => b.total_snow - a.total_snow);
    nyRankings.forEach((r, i) => { r.rank = i + 1; });

    writeFileSync(
        join(OUTPUT_DIR, 'snowfall_ny.json'),
        JSON.stringify({ last_updated: now, rankings: nyRankings }, null, 2)
    );
    console.log(`  ✅ Written with ${nyRankings.length} cities`);

    // --- Build coldest_cities.json ---
    console.log('📝 Building coldest_cities.json...');
    let coldRankings = coldCities.map(c => {
        const temp = tempResults[c.id] || { lowestTemp: null, recordDate: null };
        return {
            id: c.id,
            city: c.name,
            state: c.state,
            lowest_temp: temp.lowestTemp,
            lowest_windchill: temp.lowestTemp != null ? temp.lowestTemp - 5 : null,
            record_date: temp.recordDate || 'N/A',
            all_time_low: c.all_time_low || null,
            all_time_windchill: c.all_time_low != null ? c.all_time_low - 10 : null,
            tags: c.tags,
            rank: 0,
            previous_rank: prevColdRanks[c.id] || 0
        };
    });

    // Sort by lowest_temp ascending (coldest first), nulls last
    coldRankings.sort((a, b) => {
        if (a.lowest_temp == null && b.lowest_temp == null) return 0;
        if (a.lowest_temp == null) return 1;
        if (b.lowest_temp == null) return -1;
        return a.lowest_temp - b.lowest_temp;
    });
    coldRankings.forEach((r, i) => { r.rank = i + 1; });

    writeFileSync(
        join(OUTPUT_DIR, 'coldest_cities.json'),
        JSON.stringify({ last_updated: now, rankings: coldRankings }, null, 2)
    );
    console.log(`  ✅ Written with ${coldRankings.length} cities`);

    console.log('\n✅ All data files updated successfully!');
}

main().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
