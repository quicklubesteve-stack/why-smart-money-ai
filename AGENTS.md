# AGENTS.md - Why Smart Money AI System Architecture & Engineering Protocol

## 1. System Mission & Core Directives
**Why Smart Money AI** is an institutional-grade quantitative stock intelligence system designed for US (NYSE, NASDAQ) and Canadian (TSX) equities.
- **The 95% Win Rate Principle:** Never claim a guaranteed 95% win rate in marketing copy, user-facing text, or models. Treat 95% strictly as an aspirational, measured theoretical research target.
- **Data Integrity & Labeling:** When live provider credentials are absent, the system must clearly label all market feeds with **`DEMO DATA (SYNTHETIC FEED)`**. Under no circumstances should fabricated trades, false order-flow fills, or fictitious insider activity be presented as verified fact.
- **SEC 13F & Institutional Ownership Transparency:** SEC Form 13F filings are delayed by up to 45 calendar days after quarter-end and represent static historical snapshots. Dark pool and off-exchange activity are proxy estimates derived from consolidated tape trade condition flags.
- **Execution Safety Policy:** Real brokerage execution is locked out in the default configuration. All user interactions execute through the realistic internal paper trading simulator with simulated slippage (5-15 bps), bid-ask spreads, and trading fees.

---

## 2. Architecture & Technology Stack

```
                               ┌──────────────────────────────────────────────┐
                               │       Next.js 14 Frontend Dashboard          │
                               │   (TypeScript, Tailwind CSS, Dark Theme)     │
                               │         Port: 3000 (Local / Web)             │
                               └──────────────────────┬───────────────────────┘
                                                      │ REST / WebSocket
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │           FastAPI Analytics Backend          │
                               │        (Python 3.12, Uvicorn, Pydantic)      │
                               │                  Port: 8000                  │
                               └─────────┬──────────────────────┬─────────────┘
                                         │                      │
                   ┌─────────────────────┴───────┐      ┌───────┴─────────────────────┐
                   ▼                             ▼      ▼                             ▼
       ┌────────────────────────┐    ┌─────────────────────┐    ┌───────────────────────────┐
       │   SQLAlchemy Database  │    │  Smart Money Engine │    │     Predictive ML Engine  │
       │   SQLite / PostgreSQL  │    │  (RVOL, VWAP, 13F,  │    │  (Walk-Forward, Purged    │
       │   Historical Bars & DB │    │   Off-Exchange)     │    │   CV, Platt Calibration)  │
       └────────────────────────┘    └─────────────────────┘    └───────────────────────────┘
```

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide icons. Custom SVG/Canvas financial charts.
- **Backend:** Python 3.12, FastAPI, SQLAlchemy, Pydantic V2, NumPy, Pandas, Scikit-learn.
- **Database:** Zero-configuration SQLite for local Windows laptop fallback (`smart_money.db`), with PostgreSQL 16 ready via Docker Compose or cloud `DATABASE_URL`.
- **Scheduled Automations:** Python APScheduler configured to trigger daily at 5:00 AM America/Toronto time, evaluating US and TSX trading calendars independently.

---

## 3. Signal Generation & Invalidation Rules

Every trading signal produced by the engine must adhere to the following data contract:
1. **Ticker & Exchange:** e.g. `NVDA` (NASDAQ, USD) or `SHOP.TO` (TSX, CAD).
2. **Recommendation:** Enum `[BUY, WATCH, HOLD, AVOID, SELL/EXIT]`.
3. **Signal Quality Score (0-100):** Multi-factor confluence score measuring pattern clarity and institutional indicators.
4. **Calibrated Probability (0.0-1.0):** Empirical out-of-sample win probability calibrated using Platt scaling.
5. **Entry Zone:** Explicit bounds `[entry_zone_min, entry_zone_max]`.
6. **Target Scenario & Stop Loss:** Defined price levels with projected Reward-to-Risk ratio (minimum 1.5:1 required for BUY signals).
7. **Slippage Buffer:** Modeled expected bid-ask spread and impact costs (in basis points).
8. **Invalidation Rule:** Explicit condition that terminates the recommendation (e.g. daily close below stop level or RVOL collapse).
9. **Evidence Pro & Con:** Multi-point structured reasoning based only on stored market data.

---

## 4. 5:00 AM Morning Market Brief Protocol
- **Timezone:** `America/Toronto` (Eastern Time, handles Daylight Saving Time automatically).
- **Exchange Calendars:** Evaluates NYSE, NASDAQ, and TSX independently (accounting for distinct holidays, e.g. Thanksgiving vs Canadian Thanksgiving, Victoria Day, Independence Day).
- **Early Liquidity Distinction:** Explicitly differentiates between previous session closes and early premarket prints. All premarket price gaps are flagged as non-final pending regular session volume confirmation.
- **Audit Integrity:** An SHA-256 fingerprint is calculated and stored immutably with every generated report.

---

## 5. Security & Risk Guardrails
- **Zero Credentials in Git:** `.env` is strictly ignored by `.gitignore`. Real credentials must never be committed or emitted in client-side bundles.
- **Live Trading Blocked:** The `ENABLE_LIVE_TRADING` flag is set to `False` in code and configuration. Orders require explicit two-factor user confirmation and run in paper simulation.
- **Prompt Injection Defense:** Untrusted financial news headline text is sanitized and passed into LLM prompts inside isolated data boundaries, preventing execution of injected commands.
- **Fail-Closed Policy:** Stale or missing market data triggers an immediate model abstention rather than producing speculative signals.
