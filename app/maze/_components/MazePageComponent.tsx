'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import * as Phaser from 'phaser';
import MazeHeader from './MazeHeader';
import dynamic from 'next/dynamic';
import type { FC, MouseEvent } from 'react';

const TOTAL_LESSONS = 9;

interface MazePageProps {
  MazeScene: Phaser.Types.Scenes.SceneType;
  Quiz: React.ComponentType<Record<string, unknown>>;
  lessonNumber: number;
  lessonTitle: string;
  themeColor: string;
  themeColorDark: string;
  backgroundGradient: string;
  columns?: number;
  showWinScreen?: boolean;
  totalLessons?: number;
  statsKey?: string;
  unlockedKey?: string;
  pendingUnlockKey?: string;
  backHref?: string;
  returnHref?: string;
  returnLabel?: string;
}

const MazePageComponent: FC<MazePageProps> = ({
  MazeScene,
  Quiz,
  lessonNumber,
  themeColor,
  themeColorDark,
  backgroundGradient,
  columns = 21,
  showWinScreen = true,
  totalLessons = TOTAL_LESSONS,
  statsKey = 'englishMazeStats',
  backHref = '/maze',
  returnHref = '/maze',
  returnLabel = 'Return to Map',
}) => {
  const [score, setScore] = useState(0);
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
  const mobileWidth = 504;

  // Calculate height dynamically based on columns
  const tileSize = mobileWidth / columns;
  const mazeHeight = 21 * tileSize;
  const buttonsSpace = columns < 19 ? 250 : 200;
  const mobileHeight = mazeHeight + buttonsSpace;
  const desktopHeight = Math.max(800, mazeHeight + buttonsSpace);

  const gameMode = statsKey === 'englishCasinoStats' ? 'casino' : 'maze';

  const saveStats = (next: {
    correctAnswers: number;
    wrongAnswers: number;
    quizAttempts: number;
    totalMovesEarned: number;
    unlockedLessons?: number;
  }) => {
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game_mode: gameMode,
        correct_answers: next.correctAnswers,
        wrong_answers: next.wrongAnswers,
        quiz_attempts: next.quizAttempts,
        total_moves_earned: next.totalMovesEarned,
        unlocked_lessons: next.unlockedLessons ?? unlockedLessons,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok) {
          console.error('Failed to save stats:', data.error);
        }
      })
      .catch((err) => {
        console.error('Error saving stats:', err);
      });
  };

  const handleQuizComplete = (finalScore: number, totalQuestions: number) => {
    setMaxMoves(finalScore);
    setScore(finalScore);
    const wrongCount = Math.max(0, totalQuestions - finalScore);
    const nextCorrect = correctAnswers + finalScore;
    const nextWrong = wrongAnswers + wrongCount;
    const nextAttempts = quizAttempts + totalQuestions;
    const nextMovesEarned = totalMovesEarned + finalScore;

    setCorrectAnswers(nextCorrect);
    setWrongAnswers(nextWrong);
    setQuizAttempts(nextAttempts);
    setTotalMovesEarned(nextMovesEarned);
    setLastQuizResult(finalScore > 0 ? 'Correct' : 'Wrong');
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
    const nextUnlockedLessons = Math.min(
      totalLessons,
      Math.max(unlockedLessons, lessonNumber + 1),
    );
    setUnlockedLessons(nextUnlockedLessons);
    saveStats({
      correctAnswers,
      wrongAnswers,
      quizAttempts,
      totalMovesEarned,
      unlockedLessons: nextUnlockedLessons,
    });

    setGameWon(true);
  };

  useEffect(() => {
    fetch('/api/progress')
      .then((r) => r.json())
      .then(
        (data: {
          ok?: boolean;
          progress?: Record<
            string,
            {
              unlocked_lessons: number;
              correct_answers: number;
              wrong_answers: number;
              quiz_attempts: number;
              total_moves_earned: number;
            }
          >;
        }) => {
          if (!data.ok || !data.progress) return;
          const mode = statsKey === 'englishCasinoStats' ? 'casino' : 'maze';
          const p = data.progress[mode];
          if (!p) return;
          setCorrectAnswers(p.correct_answers);
          setWrongAnswers(p.wrong_answers);
          setQuizAttempts(p.quiz_attempts);
          setTotalMovesEarned(p.total_moves_earned);
          setUnlockedLessons(
            Math.min(totalLessons, Math.max(1, p.unlocked_lessons)),
          );
        },
      )
      .catch(() => null);
  }, [statsKey, totalLessons]);

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
  }, [desktopHeight, mobileHeight]);

  // Initialize the Phaser game on mount so the maze is visible behind the quiz.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 504,
      height: mobileHeight,
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
    game.registry.set('themeColor', themeColor);

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

  if (gameWon && showWinScreen) {
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
          <MazeHeader score={score} backHref={backHref} />
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
                {gameMode === 'casino'
                  ? 'You successfully completed the lesson!'
                  : 'You successfully completed the maze!'}
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
              <Link
                href={returnHref}
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
                {returnLabel}
              </Link>
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
              Unlocked Lessons: {unlockedLessons}/{totalLessons}
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
        <MazeHeader score={score} backHref={backHref} />

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

          {gameWon && !showWinScreen && (
            <div
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                zIndex: 1100,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '10px',
              }}
            >
              <span
                style={{
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '14px',
                  textShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
                }}
              >
                Lesson complete!
              </span>
              <Link
                href={returnHref}
                style={{
                  display: 'inline-block',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  backgroundColor: themeColor,
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
              >
                {returnLabel}
              </Link>
            </div>
          )}

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
                  width: '100%',
                  maxWidth: '520px',
                  minWidth: '0',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                  border: `3px solid ${themeColor}`,
                  boxSizing: 'border-box',
                }}
              >
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
