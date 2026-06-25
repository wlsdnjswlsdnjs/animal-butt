import { Application, MeshPlane, Texture } from "https://cdn.jsdelivr.net/npm/pixi.js@8.19.0/dist/pixi.mjs";

const animals = [
  {
    id: "capybara-real",
    image: "/assets/animals/capybara-real/base.png",
    alt: "Capybara from behind",
    hitZones: [{ x: 0.5, y: 0.64, rx: 0.33, ry: 0.29 }],
  },
  {
    id: "panda",
    image: "/assets/animals/panda/base.png",
    alt: "Panda from behind",
    hitZones: [{ x: 0.5, y: 0.7, rx: 0.31, ry: 0.25 }],
  },
  {
    id: "corgi",
    image: "/assets/animals/corgi/base.png",
    alt: "Corgi from behind",
    hitZones: [
      { x: 0.39, y: 0.67, rx: 0.19, ry: 0.24 },
      { x: 0.61, y: 0.67, rx: 0.19, ry: 0.24 },
    ],
  },
  {
    id: "cat",
    image: "/assets/animals/cat/base.png",
    alt: "Cat from behind",
    hitZones: [
      { x: 0.38, y: 0.67, rx: 0.2, ry: 0.25 },
      { x: 0.62, y: 0.67, rx: 0.2, ry: 0.25 },
    ],
  },
  {
    id: "rabbit",
    image: "/assets/animals/rabbit/base.png",
    alt: "Rabbit from behind",
    hitZones: [
      { x: 0.39, y: 0.68, rx: 0.2, ry: 0.28 },
      { x: 0.61, y: 0.68, rx: 0.2, ry: 0.28 },
      { x: 0.5, y: 0.81, rx: 0.15, ry: 0.12 },
    ],
  },
  {
    id: "hamster",
    image: "/assets/animals/hamster/base.png",
    alt: "Hamster from behind",
    hitZones: [{ x: 0.5, y: 0.66, rx: 0.29, ry: 0.28 }],
  },
  {
    id: "guinea-pig",
    image: "/assets/animals/guinea-pig/base.png",
    alt: "Guinea pig from behind",
    hitZones: [{ x: 0.5, y: 0.66, rx: 0.3, ry: 0.26 }],
  },
  {
    id: "lamb",
    image: "/assets/animals/lamb/base.png",
    alt: "Lamb from behind",
    hitZones: [{ x: 0.5, y: 0.63, rx: 0.28, ry: 0.27 }],
  },
  {
    id: "duck",
    image: "/assets/animals/duck/base.png",
    alt: "Duck from behind",
    hitZones: [{ x: 0.5, y: 0.66, rx: 0.25, ry: 0.22 }],
  },
  {
    id: "penguin",
    image: "/assets/animals/penguin/base.png",
    alt: "Penguin from behind",
    hitZones: [{ x: 0.5, y: 0.67, rx: 0.24, ry: 0.25 }],
  },
  {
    id: "shiba-inu",
    image: "/assets/animals/shiba-inu/base.png",
    alt: "Shiba Inu from behind",
    hitZones: [
      { x: 0.41, y: 0.64, rx: 0.14, ry: 0.22 },
      { x: 0.59, y: 0.64, rx: 0.14, ry: 0.22 },
    ],
  },
];

const stageElement = document.querySelector(".stage");
const app = new Application();
const touchesToAdvance = 10;
const imageCache = new Map();

setStatus("booting");

let plane;
let texture;
let positions;
let positionBuffer;
let basePositions;
let imageScale = 1;
let imageBounds = { x: 0, y: 0, width: 0, height: 0 };
let impulses = [];
let currentAnimalIndex = -1;
let touchCount = 0;
let isChangingAnimal = false;
let pendingAdvance = false;
let remainingAnimalIndices = shuffleIndices();

await app.init({
  autoDensity: true,
  antialias: true,
  backgroundAlpha: 0,
  preference: "webgl",
  resizeTo: window,
  resolution: Math.min(window.devicePixelRatio || 1, 2),
});

