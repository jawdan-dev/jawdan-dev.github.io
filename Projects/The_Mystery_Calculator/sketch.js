var scl = 16;


var input, hoverOverMe, showInfo = false;
var minHeight = 0;
var canvas;
var sizeChecked = true;
function windowResized() {     
    resizeCanvas(windowWidth, max(windowHeight, minHeight));
 }
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-1')
      
    hoverOverMe = createElement("p", "?");
    hoverOverMe.style('color: white; position: absolute; left: 220px; top: -5px; ')
    hoverOverMe.mouseOver(() => showInfo = true);
    hoverOverMe.mouseOut(() => showInfo = false);

    input = createInput('');
    input.style('position: absolute; top: 5px; left: 5px;')
    input.size(200, 20);
    input.input(inputEvent);

    frameRate(5);
}

var calculator = [];
function draw() {
    background(50);

    textAlign(CENTER, TOP);
    textSize(scl - 1);

    drawCalculator(calculator);

    stroke(255);
    fill(50);
    rect(217, 10, 14, 19);
    
    if (showInfo) {
        textAlign(LEFT, TOP);
        rect(240, 5, 700, 80);

        noStroke();
        fill(255);
        textSize(12);
        text("Enter the max value you require in the box on the left [this rounded up to the nearest 2^X - 1 == N]\nThe complete set consists of X cards with a series of numbers.\nAsk a friend to select a number between 1-N, without telling you.\nThen show them the cards and ask them which cards their number appears on.\nOnce this is done, add together the first digit of all of the cards their number appeared on together and the result is their number.", 245, 10);
    }
}
function mouseWheel() {
    reDraw = true;
}

function inputEvent() {
    var text = this.value();
    for (var i = 0; i < text.length; i++) {
        if (text[i] < '0' || text[i] > '9') {
            text = text.substring(0, i) + text.substring(i + 1);
            i--;
        }
    }
    this.value(text);

    var maxValue = int(text);
    if (isNaN(maxValue)) 
        maxValue = 0;

    calculator = generateCalculator(maxValue);
}

function generateCalculator(maxValue) {
    var terms = 0;
    for (; maxValue >= 1; maxValue /= 2, terms++);
    cards = [];    
    
    maxValue = Math.pow(2, terms); // - 1
    for (var c = 0; c < terms; c++) {
        cards[c] = [];
        var n = 0;
        for (var i = 0; i < maxValue; i++) {
            if ((i >> c) & 1) {
                cards[c][n++] = i;
            }
        }
    }
    sizeChecked = false;
    return cards;
}
 
function drawCalculator(arr) {
    if (arr.length > 0) {
        var rows = 1;
        for (var i = arr[0].length; i > rows * 2 || i > 32; i /= 2, rows *= 2);
        var arrLast = arr[arr.length - 1];
        var maxStringLength = arrLast[arrLast.length - 1].toString().length;


        var wFac = scl * (maxStringLength * 0.8);
        var maxWidth = wFac * (arr[0].length / rows);
        var halfW = (windowWidth / 2) - (maxWidth / 2);

        for (var i = 0; i < arr.length; i++) {
            drawCalculatorCell(i, halfW, 50 + (i * scl * (rows + 2.6)), wFac, rows, arr[i], maxStringLength);
        }

        minHeight = (arr.length * scl * (rows + 2.6)) + 200;
        
        if (!sizeChecked) {
            resizeCanvas(windowWidth, max(windowHeight, minHeight));
            sizeChecked = true;
        }
    }
}

function drawCalculatorCell(cellIndex, x, y, wFac, r, arr, maxStringLength) {
    var inc = arr.length / r;

    stroke(255);
    noFill();
    var padding = 5;
    var maxWidth = wFac * inc;
    var maxHeight = scl * (r + 1.5);
    rect(x - padding, y - padding, maxWidth + (padding * 2), maxHeight + (padding * 2)); 

    noStroke();
    fill(255);

    text("Card " + (cellIndex + 1).toString(), x + (maxWidth / 2), y + 5);

    for (var row = 0; row < r; row++) {
        var off = row * inc;
        for (var n = 0; n < inc; n++) {
            text(arr[off + n].toString(), x + ((n + 0.5) * wFac), y + (scl * (row + 1.5)));
        }
    }
    
}