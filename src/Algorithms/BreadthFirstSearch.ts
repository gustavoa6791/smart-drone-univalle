import { Position, Node, DIRECTIONS, GRID_SIZE, Response, Direction } from "../Models/AlgorithmsModels";

export function BreadthFirstSearch(
  matriz: number[][],
  posInit: Position,
  packs: number,
): Response {

  const start = performance.now();

  const queueNode: Node[] = [{
    position: posInit,
    path: [posInit],
    directions: [{dx:0,dy:0}],
    remainingPacks: packs,
    collectedPacks: new Set(),
    cost: 0
  }]

  const visitedNode = new Set<string>();
  let extendedNodes: number = 0;
  let maxDepth: number = 0;
  let finalPath: Position[] = [];
  let finalDirections: Direction[] = [];
  let totalCost: number = 0;

  while (queueNode.length > 0) {

    const { position, path, remainingPacks, collectedPacks, cost , directions} = queueNode.shift()!;

    extendedNodes++;
    maxDepth = Math.max(maxDepth, path.length - 1);

    if (remainingPacks === 0) {
      finalPath = path;
      totalCost = cost;
      finalDirections = directions
      break;
    }

    for (const { dx, dy } of DIRECTIONS) {

      const newX = position.x + dx;
      const newY = position.y + dy;

      if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) continue;
      if (matriz[newY][newX] === 1) continue;

      var newRemainingPacks = remainingPacks;
      const newCollectedPacks = new Set(collectedPacks);
      const key = `${newX}${newY}`;

      if (matriz[newY][newX] === 4 && !collectedPacks.has(key)) {
        newRemainingPacks = remainingPacks - 1
        newCollectedPacks.add(key);
      }

      const posKey = `${newX}${newY}-${newRemainingPacks}-${Array.from(newCollectedPacks).join('|')}`;

      if (visitedNode.has(posKey)) continue;

      const newPos: Position = { x: newX, y: newY }
      const newDir: Direction = { dx: dx, dy: dy }

      let newCost = cost;

      if (matriz[newY][newX] === 3) {
        newCost += 8
      }else{
        newCost += 1
      }

      queueNode.push({
        position: newPos,
        path: [...path, newPos],
        directions: [...directions, newDir],
        remainingPacks: newRemainingPacks,
        collectedPacks: newCollectedPacks,
        cost: newCost
      })

      visitedNode.add(posKey);
    }
  }

  const end = performance.now();


  const response: Response = {
    path: finalPath,
    directions: finalDirections,
    extendedNodes: extendedNodes,
    treeDepth: maxDepth,
    executionTime: end - start,
    totalCost: totalCost
  }

  return response
}
