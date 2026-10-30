# AgentWallet — Devpost Submission Package

## Project Title
**AgentWallet: Autonomous Agentic Commerce Runtime & Secure Financial Proxy**

## Elevator Pitch / Tagline (under 200 characters)
The secure financial proxy empowering AI agents to research, evaluate, and autonomously purchase items via PayPal Orders API v2, backed by cryptographic guardrails and human sign-offs.

---

## About the Project

### 💡 Inspiration
We are witnessing an inflection point in artificial intelligence: autonomous AI agents are writing production code, triaging security alerts, analyzing complex datasets, and navigating browsers. However, the moment an agent needs to execute an economic transaction — whether booking cloud compute instances, renewing API tokens, or purchasing office hardware — the entire autonomous loop collapses.

Today, engineers face an unacceptable binary choice:
1. **Manual bottlenecking**: Require human intervention for every \$10 micro-purchase, defeating the purpose of autonomy.
2. **Catastrophic financial risk**: Provide an AI agent with an unrestricted corporate credit card. A single hallucination or runaway reasoning loop could drain an entire bank account in minutes.

We built **AgentWallet** to solve this missing link: creating an autonomous financial runtime that gives AI agents the economic agency to transact independently while giving organizations the cryptographic brakes to ensure complete financial safety.

---

### ⚙️ What It Does
**AgentWallet** acts as an intelligent, secure financial proxy between autonomous AI agents and merchant checkouts using the **PayPal Orders API v2**:

1. **Procurement Objective Decomposition**: Agents ingest plain-text instructions (e.g., *"Order an ergonomic mouse under $60 with fast delivery"*) and extract formal hardware specifications, budget limits, and urgency using **Gemini 2.5 Flash**.
2. **Multi-Merchant Inventory Discovery**: The agent scans diverse merchant catalogs (Electronics, Office Supplies, Cloud Software, Developer Peripherals) to retrieve candidate listings.
3. **Multi-Criteria Deal Evaluation**: The AI Deal Evaluator weighs price value, shipping speed, merchant credibility, and technical specifications, scoring each candidate from 0 to 100 to pick the optimal deal with defensible rationale.
4. **Cryptographic Non-Repudiation**: Before any order is transmitted, AgentWallet generates an immutable SHA-256 intent verification digest binding the user prompt, merchant, item, and cart total.
5. **Autonomous Guardrail Gate**:
   - **Auto-Approval**: If the total is under the auto-approval threshold (\(\le \$75\)) and carries a low risk score (\(< 30\)), AgentWallet autonomously creates and captures the PayPal Sandbox order in seconds with zero human delay.
   - **Human-in-the-Loop Sign-Off**: If the purchase exceeds \$75 or flags policy risks, the runtime stages a pending PayPal order, issues a secure one-time authorization token with a **15-minute countdown**, and prompts the human operator via an interactive approval gate.
   - **Hard Policy Interceptions**: Transactions exceeding the absolute transaction ceiling (\$150) or involving blacklisted vendors (e.g., *ShadyElectronicsCorp*) are rejected and permanently logged.
6. **AG Grid Financial Audit Ledger**: An enterprise-grade auditable ledger table equipped with multi-column sorting, text filtering, KPI metrics, and one-click CSV export.

---

### 🏗️ How We Built It

AgentWallet is engineered as a modern full-stack TypeScript application:

- **Frontend & Runtime**: Next.js 14+ (App Router), React 18, Tailwind CSS, and Lucide Icons for real-time visual step streaming.
- **AI Brain**: `@google/genai` utilizing **Gemini 2.5 Flash** with strict JSON schemas (`responseSchema`) for Goal Decomposition, Candidate Evaluation, and Guardrail Auditing.
- **Financial Infrastructure**: Direct integration with the **PayPal Orders API v2** (`POST /v2/checkout/orders` with `intent: "CAPTURE"` and itemized financial breakdown, followed by `POST /v2/checkout/orders/{id}/capture`), resilient OAuth2 token caching, and webhook listeners for `CHECKOUT.ORDER.APPROVED` and `PAYMENT.CAPTURE.COMPLETED`.
- **Cryptographic Guardrails**: Node.js `crypto` primitives for SHA-256 intent verification and high-entropy one-time authorization tokens.
- **Audit Table**: `ag-grid-react` and `ag-grid-community` for high-throughput transactional inspection.
- **Deployment**: Vercel serverless runtime and containerized Render Web Service (`render.yaml`).

#### 📐 Mathematical & Cryptographic Formulation

The non-repudiation intent digest is computed using a deterministic canonical serialization of the procurement intent:

$$\text{Intent Digest} = \text{SHA-256}\Big(\mathcal{C}\big(\text{customId}, \text{amount}, \text{currency}, \text{itemId}, \text{merchant}, \text{prompt}, \text{timestamp}\big)\Big)$$

Where \(\mathcal{C}\) is the lexicographically sorted JSON canonicalizer.

The composite transaction risk score \(R \in [0, 100]\) is formulated as:

$$R = \min\Big(100, \; R_0 + 35 \cdot \mathbb{I}_{(\text{cost} > \theta_{\text{auto}})} + 45 \cdot \mathbb{I}_{(\text{cost} > \theta_{\text{max}})} + 40 \cdot \mathbb{I}_{(\text{spend} + \text{cost} > \theta_{\text{daily}})} + 80 \cdot \mathbb{I}_{(\text{merchant} \in \mathcal{B})}\Big)$$

