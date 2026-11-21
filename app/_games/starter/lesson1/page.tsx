'use client';
import dynamic from 'next/dynamic';

const ColorsSvgViewer = dynamic(() => import('./ColorsSvgViewer'), { ssr: false });

export default function Page() {
  return <ColorsSvgViewer />;
}
