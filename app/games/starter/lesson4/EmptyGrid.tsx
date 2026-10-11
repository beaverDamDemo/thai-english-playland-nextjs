import Image from 'next/image';
import Link from 'next/link';
import lessonHeaderStyles from '../lesson1/ColorsSvgViewer.module.css';
import styles from './EmptyGrid.module.css';

const GRID_CELLS = Array.from({ length: 64 }, (_, index) => index);

export default function EmptyGrid() {
  return (
    <main className={styles.page}>
      <header className={lessonHeaderStyles.header}>
        <Link href="/games/starter" className={lessonHeaderStyles.back}>
          <Image
            src="/assets/tinified/back.png"
            alt="Back"
            width={34}
            height={34}
          />
        </Link>
        <h1 className={styles.headerTitle}>Empty Grid</h1>
        <span className={styles.lessonTag}>LESSON 4</span>
      </header>

      <section className={styles.workspace} aria-label="Lesson grid">
        <p className={styles.gridLabel}>8 x 8</p>
        <div className={styles.grid} role="img" aria-label="Empty 8 by 8 grid">
          {GRID_CELLS.map((cell) => (
            <span className={styles.cell} aria-hidden="true" key={cell} />
          ))}
        </div>
      </section>
    </main>
  );
}
