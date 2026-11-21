import type { NextConfig } from 'next';

// Old /games/... URLs (bookmarks, links shared before the /zones rename).
// Specific lesson URLs come first; legacy hub catch-alls last.
const legacyGameRedirects: Array<{ source: string; destination: string }> = [
  { source: '/games/verbs-communication/lesson3', destination: '/zones/pattaya/lesson-3' },
  { source: '/games/pattaya-games/lesson2', destination: '/zones/chiang-mai/lesson-5' },
  { source: '/games/basic-grammar/lesson1', destination: '/zones/the-golden-baht-casino/lesson-1' },
  { source: '/games/basic-grammar/lesson2', destination: '/zones/the-golden-baht-casino/lesson-2' },
  { source: '/games/pattaya-games/lesson3', destination: '/zones/pattaya/lesson-1' },
  { source: '/games/pattaya-games/lesson1', destination: '/zones/pattaya/lesson-2' },
  { source: '/games/everyday-vocabulary', destination: '/zones/chiang-mai' },
  { source: '/games/verbs-communication', destination: '/zones/pattaya' },
  { source: '/games/building-sentences', destination: '/zones/phuket' },
  { source: '/games/starter/lesson1', destination: '/zones/starter/lesson-1' },
  { source: '/games/starter/lesson2', destination: '/zones/starter/lesson-2' },
  { source: '/games/starter/lesson3', destination: '/zones/starter/lesson-3' },
  { source: '/games/starter/lesson4', destination: '/zones/starter/lesson-6' },
  { source: '/games/starter/lesson6', destination: '/zones/chiang-mai/lesson-1' },
  { source: '/games/starter/lesson5', destination: '/zones/chiang-mai/lesson-2' },
  { source: '/games/starter/lesson7', destination: '/zones/chiang-mai/lesson-3' },
  { source: '/games/casino/lesson1', destination: '/zones/the-golden-baht-casino/lesson-3' },
  { source: '/games/casino/lesson2', destination: '/zones/the-golden-baht-casino/lesson-4' },
  { source: '/games/casino/lesson3', destination: '/zones/the-golden-baht-casino/lesson-5' },
  { source: '/games/casino/lesson4', destination: '/zones/the-golden-baht-casino/lesson-6' },
  { source: '/games/basic-grammar', destination: '/zones/the-golden-baht-casino' },
  { source: '/games/maze/lesson2', destination: '/zones/chiang-mai/lesson-4' },
  { source: '/games/maze/lesson1', destination: '/zones/chiang-mai/lesson-6' },
  { source: '/games/maze/lesson9', destination: '/zones/phuket/lesson-1' },
  { source: '/games/maze/lesson5', destination: '/zones/phuket/lesson-3' },
  { source: '/games/maze/lesson6', destination: '/zones/phuket/lesson-4' },
  { source: '/games/maze/lesson7', destination: '/zones/phuket/lesson-5' },
  { source: '/games/maze/lesson8', destination: '/zones/phuket/lesson-6' },
  { source: '/games/starter', destination: '/zones/starter' },
  { source: '/games/maze/:path*', destination: '/zones/chiang-mai' },
  { source: '/games/casino/:path*', destination: '/zones/the-golden-baht-casino' },
  { source: '/games/pattaya-games/:path*', destination: '/zones/pattaya' },
  { source: '/games/starter/lesson/:number', destination: '/zones/starter/lesson-:number' },
  { source: '/games/everyday-vocabulary/lesson/:number', destination: '/zones/chiang-mai/lesson-:number' },
  { source: '/games/basic-grammar/lesson/:number', destination: '/zones/the-golden-baht-casino/lesson-:number' },
  { source: '/games/building-sentences/lesson/:number', destination: '/zones/phuket/lesson-:number' },
  { source: '/games/verbs-communication/lesson/:number', destination: '/zones/pattaya/lesson-:number' },
  { source: '/games', destination: '/' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return legacyGameRedirects.map((redirect) => ({ ...redirect, permanent: true }));
  },
  env: {
    // Evaluated once when the build (or dev server) starts.
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
