import React from 'react';

const icons = {
    sun: (
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 6a6 6 0 100 12 6 6 0 000-12z" />
    ),
    moon: (
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    ),
    snow: (
        <>
            <line x1="12" y1="2" x2="12" y2="22" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <line x1="12" y1="2" x2="14" y2="5" /><line x1="12" y1="2" x2="10" y2="5" />
            <line x1="12" y1="22" x2="14" y2="19" /><line x1="12" y1="22" x2="10" y2="19" />
        </>
    ),
    thermo: (
        <>
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
        </>
    ),
    info: (
        <>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
        </>
    ),
    trophy: (
        <>
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 5h1.5a2.5 2.5 0 0 0 0-5H18M6 9v4a6 6 0 0 0 12 0V4H6v5zM9 20h6m-3 0v-3" />
        </>
    ),
    close: (
        <>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </>
    ),
    crown: (
        <path d="M2 20h20l-2-8-4 4-4-8-4 8-4-4-2 8zm2-10l1 1m14-1l-1 1M12 4l1 2m-2 0l1-2" />
    ),
    search: (
        <>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </>
    ),
    chart: (
        <>
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </>
    ),
    'arrow-up-right': (
        <>
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
        </>
    ),
    'arrow-up': (
        <>
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
        </>
    ),
    'arrow-down': (
        <>
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
        </>
    ),
    minus: (
        <line x1="5" y1="12" x2="19" y2="12" />
    ),
    gauge: (
        <>
            <path d="M12 2a10 10 0 0 1 10 10" />
            <path d="M12 2a10 10 0 0 0-10 10" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <line x1="12" y1="12" x2="16" y2="8" />
        </>
    ),
    zap: (
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    ),
    map: (
        <>
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
        </>
    ),
    wind: (
        <>
            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
        </>
    ),
    star: (
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    )
};

export default function Icon({ name, size = 20, className = '', title, ...props }) {
    const iconContent = icons[name];
    if (!iconContent) return null;

    // Scale numeric sizes to rems (based on 16px default)
    // With html font-size: 12px, 1rem = 12px.
    // So size={20} -> 1.25rem -> 15px (75% of 20).
    const isNum = typeof size === 'number' || !isNaN(Number(size));
    const style = isNum ? {
        width: `${Number(size) / 16}rem`,
        height: `${Number(size) / 16}rem`
    } : { width: size, height: size };

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            style={style}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden={title ? undefined : 'true'}
            role={title ? 'img' : undefined}
            {...props}
        >
            {title && <title>{title}</title>}
            {iconContent}
        </svg>
    );
}
