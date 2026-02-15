import React, { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';
import StormTicker from './StormTicker';
import Icon from './Icon';

// Note: In Vite, files in public/ are served at root
const DATA_URLS = {
    season: '/data/season_current.json',
    ny: '/data/snowfall_ny.json',
    cold: '/data/coldest_cities.json',
    hof: '/data/ny_hof.json',
    history: '/data/history.json',
    info: '/data/city_info.json'
};

export default function App() {
    const [mode, setMode] = useState('snow'); // 'snow' | 'cold'
    const [filter, setFilter] = useState('national'); // 'national' | 'ny' | 'hof'
    const [theme, setTheme] = useState('dark');
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    // Load theme from local storage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // Fetch all data
    useEffect(() => {
        async function fetchAll() {
            try {
                const [season, ny, cold, hof, history, info] = await Promise.all([
                    fetch(DATA_URLS.season).then(r => r.json()),
                    fetch(DATA_URLS.ny).then(r => r.json()),
                    fetch(DATA_URLS.cold).then(r => r.json()),
                    fetch(DATA_URLS.hof).then(r => r.json()),
                    fetch(DATA_URLS.history).then(r => r.json()),
                    fetch(DATA_URLS.info).then(r => r.json())
                ]);

                // Load cities registry to get geo data
                // In a real app we might import this directly, but since we have it static:
                // We'll pass it down from a static import

                setData({ season, ny, cold, hof, history, info });
                setLoading(false);
            } catch (e) {
                console.error("Failed to load data", e);
                setLoading(false);
            }
        }
        fetchAll();
    }, []);

    // Import cities geo data
    const [citiesGeo, setCitiesGeo] = useState([]);
    useEffect(() => {
        import('../data/cities.json').then(mod => {
            setCitiesGeo(mod.default);
        });
    }, []);

    // particles
    const [particles, setParticles] = useState([]);
    useEffect(() => {
        const count = mode === 'snow' ? 60 : 40;
        const newParticles = Array.from({ length: count }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: Math.random() * 4 + 1,
            duration: Math.random() * 10 + 5,
            delay: Math.random() * 5
        }));
        setParticles(newParticles);
    }, [mode]);

    // Determine current dataset
    const currentData = mode === 'cold'
        ? data.cold
        : filter === 'ny'
            ? data.ny
            : data.season;

    const activeStorms = data.season?.storm_events || [];

    return (
        <div className={`min-h-screen bg-frost-50 dark:bg-frost-950 font-sans transition-colors duration-300 overflow-x-hidden ${theme}`}>
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Aurora */}
                {theme === 'dark' && (
                    <>
                        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-emerald-500/10 blur-[120px] rounded-full animate-aurora-1" />
                        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-600/10 blur-[100px] rounded-full animate-aurora-2" />
                        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-aurora-3" />
                    </>
                )}

                {/* Particles */}
                {particles.map(p => (
                    <div
                        key={p.id}
                        className={`absolute rounded-full ${mode === 'snow' ? 'bg-white/40' : 'bg-ice-200/30 w-[1px]'
                            } animate-float`}
                        style={{
                            left: `${p.left}%`,
                            top: `${p.top}%`,
                            width: mode === 'snow' ? `${p.size}px` : '2px',
                            height: `${p.size}px`,
                            animationDuration: `${p.duration}s`,
                            animationDelay: `${p.delay}s`,
                            opacity: Math.random() * 0.5 + 0.1
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Alert Banner */}
                <div className={`w-full py-1.5 px-4 flex justify-between items-center text-xs font-medium ${mode === 'snow'
                    ? 'bg-brand-600 text-white'
                    : 'bg-ice-600 text-white'
                    }`}>
                    <div className="flex items-center gap-2">
                        <Icon name={mode === 'snow' ? 'snow' : 'thermo'} size={14} />
                        <span className="uppercase tracking-widest opacity-90">
                            {mode === 'snow' ? 'Snowfall Watch' : 'Deep Freeze Alert'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline opacity-70">Updated via NOAA NCEI</span>
                        <button
                            onClick={toggleTheme}
                            className="p-1 rounded-full hover:bg-white/20 transition-colors"
                            aria-label="Toggle theme"
                        >
                            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14} />
                        </button>
                    </div>
                </div>

                {/* Storm Ticker */}
                <StormTicker stormEvents={activeStorms} />

                {/* Header */}
                <header className="px-4 pt-8 pb-6 container mx-auto max-w-5xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight text-frost-950 dark:text-white drop-shadow-sm mb-2">
                                Battle <span className="text-brand-500 italic">Brr</span>-oyale
                            </h1>
                            <p className="text-frost-500 dark:text-snow-400 font-medium text-lg">
                                The ultimate winter weather showdown
                            </p>
                        </div>

                        {/* Global Mode Toggle */}
                        <div className="flex p-1.5 bg-white dark:bg-frost-900/60 backdrop-blur-sm rounded-2xl border border-frost-200 dark:border-ice-400/20 shadow-lg">
                            <button
                                onClick={() => { setMode('snow'); setFilter('national'); }}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${mode === 'snow'
                                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 scale-105'
                                    : 'text-frost-500 dark:text-snow-500 hover:text-frost-700 dark:hover:text-white'
                                    }`}
                            >
                                <Icon name="snow" className={mode === 'snow' ? 'animate-pulse-slow' : ''} />
                                Snowiest
                            </button>
                            <button
                                onClick={() => { setMode('cold'); setFilter('national'); }}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${mode === 'cold'
                                    ? 'bg-ice-500 text-white shadow-lg shadow-ice-500/25 scale-105'
                                    : 'text-frost-500 dark:text-snow-500 hover:text-frost-700 dark:hover:text-white'
                                    }`}
                            >
                                <Icon name="thermo" className={mode === 'cold' ? 'animate-pulse-slow' : ''} />
                                Coldest
                            </button>
                        </div>
                    </div>

                    {/* Sub-filters (Snow only) */}
                    {mode === 'snow' && (
                        <div className="mt-8 flex justify-center md:justify-start gap-2 overflow-x-auto pb-2">
                            {[
                                { id: 'national', label: 'National' },
                                { id: 'ny', label: 'New York' },
                                { id: 'hof', label: 'Hall of Fame' }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${filter === f.id
                                        ? 'bg-white dark:bg-white text-brand-600 border-white shadow-md'
                                        : 'bg-transparent text-frost-500 dark:text-snow-400 border-frost-200 dark:border-frost-700 hover:border-frost-400 dark:hover:border-frost-500'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    )}
                </header>

                {/* Main Content */}
                <main className="flex-1 px-4 pb-12 container mx-auto max-w-5xl">
                    {!loading ? (
                        <Leaderboard
                            mode={mode}
                            filter={filter}
                            data={currentData}
                            hofData={data.hof}
                            history={data.history}
                            cityInfo={data.info}
                            citiesGeo={citiesGeo}
                            theme={theme}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="py-8 text-center text-xs text-frost-400 dark:text-snow-600 border-t border-frost-200 dark:border-frost-900/50 mt-auto bg-white/50 dark:bg-frost-950/50 backdrop-blur-sm">
                    <p className="mb-2">
                        Data provided by <a href="https://www.ncei.noaa.gov/" className="underline hover:text-brand-500">NOAA National Centers for Environmental Information</a>
                    </p>
                    <p>© 2026 Battle Brr-oyale. Built for the cold.</p>
                </footer>
            </div>
        </div>
    );
}
