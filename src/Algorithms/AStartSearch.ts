import { Position, DIRECTIONS, GRID_SIZE } from "../Models/AlgorithmsModels";

interface AStarResult {
  path: Position[];
  metrics: {
    expandedNodes: number;
    treeDepth: number;
    computationTime: number;
    totalCost: number;
  };
}

interface AStarNode {
  pos: Position;
  path: Position[];
  packagesCollected: boolean[][];
  collectedCount: number;
  g: number;
  f: number;
}

export function AStarSearch(
  grid: number[][],
  start: Position,
  totalPackages: number
): AStarResult | null {

  const initialCollected = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false)
  );

  const open: AStarNode[] = [{
    pos: start,
    path: [start],
    packagesCollected: initialCollected,
    collectedCount: 0,
    g: 0,
    f: heuristic(start, grid)
  }];
  
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}|0`);

  let expandedNodes = 0;
  let treeDepth = 0;
  const startTime = performance.now();

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!;

    expandedNodes++;
    treeDepth = Math.max(treeDepth, current.path.length);

    if (current.collectedCount === totalPackages) {
      const endTime = performance.now();
      const computationTime = endTime - startTime;
      return {
        path: current.path,
        metrics: {
          expandedNodes,
          treeDepth,
          computationTime,
          totalCost: current.g
        }
      };
    }

    for (const { dx, dy } of DIRECTIONS) {
      const newX = current.pos.x + dx;
      const newY = current.pos.y + dy;

      if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) continue;
      if (grid[newY][newX] === 1) continue;

      const newPos: Position = { x: newX, y: newY };
      const newCollected = cloneCollectedMatrix(current.packagesCollected);
      let newCount = current.collectedCount;

      if (grid[newY][newX] === 4 && !newCollected[newY][newX]) {
        newCollected[newY][newX] = true;
        newCount++;
      }

      const visitedKey = `${newX},${newY}|${newCount}`;
      if (visited.has(visitedKey)) continue;
      visited.add(visitedKey);

      const cost = grid[newY][newX] === 3 ? 8 : 1;
      const g = current.g + cost;
      const h = heuristic(newPos, grid, newCollected);
      const f = g + h;

      open.push({
        pos: newPos,
        path: [...current.path, newPos],
        packagesCollected: newCollected,
        collectedCount: newCount,
        g,
        f
      });
    }
  }

  return null;
}

function cloneCollectedMatrix(matrix: boolean[][]): boolean[][] {
  return matrix.map(row => [...row]);
}

function heuristic(pos: Position, grid: number[][], collected?: boolean[][]): number {
  let minDist = Infinity;

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[y][x] === 4 && (!collected || !collected[y][x])) {
        const dist = Math.abs(pos.x - x) + Math.abs(pos.y - y);
        minDist = Math.min(minDist, dist);
      }
    }
  }

  return minDist === Infinity ? 0 : minDist;
}
