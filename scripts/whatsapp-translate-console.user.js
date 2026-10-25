// ==UserScript==
// @name         WhatsApp Web Translate (Console Only)
// @namespace    https://tampermonkey.net/
// @version      2.0.0
// @description  Translates outgoing drafts to Thai and incoming Thai messages to English, printing results in the console only. No DOM changes.
// @match        https://web.whatsapp.com/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @connect      translate.googleapis.com
// @connect      translate.argosopentech.com
// @connect      api.mymemory.translated.net
// ==/UserScript==

/* global GM_xmlhttpRequest */

(function () {
  "use strict";

  const INSTANCE_KEY = "__tmWhatsAppConsoleTranslateInstance__";
  if (window[INSTANCE_KEY]) {
    return;
  }
  window[INSTANCE_KEY] = true;

  const TAG = "[TM WA Translate]";
  console.log(`${TAG} script loaded v2.0.0`);

  const CONFIG = {
    googleMaxAttempts: 3,
    targetLanguage: "th",
    incomingTranslationLanguage: "en",
    minMessageLength: 1,
    triggerDedupMs: 250,
    typingDebounceMs: 800,
    initialIncomingRescanDelaysMs: [800, 2000, 4000],
  };

  const ALLOWED_CHAT_NAMES = new Set(
    [
      "siriyachinhngs Mak 32yo Lamyai Health Massage",
      "Tf Kanittha 30 30 Nakhon R",
      "noona Longkee Massage 45yo",
      "Ketsuda292 Tf 18 Pattaya",
      "Babie TF 37 Ban Talat",
      "Tan Soi Bukhakao 19",
      "Joy 22yo From Laos Lengkee Restaurant",
      "Mon TF 41 Chiang Mai",
      "Tong",
      "Mint89327 Tf 24 Pattaya",
      "Nun TF Pattaya",
      "❣️💪 LB Kewl",
      "LB Kewl",
      "Yupin Khamhom Dark Secrets bar Pattaya",
      "Namtan2219 TF 30 Pattaya Bar Girl Buakhao",
      "Saranya Pia No Mona Lisa Bar 26yo Pattaya",
      "Chiwapron TF 21 Chum Phae",
      "Ayoinbtf 18 Pattaya",
      "Ayounggirlfrom TF 18 Pattaya",
      "Pla810 Tf Pali Vivisane 37 Samut Prakan",
      "Piyanuch747 Nuut Tf 40 Kuchinarai right of kalasin",
      "Wanwisa TF 21 Pattaya",
      "Hi, I'm Waew. I'm a trans",
      "Jeabjeab High rollers",
    ].map((name) => normalizeChatName(name)),
  );

  const translationCache = new Map();
  // Tracks processed rows without writing attributes onto the page.
  const rowState = new WeakMap();

  let lastTriggerAt = 0;

  function gmRequest(label, options) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        timeout: 15000,
        ...options,
        onload: (response) => {
          if (response.status < 200 || response.status >= 300) {
            reject(
              new Error(`${label} request failed with status ${response.status}`),
            );
            return;
          }
          try {
            resolve(JSON.parse(response.responseText));
          } catch (error) {
            reject(error);
          }
        },
        ontimeout: () => reject(new Error(`${label} request timed out`)),
        onerror: () => reject(new Error(`${label} request failed`)),
      });
    });
  }

  async function translateWithGoogle(text, targetLanguage) {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", "auto");
    url.searchParams.set("tl", targetLanguage);
    url.searchParams.set("dt", "t");
    url.searchParams.set("q", text);

    const payload = await gmRequest("google translation", {
      method: "GET",
      url: url.toString(),
    });
    const segments =
      Array.isArray(payload) && Array.isArray(payload[0]) ? payload[0] : [];
    const translatedText = segments
      .map((segment) => (Array.isArray(segment) ? segment[0] : ""))
      .join("")
      .trim();

    if (!translatedText) {
      throw new Error("google translation response did not contain text");
    }
    return translatedText;
  }

  async function translateWithLibre(text, targetLanguage) {
    const payload = await gmRequest("libre translation", {
      method: "POST",
      url: "https://translate.argosopentech.com/translate",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ q: text, source: "auto", target: targetLanguage }),
    });
    const translatedText =
      typeof payload.translatedText === "string"
        ? payload.translatedText.trim()
        : "";

    if (!translatedText) {
      throw new Error("libre translation response did not contain text");
    }
    return translatedText;
  }

  async function translateWithMyMemory(text, targetLanguage) {
    const sourceLanguage = containsThaiText(text) ? "th" : "en";
    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", text);
    url.searchParams.set("langpair", `${sourceLanguage}|${targetLanguage}`);

    const payload = await gmRequest("MyMemory translation", {
      method: "GET",
      url: url.toString(),
    });
    const translatedText =
      payload.responseStatus === 200 &&
      typeof payload.responseData?.translatedText === "string"
        ? payload.responseData.translatedText.trim()
        : "";

    if (!translatedText) {
      throw new Error("MyMemory translation response did not contain text");
    }
    return translatedText;
  }

  async function translateText(text, targetLanguage) {
    const cacheKey = `${targetLanguage}:${text}`;
    const cached = translationCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    let translatedText;

    for (let attempt = 1; attempt <= CONFIG.googleMaxAttempts; attempt += 1) {
      try {
        translatedText = await translateWithGoogle(text, targetLanguage);
        break;
      } catch (error) {
        console.warn(`${TAG} Google Translate attempt ${attempt} failed`, error);
      }
    }

    if (!translatedText) {
      try {
        translatedText = await translateWithLibre(text, targetLanguage);
      } catch (libreError) {
        console.warn(
          `${TAG} LibreTranslate failed, falling back to MyMemory`,
          libreError,
        );
        try {
          translatedText = await translateWithMyMemory(text, targetLanguage);
        } catch (myMemoryError) {
          throw new Error(
            `all translation providers failed: ${
              myMemoryError instanceof Error
                ? myMemoryError.message
                : myMemoryError
            }`,
          );
        }
      }
    }

    translationCache.set(cacheKey, translatedText);
    return translatedText;
  }

  function normalizeMessageText(text) {
    return text
      .replace(/\u00a0/g, " ")
      .replace(/\r/g, "")
      .trim();
  }

  function containsThaiText(text) {
    return /[\u0E00-\u0E7F]/.test(text);
  }

  function normalizeChatName(text) {
    return normalizeMessageText(text).replace(/\s+/g, " ").toLocaleLowerCase();
  }

  function getCurrentChatName() {
    const selectors = [
      '#main header [data-testid="conversation-info-header-chat-title"]',
      '#main header h1 span[dir="auto"]',
      "#main header span[title]",
      "#main header h1",
    ];

    for (const selector of selectors) {
      const node = document.querySelector(selector);
      if (!(node instanceof HTMLElement)) {
        continue;
      }
      const text = normalizeMessageText(
        node.innerText || node.getAttribute("title") || "",
      );
      if (text) {
        return text;
      }
    }
    return "";
  }

  function isAllowedChatName(name) {
    return !!name && ALLOWED_CHAT_NAMES.has(normalizeChatName(name));
  }

  function isCurrentChatAllowed() {
    return isAllowedChatName(getCurrentChatName());
  }

  function getIncomingMessageSenderName(messageRow) {
    const copyableText = messageRow.querySelector("[data-pre-plain-text]");
    if (!(copyableText instanceof HTMLElement)) {
      return "";
    }
    const prePlainText = copyableText.dataset.prePlainText || "";
    const senderMatch = prePlainText.match(/\]\s(.+?):\s*$/);
    return senderMatch ? normalizeMessageText(senderMatch[1]) : "";
  }

  function isIncomingMessageAllowed(messageRow) {
    const senderName = getIncomingMessageSenderName(messageRow);
    return senderName ? isAllowedChatName(senderName) : isCurrentChatAllowed();
  }

  function findComposer() {
    const selectors = [
      'footer div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"][role="textbox"][data-tab]',
      'div[contenteditable="true"][data-tab="10"]',
      'div[contenteditable="true"][data-tab="1"]',
      'div[contenteditable="true"][aria-label]',
      'div[contenteditable="true"]',
    ];

    for (const selector of selectors) {
      const composer = Array.from(document.querySelectorAll(selector)).find(
        (node) => {
          if (!(node instanceof HTMLElement)) {
            return false;
          }
          const rect = node.getBoundingClientRect();
          return !!node.closest("footer") && rect.width > 0 && rect.height > 0;
        },
      );
      if (composer) {
        return composer;
      }
    }
    return null;
  }

  function findSendButton() {
    const selectors = [
      'footer button[aria-label="Send"]',
      'footer span[data-icon="send"]',
      'footer [data-testid="send"]',
      'button[aria-label="Send"]',
      'span[data-icon="send"]',
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
    }
    return null;
  }

  function getComposerText(composer) {
    return composer ? normalizeMessageText(composer.innerText).trimEnd() : "";
  }

  function getMessagePrePlainText(node) {
    if (!(node instanceof HTMLElement)) {
      return "";
    }
    if (node.matches("[data-pre-plain-text]")) {
      return node.dataset.prePlainText || "";
    }
    const copyableText = node.querySelector("[data-pre-plain-text]");
    return copyableText instanceof HTMLElement
      ? copyableText.dataset.prePlainText || ""
      : "";
  }

  function findMessageRow(node) {
    if (!(node instanceof HTMLElement)) {
      return null;
    }
    return (
      node.closest('[data-testid="msg-container"]') ||
      node.closest(".message-in") ||
      node.closest(".message-out")
    );
  }

  function isIncomingMessageRow(messageRow) {
    if (!(messageRow instanceof HTMLElement)) {
      return false;
    }
    if (messageRow.matches(".message-in")) {
      return true;
    }
    if (messageRow.matches(".message-out")) {
      return false;
    }
    const prePlainText = getMessagePrePlainText(messageRow);
    return !!prePlainText && !/\]\s*You:\s*$/i.test(prePlainText);
  }

  function getIncomingMessageRows(root) {
    if (!root || typeof root.querySelectorAll !== "function") {
      return [];
    }

    const incomingRows = [];
    const seenRows = new Set();
    const candidates = [];

    if (root instanceof HTMLElement) {
      candidates.push(root);
    }
    candidates.push(
      ...root.querySelectorAll(
        '.message-in, .message-out, [data-testid="msg-container"], [data-pre-plain-text]',
      ),
    );

    candidates.forEach((candidate) => {
      const row = findMessageRow(candidate);
      if (!(row instanceof HTMLElement) || seenRows.has(row)) {
        return;
      }
      seenRows.add(row);
      if (isIncomingMessageRow(row)) {
        incomingRows.push(row);
      }
    });

    return incomingRows;
  }

  function getLastIncomingMessageRow(root = document) {
    const rows = getIncomingMessageRows(root);
    return rows.length > 0 ? rows[rows.length - 1] : null;
  }

  function getIncomingMessageText(messageRow) {
    const selectableTextNodes = Array.from(
      messageRow.querySelectorAll(
        '[data-testid="selectable-text"], span.selectable-text',
      ),
    );

    const combinedText = selectableTextNodes
      .map((node) => normalizeMessageText(node.innerText || ""))
      .filter(Boolean)
      .join("\n")
      .trim();

    if (combinedText) {
      return combinedText;
    }

    // Clone so stripping metadata does not touch the live page.
    const fallbackClone = messageRow.cloneNode(true);
    fallbackClone
      .querySelectorAll('[data-testid="msg-meta"], [aria-hidden="true"]')
      .forEach((node) => node.remove());

    return normalizeMessageText(fallbackClone.innerText || "");
  }

  async function processIncomingMessage(messageRow) {
    if (!(messageRow instanceof HTMLElement)) {
      return;
    }

    const state = rowState.get(messageRow);
    if (state === "pending" || state === "done" || state === "ignored") {
      return;
    }

    if (!isIncomingMessageAllowed(messageRow)) {
      rowState.set(messageRow, "ignored");
      return;
    }

    const originalText = getIncomingMessageText(messageRow);
    if (!originalText || !containsThaiText(originalText)) {
      rowState.set(messageRow, "ignored");
      return;
    }

    rowState.set(messageRow, "pending");

    try {
      const translatedText = await translateText(
        originalText,
        CONFIG.incomingTranslationLanguage,
      );
      rowState.set(messageRow, "done");
      console.log(
        `${TAG} incoming (${CONFIG.incomingTranslationLanguage})\n  original:   ${originalText}`,
      );
      console.log(
        "%ctranslated: %s",
        "color: #4b0082; font-weight: bold",
        translatedText,
      );
    } catch (error) {
      rowState.set(messageRow, "error");
      console.warn(`${TAG} incoming translation failed`, originalText, error);
    }
  }

  function queueIncomingMessageProcessing(root) {
    const rows =
      root instanceof HTMLElement && root.matches(".message-in")
        ? [root]
        : getIncomingMessageRows(root);

    rows.forEach((row) => {
      void processIncomingMessage(row);
    });
  }

  function queueLastIncomingMessageProcessing() {
    const row = getLastIncomingMessageRow(document);
    if (row) {
      void processIncomingMessage(row);
    }
  }

  function observeIncomingMessages() {
    queueIncomingMessageProcessing(document);
    queueLastIncomingMessageProcessing();
    CONFIG.initialIncomingRescanDelaysMs.forEach((delayMs) => {
      window.setTimeout(queueLastIncomingMessageProcessing, delayMs);
    });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            queueIncomingMessageProcessing(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function shouldHandleTrigger() {
    const now = Date.now();
    const delta = now - lastTriggerAt;
    if (delta >= 0 && delta < CONFIG.triggerDedupMs) {
      return false;
    }
    lastTriggerAt = now;
    return true;
  }

  // Reads the draft at send time and logs its translation; the composer is never modified.
  async function translateDraft() {
    const text = getComposerText(findComposer());
    if (text.length < CONFIG.minMessageLength) {
      console.log(`${TAG} outgoing: composer empty or not found`);
      return;
    }

    console.log(`${TAG} outgoing: translating "${text}"`);
    try {
      const translatedText = await translateText(text, CONFIG.targetLanguage);
      console.log(
        "%ctranslated: %s",
        "color: #4b0082; font-weight: bold",
        translatedText,
      );
    } catch (error) {
      console.warn(`${TAG} outgoing translation failed`, text, error);
    }
  }

  function isSendButtonEvent(event) {
    const sendButton = findSendButton();
    return (
      !!sendButton &&
      !!findComposer() &&
      event.target instanceof Node &&
      sendButton.contains(event.target)
    );
  }

  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.key !== "Enter" ||
        event.shiftKey ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
      ) {
        return;
      }

      const composer = findComposer();
      if (!composer || !composer.contains(event.target)) {
        return;
      }

      if (shouldHandleTrigger()) {
        void translateDraft();
      }
    },
    true,
  );

  // pointerdown fires before click; the dedup window prevents a double log.
  ["pointerdown", "click"].forEach((type) => {
    document.addEventListener(
      type,
      (event) => {
        if (isSendButtonEvent(event) && shouldHandleTrigger()) {
          void translateDraft();
        }
      },
      true,
    );
  });

  // Live preview: log the Thai translation shortly after you stop typing.
  let typingTimer = null;
  let lastLoggedDraft = "";
  document.addEventListener(
    "input",
    (event) => {
      const composer = findComposer();
      if (!composer || !composer.contains(event.target)) {
        return;
      }
      window.clearTimeout(typingTimer);
      typingTimer = window.setTimeout(() => {
        const text = getComposerText(findComposer());
        if (text.length < CONFIG.minMessageLength || text === lastLoggedDraft) {
          return;
        }
        lastLoggedDraft = text;
        void translateDraft();
      }, CONFIG.typingDebounceMs);
    },
    true,
  );

  observeIncomingMessages();
  console.log(`${TAG} started and watching WhatsApp Web for messages and drafts`);
})();
