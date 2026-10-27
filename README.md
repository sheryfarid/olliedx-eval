# OllieDX Evaluation Studio — prototype

React + Vite + Tailwind prototype. All data is synthetic.

## Run locally
    npm install
    npm run dev

## Deploy on Vercel
Push to GitHub and import the repo in Vercel (framework: Vite). No environment variables are needed for the demo.

## Where the data lives
- `src/data/demoData.js` — all seed data (case fixtures and `buildDemoExternal()` for monitoring, performance, drift, fairness, tracking, logs …).
- `src/data/dataSource.js` — the switch. `VITE_DATA_MODE=demo` (default) uses the seed data; `VITE_DATA_MODE=api` calls the backend at `VITE_API_BASE`.
- `src/OllieDXEvalStudio.jsx` — the UI and in-browser evaluation engine.

## Moving to production
1. Implement the endpoints listed in `dataSource.js`, returning the same shapes as the demo data.
2. Set `VITE_DATA_MODE=api` and `VITE_API_BASE=https://eval.olliedx.com/api/v1` in Vercel.
3. Protect the deployment (Vercel password protection or SSO). The console must not be a public website.
