// 48, 156, 99 grass
// 76, 147, 173 water
// 65, 72, 89 wall

var size = 101;
var Board;

var canvas;
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-1')

    Board = new DomainBoard(int(size * 1.8), size); 

    frameRate(30);

    textSize(8);
    textAlign(CENTER, CENTER);
}

var mapGenerated = false;
var resetCounter = 0;
function draw() {
    background(0);
    noStroke();

    if (!mapGenerated) {
        for (var i = 0; i < 200; i++) {
            Board.GenerateBoard();
        }
        Board.Draw(windowWidth / 2, windowHeight / 2, windowWidth, windowHeight);
    } else {
        var times = 40;
        for (var i = 1; i < times; i++) { Board.StepPathFind(); }
        if (Board.StepPathFind() == -1) {
            resetCounter--;
            if (resetCounter <= 0) {
                Board = new DomainBoard(int(size * 1.8), size);
                mapGenerated = false; 
            }
        } else {
            resetCounter = frameRate() * 5;
        }
        Board.Draw(windowWidth / 2, windowHeight / 2, windowWidth, windowHeight);
    }
}

function ashuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}

class DomainBoard {
    constructor(w, h) {
        this.w = w;
        this.h = h;

        this.Data = [];
        for (var i = 0; i < this.w; i++) {
            this.Data[i] = [];
            for (var j = 0; j < this.h; j++) {
                this.Data[i][j] = 0;
            }
        }

	    var w2 = int(w / 2);
        this.StartLocation = [0 , 0];
        this.TargetLocation = [w - 1 , this.h - 1];
        this.StartDistance = this.DistanceFromTarget(this.StartLocation);
        this.lastPath = "";
        this.Foundi = -1;

        this.initialGen = true;
        this.MazeCheckStore = [];

        this.GenerateBoard();
    }

    inData(x, y) {
        return (x >= 0 && x < this.w && y >= 0 && y < this.h )
    }



    
    PlaceMaze(x, y, from) {
        //print("placed :", x, y, this.Data[x][y], this.w, this.h, from);
        this.Data[x][y] = 2;

        var checks = [
            [0, x, y - 1, x, y - 2, x - 1, y - 1, x + 1, y - 1],
            [1, x + 1, y, x + 2, y, x + 1, y - 1, x + 1, y + 1], 
            [2, x, y + 1, x, y + 2, x + 1, y + 1, x - 1, y + 1],
            [3, x - 1, y, x - 2, y, x - 1, y + 1, x - 1, y - 1]
        ];
        checks = ashuffle(checks);

        this.MazeCheckStore[this.MazeCheckStore.length] = [x, y, from, checks, 0];

        /*
        for (var i = 0; i < checks.length; i++) {
            if (checks[i][0] == from) { continue; }                  
            var x1 = checks[i][1], y1 = checks[i][2];
            var x2 = checks[i][3], y2 = checks[i][4];
            var x3a = checks[i][5], y3a = checks[i][6];
            var x3b = checks[i][7], y3b = checks[i][8];

            if (x1 < 0 || x1 >= this.w || y1 < 0 || y1 >= this.h) { continue; }  
            //print("checks :", x1, y1);
            if (this.Data[x1][y1] == 0) { 
                //print("no wall :", x1, y1);                
                if (this.inData(x3a, y3a)) { this.Data[x3a][y3a] = 1; }
                if (this.inData(x3b, y3b)) { this.Data[x3b][y3b] = 1; }
            
                if (this.inData(x2, y2)) {
                    if (this.Data[x2][y2] != 2) {
                        this.PlaceMaze(x2, y2, (checks[i][0] + 2) % 4);
                    } else {
                        this.Data[x1][y1] = 1;
                        //print(x1, y1, i, from);
                    }
                } 
            }
        }
        this.Data[x][y] = 0;
        */
    }

