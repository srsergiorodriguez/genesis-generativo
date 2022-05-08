class Forma {
  constructor(col, shape) {
    this.col = col;
    this.shape = shape;
    const drawFns = {
      'triángulo': this.dTriangle,
      'círculo': this.dCircle,
      'cuadrado': this.dSquare,
      'puntos': this.dCircle, 
      'líneas': this.dLine, 
      'planos': this.dPlane
    }
    this.draw = drawFns[this.shape];
    this.pos = {x:width/2,y:height/2}
    this.size = height * 0.7;
    this.rot = 0;
  }

  update(pos, size, rot) {
    this.pos = pos;
    this.size = size || this.size;
    this.rot = rot || this.rot;
  }

  paint(p = true) {
    if (p) {
      noStroke();
      fill(this.col);
    } else {
      stroke(0);
      fill(255);
    }
  }

  dTriangle(p) {
    push();
    rotate(this.rot);
    const h = this.size/2;
    const x = this.pos.x;
    const y = this.pos.y;
    this.paint(p);
    triangle(x - h, y + h, x + h, y + h, x, y - h);
    pop();
  }

  dCircle(p) {
    push();
    rotate(this.rot);
    this.paint(p);
    ellipse(this.pos.x, this.pos.y, this.size);
    pop();
  }

  dSquare(p) {
    push();
    rotate(this.rot);
    const h = this.size/2;
    this.paint(p);
    rect(this.pos.x - h, this.pos.y - h, this.size, this.size);
    pop();
  }

  dLine(p) {
    push();
    rotate(this.rot);
    const h = this.size/2;
    const hgth = this.size * 0.3;
    this.paint(p);
    rect(this.pos.x - h, this.pos.y - (hgth/2), this.size, hgth);
    pop();
  }

  dPlane(p) {
    push();
    rotate(this.rot);
    this.paint(p);
    beginShape();
    const h = this.size/2;
    const divs = 6;
    for (let i = 0; i < divs; i++) {
      const a = (360/divs) * i;
      const x = (cos(a) * h) + this.pos.x;
      const y = (sin(a) * h) + this.pos.y;
      vertex(x, y);
    }
    endShape(CLOSE);
    pop();
  }
}