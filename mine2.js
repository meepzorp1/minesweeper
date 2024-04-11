const elements = {
    board: document.querySelector('#board'),
    cell: document.querySelectorAll('.cell'),
    head: document.querySelector('#head'),
    message: document.querySelector('#message'),
    flagsLeft: document.querySelector('#flags-left'),
    time: document.querySelector('#time'),
    btnReset: document.querySelector('#reset'),
    btnEasy: document.querySelector('#easy'),
    btnMedium: document.querySelector('#medium'),
    btnHard: document.querySelector('#hard'),
}

const level = {
    easy: { rows: 10, cols: 10, size: 40, mines: 1, padLeft: 3, padTop: 2, fontSize: 1.9, mineSize: 1.8, flagSize: 1.5 },
    medium: { rows: 14, cols: 14, size: 30, mines: 40, padLeft: 1, padTop: 3, fontSize: 1.6, mineSize: 1.5, flagSize: 1.2 },
    hard: { rows: 20, cols: 20, size: 25, mines: 100, padLeft: 0, padTop: 3, fontSize: .8, mineSize: 1.2, flagSize: .9 }
};

const timer = () => {
    timerId = setInterval(() => {
        elements.time.innerHTML++;
    }, 1000);
}

let difficulty = level.easy;
let timerId;
let reset = false;
let gameover, gameStarted = false;

const initGame = () => {
    elements.message.style.display = 'none';
    elements.flagsLeft.style.display = 'block';
    elements.board.innerHTML = '';
    elements.flagsLeft.innerHTML = difficulty.mines;
    elements.time.innerHTML = 0;
    clearInterval(timerId);
    gameover = false;
    gameStarted = false;
    elements.board.style.pointerEvents = 'auto';

// MIGHT CHANGE

    elements.board.style.width = `${difficulty.cols * difficulty.size + 2}px`;
    elements.board.style.height = `${difficulty.rows * difficulty.size + 2}px`;
    createBoard(difficulty.rows, difficulty.cols, difficulty.mines);
    console.log(difficulty.size)
}

const createBoard = (rows, cols, mines) => { // Create game board
    const minesArray = Array(mines).fill('mine'); // Create array with mines
    const emptyArray = Array(rows * cols - mines).fill('empty'); // Create array with empty cells
    const gameArray = emptyArray.concat(minesArray); // Concatenate arrays
    const shuffledArray = gameArray.sort(() => Math.random() - 0.5); // Shuffle array

    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement('div');
        cell.setAttribute('id', i);
        cell.classList.add('cell'); // class[0]
        cell.classList.add(shuffledArray[i]); // class[1]
        cell.style.width = `${difficulty.size}px`;
        cell.style.height = `${difficulty.size}px`;
        cell.style.lineHeight = `${difficulty.size}px`;
        elements.board.appendChild(cell);
    }
    for (let i = 0; i < rows * cols; i++) {
        let total = 0;
        const isLeftEdge = i % cols === 0;
        const isRightEdge = i % cols === cols - 1;
        if (shuffledArray[i] === 'empty') {
            // Check top
            if (i > cols && shuffledArray[i - cols] === 'mine') total++;
            // Check top-left
            if (i > cols + 1 && !isLeftEdge && shuffledArray[i - 1 - cols] === 'mine') total++;
            // Check top-right
            if (i > cols - 1 && !isRightEdge && shuffledArray[i + 1 - cols] === 'mine') total++;
            // Check left
            if (i > 0 && !isLeftEdge && shuffledArray[i - 1] === 'mine') total++;
            // Check right
            if (i < cols * rows - 1 && !isRightEdge && shuffledArray[i + 1] === 'mine') total++;
            // Check bottom
            if (i < cols * rows - cols && shuffledArray[i + cols] === 'mine') total++;
            // Check bottom-left
            if (i < cols * rows - cols + 1 && !isLeftEdge && shuffledArray[i - 1 + cols] === 'mine') total++;
            // Check bottom-right
            if (i < cols * rows - cols - 1 && !isRightEdge && shuffledArray[i + 1 + cols] === 'mine') total++;
            elements.board.childNodes[i].classList.add(total); // class[2]
        }
    }
    console.log('board created');
}

// does it make sense to checkWin twice in this function?

const click = (cell) => {
    console.log(cell);
    if (!gameStarted) {
        gameStarted = true;
        timer();
    }
    const cellId = cell.id;
    if (gameover) return;
    if (cell.classList.contains('checked') || cell.classList.contains('flag')) return;
    if (cell.classList.contains('mine')) gameOver(cell);
    else {
        const total = cell.classList[2];
        if (total != 0) {
            cell.innerHTML = total;
            cell.classList.add('checked');
            checkWin(); 
            return;
        }
        checkCell(cell);
    }
    checkWin();
}