    TickMaze(index) {    
        var x = this.MazeCheckStore[index][0];
        var y = this.MazeCheckStore[index][1];
        var from = this.MazeCheckStore[index][2];
        var checks = this.MazeCheckStore[index][3];        
        var i = this.MazeCheckStore[index][4];

        if (checks[i][0] == from) { return; }                  
        var x1 = checks[i][1], y1 = checks[i][2];
        var x2 = checks[i][3], y2 = checks[i][4];
        var x3a = checks[i][5], y3a = checks[i][6];
        var x3b = checks[i][7], y3b = checks[i][8];

        if (x1 < 0 || x1 >= this.w || y1 < 0 || y1 >= this.h) { return; }  
        //print("checks :", x1, y1);
        if (this.Data[x1][y1] == 0) { 
            //print("no wall :", x1, y1);                
            if (this.inData(x3a, y3a)) { this.Data[x3a][y3a] = 1; }
            if (this.inData(x3b, y3b)) { this.Data[x3b][y3b] = 1; }
        
            if (this.inData(x2, y2)) {
                if (this.Data[x2][y2] != 2) {
                    this.PlaceMaze(x2, y2, (checks[i][0] + 2) % 4);
                } else {
                    this.Data[x1][y1] = 1;
                }
            } 
        }
        //
    }

    GenerateMaze() {
        if (this.initialGen) {
            this.PlaceMaze(0, 0);
            this.initialGen = false;
        }
        if (this.MazeCheckStore.length != 0) {
            var i = this.MazeCheckStore.length - 1;
            this.TickMaze(i);
            this.MazeCheckStore[i][4]++;
            if (this.MazeCheckStore[i][4] >= this.MazeCheckStore[i][3].length) {
                this.Data[this.MazeCheckStore[i][0]][this.MazeCheckStore[i][1]] = 0;
                this.MazeCheckStore.splice(i, 1);
            }
        } else {
            mapGenerated = true;
        }
    }
    
    GenerateRandom() {
        for (var i = 0; i < this.w; i++) {
            for (var j = 0; j < this.h; j++) {
                this.Data[i][j] = ((0.37 < random()) ? 0 : 1);
                //if (j == 8 && i != this.w - 1) {
                //    this.Data[i][j] = 1;
                //}
            }
        }   
        mapGenerated = true;
    }

    GenerateBoard() {
        if (!mapGenerated) {
            this.GenerateMaze();
        }

        if (mapGenerated){
            this.Data[this.StartLocation[0]][this.StartLocation[1]] = 0;
            this.Data[this.TargetLocation[0]][this.TargetLocation[1]] = 0;

            this.LiveNodes = [
                [
                    this.StartLocation[0],
                    this.StartLocation[1],                 
                    0,
                    ""
                ]
            ]; // x, y, path, score
            this.CheckNodes = []; // x, y, score [optimizable]
        }
    }

    Draw(x, y, maxW, maxH) {
        noStroke();
        var heightRatio = this.w / this.h;
        var scl = min(maxW, maxH * heightRatio) / max(this.w, this.h);

        x -= (this.w / 2) * scl;
        y -= (this.h / 2) * scl;
        
        for (var j = 0; j < this.h; j++) {
            for (var i = 0; i < this.w; i++) {
                switch (this.Data[i][j]) {
                    case 0: fill(165, 172, 189); break;
                    case 1: fill(45, 57, 75); break;
                    case 2: fill(200, 50, 50); break;
                }              
                rect(x + (i * scl), y + (j * scl), scl, scl);
            }
        }        

        if (mapGenerated) {
            fill(50, 150, 200);
            for (var i = 0; i < this.CheckNodes.length; i++) {
                rect(x + (this.CheckNodes[i][0] * scl), y + (this.CheckNodes[i][1] * scl), scl, scl);
            }
        
            for (var i = 0; i < this.LiveNodes.length; i++) {
                var dx = x + (this.LiveNodes[i][0] * scl);
                var dy = y + (this.LiveNodes[i][1] * scl);
                fill(50, 50, 200);
                rect(dx, dy, scl, scl);
                fill(255)
                text(this.LiveNodes[i][2], dx + (scl / 2), dy + (scl / 2));
            }
        
            fill(200, 50, 50);
            rect(x + (this.StartLocation[0] * scl), y + (this.StartLocation[1] * scl), scl, scl);
        
            fill(50, 200, 50);
            rect(x + (this.TargetLocation[0] * scl), y + (this.TargetLocation[1] * scl), scl, scl);
        
        
            fill(255);
            stroke(255);
            if (this.besti != -1) {
                var bestPath = this.lastPath;//this.LiveNodes[this.besti][3];
                var px = this.StartLocation[0] + 0.5;
                var py = this.StartLocation[1] + 0.5;
                for (var i = 0; i < bestPath.length; i++) {
                    var dx = px;
                    var dy = py;
                    switch (bestPath[i]) {
                        case "U": dy -= 1; break;
                        case "R": dx += 1; break;
                        case "D": dy += 1; break;
                        case "L": dx -= 1; break;
                    }
                    line(x + (px * scl), y + (py * scl), x + (dx * scl), y + (dy * scl));
                    px = dx;
                    py = dy;
                }
            }
        }
    }


