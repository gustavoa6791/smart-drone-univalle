import { Position, DIRECTIONS, GRID_SIZE, QueueNode } from "../Models/AlgorithmsModels";


export function UniformCostSearch(
  grid: number[][],
  start: Position,
  totalPackages: number
): { path: Position[] | null; totalCost: number } {
  const visited = new Set<string>();
  const queue: { node: QueueNode; cost: number }[] = [];

  // Inicializar matriz de paquetes recogidos
  const initialPackages = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false)
  );

  // Agregar el nodo inicial
  queue.push({
    node: {
      pos: start,
      path: [start],
      packagesCollected: initialPackages,
      collectedCount: 0
    },
    cost: 0
  });

  while (queue.length > 0) {
    // Ordenar la cola por costo ascendente (simulando una cola de prioridad)
    queue.sort((a, b) => a.cost - b.cost);
    const { node, cost } = queue.shift()!;

    const { pos, path, packagesCollected, collectedCount } = node;
    const key = `${pos.x},${pos.y},${collectedCount}`;

    if (visited.has(key)) continue;
    visited.add(key);

    let newPackagesCollected = packagesCollected.map(row => [...row]);
    let newCollectedCount = collectedCount;

    // Si hay un paquete en esta posición y no se ha recogido
    if (grid[pos.y][pos.x] === 4 && !packagesCollected[pos.y][pos.x]) {
      newPackagesCollected[pos.y][pos.x] = true;
      newCollectedCount += 1;

      // Si ya se recogieron todos los paquetes, devolvemos el camino
      if (newCollectedCount === totalPackages) {
        return { path, totalCost: cost };
      }
    }

    // Explorar vecinos
    for (const { dx, dy } of DIRECTIONS) {
      const newX = pos.x + dx;
      const newY = pos.y + dy;

      if (
        newX >= 0 && newX < GRID_SIZE &&
        newY >= 0 && newY < GRID_SIZE &&
        grid[newY][newX] !== 1 
      ) {
        const newCost = cost + (grid[newY][newX] === 3 ? 8 : 1); 
        const newPos = { x: newX, y: newY };

        queue.push({
          node: {
            pos: newPos,
            path: [...path, newPos],
            packagesCollected: newPackagesCollected.map(row => [...row]),
            collectedCount: newCollectedCount
          },
          cost: newCost
        });
      }
    }
  }

  return { path: null, totalCost: 0 }; // No se encontró camino
}
