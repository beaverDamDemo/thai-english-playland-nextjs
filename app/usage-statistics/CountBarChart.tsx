import styles from './usageStatistics.module.css';

export type CountBarItem = {
  key: string;
  label: string;
  ariaLabel: string;
  count: number;
};

type Props = {
  items: CountBarItem[];
  ariaLabel: string;
  /** Show every Nth x-axis label (the last bar is always labelled). */
  labelEvery?: number;
  /** Highlight the last bar (e.g. "today" / "this week"). */
  highlightLast?: boolean;
};

/**
 * Bar chart tuned for small whole-number counts (0, 1, 2 ...).
 * The y-axis always reaches at least 3 so a single sign-up does not look
 * like a spike, and tick marks are whole numbers only.
 */
export default function CountBarChart({ items, ariaLabel, labelEvery = 1, highlightLast = false }: Props) {
  const maxCount = Math.max(0, ...items.map((item) => item.count));
  const step = maxCount <= 5 ? 1 : Math.ceil(maxCount / 4);
  const yMax = Math.max(3, Math.ceil(maxCount / step) * step);
  const ticks = Array.from({ length: Math.floor(yMax / step) + 1 }, (_, i) => yMax - i * step);

  return (
    <div className={styles.countChart}>
      <div className={styles.countChartAxis} aria-hidden="true">
        {ticks.map((tick) => (
          <span key={tick} style={{ bottom: `${(tick / yMax) * 100}%` }}>
            {tick}
          </span>
        ))}
      </div>
      <div className={styles.countChartPlot}>
        <div className={styles.countChartGrid} aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick} style={{ bottom: `${(tick / yMax) * 100}%` }} />
          ))}
        </div>
        <ul className={styles.countChartBars} aria-label={ariaLabel}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            // Skip regular labels that would crowd the always-shown last label.
            const showLabel =
              isLast || (index % labelEvery === 0 && items.length - 1 - index >= Math.ceil(labelEvery / 2));
            return (
              <li
                key={item.key}
                className={`${styles.countChartColumn} ${highlightLast && isLast ? styles.countChartColumnCurrent : ''}`}
                aria-label={item.ariaLabel}
                title={item.ariaLabel}
              >
                <div className={styles.countChartTrack}>
                  {item.count > 0 ? (
                    <div className={styles.countChartBar} style={{ height: `${(item.count / yMax) * 100}%` }}>
                      <span className={styles.countChartValue}>{item.count}</span>
                    </div>
                  ) : (
                    <div className={styles.countChartZero} />
                  )}
                </div>
                <span className={styles.countChartLabel} aria-hidden="true">
                  {showLabel ? item.label : ''}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
