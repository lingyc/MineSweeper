"use strict";
import $ from 'jquery';
import MineField from './mineSweeper';

const icons = {
  blank: 'http://i.imgur.com/HM1e3Tbb.jpg',
  pressed: 'http://i.imgur.com/bGT8xGEb.jpg',
  exposedBomb: 'http://i.imgur.com/pTJ8Swhb.jpg',
  explodedBomb: 'http://i.imgur.com/UFmXprFb.jpg',
  flag: 'http://i.imgur.com/nLPvW15b.jpg',
  // Index is # of adjacent bombs
  bombs: [
    'http://i.imgur.com/Flqdqi1b.jpg', // 0
    'http://i.imgur.com/bM8oExob.jpg', // 1
    'http://i.imgur.com/bQKSbqYb.jpg', // 2
    'http://i.imgur.com/5jNcEeVb.jpg', // 3
    'http://i.imgur.com/BnxjHgHb.jpg', // 4
    'http://i.imgur.com/RaFrMYcb.jpg', // 5
    'http://i.imgur.com/GlwQOy0b.jpg', // 6
    'http://i.imgur.com/8ngsVa8b.jpg', // 7
    'http://i.imgur.com/lJ8P1wab.jpg'  // 8
  ]
};

function renderUI() {
  let form = $('<form/>')
  $('<input/>', {
    class:'gridSize',
    type:'text',
    placeholder: 'enter N for a N*N grid'
  }).appendTo(form);

  $('<input/>', {
    class:'bombCount',
    type:'text',
    placeholder: 'enter bomb count'
  }).appendTo(form);

  form.appendTo('body');

  $('<button/>', {
    class:'startGame',
    text:'start game',
  }).appendTo('body');

  $('<h4/>', { 
    class:'feedback', 
    text: ''
  }).appendTo('body')

  $('<div/>', {
    class:'grid'
  }).appendTo('body');

}


function initializedField(gridSize, bombCount) {
  $('body').off('click');
  renderFeedBack('');

  let game = new MineField(gridSize, bombCount);
  let gridDiv = $('<div/>', { class:'grid' });
  let rows = [];

  game.field.forEach(function(row, rowIdx) {
    let rowDiv = $('<div/>', { class:'row' });
    row.forEach((cell, colIdx) => {
      let cellElement = $('<button/>');
      cellElement.css('background-image', 'url(' + icons.blank + ')');
      cellElement.addClass('cell covered');
      cellElement.data('index', [rowIdx, colIdx]);
      rowDiv.append(cellElement);
    });
    gridDiv.append(rowDiv);
  });

  $('.grid').replaceWith(gridDiv);

  function handleClick() {
    const {index} = $(this).data();
    const results = game.uncoverAt(index);

    if (results.isBomb === false) {
      renderCells(results.newlyUnCoverCells, function(cellElement, cellIndex) {
        const [rowIdx, colIdx] = cellIndex;
        const {adjacentBombCount} = game.field[rowIdx][colIdx];
        cellElement.css('background-image', 'url(' + icons.bombs[adjacentBombCount] + ')');
      })
      if (results.coveredEmptyCellsCount === 0) {
        $('.covered').removeClass('covered');
        renderFeedBack('you win');
      }
    } else {
      renderCells(results.newlyUnCoverCells, function(cellElement, cellIndex) {
        if (index[0] === cellIndex[0] && index[1] === cellIndex[1]) {
          cellElement.css('background-image', 'url(' + icons.explodedBomb + ')');
        } else {
          cellElement.css('background-image', 'url(' + icons.exposedBomb + ')');
        }
      })
      $('.covered').removeClass('covered');
      renderFeedBack('game over');
    }
  };

  $('body').on('click', ".covered", handleClick);
};


function renderCells(cellIndexes, callback) {
  cellIndexes.forEach(function(cellIndex) {
    const [rowIdx, colIdx] = cellIndex;
    let cellElement = $('.grid').children().eq(rowIdx).children().eq(colIdx);
    cellElement.removeClass('covered');
    callback(cellElement, cellIndex);
  });
}


function renderFeedBack(text) {
  $('.feedback').text(text);
}


$( document ).ready(function() {
  renderUI();

  $('.startGame').on('click', function() {
    let gridSize = $('.gridSize').val();
    let bombCount = $('.bombCount').val();
    if (/^[0-9]*$/.test(gridSize + bombCount) && gridSize !== '' && bombCount !== '') {
      if (bombCount >= gridSize * gridSize) {
        renderFeedBack('number of bombs cannot exceed or equal to total number of ceils');
      } else {
        initializedField(parseInt(gridSize, 10), parseInt(bombCount, 10))
        $('.startGame').text('restart game');
      }
    } else {
      renderFeedBack('numeric input only');
    }
  });
  
});