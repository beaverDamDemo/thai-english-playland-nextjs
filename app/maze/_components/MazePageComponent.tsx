'use client';

import { useEffect, useState, useRef } from 'react';
import * as Phaser from 'phaser';
import MazeHeader from './MazeHeader';
import dynamic from 'next/dynamic';
import type { FC, MouseEvent } from 'react';

const TOTAL_LESSONS = 8;
const STATS_KEY = 'englishMazeStats';
const UNLOCKED_KEY = 'englishMazeUnlockedLessons';
const PENDING_UNLOCK_KEY = 'englishMazePendingUnlockLesson';

interface MazePageProps {
  MazeScene: Phaser.Types.Scenes.SceneType;
  Quiz: React.ComponentType<Record<string, unknown>>;
  lessonNumber: number;
  lessonTitle: string;
  themeColor: string;
  themeColorDark: string;
  backgroundGradient: string;
}

const MazePageComponent: FC<MazePageProps> = ({
  MazeScene,
  Quiz,
  lessonNumber,
  themeColor,
  themeColorDark,
  backgroundGradient,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [score, setScore] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [quizComplete, setQuizComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [totalMovesEarned, setTotalMovesEarned] = useState(0);
  const [unlockedLessons, setUnlockedLessons] = useState(1);
  const [lastQuizResult, setLastQuizResult] = useState<
    'Correct' | 'Wrong' | 'N/A'
  >('N/A');
  const [maxMoves, setMaxMoves] = useState(0);
  const [showQuizOverlay, setShowQuizOverlay] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [scale, setScale] = useState(1);
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);
  const gameRef = useRef<Phaser.Game | null>(null);

  const desktopWidth = 1200;
  const desktopHeight = 800;
  const mobileWidth = 504;
  const mobileHeight = 800;

  const saveStats = (next: {
    correctAnswers: number;
    wrongAnswers: number;
    quizAttempts: number;
    totalMovesEarned: number;
  }) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      STATS_KEY,
      JSON.stringify({
        correctAnswers: next.correctAnswers,
        wrongAnswers: next.wrongAnswers,
        quizAttempts: next.quizAttempts,
        totalMovesEarned: next.totalMovesEarned,
      }),
    );
  };

  const handleQuizComplete = (finalScore: number) => {
    setMaxMoves(finalScore);
    setScore(finalScore);
    setQuizComplete(true);
    const wasCorrect = finalScore > 0;
    const nextCorrect = correctAnswers + (wasCorrect ? 1 : 0);
    const nextWrong = wrongAnswers + (wasCorrect ? 0 : 1);
    const nextAttempts = quizAttempts + 1;
    const nextMovesEarned = totalMovesEarned + finalScore;

    setCorrectAnswers(nextCorrect);
    setWrongAnswers(nextWrong);
    setQuizAttempts(nextAttempts);
    setTotalMovesEarned(nextMovesEarned);
    setLastQuizResult(wasCorrect ? 'Correct' : 'Wrong');
    saveStats({
      correctAnswers: nextCorrect,
      wrongAnswers: nextWrong,
      quizAttempts: nextAttempts,
      totalMovesEarned: nextMovesEarned,
    });

    // fade out the overlay, then unmount it
    setOverlayVisible(false);
    setTimeout(() => setShowQuizOverlay(false), 300);
    // Add moves to the existing scene instead of reloading
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene(
        'MazeScene',
      ) as Phaser.Scene & {
        addMoreMovesToScene?: (n: number) => void;
        events?: Phaser.Events.EventEmitter;
      };
      if (scene && scene.addMoreMovesToScene) {
        scene.addMoreMovesToScene(finalScore);
      }
    }
  };

  const handleNoMoves = () => {
    setShowQuizOverlay(true);
    // mount then fade in
    setTimeout(() => setOverlayVisible(true), 20);
  };

  const handleWin = () => {
    const persistedUnlocked =
      typeof window !== 'undefined'
        ? Number.parseInt(window.localStorage.getItem(UNLOCKED_KEY) ?? '1', 10)
        : 1;
    const safePersistedUnlocked = Number.isFinite(persistedUnlocked)
      ? Math.min(TOTAL_LESSONS, Math.max(1, persistedUnlocked))
      : 1;
    const nextUnlockedLessons = Math.min(
      TOTAL_LESSONS,
      Math.max(safePersistedUnlocked, lessonNumber + 1),
    );
    setUnlockedLessons(nextUnlockedLessons);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(UNLOCKED_KEY, String(nextUnlockedLessons));
      if (nextUnlockedLessons > safePersistedUnlocked) {
        window.localStorage.setItem(
          PENDING_UNLOCK_KEY,
          String(nextUnlockedLessons),
        );
      } else {
        window.localStorage.removeItem(PENDING_UNLOCK_KEY);
      }
    }
    setGameWon(true);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rawStats = window.localStorage.getItem(STATS_KEY);
    if (rawStats) {
      try {
        const parsed = JSON.parse(rawStats) as {
          correctAnswers?: number;
          wrongAnswers?: number;
          quizAttempts?: number;
          totalMovesEarned?: number;
        };

        setCorrectAnswers(parsed.correctAnswers ?? 0);
        setWrongAnswers(parsed.wrongAnswers ?? 0);
        setQuizAttempts(parsed.quizAttempts ?? 0);
        setTotalMovesEarned(parsed.totalMovesEarned ?? 0);
      } catch {
        // ignore malformed local storage values
      }
    }

    const rawUnlocked = window.localStorage.getItem(UNLOCKED_KEY);
    const parsedUnlocked = Number.parseInt(rawUnlocked ?? '1', 10);
    setUnlockedLessons(
      Number.isFinite(parsedUnlocked)
        ? Math.min(TOTAL_LESSONS, Math.max(1, parsedUnlocked))
        : 1,
    );
  }, []);

  // Calculate scale to fit content to screen
  useEffect(() => {
    const calculateScale = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const isPortraitPhone = windowWidth <= 768 && windowHeight > windowWidth;

      setIsMobilePortrait(isPortraitPhone);

      const baseWidth = isPortraitPhone ? mobileWidth : desktopWidth;
      const baseHeight = isPortraitPhone ? mobileHeight : desktopHeight;

      const scaleByWidth = windowWidth / baseWidth;
      const scaleByHeight = windowHeight / baseHeight;

      const newScale = isPortraitPhone
        ? scaleByWidth
        : Math.min(scaleByWidth, scaleByHeight);
      setScale(Math.max(newScale, 0.5));
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // Initialize the Phaser game on mount so the maze is visible behind the quiz.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 504,
      height: 720,
      backgroundColor: '#228B22',
      scene: MazeScene,
      parent: 'game',
      physics: { default: 'arcade', arcade: { debug: false } },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;
    // Set initial registry values and callbacks
    game.registry.set('maxMoves', maxMoves);
    game.registry.set('onNoMoves', handleNoMoves);
    game.registry.set('onWin', handleWin);

    // When the scene has been created, show the quiz overlay after 0.5s
    // so the maze is visible briefly before the quiz fades in.
    const tryShowOverlay = () => {
      // Wait 500ms showing the maze, then mount the overlay and fade it in
      setTimeout(() => {
        setShowQuizOverlay(true);
        // next tick: trigger CSS fade-in
        setTimeout(() => setOverlayVisible(true), 20);
      }, 500);
    };

    // If the scene is available, listen for its 'create' event; otherwise fall back to a short delay.
    try {
      const scene = game.scene.getScene('MazeScene') as Phaser.Scene & {
        events?: Phaser.Events.EventEmitter;
      };
      if (scene && scene.events && typeof scene.events.once === 'function') {
        (scene.events as Phaser.Events.EventEmitter).once(
          'create',
          tryShowOverlay,
        );
      } else {
        tryShowOverlay();
      }
    } catch {
      tryShowOverlay();
    }

    return () => {
      // Clean up game on unmount or when the component is torn down
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep registry's maxMoves in sync when it changes (useful if scene reads it).
  useEffect(() => {
    if (gameRef.current) {
      try {
        gameRef.current.registry.set('maxMoves', maxMoves);
      } catch {
        // ignore
      }
    }
  }, [maxMoves]);

  if (gameWon) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100vw',
          height: '100vh',
          overflow: 'auto',
          backgroundColor: '#f0f0f0',
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            display: 'flex',
            flexDirection: 'column',
            width: `${isMobilePortrait ? mobileWidth : desktopWidth}px`,
            height: `${isMobilePortrait ? mobileHeight : desktopHeight}px`,
          }}
        >
          <MazeHeader score={score} />
          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px',
              flexDirection: 'column',
              background: backgroundGradient,
            }}
          >
            <div
              style={{
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                padding: '50px 40px',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                border: `3px solid ${themeColor}`,
                maxWidth: '500px',
              }}
            >
              <h1
                style={{
                  fontSize: '48px',
                  color: themeColor,
                  margin: '0 0 20px 0',
                }}
              >
                🎉 Congratulations! 🎉
              </h1>
              <p style={{ fontSize: '20px', color: '#333', margin: '10px 0' }}>
                You successfully completed the maze!
              </p>
              <p
                style={{
                  fontSize: '16px',
                  color: '#666',
                  margin: '20px 0 30px 0',
                }}
              >
                Great job navigating through the challenges. You&apos;re making
                excellent progress in mastering English!
              </p>
              <a
                href="/"
                style={{
                  display: 'inline-block',
                  padding: '15px 40px',
                  backgroundColor: themeColor,
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                }}
                onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.backgroundColor = themeColorDark;
                  el.style.transform = 'translateY(-2px)';
                  el.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.backgroundColor = themeColor;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
              >
                Return to Map
              </a>
            </div>
          </div>
          <footer
            style={{
              backgroundColor: '#1c1c1c',
              color: '#e8e8e8',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              fontSize: '13px',
              borderTop: `3px solid ${themeColor}`,
              flexWrap: 'wrap',
            }}
          >
            <span>Correct: {correctAnswers}</span>
            <span>Wrong: {wrongAnswers}</span>
            <span>
              Unlocked Lessons: {unlockedLessons}/{TOTAL_LESSONS}
            </span>
            <span>Quiz Attempts: {quizAttempts}</span>
            <span>Player Status: Winner</span>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: isMobilePortrait ? 'flex-start' : 'center',
        width: '100vw',
        height: '100vh',
        overflow: 'auto',
        backgroundColor: '#f0f0f0',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          display: 'flex',
          flexDirection: 'column',
          width: `${isMobilePortrait ? mobileWidth : desktopWidth}px`,
          height: `${isMobilePortrait ? mobileHeight : desktopHeight}px`,
          position: 'relative',
        }}
      >
        <MazeHeader score={score} />

        <div style={{ flex: 1, position: 'relative' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}
          >
            <div id="game"></div>
          </div>

          {/* Quiz Overlay */}
          {showQuizOverlay && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                padding: '20px',
                backdropFilter: 'blur(4px)',
                // Fade via opacity transition controlled by overlayVisible
                opacity: overlayVisible ? 1 : 0,
                transition: 'opacity 300ms ease',
                pointerEvents: overlayVisible ? 'auto' : 'none',
              }}
            >
              <div
                style={{
                  backgroundColor: 'white',
                  padding: '35px',
                  borderRadius: '16px',
                  maxWidth: '520px',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                  border: `3px solid ${themeColor}`,
                }}
              >
                <h2
                  style={{
                    marginTop: 0,
                    marginBottom: '10px',
                    color: themeColor,
                    fontSize: '28px',
                    fontWeight: 'bold',
                  }}
                >
                  Complete the Quiz
                </h2>
                <p
                  style={{
                    color: '#666',
                    marginBottom: '25px',
                    fontSize: '15px',
                    lineHeight: '1.5',
                  }}
                >
                  Answer 1 question to earn more moves and continue Lesson{' '}
                  {lessonNumber}.
                </p>
                <Quiz
                  onComplete={handleQuizComplete}
                  primaryColor={themeColor}
                />
              </div>
            </div>
          )}
        </div>
        <footer
          style={{
            backgroundColor: '#1c1c1c',
            color: '#e8e8e8',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            fontSize: '13px',
            borderTop: `3px solid ${themeColor}`,
            flexWrap: 'wrap',
          }}
        >
          <span>Correct: {correctAnswers}</span>
          <span>Wrong: {wrongAnswers}</span>
          <span>
            Unlocked Lessons: {unlockedLessons}/{TOTAL_LESSONS}
          </span>
          <span>Total Moves Earned: {totalMovesEarned}</span>
          <span>Last Quiz: {lastQuizResult}</span>
        </footer>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(MazePageComponent), {
  ssr: false,
});
