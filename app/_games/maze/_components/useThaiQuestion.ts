"use client";

import { useEffect, useState } from "react";
import { THAI_TRANSLATIONS } from "../../thaiTranslations";

// In-memory cache for this page visit.
const translationCache = new Map<string, string>();

// API translations are also remembered on this device, so each question is fetched
// at most once per device instead of on every visit.
const STORAGE_KEY = "playland-thai-translations";

function readStoredTranslation(question: string): string | undefined {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, string>;
    return stored[question];
  } catch {
    return undefined;
  }
}

function storeTranslation(question: string, translation: string): void {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, string>;
    stored[question] = translation;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage full or blocked (e.g. private mode): the in-memory cache still works.
  }
}

function fallbackThaiTranslation(question: string): string {
  const replacements: Array<[string, string]> = [
    ["Choose", "เลือก"],
    ["Which", "ข้อใด"],
    ["Complete", "เติมให้สมบูรณ์"],
    ["Fill in the blank", "เติมคำในช่องว่าง"],
    ["Pick", "เลือก"],
    ["What", "อะไร"],
    ["Is", "คือ"],
    ["the sentence", "ประโยค"],
    ["correct", "ถูกต้อง"],
    ["word", "คำ"],
    ["phrase", "วลี"],
    ["question", "คำถาม"],
  ];

  let translated = question;
  for (const [en, th] of replacements) {
    translated = translated.replace(new RegExp(en, "gi"), th);
  }

  return translated;
}

export function useThaiQuestion(question: string): string {
  const [thaiQuestion, setThaiQuestion] = useState("");
  // 1. Hard-coded translations (app/_games/thaiTranslations.ts): no request at all.
  const knownTranslation = THAI_TRANSLATIONS[question];

  useEffect(() => {
    let cancelled = false;

    if (!question || knownTranslation) return;

    // 2. Already translated earlier (this visit, or a previous one on this device).
    const cached = translationCache.get(question) ?? readStoredTranslation(question);
    if (cached) {
      translationCache.set(question, cached);
      queueMicrotask(() => {
        if (!cancelled) setThaiQuestion(cached);
      });
      return;
    }

    // 3. Ask the translation API once, then remember the answer on this device.
    const fetchTranslation = async () => {
      try {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(question)}&langpair=en|th`,
        );
        const data = (await response.json()) as {
          responseData?: { translatedText?: string };
        };

        const translated = data.responseData?.translatedText?.trim();
        const isRealTranslation = Boolean(translated && translated.length > 0 && translated !== question);
        const safeTranslated = isRealTranslation ? (translated as string) : fallbackThaiTranslation(question);

        translationCache.set(question, safeTranslated);
        // Only real API translations are stored; a fallback is retried on a later visit.
        if (isRealTranslation) storeTranslation(question, safeTranslated);
        if (!cancelled) {
          setThaiQuestion(safeTranslated);
        }
      } catch {
        const fallback = fallbackThaiTranslation(question);
        translationCache.set(question, fallback);
        if (!cancelled) {
          setThaiQuestion(fallback);
        }
      }
    };

    fetchTranslation();

    return () => {
      cancelled = true;
    };
  }, [knownTranslation, question]);

  if (!question) return "";
  return knownTranslation ?? translationCache.get(question) ?? thaiQuestion;
}
