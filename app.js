const homeScreen = document.getElementById("home-screen");
const miceScreen = document.getElementById("mice-screen");
const bugsScreen = document.getElementById("bugs-screen");

const openMiceScreenButton = document.getElementById("open-mice-screen");
const openBugsScreenButton = document.getElementById("open-bugs-screen");
const closeMiceScreenButton = document.getElementById("close-mice-screen");
const closeBugsScreenButton = document.getElementById("close-bugs-screen");

const miceCanvas = document.getElementById("mice-playfield");
const bugsCanvas = document.getElementById("bugs-playfield");
const miceCtx = miceCanvas.getContext("2d");
const bugsCtx = bugsCanvas.getContext("2d");

const CREATURE_TYPES = {
  mice: [
    { name: "Field mouse", color: "#cfd4db", accent: "#f7b6c5", size: 38, speed: 55, wobble: 10 },
  ],
  bugs: [
    { name: "Ladybug", color: "#ef476f", accent: "#111827", size: 30, speed: 70, wobble: 15 },
  ],
};

const critters = [];
const splats = [];
let lastTime = performance.now();
let autoSpawn = true;
let autoSpawnTimer = 0;
let emptyScreenTimer = null;
const autoSpawnInterval = 2400;
const emptyScreenRespawnDelay = 1000;
const maxCritters = 3;
let width = 0;
let height = 0;
let activeScreen = null;
let activeCanvas = miceCanvas;
let activeCtx = miceCtx;

