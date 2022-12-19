import { useState } from "react";
import "./styles.css";

const initialValue = Array.from({ length: 16 }).fill(0);

export default function App() {
  const [tiles, setTiles] = useState(initialValue);
  const [isOver, setOver] = useState(false);
  const [score, setScore] = useState(0);
  const bestScore = localStorage.getItem("2048_best") || 0;

  const handleMove = (e) => {
    if (isOver) return;
    let currentTiles = tiles;
    //dimension
    const dimension = Math.sqrt(tiles.length);
    //left and right controls
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const isLeft = e.key === "ArrowLeft";
      //get rows
      const rows = getRows(currentTiles, dimension);
      //map all rows
      rows.forEach(([tiles, rowStart]) => {
        //swipe left
        if (isLeft) {
          //merge to left
          const [merged, scr] = mergeToStart(tiles);
          tiles = merged;
          setScore((s) => s + scr);
          //add 0s to end
          tiles = tiles.concat(
            Array.from({ length: dimension - tiles.length }).fill(0)
          );
        }
        //swipe right
        else {
          //merge to right
          const [merged, scr] = mergeToEnd(tiles);
          tiles = merged;
          setScore((s) => s + scr);
          //add 0s to start
          tiles = Array.from({ length: dimension - tiles.length })
            .fill(0)
            .concat(tiles);
        }

        //update all tile values
        tiles.forEach((tile, index) => {
          currentTiles[rowStart + index] = tile;
        });
      });
    }
    //top and bottom controls
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const isUp = e.key === "ArrowUp";
      const cols = getCols(currentTiles, 4);
      cols.forEach(([tiles, colStart]) => {
        if (isUp) {
          //merge to top
          const [merged, scr] = mergeToStart(tiles);
          tiles = merged;
          setScore((s) => s + scr);
          //add 0s to end
          tiles = tiles.concat(
            Array.from({ length: dimension - tiles.length }).fill(0)
          );
        } else {
          //merge to bottom
          const [merged, scr] = mergeToEnd(tiles);
          tiles = merged;
          setScore((s) => s + scr);
          //add 0s to start
          tiles = Array.from({ length: dimension - tiles.length })
            .fill(0)
            .concat(tiles);
        }
        //update all tile values
        tiles.forEach((tile, index) => {
          currentTiles[colStart + index * dimension] = tile;
        });
      });
    }
    //get empty tile indexes
    const emptyTiles = currentTiles
      .map((t, i) => (t === 0 ? i : -1))
      .filter((t) => t !== -1);
    //spawn random value to an empty tile
    const randomSpawn = Math.round(Math.random() * (emptyTiles.length - 1));
    const spawnTile = emptyTiles[randomSpawn];
    const spawnValue = Math.round(Math.random() * 3) > 2 ? 4 : 2;
    currentTiles[spawnTile] = spawnValue;
    //update state
    setTiles([...currentTiles]);
    //check if game over
    if (emptyTiles.length <= 1) {
      setOver(true);
      if (bestScore < score) {
        localStorage.setItem("2048_best", score);
      }
    }
  };

  return (
    <div className="wrapper" onKeyDown={handleMove} tabIndex="0">
      <div className="container">
        <div className="status-container">
          <div className="status">
            Score
            <p>{score}</p>
          </div>
          <div className="status">
            Best
            <p>{score > bestScore ? score : bestScore}</p>
          </div>
        </div>
        <div className="board">
          {isOver && (
            <div className="game-over">
              <h1 className>Game over</h1>
              <button
                onClick={() => {
                  setTiles(initialValue);
                  setOver(false);
                  setScore(0);
                }}
              >
                New game
              </button>
            </div>
          )}
          {tiles.map((tile, index) => (
            <div className="tile" key={index} value={tile}>
              {tile}
            </div>
          ))}
        </div>
        <h1>How to play</h1>
        <p>
          Use your <b>arrow</b> keys to move the tiles. Tiles with the same
          number merge into one when they touch. Add them up to reach 2048!
        </p>
      </div>
    </div>
  );
}

const getCoords = (index) => {
  const x = index % 4;
  const y = (index - x) / 4;
  return { x, y };
};

const getRows = (arr, dimension) => {
  const rows = [];
  for (let i = 0; i < dimension; i++) {
    const rowStart = i * dimension;
    const rowEnd = rowStart + dimension;
    //get row and only not zero tiles
    const row = arr.slice(rowStart, rowEnd).filter((t) => t !== 0);
    rows.push([row, rowStart]);
  }
  return rows;
};
const getCols = (arr, dimension) => {
  const cols = [];
  for (let i = 0; i < dimension; i++) {
    const colStart = i;
    //get cols and only not zero tiles
    const col = arr.filter((t, ti) => ti % dimension === colStart && t !== 0);
    cols.push([col, colStart]);
  }
  return cols;
};

const mergeToStart = (arr) => {
  let score = 0;
  for (let t = 0; t < arr.length; t++) {
    //if neighbours are equal =>
    if (arr[t + 1] === arr[t]) {
      //multiply first by two and remove second.
      arr[t] *= 2;
      score += arr[t];
      arr = arr.filter((_, _ti) => _ti !== t + 1);
    }
  }
  return [arr, score];
};

const mergeToEnd = (arr) => {
  let score = 0;
  for (let t = 0; t < arr.length; t++) {
    //if neighbours are equal =>
    if (arr[t + 1] === arr[t]) {
      //multiply first by two and remove second.
      arr[t] *= 2;
      score += arr[t];
      arr = arr.filter((_, _ti) => _ti !== t + 1);
    }
  }
  return [arr, score];
};