setStatus("pixi-ready");
stageElement.appendChild(app.canvas);

const firstAnimal = await loadNextAnimal();
setStatus("texture-ready");

plane = new MeshPlane({
  texture,
  verticesX: 34,
  verticesY: 34,
});
plane.eventMode = "none";
app.stage.addChild(plane);

const positionAttribute = plane.geometry.getAttribute("aPosition");
positionBuffer = positionAttribute.buffer;
positions = positionBuffer.data;
basePositions = new Float32Array(positions);

resizeImage();
window.addEventListener("resize", resizeImage);
app.canvas.addEventListener("pointerdown", handlePress, { passive: true });
app.canvas.addEventListener("pointermove", updateCursor, { passive: true });
app.canvas.addEventListener("pointerleave", resetCursor, { passive: true });
app.ticker.add(tick);

setStatus("ready");
setDebugAnimal(firstAnimal);
preloadRemainingAnimals();

function pickAnimalIndex() {
  if (animals.length === 1) return 0;

  if (!remainingAnimalIndices.length) {
    remainingAnimalIndices = shuffleIndices();
  }

  const nextIndex = remainingAnimalIndices.pop();

  if (nextIndex === currentAnimalIndex) {
    if (!remainingAnimalIndices.length) {
      remainingAnimalIndices = shuffleIndices().filter((index) => index !== currentAnimalIndex);
    }

    const replacementIndex = remainingAnimalIndices.pop();
    remainingAnimalIndices.unshift(nextIndex);
    return replacementIndex;
  }

  return nextIndex;
}

function shuffleIndices() {
  const indices = animals.map((_, index) => index);

  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices;
}

async function loadNextAnimal() {
  const nextIndex = pickAnimalIndex();
  const nextAnimal = animals[nextIndex];

  isChangingAnimal = true;
  setStatus("loading-image");
  stageElement.dataset.animal = nextAnimal.id;
  stageElement.dataset.touches = "0";
  stageElement.dataset.lastHit = "";
  stageElement.setAttribute("aria-label", nextAnimal.alt);

  const image = await loadImage(nextAnimal.image);
  const nextTexture = Texture.from(image);

  currentAnimalIndex = nextIndex;
  touchCount = 0;
  pendingAdvance = false;
  impulses = [];
  texture = nextTexture;

  isChangingAnimal = false;
  setStatus("image-ready");
  return nextAnimal;
}

