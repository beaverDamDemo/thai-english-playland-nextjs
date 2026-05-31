'use client';

import { useEffect, useState } from 'react';

const translationCache = new Map<string, string>();

function fallbackThaiTranslation(question: string): string {
  const replacements: Array<[string, string]> = [
    ['Choose', 'เลือก'],
    ['Which', 'ข้อใด'],
    ['Complete', 'เติมให้สมบูรณ์'],
    ['Fill in the blank', 'เติมคำในช่องว่าง'],
    ['Pick', 'เลือก'],
    ['What', 'อะไร'],
    ['Is', 'คือ'],
    ['the sentence', 'ประโยค'],
    ['correct', 'ถูกต้อง'],
    ['word', 'คำ'],
    ['phrase', 'วลี'],
    ['question', 'คำถาม'],
  ];

  let translated = question;
  for (const [en, th] of replacements) {
    translated = translated.replace(new RegExp(en, 'gi'), th);
  }

  return translated;
}

export function useThaiQuestion(question: string): string {
  const [thaiQuestion, setThaiQuestion] = useState('');

  useEffect(() => {
    let cancelled = false;

    if (!question) return;

    const cached = translationCache.get(question);
    if (cached) return;

    const fetchTranslation = async () => {
      try {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(question)}&langpair=en|th`,
        );
        const data = (await response.json()) as {
          responseData?: { translatedText?: string; };
        };

        const translated = data.responseData?.translatedText?.trim();
        const safeTranslated =
          translated && translated.length > 0 && translated !== question
            ? translated
            : fallbackThaiTranslation(question);

        translationCache.set(question, safeTranslated);
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
  }, [question]);

  if (!question) return '';
  return translationCache.get(question) ?? thaiQuestion;
}
