var tiles = [];
function preload() {
    console.log("loading here");
    addTile("./tiles/tile1.png", 0b1111, 1.5);

    addTile("./tiles/tile2.png", 0b1011, 0.4);

    addTile("./tiles/tile3.png", 0b0011, 0.5);
    addTile("./tiles/tile4.png", 0b1100, 3);

    addTile("./tiles/tile5.png", 0b0001, 0.1);
    addTile("./tiles/tile6.png", 0b0100, 0.1);
    addTile("./tiles/tile7.png", 0b0010, 0.1);
    addTile("./tiles/tile8.png", 0b1000, 0.1);

    addTile("./tiles/tile9.png", 0b1001, 1);
    addTile("./tiles/tile10.png", 0b0101, 1);
    addTile("./tiles/tile11.png", 0b0110, 1);
    addTile("./tiles/tile12.png", 0b1010, 1);

    addTile("./tiles/tile13.png", 0b0000, 0.1);
    addTile("./tiles/tile14.png", 0b0000, 0.1);
    console.log("loading done");
}

function addTile(file, directions, weight = 1) {
    tiles[tiles.length] = {
        img: loadImage(file),
        directions: directions,
        weight: weight,
    };
}

var grid;
var gridWidth = 120,
    gridHeight = Math.floor((gridWidth / windowWidth) * windowHeight);

var canvas;
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-1');
    gridHeight = Math.ceil((gridWidth / windowWidth) * windowHeight);

    let options = [];
    for (let i = 0; i < tiles.length; i++) {
        options[i] = i;
    }

    grid = [];
    for (let i = 0; i < gridWidth * gridHeight; i++) {
        grid[i] = {
            collapsed: false,
            options: options.slice()
        }
    }

    grid[grid.length - gridWidth / 2].options = [1];

    //frameRate(60);
}

function draw() {
    background(50);


    let tileSize = Math.min(windowWidth / gridWidth, windowHeight / gridHeight);
    fill(0);
    rect(0, 0, tileSize * gridWidth, tileSize * gridHeight);
    fill(255, 100, 100);
    for (let j = 0; j < gridHeight; j++) {
        let y = (j * gridWidth);
        for (let x = 0; x < gridWidth; x++) {
            let g = grid[y + x];
            if (g.collapsed) {
                image(tiles[g.options[0]].img, x * tileSize, j * tileSize, tileSize, tileSize);
            }
            //text(g.options, x * tileSize + tileSize / 2, j * tileSize + tileSize / 2);
        }
    }

    let canBeCollapsed = [];
    for (let i = 0; i < grid.length; i++) {
        let g = grid[i];
        if (!g.collapsed && g.options.length > 0) {
            if (canBeCollapsed.length <= 0 || g.options.length == grid[canBeCollapsed[0]].options.length) {
                canBeCollapsed[canBeCollapsed.length] = i;
            } else if (g.options.length < grid[canBeCollapsed[0]].options.length) {
                canBeCollapsed = [i];
            }
        }
    }
    //console.log(canBeCollapsed);
    if (canBeCollapsed.length > 0) {
        let c = random(canBeCollapsed);
        let g = grid[c];

        let totalWeight = 0;
        for (let i = 0; i < g.options.length; i++) {
            totalWeight += tiles[g.options[i]].weight;
        }
        //console.log(totalWeight);

        let index = 0;
        for (let address = random() * totalWeight; address > 0 && index < g.options.length;) {
            address -= tiles[g.options[index]].weight;
            index++;
        }
        index--;

        g.options = [g.options[index]];
        g.collapsed = true;

        let x = c % gridWidth;
        let y = (c - x) / gridWidth;

        checkOptions(x - 1, y);
        checkOptions(x + 1, y);
        checkOptions(x, y - 1);
        checkOptions(x, y + 1);
    } else {
        noLoop();
    }
}

function checkOptions(x, y, maxDepth = 1) {
    if (validLoc(x, y)) {
        let gi = grid[(y * gridWidth) + x];
        if (!gi.collapsed) {
            const checks = [
                [x - 1, y],
                [x + 1, y],
                [x, y - 1],
                [x, y + 1],
            ]

            for (let n = 0; n < checks.length; n++) {
                let targetDir = 0;
                switch (n) {
                    case 0: targetDir = 0b0001; break;
                    case 1: targetDir = 0b0010; break;
                    case 2: targetDir = 0b0100; break;
                    case 3: targetDir = 0b1000; break;
                }
                let inverseDir = 0;
                switch (targetDir) {
                    case 0b1000: inverseDir = 0b0100; break;
                    case 0b0100: inverseDir = 0b1000; break;
                    case 0b0010: inverseDir = 0b0001; break;
                    case 0b0001: inverseDir = 0b0010; break;
                }

                if (validLoc(checks[n][0], checks[n][1])) {
                    let index = checks[n][0] + (checks[n][1] * gridWidth);
                    let gc = grid[index];
                    if (gc.collapsed) {
                        if ((tiles[gc.options[0]].directions & targetDir) <= 0) {
                            for (let i = 0; i < gi.options.length; i++) {
                                if ((tiles[gi.options[i]].directions & inverseDir) > 0) {
                                    gi.options.splice(i, 1);
                                    i--;
                                }
                            }
                        } else {
                            for (let i = 0; i < gi.options.length; i++) {
                                if ((tiles[gi.options[i]].directions & inverseDir) <= 0) {
                                    gi.options.splice(i, 1);
                                    i--;
                                }
                            }
                        }
                    } else if (gc.options.length == 0) {
                        for (let i = 0; i < gi.options.length; i++) {
                            if ((tiles[gi.options[i]].directions & inverseDir) > 0) {
                                gi.options.splice(i, 1);
                                i--;
                            }
                        }
                    } else if (maxDepth > 0) {
                        checkOptions(checks[n][0], checks[n][1], maxDepth - 1);
                    }
                } else {
                    for (let i = 0; i < gi.options.length; i++) {
                        if ((tiles[gi.options[i]].directions & inverseDir) > 0) {
                            gi.options.splice(i, 1);
                            i--;
                        }
                    }
                }
            }
        }
    }
}

function validLoc(x, y) {
    return x >= 0 && x < gridWidth && y >= 0 && y < gridHeight;
}