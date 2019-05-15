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