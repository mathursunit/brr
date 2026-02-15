import React, { useState, useMemo, useCallback } from 'react';
import Icon from './Icon';
import SnowMap from './SnowMap';
import CityHistory from './CityHistory';
import CityInfoModal from './CityInfoModal';

// --- Utility functions ---

function computeTrend(totalSnow, avgAnnual) {
    if (!avgAnnual || avgAnnual <= 0) return null;
    const now = new Date();
    const oct1 = new Date(now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1, 9, 1);
    const elapsed = Math.max(1, Math.min(212, Math.floor((now - oct1) / 86400000)));
    const expected = avgAnnual * (elapsed / 212);
    if (expected <= 0) return null;
    return Math.round(((totalSnow - expected) / expected) * 100);
}

function computeProgress(totalSnow, avgAnnual) {
    if (!avgAnnual || avgAnnual <= 0) return 0;
    return Math.min(150, Math.round((totalSnow / avgAnnual) * 100));
}

function progressColor(pct) {
    if (pct >= 100) return 'bg-emerald-500';
    if (pct >= 75) return 'bg-brand-500';
    return 'bg-fire-500';
}

function progressBg(pct) {
    if (pct >= 100) return 'bg-emerald-500/10 border-emerald-500/20';
    if (pct >= 75) return 'bg-brand-500/10 border-brand-500/20';
    return 'bg-fire-500/10 border-fire-500/20';
}

function RankChange({ current, previous }) {
    if (!previous || previous === 0) return <span className="text-frost-400 dark:text-snow-500"><Icon name="minus" size={14} /></span>;
    const delta = previous - current;
    if (delta > 0) return <span className="text-emerald-500 flex items-center gap-0.5 text-xs font-semibold"><Icon name="arrow-up" size={12} />{delta}</span>;
    if (delta < 0) return <span className="text-crimson-500 flex items-center gap-0.5 text-xs font-semibold"><Icon name="arrow-down" size={12} />{Math.abs(delta)}</span>;
    return <span className="text-frost-400 dark:text-snow-500"><Icon name="minus" size={14} /></span>;
}

