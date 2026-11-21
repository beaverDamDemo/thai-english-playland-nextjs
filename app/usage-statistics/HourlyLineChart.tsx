'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './usageStatistics.module.css';

type Props = {
  /** Exactly 24 values, index = hour of day (0–23). */
  counts: number[];
  ariaLabel: string;
};

const HEIGHT = 240;
// Top padding leaves room for the "Peak" label above the highest point.
const PAD = { top: 28, right: 12, bottom: 28, left: 28 };

function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

/**
 * Single-series line chart of activity per hour of day, with a crosshair
 * tooltip on hover/focus. Y-axis uses whole-number ticks and reaches at
 * least 3 so very small counts don't look like spikes.
 */
export default function HourlyLineChart({ counts, ariaLabel }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const maxCount = Math.max(0, ...counts);
  const step = maxCount <= 5 ? 1 : Math.ceil(maxCount / 4);
  const yMax = Math.max(3, Math.ceil(maxCount / step) * step);
  const ticks = Array.from({ length: Math.floor(yMax / step) + 1 }, (_, i) => i * step);

  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (hour: number) => PAD.left + (hour / 23) * plotW;
  const y = (value: number) => PAD.top + plotH - (value / yMax) * plotH;
  const slot = plotW / 23;

  const linePath = counts.map((c, h) => `${h === 0 ? 'M' : 'L'}${x(h).toFixed(1)},${y(c).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${x(23).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const peak = maxCount > 0 ? counts.indexOf(maxCount) : -1;
  const xTickEvery = width < 480 ? 6 : 3;

  const tooltipHour = active;
  const tooltipLeft = tooltipHour === null ? 0 : Math.min(Math.max(x(tooltipHour), 60), width - 60);

  return (
    <div ref={wrapRef} className={styles.lineChart}>
      <svg
        width={width}
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        role="img"
        aria-label={ariaLabel}
        tabIndex={0}
        onMouseLeave={() => setActive(null)}
        onBlur={() => setActive(null)}
        onFocus={() => setActive((h) => h ?? (peak >= 0 ? peak : 0))}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') setActive((h) => Math.min(23, (h ?? -1) + 1));
          else if (event.key === 'ArrowLeft') setActive((h) => Math.max(0, (h ?? 24) - 1));
          else return;
          event.preventDefault();
        }}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              className={tick === 0 ? styles.lineChartBaseline : styles.lineChartGridLine}
            />
            <text x={PAD.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className={styles.lineChartAxisText}>
              {tick}
            </text>
          </g>
        ))}

        {counts.map((_, hour) =>
          hour % xTickEvery === 0 || hour === 23 ? (
            <text key={hour} x={x(hour)} y={HEIGHT - 8} textAnchor="middle" className={styles.lineChartAxisText}>
              {hourLabel(hour)}
            </text>
          ) : null,
        )}

        <path d={areaPath} className={styles.lineChartArea} />
        <path d={linePath} className={styles.lineChartLine} />

        {tooltipHour !== null && (
          <line
            x1={x(tooltipHour)}
            x2={x(tooltipHour)}
            y1={PAD.top}
            y2={PAD.top + plotH}
            className={styles.lineChartCrosshair}
          />
        )}

        {counts.map((count, hour) =>
          count > 0 || hour === tooltipHour ? (
            <circle
              key={hour}
              cx={x(hour)}
              cy={y(count)}
              r={hour === tooltipHour ? 5.5 : 4}
              className={styles.lineChartPoint}
            />
          ) : null,
        )}

        {peak >= 0 && tooltipHour === null && (
          <text x={x(peak)} y={y(maxCount) - 10} textAnchor="middle" className={styles.lineChartPeakText}>
            Peak {hourLabel(peak)}
          </text>
        )}

        {/* Hit targets: one full-height column per hour, wider than the marks. */}
        {counts.map((_, hour) => (
          <rect
            key={hour}
            x={x(hour) - slot / 2}
            y={PAD.top}
            width={slot}
            height={plotH}
            fill="transparent"
            onMouseEnter={() => setActive(hour)}
          />
        ))}
      </svg>

      {tooltipHour !== null && (
        <div className={styles.lineChartTooltip} style={{ left: tooltipLeft, top: Math.max(y(counts[tooltipHour]) - 52, 0) }} aria-hidden="true">
          <strong>{hourLabel(tooltipHour)}–{hourLabel((tooltipHour + 1) % 24)}</strong>
          <span>
            {counts[tooltipHour]} {counts[tooltipHour] === 1 ? 'progress record' : 'progress records'}
          </span>
        </div>
      )}

      <table className={styles.srOnly}>
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Hour</th>
            <th scope="col">Progress records</th>
          </tr>
        </thead>
        <tbody>
          {counts.map((count, hour) => (
            <tr key={hour}>
              <th scope="row">{hourLabel(hour)}</th>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
