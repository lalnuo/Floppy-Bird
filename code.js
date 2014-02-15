var canvas;
var context;
var isGameOver = false;
var framerate = 1000/30;
var player;
var ratio = 43.2;
var mapWidth = 1024;
var mapHeight = 768;
var gravity = 0;
var towers = [];
var groundTiles = [];
var ground;

$(document).ready(function(){
    $(window).keypress(function(e){      
 
        if(e.charCode == 32 || e.keyCode == 38){
            gravity = -11;
        }
        if(e.keyCode == 13){
            restart();
        }
    });
    
});

document.addEventListener('touchstart', function(e){
    e.preventDefault();
    jump();
});

$("#game").swipe({
    swipe:function(event, direction, distance, duration, fingerCount){
        restart();
    },
    threshold:100
});

function jump(){
    gravity = -10;
}

function restart(){
    framesGone = 120;
    score = 0;
    isGameOver = false;
    player.y = window.innerHeight/2;
    towers = [];
    beginningTime = new Date() / 1000;
    gravity = -15;
}

function Player(){
    this.x = 100;
    this.y = window.innerHeight/2;
    this.color = "rgba(255,255,0,1)";
}

function Tower(y,up){
    this.x = mapWidth;
    this.y = y; 
    this.width = 100;
    this.scored = false;
    this.up = up;
    this.checkCollision = function(player){
        //check if player is between towers x
        if(player.x+25 >= this.x && player.x < this.x + 100){
            if(this.up){
                if(player.y <=this.y){
                    gameOver();
                }
            }

            if(!this.up){
                if(player.y >= (mapHeight - this.y-50)){
                    gameOver();
                }
            }
        }
    };
}

function drawPlayer(){
    context.fillStyle = "#00FF00";
    context.fillRect(player.x, player.y, 25,25);
}

var setup = function(){
    canvas = document.getElementById("game");
    context = canvas.getContext("2d");
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    player = new Player();
    generateGround();
}

function generateGround(){
    ground = new Image()
    ground.onload = function(){
        for(var i = mapWidth+32; i>0; i-=32){
            groundTiles.push(i);
        }
    }
    ground.src = 'grass_32x32.png';
}


//this method moves tiles by 3 pixels, if tile gets out of the screen it will be returned back to right side
function moveGround(){
    for(var i = 0; i < groundTiles.length; i++){
        groundTiles[i] = (groundTiles[i] < -32) ? groundTiles[i] = mapWidth-2 : groundTiles[i]-=3;
    }
}

function drawGround(){
    moveGround();
    groundTiles.forEach(function(i){ 
        context.drawImage(ground,i,mapHeight-32);
    });
}

function checkPlayer(){
    //checks player doesn't hit the ground
    if(player.y > mapHeight-62){
       gameOver();
    }
    //checks player doesn't hit towers
    towers.forEach(function(tower){
        tower.checkCollision(player);
    }); 
}

function gameOver(){ 
        context.fillStyle = "red";
        context.font = "bold 15px Arial";
        context.fillText("Game Over | Score: "+score,mapWidth/2-80,mapHeight/2); 
        isGameOver = true;
        player.y = 100;
}


function generateTowerPair(){ 
    var tower1Height = Math.floor(Math.random()*(mapHeight*0.6))+(mapHeight*0.2);
    var tower2Height = mapHeight-tower1Height-(mapHeight*0.225); // 0.1875 = 18% gap between towers
    towers.push(new Tower(tower1Height,false)); 
    towers.push(new Tower(tower2Height,true)); 
}

function moveTowers(){
    var passedTowers = [];
    var i = 0; // counter to check if tower is up or down
    towers.forEach(function(tower){
        context.fillStyle ="rgb("+(Math.round(tower.x/3))+",255,60)";
        tower.x-=3;
        if (i % 2 == 0){ 
            context.fillRect(tower.x,mapHeight-tower.y-32,100,tower.y); //-32 so it doesn't draw on the grass
        }else{
            context.fillRect(tower.x,0,100,tower.y);
        }

        if(tower.x <= -100){ // checking if we have already passed the tower
            score+=0.5; // 0.5 because always 2 towers passed at the same time
            passedTowers.push(tower);
        }
        i++;
    });
    removePassedTowers(passedTowers);

}

function removePassedTowers(passedTowers){
    passedTowers.forEach(function(i){
        var index = towers.indexOf(i);
        towers.splice(index,1);
    });
}



function writeScore(){
    if(!isGameOver){
        context.font= "40px Arial";
        context.fillText(score,35,35); 
        return score;
    }
}
var score = 0;
var fps = 100;
var now;
var then = Date.now();
var interval = 1000/fps;
var delta;
var framesGone = 120;
function game() {
    requestAnimationFrame(game)
    var now = Date.now();
    delta = now - then;
    if(delta > interval){
    if(!isGameOver){
            if(framesGone % 120 == 0){ 
                generateTowerPair();
            }
            gravity+=0.8;
            player.y+=gravity
            context.fillStyle = "#FFFFFF";
            context.fillRect(0,0,window.innerWidth,mapHeight-32); 
            moveTowers();
            drawGround();
            drawPlayer();
            checkPlayer();
            writeScore();
        }    
    }
    framesGone++;
    then = now - (delta%interval);
}
setup();
game();
