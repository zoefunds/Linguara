# Linguara — Trustworthy AI Translation on GenLayer

A full-stack decentralized AI translation platform. Every translation is verified by 5 independent AI validators running on GenLayer's Intelligent Contract infrastructure, producing a cryptographically-backed confidence score and an immutable on-chain audit trail.

**Live:** [linguara-sigma.vercel.app](https://linguara-sigma.vercel.app)  
**API:** [linguara-api.fly.dev](https://linguara-api.fly.dev)  
**Explorer:** [explorer-studio.genlayer.com](https://explorer-studio.genlayer.com)

---

## Architecture

```
User Browser (Next.js 14)
       │
       ▼
Express API (Fly.io · linguara-api)
       │
       ├── PostgreSQL (Prisma ORM)
       ├── Redis (rate limiting)
       └── GenLayer StudioNet
              │
              └── Intelligent Contract (Python)
                     5 AI validators → consensus
```

---

## Repository Structure

```
Linguara/
├── contracts/
│   └── linguara_translation.py      # Intelligent Contract v3.2.0
├── backend/
│   ├── src/
│   │   ├── controllers/             # HTTP handlers
│   │   ├── services/
│   │   │   ├── genLayer.service.ts  # GenLayer SDK, chunking, polling
│   │   │   └── email.service.ts     # Brevo transactional email
│   │   ├── routes/
│   │   ├── middleware/              # auth, rate-limit, validate
│   │   ├── config/                  # DB, logger, redis
│   │   └── utils/                   # wallet crypto, response helpers
│   ├── prisma/schema.prisma
│   └── fly.toml                     # Fly.io deployment config
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx           # Root layout, favicon, metadata
    │   │   ├── globals.css          # CSS variables (#efece4 cream theme)
    │   │   └── [locale]/
    │   │       ├── page.tsx         # Landing page
    │   │       ├── auth/            # login · register
    │   │       └── dashboard/       # translate · history · documents
    │   │                              audit · reports · wallet · settings
    │   ├── components/
    │   │   ├── landing/             # navbar · hero · features · how-it-works
    │   │   │                          pricing · faq · footer
    │   │   ├── dashboard/           # sidebar · header
    │   │   └── ui/                  # shadcn/ui components
    │   ├── lib/api.ts               # Axios client + all API calls
    │   └── store/auth.store.ts      # Zustand auth state
    └── public/
        ├── logo.png                 # App logo (used everywhere)
        └── favicon.png              # Browser tab icon
```

---

## Intelligent Contract (v3.2.0)

**File:** `contracts/linguara_translation.py`  
**Deployed on:** GenLayer StudioNet  
**Contract address:** `0x5F7eF708d365A3245253c0940C909e1FA9bA13b9`  
**Consensus contract:** `0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575`

### How it works

```python
from genlayer import *   # gl.Contract, gl.nondet, gl.eq_principle
import json

class LinguaraTranslation(gl.Contract):
    def translate_text(self, ...):
        def do_translate():
            return gl.nondet.exec_prompt(prompt)   # 1 LLM call per validator

        final_translation = gl.eq_principle.prompt_comparative(
            do_translate,
            "The translations convey the same core meaning and information."
        )
        self.translations[translation_id] = json.dumps({...})
```

**Key design decisions:**

| | v2 | v3 (current) |
|---|---|---|
| LLM calls per validator | 6 (multi-agent) | 1 |
| Total LLM calls | 30 | 5 |
| Timeout on long texts | Yes | No |
| Consensus mechanism | Custom scoring | `gl.eq_principle.prompt_comparative` |

**GenLayer API (correct syntax):**
- LLM call: `gl.nondet.exec_prompt(prompt)` inside a `def run():` function
- Comparative consensus: `gl.eq_principle.prompt_comparative(run, principle)`
- Strict consensus: `gl.eq_principle.strict_eq(run)`
- Class style: `class X(gl.Contract):` — NOT `@gl.contract` (deprecated, causes schema error)
- Imports: `from genlayer import *` + `import json`

**Contract features:**
- `translate_text` — main translation (auto language detect, 15k char limit)
- `translate_with_context` — translation with background context/tone hints
- `detect_language` — standalone language detection
- `rate_translation` — post-translation quality rating (1–5 stars)
- `add_glossary_term` — user-defined glossary for consistent terminology
- `set_paused` — admin circuit breaker

**Supported:** 70+ languages · 10 domains (general, legal, medical, technical, financial, government, academic, literary, news, marketing)

---

## Backend (Express + TypeScript)

**Deployed:** Fly.io · `linguara-api` · region `lax`

### Key services

**`genLayer.service.ts`**
```
CHUNK_SIZE = 2500 chars
MAX_CHUNK_CHARS = 14000 chars

Short text  → 1 GenLayer tx → poll until ACCEPTED → extract result
Long text   → split at paragraph boundaries → N parallel GenLayer txs
            → poll all in parallel → concatenate translations in order
```

- `sendTranslationTx()` — submits to GenLayer, returns single hash or JSON sentinel `{"multi":true,"hashes":[...],"count":N}`
- `pollUntilFinalized()` — detects multi-chunk sentinel, polls all in parallel, reassembles
- `parseResult()` — extracts from `consensus_data.leader_receipt[0].eq_outputs["0"].payload.readable`
- `stripQuotes()` — unescapes `\n`, `\t`, `\\`, `\"` from JSON-encoded payload

**Translation result extraction path:**
```
receipt.consensus_data.leader_receipt[0].eq_outputs["0"].payload.readable
```

**Polling config:** `waitForTransactionReceipt({ status: 'ACCEPTED', interval: 4000, retries: 90 })`

### API endpoints

```
POST   /api/auth/register          Create account + generate ETH wallet
POST   /api/auth/login             JWT login
POST   /api/auth/logout
GET    /api/auth/me

POST   /api/translations           Submit translation (fires GenLayer tx async)
GET    /api/translations           List user's translations (paginated)
GET    /api/translations/:id       Get single translation + status
GET    /api/translations/audit     Audit log
POST   /api/translations/extract-file   Extract text from TXT or PDF file
```

### Environment variables (backend)

```env
DATABASE_URL=
JWT_SECRET=
ENCRYPTION_KEY=
GENLAYER_NODE_URL=
CONTRACT_ADDRESS=0x5F7eF708d365A3245253c0940C909e1FA9bA13b9
ADMIN_PRIVATE_KEY=
BREVO_API_KEY=
REDIS_URL=
```

### Key dependencies

`express` · `prisma` · `genlayer-js` (ESM-only, loaded via dynamic import) · `ethers` · `pdf-parse` · `bcryptjs` · `jsonwebtoken` · `winston` · `redis` · `@getbrevo/brevo`

**ESM import workaround** (genlayer-js is ESM-only in a CJS project):
```typescript
const dynamicImport = new Function('specifier', 'return import(specifier)');
const { createClient } = await dynamicImport('genlayer-js');
```

**Fly.io trust proxy** (required for rate-limiting behind Fly):
```typescript
app.set('trust proxy', 1);
```

---

## Frontend (Next.js 14)

**Deployed:** Vercel · `linguara-sigma.vercel.app`

### Routing

Uses `next-intl` with `localePrefix: 'as-needed'` (default locale `en` has no prefix):

```
/                          → Landing page
/auth/login
/auth/register
/dashboard/translate       → Translation workspace
/dashboard/history         → Translation history (expandable)
/dashboard/documents
/dashboard/audit
/dashboard/reports
/dashboard/wallet
/dashboard/settings
```

Route structure: `src/app/[locale]/auth/` and `src/app/[locale]/dashboard/` (named segments, not route groups)

### Design system

- **Primary background:** `#efece4` (warm cream, HSL `43 27% 92%`)
- **Color palette:** All defined as CSS variables in `globals.css`
- **Font:** Inter (body) + Playfair Display (serif accents)
- **Components:** shadcn/ui + Radix UI primitives
- **Icons:** Lucide React

### Key pages

**Translate page** (`/dashboard/translate`)
- Text mode: paste up to 50,000 characters
- File mode: upload TXT (extracted instantly) or PDF (text extracted via backend)
- Language dropdown: 16 languages · Domain dropdown: 6 domains
- Real-time status badge: SUBMITTING → PENDING → PROCESSING → COMPLETED
- Polls backend every 4s for up to 90 attempts (6 minutes)
- On completion: shows translation, confidence scores, validator breakdown
- Explorer link: `https://explorer-studio.genlayer.com/transactions/${txHash}`

**History page** (`/dashboard/history`)
- Lists all translations (up to 50)
- Each card: language pair, domain, date, confidence score
- "Show translation" expands the full translated text inline
- Tx hash is a clickable link to the GenLayer explorer

**Auth pages**
- Split layout: dark left panel + cream right form
- Register: auto-generates an Ethereum wallet on account creation

### State management

- **Auth:** Zustand (`useAuthStore`) — stores user, JWT token, login/logout
- **Queries:** TanStack React Query — history, audit log, stats
- **Forms:** React Hook Form + Zod validation

---

## Wallet system

Every user gets a unique Ethereum wallet auto-generated at registration:
- Private key encrypted with AES-256-GCM using `userId` as key material
- Stored encrypted in database (`encryptedPrivateKey`, `iv`, `authTag`)
- Used to sign GenLayer transactions on the user's behalf
- Wallet address displayed to user at registration

---

## GenLayer transaction flow

```
1. User submits text
2. Backend decrypts user's private key
3. Backend calls contract.translate_text(...) via genlayer-js SDK
4. GenLayer fires the tx → 5 validators each run 1 LLM call
5. Consensus mechanism verifies semantic equivalence
6. Receipt stored on-chain
7. Backend polls waitForTransactionReceipt (status: ACCEPTED)
8. Backend parses result from leader_receipt[0].eq_outputs["0"].payload.readable
9. Result saved to DB, returned to frontend
10. Frontend displays translation + confidence score + explorer link
```

---

## Local development

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis
- Python 3.11+ (for contract development)

### Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Contract (deploy manually)

1. Open [GenLayer Studio](https://studio.genlayer.com)
2. Paste `contracts/linguara_translation.py`
3. Deploy to StudioNet
4. Copy contract address → set `CONTRACT_ADDRESS` in backend `.env`

---

## What's done ✅

### Smart Contract
- [x] Intelligent Contract v3.2.0 deployed on GenLayer StudioNet
- [x] Single LLM call per validator (was 6 → fixed timeout issues)
- [x] `gl.nondet.exec_prompt` + `gl.eq_principle.prompt_comparative` (correct API)
- [x] `class LinguaraTranslation(gl.Contract):` style (fixed "could not load schema" error)
- [x] 70+ languages, 10 domains, glossary, ratings, context-aware translation
- [x] 15,000 char limit per contract call

### Backend
- [x] Full REST API (auth, translations, audit)
- [x] GenLayer transaction submission and polling
- [x] Backend chunking for texts >2,500 chars (parallel txs, reassembled)
- [x] PDF text extraction via `pdf-parse`
- [x] TXT file extraction
- [x] `\n\n` literal fix — unescapes JSON escape sequences from payload
- [x] ETH wallet generation and encrypted storage per user
- [x] JWT authentication
- [x] Rate limiting + Redis
- [x] Brevo email service
- [x] Deployed on Fly.io with `trust proxy` for correct rate limiting

### Frontend
- [x] Full website redesign with `#efece4` warm cream color scheme
- [x] Landing page: navbar, hero, features, how-it-works, pricing, FAQ, footer
- [x] Dashboard: sidebar, header, all page shells
- [x] Auth pages: login + register with split dark/cream layout
- [x] Custom logo (`ling.png`) used everywhere as logo + favicon
- [x] Translate page: text mode + TXT/PDF file upload
- [x] Translate page: language dropdown z-index fixed (no longer obscured)
- [x] History page: expandable full translation text per card
- [x] All tx hashes link to `explorer-studio.genlayer.com`
- [x] Deployed on Vercel

---

## What's remaining 🔲

### High priority
- [ ] **DOCX file extraction** — `mammoth` or `docx` npm package needed in backend
- [ ] **Image-based PDF** — OCR support (tesseract.js already installed, needs wiring)
- [ ] **Mobile sidebar** — hamburger menu not wired; sidebar hidden on mobile (`hidden md:flex`)
- [ ] **Dashboard pages** — Documents, Reports, Wallet, Settings pages are empty shells

### Medium priority
- [ ] **Confidence score calculation** — currently estimates from receipt; should come from contract
- [ ] **Glossary UI** — contract supports `add_glossary_term` but no frontend for it
- [ ] **Rate translation UI** — contract supports `rate_translation` but no frontend for it
- [ ] **Context-aware translation** — `translate_with_context` method exists but not exposed in UI
- [ ] **Dark mode** — CSS variables defined but theme toggle not implemented
- [ ] **Internationalization** — next-intl wired but translation strings not populated

### Lower priority
- [ ] **Email verification flow** — registration sends no verification email yet
- [ ] **Forgot password flow** — route exists but not implemented
- [ ] **API key management** — for enterprise programmatic access
- [ ] **Export to PDF/DOCX** — export translated result as a document
- [ ] **Team/organization accounts** — multi-user workspaces
- [ ] **Mainnet deployment** — currently StudioNet (testnet) only

---

## Known issues

| Issue | Status |
|---|---|
| DOCX upload shows unsupported error | Backend returns 422 — needs `mammoth` |
| Mobile layout missing sidebar nav | Sidebar is `hidden md:flex` — no mobile menu |
| Dashboard page shells are empty | Documents, Reports, Wallet, Settings not built |
| GenLayer finalization time | Consensus takes 30–90s depending on text length |

---

## Deployment

### Backend (Fly.io)
```bash
fly deploy --config backend/fly.toml
```

### Frontend (Vercel)
Vercel auto-deploys on push to `main`. Set environment variables in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://linguara-api.fly.dev/api
```
