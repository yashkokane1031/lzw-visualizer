<div align="center">

# 🗜️ LZW Encoding Visualizer

**An interactive, step-by-step simulation of the Lempel-Ziv-Welch compression algorithm.**

Built for computer science students who want to *see* how LZW builds its dictionary on the fly — not just read about it.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📖 Table of Contents

- [About](#about)
- [How LZW Works](#how-lzw-works)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [Algorithm Implementation](#algorithm-implementation)
- [Contributing](#contributing)
- [License](#license)

---

## About

LZW (Lempel-Ziv-Welch) is one of the most influential lossless data compression algorithms, used in formats like GIF and Unix `compress`. Despite its elegance, the way it dynamically builds a dictionary while encoding can be hard to grasp from textbook pseudocode alone.

This visualizer turns the algorithm into a **scrub-able, step-by-step animation**. Watch the dictionary grow entry by entry, see which codes get emitted, and develop an intuitive understanding of *why* LZW achieves compression.

---

## How LZW Works

LZW encoding converts a string of characters into a sequence of integer codes using a dictionary that starts with single characters and grows dynamically:

```
1. Initialize the dictionary with every unique character in the input.
2. Set P = first character of the input.
3. For each subsequent character C:
     • If P+C exists in the dictionary → extend: P = P+C
     • If P+C does NOT exist →
         a. Output the code for P
         b. Add P+C to the dictionary with the next available code
         c. Reset: P = C
4. After all characters are processed, output the code for the remaining P.
```

### Worked Example

| Step | P  | C | P+C | In Dict? | Output | Added    |
|------|----|---|-----|----------|--------|----------|
| 1    | B  | A | BA  | NO       | 2 (B)  | BA = 4   |
| 2    | A  | B | AB  | NO       | 1 (A)  | AB = 5   |
| 3    | B  | A | BA  | YES      | —      | —        |
| 4    | BA | A | BAA | NO       | 4 (BA) | BAA = 6  |
| 5    | A  | B | AB  | YES      | —      | —        |
| 6    | AB | R | ABR | NO       | 5 (AB) | ABR = 7  |
| 7    | R  | R | RR  | NO       | 3 (R)  | RR = 8   |
| 8    | R  | R | RR  | YES      | —      | —        |
| 9    | RR | A | RRA | NO       | 8 (RR) | RRA = 9  |
| 10   | A  | — | —   | FLUSH    | 1 (A)  | —        |

**Input:** `BABAABRRRA` (10 chars) → **Output:** `2, 1, 4, 5, 3, 8, 1` (7 codes) — **30% fewer symbols**

---

## Features

### 🎛️ Interactive Controls
- **Step Forward / Backward** — scrub through the algorithm one operation at a time
- **Play / Pause** — auto-advance with adjustable speed (200ms – 2000ms)
- **Jump to End** — skip ahead to see the final result instantly
- **Reset** — return to step 0 without changing the input

### 📊 Split Dashboard
- **Process Log** (left) — a live table showing every step with columns for P, C, P+C lookup, output code, and dictionary additions. The active step is highlighted in amber.
- **Dynamic Dictionary** (right) — a grid of all dictionary entries, color-coded by type: *Initial* (single chars), *Learned* (multi-char patterns), and *Just Added* (the latest entry, with a glow animation).

### ⚡ Quick Presets
Four pre-loaded strings to explore different compression behaviors:

| Preset      | String                     | Why it's interesting                        |
|-------------|----------------------------|---------------------------------------------|
| Repetitive  | `ABABABABAB`               | Heavy repetition → high compression         |
| Complex     | `BABAABRRRA`               | Mixed patterns → moderate compression       |
| Simple      | `ABCABC`                   | Short input → minimal dictionary growth     |
| Wordy       | `TOBEORNOTTOBEORTOBEORNOT` | Long with overlapping patterns              |

### 🏆 Output Banner
A prominent panel at the bottom displays:
- Original string vs. encoded integer sequence
- Input length, output code count, and **compression ratio**
- A gradient border animation when encoding is complete

### 🎨 Design
- Dark theme with a dot-grid background and subtle radial gradients
- Teal primary / amber accent color system
- Typography: **Sora** (headings), **DM Sans** (body), **Fira Code** (data & mono)
- Smooth fade, slide, and pulse-glow animations

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Framework  | [React 19](https://react.dev)           |
| Build Tool | [Vite 8](https://vite.dev)              |
| Styling    | [Tailwind CSS 4](https://tailwindcss.com) (via `@tailwindcss/vite`) |
| Icons      | [Lucide React](https://lucide.dev)      |
| Language   | JavaScript (ES Modules)                 |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lzw-visualizer.git
cd lzw-visualizer

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173/`.

### Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## Project Structure

```
lzw-visualizer/
├── index.html                 # Entry HTML — Google Fonts, meta tags
├── vite.config.js             # Vite + React + Tailwind CSS plugins
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx               # React DOM entry point
    ├── index.css              # Tailwind v4 @theme config + custom animations
    ├── hooks/
    │   └── useLZW.js          # Core algorithm + playback state management
    └── App.jsx                # All UI components (single-file architecture)
```

### Key Files

| File | Responsibility |
|------|----------------|
| `src/hooks/useLZW.js` | Pre-computes **every** LZW step upfront via `computeAllSteps()`, then exposes playback controls (`stepForward`, `stepBackward`, `play`, `pause`, `reset`, `jumpToEnd`) and derived state (`currentDict`, `currentOutput`, `activeStep`, `isComplete`). |
| `src/App.jsx` | Six co-located components: `Header`, `ConfigPanel`, `ProcessLog`, `DictionaryPanel`, `ControlBar`, `OutputBanner` — all orchestrated by the root `App` component. |
| `src/index.css` | Defines the design system via Tailwind v4's `@theme` directive: 12 custom color tokens, 3 font families, and keyframe animations (`fadeIn`, `pulseGlow`, `slideIn`). |

---

## Usage Guide

1. **Enter a string** in the input field (A–Z only) or click a **Preset** button.
2. Click **Initialize Simulation** to build the initial dictionary from unique characters.
3. Use the **control bar** to step through the algorithm:
   - `⏮` Reset · `⏪` Step Back · `▶ / ⏸` Play/Pause · `⏩` Step Forward · `⏭` Jump to End
4. Watch the **Process Log** table fill row-by-row — the current step glows amber.
5. Watch the **Dictionary** panel grow — newly added entries pulse teal.
6. When complete, the **Output Banner** lights up with a gradient border showing the encoded result and compression statistics.

---

## Algorithm Implementation

The LZW logic lives in [`src/hooks/useLZW.js`](src/hooks/useLZW.js) and is designed for **mathematical accuracy** and **step-by-step scrubability**.

### Design Decisions

- **Pre-computation over live mutation**: All steps are computed once via `computeAllSteps()` and stored as an immutable array. This makes backward/forward scrubbing trivial — no undo stack needed.
- **1-indexed codes**: Dictionary codes start at 1 (not 0) to match common textbook conventions.
- **Sorted initial dictionary**: Single characters are sorted alphabetically before assignment, ensuring deterministic code values across runs.
- **Final flush step**: The last remaining `P` is explicitly flushed as a separate "FLUSH" step, matching the algorithm's canonical description.

### Step Data Shape

Each pre-computed step contains:

```js
{
  index: 1,                       // 1-indexed step number
  P: 'B',                        // current string before this step
  C: 'A',                        // next character read
  PC: 'BA',                      // concatenation P+C
  inDict: false,                 // was P+C found in dictionary?
  output: 2,                     // code emitted (null if P+C was in dict)
  newEntry: 'BA',                // string added to dictionary (null if in dict)
  newEntryCode: 4,               // code assigned to new entry
  isFinal: false,                // true only for the final flush step
  dictAfter: { A:1, B:2, ... }, // full dictionary snapshot after this step
  outputAfter: [2],              // full output array after this step
}
```

This design means the UI can jump to *any* step and instantly display the correct dictionary and output state — no sequential replay required.

---

## Contributing

Contributions are welcome! Some ideas:

- [x] **Decode mode** — add an LZW decoder that reverses the process
- [x] **Binary output view** — show the bit-level representation of codes
- [x] **Compression chart** — visualize compression ratio over time as steps progress
- [x] **Custom initial codes** — let users choose starting code values
- [ ] **Mobile responsive polish** — optimize the split layout for small screens
- [ ] **Export** — download the step table as CSV or the dictionary as JSON

```bash
# Fork → Branch → Code → PR
git checkout -b feature/decode-mode
# make changes
git commit -m "feat: add LZW decode simulation"
git push origin feature/decode-mode
```

---

## License

This project is open source under the [MIT License](LICENSE).

---

<div align="center">

**A Information Theory and Coding Project**

</div>
