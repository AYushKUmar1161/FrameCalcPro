# FrameCalcPro

> **Fast, Accurate Framing Material Takeoffs & Cost Estimates**

FrameCalcPro is a modern construction framing material takeoff and cost-estimation web application designed for builders, contractors, framers, and estimators. It enables instant calculation of studs, plates, headers, blocking, sheathing, and material costs from wall dimensions and opening schedules, wrapped in a premium **Watermelon Marigold** visual identity.

---

## ✨ Features

- **Guided 7-Step Estimator Wizard**: Seamless step-by-step workflow covering Project Info, Walls, Openings, Framing Configurations, Material Pricing, Review, and Takeoff.
- **Architectural Wall Visualizer**:
  - Live 2D framing elevation preview.
  - **Drafting Mode** & **Blueprint Mode**.
  - Vector architectural representations for doors and windows (no emojis).
  - 45° architectural slash ticks, dimension annotations, rough sill plates, and cripple stud layouts.
  - Interactive zoom and reset controls.
- **Dynamic Material Takeoff (Bill of Materials)**:
  - Base required quantities vs. order quantities with waste allowances.
  - Category filtering, live search, and column sorting.
  - Inline quantity and unit price editing with instant recalculation.
  - Subtly highlighted **Total Cost** column with tabular typography.
  - Add custom items and reset overrides anytime.
- **Comprehensive Framing Breakdown**:
  - Base studs, end studs, corner studs, king studs, jack/trimmer studs, and cripple studs.
  - Single/double top plates, treated sole plates, and board count conversions.
  - Header sizing (2×4, 2×6, 2×8, 2×10, 2×12, LVL).
  - Wall sheathing net area calculation (subtracting openings) with 4×8 sheet quantities.
  - Mid-span / fire blocking estimation.
- **Multi-Format Export & Sharing**:
  - Branded PDF estimate export with calculation assumptions and legal disclaimer.
  - Machine-readable CSV spreadsheet export.
  - Dedicated browser print layout.
  - JSON project backup & restore and encoded URL share links.
- **Private & Local-First**:
  - All project data persists locally in `localStorage`.
  - Zero external database or account creation required.

---

## 🎨 Design Identity — Watermelon Marigold

The application is styled with a balanced, modern construction SaaS aesthetic:
- **70–80% Neutral Base**: Clean off-whites (`#FAF9F6`), crisp white cards, slate borders, dark graphite typography.
- **15–20% Brand Accents**: Navigation active borders, interactive category filter pills, metric highlights, primary button gradients.
- **5–10% High-Impact Surfaces**: Hero section, Estimated Material Cost summary cards, and call-to-action banners.

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Vanilla CSS + Tailwind CSS utilities
- **Components**: shadcn/ui compatible primitives in `/components/ui`
- **Icons**: Lucide React
- **PDF Generation**: jsPDF + jspdf-autotable
- **Testing**: Vitest

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/AYushKUmar1161/FrameCalcPro.git
cd FrameCalcPro

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173/` (or the assigned port) in your browser.

### Run Tests

```bash
npm test
```

### Production Build

```bash
npm run build
```

The optimized output will be built in the `dist/` directory, ready for deployment on Vercel, Netlify, or Cloudflare Pages.

---

## ⚠️ Disclaimer

**FrameCalcPro is a material estimation application.** It is not a structural engineering or building-code approval tool. Always consult local building codes, structural engineering requirements, and licensed design professionals before construction.

---

## 📄 License

MIT License.
