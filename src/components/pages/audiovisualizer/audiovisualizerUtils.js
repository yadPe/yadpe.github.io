export class Particule {
    constructor(x, y, dx, dy, size, speed, alpha, ctx) {
      this.x = x;
      this.y = y;
      this.dx = dx;
      this.dy = dy;
      this.radius = size;
      this.ogSpeed = speed;
      this.speed = speed;
      this.alpha = alpha;
      this.ctx = ctx;
    }

    run() {
      this.draw();
      this.update();
    }

    draw() {
      this.ctx.save();
      this.ctx.beginPath();

      this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      this.ctx.fillStyle = "rgba(255, 255, 255," + this.alpha + ")";
      this.ctx.fill();
      this.ctx.restore();
    }

    update() {
      this.x += this.dx * this.speed;
      this.y += this.dy * this.speed;
    }
  }

  export function randomNum(min, max) {
    return Math.random() * (max - min) + min;
  }

  export function convertRange(OldValue, OldMax, OldMin, NewMax, NewMin) {
    return (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
  }

  export function overallLoudess(array) {
    var sum = 0;
    var start = array.length * 0;
    var stop = array.length * 1;
    for (var i = start; i < stop; i++) {
      sum += parseInt(array[i]);
    }
    return {low: lowFreq(array), mid: midFreq(array), high: highFreq(array), cursor: cursorFreq(array), overall: sum / array.length }
  }


  function cursorFreq(array) {
    var sum = 0;
    var start = array.length * 0;
    var stop = array.length * 0.390625;
    for (var i = start; i < stop; i++) {
      sum += parseInt(array[i]);
    }
    return sum / (stop - start);
  }

  function highFreq(array) {
    var sum = 0;
    var start = array.length * 0.5419921875;
    var stop = array.length * 0.9326171875;
    for (var i = start; i < stop; i++) {
      sum += parseInt(array[i]);
    }
    return sum / (stop - start);
  }

  function midFreq(array) {
    var sum = 0;
    var start = array.length * 0.140625;
    var stop = array.length * 0.3466796875;
    for (var i = start; i < stop; i++) {
      sum += parseInt(array[i]);
    }
    return sum / (stop - start);
  }

  function lowFreq(array) {
    var sum = 0;
    var start = array.length * 0;
    var stop = array.length * 0.107421875;
    for (var i = start; i < stop; i++) {
      sum += parseInt(array[i]);
    }
    return sum / (stop - start);
  }
