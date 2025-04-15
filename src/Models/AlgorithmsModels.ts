export const GRID_SIZE = 10;

//posicion
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
    path: Position[]; //arreglo con el camino recorrido
    packagesCollected: boolean[][]; //para saber si recogio los paquetes
    collectedCount: number; //contador con el numero total de paquetes recogidos
  }

// Se expanden en las 4 direcciones: derecha, izquierda, arriba y abajo.
export const DIRECTIONS = [
    { dx: 1, dy: 0 },   // Derecha
    { dx: -1, dy: 0 },  // Izquierda
    { dx: 0, dy: -1 },  // Arriba
    { dx: 0, dy: 1 }    // Abajo
];