function loadImage(src) {
  if (imageCache.has(src)) {
    return imageCache.get(src);
  }

  const imagePromise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image: ${src}`));
    image.src = src;
  });

  imageCache.set(src, imagePromise);
  return imagePromise;
}

function preloadRemainingAnimals() {
  for (const preloadAnimal of animals) {
    loadImage(preloadAnimal.image).catch(() => {});
  }
}

function resizeImage() {
  const padding = Math.max(10, Math.min(window.innerWidth, window.innerHeight) * 0.026);
  const availableWidth = window.innerWidth - padding * 2;
  const availableHeight = window.innerHeight - padding * 2;

  imageScale = Math.min(availableWidth / texture.width, availableHeight / texture.height);

  const width = texture.width * imageScale;
  const height = texture.height * imageScale;

  imageBounds = {
    x: (window.innerWidth - width) / 2,
    y: (window.innerHeight - height) / 2,
    width,
    height,
  };

  plane.scale.set(imageScale);
  plane.position.set(imageBounds.x, imageBounds.y);
}

function handlePress(event) {
  if (isChangingAnimal) return;

  const point = getLocalPoint(event.clientX, event.clientY);

  if (!point || !isInButtHitArea(point.x, point.y)) {
    stageElement.dataset.lastHit = "miss";
    return;
  }

  impulses.push({
    x: point.x,
    y: point.y,
    age: 0,
    duration: 0.76,
    radius: texture.width * 0.22,
    strength: texture.width * 0.034,
  });
  touchCount += 1;
  stageElement.dataset.lastHit = "butt";
  stageElement.dataset.touches = String(touchCount);
  stageElement.dataset.impulses = String(impulses.length);

  if (touchCount >= touchesToAdvance && !pendingAdvance) {
    pendingAdvance = true;
    window.setTimeout(advanceAnimal, 180);
  }
}

function getLocalPoint(clientX, clientY) {
  const rect = app.canvas.getBoundingClientRect();
  const canvasX = clientX - rect.left;
  const canvasY = clientY - rect.top;
  const localX = (canvasX - imageBounds.x) / imageScale;
  const localY = (canvasY - imageBounds.y) / imageScale;

  if (localX < 0 || localY < 0 || localX > texture.width || localY > texture.height) {
    return null;
  }

  return { x: localX, y: localY };
}

function isInButtHitArea(localX, localY) {
  const animal = animals[currentAnimalIndex];
  const zones = animal?.hitZones || [];
  const normalizedX = localX / texture.width;
  const normalizedY = localY / texture.height;

  return zones.some((zone) => {
    const dx = (normalizedX - zone.x) / zone.rx;
    const dy = (normalizedY - zone.y) / zone.ry;

    return dx * dx + dy * dy <= 1;
  });
}

function updateCursor(event) {
  const point = getLocalPoint(event.clientX, event.clientY);
  app.canvas.style.cursor = point && isInButtHitArea(point.x, point.y) ? "pointer" : "default";
}

function resetCursor() {
  app.canvas.style.cursor = "default";
}

async function advanceAnimal() {
  if (isChangingAnimal) return;

  const nextAnimal = await loadNextAnimal();

  plane.texture = texture;
  positions.set(basePositions);
  positionBuffer.update();
  resizeImage();
  setDebugAnimal(nextAnimal);
  setStatus("ready");
}

function tick(ticker) {
  const deltaSeconds = (ticker.deltaMS || 16.67) / 1000;

  if (!impulses.length) {
    return;
  }

  positions.set(basePositions);

  for (const impulse of impulses) {
    impulse.age += deltaSeconds;
    applyImpulse(impulse);
  }

  impulses = impulses.filter((impulse) => impulse.age < impulse.duration);
  stageElement.dataset.impulses = String(impulses.length);
  positionBuffer.update();
}

function setStatus(status) {
  stageElement.dataset.status = status;
  window.__animalButtStatus = status;
}

function setDebugAnimal(animal) {
  window.__animalButt = {
    renderer: "pixi",
    animal: animal.id,
    totalAnimals: animals.length,
    touchesToAdvance,
    hitZones: animal.hitZones,
    isInButtHitArea(normalizedX, normalizedY) {
      return animal.hitZones.some((zone) => {
        const dx = (normalizedX - zone.x) / zone.rx;
        const dy = (normalizedY - zone.y) / zone.ry;

        return dx * dx + dy * dy <= 1;
      });
    },
    get touchCount() {
      return touchCount;
    },
    get activeImpulses() {
      return impulses.length;
    },
    get imageBounds() {
      return { ...imageBounds };
    },
    get imageScale() {
      return imageScale;
    },
  };
}

function applyImpulse(impulse) {
  const progress = impulse.age / impulse.duration;
  const amplitude = Math.exp(-5.2 * progress) * Math.cos(progress * Math.PI * 5.2);

  if (Math.abs(amplitude) < 0.006) {
    return;
  }

  const radius = impulse.radius;
  const radiusSquared = radius * radius;

  for (let i = 0; i < positions.length; i += 2) {
    const baseX = basePositions[i];
    const baseY = basePositions[i + 1];
    const dx = baseX - impulse.x;
    const dy = baseY - impulse.y;
    const distanceSquared = dx * dx + dy * dy;

    if (distanceSquared > radiusSquared) {
      continue;
    }

    const distance = Math.sqrt(distanceSquared);
    const falloff = 1 - distance / radius;
    const eased = falloff * falloff * (3 - 2 * falloff);
    const directionalX = dx / radius;
    const directionalY = dy / radius;
    const power = impulse.strength * eased * amplitude;

    positions[i] += directionalX * power * 0.95;
    positions[i + 1] += (-directionalY * power * 0.22) + power * 0.14;
  }
}
