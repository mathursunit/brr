import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from './Icon';

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="bg-frost-950/95 backdrop-blur-md border border-ice-400/20 rounded-xl px-4 py-3 shadow-2xl">
            <p className="text-ice-300 text-xs font-medium mb-1">Season {label}-{Number(label) + 1}</p>
            <p className="text-white text-lg font-bold">{payload[0].value}" <span className="text-sm font-normal text-snow-400">snowfall</span></p>
        </div>
    );
}

export default function CityHistory({ city, onClose, history, cityInfo }) {
    const [activeTab, setActiveTab] = useState('analysis');
    const modalRef = useRef(null);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        if (modalRef.current) modalRef.current.focus();
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    if (!city) return null;

    // Build chart data from history
    const cityHistory = history?.cities?.[city.id] || {};
    const chartData = Object.entries(cityHistory)
        .map(([year, snow]) => ({ year, snow }))
        .sort((a, b) => Number(a.year) - Number(b.year));

    // Compute stats
    const snowValues = chartData.map(d => d.snow).filter(v => v > 0);
    const recordHigh = snowValues.length > 0 ? Math.max(...snowValues) : null;
    const recordLow = snowValues.length > 0 ? Math.min(...snowValues) : null;
    const avg20 = snowValues.length > 0 ? Math.round((snowValues.reduce((a, b) => a + b, 0) / snowValues.length) * 10) / 10 : null;
    const recordHighYear = recordHigh ? chartData.find(d => d.snow === recordHigh)?.year : null;
    const recordLowYear = recordLow ? chartData.find(d => d.snow === recordLow)?.year : null;

    const info = cityInfo || null;
    const hasFacts = info && info.fun_facts && info.fun_facts.length > 0;

    const isColdMode = city.lowest_temp !== undefined;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                ref={modalRef}
                tabIndex={-1}
                className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-frost-950 rounded-2xl shadow-2xl border border-frost-200 dark:border-ice-400/10"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white/80 dark:bg-frost-950/80 backdrop-blur-xl border-b border-frost-200 dark:border-ice-400/10 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-frost-950 dark:text-white">
                            {city.city}, {city.state}
                        </h2>
                        <p className="text-sm text-frost-600 dark:text-snow-400 mt-1">
                            {isColdMode ? 'Temperature Analysis' : 'Snowfall Analysis'} • Rank #{city.rank}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-frost-100 dark:hover:bg-frost-800/50 transition-colors"
                        aria-label="Close modal"
                    >
                        <Icon name="close" size={24} className="text-frost-500 dark:text-snow-400" />
                    </button>
                </div>

                {/* Tab bar */}
                {hasFacts && (
                    <div className="px-6 pt-4 flex gap-2">
                        <button
                            onClick={() => setActiveTab('analysis')}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'analysis'
                                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                                    : 'bg-frost-100 dark:bg-frost-800/40 text-frost-600 dark:text-snow-400 hover:bg-frost-200 dark:hover:bg-frost-700/40'
                                }`}
                        >
                            <Icon name="chart" size={14} className="inline mr-1.5 -mt-0.5" />
                            Analysis
                        </button>
                        <button
                            onClick={() => setActiveTab('facts')}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'facts'
                                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                                    : 'bg-frost-100 dark:bg-frost-800/40 text-frost-600 dark:text-snow-400 hover:bg-frost-200 dark:hover:bg-frost-700/40'
                                }`}
                        >
                            <Icon name="info" size={14} className="inline mr-1.5 -mt-0.5" />
                            City Facts
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'analysis' && (
                        <>
                            {/* Quick Stats */}
                            {!isColdMode && snowValues.length > 0 && (
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <div className="bg-gradient-to-br from-emerald-400/10 to-emerald-500/5 dark:from-emerald-400/10 dark:to-emerald-500/5 border border-emerald-400/20 rounded-xl p-4 text-center">
                                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Record High</p>
                                        <p className="text-2xl font-bold text-frost-900 dark:text-white">{recordHigh}"</p>
                                        <p className="text-xs text-frost-500 dark:text-snow-400">{recordHighYear}-{Number(recordHighYear) + 1}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-ice-400/10 to-ice-500/5 dark:from-ice-400/10 dark:to-ice-500/5 border border-ice-400/20 rounded-xl p-4 text-center">
                                        <p className="text-xs font-medium text-ice-600 dark:text-ice-400 uppercase tracking-wider mb-1">Record Low</p>
                                        <p className="text-2xl font-bold text-frost-900 dark:text-white">{recordLow}"</p>
                                        <p className="text-xs text-frost-500 dark:text-snow-400">{recordLowYear}-{Number(recordLowYear) + 1}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-brand-400/10 to-brand-500/5 dark:from-brand-400/10 dark:to-brand-500/5 border border-brand-400/20 rounded-xl p-4 text-center">
                                        <p className="text-xs font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">20-Yr Avg</p>
                                        <p className="text-2xl font-bold text-frost-900 dark:text-white">{avg20}"</p>
                                        <p className="text-xs text-frost-500 dark:text-snow-400">per season</p>
                                    </div>
                                </div>
                            )}

                            {/* Cold mode stats */}
                            {isColdMode && (
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <div className="bg-gradient-to-br from-ice-400/10 to-ice-500/5 border border-ice-400/20 rounded-xl p-4 text-center">
                                        <p className="text-xs font-medium text-ice-600 dark:text-ice-400 uppercase tracking-wider mb-1">Season Low</p>
                                        <p className="text-2xl font-bold text-frost-900 dark:text-white">{city.lowest_temp}°F</p>
                                        <p className="text-xs text-frost-500 dark:text-snow-400">{city.record_date}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-brand-400/10 to-brand-500/5 border border-brand-400/20 rounded-xl p-4 text-center">
                                        <p className="text-xs font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">Wind Chill</p>
                                        <p className="text-2xl font-bold text-frost-900 dark:text-white">{city.lowest_windchill}°F</p>
                                        <p className="text-xs text-frost-500 dark:text-snow-400">estimated</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-crimson-400/10 to-crimson-500/5 border border-crimson-400/20 rounded-xl p-4 text-center">
                                        <p className="text-xs font-medium text-crimson-500 dark:text-crimson-400 uppercase tracking-wider mb-1">All-Time Low</p>
                                        <p className="text-2xl font-bold text-frost-900 dark:text-white">{city.all_time_low}°F</p>
                                        <p className="text-xs text-frost-500 dark:text-snow-400">historical</p>
                                    </div>
                                </div>
                            )}

                            {/* Historical Chart */}
                            {chartData.length > 0 && !isColdMode && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-frost-700 dark:text-snow-300 mb-3 flex items-center gap-2">
                                        <Icon name="chart" size={16} className="text-brand-500" />
                                        Historical Snowfall (inches per season)
                                    </h3>
                                    <div className="bg-frost-50 dark:bg-frost-900/50 rounded-xl p-4 border border-frost-200 dark:border-frost-700/30">
                                        <ResponsiveContainer width="100%" height={280}>
                                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="snowGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3384fc" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3384fc" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-color, #e5e7eb)" opacity={0.3} />
                                                <XAxis
                                                    dataKey="year"
                                                    tick={{ fontSize: 11, fill: 'var(--axis-color, #6b7280)' }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 11, fill: 'var(--axis-color, #6b7280)' }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    width={45}
                                                    tickFormatter={(v) => `${v}"`}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area
                                                    type="monotone"
                                                    dataKey="snow"
                                                    stroke="#3384fc"
                                                    strokeWidth={2.5}
                                                    fill="url(#snowGradient)"
                                                    dot={{ r: 3, fill: '#3384fc', strokeWidth: 0 }}
                                                    activeDot={{ r: 6, fill: '#3384fc', stroke: '#fff', strokeWidth: 2 }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {chartData.length === 0 && !isColdMode && (
                                <div className="text-center py-12 text-frost-500 dark:text-snow-500">
                                    <Icon name="chart" size={40} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No historical snowfall data available for this city.</p>
                                </div>
                            )}

                            {/* Source */}
                            <div className="flex items-center gap-2 text-xs text-frost-400 dark:text-snow-500">
                                <Icon name="info" size={12} />
                                <span>Source: <a href="https://www.ncei.noaa.gov/" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-500 transition-colors">NOAA NCEI</a></span>
                            </div>
                        </>
                    )}

                    {activeTab === 'facts' && hasFacts && (
                        <>
                            {/* Fun Facts */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-frost-700 dark:text-snow-300 mb-3 flex items-center gap-2">
                                    <Icon name="snow" size={16} className="text-ice-400" />
                                    Fun Facts
                                </h3>
                                <ul className="space-y-2">
                                    {info.fun_facts.map((fact, i) => (
                                        <li key={i} className="flex gap-3 items-start bg-frost-50 dark:bg-frost-800/30 rounded-xl p-3 border border-frost-200 dark:border-frost-700/30">
                                            <span className="text-brand-500 font-bold text-sm mt-0.5">•</span>
                                            <span className="text-sm text-frost-700 dark:text-snow-300">{fact}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Links */}
                            {info.links && info.links.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-frost-700 dark:text-snow-300 mb-3 flex items-center gap-2">
                                        <Icon name="arrow-up-right" size={16} className="text-brand-500" />
                                        Explore
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {info.links.map((link, i) => (
                                            <a
                                                key={i}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 bg-frost-50 dark:bg-frost-800/30 rounded-xl p-3 border border-frost-200 dark:border-frost-700/30 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all group"
                                            >
                                                <Icon name="arrow-up-right" size={14} className="text-frost-400 group-hover:text-brand-500 transition-colors" />
                                                <span className="text-sm font-medium text-frost-700 dark:text-snow-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{link.label}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
