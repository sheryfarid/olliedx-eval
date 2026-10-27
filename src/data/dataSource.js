/**
 * Data source switch.
 *
 *   VITE_DATA_MODE=demo  (default) → everything comes from demoData.js. No network requests.
 *   VITE_DATA_MODE=api             → the same screens call your FastAPI backend under VITE_API_BASE.
 *
 * The backend must return the same shapes the demo uses, so no UI code changes are needed.
 */
import { buildDemoExternal, DEMO_JUDGE_RELIABILITY } from "./demoData";

const env = (typeof import.meta !== "undefined" && import.meta.env) || {};
export const DATA_MODE = env.VITE_DATA_MODE === "api" ? "api" : "demo";
export const API_BASE = env.VITE_API_BASE || "/api/v1";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function http(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.status === 204 ? null : res.json();
}

/**
 * Data for the tabs fed by live systems (monitoring, performance, drift, fairness, tracking, logs …).
 * demo: seeded data.  api: GET /dashboard/external must return the object shape of buildDemoExternal().
 */
export async function loadExternal() {
  if (DATA_MODE === "demo") {
    await sleep(250);
    return buildDemoExternal();
  }
  return http("/dashboard/external");
}

/** Judge reliability test (run the judge twice on the reference set). */
export async function judgeReliabilityTest() {
  if (DATA_MODE === "demo") {
    await sleep(600);
    return DEMO_JUDGE_RELIABILITY;
  }
  // Expected response: { judge, runs: [{ ok, errors, verdicts: { C1: "Supported", ... } }, { ... }] }
  return http("/judges/test", { method: "POST", body: { dataset: "DS-SYN-ADHD v0.1", repeats: 2 } });
}

/**
 * Production endpoints (Part M). Only used when DATA_MODE === "api".
 * Run objects must match the shape created in startRun() in OllieDXEvalStudio.jsx:
 *   { id, model, prompt, judgeUsed, trigger, scheduleId, startedAt, finishedAt, status, outcome,
 *     stage, stageLog[], claimResults[], redTeam[], nlp[], metrics{}, incidentId }
 */
export const remote = {
  startRun: (body, idemKey) => http("/evaluations/runs", { method: "POST", body, headers: idemKey ? { "Idempotency-Key": idemKey } : {} }),
  getRun: (id) => http(`/evaluations/runs/${id}`),
  cancelRun: (id) => http(`/evaluations/runs/${id}/cancel`, { method: "POST" }),
  findings: (runId) => http(`/hallucinations?run_id=${encodeURIComponent(runId)}`),
  reviews: () => http("/clinical/reviews"),
  decide: (id, decision) => http(`/clinical/reviews/${id}/decision`, { method: "POST", body: { decision } }),
  incidents: () => http("/incidents"),
  closeIncident: (id, correctiveAction) => http(`/incidents/${id}/close`, { method: "POST", body: { corrective_action: correctiveAction } }),
  gate: (releaseId) => http(`/releases/${releaseId}/gate`),
  schedules: () => http("/schedules"),
  createSchedule: (body) => http("/schedules", { method: "POST", body }),
  patchSchedule: (id, body) => http(`/schedules/${id}`, { method: "PATCH", body }),
};
