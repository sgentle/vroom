// This file contains extra functions not found in normal chipmunk. Include this
// file after you include cp.js.
//
// Particularly, this lets you call draw() on any shape or joint.

// This is the utility code to drive the chipmunk demos. The demos are rendered using
// a single canvas on the page.

(function() {
  var v = cp.v;

  var drawCircle = function(ctx, c, radius) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, radius, 0, 2*Math.PI, false);
    ctx.fill();
    ctx.stroke();
  };

  var drawLine = function(ctx, a, b) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  };

  var drawCircle = function(ctx, scale, point2canvas, c, radius) {
    var c = point2canvas(c);
    ctx.beginPath();
    ctx.arc(c.x, c.y, scale * radius, 0, 2*Math.PI, false);
    ctx.fill();
    ctx.stroke();
  };

  var drawLine = function(ctx, point2canvas, a, b) {
    a = point2canvas(a); b = point2canvas(b);

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  };

  var drawRect = function(ctx, point2canvas, pos, size) {
    var pos_ = point2canvas(pos);
    var size_ = cp.v.sub(point2canvas(cp.v.add(pos, size)), pos_);
    ctx.fillRect(pos_.x, pos_.y, size_.x, size_.y);
  };

  var springPoints = [
    v(0.00, 0.0),
    v(0.20, 0.0),
    v(0.25, 3.0),
    v(0.30,-6.0),
    v(0.35, 6.0),
    v(0.40,-6.0),
    v(0.45, 6.0),
    v(0.50,-6.0),
    v(0.55, 6.0),
    v(0.60,-6.0),
    v(0.65, 6.0),
    v(0.70,-3.0),
    v(0.75, 6.0),
    v(0.80, 0.0),
    v(1.00, 0.0)
  ];

  var drawSpring = function(ctx, scale, point2canvas, a, b) {
    a = point2canvas(a); b = point2canvas(b);
    
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);

    var delta = v.sub(b, a);
    var len = v.len(delta);
    var rot = v.mult(delta, 1/len);

    for(var i = 1; i < springPoints.length; i++) {

      var p = v.add(a, v.rotate(v(springPoints[i].x * len, springPoints[i].y * scale), rot));

      //var p = v.add(a, v.rotate(springPoints[i], delta));
      
      ctx.lineTo(p.x, p.y);
    }

    ctx.stroke();
  };


  // **** Draw methods for Shapes

  cp.PolyShape.prototype.draw = function(ctx, scale, point2canvas)
  {
    ctx.beginPath();

    var verts = this.tVerts;
    var len = verts.length;
    var lastPoint = point2canvas(new cp.Vect(verts[len - 2], verts[len - 1]));
    ctx.moveTo(lastPoint.x, lastPoint.y);

    for(var i = 0; i < len; i+=2){
      var p = point2canvas(new cp.Vect(verts[i], verts[i+1]));
      ctx.lineTo(p.x, p.y);
    }
    ctx.fill();
    ctx.stroke();
  };

  cp.SegmentShape.prototype.draw = function(ctx, scale, point2canvas) {
    var oldLineWidth = ctx.lineWidth;
    ctx.lineWidth = Math.max(1, this.r * scale * 2);
    drawLine(ctx, point2canvas, this.ta, this.tb);
    ctx.lineWidth = oldLineWidth;
  };

  cp.CircleShape.prototype.draw = function(ctx, scale, point2canvas) {
    drawCircle(ctx, scale, point2canvas, this.tc, this.r);

    // And draw a little radian so you can see the circle roll.
    drawLine(ctx, point2canvas, this.tc, cp.v.mult(this.body.rot, this.r).add(this.tc));
  };


  // Draw methods for constraints

  cp.PinJoint.prototype.draw = function(ctx, scale, point2canvas) {
    var a = this.a.local2World(this.anchr1);
    var b = this.b.local2World(this.anchr2);
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = "grey";
    drawLine(ctx, point2canvas, a, b);
  };

  cp.SlideJoint.prototype.draw = function(ctx, scale, point2canvas) {
    var a = this.a.local2World(this.anchr1);
    var b = this.b.local2World(this.anchr2);
    var midpoint = v.add(a, v.clamp(v.sub(b, a), this.min));

    ctx.lineWidth = 2;
    ctx.strokeStyle = "grey";
    drawLine(ctx, point2canvas, a, b);
    ctx.strokeStyle = "red";
    drawLine(ctx, point2canvas, a, midpoint);
  };

  cp.PivotJoint.prototype.draw = function(ctx, scale, point2canvas) {
    var a = this.a.local2World(this.anchr1);
    var b = this.b.local2World(this.anchr2);
    ctx.strokeStyle = "grey";
    ctx.fillStyle = "grey";
    drawCircle(ctx, scale, point2canvas, a, 2);
    drawCircle(ctx, scale, point2canvas, b, 2);
  };

  cp.GrooveJoint.prototype.draw = function(ctx, scale, point2canvas) {
    var a = this.a.local2World(this.grv_a);
    var b = this.a.local2World(this.grv_b);
    var c = this.b.local2World(this.anchr2);
    
    ctx.strokeStyle = "grey";
    drawLine(ctx, point2canvas, a, b);
    drawCircle(ctx, scale, point2canvas, c, 3);
  };

  cp.DampedSpring.prototype.draw = function(ctx, scale, point2canvas) {
    var a = this.a.local2World(this.anchr1);
    var b = this.b.local2World(this.anchr2);

    ctx.strokeStyle = "grey";
    drawSpring(ctx, scale, point2canvas, a, b);
  };

  var randColor = function() {
    return Math.floor(Math.random() * 256);
  };

  var styles = [];
  for (var i = 0; i < 100; i++) {
    styles.push("rgb(" + randColor() + ", " + randColor() + ", " + randColor() + ")");
  }

  //styles = ['rgba(255,0,0,0.5)', 'rgba(0,255,0,0.5)', 'rgba(0,0,255,0.5)'];

  cp.Shape.prototype.style = function() {
    var body;
    if (this.sensor) {
      return "rgba(255,255,255,0)";
    } else {
      body = this.body;
      if (body.isSleeping()) {
        return "rgb(50,50,50)";
      } else if (body.nodeIdleTime > this.space.sleepTimeThreshold) {
        return "rgb(170,170,170)";
      } else {
        return styles[this.hashid % styles.length];
      }
    }
  };
})();
