import { use, useState } from "react";
import { BreadthFirstSearch } from "../Algorithms/BreadthFirstSearch";
import { UniformCostSearch} from "../Algorithms/UniformCostSearch";
import { GreedyBestFirstSearch } from "../Algorithms/GreedyBestFirstSearch";
import { AStarSearch } from "../Algorithms/AStartSearch";
import { DepthFirstSearch } from "../Algorithms/DepthFirstSearch";

import { Position, GRID_SIZE } from "../Models/AlgorithmsModels";
import "./App.css";


// Función para convertir texto en matriz
const parseGrid = (text: string): number[][] => {
  return text.trim().split("\n").map((row) => row.split(" ").map(Number));
};

// Iconos para representar el mundo
const ICONS: Record<number, string> = {
  0: "",   // Espacio libre
  1: "⬛", // Obstáculo
  2: "🚁", // Dron
  3: "⚡", // Campo electromagnético
  4: "📦", // Paquete
};

// Estado inicial del mundo (en texto)
const defaultWorld =
`1 1 0 0 0 0 0 1 1 1
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
const findDroneStart = (grid: number[][]): Position => { //la funcion devuelve un objeto de tipo position
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[y][x] === 2) return { x, y }; //si el valor de la celda en la posicion es igual al 2
    }
  }
  return { x: 0, y: 0 }; //valor por defecto
};

function App() {

  const [inputText, setInputText] = useState(defaultWorld);

  //convierte el defaultWorld en una matriz bidimensional 
  const initialBase = parseGrid(defaultWorld);

  const startPos = findDroneStart(initialBase); //pos inicial del dron
  initialBase[startPos.y][startPos.x] = 0;
  //console.log(startPos); 
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
  const [computationtime, setComputationTime] = useState<number>(0);


  //Funcion para reiniciar el mapa
  const resetMap = () => {
    const newBase = parseGrid(defaultWorld); // Restablece el mundo al valor predeterminado
    const startPos = findDroneStart(newBase); // Encuentra la posición inicial del dron
    newBase[startPos.y][startPos.x] = 0; // Quita el dron de la matriz base

    const newGrid = newBase.map((row) => [...row]); // Crea una copia de la cuadrícula
    newGrid[startPos.y][startPos.x] = 2; // Coloca el dron en la posición inicial en la nueva cuadrícula

    // Actualiza todos los estados relacionados
    setBaseGrid(newBase);
    setGrid(newGrid);
    setDronePosition(startPos);
    setCost(0);
    setPackagesLeft(newBase.flat().filter((cell) => cell === 4).length);
    setCompletionMessage(""); // Limpia cualquier mensaje anterior
    setExpandedNodes(0);
    setMaxDepth(0);
    setComputationTime(0);
  };

  //funcion para mostrar un mensaje de finalizacion
  const showCompletitionMessage = (message: string) => {
    setCompletionMessage(message);
  }
  // Función para mover el dron
  const moveDrone = (dx: number, dy: number) => {
    const newX = dronePosition.x + dx;
    const newY = dronePosition.y + dy;

    //validar que no salga de la cuadricula ni pase por obstaculos
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return; //no puede salir de la cuadricula
    if (grid[newY][newX] === 1) return; // No puede pasar por obstáculos

    // Consultamos la celda en el baseGrid para determinar el costo
    const cellValue = baseGrid[newY][newX];
    const costDelta = cellValue === 3 ? 8 : 1;
    const newCost = cost + costDelta;

    // Clonamos grid y baseGrid
    const newGrid = grid.map((row) => [...row]);
    const newBaseGrid = baseGrid.map((row) => [...row]);

    // Restaurar la celda de la posición anterior según el baseGrid
    newGrid[dronePosition.y][dronePosition.x] = baseGrid[dronePosition.y][dronePosition.x];

    if (newBaseGrid[newY][newX] === 4) {
      if (packagesLeft > 0) { // Asegurarse de que packagesLeft no sea menor que 0
        setPackagesLeft((prev) => Math.max(0, prev - 1)); // Limitar el decremento
      }
      newBaseGrid[newY][newX] = 0; // Eliminar el paquete del mundo base
    }

    // Si la nueva celda tiene un paquete, el dron lo recoge:
    // if (newBaseGrid[newY][newX] === 4) {
    //   setPackagesLeft((prev) => prev - 1);
    //   newBaseGrid[newY][newX] = 0; // Se elimina el paquete del mundo base
    // }

    // Colocar el dron en la nueva posición
    newGrid[newY][newX] = 2;

    setDronePosition({ x: newX, y: newY });
    setGrid(newGrid);
    setBaseGrid(newBaseGrid);
    setCost(newCost);
  };

  // Función para generar un nuevo mundo a partir del textarea
  const generateWorld = () => {
    const newBase = parseGrid(inputText);

    const startPos = findDroneStart(newBase);
    newBase[startPos.y][startPos.x] = 0; // Eliminar el marcador del dron del base

    const newGrid = newBase.map((row) => [...row]);
    newGrid[startPos.y][startPos.x] = 2; // Colocar el dron en la posición inicial en grid

    setBaseGrid(newBase);
    setGrid(newGrid);
    setDronePosition(startPos);
    setCost(0);
    setPackagesLeft(newBase.flat().filter((cell) => cell === 4).length);
  };

  const runBreadthFirstSearch = async () => {
    setCompletionMessage(""); //limpia el mensaje antes de iniciar
    const result = BreadthFirstSearch(baseGrid, dronePosition, packagesLeft);

    const { path } = result;

    if (!path.length) {
      showCompletitionMessage("No se pueden alcanzar todos los paquetes.")
      return;
    }


    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - dronePosition.x;
      const dy = path[i].y - dronePosition.y;
      moveDrone(dx, dy);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    showCompletitionMessage("Busqueda por amplitud completa")
  };

  const runUniformCostSearch = async () => {
    const result = UniformCostSearch(baseGrid, dronePosition, packagesLeft);

    if (!result.path) {
      alert("No se pueden alcanzar todos los paquetes.");
      return;
    }

    const { path, totalCost } = result;

    //console.log("Costo total:", totalCost); 

    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - dronePosition.x;
      const dy = path[i].y - dronePosition.y;
      moveDrone(dx, dy);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    // Display metrics
    /* alert(`Reporte de búsqueda:
      Nodos expandidos: ${result.nodesExpanded}
      Profundidad del árbol: ${result.maxDepth}
      Tiempo de cómputo: ${result.computationTime.toFixed(2)}ms
      Costo total del camino: ${result.totalCost}`); */

  };

  const runGreedyBestFirstSearch = async () => {
    const result = GreedyBestFirstSearch(baseGrid, dronePosition, packagesLeft);

    if (!result.path) {
      alert("No se pueden alcanzar todos los paquetes.");
      return;
    }

    for (let i = 1; i < result.path.length; i++) {
      const dx = result.path[i].x - dronePosition.x;
      const dy = result.path[i].y - dronePosition.y;
      moveDrone(dx, dy);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    // Display metrics
    /* alert(`Reporte de búsqueda:
      Nodos expandidos: ${result.metrics.expandedNodes}
      Profundidad del árbol: ${result.metrics.treeDepth}
      Tiempo de cómputo: ${result.metrics.computationTime.toFixed(2)}ms
      Costo total del camino: ${result.metrics.totalCost}`); */

  }

  const runAStarSearch = async () => {
    const result = AStarSearch(baseGrid, dronePosition, packagesLeft);

    if (!result) {
      alert("No se pueden alcanzar todos los paquetes.");
      return;
    }

    // Mostrar reporte de métricas
    /* alert(`Reporte de búsqueda A*:
      Nodos expandidos: ${result.metrics.expandedNodes}
      Profundidad del árbol: ${result.metrics.treeDepth}
      Tiempo de cómputo: ${result.metrics.computationTime.toFixed(2)}ms
      Costo total: ${result.metrics.totalCost}`); */

    // Ejecutar el movimiento
    for (let i = 1; i < result.path.length; i++) {
      const dx = result.path[i].x - dronePosition.x;
      const dy = result.path[i].y - dronePosition.y;
      moveDrone(dx, dy);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    showCompletitionMessage("Busqueda por A* completa")
  };

  const runDepthFirstSearch = async () => {
    setCompletionMessage(""); //limpia el mensaje antes de iniciar
    setExpandedNodes(0);
    setMaxDepth(0);
    setComputationTime(0);

    const startTime = Date.now();
    const result = DepthFirstSearch(baseGrid, dronePosition, packagesLeft);
    //const {path, expandedNodes, maxDepth, computationTime} = DepthFirstSearch(baseGrid, dronePosition, packagesLeft);

    const endTime = Date.now()
    if (!result.path) {
      showCompletitionMessage("No se pueden alcanzar todos los paquetes.")
      return;
    }
    // if (!path) {
    //   alert("No se pueden alcanzar todos los paquetes.");
    //   return;
    // }

    setExpandedNodes(result.expandedNodes);
    setMaxDepth(result.maxDepth);
    setComputationTime(endTime - startTime);
    for (let i = 1; i < result.path.length; i++) {
      const dx = result.path[i].x - dronePosition.x;
      const dy = result.path[i].y - dronePosition.y;
      moveDrone(dx, dy);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    showCompletitionMessage("Busqueda por profundidad completa")
  };

  const [activeTab, setActiveTab] = useState("noInformada");

  return (
    <div className="container">
      <h2>Smart Drone 🚁</h2>
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

            {/* 
            <div className="row">
              <button onClick={() => moveDrone(0, -1)}>⬆️</button>
            </div>
            <div className="row">
              <button onClick={() => moveDrone(-1, 0)}>⬅️</button>
              <button onClick={() => moveDrone(0, 1)}>⬇️</button>
              <button onClick={() => moveDrone(1, 0)}>➡️</button>
            </div> 
            */}

            <div className="container-tabs">
              <div className="tabs">
                <button
                  className={activeTab === "noInformada" ? "tab active" : "tab"}
                  onClick={() => setActiveTab("noInformada")}
                >
                  Búsqueda No Informada
                </button>
                <button
                  className={activeTab === "informada" ? "tab active" : "tab"}
                  onClick={() => setActiveTab("informada")}
                >
                  Búsqueda Informada
                </button>
              </div>

              {/* Botones según la pestaña activa */}
              {activeTab === "noInformada" && (
                <>
                  <div className="row">
                    <button onClick={runBreadthFirstSearch}>Búsqueda por Amplitud</button>
                  </div>
                  <div className="row">
                    <button onClick={runDepthFirstSearch}>Búsqueda por Profundidad</button>
                  </div>
                  <div className="row">
                    <button onClick={runUniformCostSearch}>Búsqueda de Costo Uniforme</button>
                  </div>
                </>
              )}

              {activeTab === "informada" && (
                <>
                  <div className="row">
                    <button onClick={runGreedyBestFirstSearch}>Búsqueda Avara</button>
                  </div>
                  <div className="row">
                    <button onClick={runAStarSearch}>Búsqueda A*</button>
                  </div>
                </>
              )}

            </div>

            <div>
              <p>Coste actual: {cost}</p>
              <p>Paquetes restantes: {packagesLeft}</p>
              <p>Nodos expandidos: {expandedNodes}</p>
              <p>Profundidad maxima: {maxDepth}</p>
              <p>Tiempo de computo: {computationtime}</p>
              {completionMessage && <p className="completion-message">{completionMessage}</p>}
            </div>





          </div>
          <div className="generate">
            <div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={11}
                cols={21}
                style={{ resize: "none" }}
              ></textarea>              
            </div>
            <div>

              <div className="row">
                <button onClick={generateWorld}>Subir archivo</button>
              </div>
              <div className="row">
                <button onClick={generateWorld}>Generar Mundo</button>
              </div>

              <div className="row">
                <button onClick={resetMap}>Reiniciar Mapa</button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;


