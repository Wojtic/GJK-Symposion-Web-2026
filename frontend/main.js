const eventAPIURL =
  "https://backend-63651199757.europe-central2.run.app/API/next_event";

const canvas_id = [
  "can_bgr_nav",
  "can_bgr_uvod",
  "can_bgr_o_akci",
  "can_bgr_kontakty",
  "can_bgr_popup",
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

function animate2() {
  for (const { canvas, ctx, color, width } of canvases) {
    drawLines(canvas, ctx, color, width);
  }
  //requestAnimationFrame(animate2);
}

function reset_popup() {
  for (const { canvas } of canvases) {
    canvas.width = document.getElementById(canvas.id).clientWidth;
    canvas.height = document.getElementById(canvas.id).clientHeight;
  }
  animate2();
}

window.addEventListener("resize", () => {
  for (const { canvas } of canvases) {
    canvas.width = document.getElementById(canvas.id).clientWidth;
    canvas.height = document.getElementById(canvas.id).clientHeight;
  }
  animate2();
});

document.addEventListener("DOMContentLoaded", () => {
  console.log(
    " ▄▒▀█▄  ▓█▓ ░░▒ ▒░░      ▄░▀▒▄ \n▐▒▓ ▓▒▌ █▓▒ ░▒▓ ░░▒     ▐░░ ▓█▌\n▒▓█ ▒░░ ▓▒░ ▒▓█ ░▒▓     ░░▒ █▓▒\n▓█▓     ▒░░▄▓█▀ ▒▓█     ░▒▓ ▓▒░\n ▀▀▀░▒▄ ░░▒ ▒▄  ▓█▓     ▒▓█ ▒░░\n▓▒░ ▒▓█ ░▒▓ ▓▒░ █▓▒ ░▒▌ ▓█▓ ░░▒\n▒░░ ▓█▓ ▒▓█ ▒░░ ▓▒░ ▒▓▌ █▓▒ ░▒▓\n▐░▒ █▓▌ ▓█▓ ░░▒ ▐░░ ▓█▌ ▐▒░ ▒▓▌\n ▀▓▄▓▀  █▓▒ ░▒▓  ▀▒▄█▀   ▀░▄▓▀ ",
  );

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

  animate2();
  fill_harmonogram();
  document.querySelector("#background_darken").addEventListener("click", () => {
    closePopup();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePopup();
    }
  });

  scheduleNextEvent();
});

async function scheduleNextEvent() {
  const r = await fetch(eventAPIURL);
  console.log("Setting up event");

  if (r.ok) {
    const json = await r.json();
    console.log(json["type"]);
    switch (json["type"]) {
      case "crack":
        console.log("Doing crack in " + json["in_time"] * 1000);
        setTimeout(() => {
          doCrack();
          setTimeout(scheduleNextEvent, 1000);
        }, json["in_time"] * 1000);
        break;
      case "sunlight":
        console.log("Doing sunlight in " + json["in_time"] * 1000);
        setTimeout(() => {
          doCrack();
          setTimeout(scheduleNextEvent, 1000);
        }, json["in_time"] * 1000);
        break;
      case "blur":
        console.log("Doing blur in " + json["in_time"] * 1000);
        setTimeout(() => {
          doCrack();
          setTimeout(scheduleNextEvent, 1000);
        }, json["in_time"] * 1000);
        break;
    }
  } else {
    console.log("Failed event");
    setTimeout(scheduleNextEvent, 1000);
  }
}

function doCrack() {
  const crackEl = document.getElementById("crack");
  crackEl.style.display = "block";
  document.querySelector("#crack img").style.top =
    Math.random() * (window.innerHeight - 408) + "px";
  document.querySelector("#crack img").style.left =
    Math.random() * (window.innerWidth - 567) + "px";
  setTimeout(() => {
    crackEl.style.display = "none";
  }, 10000);
}

function doBlur() {
  const blurEl = document.getElementById("blur");
  blurEl.style.display = "block";
  blurEl.classList.add("reveal");
  setTimeout(() => {
    blurEl.classList.remove("reveal");
    blurEl.style.display = "none";
  }, 10000);
}

function doSunlight() {
  const sunlightEl = document.getElementById("sunlight");
  sunlightEl.style.display = "block";
  sunlightEl.classList.add("drift");
  setTimeout(() => {
    sunlightEl.classList.remove("drift");
    sunlightEl.style.display = "none";
  }, 15000);
}
