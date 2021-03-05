var scl = 4;

var maxSpeed = 1.2 * scl;
var maxForce = maxSpeed / 80; //0.06;

var seperationDist = 25 * (scl / 4);
var alignmentDist = 50 * (scl / 4);
var cohesionDist = 50 * (scl / 4);

var seperationStrength = 1.5;   //1.5
var alignmentStrength = 1;      //1
var cohesionStrength = 1;       //1

var cursorSeperationStrength = 10;
var cursorAlignStrength = 0.0155;

var boidCount = 800 * 2;
var boids = [];
var bboxWidth = 80;
var bboxHeight = 50;
var boidBBox = new BBox(scl * 10, -bboxWidth, -bboxHeight, bboxWidth * 2, bboxHeight * 2);

var mousePos = new Vector2(0, 0);

var canvas;
function mouseMoved() { mousePos = new Vector2(mouseX - (windowWidth / 2), mouseY - (windowHeight / 2)); }
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);

    for (var i = 0; i < boidCount; i++) {
        boids[i] = new Boid();
    }

    frameRate(60);   

    
    sliderS = createSlider(0, 5, seperationStrength, 0.1);
    sliderS.position(10, 10);
    sliderS.style('width', '100px');
    sliderA = createSlider(0, 5, alignmentStrength, 0.1);
    sliderA.position(10, 30);
    sliderA.style('width', '100px');
    sliderC = createSlider(0, 5, cohesionStrength, 0.1);
    sliderC.position(10, 50);
    sliderC.style('width', '100px');
}

//function change()

var colorval = 0;
var colorstate = 0;
function changeColor() {
    colorval += 1
    if (colorval > 255) {
        colorval = 0;
        colorstate += 1;
        if (colorstate > 5) {
            colorstate = 0;
        }
    }

    switch (colorstate) {
        case 0: { fill(255, colorval, 0); }  return;
        case 1: { fill(255 - colorval, 255, 0); }  return;
        case 2: { fill(0, 255, colorval); }  return;
        case 3: { fill(0, 255 - colorval, 255); }  return;
        case 4: { fill(colorval, 0, 255); }  return;
        case 5: { fill(255, 0, 255 - colorval); }  return;
    }

}
 
function draw() {
    background(255);

    seperationStrength = sliderS.value();
    alignmentStrength = sliderA.value();
    cohesionStrength = sliderC.value();

    var wx = windowWidth / 2;
    var wy = windowHeight / 2;
    translate(wx, wy);

    stroke(200, 50, 50);
    //boidBBox.Draw();
    boidBBox.Clear();
    for (var i = 0; i < boids.length; i++) {
        boidBBox.AddObject(boids[i].pos.x, boids[i].pos.y, boids[i]);
    }
    
    
    var maxSight = Math.max(seperationDist, alignmentDist, cohesionDist);
    for (var i = 0; i < boids.length; i++) { boids[i].Flock(maxSight); }

    //changeColor();
    //fill(255);    
    noStroke();
    for (var i = 0; i < boids.length; i++) {
        boids[i].Update();

        fill(boids[i].colorr, boids[i].colorg, boids[i].colorb);
        boids[i].Draw();
    }
    //print(boids[0].pos.x + ", " + boids[0].pos.y);

    //fill(255)
    //text(str(boidCount), 25-wx, 25-wy);
}

class Boid {
    constructor() {
        var r = Math.random() * 2 * Math.PI;
        this.colorr = map(random(), 0, 1, 155, 255);
        this.colorg = map(random(), 0, 1, 155, 255);
        this.colorb = map(random(), 0, 1, 155, 255);

        this.acceleration = new Vector2(0, 0);
        this.velocity = new Vector2(sin(r), cos(r));        
        this.forward = this.velocity.Normal();
        this.pos = new Vector2(0, 0);
        this.pos = this.pos.Add(this.forward.Multiply(boidCount / 10));
    }

