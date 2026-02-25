const homeScreen = document.getElementById("home-screen");
const miceScreen = document.getElementById("mice-screen");
const bugsScreen = document.getElementById("bugs-screen");
const lizardsScreen = document.getElementById("lizards-screen");

const openMiceScreenButton = document.getElementById("open-mice-screen");
const openBugsScreenButton = document.getElementById("open-bugs-screen");
const openLizardsScreenButton = document.getElementById("open-lizards-screen");
const closeMiceScreenButton = document.getElementById("close-mice-screen");
const closeBugsScreenButton = document.getElementById("close-bugs-screen");
const closeLizardsScreenButton = document.getElementById("close-lizards-screen");

const miceCanvas = document.getElementById("mice-playfield");
const bugsCanvas = document.getElementById("bugs-playfield");
const lizardsCanvas = document.getElementById("lizards-playfield");
const miceCtx = miceCanvas.getContext("2d");
const bugsCtx = bugsCanvas.getContext("2d");
const lizardsCtx = lizardsCanvas.getContext("2d");

const CREATURE_TYPES = {
  mice: [
    { name: "Field mouse", color: "#cfd4db", accent: "#f7b6c5", size: 38, speed: 55, wobble: 10 },
  ],
  bugs: [
    { name: "Ladybug", color: "#ef476f", accent: "#111827", size: 30, speed: 70, wobble: 15 },
  ],
  lizards: [
    { name: "Gecko", color: "#7fd66e", accent: "#285b29", size: 34, speed: 60, wobble: 12 },
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
  resizeCanvas(lizardsCanvas, lizardsCtx);
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

  const showLizards = screen === "lizards";
  lizardsScreen.classList.toggle("hidden", !showLizards);
  lizardsScreen.setAttribute("aria-hidden", String(!showLizards));

  if (showBugs) {
    activeCanvas = bugsCanvas;
    activeCtx = bugsCtx;
  } else if (showLizards) {
    activeCanvas = lizardsCanvas;
    activeCtx = lizardsCtx;
  } else {
    activeCanvas = miceCanvas;
    activeCtx = miceCtx;
  }

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

function drawMouse(c) {
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
}

function drawLadybug(c) {
  // Shell
  activeCtx.fillStyle = c.color;
  activeCtx.beginPath();
  activeCtx.ellipse(0, 0, c.size * 1.05, c.size * 0.9, 0, 0, Math.PI * 2);
  activeCtx.fill();

  // Head
  activeCtx.fillStyle = c.accent;
  activeCtx.beginPath();
  activeCtx.arc(c.size * 0.92, 0, c.size * 0.34, 0, Math.PI * 2);
  activeCtx.fill();

  // Wing split
  activeCtx.strokeStyle = `${c.accent}ee`;
  activeCtx.lineWidth = 3;
  activeCtx.beginPath();
  activeCtx.moveTo(-c.size * 0.95, 0);
  activeCtx.lineTo(c.size * 0.7, 0);
  activeCtx.stroke();

  // Spots
  activeCtx.fillStyle = c.accent;
  const spots = [
    [-0.35, -0.4],
    [-0.35, 0.4],
    [0.15, -0.5],
    [0.15, 0.5],
    [0.5, -0.25],
    [0.5, 0.25],
  ];

  spots.forEach(([sx, sy]) => {
    activeCtx.beginPath();
    activeCtx.arc(c.size * sx, c.size * sy, c.size * 0.16, 0, Math.PI * 2);
    activeCtx.fill();
  });

  // Antennae
  activeCtx.strokeStyle = `${c.accent}dd`;
  activeCtx.lineWidth = 2;
  activeCtx.beginPath();
  activeCtx.moveTo(c.size * 1.1, -c.size * 0.12);
  activeCtx.quadraticCurveTo(c.size * 1.45, -c.size * 0.45, c.size * 1.62, -c.size * 0.75);
  activeCtx.moveTo(c.size * 1.1, c.size * 0.12);
  activeCtx.quadraticCurveTo(c.size * 1.45, c.size * 0.45, c.size * 1.62, c.size * 0.75);
  activeCtx.stroke();

  // Tiny feet
  activeCtx.strokeStyle = `${c.accent}bb`;
  activeCtx.lineWidth = 1.6;
  activeCtx.beginPath();
  activeCtx.moveTo(-c.size * 0.45, -c.size * 0.82);
  activeCtx.lineTo(-c.size * 0.55, -c.size * 1.0);
  activeCtx.moveTo(-c.size * 0.05, -c.size * 0.9);
  activeCtx.lineTo(-c.size * 0.1, -c.size * 1.08);
  activeCtx.moveTo(-c.size * 0.45, c.size * 0.82);
  activeCtx.lineTo(-c.size * 0.55, c.size * 1.0);
  activeCtx.moveTo(-c.size * 0.05, c.size * 0.9);
  activeCtx.lineTo(-c.size * 0.1, c.size * 1.08);
  activeCtx.stroke();
}

function drawLizard(c) {
  // Tail
  activeCtx.strokeStyle = "#4f8f4b";
  activeCtx.lineWidth = 7;
  activeCtx.lineCap = "round";
  activeCtx.beginPath();
  activeCtx.moveTo(-c.size * 1.05, 0);
  activeCtx.quadraticCurveTo(-c.size * 1.85, -c.size * 0.55, -c.size * 2.4, -c.size * 0.08);
  activeCtx.quadraticCurveTo(-c.size * 2.05, c.size * 0.38, -c.size * 1.45, c.size * 0.12);
  activeCtx.stroke();

  // Body
  activeCtx.fillStyle = c.color;
  activeCtx.beginPath();
  activeCtx.ellipse(0, 0, c.size * 1.22, c.size * 0.52, 0, 0, Math.PI * 2);
  activeCtx.fill();

  // Neck + head
  activeCtx.fillStyle = "#90df79";
  activeCtx.beginPath();
  activeCtx.ellipse(c.size * 0.75, 0, c.size * 0.42, c.size * 0.3, 0, 0, Math.PI * 2);
  activeCtx.fill();

  activeCtx.fillStyle = c.color;
  activeCtx.beginPath();
  activeCtx.ellipse(c.size * 1.25, 0, c.size * 0.54, c.size * 0.34, 0, 0, Math.PI * 2);
  activeCtx.fill();

  // Arms and legs
  const limbs = [
    { x: c.size * 0.5, y: -c.size * 0.34, fx: c.size * 0.95, fy: -c.size * 0.7 },
    { x: c.size * 0.5, y: c.size * 0.34, fx: c.size * 0.95, fy: c.size * 0.7 },
    { x: -c.size * 0.45, y: -c.size * 0.34, fx: -c.size * 0.85, fy: -c.size * 0.7 },
    { x: -c.size * 0.45, y: c.size * 0.34, fx: -c.size * 0.85, fy: c.size * 0.7 },
  ];

  activeCtx.strokeStyle = "#3f7a40";
  activeCtx.lineWidth = 4;
  activeCtx.lineCap = "round";
  limbs.forEach((limb) => {
    activeCtx.beginPath();
    activeCtx.moveTo(limb.x, limb.y);
    activeCtx.quadraticCurveTo(
      (limb.x + limb.fx) * 0.5,
      limb.y,
      limb.fx,
      limb.fy,
    );
    activeCtx.stroke();

    // Small toes
    activeCtx.beginPath();
    activeCtx.moveTo(limb.fx, limb.fy);
    activeCtx.lineTo(limb.fx + c.size * 0.16, limb.fy);
    activeCtx.moveTo(limb.fx, limb.fy);
    activeCtx.lineTo(limb.fx + c.size * 0.08, limb.fy + (limb.fy > 0 ? c.size * 0.12 : -c.size * 0.12));
    activeCtx.moveTo(limb.fx, limb.fy);
    activeCtx.lineTo(limb.fx - c.size * 0.08, limb.fy + (limb.fy > 0 ? c.size * 0.12 : -c.size * 0.12));
    activeCtx.stroke();
  });

  // Dorsal pattern
  activeCtx.strokeStyle = "#5ca65a";
  activeCtx.lineWidth = 2;
  activeCtx.beginPath();
  activeCtx.moveTo(-c.size * 0.95, 0);
  activeCtx.quadraticCurveTo(-c.size * 0.2, -c.size * 0.28, c.size * 0.75, 0);
  activeCtx.quadraticCurveTo(-c.size * 0.2, c.size * 0.28, -c.size * 0.95, 0);
  activeCtx.stroke();

  // Eyes + smile
  activeCtx.fillStyle = c.accent;
  activeCtx.beginPath();
  activeCtx.arc(c.size * 1.45, -c.size * 0.11, c.size * 0.07, 0, Math.PI * 2);
  activeCtx.arc(c.size * 1.45, c.size * 0.11, c.size * 0.07, 0, Math.PI * 2);
  activeCtx.fill();

  activeCtx.strokeStyle = "#285b29";
  activeCtx.lineWidth = 2;
  activeCtx.beginPath();
  activeCtx.moveTo(c.size * 1.58, -c.size * 0.06);
  activeCtx.quadraticCurveTo(c.size * 1.75, 0, c.size * 1.58, c.size * 0.06);
  activeCtx.stroke();
}

function drawCreature(c) {
  activeCtx.save();
  activeCtx.translate(c.x, c.y);
  const angle = Math.atan2(c.vy, c.vx);
  activeCtx.rotate(angle);

  if (activeScreen === "bugs") {
    drawLadybug(c);
  } else if (activeScreen === "lizards") {
    drawLizard(c);
  } else {
    drawMouse(c);
  }

  activeCtx.restore();
}

function draw() {
  miceCtx.clearRect(0, 0, width, height);
  bugsCtx.clearRect(0, 0, width, height);
  lizardsCtx.clearRect(0, 0, width, height);

  if (!activeScreen) {
    return;
  }

  const gradient = activeCtx.createLinearGradient(0, 0, width, height);
  if (activeScreen === "bugs") {
    gradient.addColorStop(0, "rgba(240, 113, 103, 0.16)");
    gradient.addColorStop(0.5, "rgba(255, 193, 7, 0.12)");
    gradient.addColorStop(1, "rgba(52, 120, 246, 0.08)");
  } else if (activeScreen === "lizards") {
    gradient.addColorStop(0, "rgba(127, 214, 110, 0.16)");
    gradient.addColorStop(0.5, "rgba(163, 230, 53, 0.1)");
    gradient.addColorStop(1, "rgba(45, 114, 83, 0.1)");
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
openLizardsScreenButton.addEventListener("click", () => setScreenVisibility("lizards"));
closeMiceScreenButton.addEventListener("click", () => setScreenVisibility(null));
closeBugsScreenButton.addEventListener("click", () => setScreenVisibility(null));
closeLizardsScreenButton.addEventListener("click", () => setScreenVisibility(null));

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

lizardsCanvas.addEventListener("pointerdown", handlePointer);
lizardsCanvas.addEventListener("pointermove", (event) => {
  if (event.pressure > 0 || event.buttons) {
    handlePointer(event);
  }
});

setScreenVisibility(null);
requestAnimationFrame(loop);
