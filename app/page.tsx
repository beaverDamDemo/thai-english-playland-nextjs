// app/map/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/map.module.css';
import { useState, useEffect } from 'react';

const APP_VERSION = '0.0.9';
const HEADER_HEIGHT = 44;

const lessons = [
  { num: 1, color: '#4CAF50', cls: 'location1', enabled: true },
  { num: 2, color: '#2196F3', cls: 'location2', enabled: false },
  { num: 3, color: '#FF9800', cls: 'location3', enabled: false },
  { num: 4, color: '#F44336', cls: 'location4', enabled: false },
  { num: 5, color: '#9C27B0', cls: 'location5', enabled: false },
  { num: 6, color: '#009688', cls: 'location6', enabled: false },
  { num: 7, color: '#E91E63', cls: 'location7', enabled: false },
  { num: 8, color: '#3F51B5', cls: 'location8', enabled: false },
];

export default function MapPage() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      const baseWidth = 1200;
      const baseHeight = 800;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight - HEADER_HEIGHT;

      const scaleByWidth = windowWidth / baseWidth;
      const scaleByHeight = windowHeight / baseHeight;

      const newScale = Math.min(scaleByWidth, scaleByHeight);
      setScale(Math.max(newScale, 0.5));
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#f0f0f0',
      }}
    >
      <header className={styles.pageHeader}>
        <span className={styles.appTitle}>English Lessons Maze</span>
        <span className={styles.appVersion}>Version {APP_VERSION}</span>
      </header>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          overflow: 'auto',
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            width: '1200px',
            height: '800px',
          }}
        >
          <div className={styles.mapContainer}>
            <Image
              src="/assets/tinified/map-with-8-clickable-locations.png"
              alt="Game Map"
              fill
              priority
            />
            {lessons.map(({ num, color, cls, enabled }) =>
              enabled ? (
                <Link
                  key={num}
                  href={`/maze/lesson${num}`}
                  className={`${styles[cls]} ${styles.locationPin}`}
                  style={{ borderColor: color }}
                >
                  {num}
                </Link>
              ) : (
                <div
                  key={num}
                  className={`${styles[cls]} ${styles.locationPin} ${styles.locationLocked}`}
                >
                  🔒
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
