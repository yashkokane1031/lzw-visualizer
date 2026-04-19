import { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward,
  Zap, BookOpen, ChevronRight, Gauge, Info, Binary, LineChart as ChartIcon,
  ArrowRightLeft
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
function Header({ mode, switchMode }) {
  return (
    <header className="text-center mb-8 pt-10 relative">
      <div className="absolute right-0 top-10">
        <div className="inline-flex items-center p-1 bg-surface border border-border rounded-lg">
          <button
            onClick={() => switchMode('encode')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              mode === 'encode' ? 'bg-teal text-base shadow-md' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => switchMode('decode')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              mode === 'decode' ? 'bg-amber text-base shadow-md' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Decode
          </button>
        </div>
      </div>

      <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-teal-dim border border-teal/20">
        <Zap size={14} className="text-teal" />
        <span className="text-xs font-mono font-medium tracking-wider text-teal uppercase">
          Algorithm Visualizer
        </span>
      </div>
      <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
        <span className="text-text-primary">LZW </span>
        <span className="bg-gradient-to-r from-teal to-amber bg-clip-text text-transparent">
          {mode === 'encode' ? 'Encoding' : 'Decoding'}
        </span>
      </h1>
      <p className="text-text-secondary max-w-2xl mx-auto text-base leading-relaxed">
        {mode === 'encode' 
          ? <>Lempel-Ziv-Welch builds a dictionary <em className="text-teal/80">on the fly</em> as it scans the input. When it finds a new pattern, it outputs the code for the longest known prefix and teaches itself the new, longer pattern.</>
          : <>The decoder reconstructs the dictionary exactly as the encoder built it, simply by receiving the sequence of output codes. It translates codes back into strings and learns new patterns simultaneously.</>}
      </p>
    </header>
  );
}

/* ────────────────────────────────────────────────
   CONFIG PANEL
   ──────────────────────────────────────────────── */
function ConfigPanel({ onInitialize, defaultStartCode }) {
  const [draft, setDraft] = useState('BABAABRRRA');
  const [startCode, setStartCodeInput] = useState(defaultStartCode.toString());

  const handleInit = () => {
    if (draft.trim()) {
      const code = parseInt(startCode, 10);
      onInitialize(draft, isNaN(code) || code < 0 ? 1 : code);
    }
  };

  return (
    <section className="bg-card border border-border rounded-2xl p-6 mb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen size={16} className="text-teal" />
        <h2 className="font-display font-semibold text-sm tracking-wide text-text-secondary uppercase">
          Configuration
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
        <input
          id="lzw-input"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
          placeholder="Enter a string (A-Z only)…"
          className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/30 transition-all w-full"
        />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-mono text-text-muted whitespace-nowrap">Start Code:</label>
          <input
            type="number"
            min="0"
            value={startCode}
            onChange={(e) => setStartCodeInput(e.target.value)}
            className="w-20 bg-surface border border-border rounded-xl px-3 py-3 font-mono text-sm text-text-primary focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/30 transition-all"
          />
        </div>
        <button
          id="btn-initialize"
          onClick={handleInit}
          disabled={!draft.trim()}
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-display font-semibold text-sm bg-teal text-base cursor-pointer transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
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
              const code = parseInt(startCode, 10);
              onInitialize(p.value, isNaN(code) ? 1 : code);
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
function ProcessLog({ steps, currentStep, mode }) {
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
              {mode === 'encode' ? (
                <>
                  <th className="py-2.5 px-3 text-left font-medium">P</th>
                  <th className="py-2.5 px-3 text-left font-medium">C</th>
                  <th className="py-2.5 px-3 text-left font-medium">P+C in Dict?</th>
                  <th className="py-2.5 px-3 text-left font-medium">Output Code</th>
                </>
              ) : (
                <>
                  <th className="py-2.5 px-3 text-left font-medium">Code</th>
                  <th className="py-2.5 px-3 text-left font-medium">In Dict?</th>
                  <th className="py-2.5 px-3 text-left font-medium">Output String</th>
                </>
              )}
              <th className="py-2.5 px-3 text-left font-medium">Added to Dict</th>
            </tr>
          </thead>
          <tbody>
            {visibleSteps.length === 0 && (
              <tr>
                <td colSpan={mode === 'encode' ? 6 : 5} className="py-12 text-center text-text-muted text-sm">
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
                  
                  {mode === 'encode' ? (
                    <>
                      <td className="py-2.5 px-3 font-mono font-semibold text-text-primary">{s.P}</td>
                      <td className="py-2.5 px-3 font-mono text-text-secondary">{s.C}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium ${
                          s.isFinal ? 'bg-elevated text-text-muted' : s.inDict ? 'bg-teal-dim text-teal border border-teal/20' : 'bg-rose/10 text-rose border border-rose/20'
                        }`}>
                          {s.isFinal ? 'FLUSH' : s.inDict ? 'YES' : 'NO'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        {s.output != null ? <span className="text-amber">{s.output}</span> : <span className="text-text-muted">—</span>}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2.5 px-3 font-mono font-semibold text-amber">{s.code}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium ${
                          s.isFirst ? 'bg-elevated text-text-muted' : s.codeInDict ? 'bg-teal-dim text-teal border border-teal/20' : 'bg-rose/10 text-rose border border-rose/20'
                        }`}>
                          {s.isFirst ? 'FIRST' : s.codeInDict ? 'YES' : 'NO (OLD+OLD[0])'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-text-primary">
                        {s.outputString}
                      </td>
                    </>
                  )}
                  
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
  isPlaying, currentStep, totalSteps, speed, setSpeed,
  onPlay, onPause, onStepForward, onStepBackward, onReset, onJumpToEnd,
}) {
  const atStart = currentStep <= 0;
  const atEnd = currentStep >= totalSteps;

  const btnBase =
    'flex items-center justify-center w-10 h-10 rounded-xl border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed';
  const btnDefault = `${btnBase} border-border bg-elevated text-text-secondary hover:bg-card hover:text-text-primary hover:border-border-strong active:scale-95`;
  const btnPrimary = `${btnBase} border-teal/30 bg-teal-dim text-teal hover:bg-teal-medium hover:border-teal/50 active:scale-95`;

  return (
    <div className="bg-card border border-border rounded-2xl px-5 py-4 mb-6 animate-fade-in flex flex-col sm:flex-row items-center gap-4">
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

      <div className="flex-1 w-full mx-2">
        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal to-amber rounded-full transition-all duration-300"
            style={{ width: totalSteps ? `${(currentStep / totalSteps) * 100}%` : '0%' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-text-muted font-mono w-full sm:w-auto">
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
  );
}

/* ────────────────────────────────────────────────
   COMPRESSION CHART
   ──────────────────────────────────────────────── */
function CompressionChart({ steps, currentStep, inputString }) {
  if (!steps || steps.length === 0 || !inputString) return null;

  // Build chart data
  const dataPoints = [];
  let outputSize = 0;
  
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].output != null) outputSize++;
    
    // Calculate compression ratio up to this point
    // Input processed is roughly (i + 1) characters if we consider C
    const inputProcessed = Math.min(i + 2, inputString.length);
    const ratio = inputProcessed > 0 ? ((1 - (outputSize / inputProcessed)) * 100) : 0;
    
    dataPoints.push({
      step: i + 1,
      ratio: ratio,
      outputSize,
      inputProcessed
    });
  }

  const visibleData = dataPoints.slice(0, currentStep);
  const maxRatio = Math.max(10, ...dataPoints.map(d => d.ratio));
  const minRatio = Math.min(-10, ...dataPoints.map(d => d.ratio));
  const range = maxRatio - minRatio;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col h-full animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <ChartIcon size={16} className="text-teal" />
        <h2 className="font-display font-semibold text-sm tracking-wide text-text-secondary uppercase">
          Compression Ratio Over Time
        </h2>
      </div>
      
      <div className="flex-1 relative mt-2 min-h-[120px]">
        {/* Y-axis guidelines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="border-b border-border/30 w-full h-0 relative">
            <span className="absolute -left-1 -top-2 text-[10px] text-text-muted font-mono -translate-x-full pr-1">{maxRatio.toFixed(0)}%</span>
          </div>
          <div className="border-b border-border/30 w-full h-0 relative">
            <span className="absolute -left-1 -top-2 text-[10px] text-text-muted font-mono -translate-x-full pr-1">{(maxRatio - range/2).toFixed(0)}%</span>
          </div>
          <div className="border-b border-border/30 w-full h-0 relative">
            <span className="absolute -left-1 -top-2 text-[10px] text-text-muted font-mono -translate-x-full pr-1">{minRatio.toFixed(0)}%</span>
          </div>
        </div>
        
        {/* Zero line if range crosses zero */}
        {minRatio < 0 && maxRatio > 0 && (
          <div 
            className="absolute left-0 right-0 border-b border-border/60 border-dashed"
            style={{ bottom: `${Math.abs(minRatio) / range * 100}%` }}
          />
        )}

        {/* The Line */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {visibleData.length > 1 && (
            <polyline
              points={visibleData.map((d, i) => {
                const x = (i / (dataPoints.length - 1 || 1)) * 100;
                const y = 100 - ((d.ratio - minRatio) / range) * 100;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="var(--color-teal)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}
          {visibleData.length > 0 && (
            <circle
              cx={`${((visibleData.length - 1) / (dataPoints.length - 1 || 1)) * 100}%`}
              cy={`${100 - ((visibleData[visibleData.length - 1].ratio - minRatio) / range) * 100}%`}
              r="4"
              fill="var(--color-base)"
              stroke="var(--color-amber)"
              strokeWidth="2"
            />
          )}
        </svg>
      </div>
      <div className="text-center mt-2 text-[11px] font-mono text-text-muted">
        {visibleData.length > 0 ? (
           <span>Current Ratio: <strong className={visibleData[visibleData.length - 1].ratio >= 0 ? "text-teal" : "text-rose"}>{visibleData[visibleData.length - 1].ratio.toFixed(1)}%</strong></span>
        ) : <span>Waiting to start...</span>}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   OUTPUT BANNER
   ──────────────────────────────────────────────── */
function OutputBanner({ mode, inputString, currentOutput, currentDecoded, isComplete, finalOutput }) {
  const [showBinary, setShowBinary] = useState(false);
  const displayOutput = isComplete ? finalOutput : currentOutput;

  // Format integer to 8-bit binary string
  const toBinary = (num) => num.toString(2).padStart(8, '0');

  return (
    <div className={`rounded-2xl p-[1px] transition-all duration-500 ${isComplete ? 'bg-gradient-to-r from-teal via-amber to-teal' : 'bg-border'}`}>
      <div className="bg-card rounded-2xl px-6 py-5">
        <div className="flex justify-between items-start mb-4">
          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 w-full items-center">
            {/* Input Side */}
            <div>
              <span className="text-[11px] font-mono text-text-muted tracking-wider uppercase block mb-1.5">
                {mode === 'encode' ? 'Original String' : 'Encoded Input Codes'}
              </span>
              <p className="font-mono text-sm text-text-primary break-all leading-relaxed bg-surface px-3 py-2 rounded-lg border border-border">
                {mode === 'encode' ? (
                  inputString
                ) : (
                  finalOutput.map((c, i) => <span key={i} className="text-amber font-bold">{c}{i < finalOutput.length-1 ? ', ' : ''}</span>)
                )}
              </p>
            </div>
            
            <ArrowRightLeft className="text-text-muted hidden md:block" size={20} />

            {/* Output Side */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono text-text-muted tracking-wider uppercase block">
                  {mode === 'encode' ? 'Encoded Output' : 'Decoded String'} {isComplete && '✓'}
                </span>
                {mode === 'encode' && (
                  <button 
                    onClick={() => setShowBinary(!showBinary)}
                    className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${showBinary ? 'bg-teal-dim border-teal/30 text-teal' : 'bg-surface border-border text-text-muted hover:text-text-primary'}`}
                  >
                    <Binary size={12} /> {showBinary ? 'Binary' : 'Int'}
                  </button>
                )}
              </div>
              <p className="font-mono text-sm break-all leading-relaxed bg-surface px-3 py-2 rounded-lg border border-border min-h-[38px]">
                {mode === 'encode' ? (
                  displayOutput.length > 0 ? (
                    displayOutput.map((code, i) => (
                      <span key={i} className="inline-block mr-1.5 mb-1">
                        {showBinary ? (
                          <span className="text-teal font-mono text-xs px-1 bg-teal-dim rounded border border-teal/10">{toBinary(code)}</span>
                        ) : (
                          <span className="text-amber font-bold">{code}</span>
                        )}
                        {i < displayOutput.length - 1 && !showBinary && <span className="text-text-muted">, </span>}
                      </span>
                    ))
                  ) : <span className="text-text-muted">—</span>
                ) : (
                  currentDecoded ? <span className="text-teal font-bold">{currentDecoded}</span> : <span className="text-text-muted">—</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {isComplete && mode === 'encode' && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-text-muted pt-3 border-t border-border/50">
            <span>Input: <span className="text-text-primary font-semibold">{inputString.length}</span> chars</span>
            <span className="text-border">|</span>
            <span>Output: <span className="text-text-primary font-semibold">{finalOutput.length}</span> codes</span>
            <span className="text-border">|</span>
            <span>Compression: <span className="text-teal font-semibold">{((1 - finalOutput.length / inputString.length) * 100).toFixed(1)}% fewer symbols</span></span>
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
        <Header mode={lzw.mode} switchMode={lzw.switchMode} />

        <ConfigPanel onInitialize={lzw.initialize} defaultStartCode={lzw.startCode} />

        {lzw.isInitialized && (
          <>
            <ControlBar
              isPlaying={lzw.isPlaying} currentStep={lzw.currentStep} totalSteps={lzw.steps.length} speed={lzw.speed} setSpeed={lzw.setSpeed}
              onPlay={lzw.play} onPause={lzw.pause} onStepForward={lzw.stepForward} onStepBackward={lzw.stepBackward} onReset={lzw.reset} onJumpToEnd={lzw.jumpToEnd}
            />

            <div className="grid lg:grid-cols-[7fr_5fr] gap-6 mb-6 animate-fade-in">
              <div className="min-h-[360px] max-h-[520px]">
                <ProcessLog steps={lzw.steps} currentStep={lzw.currentStep} mode={lzw.mode} />
              </div>
              <div className="flex flex-col gap-6 min-h-[360px] max-h-[520px]">
                <div className="flex-1 min-h-0">
                  <DictionaryPanel initialDict={lzw.initialDict} currentDict={lzw.currentDict} activeStep={lzw.activeStep} />
                </div>
                {lzw.mode === 'encode' && (
                  <div className="h-48 shrink-0">
                    <CompressionChart steps={lzw.steps} currentStep={lzw.currentStep} inputString={lzw.inputString} />
                  </div>
                )}
              </div>
            </div>

            <OutputBanner
              mode={lzw.mode} inputString={lzw.inputString} currentOutput={lzw.currentOutput} currentDecoded={lzw.currentDecoded}
              isComplete={lzw.isComplete} finalOutput={lzw.finalOutput}
            />
          </>
        )}
      </div>
    </div>
  );
}
