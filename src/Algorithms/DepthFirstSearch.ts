import { Position, DIRECTIONS, GRID_SIZE, QueueNode } from "../Models/AlgorithmsModels";

export function DepthFirstSearch(
  grid: number[][],
  start: Position,
  totalPackages: number
): {path: Position[] | null; 
    expandedNodes: number;
    maxDepth: number;
    //computationTime: number
} {

  // Crear una pila para el algoritmo de profundidad
  const stack: QueueNode[] = [
    {
      pos: start, //posicion inicial
      path: [start],
      packagesCollected: Array.from({ length: GRID_SIZE }, () =>
        Array(GRID_SIZE).fill(false)
      ),
      collectedCount: 0,
    },
  ];

  //rastrear nodos visitados
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}|0`);

  let expandedNodes = 0; //contador de nodos
  let maxDepth = 0 //profundidad maxima

  //const startTime = Date.now() //tiempo de inicio del algoritmo

  while (stack.length > 0) {
    // Obtener el nodo actual
    const { pos, path, packagesCollected, collectedCount } = stack.pop()!;
    expandedNodes++; //incrementar nodos expandidos 
    maxDepth = Math.max(maxDepth, path.length); //actualizar la profundidad

    // Retornar si se han recogido todos los paquetes
    if (collectedCount === totalPackages) {
      //const computationTime = Date.now() - startTime; //tiempo total de ejecución
      return { path, expandedNodes, maxDepth}
    }

    // Explorar vecinos
    for (const { dx, dy } of DIRECTIONS) {
      const newX = pos.x + dx;
      const newY = pos.y + dy;

      // Validar límites y obstáculos
      if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) continue;
      if (grid[newY][newX] === 1) continue; // 1 = obstáculo

      // Actualizar variables
      const newPos: Position = { x: newX, y: newY };
      const newCollected = cloneCollectedMatrix(packagesCollected);
      let newCount = collectedCount;

      // Recoger paquete si corresponde
      if (grid[newY][newX] === 4 && !newCollected[newY][newX]) {
        newCollected[newY][newX] = true;
        newCount++;
      }

      // Evitar nodos ya visitados
      const visitedKey = `${newX},${newY}|${newCount}`;
      if (visited.has(visitedKey)) continue;
      visited.add(visitedKey);

      // Agregar el nodo a la pila
      stack.push({
        pos: newPos,
        path: [...path, newPos],
        packagesCollected: newCollected,
        collectedCount: newCount,
      });
    }
  }
  //const computationTime = Date.now() - startTime;
  return {path:null, expandedNodes, maxDepth};
}

function cloneCollectedMatrix(matrix: boolean[][]): boolean[][] {
  return matrix.map((row) => [...row]);
}