# CivicLens AI — Municipal Complaint Triage & Resolution Platform

> **GovTech 2.0 Civic Intelligence Platform**  
> AI-powered complaint ingestion, structured field extraction, explainable 5-factor priority scoring, Mappls GIS mapping, spatial duplicate clustering, and municipal SLA resolution workflows.

**🌐 Live Vercel Deployment:** [https://alankrit-one.vercel.app](https://alankrit-one.vercel.app)  
**💻 GitHub Repository:** [https://github.com/Omtripathi1004/civiclens-ai](https://github.com/Omtripathi1004/civiclens-ai)

Designed for Indian Municipal Corporations (MCD Delhi, BBMP Bengaluru, BMC Mumbai) in accordance with the **CIVICLENS AI Master Build Prompt** and **Mappls Maps Addendum**.

---

## 🏛️ System Architecture & Personas

CivicLens AI supports 4 role-based workspaces and city analytics:

1. **Citizen Portal (`/citizen`)**
   - Natural language grievance reporting (English, Hindi, Hinglish) with prompt injection sanitization.
   - Pre-submission real-time AI field extraction and explainable priority preview.
   - Interactive GIS Pin Drop with Mappls Maps Web SDK & Leaflet fallback (lat/long validation).
   - Non-guessable public tracking references (e.g. `MCD-2026-X8K9L2`) with live status timeline.
   - Local offline draft queue and citizen clarification / reopening controls.

2. **Field Officer Workspace (`/officer`)**
   - Live queue with filters by Priority, Status, Ward, and SLA urgency.
   - AI reliability breakdown (Category, Summary, Asset, Department confidence meters).
   - Duplicate candidate resolver with Haversine distance in meters, token similarity %, and audit-logged Link/Dismiss actions.
   - Status transitions (Submitted -> Triaged -> In-Progress -> Resolved) with geotagged resolution photo evidence.
   - Spatial GIS complaint heatmap view.

3. **Supervisor & SLA Hub (`/supervisor`)**
   - Workload capacity balancer across municipal wings (EPW, SWM, WSS, ESL, PHS).
   - Emergency escalation queue for life-safety hazards and at-risk SLA tickets.
   - Squad reassignment matrix.

4. **Administrator Workspace (`/admin`)**
   - Auditable 5-factor scoring policy weight sliders (Safety 0-40, Infra 0-20, Duration 0-15, Severity 0-15, Evidence 0-10).
   - Municipal department SLA response threshold editor.
   - Immutable municipal audit ledger.

5. **City Analytics (`/analytics`)**
   - City-level operational KPIs (intake volume, resolution %, mean triage latency).
   - Grievance category distribution and ward density benchmarking tables.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Production build & type-checking
npm run build
```

The application runs locally at `http://127.0.0.1:5173/`.

---

## 🗺️ Mappls GIS Integration

- **SDK Fallback**: Seamlessly falls back to Leaflet OpenStreetMap tiles when an external API key is not configured.
- **Data Integrity**: Enforces latitude (-90 to 90) and longitude (-180 to 180) boundary checks.
- **Privacy Assurance**: Citizen telephone numbers and email addresses are masked and excluded from spatial GIS popup layers.
