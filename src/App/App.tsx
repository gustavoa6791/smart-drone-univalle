import { useState } from "react";
import { BreadthFirstSearch } from "../Algorithms/BreadthFirstSearch";
import { UniformCostSearch } from "../Algorithms/UniformCostSearch";
import { GreedyBestFirstSearch } from "../Algorithms/GreedyBestFirstSearch";
import { AStarSearch } from "../Algorithms/AStartSearch";
import { DepthFirstSearch } from "../Algorithms/DepthFirstSearch";

import { Position, GRID_SIZE } from "../Models/AlgorithmsModels";
import "./App.css";

// Definición de tipos para los resultados de búsqueda
interface SearchMetrics {
  expandedNodes: number;
  treeDepth: number;
  computationTime: number;
  totalCost: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface SearchResult {
  path: Position[];
  metrics: SearchMetrics;
}

interface DepthFirstSearchResult {
  path: Position[];
  expandedNodes: number;
  maxDepth: number;
  totalCost: number;
}

// Función para convertir texto en matriz
const parseGrid = (text: string): number[][] => {
  return text
    .trim()
    .split("\n")
    .map((row) => row.split(" ").map(Number));
};

// Iconos para representar el mundo
const ICONS: Record<number, string> = {
  0: "", // Espacio libre
  1: "⬛", // Obstáculo
  2: "🚁", // Dron
  3: "⚡", // Campo electromagnético
  4: "📦", // Paquete
};

// Estado inicial del mundo (en texto)
const defaultWorld = `1 1 0 0 0 0 0 1 1 1
1 1 0 1 0 1 0 1 1 1
0 2 0 3 4 4 0 0 0 0
0 1 1 1 0 1 1 1 1 0
0 1 1 1 0 0 0 0 0 0
3 3 0 1 0 1 1 1 1 1
1 1 0 1 0 0 0 0 0 0
1 1 0 1 1 1 1 1 1 0
1 1 0 0 0 0 4 0 0 0
1 1 1 1 1 1 1 1 1 1`;

// Función para encontrar la posición inicial del dron
const findDroneStart = (grid: number[][]): Position => {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[y][x] === 2) return { x, y };
    }
  }
  return { x: 0, y: 0 };
};

