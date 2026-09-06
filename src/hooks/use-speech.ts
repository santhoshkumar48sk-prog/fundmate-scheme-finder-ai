/**
 * Fundmate — voice-to-text via the Web Speech API (no paid service).
 * webkitSpeechRecognition is the de-facto standard in Chromium browsers;
 * TypeScript doesn't type it, so we declare a minimal structural type here.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { LOCALE_META, type Locale } from "@/lib/i18n";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: {
    resultIndex: number;
    results: { length: number; [i: number]: { 0: { transcript: string }; isFinal: boolean } };
  }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeech(locale: Locale, onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => getRecognitionCtor() !== null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  /* Keep the latest callback without re-creating the recognition object. */
  const cbRef = useRef(onTranscript);

  useEffect(() => {
    cbRef.current = onTranscript;
  }, [onTranscript]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    if (recRef.current) recRef.current.abort();

    const rec = new Ctor();
    rec.lang = LOCALE_META[locale].speech; // e.g. "ta-IN" for Tamil dictation
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) text += event.results[i][0].transcript;
      }
      if (text.trim()) cbRef.current(text.trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [locale]);

  useEffect(() => () => recRef.current?.abort(), []);

  return { listening, supported, start, stop };
}
