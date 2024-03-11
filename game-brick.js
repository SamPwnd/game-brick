let canvas = document.getElementById('my-canvas');
let ctx = canvas.getContext('2d');

// Definizione delle difficoltà del gioco
const difficulties = ["easy", "medium", "high", "impossible"];
let difficultyIndex = 3;
let difficulty = difficulties[difficultyIndex];

// Funzione per generare un colore casuale per i mattoncini
function randomColor(color, difficulty) {
    let ifSpecialBrick = Math.floor(Math.random() * 100);
    if (ifSpecialBrick == 1) {
        return 'black';
    }
    // Definizione dei colori in base alla difficoltà
    let colors;
    if (difficulty === 'easy') {
        colors = ['blue', 'limegreen', 'gold'];
    } else if (difficulty === 'medium') {
        colors = ['blue', 'limegreen', 'gold', 'crimson', 'coral'];
    } else if (difficulty === 'high') {
        colors = ['blue', 'limegreen', 'gold', 'crimson', 'coral', 'lightseagreen', 'orchid'];
    } else if (difficulty === 'impossible') {
        colors = ['blue', 'limegreen', 'gold', 'crimson', 'coral', 'lightseagreen', 'orchid','navy', 'indigo', 'slateGray'];
    }

    if(color != null){
        let index = colors.indexOf(color);
        colors.splice(index,1);
    }
    let randomCol = Math.random()*colors.length | 0;
    return colors[randomCol];
}

// Definizione delle dimensioni e del layout dei mattoncini
let mTop = 30;
let mLeft = 30;
let brickSize = 50;
let brickRowCount = 7;
let brickColCount = 12;
let brickPadding = 10;

let totalScore = 0;

// Inizializzazione della matrice dei mattoncini
let bricks = [];
for(let c=0; c<brickColCount; c++) {
    bricks[c] = [];
    for(let r=0; r<brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, color: 'none', destroying: false };
    }
}

// Disegna i mattoncini
function drawBricks(difficulty) {
    for(let c=0; c<brickColCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            let brickX = (c*(brickSize + brickPadding)) + mLeft;
            let brickY = (r*(brickSize + brickPadding)) + mTop;

            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            bricks[c][r].color = randomColor(null, difficulty);
            // Disegna il mattoncino con uno stile arrotondato
            ctx.beginPath();
            ctx.moveTo(brickX + 10, brickY);
            ctx.arcTo(brickX + brickSize, brickY, brickX + brickSize, brickY + brickSize, 10);
            ctx.arcTo(brickX + brickSize, brickY + brickSize, brickX, brickY + brickSize, 10);
            ctx.arcTo(brickX, brickY + brickSize, brickX, brickY, 10);
            ctx.arcTo(brickX, brickY, brickX + brickSize, brickY, 10);
            ctx.closePath();

            ctx.fillStyle = bricks[c][r].color;
            ctx.fill();
            
        }
    }
    // Carica i dati salvati
    getSave();
    // Gestisce il clic sui mattoncini
    brickClick();
}

// Gestisce il clic sui mattoncini
function brickClick(){
    canvas.addEventListener('click', (e) => {
        let x = e.offsetX;
        let y = e.offsetY;
        for(let c=0; c<brickColCount; c++) {
            for(let r=0; r<brickRowCount; r++) {
                let brickX = (c*(brickSize + brickPadding)) + mLeft;
                let brickY = (r*(brickSize + brickPadding)) + mTop;
                if(x >= brickX && x <= brickX+brickSize && y >= brickY && y <= brickY+brickSize) {
                    if(bricks[c][r].color == 'black'){
                        removeCol(c);
                        removeRow(r);
                        printScore(brickColCount+brickRowCount);
                    }
                    else {
                        let destroyCont = nearObserver(c, r, bricks[c][r].color, 0);
                        destroyFinder(destroyCont);
                    }
                    brickFall();
                }
            }
        }
        // Salva lo stato del gioco
        localStorage.setItem('bricks', JSON.stringify(bricks));
        // Controlla se è terminata la partita
        gameOver();
    })
}

