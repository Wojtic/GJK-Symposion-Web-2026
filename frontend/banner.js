// Dimensions: 3000x4000

const MAX_VELOCITY = 0.5;
const AREA_MULTIPLIER = 5;
const ROTATION_SPEED = 0.01;
const SCALE_SPEED = 0.001;

let attractor = { x: 1500, y: 2000 };
let target_rotation = 0; // -10deg to 10deg
let target_scale = 2; // 2 to 3

function updateAttractorPosition() {
  attractor.x = Math.random() * 3000 * AREA_MULTIPLIER;
  attractor.y = Math.random() * 4000 * AREA_MULTIPLIER;
}

let position = { x: Math.random() * 3000, y: Math.random() * 4000 };
let velocity = { x: 0, y: 0 };
let rotation = 0; // -10deg to 10deg
let scale = 2; // 2 to 3

function updatePosition() {
  const ax = attractor.x - position.x;
  const ay = attractor.y - position.y;
  const distance = Math.sqrt(ax * ax + ay * ay);
  const acceleration = 0.01; // Adjust this value to change the acceleration

  if (distance > 0) {
    velocity.x += (ax / distance) * acceleration;
    velocity.y += (ay / distance) * acceleration;

    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    if (speed > MAX_VELOCITY) {
      velocity.x = (velocity.x / speed) * MAX_VELOCITY;
      velocity.y = (velocity.y / speed) * MAX_VELOCITY;
    }
  }

  position.x += velocity.x;
  position.y += velocity.y;

  position.x = Math.max(0, Math.min(3000 * AREA_MULTIPLIER, position.x));
  position.y = Math.max(0, Math.min(4000 * AREA_MULTIPLIER, position.y));
}

function updateTargets() {
  target_rotation = (Math.random() - 0.5) * 20;
  target_scale = 1.3 + Math.random() * 2;
}

function updateRotationAndScale() {
  rotation += ROTATION_SPEED * (target_rotation - rotation > 0 ? 1 : -1);
  scale += SCALE_SPEED * (target_scale - scale > 0 ? 1 : -1);

  if (
    Math.abs(target_rotation - rotation) < 0.1 ||
    Math.abs(target_scale - scale) < 0.01
  ) {
    updateTargets();
  }
}

function animate() {
  updatePosition();
  updateRotationAndScale();
  const bannerBgr = document.getElementById("banner_bgr");
  bannerBgr.style.backgroundPosition = `${-position.x}px ${-position.y}px`;
  bannerBgr.style.transform = `rotate(${rotation}deg) scale(${scale})`;
  requestAnimationFrame(animate);

  if (
    (attractor.x - position.x) ** 2 + (attractor.y - position.y) ** 2 <
    100 ** 2
  ) {
    updateAttractorPosition();
  }
}

animate();
