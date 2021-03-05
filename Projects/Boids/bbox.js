class BBox {
    constructor(scale, x, y, w, h) {
        this.scale = scale;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;        
                
        this.objects = [[]]
        for (var i = 0; i < this.w; i++) {
            for (var j = 0; j < this.h; j++) {            

            }
        }

        this.outsideObjects = [];
        this.Clear();
    }

    Clear() {      
        for (var i = 0; i < this.w; i++) {
            this.objects[i] = [];
            for (var j = 0; j < this.h; j++) {      
                this.objects[i][j] = [];
            }
        }
        this.outsideObjects = [];
    }

    AddObject(x, y, ref) {
        x -= this.x * this.scale;
        y -= this.y * this.scale;

        x = Math.floor(x / this.scale);
        y = Math.floor(y / this.scale);

        if (x < 0 || x >= this.w || y < 0 || y >= this.h) {
            this.outsideObjects.push(ref);
        } else {
            this.objects[x][y].push(ref);
        }
    }

    GetList(x, y, radius) {
        var total = [];

        x -= this.x * this.scale;
        y -= this.y * this.scale;

        var includeOut = false;

        var minx = Math.floor((x - radius) / this.scale);
        if (minx < 0)           { minx = 0;             includeOut = true; }
        if (minx >= this.w)     { minx = this.w - 1;    includeOut = true; }

        var miny = Math.floor((y - radius) / this.scale);
        if (miny < 0)           { miny = 0;             includeOut = true; }
        if (miny >= this.h)     { miny = this.h - 1;    includeOut = true; }
        
        var maxx = Math.floor((x + radius) / this.scale);
        if (maxx < 0)           { maxx = 0;             includeOut = true; }
        if (maxx >= this.w)     { maxx = this.w - 1;    includeOut = true; }

        var maxy = Math.floor((y + radius) / this.scale);
        if (maxy < 0)           { maxy = 0;             includeOut = true; }
        if (maxy >= this.h)     { maxy = this.h - 1;    includeOut = true; }

        for (var j = miny; j <= maxy; j++) {            
            for (var i = minx; i <= maxx; i++) {
                total = total.concat(this.objects[i][j]);
            }
        }
        if (includeOut) {
            total = total.concat(this.outsideObjects)
        }
        return total;
    }

    Draw() {
        var x1 = this.x * this.scale;
        var y1 = this.y * this.scale;
        var x2 = this.w * this.scale;
        var y2 = this.h * this.scale;
        for (var j = 0; j <= this.h; j++) { 
            var y = j * this.scale; 

            line(x1, y1 + y, x1 + x2, y1 + y);
        }
            
        for (var i = 0; i <= this.w; i++) {
            var x = i * this.scale;
            line(x1 + x, y1, x1 + x, y1 + y2);
        }
    }
}