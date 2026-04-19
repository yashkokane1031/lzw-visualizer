import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  FastForward,
  Zap,
  BookOpen,
  ChevronRight,
  Gauge,
  Info,
} from 'lucide-react';
import { useLZW } from './hooks/useLZW';

/* ────────────────────────────────────────────────
   PRESET STRINGS
   ──────────────────────────────────────────────── */
const PRESETS = [
  { label: 'Repetitive', value: 'ABABABABAB', desc: 'Lots of repeats' },
  { label: 'Complex', value: 'BABAABRRRA', desc: 'Mixed patterns' },
  { label: 'Simple', value: 'ABCABC', desc: 'Short & clean' },
  { label: 'Wordy', value: 'TOBEORNOTTOBEORTOBEORNOT', desc: 'Classic phrase' },
];

/* ────────────────────────────────────────────────
   HEADER
   ──────────────────────────────────────────────── */
function Header() {
  return (
    <header className="text-center mb-8 pt-10">
      <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-teal-dim border border-teal/20">
        <Zap size={14} className="text-teal" />
        <span className="text-xs font-mono font-medium tracking-wider text-teal uppercase">
          Algorithm Visualizer
        </span>
      </div>
      <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
        <span className="text-text-primary">LZW </span>
        <span className="bg-gradient-to-r from-teal to-amber bg-clip-text text-transparent">
          Encoding
        </span>
      </h1>
      <p className="text-text-secondary max-w-2xl mx-auto text-base leading-relaxed">
        Lempel-Ziv-Welch builds a dictionary{' '}
        <em className="text-teal/80">on the fly</em> as it scans the input. When it
        finds a new pattern, it outputs the code for the longest known prefix and
        teaches itself the new, longer pattern.
      </p>
    </header>
  );
}

/* ────────────────────────────────────────────────
   CONFIG PANEL
   ──────────────────────────────────────────────── */