function resizeCanvas(canvas, ctx) {
  const dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function resizeAllCanvases() {
  resizeCanvas(miceCanvas, miceCtx);
  resizeCanvas(bugsCanvas, bugsCtx);
}

function setScreenVisibility(screen) {
  activeScreen = screen;

  const showHome = !screen;
  homeScreen.classList.toggle("hidden", !showHome);

  const showMice = screen === "mice";
  miceScreen.classList.toggle("hidden", !showMice);
  miceScreen.setAttribute("aria-hidden", String(!showMice));

  const showBugs = screen === "bugs";
  bugsScreen.classList.toggle("hidden", !showBugs);
  bugsScreen.setAttribute("aria-hidden", String(!showBugs));

  activeCanvas = showBugs ? bugsCanvas : miceCanvas;
  activeCtx = showBugs ? bugsCtx : miceCtx;

  critters.length = 0;
  splats.length = 0;
  autoSpawnTimer = 0;
  emptyScreenTimer = null;

  if (screen) {
    spawnCreatures(3);
  }
}

window.addEventListener("resize", resizeAllCanvases);
resizeAllCanvases();

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnCreatures(count = 1) {
  if (!activeScreen) {
    return;
  }

  const slotsAvailable = Math.max(maxCritters - critters.length, 0);
  const spawnCount = Math.min(count, slotsAvailable);
  const types = CREATURE_TYPES[activeScreen];

  for (let i = 0; i < spawnCount; i += 1) {
    const type = types[Math.floor(Math.random() * types.length)];
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
}

function handlePointer(event) {
  if (!activeScreen) {
    return;
  }

  const rect = activeCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  for (let i = critters.length - 1; i >= 0; i -= 1) {
    const c = critters[i];
    const dx = c.x - x;
    const dy = c.y - y;
    const hitRadius = c.size * 1.1;
    if (dx * dx + dy * dy <= hitRadius * hitRadius) {
      critters.splice(i, 1);
      splats.push({ x, y, radius: c.size * 0.8, life: 0.35, color: c.accent });
      return;
    }
  }
}

function update(deltaMs) {
  if (!activeScreen) {
    return;
  }

  const delta = deltaMs / 1000;
  autoSpawnTimer += deltaMs;

  if (autoSpawn && autoSpawnTimer >= autoSpawnInterval) {
    autoSpawnTimer = 0;
    spawnCreatures(1);
  }

  if (critters.length === 0) {
    emptyScreenTimer = (emptyScreenTimer ?? 0) + deltaMs;
    if (emptyScreenTimer >= emptyScreenRespawnDelay) {
      spawnCreatures(1);
      emptyScreenTimer = null;
    }
  } else {
    emptyScreenTimer = null;
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
  activeCtx.save();
  activeCtx.translate(c.x, c.y);
  const angle = Math.atan2(c.vy, c.vx);
  activeCtx.rotate(angle);

  activeCtx.fillStyle = `${c.color}e6`;
  activeCtx.beginPath();
  activeCtx.ellipse(0, 0, c.size * 1.1, c.size * 0.75, 0, 0, Math.PI * 2);
  activeCtx.fill();

  activeCtx.fillStyle = c.color;
  activeCtx.beginPath();
  activeCtx.ellipse(c.size * 0.9, 0, c.size * 0.65, c.size * 0.55, 0, 0, Math.PI * 2);
  activeCtx.fill();

  activeCtx.fillStyle = c.accent;
  activeCtx.beginPath();
  activeCtx.ellipse(c.size * 0.7, -c.size * 0.65, c.size * 0.35, c.size * 0.32, 0, 0, Math.PI * 2);
  activeCtx.ellipse(c.size * 0.7, c.size * 0.65, c.size * 0.35, c.size * 0.32, 0, 0, Math.PI * 2);
  activeCtx.fill();

  activeCtx.fillStyle = "#0c0f1c";
  activeCtx.beginPath();
  activeCtx.arc(c.size * 1.2, -c.size * 0.15, c.size * 0.12, 0, Math.PI * 2);
  activeCtx.fill();

  activeCtx.fillStyle = c.accent;
  activeCtx.beginPath();
  activeCtx.arc(c.size * 1.5, 0, c.size * 0.14, 0, Math.PI * 2);
  activeCtx.fill();

  activeCtx.strokeStyle = `${c.accent}dd`;
  activeCtx.lineWidth = 6;
  activeCtx.beginPath();
  activeCtx.moveTo(-c.size * 1.2, 0);
  activeCtx.quadraticCurveTo(-c.size * 1.9, -c.size * 0.5, -c.size * 2.4, 0);
  activeCtx.stroke();

  activeCtx.strokeStyle = "#fff6";
  activeCtx.lineWidth = 2.5;
  activeCtx.beginPath();
  activeCtx.moveTo(c.size * 1.6, -c.size * 0.2);
  activeCtx.lineTo(c.size * 2.2, -c.size * 0.35);
  activeCtx.moveTo(c.size * 1.6, 0);
  activeCtx.lineTo(c.size * 2.2, 0);
  activeCtx.moveTo(c.size * 1.6, c.size * 0.2);
  activeCtx.lineTo(c.size * 2.2, c.size * 0.35);
  activeCtx.stroke();

  activeCtx.restore();
}

function draw() {
  miceCtx.clearRect(0, 0, width, height);
  bugsCtx.clearRect(0, 0, width, height);

  if (!activeScreen) {
    return;
  }

  const gradient = activeCtx.createLinearGradient(0, 0, width, height);
  if (activeScreen === "bugs") {
    gradient.addColorStop(0, "rgba(240, 113, 103, 0.16)");
    gradient.addColorStop(0.5, "rgba(255, 193, 7, 0.12)");
    gradient.addColorStop(1, "rgba(52, 120, 246, 0.08)");
  } else {
    gradient.addColorStop(0, "rgba(255, 209, 102, 0.12)");
    gradient.addColorStop(0.5, "rgba(140, 227, 255, 0.08)");
    gradient.addColorStop(1, "rgba(52, 120, 246, 0.1)");
  }

  activeCtx.fillStyle = gradient;
  activeCtx.fillRect(0, 0, width, height);

  critters.forEach(drawCreature);

  splats.forEach((s) => {
    activeCtx.save();
    activeCtx.globalAlpha = Math.max(s.life, 0);
    activeCtx.strokeStyle = `${s.color}cc`;
    activeCtx.lineWidth = 6;
    activeCtx.beginPath();
    activeCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    activeCtx.stroke();
    activeCtx.restore();
  });
}

function loop(now) {
  const delta = now - lastTime;
  lastTime = now;
  update(delta);
  draw();
  requestAnimationFrame(loop);
}

openMiceScreenButton.addEventListener("click", () => setScreenVisibility("mice"));
openBugsScreenButton.addEventListener("click", () => setScreenVisibility("bugs"));
closeMiceScreenButton.addEventListener("click", () => setScreenVisibility(null));
closeBugsScreenButton.addEventListener("click", () => setScreenVisibility(null));

miceCanvas.addEventListener("pointerdown", handlePointer);
miceCanvas.addEventListener("pointermove", (event) => {
  if (event.pressure > 0 || event.buttons) {
    handlePointer(event);
  }
});

bugsCanvas.addEventListener("pointerdown", handlePointer);
bugsCanvas.addEventListener("pointermove", (event) => {
  if (event.pressure > 0 || event.buttons) {
    handlePointer(event);
  }
});

setScreenVisibility(null);
requestAnimationFrame(loop);
