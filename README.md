# ResuMatch

AI-powered resume tailoring tool that rewrites your resume to match any job description. Get an ATS compatibility score, keyword gap analysis, and a tailored resume ready to submit -- all in seconds.

**Live:** [https://resumatch-tailor.vercel.app](https://resumatch-tailor.vercel.app)

---

## Screenshots

<!-- Add screenshots here -->
<!-- ![Landing Page](docs/screenshots/landing.png) -->
<!-- ![Results View](docs/screenshots/results.png) -->

---

## Features

- **AI-Powered Tailoring** -- Paste your resume and a job description. The AI rewrites your resume to align with the role while preserving your experience.
- **ATS Match Score** -- Get a 0-100 compatibility score with a plain-language summary of how well your resume matches.
- **Keyword Gap Analysis** -- See which keywords were found, which are missing, and which were added by the AI.
- **Word-Level Diff View** -- Side-by-side comparison highlighting exactly what changed between your original and tailored resume.
- **PDF Export** -- Download your tailored resume as a clean, formatted PDF using client-side rendering.
- **Copy to Clipboard** -- One-click copy of the tailored resume text.
- **Rate Limiting** -- Free tier allows 3 tailors per day with cookie + IP-based rate limiting. No account required.
- **Dark Premium UI** -- Glass-morphism design with smooth Framer Motion animations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI (Primary) | Google Gemini 2.0 Flash |
| AI (Fallback) | Groq Llama 3.3 70B |
| Database | Supabase (PostgreSQL) |
| PDF Export | @react-pdf/renderer |
| Diff Engine | diff (npm) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Google AI Studio](https://aistudio.google.com/) account (for Gemini API key)
- A [Groq](https://console.groq.com/) account (for fallback AI)
- A [Supabase](https://supabase.com/) project

### Installation

1. Clone the repository:

```bash
git clone https://github.com/soccerdude1812/resumatch.git
cd resumatch
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment template and fill in your keys:

```bash
cp .env.example .env
```

4. Configure your `.env` file:

```env
# AI Providers
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Supabase (use legacy keys - eyJ... format)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Set up the Supabase `rate_limits` table:

```sql
CREATE TABLE rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  identifier_type TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_rate_limits_identifier_date
  ON rate_limits (identifier, identifier_type, date);
```

6. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
  app/
    api/
      rate-limit/route.ts    # Rate limit check endpoint
      tailor/route.ts         # Main AI tailoring endpoint
    app/
      page.tsx                # App dashboard (input + results)
      error.tsx               # Error boundary
    page.tsx                  # Landing page
    layout.tsx                # Root layout
    globals.css               # Global styles
  components/
    app/                      # App-specific components
      DiffViewer.tsx           # Word-level diff view
      KeywordAnalysis.tsx      # Keyword gap analysis
      ScoreGauge.tsx           # ATS match score gauge
      TailoredResume.tsx       # Tailored resume display
      ExportButton.tsx         # PDF export trigger
      ResumeInput.tsx          # Resume text input
      JobDescInput.tsx         # Job description input
      ResultsTabs.tsx          # Tab navigation for results
      SubmitButton.tsx         # Submit with loading state
      RateLimitBanner.tsx      # Rate limit warning
      EmptyState.tsx           # Empty state placeholder
    landing/                  # Landing page sections
      Hero.tsx
      Features.tsx
      HowItWorks.tsx
      CTA.tsx
    pdf/
      ResumePDF.tsx            # PDF document template
    shared/                   # Shared UI components
      Navbar.tsx
      Footer.tsx
      GlassCard.tsx
      LoadingSpinner.tsx
      Toast.tsx
  hooks/
    useRateLimit.ts            # Rate limit state management
    useTailor.ts               # Tailoring API hook
  lib/
    ai.ts                      # AI provider abstraction (Gemini + Groq)
    prompts.ts                 # AI prompt templates
    rate-limit.ts              # Server-side rate limiting logic
    supabase.ts                # Supabase client initialization
    utils.ts                   # Shared utilities
  types/
    index.ts                   # TypeScript type definitions
  middleware.ts                # Next.js middleware
```

---

## API Endpoints

### `POST /api/tailor`

Accepts a resume and job description, returns a tailored resume with scoring and keyword analysis.

**Request body:**
```json
{
  "resume": "Your full resume text...",
  "jobDescription": "The job posting text..."
}
```

**Response:**
```json
{
  "tailoredResume": "...",
  "score": 85,
  "scoreSummary": "...",
  "keywords": {
    "found": ["React", "TypeScript"],
    "missing": ["GraphQL"],
    "added": ["Next.js"]
  }
}
```

### `GET /api/rate-limit`

Returns the current rate limit status for the requesting user.

---

## Rate Limiting

Free users get 3 resume tailors per day. Rate limiting uses a dual-identifier strategy:

- **Cookie-based** -- A unique identifier stored in the browser cookie.
- **IP-based** -- SHA-256 hashed IP address as a fallback for cleared cookies.

Both identifiers are checked against the `rate_limits` table in Supabase. Counts reset daily.

---

## AI Provider Strategy

The application uses Gemini 2.0 Flash as the primary AI provider for speed and quality. If the Gemini API fails or times out, it automatically falls back to Groq with Llama 3.3 70B. This dual-provider approach ensures high availability.

All AI calls run synchronously within Vercel's 60-second function timeout.

---

## Pricing

| Tier | Price | Limits |
|---|---|---|
| Free | $0 | 3 tailors/day, no account required |
| Pro | $9/month | Unlimited tailors, priority processing (coming soon) |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## License

MIT
