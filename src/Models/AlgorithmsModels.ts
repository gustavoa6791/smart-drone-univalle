export const GRID_SIZE = 10;

export interface Position {
    x: number;
    y: number;
}

export interface SearchMetrics {
    expandedNodes: number;
    treeDepth: number;
    computationTime: number;
    totalCost: number;
}

// Nodo con estado y camino acumulado.
export interface QueueNode {
    pos: Position;
    path: Position[];
    packagesCollected: boolean[][];
    collectedCount: number;
  }

// Se expanden en las 4 direcciones: derecha, izquierda, arriba y abajo.
export const DIRECTIONS = [
    { dx: 1, dy: 0 },   // Derecha
    { dx: -1, dy: 0 },  // Izquierda
    { dx: 0, dy: -1 },  // Arriba
    { dx: 0, dy: 1 }    // Abajo
];
