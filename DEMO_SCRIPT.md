# AgentWallet — 2 Minute 45 Second Hackathon Demo Video Script

**Target Duration**: 02:45  
**Presenter**: Ayush  
**Key Sponsor Highlights**: PayPal Orders API v2 & Vaulting, Google Gemini 2.5, Render Deployment  

---

### [00:00 - 00:25] ACT I: The Hook & The Problem
**[Visual: Presenter on camera or screen showing autonomous AI agents executing code]**

> *"AI agents are already writing code, analyzing data, and navigating browsers. But the moment an agent needs to pay for an API key, book a cloud server, or order hardware, everything grinds to a halt. Handing an AI an unconstrained corporate credit card is a financial nightmare—hallucinations could drain an account in seconds.*  
> 
> *Meet **AgentWallet** — an autonomous agentic commerce runtime and secure financial proxy that connects AI agents to the **PayPal Orders API v2**, backed by cryptographic guardrails and human-in-the-loop approvals."*

---

### [00:25 - 00:55] ACT II: System Architecture & The Three Layers
**[Visual: Switch to AgentWallet Dashboard (http://localhost:3000), highlighting the Mermaid architecture diagram and security badges]**

> *"AgentWallet operates on three foundational pillars:*  
> 
> 1. *First, an **AI Reasoning Brain powered by Gemini 2.5 Flash**, decomposing user goals into structured schemas and scoring multi-merchant inventories.*  
> 2. *Second, a **Cryptographic Guardrails Engine** that calculates an immutable SHA-256 intent verification digest for non-repudiation, while enforcing per-transaction and daily spending limits.*  
> 3. *And third, native **PayPal Orders API v2 server integration**, managing OAuth2 token caching, staged checkout orders, and automated capture."*

---

### [00:55 - 01:35] ACT III: Live Demo 1 — Autonomous Micro-Procurement (< $75 Auto-Approve)
**[Visual: Click "Launch Agent Terminal", click the pre-configured prompt: "Order Ergonomic Mouse < $60", click "Dispatch Agent"]**

> *"Let’s see it in action! I'll dispatch a procurement goal: 'Order an ergonomic wireless mouse under $60 with fast delivery.'*  
> 
> *Watch the live execution stream in real-time:*  
> - *Step 1: Goal Decomposition extracts the target specs, category, and budget.*  
> - *Step 2: Multi-Merchant Inventory scans suppliers—Nexus Direct, Apex Peripherals, and OmniTech.*  
> - *Step 3: Deal Evaluator balances rating, shipping speed, and price, selecting the ErgoGlide mouse at $49.99.*  
> - *Step 4: Guardrail Check—because $49.99 is beneath our $75 auto-approval threshold and has a low risk score of 18, policy grants autonomous clearance.*  
> - *Step 5: The runtime immediately calls PayPal Orders API v2, creating the order and executing server-side capture!*  
> 
> *Here is the PayPal Order ID and Capture Transaction ID settled in seconds with zero human delay."*

---

### [01:35 - 02:15] ACT IV: Live Demo 2 — Human-in-the-Loop Gate (> $75 Threshold)
**[Visual: Click sample goal: "Procure 4K Webcam under $120", click "Dispatch Agent"]**

> *"Now, what happens if an agent tries to buy something more expensive? Let's dispatch: 'Procure 4K streaming webcam under $120.'*  
> 
> *The agent searches the catalog and selects the premier StreamMaster 4K camera from OmniTech at $114.50.*  
> 
> *Notice what happens at Step 4: The Guardrails Engine flags that $114.50 exceeds the $75 auto-approval ceiling! Instead of executing payment blindly, the runtime stages a PayPal order, generates a secure one-time authorization token with a 15-minute countdown, and pops open our **Human-in-the-Loop Approval Gate**.*  
> 
> *As the operator, I review the deal breakdown, inspect the SHA-256 Intent Hash, and click **'Approve & Capture via PayPal'**—or direct checkout on PayPal Sandbox.*  
> 
> *Boom! Transaction captured and verified."*

---

### [02:15 - 02:35] ACT V: Financial Audit Ledger & Webhooks
**[Visual: Navigate to "/ledger", showcase KPI metric cards and AG Grid table]**

> *"Every single transaction is streamed to our **AG Grid Financial Ledger**.*  
> 
> *Here, financial teams have an auditable trail showing:*  
> - *Live spend metrics and today's budget utilization,*  
> - *Auto-Approved versus Human-Approved ratios,*  
> - *Cryptographic intent verification hashes,*  
> - *And reconciled PayPal webhook events for order approval and capture completed.*  
> 
> *With one click, we can filter by merchant, inspect risk factors, or export the entire audit report to CSV."*

---

### [02:35 - 02:45] ACT VI: Wrap-Up & Submission
**[Visual: Show Settings page, GitHub repo, and Render deployment badge]**

> *"Deployed seamlessly on **Render**, AgentWallet provides the secure financial guardrails needed for the agentic era. Autonomous commerce is here, safe, and powered by PayPal.*  
> 
> *Thank you!"*
