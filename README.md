# TrustWrite &mdash; Writing Intelligence Workspace

> **Write Better. Verify More. Communicate with Confidence.**

TrustWrite is a full-featured SaaS platform that goes beyond basic spellcheckers and adversarial AI detectors. Built as an **integrated Writing Intelligence Workspace**, TrustWrite empowers students, educators, writers, and professionals to evaluate writing quality, improve syntax, review stylistic patterns with ethical uncertainty disclosures, and verify citations with zero friction.

---

## 🚀 Key Highlights & Architectural Differentiators

1. **Three-Tier Cost & Speed Optimization**:
   * **Tier 1 (Deterministic Engine):** Word counts, Flesch Reading Ease, Flesch-Kincaid Grade Level, Gunning Fog Index, Coleman-Liau, Automated Readability Index (ARI), and passive voice detection execute in pure Python math in milliseconds with zero LLM API fees.
   * **Tier 2 (Linguistic Rules):** Subject-verb agreement, homophone disambiguation, punctuation spacing, and wordiness checks execute locally with normalized offset tracking and linguistic explanations.
   * **Tier 3 (On-Demand AI Provider Adapters):** LLM calls (rewriting, tone transformation, summarization) and detector APIs are triggered strictly upon explicit user request.
2. **Ethical AI Signals vs. "Proof of Authorship"**:
   * Incorporates findings from **Stanford-affiliated research** demonstrating that automated detectors disproportionately misclassify writing by non-native English speakers.
   * TrustWrite presents sentence burstiness and syntactic cadence as an *invitation for manual peer review*, explicitly disclaiming proof of misconduct or cheating.
3. **Citation & Source Integrity**:
   * Extracts APA and MLA in-text citations (both parenthetical and narrative).
   * Validates matching entries in the document bibliography.
   * Flags missing citations and validates standard `10.XXXX/...` DOI structures.
4. **Publication-Ready PDF Reports**:
   * High-fidelity ReportLab PDF export complete with score cards, readability benchmarks, grammar findings, and actionable revision checklists.
5. **AdSense Compliance by Design**:
   * Non-intrusive ad placement exclusively on public, content-rich educational landing pages (`/grammar-checker`, `/readability-checker`, etc.).
   * Strictly zero advertisements inside the sensitive editing canvas (`/app`).

---

## 📁 Repository Structure

```text
trustwrite/
├── backend/
│   ├── app/
│   │   ├── api/v1/             # REST endpoints (auth, documents, analyses, grammar, readability, writing, citations, reports)
│   │   ├── core/               # App configuration, security, and database session
│   │   ├── models/             # SQLAlchemy ORM models (User, Document, DocumentVersion, AnalysisJob)
│   │   ├── schemas/            # Pydantic v2 schemas for all inputs and responses
│   │   ├── services/           # ReadabilityService, GrammarService, AIDetectionService, CitationService, AIWritingService, ReportService
│   │   └── utils/              # Document text extraction (TXT, DOCX, PDF)
│   ├── tests/                  # Pytest unit and integration test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js 15 App Router pages
│   │   │   ├── page.tsx        # Homepage with live text review & value props
│   │   │   ├── app/page.tsx    # 3-Column Writing Intelligence Workspace
│   │   │   ├── grammar-checker/# SEO landing page with AdSense container
│   │   │   ├── readability-checker/
│   │   │   ├── ai-writing-checker/
│   │   │   ├── citation-checker/
│   │   │   ├── writing-assistant/
│   │   │   └── how-it-works/   # Ethics & Three-Tier architecture
│   │   ├── components/         # Navbar, Footer, AdBanner, WritingWorkspace
│   │   └── lib/                # Typed API client
│   ├── Dockerfile
│   ├── package.json
│   └── tailwind.config.ts
├── docker-compose.yml          # Unified multi-container orchestration
├── run-dev.bat                 # 1-click Windows launcher
└── run-dev.ps1                 # 1-click PowerShell launcher
```

---

## 🛠️ Quick Start Guide

### Option 1: Direct Local Execution (Recommended for Development)

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
pytest tests   # Runs test suite (6/6 passing)
uvicorn app.main:app --reload --port 8000
```
*Backend API Docs are accessible at:* `http://localhost:8000/docs`

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend Workspace is accessible at:* `http://localhost:3000`

---

### Option 2: 1-Click Windows Launcher
Simply double-click `run-dev.bat` or run:
```powershell
.\run-dev.ps1
```

---

### Option 3: Docker Compose
```bash
docker-compose up --build
```

---

## 🧪 Automated Test Results
```text
tests\test_analysis.py ....     [ 66%]
tests\test_api.py ..            [100%]
======================== 6 passed in 1.78s ========================
```

---

## 📄 License
MIT License. Built for creators, researchers, and students.
