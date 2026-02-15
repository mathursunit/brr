import React from 'react';
import Icon from './Icon';

const FALLBACK_MESSAGES = [
    "❄️ Battle Brr-oyale — The ultimate winter weather showdown!",
    "🏔️ Tracking the snowiest and coldest cities in America",
    "📊 Data powered by NOAA NCEI — updated daily at 6 AM EST",
    "🌨️ Lake-effect snow belts dominate the leaderboard",
    "🥶 Fairbanks, AK often drops below -50°F in midwinter",
    "🏆 Syracuse has won the Golden Snowball Award more times than any other city",
    "❄️ The Tug Hill Plateau holds NY's all-time snowfall record: 466.9 inches",
];

export default function StormTicker({ stormEvents = [] }) {
    const hasStorms = stormEvents.length > 0;

    const items = hasStorms
        ? stormEvents.map(e => `⚡ ${e.message}`)
        : FALLBACK_MESSAGES;

    // Duplicate for seamless infinite scroll
    const doubled = [...items, ...items];

    return (
        <div
            className="ticker-bar relative overflow-hidden bg-frost-950/80 dark:bg-frost-950/90 border-b border-frost-800/30 dark:border-ice-400/10"
            role="marquee"
            aria-label="Weather alerts and updates"
        >
            <div className="flex items-center animate-marquee whitespace-nowrap py-2">
                {doubled.map((msg, i) => (
                    <span key={i} className="inline-flex items-center gap-2 mx-8 text-sm font-medium">
                        <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${hasStorms ? 'bg-fire-400 animate-pulse' : 'bg-emerald-400/60'
                                }`}
                        />
                        <span className="text-snow-200 dark:text-snow-300">{msg}</span>
                    </span>
                ))}
            </div>
        </div>
    );
}