function TrendBadge({ trend }) {
    if (trend === null || trend === undefined) return null;
    const positive = trend >= 0;
    return (
        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${positive
            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            : 'bg-fire-500/15 text-fire-600 dark:text-fire-400'
            }`}>
            {positive ? '+' : ''}{trend}%
        </span>
    );
}

function ProgressBar({ progress }) {
    const pct = Math.min(progress, 150);
    return (
        <div className={`w-full h-2 rounded-full border ${progressBg(pct)} overflow-hidden`}>
            <div
                className={`h-full rounded-full ${progressColor(pct)} transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(pct, 100) * (100 / 100)}%` }}
            />
        </div>
    );
}

// --- Podium Card ---
function PodiumCard({ entry, rank, isSnow, isLive, isHoF, onClick }) {
    const isFirst = rank === 1;
    const trend = isSnow && isLive ? computeTrend(entry.total_snow, entry.avg_annual) : null;
    const progress = isSnow && isLive ? computeProgress(entry.total_snow, entry.avg_annual) : 0;

    const sizeClasses = isFirst
        ? 'md:col-span-1 md:row-span-1 md:order-2'
        : rank === 2 ? 'md:order-1' : 'md:order-3';

    return (
        <div
            className={`relative group cursor-pointer ${sizeClasses}`}
            onClick={() => onClick(entry)}
            tabIndex={0}
            role="button"
            aria-label={`View details for ${entry.city || entry.city}, rank ${rank}`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(entry); } }}
        >
            <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${isFirst
                ? 'bg-gradient-to-br from-yellow-400/5 via-white to-fire-400/5 dark:from-yellow-400/10 dark:via-frost-900 dark:to-fire-400/10 border-yellow-400/30 dark:border-yellow-400/20 shadow-lg shadow-yellow-400/5'
                : 'bg-white dark:bg-frost-900/80 border-frost-200 dark:border-ice-400/10 shadow-md'
                } p-5 ${isFirst ? 'md:p-6' : ''}`}>
                {/* Rank badge */}
                <div className="flex items-center justify-between mb-3">
                    <div className={`flex items-center gap-2 ${isFirst ? 'text-yellow-500' : rank === 2 ? 'text-frost-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                        {isFirst && <Icon name="crown" size={20} className="text-yellow-500" />}
                        <span className={`text-2xl font-display font-black ${isFirst ? '' : 'opacity-80'}`}>#{rank}</span>
                    </div>
                    {isLive && <RankChange current={entry.rank} previous={entry.previous_rank} />}
                </div>

                {/* City */}
                <h3 className="text-lg font-display font-bold text-frost-900 dark:text-white mb-1">
                    {entry.city}{entry.state ? `, ${entry.state}` : ''}
                </h3>
                {isHoF && entry.region && (
                    <span className="text-xs text-frost-500 dark:text-snow-400">{entry.region}</span>
                )}

                {/* Primary metric */}
                <div className="mt-3">
                    {isSnow ? (
                        <p className="text-3xl font-display font-black text-frost-900 dark:text-white">
                            {entry.total_snow}<span className="text-lg text-frost-400 dark:text-snow-500">"</span>
                        </p>
                    ) : isHoF ? (
                        <p className="text-3xl font-display font-black text-frost-900 dark:text-white">
                            {entry.total_snow}<span className="text-lg text-frost-400 dark:text-snow-500">"</span>
                        </p>
                    ) : (
                        <p className="text-3xl font-display font-black text-frost-900 dark:text-white">
                            {entry.lowest_temp}<span className="text-lg text-frost-400 dark:text-snow-500">°F</span>
                        </p>
                    )}
                </div>

                {/* Trend */}
                {isSnow && isLive && trend !== null && (
                    <div className="mt-2">
                        <TrendBadge trend={trend} />
                    </div>
                )}

                {/* Progress bar */}
                {isSnow && isLive && entry.avg_annual > 0 && (
                    <div className="mt-3">
                        <div className="flex justify-between items-center text-xs text-frost-500 dark:text-snow-500 mb-1">
                            <span>% of Annual Avg</span>
                            <span>{progress}%</span>
                        </div>
                        <ProgressBar progress={progress} />
                    </div>
                )}

                {/* Last 24h */}
                {isSnow && isLive && entry.last_24h > 0 && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-ice-400/10 border border-ice-400/20 text-xs font-semibold text-ice-600 dark:text-ice-400">
                        <Icon name="snow" size={10} /> +{entry.last_24h}" last 24h
                    </div>
                )}

                {/* HoF badges */}
                {isHoF && (
                    <div className="mt-3">
                        {entry.is_state_record ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-xs font-bold text-yellow-600 dark:text-yellow-400">
                                <Icon name="star" size={10} /> STATE RECORD
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-brand-400/20 border border-brand-400/30 text-xs font-bold text-brand-600 dark:text-brand-400">
                                <Icon name="trophy" size={10} /> LEGENDARY
                            </span>
                        )}
                    </div>
                )}

                {/* Season label for HoF */}
                {isHoF && (
                    <p className="mt-2 text-xs text-frost-500 dark:text-snow-500">{entry.season} Season</p>
                )}
            </div>
        </div>
    );
}

// --- Main Leaderboard ---
export default function Leaderboard({ mode, filter, data, hofData, history, cityInfo, citiesGeo, theme }) {
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedHoF, setSelectedHoF] = useState(null);

    const isSnow = mode === 'snow';
    const isCold = mode === 'cold';
    const isHoF = filter === 'hof';
    const isLive = !isHoF;

    // Merge geo data (lat/lon) into rankings
    const rankings = useMemo(() => {
        if (isHoF) return hofData?.records || [];
        const list = data?.rankings || [];
        return list.map(r => {
            const geo = citiesGeo.find(c => c.id === r.id);
            return { ...r, lat: geo?.lat, lon: geo?.lon };
        });
    }, [data, hofData, isHoF, citiesGeo]);

    const top3 = rankings.slice(0, 3);
    const rest = rankings.slice(3);

    const lastUpdated = data?.last_updated;

    // Summary stats
    const summaryStats = useMemo(() => {
        if (rankings.length === 0) return null;
        const metricKey = isCold ? 'lowest_temp' : 'total_snow';
        const values = rankings.map(r => r[metricKey]).filter(v => v != null && v !== 0);
        if (values.length === 0) return null;
        const avg = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
        const max = isCold ? Math.min(...values) : Math.max(...values);
        const min = isCold ? Math.max(...values) : Math.min(...values);
        return { avg, max, min };
    }, [rankings, isCold]);

    const handleCityClick = useCallback((entry) => {
        if (isHoF) {
            setSelectedHoF(entry);
        } else {
            setSelectedCity(entry);
        }
    }, [isHoF]);

    const formatTs = (ts) => {
        if (!ts) return 'N/A';
        try {
            return new Date(ts).toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true
            });
        } catch { return 'N/A'; }
    };

    return (
        <div className="space-y-6">
            {/* Summary Bar */}
            <div className="flex flex-wrap items-center gap-3 bg-white/60 dark:bg-frost-900/60 backdrop-blur-md rounded-2xl p-4 border border-frost-200 dark:border-ice-400/10 shadow-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/20">
                    <Icon name="trophy" size={14} className="text-brand-500" />
                    <span className="text-xs font-semibold text-brand-700 dark:text-brand-400">
                        Top: {rankings[0]?.city || 'N/A'}{rankings[0]?.state ? `, ${rankings[0].state}` : ''}
                    </span>
                </div>
                {isLive && lastUpdated && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-frost-100 dark:bg-frost-800/40">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-medium text-frost-600 dark:text-snow-400">
                            Live: {formatTs(lastUpdated)}
                        </span>
                    </div>
                )}
                <div className="px-3 py-1.5 rounded-xl bg-frost-100 dark:bg-frost-800/40">
                    <span className="text-xs font-medium text-frost-600 dark:text-snow-400">
                        {isHoF ? 'Records' : 'Stations'}: {rankings.length}
                    </span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-frost-100 dark:bg-frost-800/40">
                    <span className="text-xs font-medium text-frost-600 dark:text-snow-400">
                        Mode: {isHoF ? 'Hall of Fame' : isCold ? 'Cold' : 'Snowfall'}
                    </span>
                </div>
            </div>



            {/* Map */}
            {isLive && rankings.length > 0 && (
                <SnowMap
                    rankings={rankings}
                    isColdMode={isCold}
                    onCityClick={handleCityClick}
                    theme={theme}
                />
            )}

            {/* Podium */}
            {top3.length > 0 && (
                <div className="grid md:grid-cols-3 gap-4">
                    {top3.map((entry, i) => (
                        <PodiumCard
                            key={entry.id || entry.rank}
                            entry={entry}
                            rank={i + 1}
                            isSnow={isSnow || isHoF}
                            isLive={isLive}
                            isHoF={isHoF}
                            onClick={handleCityClick}
                        />
                    ))}
                </div>
            )}

            {/* Data Table */}
            {rest.length > 0 && (
                <div className="bg-white dark:bg-frost-900/60 rounded-2xl border border-frost-200 dark:border-ice-400/10 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-frost-200 dark:border-frost-700/30">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-frost-500 dark:text-snow-500 uppercase tracking-wider">Rank</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-frost-500 dark:text-snow-500 uppercase tracking-wider">City</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-frost-500 dark:text-snow-500 uppercase tracking-wider">
                                        {isCold ? 'Low Temp' : 'Total Snow'}
                                    </th>
                                    {isSnow && isLive && (
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-frost-500 dark:text-snow-500 uppercase tracking-wider hidden sm:table-cell">% of Annual Avg</th>
                                    )}
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-frost-500 dark:text-snow-500 uppercase tracking-wider hidden sm:table-cell">
                                        {isCold ? 'Windchill' : isHoF ? 'Season' : 'Last 24h'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rest.map((entry, i) => {
                                    const trend = isSnow && isLive ? computeTrend(entry.total_snow, entry.avg_annual) : null;
                                    const progress = isSnow && isLive ? computeProgress(entry.total_snow, entry.avg_annual) : 0;

                                    return (
                                        <tr
                                            key={entry.id || entry.rank}
                                            className="border-b border-frost-100 dark:border-frost-800/30 hover:bg-frost-50 dark:hover:bg-frost-800/20 cursor-pointer transition-colors animate-fade-in-up"
                                            style={{ animationDelay: `${i * 50}ms` }}
                                            onClick={() => handleCityClick(entry)}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={`View details for ${entry.city}`}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCityClick(entry); } }}
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-frost-700 dark:text-snow-300">#{entry.rank || i + 4}</span>
                                                    {isLive && <RankChange current={entry.rank} previous={entry.previous_rank} />}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <span className="text-sm font-semibold text-frost-900 dark:text-white">{entry.city}</span>
                                                    <span className="text-sm text-frost-500 dark:text-snow-500">{entry.state ? `, ${entry.state}` : ''}</span>
                                                    {isCold && entry.record_date && (
                                                        <p className="text-xs text-frost-400 dark:text-snow-500">{entry.record_date}</p>
                                                    )}
                                                    {isHoF && entry.region && (
                                                        <p className="text-xs text-frost-400 dark:text-snow-500">{entry.region}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-sm font-bold text-frost-900 dark:text-white">
                                                        {isCold ? `${entry.lowest_temp}°F` : `${entry.total_snow}"`}
                                                    </span>
                                                    {isSnow && isLive && <TrendBadge trend={trend} />}
                                                </div>
                                            </td>
                                            {isSnow && isLive && (
                                                <td className="px-4 py-3 hidden sm:table-cell">
                                                    <div className="w-24 ml-auto">
                                                        <div className="flex justify-end text-xs text-frost-500 dark:text-snow-500 mb-0.5">{progress}%</div>
                                                        <ProgressBar progress={progress} />
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-4 py-3 text-right text-sm whitespace-nowrap hidden sm:table-cell">
                                                {isCold ? (
                                                    <span className="text-frost-600 dark:text-snow-400">{entry.lowest_windchill}°F</span>
                                                ) : isHoF ? (
                                                    <span className="text-frost-600 dark:text-snow-400">{entry.season}</span>
                                                ) : (
                                                    <span className="text-frost-600 dark:text-snow-400">{entry.last_24h > 0 ? `+${entry.last_24h}"` : '—'}</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Loading / Empty */}
            {rankings.length === 0 && (
                <div className="text-center py-16">
                    <Icon name="snow" size={48} className="mx-auto mb-4 text-frost-300 dark:text-frost-600" />
                    <p className="text-frost-500 dark:text-snow-500 text-lg">Loading weather data...</p>
                </div>
            )}

            {/* City Detail Modal */}
            {selectedCity && (
                <CityHistory
                    city={selectedCity}
                    onClose={() => setSelectedCity(null)}
                    history={history}
                    cityInfo={cityInfo?.[selectedCity.id]}
                />
            )}

            {/* HoF Modal */}
            {selectedHoF && (
                <CityInfoModal
                    record={selectedHoF}
                    onClose={() => setSelectedHoF(null)}
                />
            )}
        </div>
    );
}