    Flock(maxSight) {
        var boidArray = boidBBox.GetList(this.pos.x, this.pos.y, maxSight);
        //var boidArray = boids;

        var seperation = this.Seperation(boidArray).Multiply(seperationStrength);
        var alignment = this.Alignment(boidArray).Multiply(alignmentStrength);
        var cohesion = this.Cohesion(boidArray).Multiply(cohesionStrength);

        this.acceleration = this.acceleration.Add(seperation);
        this.acceleration = this.acceleration.Add(alignment);
        this.acceleration = this.acceleration.Add(cohesion);
    }

    Update() {
        this.velocity = this.velocity.Add(this.acceleration);
        this.velocity.Limit(maxSpeed);
        this.pos = this.pos.Add(this.velocity);

        this.acceleration.x = 0;
        this.acceleration.y = 0;

        this.forward = this.velocity.Normal();
    }

    Seek(Target) {
        var desired = Target.Subtract(this.pos); 
        desired.Normalize();
        desired = desired.Multiply(maxSpeed);
    
        var steer = desired.Subtract(this.velocity);
        steer.Limit(maxForce);
        return steer;
    }

    Seperation(boidArray) {
        var fromCenter = new Vector2(this.pos.x, this.pos.y).Subtract(mousePos);

        var total = new Vector2(0, 0);
        if (fromCenter.Magnitude() < seperationDist) {
            total = fromCenter.Normal().Divide(fromCenter.Magnitude()).Multiply(cursorSeperationStrength);
        }
        var count = 1;
        for (var i = 0; i < boidArray.length; i++) {
            var b = boidArray[i];

            var difference = this.pos.Subtract(b.pos);
            var distance = difference.Magnitude();

            if (distance > 0 && distance < seperationDist) {
                var d = difference.Normal().Divide(distance);    
                
                total = total.Add(d);
                count++;
            }
        }
        if (count > 0) {
            total = total.Divide(count);
        }
        if (total.Magnitude() > 0) {
            total.Normalize();
            total = total.Multiply(maxSpeed);
            total = total.Subtract(this.velocity);
            total.Limit(maxForce);            
        }
        return total;
    }

    Alignment(boidArray) {
        var total = mousePos.Subtract(this.pos).Multiply(cursorAlignStrength);
        var count = 1;
        for (var i = 0; i < boidArray.length; i++) {
            var b = boidArray[i];

            var difference = this.pos.Subtract(b.pos);
            var distance = difference.Magnitude();

            if (distance > 0 && distance < alignmentDist) {
                total = total.Add(b.forward);
                count++;
            }
        }
        if (count > 0) {
            total = total.Divide(count);
            total.Normalize();
            total = total.Multiply(maxSpeed);
            var turn = total.Subtract(this.velocity);
            turn.Limit(maxForce);
            return turn;
        } else {
            return new Vector2(0, 0)
        }
    }

    Cohesion(boidArray) {
        var total = new Vector2(0, 0);
        var count = 0;
        for (var i = 0; i < boidArray.length; i++) {
            var b = boidArray[i];

            var difference = this.pos.Subtract(b.pos);
            var distance = difference.Magnitude();

            if (distance > 0 && distance < cohesionDist) {
                total = total.Add(b.pos)
                count++;
            }
        }
        if (count > 0) {
            total = total.Divide(count);
            return this.Seek(total);
        } else {
            return new Vector2(0, 0)
        }
    }

    Draw() {        
        var right = this.forward.Cross();
        var left = (new Vector2(0, 0)).Subtract(right);
                
        var vforward = this.forward.Multiply(scl);
        right = right.Multiply(scl);
        left = left.Multiply(scl);

        right = right.Subtract(vforward);
        left = left.Subtract(vforward);

        triangle(this.pos.x + vforward.x, this.pos.y + vforward.y, 
                 this.pos.x + right.x, this.pos.y + right.y, 
                 this.pos.x + left.x, this.pos.y + left.y
        );
    }
    DrawE() {
        ellipse(this.pos.x, this.pos.y, scl, scl)
    }
}