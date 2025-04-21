import { Position, GRID_SIZE, SearchMetrics } from "../Models/AlgorithmsModels";

interface Node {
  position: Position;
  parent: Node | null;
  f: number;
  path: Position[];
  depth: number;
  cost: number;  // Añadimos el costo al nodo
}

export function GreedyBestFirstSearch(
  grid: number[][],
  start: Position,
  packagesLeft: number
): { path: Position[] | null, metrics: SearchMetrics & { totalCost: number } } {
  const startTime = performance.now();
  let expandedNodes = 0;
  let maxDepth = 0;
  let totalCost = 0;
  
  let currentPosition = start;
  let completePath: Position[] = [start];
  let remainingGrid = grid.map(row => [...row]);
  let packagesRemaining = packagesLeft;

  while (packagesRemaining > 0) {
    const result = findNextPackage(remainingGrid, currentPosition);
    
    if (!result || !result.path) {
      const endTime = performance.now();
      return {
        path: null,
        metrics: {
          expandedNodes,
          treeDepth: maxDepth,
          computationTime: endTime - startTime,
          totalCost
        }
      };
    }

    expandedNodes += result.expandedNodes;
    maxDepth = Math.max(maxDepth, result.depth);
    totalCost += result.cost;
    completePath = completePath.concat(result.path.slice(1));
    currentPosition = result.path[result.path.length - 1];
    remainingGrid[currentPosition.y][currentPosition.x] = 0;
    packagesRemaining--;
  }

  const endTime = performance.now();
  return {
    path: completePath,
    metrics: {
      expandedNodes,
      treeDepth: maxDepth,
      computationTime: endTime - startTime,
      totalCost
    }
  };
}

function findNextPackage(grid: number[][], start: Position): { 
  path: Position[] | null, 
  expandedNodes: number,
  depth: number,
  cost: number 
} {
  const openSet: Node[] = [];
  const closedSet = new Set<string>();
  let expandedNodes = 0;
  let maxDepth = 0;
  
  const startNode: Node = {
    position: start,
    parent: null,
    f: heuristic(start, grid),
    path: [start],
    depth: 0,
    cost: 0
  };

  openSet.push(startNode);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    expandedNodes++;
    maxDepth = Math.max(maxDepth, current.depth);

    if (grid[current.position.y][current.position.x] === 4) {
      return {
        path: current.path,
        expandedNodes,
        depth: maxDepth,
        cost: current.cost
      };
    }

    const posKey = `${current.position.x},${current.position.y}`;
    closedSet.add(posKey);

    const moves = getValidMoves(current.position, grid);
    for (const move of moves) {
      const moveKey = `${move.x},${move.y}`;
      if (closedSet.has(moveKey)) continue;

      // Calcular el costo del movimiento
      const moveCost = grid[move.y][move.x] === 3 ? 8 : 1;
      const newCost = current.cost + moveCost;

      const newPath = [...current.path, move];
      const newNode: Node = {
        position: move,
        parent: current,
        f: heuristic(move, grid),
        path: newPath,
        depth: current.depth + 1,
        cost: newCost
      };

      const existingNode = openSet.find(
        (node) => node.position.x === move.x && node.position.y === move.y
      );

      if (!existingNode || newNode.f < existingNode.f) {
        if (!existingNode) {
          openSet.push(newNode);
        } else {
          existingNode.f = newNode.f;
          existingNode.parent = current;
          existingNode.path = newPath;
          existingNode.cost = newCost;
        }
      }
    }
  }

  return {
    path: null,
    expandedNodes,
    depth: maxDepth,
    cost: 0
  };
}

// Función heurística mejorada: distancia Manhattan al paquete más cercano considerando obstáculos
function heuristic(position: Position, grid: number[][]): number {
  let minDistance = Infinity;
  
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[y][x] === 4) {
        // Calcular distancia Manhattan
        const distance = Math.abs(position.x - x) + Math.abs(position.y - y);
        
        // Verificar si hay obstáculos en el camino
        let hasObstacle = false;
        const minX = Math.min(position.x, x);
        const maxX = Math.max(position.x, x);
        const minY = Math.min(position.y, y);
        const maxY = Math.max(position.y, y);
        
        // Verificar obstáculos en el camino horizontal
        for (let i = minX; i <= maxX; i++) {
          if (grid[position.y][i] === 1) {
            hasObstacle = true;
            break;
          }
        }
        
        // Verificar obstáculos en el camino vertical
        for (let i = minY; i <= maxY; i++) {
          if (grid[i][position.x] === 1) {
            hasObstacle = true;
            break;
          }
        }
        
        // Si hay obstáculos, aumentar la distancia estimada
        const adjustedDistance = hasObstacle ? distance * 1.5 : distance;
        minDistance = Math.min(minDistance, adjustedDistance);
      }
    }
  }
  
  return minDistance;
}

// Obtener movimientos válidos
function getValidMoves(position: Position, grid: number[][]): Position[] {
  const moves: Position[] = [];
  const directions = [
    { x: 0, y: -1 }, // arriba
    { x: 1, y: 0 },  // derecha
    { x: 0, y: 1 },  // abajo
    { x: -1, y: 0 }, // izquierda
  ];

  for (const dir of directions) {
    const newX = position.x + dir.x;
    const newY = position.y + dir.y;

    if (
      newX >= 0 && newX < GRID_SIZE &&
      newY >= 0 && newY < GRID_SIZE &&
      grid[newY][newX] !== 1 // No es un obstáculo
    ) {
      moves.push({ x: newX, y: newY });
    }
  }

  return moves;
}