Where:
- \(R_0 = 12\) is the baseline operational risk.
- \(\theta_{\text{auto}} = \$75\) is the autonomous sign-off threshold.
- \(\theta_{\text{max}} = \$150\) is the per-transaction ceiling.
- \(\theta_{\text{daily}} = \$500\) is the cumulative daily organizational budget.
- \(\mathcal{B}\) is the set of blacklisted merchant identifiers.
- \(\mathbb{I}_{(\cdot)}\) is the indicator function.

---

### 🥊 Challenges We Faced

1. **Non-Repudiation in Agentic Loops**: LLMs are inherently non-deterministic. If an agent changes its reasoning mid-stream, downstream financial operations could drift from the user's initial objective. We resolved this by binding the execution to a cryptographic SHA-256 intent digest before the PayPal API call is staged.
2. **PayPal Orders v2 Breakdown Precision**: PayPal strictly enforces that:
   $$\text{item\_total} + \text{shipping} + \text{tax} = \text{amount.value}$$
   Floating-point rounding issues in JavaScript initially caused `422 UNPROCESSABLE_ENTITY` errors. We implemented a centralized fixed-precision financial decimal serializer ensuring zero discrepancies across currency units.
3. **Dual Execution Resilience**: For hackathon testing and judge demonstrations, we engineered an intelligent offline/sandbox fallback manager that communicates with live PayPal Sandbox credentials when provided, but gracefully simulates sandbox transactions if keys are absent, ensuring reviewers never hit a fatal barrier.

---

### 🏆 Accomplishments That We're Proud Of

- **End-to-End Autonomous Pipeline**: A single prompt executes goal decomposition, catalog scanning, AI scoring, cryptographic verification, and PayPal Sandbox capture in under 3 seconds.
- **Zero Hallucination Leaks**: The policy engine functions outside the LLM context as a hard deterministic boundary — ensuring that even if an LLM hallucinated a purchase approval, the proxy server rejects any violation.
- **Production-Grade Next.js 14 Build**: Fully typed with TypeScript, passing strict linting and production optimization with 12 static/dynamic routes.
- **Comprehensive Documentation**: Complete with a 2-minute 45-second timed video script, open-source MIT license, and dual deployment pipelines (Vercel & Render).

---

### 📚 What We Learned

- How to leverage Gemini 2.5 Flash's structured `responseSchema` to eliminate fuzzy regex parsing and guarantee valid JSON outputs.
- Deep architectural insights into the PayPal Orders API v2 lifecycle: OAuth2 token refresh intervals, idempotency keys, and webhook event reconciliation.
- How to design safety perimeters that empower autonomous intelligence without sacrificing auditability.

---

### 🔮 What's Next for AgentWallet

- **PayPal Vaulting for Subscriptions**: Enable autonomous agents to provision, manage, and automatically terminate recurring software and cloud subscriptions without storing raw credentials.
- **Multi-Signature Corporate Governance**: Require approvals from multiple human stakeholders or department leads for high-value agent procurements above \$1,000.
- **Dynamic Vendor Credibility Graphs**: Train real-time fraud detection models using historical merchant fulfilment data to dynamically adjust risk scores on the fly.

---

## 🏷️ Built With (Devpost Tags — 20 Tags)

`next.js` `react` `typescript` `paypal` `paypal-api` `gemini-api` `gemini-2.5` `google-cloud` `artificial-intelligence` `agents` `agentic-ai` `fintech` `e-commerce` `cryptography` `ag-grid` `tailwind-css` `vercel` `render` `docker` `rest-api`

---

## 🔗 "Try It Out" Links

- **GitHub Repository**: [https://github.com/Ayush-web28/AgentWallet](https://github.com/Ayush-web28/AgentWallet)
- **Live Demo / Deployment**: [https://agentwallet-app.vercel.app](https://github.com/Ayush-web28/AgentWallet) *(Or your deployed Vercel domain)*
- **Demo Video Script**: [`DEMO_SCRIPT.md`](https://github.com/Ayush-web28/AgentWallet/blob/main/DEMO_SCRIPT.md)
- **PayPal Healthcheck API**: `https://<your-domain>/api/paypal/health`

---

## 🎥 Project Media & Demonstration Video Guide

- **Platform**: YouTube only (Set visibility to **Public** or **Unlisted**, no password).
- **Target Duration**: **2 minutes 45 seconds** (Strictly within the 3-minute judge limit).
- **Video Title**: *AgentWallet — Autonomous Agentic Commerce Runtime with PayPal Orders v2*
- **Video Description**:
  ```text
  AgentWallet is an autonomous agentic commerce runtime and secure financial proxy empowering AI agents to research, evaluate, and purchase items using PayPal Orders API v2 and Gemini 2.5 Flash under strict cryptographic guardrails.

  0:00 - The Problem: The AI Agent Spending Paradox
  0:25 - Architecture: Gemini 2.5, Cryptographic Guardrails, PayPal Orders v2
  0:55 - Live Demo 1: Autonomous Micro-Procurement (< $75 Auto-Approve)
  1:35 - Live Demo 2: Human-in-the-Loop Approval Gate (> $75 Threshold)
  2:15 - AG Grid Financial Ledger & Webhooks
  2:35 - Conclusion & Hackathon Submission Impact

  Code: https://github.com/Ayush-web28/AgentWallet
  ```
