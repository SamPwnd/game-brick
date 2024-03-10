let canvas = document.getElementById('my-canvas');
let ctx = canvas.getContext('2d');

function randomColor(color) {
    let ifSpecialBrick = Math.floor(Math.random() * 100);
    if (ifSpecialBrick == 1) {
        return 'black';
    }
    let colors = ['blue', 'limegreen', 'gold', 'crimson', 'darkorange', 'lightseagreen', 'orchid'];

    if(color != null){
        let index = colors.indexOf(color);
        colors.splice(index,1);
    }
    let randomCol = Math.random()*colors.length | 0;
    return colors[randomCol];
}

let mTop = 30;
let mLeft = 30;
let brickSize = 50;
let brickRowCount = 7;
let brickColCount = 12;
let brickPadding = 10;

let totalScore = 0;

let bricks = [];
for(let c=0; c<brickColCount; c++) {
    bricks[c] = [];
    for(let r=0; r<brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, color: 'none', destroying: false };
    }
}

function drawBricks() {
    for(let c=0; c<brickColCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            let brickX = (c*(brickSize + brickPadding)) + mLeft;
            let brickY = (r*(brickSize + brickPadding)) + mTop;

            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            bricks[c][r].color = randomColor(null);
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickSize, brickSize);
            ctx.fillStyle = bricks[c][r].color;
            ctx.fill();
            ctx.closePath();
            
        }
    }
    getSave();
    brickClick();
}

function brickClick(){
    canvas.addEventListener('click', (e) => {
        let x = e.offsetX;
        let y = e.offsetY;
        for(let c=0; c<brickColCount; c++) {
            for(let r=0; r<brickRowCount; r++) {
                let brickX = (c*(brickSize + brickPadding)) + mLeft;
                let brickY = (r*(brickSize + brickPadding)) + mTop;
                if(x >= brickX && x <= brickX+brickSize && y >= brickY && y <= brickY+brickSize) {
                    //console.log(brickY, brickY+brickSize, y);
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

                    //ctx.clearRect(brickX, brickY, brickSize, brickSize);
                }
            }
        }
        localStorage.setItem('bricks', JSON.stringify(bricks));
        
        gameOver();
    })
}

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
            drawBricks();
            canvas.removeEventListener('click', start);
        }
        
    }
}


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

function printScore(score){
    totalScore += score;
    let scoreText = document.getElementById('score');
    scoreText.innerText = totalScore;
    //if (score>0) {
        localStorage.setItem('score', JSON.stringify(totalScore));
    //}
    
}

function removeRow(row) {
    for (let i = 0; i < brickColCount; i++) {
        let brickX = (i*(brickSize + brickPadding)) + mLeft;
        let brickY = (row*(brickSize + brickPadding)) + mTop;
        ctx.clearRect(brickX, brickY, brickSize, brickSize);
        bricks[i][row] = null;
    }
}

function removeCol(col) {
    for (let i = 0; i < brickColCount; i++) {
        let brickX = (col*(brickSize + brickPadding)) + mLeft;
        let brickY = (i*(brickSize + brickPadding)) + mTop;
        ctx.clearRect(brickX, brickY, brickSize, brickSize);
        bricks[col][i] = null;
    }
}

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
    redrawBricks();
}    

function redrawBricks(){
    for(let c=0; c<brickColCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            let brickX = (c*(brickSize + brickPadding)) + mLeft;
            let brickY = (r*(brickSize + brickPadding)) + mTop;

            if(bricks[c][r] == null){
                let tempCol = bricks[c].find(el => el !== null)
                bricks[c][r] = { x: 0, y: 0, color: 'none', destroying: false };
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                if(tempCol != undefined) bricks[c][r].color = randomColor(tempCol.color);
                else bricks[c][r].color = randomColor(null);
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickSize, brickSize);
                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
                ctx.closePath();
            }

            else {
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickSize, brickSize);
                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

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

function defuse(){
    for(let c=0; c<brickColCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            if(bricks[c][r] != null) bricks[c][r].destroying = false;
        }
    }
}

function gameOverMessage(){
    ctx.fillStyle = 'orange';
    ctx.fillRect(0, canvas.height/3, canvas.width, 110);
    ctx.font = "46px Impact";
    ctx.fillStyle = "white";
    ctx.fillText("GAME OVER :(", canvas.width/3, canvas.height/2-10);

}

function reset(){
    let resetBtn = document.getElementById('reset');
    resetBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        totalScore = 0;
        localStorage.setItem('score', JSON.stringify(0));
        localStorage.setItem('bricks', JSON.stringify(null));
        drawBricks();
        printScore(0);
    })
}

function getSave(){
    let savedBricks = JSON.parse(localStorage.getItem('bricks'));
    if(savedBricks != null){
        bricks = savedBricks;
        
        for(let c=0; c<brickColCount; c++) {
            for(let r=0; r<brickRowCount; r++) {
                let brickX = (c*(brickSize + brickPadding)) + mLeft;
                let brickY = (r*(brickSize + brickPadding)) + mTop;
    
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickSize, brickSize);
                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
                ctx.closePath();
                
            }
        }
    }
    let savedScore = JSON.parse(localStorage.getItem('score'));
    if(savedScore > 0){
        totalScore = 0;
        printScore(savedScore);
    };
}

startPage();
reset();
