import React, { useEffect, useRef } from 'react';
import Icon from './Icon';

const TUG_HILL_TRIVIA = [
    "The Tug Hill Plateau is the snowiest non-mountainous region east of the Rocky Mountains.",
    "Lake Ontario's warm waters fuel massive lake-effect snow over the Tug Hill.",
    "Some Tug Hill locations average over 300 inches of snow per year.",
];

const GOLDEN_SNOWBALL_TRIVIA = [
    "The Golden Snowball Award has tracked NY city snowfall since 2002.",
    "Syracuse has won the Golden Snowball more times than any other city.",
    "Five cities compete annually: Syracuse, Rochester, Buffalo, Binghamton, and Albany.",
];

export default function CityInfoModal({ record, onClose }) {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        if (modalRef.current) modalRef.current.focus();
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    if (!record) return null;

    const isTugHill = record.region?.toLowerCase().includes('tug hill');
    const trivia = isTugHill ? TUG_HILL_TRIVIA : GOLDEN_SNOWBALL_TRIVIA;

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
                <div className="sticky top-0 z-10 bg-gradient-to-r from-brand-600 to-ice-600 px-6 py-5 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-md rounded-xl p-2">
                            <Icon name="crown" size={24} className="text-yellow-300" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white">{record.city}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium text-white/90">{record.region}</span>
                                <span className="text-sm text-white/80">{record.season} Season</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                        aria-label="Close modal"
                    >
                        <Icon name="close" size={24} className="text-white/80" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 grid md:grid-cols-2 gap-6">
                    {/* Left column */}
                    <div className="space-y-4">
                        {/* Total Snow Card */}
                        <div className="bg-gradient-to-br from-ice-50 to-brand-50 dark:from-frost-900 dark:to-frost-800 rounded-xl p-6 border border-ice-200 dark:border-ice-400/10 text-center">
                            <p className="text-xs font-semibold text-ice-600 dark:text-ice-400 uppercase tracking-wider mb-2">Seasonal Total</p>
                            <p className="text-5xl font-display font-black text-frost-900 dark:text-white">{record.total_snow}"</p>
                            <p className="text-sm text-frost-500 dark:text-snow-400 mt-1">{record.season} Season</p>
                            {record.is_state_record && (
                                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/30">
                                    <Icon name="star" size={12} className="text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">NY STATE RECORD</span>
                                </div>
                            )}
                        </div>

                        {/* Frozen Facts */}
                        <div>
                            <h3 className="text-sm font-semibold text-frost-700 dark:text-snow-300 mb-3 flex items-center gap-2">
                                <Icon name="snow" size={16} className="text-ice-400" />
                                Frozen Facts
                            </h3>
                            <ul className="space-y-2">
                                {record.fun_facts && record.fun_facts.map((fact, i) => (
                                    <li key={i} className="flex gap-3 items-start bg-frost-50 dark:bg-frost-800/30 rounded-xl p-3 border border-frost-200 dark:border-frost-700/30">
                                        <span className="text-ice-500 font-bold text-sm mt-0.5">❄</span>
                                        <span className="text-sm text-frost-700 dark:text-snow-300">{fact}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                        {/* Explore Links */}
                        {record.links && record.links.length > 0 && (
                            <div className="bg-frost-50 dark:bg-frost-800/30 rounded-xl p-4 border border-frost-200 dark:border-frost-700/30">
                                <h3 className="text-sm font-semibold text-frost-700 dark:text-snow-300 mb-3 flex items-center gap-2">
                                    <Icon name="arrow-up-right" size={16} className="text-brand-500" />
                                    Explore {record.city.split('(')[0].trim()}
                                </h3>
                                <div className="space-y-2">
                                    {record.links.map((link, i) => (
                                        <a
                                            key={i}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all group"
                                        >
                                            <Icon name="arrow-up-right" size={14} className="text-frost-400 group-hover:text-brand-500 transition-colors flex-shrink-0" />
                                            <span className="text-sm font-medium text-frost-700 dark:text-snow-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{link.label}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Did You Know? */}
                        <div className="bg-gradient-to-br from-brand-50 to-ice-50 dark:from-frost-900 dark:to-frost-800 rounded-xl p-4 border border-brand-200 dark:border-brand-400/10">
                            <h3 className="text-sm font-semibold text-brand-700 dark:text-brand-400 mb-3 flex items-center gap-2">
                                <Icon name="info" size={16} className="text-brand-500" />
                                Did You Know?
                            </h3>
                            <ul className="space-y-2">
                                {trivia.map((t, i) => (
                                    <li key={i} className="flex gap-2 items-start">
                                        <span className="text-brand-400 text-xs mt-1">▸</span>
                                        <span className="text-sm text-frost-600 dark:text-snow-400">{t}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
