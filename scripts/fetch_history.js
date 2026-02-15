/**
 * Battle Brr-oyale — Historical Snowfall Data Fetcher
 * Fetches ~20 years of historical snowfall data from NOAA CDO API.
 * Writes: public/data/history.json
 * 
 * Run once: NOAA_TOKEN=<token> node scripts/fetch_history.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const NOAA_TOKEN = process.env.NOAA_TOKEN;
if (!NOAA_TOKEN) {
    console.error('❌ NOAA_TOKEN environment variable is required.');
    process.exit(1);
}

const BASE_URL = 'https://www.ncei.noaa.gov/cdo-web/api/v2/data';
const RATE_LIMIT_MS = 260;

const citiesPath = join(__dirname, '..', 'src', 'data', 'cities.json');
const cities = JSON.parse(readFileSync(citiesPath, 'utf-8'));

// Only fetch history for snow-capable cities
const snowCities = cities.filter(c => c.annual_average != null);

const START_YEAR = 2005;
const END_YEAR = 2025;

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
        console.warn(`  ⚠️ API error (${response.status}): ${(await response.text()).substring(0, 150)}`);
        return null;
    }

    return await response.json();
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

/**
 * For a given "season year" (e.g. 2020 = the 2020-2021 winter),
 * fetch SNOW from Sep 1 of that year through Apr 30 of the next year.
 */
async function fetchSeasonSnow(city, seasonYear) {
    const startDate = `${seasonYear}-09-01`;
    const endDate = `${seasonYear + 1}-04-30`;

    const results = await fetchAllPages({
        datasetid: 'GHCND',
        datatypeid: 'SNOW',
        stationid: city.station_id,
        startdate: startDate,
        enddate: endDate,
        units: 'standard'
    });

    if (!results || results.length === 0) return null;

    let total = 0;
    results.forEach(r => {
        if (r.value > 0) total += r.value;
    });

    return Math.round(total * 10) / 10;
}

async function main() {
    console.log('❄️ Battle Brr-oyale — Historical Data Fetch');
    console.log('==========================================\n');
    console.log(`📅 Fetching seasons ${START_YEAR}-${START_YEAR + 1} through ${END_YEAR}-${END_YEAR + 1}`);
    console.log(`🏙️ ${snowCities.length} cities to process\n`);

    const history = {};

    for (const city of snowCities) {
        console.log(`\n🌨️ ${city.name}, ${city.state} (${city.station_id})`);
        history[city.id] = {};

        for (let year = START_YEAR; year <= END_YEAR; year++) {
            process.stdout.write(`  Season ${year}-${year + 1}... `);
            const total = await fetchSeasonSnow(city, year);

            if (total != null) {
                history[city.id][String(year)] = total;
                console.log(`${total}"`);
            } else {
                console.log('no data');
            }

            await sleep(RATE_LIMIT_MS);
        }
    }

    const output = {
        meta: {
            generated_at: new Date().toISOString(),
            source: 'NOAA NCEI (GHCND)',
            start_season: START_YEAR,
            end_season: END_YEAR
        },
        cities: history
    };

    const outPath = join(__dirname, '..', 'public', 'data', 'history.json');
    writeFileSync(outPath, JSON.stringify(output, null, 2));
    console.log(`\n✅ Written to ${outPath}`);
}

main().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
