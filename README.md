# Battle Brr-oyale ❄️

A live, competitive winter weather leaderboard tracking the snowiest and coldest cities in the United States.

## Features
- **Live Leaderboard**: Tracks daily snowfall and temperature data from NOAA.
- **Interactive Map**: Visualizes snow belts and cold spots across the US.
- **Historical Analysis**: 20-year history charts for every city.
- **Hall of Fame**: Curated list of all-time NY snow records.
- **Storm Ticker**: Real-time alerts for major snow events (>4").
- **Dark/Light Mode**: Fully responsive theme with dynamic particle effects.

## Tech Stack
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS (custom `frost/ice` palette)
- **Map**: Leaflet + React Leaflet (Dark matter tiles)
- **Charts**: Recharts
- **Data**: NOAA CDO API (v2)
- **CI/CD**: GitHub Actions (Daily updates + Deploy)

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Locally**
   ```bash
   npm run dev
   ```

3. **Fetch Data Manually**
   ```bash
   # Get a token from https://www.ncdc.noaa.gov/cdo-web/token
   export NOAA_TOKEN=your_token_here
   npm run update-data
   ```

## Deployment

The app deploys automatically to GitHub Pages via GitHub Actions.

**Requirements:**
1. Add `NOAA_TOKEN` to your repository Secrets.
2. Ensure GitHub Pages is enabled in Settings -> Pages (Source: GitHub Actions).
3. Add CNAME record for custom domain if using one.

## License
MIT