function ConfigPanel({ onInitialize }) {
  const [draft, setDraft] = useState('BABAABRRRA');

  const handleInit = () => {
    if (draft.trim()) onInitialize(draft);
  };

  return (
    <section className="bg-card border border-border rounded-2xl p-6 mb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen size={16} className="text-teal" />
        <h2 className="font-display font-semibold text-sm tracking-wide text-text-secondary uppercase">
          Configuration
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          id="lzw-input"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
          placeholder="Enter a string (A-Z only)…"
          className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/30 transition-all"
        />
        <button
          id="btn-initialize"
          onClick={handleInit}
          disabled={!draft.trim()}
          className="px-6 py-3 rounded-xl font-display font-semibold text-sm bg-teal text-base cursor-pointer transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Initialize Simulation
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            id={`preset-${p.label.toLowerCase()}`}
            onClick={() => {
              setDraft(p.value);
              onInitialize(p.value);
            }}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-elevated text-xs font-mono text-text-secondary cursor-pointer transition-all hover:border-teal/40 hover:text-teal hover:bg-teal-dim"
          >
            <ChevronRight
              size={12}
              className="text-text-muted group-hover:text-teal transition-colors"
            />
            {p.label}
            <span className="text-text-muted">— {p.desc}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   PROCESS LOG TABLE
   ──────────────────────────────────────────────── */
function ProcessLog({ steps, currentStep }) {
  const scrollRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentStep]);

  const visibleSteps = steps.slice(0, currentStep);

  return (
    <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden h-full">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
        <h2 className="font-display font-semibold text-sm tracking-wide text-text-secondary uppercase">
          Process Log
        </h2>
        <span className="ml-auto text-xs font-mono text-text-muted">
          {currentStep} / {steps.length}
        </span>
      </div>

      <div ref={scrollRef} className="overflow-y-auto flex-1 min-h-0">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-elevated text-text-muted font-mono text-xs tracking-wider">
              <th className="py-2.5 px-3 text-left font-medium">Step</th>
              <th className="py-2.5 px-3 text-left font-medium">P</th>
              <th className="py-2.5 px-3 text-left font-medium">C</th>
              <th className="py-2.5 px-3 text-left font-medium">P+C in Dict?</th>
              <th className="py-2.5 px-3 text-left font-medium">Output</th>
              <th className="py-2.5 px-3 text-left font-medium">Added</th>
            </tr>
          </thead>
          <tbody>
            {visibleSteps.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-muted text-sm">
                  <Info size={20} className="inline mb-1 opacity-40" />
                  <br />
                  Press <span className="font-mono text-teal">Step Forward</span> or{' '}
                  <span className="font-mono text-teal">Play</span> to begin
                </td>
              </tr>
            )}
            {visibleSteps.map((s, idx) => {
              const isActive = idx === currentStep - 1;
              return (
                <tr
                  key={s.index}
                  ref={isActive ? activeRef : null}
                  className={`border-b border-border/50 transition-colors duration-300 ${
                    isActive
                      ? 'bg-amber-dim'
                      : 'bg-transparent hover:bg-elevated/50'
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono text-text-muted">{s.index}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-text-primary">
                    {s.P}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-text-secondary">
                    {s.C}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium ${
                        s.isFinal
                          ? 'bg-elevated text-text-muted'
                          : s.inDict
                          ? 'bg-teal-dim text-teal border border-teal/20'
                          : 'bg-rose/10 text-rose border border-rose/20'
                      }`}
                    >
                      {s.isFinal ? 'FLUSH' : s.inDict ? 'YES' : 'NO'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold">
                    {s.output != null ? (
                      <span className="text-amber">{s.output}</span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    {s.newEntry ? (
                      <span className="text-teal">
                        {s.newEntry}
                        <span className="text-text-muted"> = </span>
                        {s.newEntryCode}
                      </span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   DICTIONARY PANEL
   ──────────────────────────────────────────────── */
function DictionaryPanel({ initialDict, currentDict, activeStep }) {
  const initialKeys = new Set(Object.keys(initialDict));
  const entries = Object.entries(currentDict).sort((a, b) => a[1] - b[1]);
  const latestCode = activeStep?.newEntryCode ?? null;

  return (
    <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden h-full">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <div className="w-2 h-2 rounded-full bg-amber animate-pulse" />
        <h2 className="font-display font-semibold text-sm tracking-wide text-text-secondary uppercase">
          Dictionary
        </h2>
        <span className="ml-auto text-xs font-mono text-text-muted">
          {entries.length} entries
        </span>
      </div>

      <div className="overflow-y-auto flex-1 p-4 min-h-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {entries.map(([key, code]) => {
            const isInitial = initialKeys.has(key) && key.length === 1;
            const isLatest = code === latestCode;

            return (
              <div
                key={code}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-sm font-mono transition-all duration-300 ${
                  isLatest
                    ? 'bg-teal-dim border-teal/40 animate-pulse-glow animate-slide-in'
                    : isInitial
                    ? 'bg-elevated border-border'
                    : 'bg-surface border-border/60'
                }`}
              >
                <span
                  className={`font-semibold ${
                    isLatest
                      ? 'text-teal'
                      : isInitial
                      ? 'text-text-primary'
                      : 'text-text-secondary'
                  }`}
                >
                  {key}
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-md ${
                    isLatest
                      ? 'bg-teal/20 text-teal'
                      : 'bg-border/50 text-text-muted'
                  }`}
                >
                  {code}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-border text-[11px] text-text-muted font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-elevated border border-border inline-block" />
          Initial
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-surface border border-border/60 inline-block" />
          Learned
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-teal-dim border border-teal/40 inline-block" />
          Just Added
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   CONTROL BAR
   ──────────────────────────────────────────────── */
function ControlBar({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  setSpeed,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  onJumpToEnd,
}) {
  const atStart = currentStep <= 0;
  const atEnd = currentStep >= totalSteps;

  const btnBase =
    'flex items-center justify-center w-10 h-10 rounded-xl border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed';
  const btnDefault = `${btnBase} border-border bg-elevated text-text-secondary hover:bg-card hover:text-text-primary hover:border-border-strong active:scale-95`;
  const btnPrimary = `${btnBase} border-teal/30 bg-teal-dim text-teal hover:bg-teal-medium hover:border-teal/50 active:scale-95`;

  return (
    <div className="bg-card border border-border rounded-2xl px-5 py-4 mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Playback buttons */}
        <div className="flex items-center gap-2">
          <button id="btn-reset" onClick={onReset} disabled={atStart} className={btnDefault} title="Reset">
            <RotateCcw size={16} />
          </button>
          <button id="btn-step-back" onClick={onStepBackward} disabled={atStart} className={btnDefault} title="Step Backward">
            <SkipBack size={16} />
          </button>
          {isPlaying ? (
            <button id="btn-pause" onClick={onPause} className={btnPrimary} title="Pause">
              <Pause size={18} />
            </button>
          ) : (
            <button id="btn-play" onClick={onPlay} disabled={atEnd} className={btnPrimary} title="Play">
              <Play size={18} />
            </button>
          )}
          <button id="btn-step-fwd" onClick={onStepForward} disabled={atEnd} className={btnDefault} title="Step Forward">
            <SkipForward size={16} />
          </button>
          <button id="btn-jump-end" onClick={onJumpToEnd} disabled={atEnd} className={btnDefault} title="Jump to End">
            <FastForward size={16} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex-1 mx-2">
          <div className="h-1.5 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal to-amber rounded-full transition-all duration-300"
              style={{
                width: totalSteps ? `${(currentStep / totalSteps) * 100}%` : '0%',
              }}
            />
          </div>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
          <Gauge size={14} />
          <input
            id="speed-slider"
            type="range"
            min={200}
            max={2000}
            step={100}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-20 accent-teal"
          />
          <span className="w-12 text-right">{speed}ms</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   OUTPUT BANNER
   ──────────────────────────────────────────────── */
function OutputBanner({ inputString, currentOutput, isComplete, finalOutput }) {
  const displayOutput = isComplete ? finalOutput : currentOutput;

  return (
    <div
      className={`rounded-2xl p-[1px] transition-all duration-500 ${
        isComplete
          ? 'bg-gradient-to-r from-teal via-amber to-teal'
          : 'bg-border'
      }`}
    >
      <div className="bg-card rounded-2xl px-6 py-5">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Original */}
          <div>
            <span className="text-[11px] font-mono text-text-muted tracking-wider uppercase block mb-1.5">
              Original String
            </span>
            <p className="font-mono text-sm text-text-primary break-all leading-relaxed bg-surface px-3 py-2 rounded-lg border border-border">
              {inputString}
            </p>
          </div>

          {/* Encoded */}
          <div>
            <span className="text-[11px] font-mono text-text-muted tracking-wider uppercase block mb-1.5">
              Encoded Output {isComplete && '✓'}
            </span>
            <p className="font-mono text-sm break-all leading-relaxed bg-surface px-3 py-2 rounded-lg border border-border">
              {displayOutput.length > 0 ? (
                displayOutput.map((code, i) => (
                  <span key={i}>
                    <span className="text-amber font-bold">{code}</span>
                    {i < displayOutput.length - 1 && (
                      <span className="text-text-muted">, </span>
                    )}
                  </span>
                ))
              ) : (
                <span className="text-text-muted">—</span>
              )}
            </p>
          </div>
        </div>

        {isComplete && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-mono text-text-muted">
            <span>
              Input length:{' '}
              <span className="text-text-primary font-semibold">
                {inputString.length}
              </span>
            </span>
            <span className="text-border">|</span>
            <span>
              Output codes:{' '}
              <span className="text-text-primary font-semibold">
                {finalOutput.length}
              </span>
            </span>
            <span className="text-border">|</span>
            <span>
              Compression:{' '}
              <span className="text-teal font-semibold">
                {((1 - finalOutput.length / inputString.length) * 100).toFixed(1)}%
                fewer symbols
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   APP
   ──────────────────────────────────────────────── */
export default function App() {
  const lzw = useLZW();

  return (
    <div className="min-h-screen px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <Header />

        <ConfigPanel onInitialize={lzw.initialize} />

        {lzw.isInitialized && (
          <>
            {/* Control bar */}
            <ControlBar
              isPlaying={lzw.isPlaying}
              currentStep={lzw.currentStep}
              totalSteps={lzw.steps.length}
              speed={lzw.speed}
              setSpeed={lzw.setSpeed}
              onPlay={lzw.play}
              onPause={lzw.pause}
              onStepForward={lzw.stepForward}
              onStepBackward={lzw.stepBackward}
              onReset={lzw.reset}
              onJumpToEnd={lzw.jumpToEnd}
            />

            {/* Split dashboard */}
            <div className="grid lg:grid-cols-[7fr_5fr] gap-6 mb-6 animate-fade-in">
              <div className="min-h-[360px] max-h-[520px]">
                <ProcessLog steps={lzw.steps} currentStep={lzw.currentStep} />
              </div>
              <div className="min-h-[360px] max-h-[520px]">
                <DictionaryPanel
                  initialDict={lzw.initialDict}
                  currentDict={lzw.currentDict}
                  activeStep={lzw.activeStep}
                />
              </div>
            </div>

            {/* Output banner */}
            <OutputBanner
              inputString={lzw.inputString}
              currentOutput={lzw.currentOutput}
              isComplete={lzw.isComplete}
              finalOutput={lzw.finalOutput}
            />
          </>
        )}
      </div>
    </div>
  );
}
