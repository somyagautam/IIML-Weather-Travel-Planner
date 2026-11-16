# Roamcast AI — Weather & Travel Planner

A Next.js 14 + TypeScript starter for weather-aware travel planning.

## Features
- Search cities worldwide and retrieve a 10-day forecast (Open-Meteo).
- Generate a personalized 3–5 day itinerary from weather, interests, pace and daily available hours.
- Optional AI itinerary generation using the OpenAI API. Without a key, the app uses a useful local fallback planner.
- Discover nearby attractions from OpenStreetMap Overpass.
- Interactive map with attraction pins (Leaflet + OpenStreetMap tiles).
- Indicative trip cost breakdown in destination currency and INR, with live-ish FX rates from Frankfurter when available.

## Run locally
Node.js 18.17+ is recommended.
```bash
npm install
cp .env.example .env.local
# Optional: add OPENAI_API_KEY to .env.local for AI-generated itineraries
npm run dev
```
Open http://localhost:3000.

## APIs used
- Open-Meteo geocoding + forecast: no key required.
- OpenStreetMap Overpass: no key required; public community service, use responsibly.
- Frankfurter currency API: no key required; FX rates are reference rates, not payment quotes.
- OpenAI Responses-compatible Chat Completions endpoint: optional; server-side key only.

## Deploy to GitHub + Vercel
1. Create a GitHub repository and push this folder.
2. In Vercel choose **Add New → Project**, import the repository.
3. Add `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in Vercel Project → Settings → Environment Variables.
4. Deploy. If no key is configured, itinerary generation still works with the built-in fallback.

## Notes / production hardening
- Weather is a forecast, not a guarantee. Check close to travel dates.
- Attraction discovery depends on public OSM Overpass availability and map coverage. It may return few results in some regions.
- Cost estimates are broad planning estimates, not live hotel, restaurant or ticket quotes. They exclude flights, visas, insurance and shopping.
- FX rates may be unavailable; the app will show a transparent fallback conversion estimate.
- For production, consider a dedicated places provider, caching/rate limits, user accounts and saved trips. Respect OpenStreetMap attribution and public API usage policies.
