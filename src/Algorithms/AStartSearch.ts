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
  remainingPackages: Position[]; // Paquetes que faltan por recolectar
  g: number; // Costo real acumulado
  f: number; // Costo estimado total (g + h)
}

export function AStarSearch(
  grid: number[][],
  start: Position,
  totalPackages: number
): AStarResult | null {
  // Encontrar todas las posiciones de paquetes
  const allPackages: Position[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[y][x] === 4) {
        allPackages.push({ x, y });
      }
    }
  }

  // Verificar que hay paquetes para recolectar
  if (allPackages.length !== totalPackages) {
    return null;
  }

  const startNode: AStarNode = {
    pos: start,
    path: [start],
    remainingPackages: [...allPackages],
    g: 0,
    f: heuristic(start, allPackages)
  };

  const openSet: AStarNode[] = [startNode];
  const visited = new Map<string, number>();

  let expandedNodes = 0;
  let treeDepth = 0;
  const startTime = performance.now();

  while (openSet.length > 0) {
    // Ordenar por f (costo estimado total)
    openSet.sort((a, b) => a.f - b.f);
    const currentNode = openSet.shift()!;

    expandedNodes++;
    treeDepth = Math.max(treeDepth, currentNode.path.length - 1);

    // Verificar si hemos recolectado todos los paquetes
    if (currentNode.remainingPackages.length === 0) {
      const endTime = performance.now();
      return {
        path: currentNode.path,
        metrics: {
          expandedNodes,
          treeDepth,
          computationTime: endTime - startTime,
          totalCost: currentNode.g
        }
      };
    }

    // Generar sucesores
    for (const { dx, dy } of DIRECTIONS) {
      const newX = currentNode.pos.x + dx;
      const newY = currentNode.pos.y + dy;

      // Verificar límites del grid y obstáculos
      if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) continue;
      if (grid[newY][newX] === 1) continue; // Obstáculo

      const newPos: Position = { x: newX, y: newY };
      
      // Calcular nuevo costo
      const cost = grid[newY][newX] === 3 ? 8 : 1; // Costo normal o campo EM
      const newG = currentNode.g + cost;

      // Verificar si hemos recolectado un paquete en esta posición
      const packageIndex = currentNode.remainingPackages.findIndex(
        p => p.x === newX && p.y === newY
      );

      const newRemainingPackages = [...currentNode.remainingPackages];
      if (packageIndex !== -1) {
        newRemainingPackages.splice(packageIndex, 1);
      }

      // Crear clave única para el estado (posición + paquetes restantes)
      const stateKey = `${newX},${newY}|${newRemainingPackages
        .map(p => `${p.x},${p.y}`)
        .sort()
        .join(';')}`;

      // Verificar si ya visitamos este estado con un costo menor
      if (visited.has(stateKey) && visited.get(stateKey)! <= newG) {
        continue;
      }

      visited.set(stateKey, newG);

      const newH = heuristic(newPos, newRemainingPackages);
      const newF = newG + newH;

      const newNode: AStarNode = {
        pos: newPos,
        path: [...currentNode.path, newPos],
        remainingPackages: newRemainingPackages,
        g: newG,
        f: newF
      };

      openSet.push(newNode);
    }
  }

  return null;
}

// Función heurística mejorada (distancia al paquete más cercano)
function heuristic(pos: Position, remainingPackages: Position[]): number {
  if (remainingPackages.length === 0) return 0;
  
  // Distancia Manhattan al paquete más cercano
  const minDistance = Math.min(
    ...remainingPackages.map(
      pkg => Math.abs(pos.x - pkg.x) + Math.abs(pos.y - pkg.y)
    )
  );
  
  return minDistance;
}
