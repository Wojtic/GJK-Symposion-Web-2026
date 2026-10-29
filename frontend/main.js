const canvas_id = [
  "can_bgr_nav",
  "can_bgr_uvod",
  "can_bgr_o_akci",
  "can_bgr_kontakty",
];

const canvases = [];

/*canvas.width = window.innerWidth;
canvas.height = window.innerHeight;*/

const lines = [
  { x1: 0, y1: 0.5, x2: 0.3, y2: 1 },
  { x1: 0, y1: 0.7, x2: 1, y2: 1 },
  { x1: 0, y1: 0.2, x2: 0.1, y2: 1 },
  { x1: 0, y1: 0.9, x2: 0.2, y2: 0 },
  { x1: 0.3, y1: 0, x2: 0.1, y2: 1 },
];
const numLines = 50;

/*for (let i = 0; i < numLines; i++) {
  lines.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    length: Math.random() * 100 + 50,
    speed: Math.random() * 2 + 1,
    angle: Math.random() * Math.PI * 2,
  });
}*/

function drawLines(canvas, ctx, color, width = 6) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;

  /*for (const line of lines) {
    const x2 = line.x + line.length * Math.cos(line.angle);
    const y2 = line.y + line.length * Math.sin(line.angle);

    ctx.beginPath();
    ctx.moveTo(line.x, line.y);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    line.x += line.speed * Math.cos(line.angle);
    line.y += line.speed * Math.sin(line.angle);

    if (
      line.x < 0 ||
      line.x > canvas.width ||
      line.y < 0 ||
      line.y > canvas.height
    ) {
      line.x = Math.random() * canvas.width;
      line.y = Math.random() * canvas.height;
      line.angle = Math.random() * Math.PI * 2;
    }
  }*/
  for (const line of lines) {
    ctx.beginPath();
    ctx.moveTo(line.x1 * canvas.width, line.y1 * canvas.height);
    ctx.lineTo(line.x2 * canvas.width, line.y2 * canvas.height);
    ctx.stroke();
  }
}

function animate() {
  for (const { canvas, ctx, color, width } of canvases) {
    drawLines(canvas, ctx, color, width);
  }
  //drawLines(canvases[0].canvas, canvases[0].ctx);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", () => {
  /*canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;*/
});

document.addEventListener("DOMContentLoaded", () => {
  canvas_id.forEach((id) => {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext("2d");
    canvas.width = document.getElementById(id).clientWidth;
    canvas.height = document.getElementById(id).clientHeight;
    let color = "rgba(198, 209, 196, 0.6)"; // Default color
    if (id === "can_bgr_uvod") {
      color = "rgba(142, 149, 140, 0.6)";
    }

    canvases.push({ canvas, ctx, color, width: id === "can_bgr_nav" ? 4 : 6 });
  });

  console.log(canvases);
});
