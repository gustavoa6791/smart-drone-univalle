import { useRef, useState, useEffect } from "react";
import { BreadthFirstSearch } from "../Algorithms/BreadthFirstSearch";
import { UniformCostSearch } from "../Algorithms/UniformCostSearch";
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState(defaultWorld);
  const [inputKey, setInputKey] = useState(Date.now());

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

  useEffect(() => {
    const packs = grid.flat().filter(n => n === 4).length;
    setPackagesLeft(packs);
  }, [grid]);

  const [completionMessage, setCompletionMessage] = useState<string>("");
  const [expandedNodes, setExpandedNodes] = useState<number>(0);
  const [maxDepth, setMaxDepth] = useState<number>(0);
  const [computationtime, setComputationTime] = useState<number>(0);

  const stopFlag = useRef(false);


  //Funcion para reiniciar el mapa
  const resetMap = () => {
    stopFlag.current = true;
    const newBase = parseGrid(defaultWorld); // Restablece el mundo al valor predeterminado
    const startPos = findDroneStart(newBase); // Encuentra la posición inicial del dron
    newBase[startPos.y][startPos.x] = 0; // Quita el dron de la matriz base

    const newGrid = newBase.map((row) => [...row]); // Crea una copia de la cuadrícula
    newGrid[startPos.y][startPos.x] = 2; // Coloca el dron en la posición inicial en la nueva cuadrícula

    // Actualiza todos los estados relacionados
    setInputText(defaultWorld);
    setInputKey(Date.now());
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
    setInputKey(Date.now());
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };


  //funcion para mostrar un mensaje de finalizacion
  const showCompletitionMessage = (message: string) => {
    setCompletionMessage(message);
  }

  // Función para generar un nuevo mundo a partir del textarea
  const generateWorld = () => {
    stopFlag.current = true;
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


  // Función para mover el dron
  const moveDrone = (currentPosition: Position, newPosition: Position) => {
    // Actualizar el costo según el tipo de celda
    const newCellCost = baseGrid[newPosition.y][newPosition.x] === 3 ? 8 : 1;
    setCost(prevCost => prevCost + newCellCost);

    setGrid((prev) => {
      const next = prev.map((r) => [...r]);
      next[newPosition.y][newPosition.x] = 2;
      return next;
    });

    setGrid((prev) => {
      const next = prev.map((r) => [...r]);
      if (baseGrid[currentPosition.y][currentPosition.x] == 3) {
        next[currentPosition.y][currentPosition.x] = baseGrid[currentPosition.y][currentPosition.x];
      } else {
        next[currentPosition.y][currentPosition.x] = 0;
      }
      return next;
    });

    setDronePosition(newPosition);

    return newPosition;
  };


 //ALGORITMO DE BUSQUEDA POR AMPLITUD
  const runBreadthFirstSearch = async () => {
    stopFlag.current = false;
    setCompletionMessage(""); //limpia el mensaje antes de iniciar
    setCost(0); // Reiniciar el costo a 0
    setExpandedNodes(0);
    setMaxDepth(0);
    setComputationTime(0);

    const startTime = Date.now();
    const result = BreadthFirstSearch(baseGrid, dronePosition, packagesLeft);
    const endTime = Date.now();

    const { path, extendedNodes, treeDepth, executionTime } = result;

    if (!path.length) {
      showCompletitionMessage("No se pueden alcanzar todos los paquetes.")
      return;
    }

    // Actualizar las métricas
    setExpandedNodes(extendedNodes);
    setMaxDepth(treeDepth);
    setComputationTime(executionTime);

    let start = dronePosition;

    for (let i = 1; i < path.length; i++) {
      if (stopFlag.current) break;
      start = moveDrone(start, path[i]);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    if (stopFlag.current) {
      showCompletitionMessage("<b>BÚSQUEDA POR AMPLITUD DETENIDA</b>")
    }else{
      showCompletitionMessage("<b>BÚSQUEDA POR AMPLITUD COMPLETA</b>")
    }
  };

 //ALGORITMO DE BUSQUEDA POR PROFUNDIDAD POR COSTO
  const runUniformCostSearch = async () => {
    stopFlag.current = false;
    setCompletionMessage(""); //limpia el mensaje antes de iniciar
    setCost(0); // Reiniciar el costo a 0
    setExpandedNodes(0);
    setMaxDepth(0);
    setComputationTime(0);

    const startTime = Date.now();
    const result = UniformCostSearch(baseGrid, dronePosition, packagesLeft);
    const endTime = Date.now();

    const { path, nodesExpanded, maxDepth, computationTime } = result;

    if (!path?.length) {
      alert("No se pueden alcanzar todos los paquetes.");
      return;
    }

    // Actualizar las métricas
    setExpandedNodes(nodesExpanded);
    setMaxDepth(maxDepth);
    setComputationTime(computationTime);

    let start = dronePosition;

    for (let i = 1; i < path.length; i++) {
      if (stopFlag.current) break;
      start = moveDrone(start, path[i]);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    if (stopFlag.current) {
      showCompletitionMessage("<b>BÚSQUEDA POR COSTO UNIFORME DETENIDA</b>")
    }else{
      showCompletitionMessage("<b>BÚSQUEDA POR COSTO UNIFORME COMPLETA</b>")
    }
  };


 //ALGORITMO DE BUSQUEDA AVARA
  const runGreedyBestFirstSearch = async () => {
    stopFlag.current = false;
    setCompletionMessage(""); //limpia el mensaje antes de iniciar
    setCost(0); // Reiniciar el costo a 0
    setExpandedNodes(0);
    setMaxDepth(0);
    setComputationTime(0);

    const result = GreedyBestFirstSearch(baseGrid, dronePosition, packagesLeft);

    const { path, metrics } = result;

    if (!path?.length) {
      showCompletitionMessage("No se pueden alcanzar todos los paquetes.");
      return;
    }

    // Actualizar las métricas en la interfaz
    setExpandedNodes(metrics.expandedNodes);
    setMaxDepth(metrics.treeDepth);
    setComputationTime(metrics.computationTime);

    let start = dronePosition;

    for (let i = 1; i < path.length; i++) {
      if (stopFlag.current) break;
      start = moveDrone(start, path[i]);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    if (stopFlag.current) {
      showCompletitionMessage("<b>BÚSQUEDA POR AVARA DETENIDA</b>")
    }else{
      showCompletitionMessage("<b>BÚSQUEDA POR AVARA COMPLETA</b>")
    }
  };


 //ALGORITMO DE BUSQUEDA A*
  const runAStarSearch = async () => {
    stopFlag.current = false;
    // Reiniciar todas las métricas al inicio
    setCompletionMessage("");
    setCost(0);
    
    // Obtener el resultado de A* primero
    const result = AStarSearch(baseGrid, dronePosition, packagesLeft);

    if (!result) {
        showCompletitionMessage("No se pueden alcanzar todos los paquetes.");
        return;
    }

    // Actualizar inmediatamente todas las métricas antes de mover el dron
    setExpandedNodes(result.metrics.expandedNodes);
    setMaxDepth(result.metrics.treeDepth);
    setComputationTime(result.metrics.computationTime);

    let start = dronePosition;

    // Mover el dron y actualizar el costo paso a paso
    for (let i = 1; i < result.path.length; i++) {
      if (stopFlag.current) break;
        start = moveDrone(start, result.path[i]);
        await new Promise((resolve) => setTimeout(resolve, 600));
    }

    if (stopFlag.current) {
      showCompletitionMessage("<b>BÚSQUEDA POR A* DETENIDA</b>")
    }else{
      showCompletitionMessage("<b>BÚSQUEDA POR A* COMPLETA</b>")
    }
  };


 //ALGORITMO DE BUSQUEDA POR PROFUNDIDAD
  const runDepthFirstSearch = async () => {
    stopFlag.current = false;
    setCompletionMessage(""); //limpia el mensaje antes de iniciar
    setCost(0); // Reiniciar el costo a 0
    setExpandedNodes(0);
    setMaxDepth(0);
    setComputationTime(0);

    const startTime = Date.now();
    const result = DepthFirstSearch(baseGrid, dronePosition, packagesLeft);
    const endTime = Date.now();

    if (!result.path) {
      showCompletitionMessage("No se pueden alcanzar todos los paquetes.")
      return;
    }

    // Actualizar las métricas
    setExpandedNodes(result.expandedNodes);
    setMaxDepth(result.maxDepth);
    setComputationTime(endTime - startTime);

    let start = dronePosition;

    for (let i = 1; i < result.path.length; i++) {
      if (stopFlag.current) break;
      start = moveDrone(start, result.path[i]);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    if (stopFlag.current) {
      showCompletitionMessage("<b>BÚSQUEDA POR PROFUNDIDAD DETENIDA</b>")
    }else{
      showCompletitionMessage("<b>BÚSQUEDA POR PROFUNDIDAD COMPLETA</b>")
    }
  };

  const [activeTab, setActiveTab] = useState("noInformada");

  return (
    <div className="container">
      <h1><img src="/icono_univalle.ico" alt="" /> Smart Drone 🚁 </h1>
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
              <p><b>Coste actual:</b> {cost}</p>
              <p><b>Paquetes restantes:</b> {packagesLeft}</p>
              <p><b>Nodos expandidos:</b> {expandedNodes}</p>
              <p><b>Profundidad maxima:</b> {maxDepth}</p>
              <p><b>Tiempo de computo:</b> {computationtime}</p>
              {completionMessage && <p className="completion-message" dangerouslySetInnerHTML={{ __html: completionMessage }}></p>}
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
                <button className="control-button" onClick={triggerFileInput}>📁 Subir archivo</button>
                <input
                  key={inputKey}
                  type="file"
                  accept=".txt"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </div>
              <div className="row">
                <button className="control-button" onClick={generateWorld}>Generar Mundo</button>
              </div>

              <div className="row">
                <button className="control-button" onClick={resetMap}>Reiniciar Mapa</button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;