    DistanceFromTarget(pos) {
        return abs(this.TargetLocation[0] - pos[0]) + abs(this.TargetLocation[1] - pos[1]);
    }

    StepPathFind() {
        if (this.Foundi != -1) { return -1; }

        var besti = -1;
        var bestScore;
        for (var i = this.LiveNodes.length - 1; i >= 0; i--) {
        //for (var i = 0; i < this.LiveNodes.length; i++) {
            if (besti == -1) {
                besti = i;
                bestScore = this.LiveNodes[i][2];
            } else if (this.LiveNodes[i][2] < bestScore) {
                besti = i;
                bestScore = this.LiveNodes[i][2];                
            }
        }
        if (besti == -1) { this.lastPath = ""; return -1; } // nothing left in livenodes

        var currentNode = this.LiveNodes.splice(besti, 1)[0];
        this.lastPath = currentNode[3];
        this.CheckNodes[this.CheckNodes.length] = [
            currentNode[0], // x
            currentNode[1], // y
            currentNode[2]  // score 
        ];

        if (currentNode[0] == this.TargetLocation[0] && currentNode[1] == this.TargetLocation[1]) {
            this.Foundi = this.LiveNodes.length - 1;
            return;
        }

        //console.log(currentNode);

        var nx = currentNode[0];
        var ny = currentNode[1];
        var checks = [];
        if (currentNode[3].length % 2 == 0) {
            checks[0] = [nx, ny - 1, "U"];
            checks[1] = [nx + 1, ny, "R"];
            checks[2] = [nx, ny + 1, "D"];
            checks[3] = [nx - 1, ny, "L"];
            
        } else {
            checks[0] = [nx - 1, ny, "L"];
            checks[1] = [nx, ny + 1, "D"];
            checks[2] = [nx + 1, ny, "R"];
            checks[3] = [nx, ny - 1, "U"];
        }

        for (var n = 0; n < checks.length; n++) {
            var x = checks[n][0];
            var y = checks[n][1];
            var path = currentNode[3] + checks[n][2];

            //console.log(x);
            //console.log(y);

            if (x < 0 || x >= this.w || y < 0 || y >= this.h) { continue; }

            var cantCheck = false;
            for (var i = 0; i < this.LiveNodes.length; i++) {
                if (this.LiveNodes[i][0] == x && this.LiveNodes[i][1] == y) {
                    var thisscore = (this.DistanceFromTarget([x, y]) - this.StartDistance) + path.length;
                    if (this.LiveNodes[i][2] > thisscore) {
                        this.LiveNodes[i][2] = thisscore;
                        this.LiveNodes[i][3] = path;
                    }
                    cantCheck = true;
                    break;                    
                }
            }
            // do i need to check this? because surely theyre already the most optimized path? 
            // live nodes cannot go down in score
            for (var i = 0; i < this.CheckNodes.length; i++) {
                if (this.CheckNodes[i][0] == x && this.CheckNodes[i][1] == y) {
                    cantCheck = true; // optamizaitn
                }
            }
            if (this.Data[x][y] == 1) { cantCheck = true; } // enviro check

            if (cantCheck) { continue; }

            this.LiveNodes[this.LiveNodes.length] = [
                x, 
                y, 
                (this.DistanceFromTarget([x, y]) - this.StartDistance) + path.length,
                path
            ]
        }
        return 0;
    }
}