// Avvia la pagina di gioco
function startPage(){
    ctx.fillStyle = 'orange';
    ctx.fillRect(0, canvas.height/3, canvas.width, 110);
    ctx.font = "46px Impact";
    ctx.fillStyle = "white";
    let saveScore = JSON.parse(localStorage.getItem('score'));
    if (saveScore > 0) {
        ctx.fillText("CONTINUA PARTITA", canvas.width/4, canvas.height/2-10);
    }
    else ctx.fillText("INIZIA PARTITA", canvas.width/3, canvas.height/2-10);

    canvas.addEventListener('click', start);
    function start(e){
        let x = e.offsetX;
        let y = e.offsetY;
        if(x >= 0 && x <= canvas.width && y >= canvas.height/3 && y <= canvas.height/3 + 110){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let scoreBlock = document.querySelector('.score-block');
            scoreBlock.style.display = 'flex';
            drawBricks(difficulty);
            canvas.removeEventListener('click', start);
        }
        
    }
}

// Funzione ricorsiva per contare i mattoncini adiacenti dello stesso colore
function nearObserver(x, y, color, num) {
      if(y<0 || x<0 || x >= brickColCount || y >= brickRowCount || bricks[x][y] == null || bricks[x][y].color != color || bricks[x][y].destroying ) return 0;
      let cont = ++num;
      let tmp = 0;
      bricks[x][y].destroying = true;
      tmp = nearObserver(x, y+1, color, cont);
      if(tmp) cont = tmp;
      tmp = nearObserver(x, y-1, color, cont);
      if(tmp) cont = tmp;
      tmp = nearObserver(x-1, y, color, cont);
      if(tmp) cont = tmp;
      tmp = nearObserver(x+1, y, color, cont);
      if(tmp) cont = tmp;
      
      return cont;
}

// Funzione per rimuovere i mattoncini
function destroyFinder(destroyCont){
    if(destroyCont > 2){
        for(let c=0; c<brickColCount; c++) {
            for(let r=0; r<brickRowCount; r++) {
                if(bricks[c][r] != null && bricks[c][r].destroying == true){
                    bricks[c][r] = null;
                    let brickX = (c*(brickSize + brickPadding)) + mLeft;
                    let brickY = (r*(brickSize + brickPadding)) + mTop;
                    ctx.clearRect(brickX, brickY, brickSize, brickSize);
                }
            }
        }
        printScore(destroyCont);
    }
}

// Funzione per aggiornare il punteggio e visualizzarlo
function printScore(score){
    totalScore += score;
    let scoreText = document.getElementById('score');
    scoreText.innerText = totalScore;
    localStorage.setItem('score', JSON.stringify(totalScore));
}

// Funzione per rimuovere una riga di mattoncini
function removeRow(row) {
    for (let i = 0; i < brickColCount; i++) {
        let brickX = (i*(brickSize + brickPadding)) + mLeft;
        let brickY = (row*(brickSize + brickPadding)) + mTop;
        ctx.clearRect(brickX, brickY, brickSize, brickSize);
        bricks[i][row] = null;
    }
}

// Funzione per rimuovere una colonna di mattoncini
function removeCol(col) {
    for (let i = 0; i < brickColCount; i++) {
        let brickX = (col*(brickSize + brickPadding)) + mLeft;
        let brickY = (i*(brickSize + brickPadding)) + mTop;
        ctx.clearRect(brickX, brickY, brickSize, brickSize);
        bricks[col][i] = null;
    }
}

// Funzione per far cadere i mattoncini
function brickFall(){
    for(let c=brickColCount-1; c >= 0; c--) {
        let cont = 0;
        for(let r=brickRowCount-1; r > 0; r--) {
            if(bricks[c][r] == null){
                bricks[c].splice(r,1);
                cont++;
            }
        }
        for (let i = 0; i < cont; i++){
            bricks[c].unshift(null);
        }
    }
    redrawBricks(difficulty);
}    

