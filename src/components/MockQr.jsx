import { useMemo } from 'react';

const GRID = 25;
const FINDERS = [
  [0, 0],
  [GRID - 7, 0],
  [0, GRID - 7],
];

const inFinderArea = (x, y) =>
  FINDERS.some(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7);

const drawFinder = (grid, fx, fy) => {
  for (let y = 0; y < 7; y += 1) {
    for (let x = 0; x < 7; x += 1) {
      const edge = x === 0 || y === 0 || x === 6 || y === 6;
      const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
      grid[fy + y][fx + x] = edge || core;
    }
  }
};

// 演示用取票二维码：由订单号确定生成，不可真实扫描。
export default function MockQr({ value = '', className = '' }) {
  const modules = useMemo(() => {
    let seed = 0;
    for (let i = 0; i < value.length; i += 1) {
      seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
    }
    const rand = () => {
      seed = (seed * 1103515245 + 12345) >>> 0;
      return seed / 4294967296;
    };
    const grid = Array.from({ length: GRID }, () => Array(GRID).fill(false));
    for (let y = 0; y < GRID; y += 1) {
      for (let x = 0; x < GRID; x += 1) {
        if (inFinderArea(x, y)) continue;
        grid[y][x] = rand() > 0.52;
      }
    }
    FINDERS.forEach(([fx, fy]) => drawFinder(grid, fx, fy));
    return grid;
  }, [value]);

  return (
    <svg
      viewBox={`0 0 ${GRID} ${GRID}`}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Ticket QR code"
    >
      {modules.map((row, y) =>
        row.map((on, x) =>
          on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" /> : null,
        ),
      )}
    </svg>
  );
}