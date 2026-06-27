# Linguara — Trustworthy AI Translation, Verified On-Chain

**Live app:** [linguara-sigma.vercel.app](https://linguara-sigma.vercel.app)  
**API:** [linguara-backend.fly.dev](https://linguara-backend.fly.dev)  
**Explorer:** [studio.genlayer.com](https://studio.genlayer.com)

---

## Why Linguara?

Every translation tool on the market — Google Translate, DeepL, Microsoft Translator — shares the same fundamental problem: **you have to trust them blindly.**

Ask Google Translate to translate the same legal clause twice and you may get two different results. Ask it again tomorrow and the answer might change again, because the model was updated silently. There is no audit trail, no proof of what was produced, and no way to verify the output is consistent with what someone else received.

This matters enormously in high-stakes contexts:

- A **legal contract** translated differently for two parties creates ambiguity that can invalidate agreements.
- A **medical instruction** that varies between translations can endanger patients.
- A **financial disclosure** that changes between renderings creates regulatory exposure.
- A **government document** that produces inconsistent translations across requests cannot be relied upon for official use.

Linguara solves this with a fundamentally different architecture.

### How Linguara is different

| | Google Translate / DeepL | Linguara |
|---|---|---|
| Translation engine | Single model, single output | 5 independent AI validators |
| Consistency | Output can change between requests | Same input always produces consensus-verified output |
| Audit trail | None | Immutable on-chain record for every translation |
| Verification | You trust the company | Anyone can verify the tx hash on the blockchain |
| Domain expertise | Generic | Domain-specific prompting (legal, medical, financial, etc.) |
| Terminology control | None | User glossary enforced in every translation |
| Confidence score | None | Cryptographically-backed consensus score |
| Result ownership | Stored on their servers | Stored on-chain and in your account |

### The core guarantee

When you translate with Linguara, five AI validators independently translate your text. GenLayer's consensus mechanism then verifies that all five agree on the meaning before the transaction is accepted. The result — along with a confidence score — is written permanently to the blockchain.

This means:

1. **The translation is reproducible.** Anyone with the transaction hash can verify exactly what was produced.
2. **The translation is tamper-proof.** No one, including Linguara, can alter it after the fact.
3. **The translation has a confidence score.** You know how certain the consensus was, not just what the output was.
4. **The translation has provenance.** You know when it was produced, by what contract version, and with what parameters.

For legal, medical, financial, and government use cases, this is the difference between a tool you use and a tool you can rely on in a dispute.

---

## Architecture

```
User Browser (Next.js 14 · Vercel)
       │
       ▼
Express API (TypeScript · Fly.io)
       │
       ├── PostgreSQL (Prisma ORM) — user data, translation records, glossary
       ├── Redis — rate limiting
       └── GenLayer StudioNet
              │
              └── Intelligent Contract v3.4.0 (Python)
                     │
                     ├── Validator 1 → LLM call → translation
                     ├── Validator 2 → LLM call → translation
                     ├── Validator 3 → LLM call → translation
                     ├── Validator 4 → LLM call → translation
                     └── Validator 5 → LLM call → translation
                                │
                                └── eq_principle.prompt_comparative
                                       → consensus reached
                                       → result written on-chain
```

### Translation flow

```
1.  User submits text + language + domain + optional glossary/context
2.  Backend decrypts user's wallet private key (AES-256-GCM)
3.  Backend calls translate_text() on the Intelligent Contract via genlayer-js
4.  Five GenLayer validators independently run one LLM call each
5.  Consensus mechanism verifies all five agree on meaning
6.  Accepted result is written permanently to the blockchain
7.  Backend polls until receipt status = ACCEPTED (up to 30 minutes)
8.  Result extracted from leader_receipt → saved to DB → returned to frontend
9.  Frontend displays translation, confidence score, chain status, explorer link
```

---

## Repository Structure

```
Linguara/
├── contracts/
│   └── linguara_translation.py        # Intelligent Contract v3.3.0
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts     # register, login, logout, verify, reset
│   │   │   ├── translation.controller.ts  # create, list, get, rate, chain-status
│   │   │   └── glossary.controller.ts # list, create, delete glossary terms
│   │   ├── services/
│   │   │   ├── genLayer.service.ts    # GenLayer SDK, chunking, polling, parsing
│   │   │   └── email.service.ts       # Brevo transactional email
│   │   ├── routes/                    # auth · translations · glossary
│   │   ├── middleware/                # auth (JWT) · rate-limit · validate
│   │   ├── config/                    # database · logger · redis · env
│   │   └── utils/                     # wallet crypto · response helpers
│   ├── prisma/schema.prisma           # User · Wallet · Translation · GlossaryTerm · AuditLog
│   ├── Dockerfile                     # Multi-stage build for Fly.io
│   ├── entrypoint.sh                  # Runs prisma db push then starts server
│   └── fly.toml
└── frontend/
    ├── src/
    │   ├── app/[locale]/
    │   │   ├── page.tsx               # Landing page
    │   │   ├── auth/                  # login · register · forgot-password
    │   │   │                            reset-password · verify-email
    │   │   └── dashboard/             # translate · history · history/[id]
    │   │                                glossary · documents · audit
    │   │                                reports · wallet · settings
    │   ├── components/
    │   │   ├── landing/               # navbar · hero · features · footer
    │   │   ├── dashboard/             # sidebar · mobile-sidebar · header
    │   │   │                            chain-status-tracker
    │   │   └── ui/                    # shadcn/ui component library
    │   ├── lib/api.ts                 # Axios client + authApi · translationApi · glossaryApi
    │   └── store/auth.store.ts        # Zustand auth state
    └── public/
        ├── logo.png
        └── favicon.png
```

---

## Intelligent Contract (v3.3.0)

**File:** `contracts/linguara_translation.py`  
**Network:** GenLayer StudioNet  
**Contract address:** `0xf7650B3718414F14c389022DED2aFc4C8B2C6779`

### Design philosophy

Previous versions of the contract ran 6 LLM calls per validator (multi-agent pipeline: translate, review, score, select, detect, format). With 5 validators, that was 30 total LLM calls per translation — causing consistent timeouts on any text over a few sentences.

v3 uses 1 LLM call per validator. GenLayer's 5-validator network *is* the multi-expert layer. The consensus mechanism (`gl.eq_principle.prompt_comparative`) verifies the validators agree semantically before the transaction finalizes.

| | v2 | v3.3 (current) |
|---|---|---|
| LLM calls per validator | 6 | 1 |
| Total LLM calls | 30 | 5 |
| Timeout on long texts | Frequent | None |
| Consensus | Custom scoring | `prompt_comparative` |
| Glossary support | No | Yes (injected into prompt) |

### Contract methods

**Write (require consensus):**
- `translate_text(id, text, src_lang, tgt_lang, domain, address, glossary_json)` — core translation
- `translate_with_context(...)` — translation with tone + background context notes
- `detect_language(id, text, address)` — standalone language detection
- `rate_translation(id, rating, feedback, address)` — 1–5 star rating stored on-chain
- `add_glossary_term(domain, src_term, tgt_lang, tgt_term, address)` — owner glossary entry
- `set_paused(paused, address)` — emergency circuit breaker

**View (no consensus needed):**
- `get_translation(id)` — retrieve stored result by ID
- `get_translation_status(id)` — lightweight status check
- `get_user_stats(address)` — per-wallet translation count
- `get_global_stats()` — contract-wide totals
- `get_supported_languages()` — full language catalogue (70+ languages)
- `get_supported_domains()` — supported domain list
- `get_contract_info()` — version, owner, pause state
- `get_glossary_term(domain, tgt_lang, src_term)` — look up a glossary entry
- `get_rating(id)` — retrieve a stored rating

### Glossary enforcement

When a user has saved glossary terms for a target language, the backend fetches them before submitting the transaction and passes them as `glossary_json`. The contract injects them directly into the translation prompt:

```
User-defined glossary (you MUST use these exact translations for the listed terms):
  - "force majeure" → "force majeure"
  - "indemnification" → "indemnisation"
```

Every validator sees this instruction. The consensus mechanism ensures the final result honours those terms.

### Supported languages

70+ languages including English, French, Spanish, German, Portuguese, Italian, Dutch, Russian, Chinese (Simplified + Traditional), Japanese, Korean, Arabic, Hindi, Turkish, Polish, Swedish, Yoruba, Igbo, Hausa, Swahili, Amharic, Zulu, and more.

### Supported domains

`general` · `legal` · `medical` · `technical` · `financial` · `government` · `literary` · `scientific` · `news` · `marketing`

Each domain has a dedicated instruction block in the prompt that guides the AI on appropriate terminology, register, and preservation rules.

---

## Backend (Express + TypeScript)

**Deployed:** Fly.io · `linguara-backend.fly.dev`

### API endpoints

```
Auth
  POST   /api/v1/auth/register          Create account + auto-generate ETH wallet
  POST   /api/v1/auth/login             Returns access + refresh JWT tokens
  POST   /api/v1/auth/logout
  GET    /api/v1/auth/me                Current user + wallet address
  POST   /api/v1/auth/forgot-password   Send reset email via Brevo
  POST   /api/v1/auth/reset-password    Consume token + set new password
  GET    /api/v1/auth/verify-email      Consume email verification token
  POST   /api/v1/auth/export-key        Return decrypted private key (password-gated)
  POST   /api/v1/auth/refresh           Refresh access token

Translations
  POST   /api/v1/translations           Submit translation (fires GenLayer tx async, returns immediately)
  GET    /api/v1/translations           List user's translations (paginated)
  GET    /api/v1/translations/:id       Get single translation + validator results
  GET    /api/v1/translations/:id/chain-status   Live GenLayer chain status for tx
  POST   /api/v1/translations/:id/rate  Submit 1–5 star rating
  GET    /api/v1/translations/audit     Full audit log with on-chain references

Glossary
  GET    /api/v1/glossary               List user's glossary terms
  POST   /api/v1/glossary               Create a glossary term
  DELETE /api/v1/glossary/:id           Delete a glossary term
```

### Wallet system

Every user gets a unique Ethereum wallet generated at registration:
- Private key encrypted with AES-256-GCM, keyed to `userId`
- Stored as `(encryptedPrivateKey, iv, authTag)` in the `wallets` table
- Decrypted in-memory only when submitting a GenLayer transaction
- Wallet address visible to the user; private key exportable with password confirmation

### Text chunking

Texts longer than 2,500 characters are split at paragraph boundaries before submission. Each chunk is sent as a separate GenLayer transaction (concurrent). Results are polled in parallel and reassembled in order before saving to the database.

```
Short text  (<2,500 chars)  → 1 tx  → poll → result
Long text   (>2,500 chars)  → N txs → poll all in parallel → concatenate in order
```

### Environment variables

```env
DATABASE_URL=postgres://...
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
WALLET_MASTER_KEY=
GENLAYER_CONTRACT_ADDRESS=0xf7650B3718414F14c389022DED2aFc4C8B2C6779
GENLAYER_PRIVATE_KEY=
GENLAYER_RPC_URL=
BREVO_API_KEY=
BREVO_FROM_EMAIL=
BREVO_FROM_NAME=Linguara
FRONTEND_URL=https://linguara-sigma.vercel.app
REDIS_URL=
```

---

## Frontend (Next.js 14)

**Deployed:** Vercel · `linguara-sigma.vercel.app`

### Pages

```
/                              Landing page
/auth/login                    Split dark/cream layout
/auth/register                 Auto-generates wallet on submit
/auth/forgot-password
/auth/reset-password?token=
/auth/verify-email?token=

/dashboard/translate           Translation workspace
/dashboard/history             Paginated history (10/page)
/dashboard/history/[id]        Full detail: scores, validators, on-chain proof
/dashboard/glossary            Manage terminology glossary
/dashboard/documents           Document upload (coming soon)
/dashboard/audit               Full audit trail with on-chain references
/dashboard/reports             Charts: confidence over time, by language, by domain
/dashboard/wallet              Wallet address + private key export
/dashboard/settings            Profile, language preference, account details
```

### Chain status tracker

While a translation is processing, the frontend polls `/translations/:id/chain-status` every 5 seconds and displays a live stage tracker:

```
✅ Pending       — transaction submitted to GenLayer
🔄 Proposing     — leader validator generating translation   ← active stage (spinner)
⬜ Committing    — validators committing their votes
⬜ Revealing     — validators revealing results
⬜ Accepted      — consensus reached on-chain
⬜ Finalized     — translation verified and finalized
```

Each stage has a connector line, green checkmarks for completed stages, and a direct link to the GenLayer explorer for the transaction.

### Design system

- **Primary background:** `#efece4` (warm cream)
- **Cards:** `bg-white/60 border-[#d4cfc0] rounded-2xl`
- **Components:** shadcn/ui + Radix UI
- **Icons:** Lucide React
- **Charts:** Recharts (reports page)
- **State:** Zustand (auth) + TanStack React Query (server data)
- **Forms:** React Hook Form
- **i18n:** next-intl (`localePrefix: 'as-needed'`, default `en` has no prefix)

### Environment variables

```env
NEXT_PUBLIC_API_URL=https://linguara-backend.fly.dev/api/v1
```

---

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- Python 3.11+ (for contract work only)

### Backend

```bash
cd backend
cp .env.example .env      # fill in values
npm install
npx prisma db push
npm run dev               # http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev               # http://localhost:3000
```

### Contract (deploy or update)

1. Open [GenLayer Studio](https://studio.genlayer.com)
2. Paste `contracts/linguara_translation.py`
3. Deploy to StudioNet
4. Copy contract address → set `GENLAYER_CONTRACT_ADDRESS` in backend env and Fly secrets

---

## Deployment

### Backend (Fly.io)

```bash
cd backend
fly deploy
```

Secrets are set via:

```bash
fly secrets set KEY=value
```

The `entrypoint.sh` runs `prisma db push` on every deploy before starting the server, so schema changes are applied automatically.

### Frontend (Vercel)

Auto-deploys on every push to `main`. Set `NEXT_PUBLIC_API_URL` in the Vercel dashboard.

---

## Current Status

**Network:** GenLayer StudioNet (testnet). Mainnet deployment pending GenLayer mainnet launch.  
**Translation time:** 10–20 minutes (on-chain consensus). The chain status tracker makes this visible to users.  
**Document upload:** Temporarily disabled pending backend extraction fix. Users paste text directly.

### Feature checklist

**Smart Contract**
- [x] Intelligent Contract v3.4.0 on GenLayer StudioNet
- [x] 2 LLM calls per validator: translate + quality score (semantic, tone, cultural, fluency)
- [x] `gl.eq_principle.prompt_comparative` consensus
- [x] 70+ languages, 10 domains with domain-specific prompting
- [x] Glossary injection into translation prompt
- [x] Context-aware translation (`translate_with_context`)
- [x] On-chain ratings, language detection, admin pause

**Backend**
- [x] Full REST API with JWT auth + refresh tokens
- [x] GenLayer async transaction submission (responds immediately, polls in background)
- [x] Text chunking for long documents (parallel txs, reassembled in order)
- [x] Wallet generation + AES-256-GCM encrypted storage
- [x] Glossary fetched per user per target language, passed to contract
- [x] Live chain status endpoint (Pending → Finalized)
- [x] Brevo transactional email (verification, password reset, translation complete)
- [x] Rate limiting via Redis
- [x] Full audit log with on-chain references
- [x] 30-minute polling window (retries: 300, interval: 6s)
- [x] Deployed on Fly.io with Postgres + Redis

**Frontend**
- [x] Full redesign with `#efece4` cream theme
- [x] Landing page with feature explanation and value proposition
- [x] Auth pages: login, register, forgot/reset password, email verification
- [x] Translation workspace with context hints
- [x] Live chain status tracker (6-stage visual timeline)
- [x] Export translation as TXT or PDF
- [x] Star rating UI (calls backend + contract)
- [x] Translation history: paginated, expandable, full detail page
- [x] Detail page: quality scores, all validator results, on-chain proof
- [x] Glossary management UI
- [x] Reports with charts (confidence over time, by language, by domain, status)
- [x] Wallet page: address display + password-gated private key export
- [x] Mobile sidebar drawer
- [x] Deployed on Vercel

---

## License

MIT
