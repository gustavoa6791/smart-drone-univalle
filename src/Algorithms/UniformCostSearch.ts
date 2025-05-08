import { Position, DIRECTIONS, GRID_SIZE, QueueNode } from "../Models/AlgorithmsModels";

// Serializa el estado de paquetes recogidos como un string único
function serializePackages(packages: boolean[][]): string {
  return packages.map(row => row.map(cell => (cell ? "1" : "0")).join("")).join("");
}

export function UniformCostSearch(
  grid: number[][],
  start: Position,
  totalPackages: number
): {
  path: Position[] | null;
  totalCost: number;
  nodesExpanded: number;
  maxDepth: number;
  computationTime: number;
} {
  const visited = new Set<string>();
  const queue: { node: QueueNode & { prevPos?: Position }; cost: number }[] = [];

  const initialPackages = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false)
  );

  queue.push({
    node: {
      pos: start,
      path: [start],
      packagesCollected: initialPackages,
      collectedCount: 0,
      prevPos: undefined,
      cost: 0
    },
    cost: 0
  });

  const startTime = performance.now();
  let nodesExpanded = 0;
  let maxDepth = 0;

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const { node, cost } = queue.shift()!;
    const { pos, path, packagesCollected, collectedCount, prevPos } = node;

    const key = `${pos.x},${pos.y},${serializePackages(packagesCollected)}`;
    if (visited.has(key)) continue;
    visited.add(key);

    nodesExpanded++;
    maxDepth = Math.max(maxDepth, path.length - 1);

    const newPackagesCollected = packagesCollected.map(row => [...row]);
    let newCollectedCount = collectedCount;

    let pickedPackage = false;
    if (grid[pos.y][pos.x] === 4 && !packagesCollected[pos.y][pos.x]) {
      newPackagesCollected[pos.y][pos.x] = true;
      newCollectedCount += 1;
      pickedPackage = true;

      if (newCollectedCount === totalPackages) {
        const endTime = performance.now();
        return {
          path,
          totalCost: cost,
          nodesExpanded,
          maxDepth,
          computationTime: endTime - startTime
        };
      }
    }

    for (const { dx, dy } of DIRECTIONS) {
      const newX = pos.x + dx;
      const newY = pos.y + dy;

      if (
        newX >= 0 && newX < GRID_SIZE &&
        newY >= 0 && newY < GRID_SIZE &&
        grid[newY][newX] !== 1
      ) {
        const newPos = { x: newX, y: newY };

        if (
          prevPos &&
          newPos.x === prevPos.x &&
          newPos.y === prevPos.y &&
          !pickedPackage
        ) {
          continue;
        }

        const newCost = cost + (grid[newY][newX] === 3 ? 8 : 1);
        queue.push({
          node: {
            pos: newPos,
            path: [...path, newPos],
            packagesCollected: newPackagesCollected.map(row => [...row]),
            collectedCount: newCollectedCount,
            prevPos: pos,
            cost: 0
          },
          cost: newCost
        });
      }
    }
  }

  const endTime = performance.now();
  return {
    path: null,
    totalCost: 0,
    nodesExpanded,
    maxDepth,
    computationTime: endTime - startTime
  };
}
