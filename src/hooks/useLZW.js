import { useState, useCallback, useRef, useEffect } from 'react';

/* ── Encode ───────────────────────────────────── */
function computeEncodeSteps(input, startCode = 1) {
  if (!input || input.length === 0) return { steps: [], initialDict: {}, finalOutput: [] };

  const uniqueChars = [...new Set(input.split(''))].sort();
  const initialDict = {};
  uniqueChars.forEach((char, idx) => { initialDict[char] = startCode + idx; });

  const dict = { ...initialDict };
  let nextCode = startCode + uniqueChars.length;
  let P = input[0];
  const steps = [];
  const output = [];

  for (let i = 1; i < input.length; i++) {
    const C = input[i];
    const PC = P + C;
    const inDict = PC in dict;
    const step = { index: steps.length + 1, P, C, PC, inDict, output: null, newEntry: null, newEntryCode: null, isFinal: false };

    if (inDict) { P = PC; }
    else {
      step.output = dict[P]; output.push(dict[P]);
      dict[PC] = nextCode; step.newEntry = PC; step.newEntryCode = nextCode;
      nextCode++; P = C;
    }
    step.dictAfter = { ...dict };
    step.outputAfter = [...output];
    steps.push(step);
  }

  output.push(dict[P]);
  steps.push({ index: steps.length + 1, P, C: '—', PC: '—', inDict: false, output: dict[P], newEntry: null, newEntryCode: null, isFinal: true, dictAfter: { ...dict }, outputAfter: [...output] });

  return { steps, initialDict, finalOutput: output };
}

/* ── Decode ───────────────────────────────────── */
function computeDecodeSteps(codes, initialDict, startCode = 1) {
  if (!codes || codes.length === 0) return { steps: [], decodedString: '' };

  const rev = {};
  Object.entries(initialDict).forEach(([s, c]) => { rev[c] = s; });

  const toFwd = (r) => { const f = {}; Object.entries(r).forEach(([c, s]) => { f[s] = parseInt(c); }); return f; };

  let nextCode = startCode + Object.keys(initialDict).length;
  const steps = [];
  let decoded = '';

  const firstStr = rev[codes[0]];
  decoded += firstStr;
  let OLD = firstStr;
  steps.push({ index: 1, code: codes[0], codeInDict: true, outputString: firstStr, newEntry: null, newEntryCode: null, isSpecialCase: false, isFirst: true, dictAfter: toFwd(rev), decodedAfter: decoded });

  for (let i = 1; i < codes.length; i++) {
    const code = codes[i];
    const inDict = code in rev;
    let S, isSpecial = false;

    if (inDict) { S = rev[code]; }
    else { S = OLD + OLD[0]; isSpecial = true; }

    decoded += S;
    const newEntry = OLD + S[0];
    rev[nextCode] = newEntry;

    steps.push({ index: steps.length + 1, code, codeInDict: inDict, outputString: S, newEntry, newEntryCode: nextCode, isSpecialCase: isSpecial, isFirst: false, dictAfter: toFwd(rev), decodedAfter: decoded });
    nextCode++; OLD = S;
  }
  return { steps, decodedString: decoded };
}

/* ── Hook ─────────────────────────────────────── */
export function useLZW() {
  const [mode, setMode] = useState('encode');
  const [startCode, setStartCode] = useState(1);
  const [inputString, setInputString] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const [encodeSteps, setEncodeSteps] = useState([]);
  const [initialDict, setInitialDict] = useState({});
  const [finalOutput, setFinalOutput] = useState([]);

  const [decodeSteps, setDecodeSteps] = useState([]);
  const [decodedString, setDecodedString] = useState('');

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const intervalRef = useRef(null);

  const steps = mode === 'encode' ? encodeSteps : decodeSteps;

  const initialize = useCallback((str, sc) => {
    const code = sc ?? startCode;
    const trimmed = str.trim().toUpperCase();
    if (!trimmed) return;
    setInputString(trimmed);

    const enc = computeEncodeSteps(trimmed, code);
    setEncodeSteps(enc.steps); setInitialDict(enc.initialDict); setFinalOutput(enc.finalOutput);

    const dec = computeDecodeSteps(enc.finalOutput, enc.initialDict, code);
    setDecodeSteps(dec.steps); setDecodedString(dec.decodedString);

    setCurrentStep(0); setIsPlaying(false); setIsInitialized(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [startCode]);

  const switchMode = useCallback((m) => {
    setMode(m); setCurrentStep(0); setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const stepForward = useCallback(() => setCurrentStep(p => Math.min(p + 1, steps.length)), [steps.length]);
  const stepBackward = useCallback(() => setCurrentStep(p => Math.max(p - 1, 0)), []);
  const reset = useCallback(() => { setCurrentStep(0); setIsPlaying(false); if (intervalRef.current) clearInterval(intervalRef.current); }, []);
  const jumpToEnd = useCallback(() => { setCurrentStep(steps.length); setIsPlaying(false); if (intervalRef.current) clearInterval(intervalRef.current); }, [steps.length]);
  const play = useCallback(() => { if (currentStep >= steps.length) setCurrentStep(0); setIsPlaying(true); }, [currentStep, steps.length]);
  const pause = useCallback(() => { setIsPlaying(false); if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(p => { if (p >= steps.length) { setIsPlaying(false); clearInterval(intervalRef.current); return p; } return p + 1; });
      }, speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed, steps.length]);

  const currentDict = currentStep === 0 ? initialDict : steps[currentStep - 1].dictAfter;
  const currentOutput = mode === 'encode' ? (currentStep === 0 ? [] : steps[currentStep - 1].outputAfter) : [];
  const activeStep = currentStep > 0 ? steps[currentStep - 1] : null;
  const isComplete = currentStep >= steps.length && steps.length > 0;
  const currentDecoded = mode === 'decode' && currentStep > 0 ? steps[currentStep - 1].decodedAfter : '';

  return {
    mode, switchMode, startCode, setStartCode,
    inputString, isInitialized, steps, initialDict, finalOutput,
    decodeSteps, decodedString, currentDecoded,
    currentStep, currentDict, currentOutput, activeStep,
    isPlaying, isComplete, speed, setSpeed,
    initialize, stepForward, stepBackward, reset, jumpToEnd, play, pause,
  };
}