const addFlag = (cell) => {
    if (gameover) return;
    if (!cell.classList.contains('checked') && (elements.flagsLeft.innerHTML > 0 || cell.classList.contains('flag'))) {
        if (!cell.classList.contains('flag')) {
            // class[3]
            cell.classList.add('flag');
            cell.style.fontSize = `${difficulty.flagSize}rem`;
            cell.innerHTML = '🚩';
            elements.flagsLeft.innerHTML--;
        } else {
            cell.classList.remove('flag');
            cell.style.fontSize = '1.9rem';
            cell.innerHTML = '';
            elements.flagsLeft.innerHTML++;
        }
    }
    checkWin();
}

const checkWin = () => {
    let win = true;
    elements.board.childNodes.forEach(cell => {
        // cell contains mine and is not flagged
        if (cell.classList.contains('mine') && !cell.classList.contains('flag')) {
            win = false;
            if (elements.flagsLeft.innerHTML == '0') {
                console.log("cell contained mine not flagged")
            }
        }
        // non mined cells still unchecked
        if (!cell.classList.contains('mine') && !cell.classList.contains('checked')) {
            win = false;
            if (elements.flagsLeft.innerHTML == '0') {
                console.log(cell.classList)
                console.log('non mined cells still unchecked', cell, 'id: ' + cell.id)
            }
        }
    });
    if (document.querySelectorAll('div.cell').length - document.querySelectorAll('div.checked').length == parseInt(elements.flagsLeft.innerHTML)) win = true;
    if (win) {
        elements.message.style.display = 'block';
        elements.message.innerHTML = 'You Win!';
        clearInterval(timerId);
        elements.board.style.pointerEvents = 'none';
        elements.flagsLeft.style.display = 'none';
        elements.head.classList.add('win');
    }
}

const checkCell = (cell) => {
    const currentId = cell.id;
    const cols = difficulty.cols;
    const isLeftEdge = currentId % cols === 0;
    const isRightEdge = currentId % cols === cols - 1;

    elements.board.childNodes[currentId].classList.add('checked');
    elements.board.childNodes[currentId].style.backgroundColor = 'rgb(50, 50, 50)';

    setTimeout(() => {
        if (currentId > 0 && !isLeftEdge) {
            const newId = elements.board.childNodes[parseInt(currentId) - 1].id;
            const newCell = document.getElementById(newId);
            click(newCell);
        }
        if (currentId > cols - 1 && !isRightEdge) {
            const newId = elements.board.childNodes[parseInt(currentId) + 1 - cols].id;
            const newCell = document.getElementById(newId);
            click(newCell);
        }
        if (currentId > cols) {
            const newId = elements.board.childNodes[parseInt(currentId) - cols].id;
            const newCell = document.getElementById(newId);
            click(newCell);
        }
        if (currentId > cols + 1 && !isLeftEdge) {
            const newId = elements.board.childNodes[parseInt(currentId) - 1 - cols].id;
            const newCell = document.getElementById(newId);
            click(newCell);
        }
        if (currentId < cols * difficulty.rows - 1 && !isRightEdge) {
            const newId = elements.board.childNodes[parseInt(currentId) + 1].id;
            const newCell = document.getElementById(newId);
            click(newCell);
        }
        if (currentId < cols * difficulty.rows - cols) {
            const newId = elements.board.childNodes[parseInt(currentId) + cols].id;
            const newCell = document.getElementById(newId);
            click(newCell);
        }
        if (currentId < cols * difficulty.rows - cols - 1 && !isRightEdge) {
            const newId = elements.board.childNodes[parseInt(currentId) + 1 + cols].id;
            const newCell = document.getElementById(newId);
            click(newCell);
        }
        if (currentId < cols * difficulty.rows - cols + 1 && !isLeftEdge) {
            const newId = elements.board.childNodes[parseInt(currentId) - 1 + cols].id;
            const newCell = document.getElementById(newId);
            click(newCell);
        }
    }, 10);
}

const gameOver = (cell) => {
    gameover = true;
    clearInterval(timerId);
    elements.message.style.display = 'block';
    elements.message.innerHTML = 'Game Over';
    elements.board.style.pointerEvents = 'none';
cell.style.fontSize = `${difficulty.mineSize}rem`;
cell.style.paddingLeft = `${difficulty.padLeft}px`;
cell.style.paddingTop = `${difficulty.padTop}px`;
    cell.innerHTML = ' 💣'
    elements.board.childNodes.forEach(cell => {
        if (cell.classList.contains('mine')) {
            cell.style.paddingTop = `${difficulty.padTop}px`;
cell.style.fontSize = `${difficulty.mineSize}rem`;
cell.style.paddingLeft = `${difficulty.padLeft}px`;
            cell.innerHTML = ' 💣';
        }
    });
}

const resetGame = () => {
    reset = true;
    initGame();
}

initGame();

elements.btnEasy.addEventListener('click', () => {
    difficulty = level.easy;
    resetGame();
});
elements.btnMedium.addEventListener('click', () => {
    difficulty = level.medium;
    resetGame();
});
elements.btnHard.addEventListener('click', () => {
    difficulty = level.hard;
    resetGame();
});
elements.board.addEventListener('click', (e) => {
    click(e.target);
});
elements.btnReset.addEventListener('click', () => {
    resetGame();
});
elements.board.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    addFlag(e.target);
});