// Funzione per ridisegnare i mattoncini dopo la caduta
function redrawBricks(difficulty){
    for(let c=0; c<brickColCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            let brickX = (c*(brickSize + brickPadding)) + mLeft;
            let brickY = (r*(brickSize + brickPadding)) + mTop;

            if(bricks[c][r] == null){
                let tempCol = bricks[c].find(el => el !== null)
                bricks[c][r] = { x: 0, y: 0, color: 'none', destroying: false };
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                if(tempCol != undefined) bricks[c][r].color = randomColor(tempCol.color, difficulty);
                else bricks[c][r].color = randomColor(null, difficulty);
                ctx.beginPath();
                ctx.moveTo(brickX + 10, brickY);
                ctx.arcTo(brickX + brickSize, brickY, brickX + brickSize, brickY + brickSize, 10);
                ctx.arcTo(brickX + brickSize, brickY + brickSize, brickX, brickY + brickSize, 10);
                ctx.arcTo(brickX, brickY + brickSize, brickX, brickY, 10);
                ctx.arcTo(brickX, brickY, brickX + brickSize, brickY, 10);
                ctx.closePath();

                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
            }

            else {
                ctx.beginPath();
                ctx.moveTo(brickX + 10, brickY);
                ctx.arcTo(brickX + brickSize, brickY, brickX + brickSize, brickY + brickSize, 10);
                ctx.arcTo(brickX + brickSize, brickY + brickSize, brickX, brickY + brickSize, 10);
                ctx.arcTo(brickX, brickY + brickSize, brickX, brickY, 10);
                ctx.arcTo(brickX, brickY, brickX + brickSize, brickY, 10);
                ctx.closePath();

                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
            }
        }
    }
}

// Controlla se è terminata la partita
function gameOver(){
    let cont = 0;
    for(let c=0; c<brickColCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            cont = nearObserver(c, r, bricks[c][r].color, 0);
            if(cont > 2 || bricks[c][r].color == 'black') {
                defuse();
                return;
            }
        }
    }
    gameOverMessage();
    console.log('GAME OVER');
}

// Disinnesca i mattoncini
function defuse(){
    for(let c=0; c<brickColCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            if(bricks[c][r] != null) bricks[c][r].destroying = false;
        }
    }
}

// Visualizza il messaggio di game over
function gameOverMessage(){
    ctx.fillStyle = 'orange';
    ctx.fillRect(0, canvas.height/3, canvas.width, 110);
    ctx.font = "46px Impact";
    ctx.fillStyle = "white";
    ctx.fillText("GAME OVER :(", canvas.width/3, canvas.height/2-10);
}

// Cambia la difficoltà del gioco
const difficultyBtn = document.getElementById('difficulty');
difficultyBtn.addEventListener('click', toggleDifficulty);
difficultyBtn.textContent = `Difficulty: ${difficulty}`;

function toggleDifficulty() {
    difficultyIndex++;
    if (difficultyIndex >= difficulties.length) {
        difficultyIndex = 0;
    }
    difficulty = difficulties[difficultyIndex];
    difficultyBtn.textContent = `Difficulty: ${difficulty}`;    
    reset();
}

// Resetta il gioco
function reset(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    totalScore = 0;
    localStorage.setItem('score', JSON.stringify(0));
    localStorage.setItem('bricks', JSON.stringify(null));
    drawBricks(difficulty);
    printScore(0);
}

// Gestisce il clic sul pulsante di reset
const resetBtn = document.getElementById('reset');
resetBtn.addEventListener('click', reset);

// Carica lo stato salvato del gioco
function getSave(){
    let savedBricks = JSON.parse(localStorage.getItem('bricks'));
    if(savedBricks != null){
        bricks = savedBricks;
        
        for(let c=0; c<brickColCount; c++) {
            for(let r=0; r<brickRowCount; r++) {
                let brickX = (c*(brickSize + brickPadding)) + mLeft;
                let brickY = (r*(brickSize + brickPadding)) + mTop;
    
                ctx.beginPath();
                ctx.moveTo(brickX + 10, brickY);
                ctx.arcTo(brickX + brickSize, brickY, brickX + brickSize, brickY + brickSize, 10);
                ctx.arcTo(brickX + brickSize, brickY + brickSize, brickX, brickY + brickSize, 10);
                ctx.arcTo(brickX, brickY + brickSize, brickX, brickY, 10);
                ctx.arcTo(brickX, brickY, brickX + brickSize, brickY, 10);
                ctx.closePath();

                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
            }
        }
    }
    let savedScore = JSON.parse(localStorage.getItem('score'));
    if(savedScore > 0){
        totalScore = 0;
        printScore(savedScore);
    };
}

// Avvia il gioco quando il DOM è caricato
document.addEventListener('DOMContentLoaded', function() {
    startPage();
});