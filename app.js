const canvas = document.getElementById("playfield");
const ctx = canvas.getContext("2d");
const critterLabel = document.getElementById("critter-count");
const splatLabel = document.getElementById("splat-count");
const spawnButton = document.getElementById("spawn-button");
const resetButton = document.getElementById("reset-button");
const autoToggle = document.getElementById("auto-toggle");

const CREATURE_TYPES = [
  { name: "Glow fly", color: "#ffd166", accent: "#ff6b6b", size: 18, speed: 90, wobble: 25 },
  { name: "Blue beetle", color: "#8ce3ff", accent: "#1dd3b0", size: 20, speed: 75, wobble: 18 },
  { name: "Swift lizard", color: "#8cff98", accent: "#6ae28c", size: 26, speed: 65, wobble: 12 },
  { name: "Pocket mouse", color: "#f6a6ff", accent: "#f875aa", size: 22, speed: 70, wobble: 16 },
];

const critters = [];
const splats = [];
let splatCount = 0;
let lastTime = performance.now();
let autoSpawn = true;
let autoSpawnTimer = 0;
const autoSpawnInterval = 950; // ms
let width = 0;
let height = 0;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnCreatures(count = 3) {
  for (let i = 0; i < count; i += 1) {
    const type = CREATURE_TYPES[Math.floor(Math.random() * CREATURE_TYPES.length)];
    const angle = rand(0, Math.PI * 2);
    const speed = type.speed * rand(0.8, 1.2);
    critters.push({
      ...type,
      x: rand(type.size, width - type.size),
      y: rand(type.size, height - type.size),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      wobbleSeed: rand(0, 2000),
    });
  }
  updateCounters();
}

function updateCounters() {
  critterLabel.textContent = critters.length.toString();
  splatLabel.textContent = splatCount.toString();
}

function handlePointer(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  for (let i = critters.length - 1; i >= 0; i -= 1) {
    const c = critters[i];
    const dx = c.x - x;
    const dy = c.y - y;
    const hitRadius = c.size * 1.1;
    if (dx * dx + dy * dy <= hitRadius * hitRadius) {
      critters.splice(i, 1);
      splatCount += 1;
      splats.push({ x, y, radius: c.size * 0.8, life: 0.35, color: c.accent });
      updateCounters();
      return;
    }
  }
}

function update(deltaMs) {
  const delta = deltaMs / 1000;
  autoSpawnTimer += deltaMs;

  if (autoSpawn && autoSpawnTimer >= autoSpawnInterval) {
    autoSpawnTimer = 0;
    spawnCreatures(1 + Math.floor(Math.random() * 2));
  }

  critters.forEach((c, index) => {
    const wobble = Math.sin((performance.now() + c.wobbleSeed) * 0.004) * c.wobble;
    c.vx += wobble * 0.08;
    c.vy += Math.cos((performance.now() + c.wobbleSeed) * 0.003) * c.wobble * 0.06;

    const speed = Math.hypot(c.vx, c.vy) || 1;
    const maxSpeed = c.speed * 1.4;
    if (speed > maxSpeed) {
      c.vx = (c.vx / speed) * maxSpeed;
      c.vy = (c.vy / speed) * maxSpeed;
    }

    c.x += c.vx * delta;
    c.y += c.vy * delta;

    if (c.x < c.size || c.x > width - c.size) {
      c.vx *= -1;
      c.x = Math.min(Math.max(c.x, c.size), width - c.size);
    }

    if (c.y < c.size || c.y > height - c.size) {
      c.vy *= -1;
      c.y = Math.min(Math.max(c.y, c.size), height - c.size);
    }

    if (Math.random() < 0.0025) {
      c.vx += rand(-50, 50);
      c.vy += rand(-50, 50);
    }

    // Remove critters that somehow leave the scene to avoid runaway arrays.
    if (c.x < -50 || c.x > width + 50 || c.y < -50 || c.y > height + 50) {
      critters.splice(index, 1);
    }
  });

  for (let i = splats.length - 1; i >= 0; i -= 1) {
    const s = splats[i];
    s.life -= delta;
    s.radius += delta * 120;
    if (s.life <= 0) {
      splats.splice(i, 1);
    }
  }
}

function drawCreature(c) {
  ctx.save();
  ctx.translate(c.x, c.y);
  const angle = Math.atan2(c.vy, c.vx);
  ctx.rotate(angle);

  ctx.fillStyle = `${c.color}cc`;
  ctx.beginPath();
  ctx.ellipse(0, 0, c.size * 0.9, c.size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.ellipse(c.size * 0.4, 0, c.size * 0.4, c.size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0c0f1c";
  ctx.beginPath();
  ctx.arc(c.size * 0.6, -c.size * 0.1, c.size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#fff7";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-c.size * 0.2, -c.size * 0.6);
  ctx.lineTo(c.size * 0.6, -c.size * 0.8);
  ctx.moveTo(-c.size * 0.2, c.size * 0.6);
  ctx.lineTo(c.size * 0.6, c.size * 0.8);
  ctx.stroke();

  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(255, 209, 102, 0.12)");
  gradient.addColorStop(0.5, "rgba(140, 227, 255, 0.08)");
  gradient.addColorStop(1, "rgba(52, 120, 246, 0.1)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  critters.forEach(drawCreature);

  splats.forEach((s) => {
    ctx.save();
    ctx.globalAlpha = Math.max(s.life, 0);
    ctx.strokeStyle = `${s.color}cc`;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });
}

function loop(now) {
  const delta = now - lastTime;
  lastTime = now;
  update(delta);
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener("pointerdown", handlePointer);
canvas.addEventListener("pointermove", (event) => {
  if (event.pressure > 0 || event.buttons) {
    handlePointer(event);
  }
});

spawnButton.addEventListener("click", () => spawnCreatures(5));
resetButton.addEventListener("click", () => {
  critters.splice(0, critters.length);
  splats.splice(0, splats.length);
  splatCount = 0;
  updateCounters();
});
autoToggle.addEventListener("change", (event) => {
  autoSpawn = event.target.checked;
});

spawnCreatures(10);
requestAnimationFrame(loop);
