import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Pre-computes every step of the LZW encoding algorithm so the UI
 * can scrub forwards and backwards through them.
 */
function computeAllSteps(input) {
  if (!input || input.length === 0) {
    return { steps: [], initialDict: {}, finalOutput: [] };
  }

  // Build initial dictionary from unique characters (sorted for determinism)
  const uniqueChars = [...new Set(input.split(''))].sort();
  const initialDict = {};
  uniqueChars.forEach((char, idx) => {
    initialDict[char] = idx + 1;
  });

  const dict = { ...initialDict };
  let nextCode = uniqueChars.length + 1;
  let P = input[0];
  const steps = [];
  const output = [];

  // Process each subsequent character
  for (let i = 1; i < input.length; i++) {
    const C = input[i];
    const PC = P + C;
    const inDict = PC in dict;

    const step = {
      index: steps.length + 1,
      P,
      C,
      PC,
      inDict,
      output: null,
      newEntry: null,
      newEntryCode: null,
      isFinal: false,
    };

    if (inDict) {
      // P+C exists → extend current string
      P = PC;
    } else {
      // P+C is new → output code for P, learn P+C, restart at C
      step.output = dict[P];
      output.push(dict[P]);
      dict[PC] = nextCode;
      step.newEntry = PC;
      step.newEntryCode = nextCode;
      nextCode++;
      P = C;
    }

    step.dictAfter = { ...dict };
    step.outputAfter = [...output];
    steps.push(step);
  }

  // Final step: flush remaining P
  output.push(dict[P]);
  steps.push({
    index: steps.length + 1,
    P,
    C: '—',
    PC: '—',
    inDict: false,
    output: dict[P],
    newEntry: null,
    newEntryCode: null,
    isFinal: true,
    dictAfter: { ...dict },
    outputAfter: [...output],
  });

  return { steps, initialDict, finalOutput: output };
}

export function useLZW() {
  const [inputString, setInputString] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [steps, setSteps] = useState([]);
  const [initialDict, setInitialDict] = useState({});
  const [finalOutput, setFinalOutput] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const intervalRef = useRef(null);

  const initialize = useCallback((str) => {
    const trimmed = str.trim().toUpperCase();
    if (!trimmed) return;
    setInputString(trimmed);
    const result = computeAllSteps(trimmed);
    setSteps(result.steps);
    setInitialDict(result.initialDict);
    setFinalOutput(result.finalOutput);
    setCurrentStep(0);
    setIsPlaying(false);
    setIsInitialized(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const stepForward = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  }, [steps.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const jumpToEnd = useCallback(() => {
    setCurrentStep(steps.length);
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [steps.length]);

  const play = useCallback(() => {
    if (currentStep >= steps.length) setCurrentStep(0);
    setIsPlaying(true);
  }, [currentStep, steps.length]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length) {
            setIsPlaying(false);
            clearInterval(intervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, steps.length]);

  // Derived state
  const currentDict =
    currentStep === 0 ? initialDict : steps[currentStep - 1].dictAfter;

  const currentOutput =
    currentStep === 0 ? [] : steps[currentStep - 1].outputAfter;

  const activeStep = currentStep > 0 ? steps[currentStep - 1] : null;

  const isComplete = currentStep >= steps.length && steps.length > 0;

  return {
    inputString,
    isInitialized,
    steps,
    initialDict,
    finalOutput,
    currentStep,
    currentDict,
    currentOutput,
    activeStep,
    isPlaying,
    isComplete,
    speed,
    setSpeed,
    initialize,
    stepForward,
    stepBackward,
    reset,
    jumpToEnd,
    play,
    pause,
  };
}
