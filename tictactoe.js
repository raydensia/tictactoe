EMPTY = null;
X = 'X';
O = 'O';

const gameBoard = document.getElementById('gameboard');
const gameBoardSquares = document.querySelectorAll('.square');
const title = document.getElementById('title');
const xButton = document.getElementById('X');
const oButton = document.getElementById('O');
const resetGameButton = document.getElementById('play-again');


const Player = (name) => {
  let wins = 0;
  const setName = (set) => name = set; 
  const getName = () => name;
  const getWins = () => wins;
  const win = () => wins += 1;
  return {setName, getName, getWins, win, wins};
};

const player1 = Player(X);
const computer = Player(O);


const ttt = (() => {
  let state = [[EMPTY, EMPTY, EMPTY],[EMPTY, EMPTY, EMPTY],[EMPTY, EMPTY, EMPTY]];
  let gameMode = 'singleplayer';
  let turn;
  
  const initialState = () => [[EMPTY, EMPTY, EMPTY],[EMPTY, EMPTY, EMPTY],[EMPTY, EMPTY, EMPTY]];
  
  const setState = (s) => {
    state = s;
  };

  const getState = () => state;

  const setGameMode = (mode) => {
    gameMode = mode;
  };

  const updateGameBoard = (s) => {
    state = s;
    gameBoard.classList = 'grid';
    let i = 0;
    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 3; column++) {
        if (state[row][column] === null) {
          gameBoardSquares[i].textContent = '';
          // gameBoard.innerHTML += `<div class="square square${i}"></div>`;
        }
        else {
          gameBoardSquares[i].textContent = `${state[row][column]}`;
          // gameBoard.innerHTML += `<div class="square square${i}">${state[row][column]}</div>`;
        }
        i += 1;
      }
    }
  };
  
  const player = (s) => {
    let flat_board = s.flat(1);
    if (s == initialState()) {
      return X;
    }
    let number_of_X = flat_board.filter(x => x===X).length;
    let number_of_O = flat_board.filter(x => x==O).length;
    if (number_of_X > number_of_O) {
      return O;
    }
    else {
      return X;
    }
  };

  const actions = (s) => {
    let possibilities = new Set();

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (s[i][j] == EMPTY) {
          possibilities.add([i,j]);
        }
      }
    }
    return possibilities;
  };

  const result = (s, action) => {
    let resulting_state = structuredClone(s);
    if (s[action[0]][action[1]] != EMPTY) {
      throw new Error('Invalid move!');
    }
    else {
      if (player(s) == X) {
        resulting_state[action[0]][action[1]] = X;
      }
      else {
        resulting_state[action[0]][action[1]] = O;
      }
    }
    return resulting_state;
  };

  const winner = (s) => {
    for (let i = 0; i < 3; i++) {
      let row_check = check_row(s, i);
      let column_check = check_column(s, i);
      let diagonals_check = check_diagonals(s);
      if (row_check !== null) {
        return row_check;
      }
      if (column_check !== null) {
        return column_check;
      }
      if (diagonals_check !== null) {
        return diagonals_check;
      }
    }
    return null;
  };

  const terminal = (s) => {
    if (winner(s) !== null) {
      return true;
    }
    let flat_board = s.flat(1);
    if (flat_board.includes(EMPTY) === false) {
      return true;
    }
    else {
      return false;
    }
  };

  const utility = (s) => {
    let victor = winner(s);
    if (victor === X) {
      return 1;
    }
    else if (victor === O) {
      return -1;
    }
    else {
      return 0;
    }
  };

  const minimax = (s) => {
    if (terminal(s)) {
      return null;
    }

    let current_player = player(s);
    let optimal_action = null;

    if (current_player === X) {
      let max_utility = -5;
      actions(s).forEach((action) => {
        let v = min_value(result(s, action))
        if (v > max_utility) {
          max_utility = v;
          optimal_action = action;
        }
      })
    }
    else if (current_player === O) {
      let min_utility = 5;
      actions(s).forEach((action) => {
        let v = max_value(result(s, action))
        if (v < min_utility) {
          min_utility = v;
          optimal_action = action;
        }
      })
    }
    return optimal_action
  };

  const max_value = (s) => {
    if (terminal(s)) {
      return utility(s);
    }
    v = -5;
    actions(s).forEach((action) => {
      v = Math.max(v, min_value(result(s, action)));
    })
    return v;
  };

  const min_value = (s) => {
    if (terminal(s)) {
      return utility(s);
    }
    v = 5;
    actions(s).forEach((action) => {
      v = Math.min(v, max_value(result(s, action)));
    })
    return v;
  };

  const check_row = (s, row) => {
    if ((s[row][0] == s[row][1]) && (s[row][1] == s[row][2]) && (s[row][0] !== EMPTY)) {
      return s[row][0];
    }
    else {
      return null;
    }
  };

  const check_column = (s, col) => {
    if ((s[0][col] == s[1][col]) && (s[1][col] == s[2][col]) && (s[0][col] !== EMPTY)) {
      return s[0][col];
    }
    else {
      return null;
    }
  };

  const check_diagonals = (s) => {
    if ((s[0][0] == s[1][1] && s[1][1] == s[2][2] && s[0][0] !== EMPTY) || (s[2][0] == s[1][1] && s[1][1] == s[0][2] && s[2][0] !== EMPTY)) {
          return s[1][1]
          }
    else {
      return null
    }
  };
  
  const clickSquare = (e) => {
    //only works if it is the player's turn
    if (turn === 'player') {
      let num = e.target.getAttribute('id');
      const choices = [[0,0], [0,1], [0,2], [1,0], [1,1], [1,2], [2,0], [2,1], [2,2]];
      let action = choices[num];
      let possibilities = actions(state);
    
      for (let item of possibilities.keys()) {
        if (item.toString() === action.toString()) {
          let new_state = result(state, action);
          updateGameBoard(new_state);
          turn = 'computer';
          playRound();
        }
      }
    }
  };
  
  const resetGame = () => {
    title.textContent = 'Pick a symbol:';
    xButton.style.display = 'inline-block';
    oButton.style.display = 'inline-block';
    gameBoard.classList = 'grid hidden';
    resetGameButton.classList = 'hidden';
    s = initialState();
    player1.wins = 0;
    computer.wins = 0;
  };

  const playRound = () => {
    // Handle game over
    if (terminal(state)) {
      gameOver();
    }

    // Check for computer move
    if (turn == 'computer') {
      let move = minimax(state);
      let new_state = result(state, move);
      updateGameBoard(new_state);
      if (terminal(state)) {
        gameOver();
      }
      turn = 'player';
    }
  };

  const gameOver = () => {
    let victor = winner(state);
    if (victor === null) {
      title.textContent = 'Game Over: Tie.';
    }
    else {
      title.textContent = `Game Over: ${victor} wins.`;
    }
    resetGameButton.classList = '';
    return
  }

  const initiateGame = (starting_player) => {
    state = initialState();
    xButton.style.display = 'none';
    oButton.style.display = 'none';
    updateGameBoard(state);

    if (starting_player === X) {
      player1.setName(X);
      computer.setName(O);
      title.textContent = "You are X. X goes first.";
      turn = 'player';
    }
  
    else if (starting_player == O) {
      player1.setName(O);
      computer.setName(X);
      turn = 'computer';
    }
    playRound();
  };

  return {initialState, updateGameBoard, setState, getState, player, actions, result, winner, terminal, resetGame, clickSquare, initiateGame, playRound};

})();

xButton.addEventListener('click', () => ttt.initiateGame(X));
oButton.addEventListener('click', () => ttt.initiateGame(O));
gameBoardSquares.forEach((square) => {
  square.addEventListener('click', (e) => ttt.clickSquare(e));
})
resetGameButton.addEventListener('click', ttt.resetGame);