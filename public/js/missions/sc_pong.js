// SC - Servicio al Cliente | Estilo PONG
// El jugador controla una paleta vertical (mouse/botones) y debe rebotar la
// llamada (bola) hacia el lado que coincide con el área solicitada.
class MissionSC extends MissionBase {
  start() {
    this.paddleY = this.api.height/2;
    this.ball = {x:this.api.width/2, y:150, vx:120, vy:80};
    this.target = Math.random()>0.5 ? "arriba" : "abajo";
    this.api.controls(`<button id="up">▲ Subir</button><button id="dn">▼ Bajar</button>`);
    this.api.onControl("up", ()=>this.paddleY=Math.max(30,this.paddleY-40));
    this.api.onControl("dn", ()=>this.paddleY=Math.min(this.api.height-30,this.paddleY+40));
  }
  update(dt) {
    this.ball.x += this.ball.vx*dt; this.ball.y += this.ball.vy*dt;
    if (this.ball.y<10||this.ball.y>this.api.height-10) this.ball.vy*=-1;
    if (this.ball.x < 40) {
      if (Math.abs(this.ball.y-this.paddleY)<45) {
        const wantsUp = this.target==="arriba";
        const hitUp = this.ball.y < this.paddleY;
        if (wantsUp===hitUp) this.api.addScore(25); else this.api.addScore(5);
        this.ball.vx = Math.abs(this.ball.vx);
        this.target = Math.random()>0.5 ? "arriba" : "abajo";
      } else { this.ball.x=this.api.width/2; this.ball.vx=Math.abs(this.ball.vx); this.api.addScore(0); }
    }
    if (this.ball.x > this.api.width-10) this.ball.vx = -Math.abs(this.ball.vx);
  }
  render(ctx) {
    clearCanvas(ctx, this.api.width, this.api.height);
    drawText(ctx, `Redirecciona la llamada hacia: ${this.target.toUpperCase()}`, this.api.width/2, 20, {align:"center", size:14, color: COLORS.azulOscuro});
    drawFlatRect(ctx, 20, this.paddleY-45, 12, 90, COLORS.azul, 4);
    drawFlatCircle(ctx, this.ball.x, this.ball.y, 8, COLORS.verde);
  }
  onMouseMove(x,y) { this.paddleY = Math.max(30,Math.min(this.api.height-30,y)); }
  onKey(key,down) { if(!down) return; if(key==="ArrowUp") this.paddleY=Math.max(30,this.paddleY-30); if(key==="ArrowDown") this.paddleY=Math.min(this.api.height-30,this.paddleY+30); }
}
