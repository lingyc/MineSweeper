"use strict";

export default class MineField {
  constructor(fieldSize, bombCount) {
    if (bombCount >= fieldSize * fieldSize) {
      throw new Error('the number of bombs exceeds or equal to number of cells');
    }
    
    this.fieldSize = fieldSize;
    this.bombCount = bombCount;
    this.bombLocations = [];
    this.coveredEmptyCellsCount = fieldSize * fieldSize - bombCount;
    this.field = this._createField(fieldSize, bombCount);
  };

  _createField(fieldSize, bombCount) {
    let matrix = Array.from({length: fieldSize}, () => {
      return Array.from({length: fieldSize}, () => new EmptyCell());
    });

    this._plantBombRandomly(matrix, fieldSize, bombCount);
    return matrix;
  };

  _plantBombRandomly(matrix, fieldSize, bombCount){
    let positions = Array.from({length: fieldSize * fieldSize}, (val, key) => key);
    let totalCellCount = fieldSize * fieldSize;
    let currentBombCount = 0;

    while (currentBombCount < bombCount) {
      let bombIndex = convertTo2DIndex(Math.floor(Math.random() * totalCellCount));
      let [row, col] = bombIndex;
      if (matrix[row][col].isBomb === false) {
        this._setBombAt(bombIndex, matrix);
        this.bombLocations.push(bombIndex);
        currentBombCount++;
      }
    }

    function convertTo2DIndex(linearIndex) {
      let row = Math.floor(linearIndex / fieldSize);
      let column = linearIndex % fieldSize;
      return [row, column];
    };
  };

  _setBombAt(index, matrix) {
    const [row, column] = index;
    matrix[row][column] = new BombCell();
    this._getAdjacentIndexs(index, matrix).forEach(adjacentIndex => {
      const [adjacentRow, adjacentColumn] = adjacentIndex;
      const adjacentCell = matrix[adjacentRow][adjacentColumn];
      if (adjacentCell.isBomb === false) {
        adjacentCell.increaseAdjacentBombCount();
      }
    });
  };
  
  _getAdjacentIndexs(index, matrix, option) {
    const [row, column] = index;
    let cells = [];
    let increament;
    let start;
    if (option && option.cardinal === true) {
      //get the 4 adjacent cardinal indexes
      increament = 2;
      start = 1;
    } else {
      //get all the adjacent indexes including the 4 diagonals indexes
      increament = 1;
      start = 0;
    }
    for (let i = start; i < 9; i += increament) {
      if (i === 4) { continue; }
      let adjacentRow = row - (1 - Math.floor(i / 3));
      let adjacentcolumn = column - (1 - i % 3);
      if (adjacentRow >= 0 && adjacentRow < matrix.length && 
          adjacentcolumn >= 0 && adjacentcolumn < matrix.length) {
        cells.push([adjacentRow, adjacentcolumn]);
      }
    }
    return cells;
  };

  _getEmptyCellBody(index, matrix) {
    const [row, column] = index;
    let newlyUnCoverCells = [];
    let currentCell = matrix[row][column];
    if (!currentCell.isBomb) {
      currentCell.unCover();
      newlyUnCoverCells.push(index);
      if (currentCell.adjacentBombCount === 0) {
        const cardinalIndexes = this._getAdjacentIndexs(index, matrix, {cardinal: true});
        for (let cardinalIndex of cardinalIndexes) {
          const [cardinalRow, cardinalColumn] = cardinalIndex;
          const cardinalCell = matrix[cardinalRow][cardinalColumn];
          if (cardinalCell.isCovered === false || cardinalCell.isBomb) {
            continue;
          } else {
            newlyUnCoverCells = newlyUnCoverCells.concat(this._getEmptyCellBody(cardinalIndex, matrix));
          }
        }
      }
    } 
    return newlyUnCoverCells;
  };
  
  uncoverAt(index) {
    const [row, column] = index;
    if (this.field[row][column].isBomb) {
    	this.field[row][column].unCover();
      return {
        isBomb: true,
        newlyUnCoverCells: this.bombLocations,
        coveredEmptyCellsCount: this.coveredEmptyCellsCount,
      }
    } else {
      if (this.field[row][column].isCovered === false) {
        return {
          isBomb: false,
          newlyUnCoverCells: [],
          coveredEmptyCellsCount: this.coveredEmptyCellsCount
        };
      }
      const newlyUnCoverCells = this._getEmptyCellBody([row, column], this.field);
      this.coveredEmptyCellsCount -= newlyUnCoverCells.length
      return {
        isBomb: false,
        newlyUnCoverCells: newlyUnCoverCells,
        coveredEmptyCellsCount: this.coveredEmptyCellsCount
      };
    }
  };
};

class Cell {
  constructor(options) {
    this.isBomb = options.isBomb;
    this.isCovered = true;
  };

  unCover() {
    this.isCovered = false;
  };
}

class EmptyCell extends Cell {
  constructor(adjacentBombCount = 0) {
    super({isBomb: false});
    this.adjacentBombCount = adjacentBombCount;
  };

  increaseAdjacentBombCount() {
    this.adjacentBombCount++;
  };
};

class BombCell extends Cell {
  constructor(adjacentBombCount = 0) {
    super({isBomb: true});
  };
};

// let newGame = new MineField(5, 2);
// console.log(newGame.field);
// console.log(newGame.uncoverAt(0,0));
// console.log(newGame.field);