function App() {
  const [inputText, setInputText] = useState(defaultWorld);
  const initialBase = parseGrid(defaultWorld);
  const startPos = findDroneStart(initialBase);
  initialBase[startPos.y][startPos.x] = 0;
  const [baseGrid, setBaseGrid] = useState<number[][]>(initialBase);

  const [grid, setGrid] = useState<number[][]>(() => {
    const g = initialBase.map((row) => [...row]);
    g[startPos.y][startPos.x] = 2;
    return g;
  });

  const [dronePosition, setDronePosition] = useState<Position>(startPos);
  const [cost, setCost] = useState(0);
  const [packagesLeft, setPackagesLeft] = useState(
    initialBase.flat().filter((cell) => cell === 4).length
  );
  const [completionMessage, setCompletionMessage] = useState<string>("");
  const [expandedNodes, setExpandedNodes] = useState<number>(0);
  const [maxDepth, setMaxDepth] = useState<number>(0);
  const [computationTime, setComputationTime] = useState<number>(0);

  // Función para reiniciar el mapa
  const resetMap = () => {
    const newBase = parseGrid(defaultWorld);
    const startPos = findDroneStart(newBase);
    newBase[startPos.y][startPos.x] = 0;

    const newGrid = newBase.map((row) => [...row]);
    newGrid[startPos.y][startPos.x] = 2;

    setBaseGrid(newBase);
    setGrid(newGrid);
    setDronePosition(startPos);
    setCost(0);
    setPackagesLeft(newBase.flat().filter((cell) => cell === 4).length);
    setCompletionMessage("");
    setExpandedNodes(0);
    setMaxDepth(0);
    setComputationTime(0);
  };

  const showCompletitionMessage = (message: string) => {
    setCompletionMessage(message);
  };

  // Función para mover el dron
  const moveDrone = (dx: number, dy: number) => {
    const newX = dronePosition.x + dx;
    const newY = dronePosition.y + dy;

    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return;
    if (grid[newY][newX] === 1) return;

    const cellValue = baseGrid[newY][newX];
    const costDelta = cellValue === 3 ? 8 : 1;
    const newCost = cost + costDelta;

    const newGrid = grid.map((row) => [...row]);
    const newBaseGrid = baseGrid.map((row) => [...row]);

    newGrid[dronePosition.y][dronePosition.x] =
      baseGrid[dronePosition.y][dronePosition.x];

    if (newBaseGrid[newY][newX] === 4) {
      if (packagesLeft > 0) {
        setPackagesLeft((prev) => Math.max(0, prev - 1));
      }
      newBaseGrid[newY][newX] = 0;
    }

    newGrid[newY][newX] = 2;

    setDronePosition({ x: newX, y: newY });
    setGrid(newGrid);
    setBaseGrid(newBaseGrid);
    setCost(newCost);
  };

  // Función para generar un nuevo mundo
  const generateWorld = () => {
    const newBase = parseGrid(inputText);
    const startPos = findDroneStart(newBase);
    newBase[startPos.y][startPos.x] = 0;

    const newGrid = newBase.map((row) => [...row]);
    newGrid[startPos.y][startPos.x] = 2;

    setBaseGrid(newBase);
    setGrid(newGrid);
    setDronePosition(startPos);
    setCost(0);
    setPackagesLeft(newBase.flat().filter((cell) => cell === 4).length);
  };

  const runBreadthFirstSearch = async () => {
    setCompletionMessage("");
    const result = BreadthFirstSearch(baseGrid, dronePosition, packagesLeft);

    if (!result || !result.path) {
      showCompletitionMessage("No se pueden alcanzar todos los paquetes.");
      return;
    }

    for (let i = 1; i < result.path.length; i++) {
      const dx = result.path[i].x - dronePosition.x;
      const dy = result.path[i].y - dronePosition.y;
      moveDrone(dx, dy);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    showCompletitionMessage("Búsqueda por amplitud completa");
  };

  const runUniformCostSearch = async () => {
    const result = UniformCostSearch(baseGrid, dronePosition, packagesLeft);

    if (!result || !result.path) {
      alert("No se pueden alcanzar todos los paquetes.");
      return;
    }

    for (let i = 1; i < result.path.length; i++) {
      const dx = result.path[i].x - dronePosition.x;
      const dy = result.path[i].y - dronePosition.y;
      moveDrone(dx, dy);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    showCompletitionMessage("Búsqueda de costo uniforme completa");
  };

  const runGreedyBestFirstSearch = async () => {
    const result = GreedyBestFirstSearch(baseGrid, dronePosition, packagesLeft);

    if (!result || !result.path) {
      alert("No se pueden alcanzar todos los paquetes.");
      return;
    }

    alert(`Reporte de búsqueda:
      Nodos expandidos: ${result.metrics.expandedNodes}
      Profundidad del árbol: ${result.metrics.treeDepth}
      Tiempo de cómputo: ${result.metrics.computationTime.toFixed(2)}ms
      Costo total del camino: ${result.metrics.totalCost}`);

    for (let i = 1; i < result.path.length; i++) {
      const dx = result.path[i].x - dronePosition.x;
      const dy = result.path[i].y - dronePosition.y;
      moveDrone(dx, dy);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    showCompletitionMessage("Búsqueda voraz completa");
  };

  const runAStarSearch = async () => {
    const result = AStarSearch(baseGrid, dronePosition, packagesLeft);

    if (!result || !result.path) {
      alert("No se pueden alcanzar todos los paquetes.");
      return;
    }

    alert(`Reporte de búsqueda A*:
      Nodos expandidos: ${result.metrics.expandedNodes}
      Profundidad del árbol: ${result.metrics.treeDepth}
      Tiempo de cómputo: ${result.metrics.computationTime.toFixed(2)}ms
      Costo Total: ${result.metrics.totalCost}`);

    for (let i = 1; i < result.path.length; i++) {
      const dx = result.path[i].x - dronePosition.x;
      const dy = result.path[i].y - dronePosition.y;
      moveDrone(dx, dy);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    showCompletitionMessage("Búsqueda A* completa");
  };

  const runDepthFirstSearch = async () => {
    setCompletionMessage("");
    setExpandedNodes(0);
    setMaxDepth(0);
    setComputationTime(0);

    const startTime = Date.now();
    const result = DepthFirstSearch(baseGrid, dronePosition, packagesLeft) as DepthFirstSearchResult | null;
    const endTime = Date.now();

    if (!result || !result.path) {
      showCompletitionMessage("No se pueden alcanzar todos los paquetes.");
      return;
    }

    setExpandedNodes(result.expandedNodes);
    setMaxDepth(result.maxDepth);
    setComputationTime(endTime - startTime);

    for (let i = 1; i < result.path.length; i++) {
      const dx = result.path[i].x - dronePosition.x;
      const dy = result.path[i].y - dronePosition.y;
      moveDrone(dx, dy);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    showCompletitionMessage("Búsqueda por profundidad completa");
  };

  return (
    <div className="container">
      <h2>Smart Drone 🚁</h2>
      <p>Coste actual: {cost}</p>
      <p>Paquetes restantes: {packagesLeft}</p>
      <p>Nodos expandidos: {expandedNodes}</p>
      <p>Profundidad máxima: {maxDepth}</p>
      <p>Tiempo de cómputo: {computationTime}ms</p>
      {completionMessage && (
        <p className="completion-message">{completionMessage}</p>
      )}
      <div className="sub-contaioner">
        <div className="grid">
          {grid.map((row, y) =>
            row.map((cell, x) => {
              const isDrone = dronePosition.x === x && dronePosition.y === y;
              const cellClass = isDrone
                ? baseGrid[y][x] === 3
                  ? "drone-electromagnetic"
                  : "drone"
                : "";
              return (
                <div key={`${x}-${y}`} className={`cell ${cellClass}`}>
                  {isDrone ? "🚁" : ICONS[cell] || ""}
                </div>
              );
            })
          )}
        </div>
        <div className="world">
          <div className="controls">
            <div className="row">
              <button onClick={() => moveDrone(0, -1)}>⬆️</button>
            </div>
            <div className="row">
              <button onClick={() => moveDrone(-1, 0)}>⬅️</button>
              <button onClick={() => moveDrone(0, 1)}>⬇️</button>
              <button onClick={() => moveDrone(1, 0)}>➡️</button>
            </div>
            <div className="row">
              <button onClick={resetMap}>Reiniciar Mapa</button>
            </div>
            <br />
            <div className="row">
              <button onClick={runBreadthFirstSearch}>
                Búsqueda por Amplitud
              </button>
            </div>
            <div className="row">
              <button onClick={runDepthFirstSearch}>
                Búsqueda por Profundidad
              </button>
            </div>
            <div className="row">
              <button onClick={runUniformCostSearch}>
                Búsqueda de Costo Uniforme
              </button>
            </div>
            <div className="row">
              <button onClick={runGreedyBestFirstSearch}>Búsqueda Voraz</button>
            </div>
            <div className="row">
              <button onClick={runAStarSearch}>Búsqueda A*</button>
            </div>
          </div>
          <div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={15}
              cols={30}
              style={{ resize: "none" }}
            ></textarea>
            <br />
            <button onClick={generateWorld}>Generar Mundo</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;