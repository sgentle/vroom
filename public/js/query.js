// Generated by CoffeeScript 1.9.1
(function() {
  var Query, audioGraph, context, init, playSound, raf, soundBuffer, soundSource, startSound, stopSound, url, v;

  v = cp.v;

  raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || window.setTimeout(cb, 1000 / 60);

  context = void 0;

  soundSource = void 0;

  soundBuffer = void 0;

  url = "amen.mp3";

  Query = function() {
    var NUM_VERTS, a, angle, b, body, canvas, canvas2point, height, i, j, length, mass, r, space, verts, width, x;
    this.space = space = new cp.Space();
    this.remainder = 0;
    this.fps = 0;
    this.simulationTime = 0;
    this.drawTime = 0;
    this.mouse = v(0, 0);
    canvas = document.querySelector('canvas');
    this.ctx = canvas.getContext('2d');
    space.iterations = 5;
    width = this.width = canvas.width;
    height = this.height = canvas.height;
    if (width / height > 640 / 480) {
      this.scale = height / 480;
    } else {
      this.scale = width / 640;
    }
    canvas2point = this.canvas2point = (function(_this) {
      return function(x, y) {
        return v(x / _this.scale, 480 - y / _this.scale);
      };
    })(this);
    this.point2canvas = (function(_this) {
      return function(point) {
        return v(point.x * _this.scale, (480 - point.y) * _this.scale);
      };
    })(this);
    canvas.onmousemove = (function(_this) {
      return function(e) {
        return _this.mouse = canvas2point(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
      };
    })(this);
    mass = 10;
    length = 100;
    a = v(-length / 2, 0);
    b = v(length / 2, 0);
    body = space.addBody(new cp.Body(mass, cp.momentForSegment(mass, a, b)));
    body.setPos(v(320, 340));
    space.addShape(new cp.SegmentShape(body, a, b, 20));
    for (x = j = 0; j <= 3; x = ++j) {
      mass = 5;
      length = 100;
      a = v(-length / 2, 0);
      b = v(length / 2, 0);
      body = space.addBody(new cp.Body(mass, cp.momentForSegment(mass, a, b)));
      body.setPos(v(10 + x * 110, 300));
      space.addShape(new cp.SegmentShape(body, v(-100, 0), v(0, 0), 2));
      body = space.addBody(new cp.Body(mass, cp.momentForSegment(mass, a, b)));
      body.setPos(v(10 + x * 110, 300));
      space.addShape(new cp.SegmentShape(body, v(0, -100), v(0, 0), 2));
      body = space.addBody(new cp.Body(mass, cp.momentForSegment(mass, a, b)));
      body.setPos(v(10 + x * 110, 300));
      space.addShape(new cp.SegmentShape(body, v(-100, -100), v(-100, 0), 2));
    }
    space.addShape(new cp.SegmentShape(space.staticBody, v(320, 540), v(620, 240), 0));
    mass = 1;
    NUM_VERTS = 5;
    verts = new Array(NUM_VERTS * 2);
    i = 0;
    while (i < NUM_VERTS * 2) {
      angle = -Math.PI * i / NUM_VERTS;
      verts[i] = 30 * Math.cos(angle);
      verts[i + 1] = 30 * Math.sin(angle);
      i += 2;
    }
    body = space.addBody(new cp.Body(mass, cp.momentForPoly(mass, verts, v(0, 0))));
    body.setPos(v(350 + 60, 220 + 60));
    space.addShape(new cp.PolyShape(body, verts, v(0, 0)));
    mass = 1;
    r = 20;
    body = space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0, r, v(0, 0))));
    body.setPos(v(320 + 100, 240 + 120));
    space.addShape(new cp.CircleShape(body, r, v(0, 0)));
    this.drawSegment = function(start, end, style) {
      var ctx, endT, startT;
      ctx = this.ctx;
      ctx.beginPath();
      startT = this.point2canvas(start);
      endT = this.point2canvas(end);
      ctx.moveTo(startT.x, startT.y);
      ctx.lineTo(endT.x, endT.y);
      ctx.lineWidth = 1;
      ctx.strokeStyle = style;
      return ctx.stroke();
    };
    this.drawBB = function(bb, fillStyle, strokeStyle) {
      var ctx, p;
      ctx = this.ctx;
      p = this.point2canvas(v(bb.l, bb.t));
      width = this.scale * (bb.r - bb.l);
      height = this.scale * (bb.t - bb.b);
      if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fillRect(p.x, p.y, width, height);
      }
      if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        return ctx.strokeRect(p.x, p.y, width, height);
      }
    };
    return this;
  };

  Query.prototype.drawInfo = function() {
    var arbiters, contacts, fpsStr, i, maxWidth, space;
    space = this.space;
    maxWidth = this.width - 20;
    this.ctx.textAlign = "start";
    this.ctx.textBaseline = "alphabetic";
    this.ctx.fillStyle = "black";
    fpsStr = Math.floor(this.fps * 10) / 10;
    if (space.activeShapes.count === 0) {
      fpsStr = "--";
    }
    this.ctx.fillText("FPS: " + fpsStr, 10, 50, maxWidth);
    this.ctx.fillText("Step: " + space.stamp, 10, 80, maxWidth);
    arbiters = space.arbiters.length;
    this.maxArbiters = (this.maxArbiters ? Math.max(this.maxArbiters, arbiters) : arbiters);
    this.ctx.fillText("Arbiters: " + arbiters + " (Max: " + this.maxArbiters + ")", 10, 110, maxWidth);
    contacts = 0;
    i = 0;
    while (i < arbiters) {
      contacts += space.arbiters[i].contacts.length;
      i++;
    }
    this.maxContacts = (this.maxContacts ? Math.max(this.maxContacts, contacts) : contacts);
    this.ctx.fillText("Contact points: " + contacts + " (Max: " + this.maxContacts + ")", 10, 140, maxWidth);
    this.ctx.fillText("Simulation time: " + this.simulationTime + " ms", 10, 170, maxWidth);
    this.ctx.fillText("Draw time: " + this.drawTime + " ms", 10, 200, maxWidth);
    if (this.message) {
      return this.ctx.fillText(this.message, 10, this.height - 50, maxWidth);
    }
  };

  Query.prototype.drawInfo = function() {
    var maxWidth;
    maxWidth = this.width - 20;
    this.ctx.textAlign = "start";
    this.ctx.textBaseline = "alphabetic";
    this.ctx.fillStyle = "black";
    if (this.message) {
      return this.ctx.fillText(this.message, 10, this.height - 50, maxWidth);
    }
  };

  Query.prototype.draw = function() {
    var SOUNDSCALE, collisionscale, ctx, end, intersections, ref, ref1, result, self, start;
    self = this;
    ctx = this.ctx;
    ctx.strokeStyle = 'black';
    ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.font = "16px sans-serif";
    this.ctx.lineCap = 'round';
    this.space.eachShape(function(shape) {
      ctx.fillStyle = shape.style();
      return shape.draw(ctx, self.scale, self.point2canvas);
    });
    start = v(320, 240);
    end = this.mouse;
    SOUNDSCALE = 0.01;
    this.drawSegment(start, end, "green");
    this.message = "Query: Dist(" + Math.floor(v.dist(start, end)) + ") Point " + v.str(end) + ", ";
    collisionscale = 1;
    intersections = 0;
    result = this.space.segmentQuery(start, end, cp.ALL_LAYERS, cp.NO_GROUP, (function(_this) {
      return function(shape, vect, a, b, c) {
        var info, point;
        intersections++;
        info = shape.segmentQuery(start, end);
        point = info.hitPoint(start, end);
        _this.drawSegment(point, end, "red");
        _this.drawSegment(point, v.add(point, v.mult(info.n, 16)), "blue");
        return collisionscale *= (Math.log(shape.body.m + 1)) * 3;
      };
    })(this));
    if (!isFinite(collisionscale)) {
      collisionscale = 9999999;
    }
    this.message += " Intersections: " + intersections + ",";
    this.message += " Collision Scale: " + collisionscale;
    if (context != null) {
      if ((ref = context.panner) != null) {
        ref.setPosition(end.x * SOUNDSCALE * collisionscale, end.y * SOUNDSCALE * collisionscale, 0);
      }
    }
    if (context != null) {
      if ((ref1 = context.listener) != null) {
        ref1.setPosition(start.x * SOUNDSCALE * collisionscale, start.y * SOUNDSCALE * collisionscale, 0);
      }
    }
    return this.drawInfo();
  };

  Query.prototype.update = function() {};

  Query.prototype.run = function() {
    var lastTime, self, step;
    this.running = true;
    self = this;
    lastTime = 0;
    step = function(time) {
      self.step(time - lastTime);
      lastTime = time;
      if (self.running) {
        return raf(step);
      }
    };
    return step(0);
  };

  Query.prototype.stop = function() {
    return this.running = false;
  };

  Query.prototype.step = function(dt) {
    var lastNumActiveShapes, now;
    if (dt > 0) {
      this.fps = 0.9 * this.fps + 0.1 * (1000 / dt);
    }
    lastNumActiveShapes = this.space.activeShapes.count;
    now = Date.now();
    this.update(1 / 60);
    this.simulationTime += Date.now() - now;
    if (lastNumActiveShapes > 0) {
      now = Date.now();
      this.draw();
      return this.drawTime += Date.now() - now;
    }
  };

  init = function() {
    if (typeof AudioContext !== "undefined") {
      return context = new AudioContext();
    } else if (typeof webkitAudioContext !== "undefined") {
      return context = new webkitAudioContext();
    } else {
      throw new Error("AudioContext not supported. :(");
    }
  };

  startSound = function() {
    var request;
    request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = function() {
      var audioData;
      audioData = request.response;
      return audioGraph(audioData);
    };
    return request.send();
  };

  playSound = function() {
    return soundSource.start(context.currentTime);
  };

  stopSound = function() {
    return soundSource.stop(context.currentTime);
  };

  audioGraph = function(audioData) {
    var panner;
    panner = void 0;
    soundSource = context.createBufferSource();
    soundSource.loop = true;
    return context.decodeAudioData(audioData, function(soundBuffer) {
      soundSource.buffer = soundBuffer;
      panner = context.createPanner();
      panner.panningModel = "HRTF";
      window.panner = panner;
      context.panner = panner;
      panner.setPosition(20, -5, 0);
      soundSource.connect(panner);
      panner.connect(context.destination);
      context.listener.setPosition(10, 0, 0);
      return playSound(soundSource);
    });
  };

  init();

  startSound();

  window.Query = Query;

}).call(this);