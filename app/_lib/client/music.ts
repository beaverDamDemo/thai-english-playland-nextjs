// Add new songs to /public/assets/audio and list them here.
export const MUSIC_TRACKS = [
  '/assets/audio/pixel-learning-1.mp3',
  '/assets/audio/pixel-learning-2.mp3',
];

const MUSIC_KEY = 'playland-music';
const MUSIC_VOLUME = 0.4;

let audio: HTMLAudioElement | null = null;
let enabled = false;
let inLesson = false;
let initialized = false;
let queue: string[] = [];
let lastTrack: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function shuffle(tracks: string[]): string[] {
  const copy = [...tracks];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Plays every song once in random order, then reshuffles without
// repeating the song that just finished.
function nextTrack(): string {
  if (queue.length === 0) {
    queue = shuffle(MUSIC_TRACKS);
    if (queue.length > 1 && queue[0] === lastTrack) {
      queue.push(queue.shift() as string);
    }
  }
  lastTrack = queue.shift() as string;
  return lastTrack;
}

function shouldPlay() {
  return enabled && inLesson;
}

function startNext() {
  if (!audio || MUSIC_TRACKS.length === 0) return;
  audio.src = nextTrack();
  void audio.play().catch(() => waitForGesture());
}

// Browsers block autoplay until the user interacts with the page.
function waitForGesture() {
  const resume = () => {
    if (shouldPlay() && audio?.paused) void audio.play().catch(() => {});
  };
  window.addEventListener('pointerdown', resume, { once: true });
  window.addEventListener('keydown', resume, { once: true });
}

// Starts or pauses playback so it matches the toggle and the current page.
function sync() {
  if (!audio) return;
  if (shouldPlay()) {
    if (!audio.paused) return;
    if (audio.src) void audio.play().catch(() => waitForGesture());
    else startNext();
  } else {
    audio.pause();
  }
}

export function initMusic() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  audio = new Audio();
  audio.volume = MUSIC_VOLUME;
  audio.addEventListener('ended', startNext);

  enabled = window.localStorage.getItem(MUSIC_KEY) === 'on';
  sync();
  emit();
}

export function setMusicEnabled(next: boolean) {
  initMusic();
  enabled = next;
  window.localStorage.setItem(MUSIC_KEY, next ? 'on' : 'off');
  sync();
  emit();
}

// Music only plays while the user is inside a lesson.
export function setInLesson(next: boolean) {
  initMusic();
  inLesson = next;
  sync();
}

export function subscribeMusic(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getMusicEnabled() {
  return enabled;
}
