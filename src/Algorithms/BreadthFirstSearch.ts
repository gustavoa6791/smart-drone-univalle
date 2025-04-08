import { Position, DIRECTIONS, GRID_SIZE, QueueNode } from "../Models/AlgorithmsModels";

export function BreadthFirstSearch(
  grid: number[][],
  start: Position,
  totalPackages: number
): Position[] | null {

  //inicial
  const initialCollected = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false)
  );

  const queue: QueueNode[] = [{
    pos: start,
    path: [start],
    packagesCollected: initialCollected,
    collectedCount: 0
  }];

  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}|0`);

  while (queue.length > 0) {
    const { pos, path, packagesCollected, collectedCount } = queue.shift()!;

    //retornar si se recogieron todos los paquetes
    if (collectedCount === totalPackages) {
      return path;
    }

    for (const { dx, dy } of DIRECTIONS) {

      //agregar direccion a la posicion actual
      const newX = pos.x + dx;
      const newY = pos.y + dy;

      //es obstaculo o  esta fuera de la matriz
      if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) continue;
      if (grid[newY][newX] === 1) continue;

      //actualizar variables
      const newPos: Position = { x: newX, y: newY };
      const newCollected = cloneCollectedMatrix(packagesCollected);
      let newCount = collectedCount;

      //recoger paquete
      if (grid[newY][newX] === 4 && !newCollected[newY][newX]) {
        newCollected[newY][newX] = true;
        newCount++;
      }

      //agregar si se visito 
      const visitedKey = `${newX},${newY}|${newCount}`;
      if (visited.has(visitedKey)) continue;
      visited.add(visitedKey);

      //agragar expansion
      queue.push({
        pos: newPos,
        path: [...path, newPos],
        packagesCollected: newCollected,
        collectedCount: newCount
      });
    }
  }

  return null;
}

function cloneCollectedMatrix(matrix: boolean[][]): boolean[][] {
  return matrix.map(row => [...row]);
}
