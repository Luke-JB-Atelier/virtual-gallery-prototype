import './styles.css';
import * as THREE from 'three';
import publicGalleryState from './public-gallery-state.json';

const canvas = document.querySelector('#gallery');
const hint = document.querySelector('#hint');
const status = document.querySelector('#status');
const crosshair = document.querySelector('#crosshair');
const audioToggle = document.querySelector('#audio-toggle');
const roomLightControl = document.querySelector('#room-light-control');
const roomLightPublicPowerInput = document.querySelector('#room-light-public-power');
const mobileControls = document.querySelector('#mobile-controls');
const moveStick = document.querySelector('#move-stick');
const moveStickKnob = document.querySelector('#move-stick-knob');
const lookPad = document.querySelector('#look-pad');
const toggleLightEditor = document.querySelector('#toggle-light-editor');
const lightPanel = document.querySelector('#light-panel');
const lightTitle = document.querySelector('#light-title');
const addLightButton = document.querySelector('#add-light');
const nextLightButton = document.querySelector('#next-light');
const removeLightButton = document.querySelector('#remove-light');
const lightYawInput = document.querySelector('#light-yaw');
const lightPitchInput = document.querySelector('#light-pitch');
const lightPowerInput = document.querySelector('#light-power');
const lightColorInput = document.querySelector('#light-color');
const lightAngleInput = document.querySelector('#light-angle');
const lightTrackPositionInput = document.querySelector('#light-track-position');
const roomLightEnabledInput = document.querySelector('#room-light-enabled');
const roomLightPowerInput = document.querySelector('#room-light-power');
const toggleArtEditor = document.querySelector('#toggle-art-editor');
const artPanel = document.querySelector('#art-panel');
const artTitle = document.querySelector('#art-title');
const artStatus = document.querySelector('#art-status');
const artFreeModeInput = document.querySelector('#art-free-mode');
const addArtButton = document.querySelector('#add-art');
const loadArtButton = document.querySelector('#load-art');
const moveArtButton = document.querySelector('#move-art');
const removeArtButton = document.querySelector('#remove-art');
const swapArtButton = document.querySelector('#swap-art');
const saveArtButton = document.querySelector('#save-art');
const exportArtButton = document.querySelector('#export-art');
const resetLocalArtButton = document.querySelector('#reset-local-art');
const artFileInput = document.querySelector('#art-file');
const artOffsetXInput = document.querySelector('#art-offset-x');
const artHeightInput = document.querySelector('#art-height');
const artWidthCmInput = document.querySelector('#art-width-cm');
const artHeightCmInput = document.querySelector('#art-height-cm');
const artLabelTitleInput = document.querySelector('#art-label-title');
const artLabelMediumInput = document.querySelector('#art-label-medium');
const artLabelSizeInput = document.querySelector('#art-label-size');
const artLabelDateInput = document.querySelector('#art-label-date');
const artLabelPriceInput = document.querySelector('#art-label-price');
const artFrameSizeInput = document.querySelector('#art-frame-size');
const artFrameColorInput = document.querySelector('#art-frame-color');
const togglePedestalEditor = document.querySelector('#toggle-pedestal-editor');
const pedestalPanel = document.querySelector('#pedestal-panel');
const pedestalTitle = document.querySelector('#pedestal-title');
const pedestalStatus = document.querySelector('#pedestal-status');
const addPedestalButton = document.querySelector('#add-pedestal');
const movePedestalButton = document.querySelector('#move-pedestal');
const removePedestalButton = document.querySelector('#remove-pedestal');
const pedestalTypeInput = document.querySelector('#pedestal-type');
const pedestalWidthCmInput = document.querySelector('#pedestal-width-cm');
const pedestalDepthCmInput = document.querySelector('#pedestal-depth-cm');
const pedestalHeightCmInput = document.querySelector('#pedestal-height-cm');
const toggleAudioEditor = document.querySelector('#toggle-audio-editor');
const audioPanel = document.querySelector('#audio-panel');
const audioVolumeInput = document.querySelector('#audio-volume');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070a);
scene.fog = new THREE.Fog(0x05070a, 34, 70);

const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.05, 60);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true;
const maxShadowedSpotLights = 3;

const roomWidth = 9;
const roomDepth = 12;
const roomHeight = 3.4;
const centimetersPerMeter = 100;
const defaultArtworkWidthCm = 120;
const defaultArtworkAspect = 1;
const lightingStorageKey = 'virtual-gallery-lighting-oil-v3';
const galleryStorageKey = 'virtual-gallery-art-oil-v1';
const urlParams = new URLSearchParams(window.location.search);
const editorMode = urlParams.has('edit');
const useLocalSavedState = editorMode || urlParams.has('local');
const exportedGalleryState = publicGalleryState?.version === 1 ? publicGalleryState : null;
const savedGallery = useLocalSavedState
  ? loadGalleryState() ?? exportedGalleryState?.gallery ?? null
  : exportedGalleryState?.gallery ?? null;
const audioSettings = {
  volume: THREE.MathUtils.clamp(Number(savedGallery?.audio?.volume ?? 1), 0, 1),
};
if (audioVolumeInput) {
  audioVolumeInput.value = String(Math.round(audioSettings.volume * 100));
}
document.body.classList.toggle('viewer-mode', !editorMode);

function publicAssetPath(path) {
  if (!path || /^(data:|blob:|https?:)/i.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}

const jazzPlaylist = [
  'audio/jazz/waveloom-jazz-bar-516749.mp3',
  'audio/jazz/waveloom-jazz-cafe-516774.mp3',
  'audio/jazz/waveloom-jazz-restaurant-516751.mp3',
].map(publicAssetPath);

const room = new THREE.Group();
scene.add(room);
const wallMeshes = [];

function createWallTexture() {
  const size = 1024;
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = size;
  textureCanvas.height = size;
  const ctx = textureCanvas.getContext('2d');
  const image = ctx.createImageData(size, size);
  const noise = new Float32Array(size * size);

  for (let i = 0; i < noise.length; i += 1) {
    noise[i] = Math.random();
  }

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const center = noise[y * size + x];
      const rightNoise = noise[y * size + ((x + 9) % size)];
      const downNoise = noise[((y + 9) % size) * size + x];
      const coarse = (center + rightNoise + downNoise) / 3;
      const pore = Math.random() > 0.992 ? -46 : 0;
      const value = THREE.MathUtils.clamp(128 + coarse * 18 + pore, 64, 166);
      image.data[i] = value;
      image.data[i + 1] = value;
      image.data[i + 2] = value;
      image.data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.15, 0.55);
  texture.colorSpace = THREE.NoColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

const wallTexture = createWallTexture();

function createCarpetTexture() {
  const size = 1024;
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = size;
  textureCanvas.height = size;
  const ctx = textureCanvas.getContext('2d');
  const image = ctx.createImageData(size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const fiber = Math.random() * 22;
      const crossFiber = Math.random() > 0.62 ? 10 : 0;
      const thread = ((x + Math.floor(y * 0.18)) % 13) < 3 ? 12 : 0;
      const darkerKnot = Math.random() > 0.993 ? -44 : 0;
      const r = THREE.MathUtils.clamp(86 + fiber + thread + darkerKnot, 38, 128);
      const g = THREE.MathUtils.clamp(18 + fiber * 0.24 + crossFiber * 0.15 + darkerKnot * 0.08, 8, 42);
      const b = THREE.MathUtils.clamp(24 + fiber * 0.22 + darkerKnot * 0.1, 10, 48);
      image.data[i] = r;
      image.data[i + 1] = g;
      image.data[i + 2] = b;
      image.data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.2, 2.8);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

const carpetTexture = createCarpetTexture();

const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0x20272d,
  emissive: 0x080d11,
  emissiveIntensity: 0.28,
  bumpMap: wallTexture,
  bumpScale: 0.01,
  roughness: 0.9,
  metalness: 0,
  side: THREE.DoubleSide,
  vertexColors: true,
  depthTest: true,
  depthWrite: true,
  fog: false,
});

const archWallMaterial = new THREE.MeshStandardMaterial({
  color: 0x20272d,
  emissive: 0x080d11,
  emissiveIntensity: 0.28,
  bumpMap: wallTexture,
  bumpScale: 0.01,
  roughness: 0.9,
  metalness: 0,
  side: THREE.DoubleSide,
  vertexColors: true,
  depthTest: true,
  depthWrite: true,
  fog: false,
});

const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  map: carpetTexture,
  emissive: 0x150304,
  emissiveIntensity: 0.16,
  bumpMap: carpetTexture,
  bumpScale: 0.028,
  roughness: 1,
  metalness: 0,
  side: THREE.DoubleSide,
  vertexColors: true,
  depthTest: true,
  depthWrite: true,
  fog: false,
});

const ceilingMaterial = new THREE.MeshStandardMaterial({
  color: 0x05070a,
  emissive: 0x020304,
  emissiveIntensity: 0.18,
  roughness: 0.94,
  metalness: 0,
  side: THREE.DoubleSide,
  depthTest: true,
  depthWrite: true,
  fog: false,
});

const wallTrimMaterial = new THREE.MeshStandardMaterial({
  color: 0x050609,
  emissive: 0x010203,
  emissiveIntensity: 0.16,
  roughness: 0.76,
  metalness: 0.08,
});

function plane(width, height, material, position, rotation, segments = 1) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height, segments, segments), material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  room.add(mesh);
  return mesh;
}


function addFloorEdgeDarkening(mesh) {
  const geometry = mesh.geometry;
  const position = geometry.attributes.position;
  const colors = [];
  const centerColor = new THREE.Color(0xb84438);
  const edgeColor = new THREE.Color(0x4b1218);

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const edgeDistance = Math.max(Math.abs(x) / (roomWidth / 2), Math.abs(y) / (roomDepth / 2));
    const t = THREE.MathUtils.smoothstep(edgeDistance, 0.42, 1.0);
    const color = centerColor.clone().lerp(edgeColor, t * 0.82);
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
}

function addFloorBoxEdgeDarkening(mesh) {
  const geometry = mesh.geometry;
  const position = geometry.attributes.position;
  const colors = [];
  const centerColor = new THREE.Color(0xa93630);
  const edgeColor = new THREE.Color(0x3b0d13);

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const edgeDistance = Math.max(Math.abs(x) / (roomWidth / 2), Math.abs(z) / (roomDepth / 2));
    const t = THREE.MathUtils.smoothstep(edgeDistance, 0.42, 1.0);
    const color = centerColor.clone().lerp(edgeColor, t * 0.82);
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
}

function addSurfaceEdgeDarkening(mesh, width, height, centerTint = 0xffffff, edgeTint = 0x686e72) {
  const geometry = mesh.geometry;
  const position = geometry.attributes.position;
  const colors = [];
  const centerColor = new THREE.Color(centerTint);
  const edgeColor = new THREE.Color(edgeTint);

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const sideEdge = Math.abs(x) / (width / 2);
    const verticalEdge = Math.abs(y) / (height / 2);
    const edgeDistance = Math.max(sideEdge, verticalEdge);
    const t = THREE.MathUtils.smoothstep(edgeDistance, 0.58, 1.0);
    const color = centerColor.clone().lerp(edgeColor, t * 0.62);
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
}

function setGeometryColor(geometry, colorValue = 0xffffff) {
  const color = new THREE.Color(colorValue);
  const count = geometry.attributes.position.count;
  const colors = [];
  for (let i = 0; i < count; i += 1) {
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
}

const doorway = {
  width: 1.45,
  height: 1.55,
};
const corridorLength = 1.15;
const roomStep = roomDepth + corridorLength;
const galleryRooms = [
  { id: 'main', centerX: 0, centerZ: 0, hasBackDoor: false, hasFrontDoor: true },
  { id: 'room-2', centerX: 0, centerZ: roomStep, hasBackDoor: true, hasFrontDoor: true },
  { id: 'room-3', centerX: 0, centerZ: roomStep * 2, hasBackDoor: true, hasFrontDoor: false },
];

function addRoomFloorAndCeiling(centerX, centerZ) {
  const floorMesh = plane(roomWidth, roomDepth, floorMaterial, [centerX, 0, centerZ], [-Math.PI / 2, 0, 0], 24);
  addFloorEdgeDarkening(floorMesh);
  plane(roomWidth, roomDepth, ceilingMaterial, [centerX, roomHeight, centerZ], [Math.PI / 2, 0, 0]);
}

function addBarrelVault(centerZ) {
  const halfWidth = doorway.width / 2;
  const length = corridorLength;
  const springY = doorway.height;
  const arcSegments = 18;
  const lengthSegments = 8;
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let zIndex = 0; zIndex <= lengthSegments; zIndex += 1) {
    const z = centerZ - length / 2 + (zIndex / lengthSegments) * length;
    for (let xIndex = 0; xIndex <= arcSegments; xIndex += 1) {
      const theta = Math.PI - (xIndex / arcSegments) * Math.PI;
      const x = Math.cos(theta) * halfWidth;
      const y = springY + Math.sin(theta) * halfWidth;
      vertices.push(x, y, z);
      uvs.push(xIndex / arcSegments, zIndex / lengthSegments);
    }
  }

  for (let zIndex = 0; zIndex < lengthSegments; zIndex += 1) {
    for (let xIndex = 0; xIndex < arcSegments; xIndex += 1) {
      const a = zIndex * (arcSegments + 1) + xIndex;
      const b = a + 1;
      const c = a + arcSegments + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  setGeometryColor(geometry);
  geometry.computeVertexNormals();

  const vault = new THREE.Mesh(geometry, archWallMaterial);
  room.add(vault);
}

function addCorridorFloorAndCeiling(centerZ) {
  const floorMesh = plane(doorway.width, corridorLength, floorMaterial, [0, 0, centerZ], [-Math.PI / 2, 0, 0], 8);
  addFloorEdgeDarkening(floorMesh);
  addBarrelVault(centerZ);
}

function addWall(width, height, position, rotation, segments = 18) {
  const mesh = plane(width, height, wallMaterial, position, rotation, segments);
  addSurfaceEdgeDarkening(mesh, width, height);
  wallMeshes.push(mesh);
  return mesh;
}

function addWallSegment(startX, startZ, endX, endZ, height = roomHeight, centerY = height / 2, trims = {}) {
  const {
    floorTrim = true,
    ceilingTrim = true,
  } = trims;
  const dx = endX - startX;
  const dz = endZ - startZ;
  const length = Math.hypot(dx, dz);
  if (length <= 0.05) return null;
  const rotationY = Math.atan2(-dz, dx);
  const wall = addWall(length, height, [(startX + endX) / 2, centerY, (startZ + endZ) / 2], [0, rotationY, 0], 10);
  if (floorTrim) {
    addWallTrim(length, [(startX + endX) / 2, 0.035, (startZ + endZ) / 2], rotationY);
  }
  if (ceilingTrim) {
    addWallTrim(length, [(startX + endX) / 2, centerY + height / 2 - 0.035, (startZ + endZ) / 2], rotationY);
  }
  return wall;
}

function addWallTrim(length, position, rotationY) {
  const trim = new THREE.Mesh(new THREE.BoxGeometry(length, 0.045, 0.055), wallTrimMaterial);
  trim.position.set(...position);
  trim.rotation.y = rotationY;
  trim.castShadow = true;
  trim.receiveShadow = true;
  room.add(trim);
  return trim;
}

function addArchedDoorHeader(z) {
  const halfWidth = doorway.width / 2;
  const springY = doorway.height;
  const archSegments = 36;
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= archSegments; i += 1) {
    const theta = Math.PI - (i / archSegments) * Math.PI;
    const x = Math.cos(theta) * halfWidth;
    const archY = springY + Math.sin(theta) * halfWidth;
    vertices.push(x, archY, z, x, roomHeight, z);
    uvs.push((x + halfWidth) / doorway.width, archY / roomHeight, (x + halfWidth) / doorway.width, 1);
  }

  for (let i = 0; i < archSegments; i += 1) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, c, b, b, c, d);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  setGeometryColor(geometry);
  geometry.computeVertexNormals();
  room.add(new THREE.Mesh(geometry, archWallMaterial));
}

galleryRooms.forEach(({ centerX, centerZ }) => addRoomFloorAndCeiling(centerX, centerZ));

const x0 = -roomWidth / 2;
const x1 = roomWidth / 2;
const galleryMinZ = -roomDepth / 2;
const galleryMaxZ = roomStep * 2 + roomDepth / 2;
const doorTopHeight = roomHeight - doorway.height;
const doorTopCenterY = doorway.height + doorTopHeight / 2;
const doorLeftX = -doorway.width / 2;
const doorRightX = doorway.width / 2;

function addDoorWall(z) {
  addWallSegment(x0, z, doorLeftX, z);
  addWallSegment(doorRightX, z, x1, z);
  addArchedDoorHeader(z);
}

function addSolidRoomWall(z, rotationY) {
  addWall(roomWidth, roomHeight, [0, roomHeight / 2, z], [0, rotationY, 0], 18);
  addWallTrim(roomWidth, [0, 0.035, z], rotationY);
  addWallTrim(roomWidth, [0, roomHeight - 0.035, z], rotationY);
}

function addRectangularRoomWalls(centerZ, hasBackDoor, hasFrontDoor) {
  const backZ = centerZ - roomDepth / 2;
  const frontZ = centerZ + roomDepth / 2;
  if (hasBackDoor) {
    addDoorWall(backZ);
  } else {
    addSolidRoomWall(backZ, 0);
  }
  if (hasFrontDoor) {
    addDoorWall(frontZ);
  } else {
    addSolidRoomWall(frontZ, Math.PI);
  }
  addWallSegment(x0, backZ, x0, frontZ);
  addWallSegment(x1, backZ, x1, frontZ);
}

function addCorridorWalls(startZ, endZ) {
  addCorridorFloorAndCeiling((startZ + endZ) / 2);
  addWallSegment(doorLeftX, startZ, doorLeftX, endZ, doorway.height, doorway.height / 2, { floorTrim: false, ceilingTrim: false });
  addWallSegment(doorRightX, startZ, doorRightX, endZ, doorway.height, doorway.height / 2, { floorTrim: false, ceilingTrim: false });
}

const pedestalBodyMaterial = new THREE.MeshStandardMaterial({
  color: 0x151515,
  roughness: 0.72,
  metalness: 0.04,
});
const pedestalTopMaterial = new THREE.MeshStandardMaterial({
  color: 0x2a2721,
  roughness: 0.66,
  metalness: 0.08,
});
const pedestalSelectionMaterial = new THREE.MeshBasicMaterial({
  color: 0xffd46a,
  transparent: true,
  opacity: 0.82,
  depthWrite: false,
});

function createSpeakerWoodTexture() {
  const size = 512;
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = size;
  textureCanvas.height = size;
  const ctx = textureCanvas.getContext('2d');

  ctx.fillStyle = '#201712';
  ctx.fillRect(0, 0, size, size);
  for (let x = 0; x < size; x += 5) {
    const wobble = Math.sin(x * 0.035) * 7 + Math.sin(x * 0.011) * 16;
    const shade = 28 + Math.floor(Math.sin(x * 0.09) * 10 + Math.random() * 8);
    ctx.strokeStyle = `rgba(${shade + 18}, ${shade + 10}, ${shade + 2}, 0.28)`;
    ctx.lineWidth = Math.random() > 0.78 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x + wobble * 0.2, 0);
    for (let y = 0; y <= size; y += 18) {
      ctx.lineTo(x + Math.sin(y * 0.024 + x * 0.018) * 9 + wobble * 0.2, y);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(0.9, 1.15);
  return texture;
}

function createSpeakerGrilleTexture() {
  const size = 512;
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = size;
  textureCanvas.height = size;
  const ctx = textureCanvas.getContext('2d');
  const center = size / 2;
  const radius = size * 0.42;

  ctx.fillStyle = '#030303';
  ctx.fillRect(0, 0, size, size);
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#020202';
  ctx.fillRect(0, 0, size, size);

  const cell = 15;
  const holeRadius = 4.6;
  for (let y = center - radius - cell; y <= center + radius + cell; y += cell * 0.86) {
    const row = Math.round((y - (center - radius)) / (cell * 0.86));
    const offset = row % 2 ? cell / 2 : 0;
    for (let x = center - radius - cell; x <= center + radius + cell; x += cell) {
      const px = x + offset;
      if ((px - center) ** 2 + (y - center) ** 2 > radius ** 2) continue;
      ctx.fillStyle = '#111315';
      ctx.beginPath();
      ctx.arc(px, y, holeRadius + 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(px, y, holeRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
  ctx.strokeStyle = '#151719';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(center, center, radius + 8, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

const speakerCabinetMaterial = new THREE.MeshStandardMaterial({
  color: 0x2b211a,
  map: createSpeakerWoodTexture(),
  roughness: 0.78,
  metalness: 0.04,
});
const speakerGrilleMaterial = new THREE.MeshStandardMaterial({
  color: 0x0a0b0c,
  map: createSpeakerGrilleTexture(),
  roughness: 0.9,
  metalness: 0.08,
  side: THREE.DoubleSide,
});
const speakerAccentMaterial = new THREE.MeshStandardMaterial({
  color: 0x090909,
  roughness: 0.76,
  metalness: 0.12,
});
const audioSpeakers = [];

function createSpeakerFixture(position, target) {
  const speaker = new THREE.Group();
  speaker.position.copy(position);
  speaker.lookAt(target);

  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.32, 0.14), speakerCabinetMaterial);
  cabinet.castShadow = true;
  cabinet.receiveShadow = true;
  speaker.add(cabinet);

  const grille = new THREE.Mesh(new THREE.CircleGeometry(0.086, 48), speakerGrilleMaterial);
  grille.position.z = 0.073;
  speaker.add(grille);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.089, 0.0065, 8, 48), speakerAccentMaterial);
  rim.position.z = 0.076;
  speaker.add(rim);

  const tweeter = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.012, 18), speakerAccentMaterial);
  tweeter.position.set(0, 0.102, 0.08);
  tweeter.rotation.x = Math.PI / 2;
  speaker.add(tweeter);

  const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.055, 0.06), speakerAccentMaterial);
  bracket.position.z = -0.1;
  speaker.add(bracket);

  room.add(speaker);
  audioSpeakers.push({ group: speaker, position: position.clone(), target: target.clone(), panner: null });
}

function addCornerSpeakers() {
  const roomCenters = [0, roomStep, roomStep * 2];
  roomCenters.forEach((centerZ) => {
    const target = new THREE.Vector3(0, 1.48, centerZ);
    const cornerX = roomWidth / 2 - 0.16;
    const cornerZ = roomDepth / 2 - 0.18;
    [
      new THREE.Vector3(cornerX, roomHeight - 0.34, centerZ - cornerZ),
      new THREE.Vector3(-cornerX, roomHeight - 0.34, centerZ + cornerZ),
    ].forEach((position) => createSpeakerFixture(position, target));
  });
}

function addEntrancePedestal() {
  const pedestal = new THREE.Group();
  pedestal.position.set(2.32, 0, roomDepth / 2 - 0.42);

  const base = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.72, 0.38), pedestalBodyMaterial);
  base.position.y = 0.36;
  base.castShadow = true;
  base.receiveShadow = true;
  pedestal.add(base);

  const top = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.08, 0.5), pedestalTopMaterial);
  top.position.y = 0.76;
  top.castShadow = true;
  top.receiveShadow = true;
  pedestal.add(top);

  const foot = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.08, 0.48), pedestalBodyMaterial);
  foot.position.y = 0.04;
  foot.castShadow = true;
  foot.receiveShadow = true;
  pedestal.add(foot);

  room.add(pedestal);
  return pedestal;
}

function createDisplayPedestal({
  x = 2.2,
  z = roomDepth / 2 - 1.05,
  ry = 0,
  width = 0.72,
  depth = 0.72,
  height = 1.1,
  type = 'pillar',
  content = null,
} = {}) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = ry;

  if (type === 'table') {
    const topHeight = Math.max(0.06, height * 0.1);
    const legWidth = Math.max(0.06, Math.min(width, depth) * 0.08);
    const top = new THREE.Mesh(new THREE.BoxGeometry(width, topHeight, depth), pedestalTopMaterial);
    top.position.y = height - topHeight / 2;
    const lowerShelf = new THREE.Mesh(new THREE.BoxGeometry(width * 0.92, topHeight * 0.72, depth * 0.88), pedestalBodyMaterial);
    lowerShelf.position.y = Math.max(topHeight, height * 0.22);
    group.add(top, lowerShelf);

    const legX = width / 2 - legWidth * 1.25;
    const legZ = depth / 2 - legWidth * 1.25;
    [
      [-legX, -legZ],
      [legX, -legZ],
      [-legX, legZ],
      [legX, legZ],
    ].forEach(([legPosX, legPosZ]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(legWidth, height - topHeight, legWidth), pedestalBodyMaterial);
      leg.position.set(legPosX, (height - topHeight) / 2, legPosZ);
      group.add(leg);
    });
  } else {
    const baseHeight = Math.max(0.08, height * 0.08);
    const capHeight = Math.max(0.08, height * 0.08);
    const shaftHeight = Math.max(0.16, height - baseHeight - capHeight);
    const base = new THREE.Mesh(new THREE.BoxGeometry(width * 1.12, baseHeight, depth * 1.12), pedestalBodyMaterial);
    base.position.y = baseHeight / 2;
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(width * 0.82, shaftHeight, depth * 0.82), pedestalBodyMaterial);
    shaft.position.y = baseHeight + shaftHeight / 2;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(width, capHeight, depth), pedestalTopMaterial);
    cap.position.y = baseHeight + shaftHeight + capHeight / 2;
    group.add(base, shaft, cap);
  }

  group.children.forEach((part) => {
    if (!part.isMesh) return;
    part.castShadow = true;
    part.receiveShadow = true;
  });

  const selection = new THREE.Mesh(
    new THREE.BoxGeometry(width * 1.18, height + 0.04, depth * 1.18),
    pedestalSelectionMaterial,
  );
  selection.position.y = height / 2;
  selection.visible = false;
  selection.renderOrder = 12;
  group.add(selection);

  const pedestalData = {
    group,
    selection,
    width,
    depth,
    height,
    type,
    content,
  };
  group.userData.pedestalData = pedestalData;
  group.traverse((child) => {
    child.userData.pedestalData = pedestalData;
  });
  room.add(group);
  displayPedestals.push(pedestalData);
  return pedestalData;
}

// Three rectangular rooms connected by short centered passages behind the start.
addRectangularRoomWalls(0, false, true);
addCorridorWalls(roomDepth / 2, roomStep - roomDepth / 2);
addRectangularRoomWalls(roomStep, true, true);
addCorridorWalls(roomStep + roomDepth / 2, roomStep * 2 - roomDepth / 2);
addRectangularRoomWalls(roomStep * 2, true, false);
addCornerSpeakers();

const navigationSpaces = [
  { minX: x0, maxX: x1, minZ: galleryMinZ, maxZ: roomDepth / 2, padZMin: 1, padZMax: 0 },
  { minX: doorLeftX, maxX: doorRightX, minZ: roomDepth / 2, maxZ: roomStep - roomDepth / 2, isConnector: true },
  { minX: x0, maxX: x1, minZ: roomStep - roomDepth / 2, maxZ: roomStep + roomDepth / 2, padZMin: 0, padZMax: 0 },
  { minX: doorLeftX, maxX: doorRightX, minZ: roomStep + roomDepth / 2, maxZ: roomStep * 2 - roomDepth / 2, isConnector: true },
  { minX: x0, maxX: x1, minZ: roomStep * 2 - roomDepth / 2, maxZ: galleryMaxZ, padZMin: 0, padZMax: 1 },
];

function getNavigationBounds(space, margin) {
  const xInset = space.isConnector ? margin * 0.35 : margin;
  const zMinInset = (space.padZMin ?? 0) * margin;
  const zMaxInset = (space.padZMax ?? 0) * margin;
  return {
    minX: space.minX + xInset,
    maxX: space.maxX - xInset,
    minZ: space.minZ + zMinInset,
    maxZ: space.maxZ - zMaxInset,
  };
}

function constrainToGallery(position, margin, previousPosition) {
  let currentSpace = null;
  for (const space of navigationSpaces) {
    const bounds = getNavigationBounds(space, margin);
    if (
      position.x >= bounds.minX
      && position.x <= bounds.maxX
      && position.z >= bounds.minZ
      && position.z <= bounds.maxZ
    ) {
      currentSpace = space;
      break;
    }
  }

  if (currentSpace) return;

  let closest = null;
  let closestDistance = Infinity;
  for (const space of navigationSpaces) {
    const bounds = getNavigationBounds(space, margin);
    const x = THREE.MathUtils.clamp(position.x, bounds.minX, bounds.maxX);
    const z = THREE.MathUtils.clamp(position.z, bounds.minZ, bounds.maxZ);
    const distance = (position.x - x) ** 2 + (position.z - z) ** 2;
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = { x, z };
    }
  }

  if (closest) {
    position.x = closest.x;
    position.z = closest.z;
  }

  void previousPosition;
}

scene.add(new THREE.AmbientLight(0xf4f7ff, 0.24));
scene.add(new THREE.HemisphereLight(0x6f86a3, 0x241014, 0.22));

function addRoomNavigationLight(centerZ) {
  const fill = new THREE.PointLight(0x6f8195, 2.8, roomDepth * 1.45, 1.05);
  fill.position.set(0, roomHeight * 0.52, centerZ);
  fill.castShadow = false;
  scene.add(fill);
  return fill;
}

const navigationFillLights = galleryRooms.map(({ centerZ }) => ({
  centerZ,
  light: addRoomNavigationLight(centerZ),
}));

const roomLightState = {
  enabled: true,
  power: 12,
};
const savedLighting = useLocalSavedState
  ? loadLightingState() ?? exportedGalleryState?.lighting ?? null
  : exportedGalleryState?.lighting ?? null;
roomLightEnabledInput.checked = roomLightState.enabled;
roomLightPowerInput.value = String(roomLightState.power);
roomLightPublicPowerInput.value = String(roomLightState.power);

if (savedLighting?.roomLight) {
  roomLightState.enabled = Boolean(savedLighting.roomLight.enabled);
  roomLightState.power = Number(savedLighting.roomLight.power ?? roomLightState.power);
  roomLightEnabledInput.checked = roomLightState.enabled;
  roomLightPowerInput.value = String(roomLightState.power);
  roomLightPublicPowerInput.value = String(roomLightState.power);
}

const roomLightPanelMaterial = new THREE.MeshBasicMaterial({
  color: 0x15120d,
  side: THREE.DoubleSide,
});
const roomLightFrameMaterial = new THREE.MeshStandardMaterial({
  color: 0x090a0c,
  emissive: 0x050607,
  emissiveIntensity: 0.42,
  roughness: 0.62,
  metalness: 0.35,
});
const roomLightPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.05), roomLightPanelMaterial);
roomLightPanel.position.set(0, roomHeight - 0.075, 0);
roomLightPanel.rotation.x = Math.PI / 2;
room.add(roomLightPanel);

const roomLightFrame = new THREE.Group();
const frameY = roomHeight - 0.078;
const frameParts = [
  { size: [1.18, 0.018, 0.035], position: [0, frameY, -0.59] },
  { size: [1.18, 0.018, 0.035], position: [0, frameY, 0.59] },
  { size: [0.035, 0.018, 1.18], position: [-0.59, frameY, 0] },
  { size: [0.035, 0.018, 1.18], position: [0.59, frameY, 0] },
];
frameParts.forEach(({ size, position }) => {
  const framePart = new THREE.Mesh(new THREE.BoxGeometry(...size), roomLightFrameMaterial);
  framePart.position.set(...position);
  roomLightFrame.add(framePart);
});
room.add(roomLightFrame);

const roomLight = new THREE.PointLight(0xfff4e8, 0, 11, 1.25);
roomLight.position.set(0, roomHeight - 0.28, 0);
scene.add(roomLight);

function addRoomLightPanel(centerZ) {
  const panelMaterial = roomLightPanelMaterial.clone();
  panelMaterial.color.set(0x15120d);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.05), panelMaterial);
  panel.position.set(0, roomHeight - 0.075, centerZ);
  panel.rotation.x = Math.PI / 2;
  room.add(panel);

  const frame = new THREE.Group();
  frameParts.forEach(({ size, position }) => {
    const framePart = new THREE.Mesh(new THREE.BoxGeometry(...size), roomLightFrameMaterial);
    framePart.position.set(position[0], position[1], position[2] + centerZ);
    frame.add(framePart);
  });
  room.add(frame);

  const light = new THREE.PointLight(0xfff4e8, 0, 11, 1.25);
  light.position.set(0, roomHeight - 0.28, centerZ);
  scene.add(light);

  return {
    centerZ,
    minZ: centerZ - roomDepth / 2 - corridorLength,
    maxZ: centerZ + roomDepth / 2,
    panelMaterial,
    light,
    currentPower: 0,
  };
}

const autoRoomLights = [
  {
    centerZ: 0,
    minZ: galleryMinZ,
    maxZ: roomDepth / 2,
    panelMaterial: roomLightPanelMaterial,
    light: roomLight,
    currentPower: 0,
  },
  addRoomLightPanel(roomStep),
  addRoomLightPanel(roomStep * 2),
];
const roomLightSwitches = [];
const roomLightSwitchMaterial = new THREE.MeshStandardMaterial({
  color: 0xd8d0bf,
  roughness: 0.5,
  metalness: 0.02,
});
const roomLightSwitchToggleMaterial = new THREE.MeshStandardMaterial({
  color: 0x242628,
  roughness: 0.58,
  metalness: 0.08,
});

function addRoomLightSwitch(position, rotationY = 0) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.y = rotationY;

  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.018), roomLightSwitchMaterial);
  plate.castShadow = true;
  plate.receiveShadow = true;
  const toggle = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.09, 0.022), roomLightSwitchToggleMaterial);
  toggle.position.z = 0.02;
  toggle.castShadow = true;
  group.add(plate, toggle);
  group.traverse((child) => {
    child.userData.roomLightSwitch = true;
  });

  room.add(group);
  roomLightSwitches.push(group);
}

const switchY = 1.24;
const switchX = doorRightX + 0.42;
addRoomLightSwitch(new THREE.Vector3(switchX, switchY, roomDepth / 2 - 0.035), Math.PI);
addRoomLightSwitch(new THREE.Vector3(switchX, switchY, roomStep - roomDepth / 2 + 0.035), 0);
addRoomLightSwitch(new THREE.Vector3(switchX, switchY, roomStep + roomDepth / 2 - 0.035), Math.PI);
addRoomLightSwitch(new THREE.Vector3(switchX, switchY, roomStep * 2 - roomDepth / 2 + 0.035), 0);

function setRoomLightPanelColor(material, activePower) {
  const glow = THREE.MathUtils.clamp(activePower / 80, 0, 1);
  material.color.setRGB(
    THREE.MathUtils.lerp(0.055, 1.0, glow),
    THREE.MathUtils.lerp(0.048, 0.84, glow),
    THREE.MathUtils.lerp(0.038, 0.58, glow),
  );
}

function updateRoomLight() {
  if (!roomLightState.enabled) {
    autoRoomLights.forEach((fixture) => {
      setRoomLightPanelColor(fixture.panelMaterial, fixture.currentPower);
    });
  }
}

updateRoomLight();

function syncRoomLightControls({ persist = false } = {}) {
  roomLightEnabledInput.checked = roomLightState.enabled;
  roomLightPowerInput.value = String(roomLightState.power);
  roomLightPublicPowerInput.value = String(roomLightState.power);
  updateRoomLight();
  if (persist) saveLightingState();
}

function setRoomLightPower(power, { persist = true } = {}) {
  roomLightState.power = THREE.MathUtils.clamp(Number(power), 0, 100);
  roomLightState.enabled = roomLightState.power > 0;
  syncRoomLightControls({ persist });
}

function showRoomLightControl() {
  roomLightControl.classList.add('visible');
  window.clearTimeout(showRoomLightControl.hideTimer);
  showRoomLightControl.hideTimer = window.setTimeout(() => {
    roomLightControl.classList.remove('visible');
  }, 6000);
}

function tryOpenRoomLightSwitch() {
  getCenterRaycaster();
  const switchMeshes = [];
  roomLightSwitches.forEach((switchGroup) => {
    switchGroup.traverse((child) => {
      if (child.isMesh) switchMeshes.push(child);
    });
  });
  const hit = raycaster.intersectObjects(switchMeshes, false)[0];
  if (!hit?.object?.userData?.roomLightSwitch) return false;
  showRoomLightControl();
  return true;
}

const lightRig = new THREE.Group();
scene.add(lightRig);

const trackMaterial = new THREE.MeshStandardMaterial({
  color: 0x08090b,
  emissive: 0x050607,
  emissiveIntensity: 0.35,
  roughness: 0.58,
  metalness: 0.45,
});
const fixtureMaterial = new THREE.MeshStandardMaterial({
  color: 0x161a1f,
  emissive: 0x090b0d,
  emissiveIntensity: 0.55,
  roughness: 0.46,
  metalness: 0.58,
});
const fixtureTrimMaterial = new THREE.MeshStandardMaterial({
  color: 0x090a0c,
  emissive: 0x050607,
  emissiveIntensity: 0.42,
  roughness: 0.62,
  metalness: 0.35,
});
const selectedRingMaterial = new THREE.MeshBasicMaterial({ color: 0xd8e6ff });
const selectedPaintingMaterial = new THREE.MeshBasicMaterial({
  color: 0xd8e6ff,
  transparent: true,
  opacity: 0.42,
  depthTest: false,
});
const lensMaterial = new THREE.MeshBasicMaterial({ color: 0xfff4e8 });

function createLightNumberLabel() {
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 128;
  labelCanvas.height = 128;
  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    depthTest: false,
    depthWrite: false,
    transparent: true,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.22, 0.22, 0.22);
  sprite.position.set(0.18, -0.08, 0);
  sprite.renderOrder = 10;
  sprite.userData.labelCanvas = labelCanvas;
  sprite.userData.labelTexture = texture;
  return sprite;
}

function updateLightNumberLabel(sprite, text, selected) {
  const labelCanvas = sprite.userData.labelCanvas;
  const ctx = labelCanvas.getContext('2d');
  ctx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
  ctx.fillStyle = selected ? 'rgba(255, 212, 106, 0.96)' : 'rgba(16, 17, 18, 0.84)';
  ctx.beginPath();
  ctx.arc(64, 64, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = selected ? 'rgba(20, 12, 2, 0.92)' : 'rgba(255, 224, 168, 0.88)';
  ctx.stroke();
  ctx.fillStyle = selected ? '#16100a' : '#ffe0a8';
  ctx.font = '700 58px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 67);
  sprite.userData.labelTexture.needsUpdate = true;
}

const trackHeight = roomHeight - 0.055;
const trackSpecs = {
  back: { id: 'back', axis: 'x', fixedAxis: 'z', fixed: -roomDepth / 2 + 1.05, min: -roomWidth / 2 + 0.65, max: roomWidth / 2 - 0.65 },
  front: { id: 'front', axis: 'x', fixedAxis: 'z', fixed: roomDepth / 2 - 1.05, min: -roomWidth / 2 + 0.65, max: roomWidth / 2 - 0.65 },
  left: { id: 'left', axis: 'z', fixedAxis: 'x', fixed: -roomWidth / 2 + 0.85, min: -roomDepth / 2 + 0.8, max: roomDepth / 2 - 0.8 },
  right: { id: 'right', axis: 'z', fixedAxis: 'x', fixed: roomWidth / 2 - 0.85, min: -roomDepth / 2 + 0.8, max: roomDepth / 2 - 0.8 },
};

function getTrackPosition(trackId, trackPosition, roomIndex = 0) {
  const spec = trackSpecs[trackId] ?? trackSpecs.back;
  const centerZ = galleryRooms[roomIndex]?.centerZ ?? 0;
  const t = THREE.MathUtils.clamp(trackPosition, 0, 1);
  const along = THREE.MathUtils.lerp(spec.min, spec.max, t);
  return new THREE.Vector3(
    spec.axis === 'x' ? along : spec.fixed,
    roomHeight - 0.14,
    spec.axis === 'z' ? centerZ + along : centerZ + spec.fixed,
  );
}

function getTrackPositionRatio(trackId, position, roomIndex = 0) {
  const spec = trackSpecs[trackId] ?? trackSpecs.back;
  const centerZ = galleryRooms[roomIndex]?.centerZ ?? 0;
  const along = spec.axis === 'x' ? position.x : position.z - centerZ;
  return THREE.MathUtils.clamp((along - spec.min) / (spec.max - spec.min), 0, 1);
}

function chooseTrackForTarget(targetPoint) {
  const roomIndex = getRoomIndexForZ(targetPoint.z);
  const centerZ = galleryRooms[roomIndex]?.centerZ ?? 0;
  const distances = [
    { id: 'back', distance: Math.abs(targetPoint.z - (centerZ - roomDepth / 2)) },
    { id: 'front', distance: Math.abs(targetPoint.z - (centerZ + roomDepth / 2)) },
    { id: 'left', distance: Math.abs(targetPoint.x + roomWidth / 2) },
    { id: 'right', distance: Math.abs(targetPoint.x - roomWidth / 2) },
  ];
  distances.sort((a, b) => a.distance - b.distance);
  return distances[0].id;
}

function getRoomIndexForZ(z) {
  let bestIndex = 0;
  let bestDistance = Infinity;
  galleryRooms.forEach((galleryRoom, index) => {
    const distance = Math.abs(z - galleryRoom.centerZ);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function createTrack(spec, centerZ = 0) {
  const length = spec.max - spec.min;
  const geometry = spec.axis === 'x'
    ? new THREE.BoxGeometry(length, 0.035, 0.08)
    : new THREE.BoxGeometry(0.08, 0.035, length);
  const mesh = new THREE.Mesh(geometry, trackMaterial);
  const center = (spec.min + spec.max) / 2;
  mesh.position.set(
    spec.axis === 'x' ? center : spec.fixed,
    trackHeight,
    spec.axis === 'z' ? centerZ + center : centerZ + spec.fixed,
  );
  room.add(mesh);
}

galleryRooms.forEach(({ centerZ }) => {
  Object.values(trackSpecs).forEach((spec) => createTrack(spec, centerZ));
});

const ceilingLights = [];
let selectedLightIndex = 0;
let spotShadowSetupDirty = true;
let spotShadowRoomIndex = null;

function directionFromAngles(yawDeg, pitchDeg) {
  const yaw = THREE.MathUtils.degToRad(yawDeg);
  const pitch = THREE.MathUtils.degToRad(pitchDeg);
  const cp = Math.cos(pitch);
  return new THREE.Vector3(Math.sin(yaw) * cp, Math.sin(pitch), Math.cos(yaw) * cp).normalize();
}

function anglesFromDirection(direction) {
  const normalized = direction.clone().normalize();
  return {
    yaw: THREE.MathUtils.radToDeg(Math.atan2(normalized.x, normalized.z)),
    pitch: THREE.MathUtils.radToDeg(Math.asin(normalized.y)),
  };
}

function updateCeilingLight(lightData) {
  lightData.position.copy(getTrackPosition(lightData.trackId, lightData.trackPosition, lightData.roomIndex ?? 0));
  const direction = directionFromAngles(lightData.yaw, lightData.pitch);
  lightData.target.position.copy(lightData.position).add(direction.multiplyScalar(4.2));
  lightData.spot.position.copy(lightData.position);
  lightData.spot.target = lightData.target;
  lightData.spot.intensity = lightData.power;
  lightData.spot.color.set(lightData.color ?? '#fff4e8');
  lightData.spot.angle = THREE.MathUtils.degToRad(lightData.angle ?? 30);
  lightData.fixture.position.copy(lightData.position);
  lightData.fixture.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), directionFromAngles(lightData.yaw, lightData.pitch));
  lightData.fixture.traverse((child) => {
    if (child.userData.selectionRing) {
      child.visible = lightData === ceilingLights[selectedLightIndex];
    }
  });
  spotShadowSetupDirty = true;
  renderer.shadowMap.needsUpdate = true;
}

function updateLightLabels() {
  const labelsVisible = lightPanel.classList.contains('visible');
  ceilingLights.forEach((lightData, index) => {
    const label = lightData.fixture.userData.numberLabel;
    if (!label) return;
    label.visible = labelsVisible;
    updateLightNumberLabel(label, String(index + 1), index === selectedLightIndex);
  });
}

function createFixture() {
  const fixture = new THREE.Group();

  const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 18, 10), fixtureTrimMaterial);
  pivot.position.y = 0.015;

  const yoke = new THREE.Group();
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.025, 0.04), fixtureTrimMaterial);
  bridge.position.y = -0.045;
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.12, 0.035), fixtureTrimMaterial);
  leftArm.position.set(-0.1, -0.105, 0);
  const rightArm = leftArm.clone();
  rightArm.position.x = 0.1;
  yoke.add(bridge, leftArm, rightArm);

  const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.115, 0.26, 28), fixtureMaterial);
  bodyMesh.position.y = -0.18;

  const backCap = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.035, 24), fixtureTrimMaterial);
  backCap.position.y = -0.035;

  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.012, 28), lensMaterial);
  lens.position.y = -0.315;

  const selectionRing = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.006, 8, 32), selectedRingMaterial);
  selectionRing.rotation.x = Math.PI / 2;
  selectionRing.position.y = -0.323;
  selectionRing.userData.selectionRing = true;

  const numberLabel = createLightNumberLabel();
  fixture.userData.numberLabel = numberLabel;

  fixture.add(pivot, yoke, bodyMesh, backCap, lens, selectionRing, numberLabel);
  return fixture;
}

function addCeilingLight({ position, targetPoint, trackId = 'back', trackPosition, yaw = 180, pitch = -38, power = 100, color = '#fff4e8', angle = 30, roomIndex, select = true }) {
  const resolvedRoomIndex = roomIndex ?? getRoomIndexForZ(targetPoint?.z ?? position?.z ?? 0);
  const resolvedTrackPosition = trackPosition ?? (position ? getTrackPositionRatio(trackId, position, resolvedRoomIndex) : 0.5);
  const resolvedPosition = getTrackPosition(trackId, resolvedTrackPosition, resolvedRoomIndex);
  const direction = targetPoint ? targetPoint.clone().sub(resolvedPosition) : directionFromAngles(yaw, pitch);
  const angles = targetPoint ? anglesFromDirection(direction) : { yaw, pitch };
  const spot = new THREE.SpotLight(color, power, 8.5, THREE.MathUtils.degToRad(angle), 0.68, 1.45);
  spot.castShadow = false;
  spot.shadow.mapSize.set(384, 384);
  spot.shadow.camera.near = 0.15;
  spot.shadow.camera.far = 9;
  spot.shadow.bias = -0.00008;
  const target = new THREE.Object3D();
  const fixture = createFixture();
  const lightData = {
    position: resolvedPosition,
    trackId,
    trackPosition: resolvedTrackPosition,
    yaw: THREE.MathUtils.clamp(angles.yaw, -180, 180),
    pitch: THREE.MathUtils.clamp(angles.pitch, -86, -18),
    power,
    color,
    angle,
    roomIndex: resolvedRoomIndex,
    spot,
    target,
    fixture,
  };
  fixture.traverse((child) => {
    child.userData.lightData = lightData;
  });
  lightRig.add(spot, target, fixture);
  ceilingLights.push(lightData);
  if (select) {
    selectedLightIndex = ceilingLights.length - 1;
  }
  updateCeilingLight(lightData);
  syncLightPanel();
  return lightData;
}

function updateActiveSpotShadows(currentRoomIndex) {
  if (!spotShadowSetupDirty && spotShadowRoomIndex === currentRoomIndex) return;
  spotShadowSetupDirty = false;
  spotShadowRoomIndex = currentRoomIndex;

  const roomCenter = new THREE.Vector3(
    galleryRooms[currentRoomIndex]?.centerX ?? 0,
    roomHeight * 0.55,
    galleryRooms[currentRoomIndex]?.centerZ ?? 0,
  );
  const shadowedLights = new Set(
    ceilingLights
      .filter((lightData) => lightData.spot.visible && (lightData.roomIndex ?? currentRoomIndex) === currentRoomIndex && (lightData.power ?? 0) > 0.5)
      .map((lightData, index) => ({
        lightData,
        index,
        score: lightData.position.distanceToSquared(roomCenter) - (lightData.power ?? 0) * 0.015,
      }))
      .sort((a, b) => a.score - b.score || a.index - b.index)
      .slice(0, maxShadowedSpotLights)
      .map(({ lightData }) => lightData),
  );

  ceilingLights.forEach((lightData) => {
    const shouldCastShadow = shadowedLights.has(lightData);
    if (lightData.spot.castShadow !== shouldCastShadow) {
      lightData.spot.castShadow = shouldCastShadow;
      lightData.spot.shadow.needsUpdate = true;
      renderer.shadowMap.needsUpdate = true;
    }
  });
}

function syncLightPanel() {
  if (!ceilingLights.length) {
    lightTitle.textContent = 'Žádné stropní světlo';
    removeLightButton.disabled = true;
    return;
  }

  selectedLightIndex = THREE.MathUtils.clamp(selectedLightIndex, 0, ceilingLights.length - 1);
  const current = ceilingLights[selectedLightIndex];
  lightTitle.textContent = `Stropní světlo ${selectedLightIndex + 1}/${ceilingLights.length}`;
  lightTrackPositionInput.value = String(current.trackPosition);
  lightYawInput.value = String(Math.round(current.yaw));
  lightPitchInput.value = String(Math.round(current.pitch));
  lightPowerInput.value = String(Math.round(current.power));
  lightColorInput.value = current.color ?? '#fff4e8';
  lightAngleInput.value = String(Math.round(current.angle ?? 30));
  removeLightButton.disabled = ceilingLights.length <= 1;
  ceilingLights.forEach(updateCeilingLight);
  updateLightLabels();
}

function serializeLightingState() {
  return {
    roomLight: {
      enabled: roomLightState.enabled,
      power: roomLightState.power,
    },
    selectedLightIndex,
    ceilingLights: ceilingLights.map((lightData) => ({
      trackId: lightData.trackId,
      trackPosition: Number(lightData.trackPosition.toFixed(4)),
      yaw: Number(lightData.yaw.toFixed(2)),
      pitch: Number(lightData.pitch.toFixed(2)),
      power: Number(lightData.power.toFixed(2)),
      color: lightData.color ?? '#fff4e8',
      angle: Number((lightData.angle ?? 30).toFixed(2)),
      roomIndex: lightData.roomIndex ?? 0,
    })),
  };
}

function saveLightingState() {
  try {
    localStorage.setItem(lightingStorageKey, JSON.stringify(serializeLightingState()));
  } catch {
    // Local storage can be unavailable in some embedded browser modes.
  }
}

function loadLightingState() {
  try {
    const raw = localStorage.getItem(lightingStorageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function serializeGalleryState() {
  return {
    version: 1,
    audio: {
      volume: Number(audioSettings.volume.toFixed(3)),
    },
    paintings: editablePaintings.map((paintingData) => ({
      imageSrc: paintingData.imageSrc ?? '',
      x: Number(paintingData.group.position.x.toFixed(4)),
      y: Number(paintingData.group.position.y.toFixed(4)),
      z: Number(paintingData.group.position.z.toFixed(4)),
      ry: Number(paintingData.group.rotation.y.toFixed(6)),
      w: Number(paintingData.w.toFixed(4)),
      h: Number(paintingData.h.toFixed(4)),
      aspect: Number((paintingData.aspect ?? paintingData.w / paintingData.h).toFixed(6)),
      wallNormal: paintingData.wallNormal?.toArray().map((value) => Number(value.toFixed(4))) ?? null,
      frameSize: paintingData.frameSize ?? 'medium',
      frameColor: paintingData.frameColor ?? defaultFrameColor,
      labelTitle: paintingData.labelTitle ?? '',
      labelMedium: paintingData.labelMedium ?? '',
      labelSize: paintingData.labelSize ?? '',
      labelDate: paintingData.labelDate ?? '',
      labelPrice: paintingData.labelPrice ?? '',
    })),
    pedestals: displayPedestals.map((pedestalData) => ({
      type: pedestalData.type ?? 'pillar',
      x: Number(pedestalData.group.position.x.toFixed(4)),
      z: Number(pedestalData.group.position.z.toFixed(4)),
      ry: Number(pedestalData.group.rotation.y.toFixed(6)),
      width: Number(pedestalData.width.toFixed(4)),
      depth: Number(pedestalData.depth.toFixed(4)),
      height: Number(pedestalData.height.toFixed(4)),
      content: pedestalData.content ?? null,
    })),
  };
}

function saveGalleryState() {
  try {
    const serialized = JSON.stringify(serializeGalleryState());
    localStorage.setItem(galleryStorageKey, serialized);
    return true;
  } catch {
    return false;
  }
}

function loadGalleryState() {
  try {
    const raw = localStorage.getItem(galleryStorageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.paintings)) return null;
    return parsed;
  } catch {
    return null;
  }
}

const defaultCeilingLights = [];
const hasSavedCeilingLights = Boolean(savedLighting?.ceilingLights?.length);

const startupLights = savedLighting?.ceilingLights?.length ? savedLighting.ceilingLights : defaultCeilingLights;
startupLights.forEach((lightConfig) => addCeilingLight(lightConfig));
if (Number.isInteger(savedLighting?.selectedLightIndex) && ceilingLights.length) {
  selectedLightIndex = THREE.MathUtils.clamp(savedLighting.selectedLightIndex, 0, ceilingLights.length - 1);
  syncLightPanel();
}

const defaultFrameColor = '#000000';
const frameShadowMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1, metalness: 0 });
const frameSizes = {
  hairline: { width: 0.022, depth: 0.028, backingDepth: 0.012 },
  thin: { width: 0.034, depth: 0.038, backingDepth: 0.014 },
  light: { width: 0.052, depth: 0.052, backingDepth: 0.018 },
  medium: { width: 0.078, depth: 0.072, backingDepth: 0.022 },
  heavy: { width: 0.112, depth: 0.09, backingDepth: 0.026 },
  bold: { width: 0.155, depth: 0.11, backingDepth: 0.032 },
};
const artworkLabelWidth = 0.68;
const artworkLabelHeight = 0.28;

function getFrameProfile(frameSize = 'medium') {
  return frameSizes[frameSize] ?? frameSizes.medium;
}

function createFrameMaterial(color = defaultFrameColor) {
  const frameColor = new THREE.Color(color);
  const isNearBlack = Math.max(frameColor.r, frameColor.g, frameColor.b) < 0.12;
  const displayColor = isNearBlack
    ? new THREE.Color(0x000000)
    : frameColor;
  const faceMaterial = new THREE.MeshBasicMaterial({
    color: displayColor,
    toneMapped: false,
  });
  const sideMaterial = new THREE.MeshBasicMaterial({
    color: isNearBlack ? 0x030303 : frameColor.clone().multiplyScalar(0.62),
    toneMapped: false,
  });
  return [faceMaterial, sideMaterial];
}

function createFrameGeometry(width, height, frameWidth, frameDepth) {
  const outerWidth = width + frameWidth * 2;
  const outerHeight = height + frameWidth * 2;
  const outerX = outerWidth / 2;
  const outerY = outerHeight / 2;
  const innerX = width / 2;
  const innerY = height / 2;

  const shape = new THREE.Shape();
  shape.moveTo(-outerX, -outerY);
  shape.lineTo(outerX, -outerY);
  shape.lineTo(outerX, outerY);
  shape.lineTo(-outerX, outerY);
  shape.lineTo(-outerX, -outerY);

  const hole = new THREE.Path();
  hole.moveTo(-innerX, -innerY);
  hole.lineTo(-innerX, innerY);
  hole.lineTo(innerX, innerY);
  hole.lineTo(innerX, -innerY);
  hole.lineTo(-innerX, -innerY);
  shape.holes.push(hole);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: frameDepth,
    bevelEnabled: false,
    curveSegments: 1,
  });
  geometry.translate(0, 0, -frameDepth / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function createArtworkLabel() {
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 1024;
  labelCanvas.height = 420;
  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    toneMapped: false,
    depthWrite: false,
  });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(artworkLabelWidth, artworkLabelHeight), material);
  label.renderOrder = 11;
  label.userData.labelCanvas = labelCanvas;
  label.userData.labelTexture = texture;
  return label;
}

function fitLabelText(ctx, text, maxWidth, baseSize, minSize, weight = 700) {
  let fontSize = baseSize;
  do {
    ctx.font = `${weight} ${fontSize}px Arial, Helvetica, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth || fontSize <= minSize) return fontSize;
    fontSize -= 2;
  } while (fontSize >= minSize);
  return minSize;
}

function updateArtworkLabel(paintingData) {
  if (!paintingData?.label) return;

  const { label } = paintingData;
  const labelCanvas = label.userData.labelCanvas;
  const labelTexture = label.userData.labelTexture;
  const ctx = labelCanvas.getContext('2d');
  const title = paintingData.labelTitle?.trim() || 'Bez názvu';
  const details = [
    paintingData.labelMedium?.trim(),
    paintingData.labelSize?.trim(),
    paintingData.labelDate?.trim(),
    paintingData.labelPrice?.trim(),
  ].filter(Boolean);

  ctx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
  ctx.fillStyle = '#f7f4ea';
  ctx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
  ctx.strokeStyle = 'rgba(20, 20, 18, 0.22)';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, labelCanvas.width - 10, labelCanvas.height - 10);

  ctx.fillStyle = '#111315';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  const paddingX = 58;
  const maxTextWidth = labelCanvas.width - paddingX * 2;
  const titleSize = fitLabelText(ctx, title, maxTextWidth, 54, 34, 800);
  ctx.font = `800 ${titleSize}px Arial, Helvetica, sans-serif`;
  ctx.fillText(title, paddingX, 48);

  ctx.fillStyle = '#101214';
  details.forEach((line, index) => {
    const lineSize = fitLabelText(ctx, line, maxTextWidth, 45, 31, 800);
    ctx.font = `800 ${lineSize}px Arial, Helvetica, sans-serif`;
    ctx.fillText(line, paddingX, 138 + index * 70);
  });

  labelTexture.needsUpdate = true;

  const frameWidth = getFrameProfile(paintingData.frameSize).width;
  label.position.set(
    paintingData.w / 2 + frameWidth - artworkLabelWidth / 2,
    -paintingData.h / 2 - frameWidth - artworkLabelHeight / 2 - 0.11,
    0.078,
  );
}

function isValidArtworkConfig(config) {
  if (!config) return false;
  const finiteNumbers = ['x', 'y', 'z', 'ry', 'w', 'h'].every((key) => Number.isFinite(config[key]));
  if (!finiteNumbers) return false;
  const withinGallery = config.z >= galleryMinZ - 0.2 && config.z <= galleryMaxZ + 0.2;
  const sensibleSize = config.w > 0.1 && config.w < 4 && config.h > 0.1 && config.h < 3;
  return withinGallery && sensibleSize;
}

function getArtworkConfig(index, artwork) {
  const savedConfig = savedGallery?.paintings?.[index];
  if (isValidArtworkConfig(savedConfig)) return savedConfig;
  return artwork ?? {};
}

function normalFromRotationY(ry) {
  return new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry).normalize();
}

function normalFromConfig(config, ry) {
  if (Array.isArray(config.wallNormal) && config.wallNormal.length === 3) {
    return new THREE.Vector3(config.wallNormal[0], config.wallNormal[1], config.wallNormal[2]).normalize();
  }
  return normalFromRotationY(ry);
}

function createPaintingFromConfig(config, fallbackArtwork = {}, index = 0) {
  const aspect = Number.isFinite(config.aspect) && config.aspect > 0
    ? config.aspect
    : fallbackArtwork.aspect ?? (config.w && config.h ? config.w / config.h : defaultArtworkAspect);
  const displaySize = getArtworkDisplaySize(aspect);
  const ry = Number.isFinite(config.ry) ? config.ry : fallbackArtwork.ry ?? 0;
  const imageSrc = config.imageSrc || fallbackArtwork.src || '';
  const paintingData = addPainting({
    x: THREE.MathUtils.clamp(Number.isFinite(config.x) ? config.x : fallbackArtwork.x ?? 0, -roomWidth / 2 + 0.08, roomWidth / 2 - 0.08),
    y: THREE.MathUtils.clamp(Number.isFinite(config.y) ? config.y : 1.72, 0.75, roomHeight - 0.45),
    z: THREE.MathUtils.clamp(Number.isFinite(config.z) ? config.z : fallbackArtwork.z ?? 0, galleryMinZ, galleryMaxZ),
    ry,
    w: Number.isFinite(config.w) ? config.w : displaySize.width,
    h: Number.isFinite(config.h) ? config.h : displaySize.height,
    aspect,
    material: imageSrc
      ? createMaterialFromImageUrl(imageSrc)
      : new THREE.MeshStandardMaterial({ color: 0x9fb8ac, roughness: 0.72, metalness: 0 }),
    wallNormal: normalFromConfig(config, ry),
    frameSize: config.frameSize ?? (aspect > 1.8 ? 'light' : 'medium'),
    frameColor: config.frameColor ?? defaultFrameColor,
    labelTitle: config.labelTitle ?? fallbackArtwork.title ?? `Obraz ${index + 1}`,
    labelMedium: config.labelMedium ?? '',
    labelSize: config.labelSize ?? '',
    labelDate: config.labelDate ?? '',
    labelPrice: config.labelPrice ?? '',
    imageSrc,
  });
  paintingData.title = paintingData.labelTitle;
  return paintingData;
}

const oilArtworks = [
  { title: 'Můj první obraz', src: 'art/olej-web/01-muj-prvni-obraz.jpg', aspect: 1.075, x: -3.25, z: -5.93, ry: 0 },
  { title: 'Jungle', src: 'art/olej-web/02-jungle.jpg', aspect: 1.0, x: 0, z: -5.93, ry: 0 },
  { title: 'Vietnam', src: 'art/olej-web/03-vietnam.jpg', aspect: 1.011, x: 3.25, z: -5.93, ry: 0 },
  { title: 'Teratom', src: 'art/olej-web/05-teratom.jpg', aspect: 0.753, x: -4.43, z: -2.85, ry: Math.PI / 2 },
  { title: 'Peepoalien', src: 'art/olej-web/06-peepoalien.jpg', aspect: 0.797, x: 4.43, z: -2.85, ry: -Math.PI / 2 },
  { title: 'Hlad', src: 'art/olej-web/07-hlad.jpg', aspect: 0.77, x: -4.43, z: 2.45, ry: Math.PI / 2 },
  { title: 'Redpandadragon', src: 'art/olej-web/08-redpandadragon.jpg', aspect: 1.333, x: 4.43, z: 2.45, ry: -Math.PI / 2 },
  { title: 'Cora DTIYS', src: 'art/olej-web/09-cora-dtiys.jpg', aspect: 1.025, x: -4.43, z: roomStep - 3.6, ry: Math.PI / 2 },
  { title: 'Aliens', src: 'art/olej-web/10-aliens.jpg', aspect: 1.013, x: 4.43, z: roomStep - 3.6, ry: -Math.PI / 2 },
  { title: 'CaTool', src: 'art/olej-web/11-catool.jpg', aspect: 0.788, x: -4.43, z: roomStep, ry: Math.PI / 2 },
  { title: 'Jungle pro Lucku', src: 'art/olej-web/12-jungle-pro-lucku.jpg', aspect: 1.003, x: 4.43, z: roomStep, ry: -Math.PI / 2 },
  { title: 'Jungle s roklí', src: 'art/olej-web/13-jungle-s-rokli.jpg', aspect: 1.0, x: -4.43, z: roomStep + 3.6, ry: Math.PI / 2 },
  { title: 'Zrození Pumíka', src: 'art/olej-web/14-zrozeni-pumika.jpg', aspect: 0.744, x: 4.43, z: roomStep + 3.6, ry: -Math.PI / 2 },
  { title: 'Hell', src: 'art/olej-web/15-hell.jpg', aspect: 1.0, x: -3.15, z: roomStep + 5.93, ry: Math.PI },
  { title: 'Voidish Rammus', src: 'art/olej-web/16-voidish-rammus.jpg', aspect: 1.0, x: 3.15, z: roomStep + 5.93, ry: Math.PI },
  { title: 'Wide 2022', src: 'art/olej-web/17-wide-20220222.jpg', aspect: 2.222, x: -3.15, z: roomStep * 2 - 5.93, ry: 0 },
  { title: 'Portrét 2025', src: 'art/olej-web/18-portrait-20251130.jpg', aspect: 0.756, x: 3.15, z: roomStep * 2 - 5.93, ry: 0 },
  { title: 'Temný les', src: 'art/olej-web/04-temny-les.jpg', aspect: 2.057, x: -3.05, z: roomStep * 2 + 5.93, ry: Math.PI },
  { title: 'Landscape 2026', src: 'art/olej-web/19-landscape-20260130.jpg', aspect: 1.333, x: 0, z: roomStep * 2 + 5.93, ry: Math.PI },
  { title: 'Portrét 2026', src: 'art/olej-web/20-portrait-20260130.jpg', aspect: 0.768, x: 3.05, z: roomStep * 2 + 5.93, ry: Math.PI },
  { title: 'Kočka', src: 'art/olej-web/21-kocka.jpg', aspect: 0.8, x: -4.43, z: roomStep * 2, ry: Math.PI / 2 },
  { title: 'Nemesis', src: 'art/olej-web/22-nemesis.jpg', aspect: 0.75, x: 4.43, z: roomStep * 2, ry: -Math.PI / 2 },
];
const editablePaintings = [];
const displayPedestals = [];
let selectedPainting = null;
let selectedPedestal = null;
let pendingArtMaterial = null;
let pendingArtSource = '';
let pendingArtAspect = defaultArtworkAspect;
let hoveredEditable = null;
let movingSelectedPainting = false;
let movingSelectedPedestal = false;
let moveOriginalTransform = null;
let swapSourcePainting = null;

const artPreviewMaterial = new THREE.MeshBasicMaterial({
  color: 0x55ff8a,
  opacity: 0.34,
  transparent: true,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const artPreview = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), artPreviewMaterial);
artPreview.visible = false;
artPreview.renderOrder = 9;
scene.add(artPreview);

function addPainting({
  x,
  y = 1.75,
  z,
  ry,
  w = 1.35,
  h = 1.0,
  aspect = w / h,
  material,
  editable = true,
  wallNormal = null,
  frameSize = 'medium',
  frameColor = defaultFrameColor,
  labelTitle = '',
  labelMedium = '',
  labelSize = '',
  labelDate = '',
  labelPrice = '',
  imageSrc = '',
}) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = ry;

  const frameProfile = getFrameProfile(frameSize);
  const frameWidth = frameProfile.width;
  const frameDepth = frameProfile.depth;
  const backingDepth = frameProfile.backingDepth;
  const paintingFrameMaterial = createFrameMaterial(frameColor);
  const frameCenterZ = 0.02;
  const artInset = Math.min(0.014, frameDepth * 0.32);
  const selectionThickness = 0.012;
  const selectionDepth = 0.012;
  const frame = new THREE.Mesh(createFrameGeometry(w, h, frameWidth, frameDepth), paintingFrameMaterial);
  frame.position.z = frameCenterZ;

  const backing = new THREE.Mesh(new THREE.BoxGeometry(w + 0.03, h + 0.03, backingDepth), frameShadowMaterial);
  backing.position.z = frameCenterZ - frameDepth / 2 - backingDepth / 2 + 0.002;
  frame.castShadow = true;
  frame.receiveShadow = false;
  backing.castShadow = true;
  backing.receiveShadow = true;
  group.add(backing, frame);

  const art = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  art.position.z = frameCenterZ + frameDepth / 2 - artInset;
  group.add(art);

  const selectionOutline = new THREE.Group();
  const selectionWidth = w + frameWidth * 2 + selectionThickness * 2;
  const selectionHeight = h + frameWidth * 2 + selectionThickness * 2;
  const selectionTop = new THREE.Mesh(new THREE.BoxGeometry(selectionWidth, selectionThickness, selectionDepth), selectedPaintingMaterial);
  selectionTop.position.set(0, selectionHeight / 2, 0.074);
  const selectionBottom = selectionTop.clone();
  selectionBottom.position.y = -selectionHeight / 2;
  const selectionLeft = new THREE.Mesh(new THREE.BoxGeometry(selectionThickness, selectionHeight, selectionDepth), selectedPaintingMaterial);
  selectionLeft.position.set(-selectionWidth / 2, 0, 0.074);
  const selectionRight = selectionLeft.clone();
  selectionRight.position.x = selectionWidth / 2;
  selectionOutline.add(selectionTop, selectionBottom, selectionLeft, selectionRight);
  selectionOutline.visible = false;
  selectionOutline.renderOrder = 12;
  group.add(selectionOutline);

  const label = createArtworkLabel();
  group.add(label);

  room.add(group);
  const paintingData = {
    group,
    art,
    label,
    selectionOutline,
    w,
    h,
    aspect: Number.isFinite(aspect) && aspect > 0 ? aspect : w / h,
    material,
    wallNormal,
    frameSize,
    frameColor,
    labelTitle,
    labelMedium,
    labelSize,
    labelDate,
    labelPrice,
    imageSrc,
  };
  updateArtworkLabel(paintingData);
  group.userData.paintingData = paintingData;
  group.traverse((child) => {
    child.userData.paintingData = paintingData;
  });
  if (editable) editablePaintings.push(paintingData);
  return paintingData;
}

function getArtworkDisplaySize(aspect) {
  let height = aspect > 1.65 ? 0.96 : aspect < 0.85 ? 1.42 : 1.22;
  let width = height * aspect;
  const maxWidth = 2.45;
  const maxHeight = 1.58;
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspect;
  }
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspect;
  }
  return { width, height };
}

function attachSavedLightsToPaintings() {
  const unusedLights = new Set(ceilingLights);
  editablePaintings.forEach((paintingData) => {
    let bestLight = null;
    let bestDistance = Infinity;
    const expectedPlacement = getSpotPlacementForPainting(paintingData);
    unusedLights.forEach((lightData) => {
      const lightRoomIndex = lightData.roomIndex ?? getRoomIndexForZ(lightData.position.z);
      if (lightRoomIndex !== expectedPlacement.roomIndex) return;
      const distance = lightData.position.distanceToSquared(expectedPlacement.position);
      if (distance < bestDistance) {
        bestLight = lightData;
        bestDistance = distance;
      }
    });
    if (bestLight && bestDistance < 2.8) {
      paintingData.artSpot = bestLight;
      unusedLights.delete(bestLight);
      moveSpotToPainting(paintingData, bestLight);
    }
  });
}

function ensurePaintingLights() {
  editablePaintings.forEach((paintingData) => {
    paintingData.artSpot = addSpotForPainting(paintingData, { select: false, openPanel: false, persist: false, sync: false });
  });
  removeOrphanPaintingLights({ persist: false, sync: false });
  syncLightPanel();
}

function addCuratedOilGallery() {
  const savedPaintings = Array.isArray(savedGallery?.paintings) ? savedGallery.paintings : [];
  const totalPaintings = Math.max(oilArtworks.length, savedPaintings.length);

  for (let index = 0; index < totalPaintings; index += 1) {
    const artwork = oilArtworks[index];
    const config = getArtworkConfig(index, artwork);
    const paintingData = createPaintingFromConfig(config, artwork, index);
    if (!hasSavedCeilingLights) {
      paintingData.artSpot = addSpotForPainting(paintingData, { select: false, openPanel: false, persist: false });
    }
  }

  if (hasSavedCeilingLights) {
    attachSavedLightsToPaintings();
    ensurePaintingLights();
  } else {
    selectedLightIndex = 0;
    syncLightPanel();
  }
}

addCuratedOilGallery();

function isValidPedestalConfig(config) {
  return config
    && Number.isFinite(config.x)
    && Number.isFinite(config.z)
    && Number.isFinite(config.width)
    && Number.isFinite(config.depth)
    && Number.isFinite(config.height)
    && config.width > 0.2
    && config.depth > 0.2
    && config.height > 0.25
    && (!config.type || ['pillar', 'table'].includes(config.type));
}

function addSavedDisplayPedestals() {
  const defaultPedestals = [
    {
      type: 'table',
      x: 2.32,
      z: roomDepth / 2 - 0.42,
      ry: 0,
      width: 1.68,
      depth: 0.5,
      height: 0.78,
      content: null,
    },
    {
      type: 'pillar',
      x: -2.35,
      z: roomDepth / 2 - 0.95,
      ry: 0,
      width: 0.72,
      depth: 0.72,
      height: 1.12,
      content: null,
    },
  ];
  const savedPedestals = Array.isArray(savedGallery?.pedestals) ? savedGallery.pedestals : defaultPedestals;
  savedPedestals.filter(isValidPedestalConfig).forEach((config) => {
    createDisplayPedestal({
      x: THREE.MathUtils.clamp(config.x, x0 + 0.35, x1 - 0.35),
      z: THREE.MathUtils.clamp(config.z, galleryMinZ + 0.35, galleryMaxZ - 0.35),
      ry: Number.isFinite(config.ry) ? config.ry : 0,
      width: config.width,
      depth: config.depth,
      height: config.height,
      type: config.type ?? 'pillar',
      content: config.content ?? null,
    });
  });
}

addSavedDisplayPedestals();

function getCenterRaycaster() {
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  return raycaster;
}

const galleryFloorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const floorHitPoint = new THREE.Vector3();

function getFloorPlacement() {
  getCenterRaycaster();
  const hit = raycaster.ray.intersectPlane(galleryFloorPlane, floorHitPoint);
  if (!hit) return null;
  const position = hit.clone();
  const previous = body.position.clone();
  constrainToGallery(position, 0.42, previous);
  return position;
}

function getWallPlacement() {
  getCenterRaycaster();
  const hit = raycaster.intersectObjects(wallMeshes, false)[0];
  if (!hit) return null;

  const cameraPosition = new THREE.Vector3();
  camera.getWorldPosition(cameraPosition);
  const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
  if (normal.dot(cameraPosition.clone().sub(hit.point)) < 0) {
    normal.negate();
  }
  const axis = Math.abs(normal.x) > Math.abs(normal.z) ? 'z' : 'x';
  const { width, height, aspect } = getArtworkSizeFromInputs();
  const roomLayout = galleryRooms.find(({ centerX, centerZ }) => (
    hit.point.x >= centerX - roomWidth / 2 - 0.08
    && hit.point.x <= centerX + roomWidth / 2 + 0.08
    && hit.point.z >= centerZ - roomDepth / 2 - 0.08
    && hit.point.z <= centerZ + roomDepth / 2 + 0.08
  ));
  if (!roomLayout) return null;

  const onBackWall = Math.abs(hit.point.z - (roomLayout.centerZ - roomDepth / 2)) < 0.12;
  const onFrontWall = Math.abs(hit.point.z - (roomLayout.centerZ + roomDepth / 2)) < 0.12;
  const doorClearance = doorway.width / 2 + width / 2 + 0.28;
  if (((onBackWall && roomLayout.hasBackDoor) || (onFrontWall && roomLayout.hasFrontDoor)) && Math.abs(hit.point.x) < doorClearance) {
    return null;
  }

  const centerY = artFreeModeInput.checked
    ? THREE.MathUtils.clamp(hit.point.y, 0.75 + height / 2, roomHeight - 0.45 - height / 2)
    : Number(artHeightInput.value);
  const offset = artFreeModeInput.checked ? 0 : Number(artOffsetXInput.value);
  const point = hit.point.clone();

  if (axis === 'x') {
    point.x += offset;
  } else {
    point.z += offset;
  }
  point.y = THREE.MathUtils.clamp(centerY, 0.75 + height / 2, roomHeight - 0.45 - height / 2);
  point.addScaledVector(normal, 0.065);

  let ry = 0;
  if (Math.abs(normal.x) > Math.abs(normal.z)) {
    ry = normal.x > 0 ? Math.PI / 2 : -Math.PI / 2;
  } else {
    ry = normal.z > 0 ? 0 : Math.PI;
  }

  return { point, normal, ry, width, height, axis, aspect };
}

function syncArtPreview() {
  if (!artPanel.classList.contains('visible') || (selectedPainting && !movingSelectedPainting && !pendingArtMaterial)) {
    artPreview.visible = false;
    return;
  }

  const placement = getWallPlacement();
  if (!placement) {
    artPreview.visible = false;
    return;
  }

  if (movingSelectedPainting && selectedPainting) {
    artPreview.visible = false;
    selectedPainting.group.position.copy(placement.point);
    selectedPainting.group.rotation.y = placement.ry;
    return;
  }

  artPreview.visible = true;
  artPreview.position.copy(placement.point);
  artPreview.rotation.set(0, placement.ry, 0);
  artPreview.scale.set(placement.width, placement.height, 1);
}

function syncArtPanel() {
  syncPaintingSelection();
  artTitle.textContent = selectedPainting ? 'Vybraný obraz' : 'Nový obraz';
  artStatus.textContent = pendingArtMaterial
      ? 'Obrázek je načtený. Namiř tečku na stěnu a klikni Přidat.'
      : selectedPainting
        ? movingSelectedPainting
        ? 'Teď přesouváš přímo vybraný obraz. Levým klikem do stěny ho uchytíš.'
        : 'Obraz je vybraný. Můžeš ho smazat, změnit velikost, nebo zapnout přesun.'
      : 'Namiř tečku na stěnu a vlož nový obraz.';
  addArtButton.textContent = movingSelectedPainting ? 'Uchytit sem' : pendingArtMaterial ? 'Vložit načtený' : 'Přidat na náhled';
  moveArtButton.textContent = movingSelectedPainting ? 'Zrušit přesun' : 'Přesunout vybraný';
  swapArtButton.textContent = swapSourcePainting ? 'Klikni na druhý obraz' : 'Prohodit vybraný';
  moveArtButton.disabled = !selectedPainting;
  removeArtButton.disabled = !selectedPainting;
  swapArtButton.disabled = !selectedPainting;
  if (!selectedPainting) return;
  setArtworkSizeInputs(selectedPainting.w, selectedPainting.h, false);
  artHeightInput.value = String(selectedPainting.group.position.y);
  artFrameSizeInput.value = selectedPainting.frameSize ?? 'medium';
  artFrameColorInput.value = selectedPainting.frameColor ?? defaultFrameColor;
  artLabelTitleInput.value = selectedPainting.labelTitle ?? '';
  artLabelMediumInput.value = selectedPainting.labelMedium ?? '';
  artLabelSizeInput.value = selectedPainting.labelSize ?? '';
  artLabelDateInput.value = selectedPainting.labelDate ?? '';
  artLabelPriceInput.value = selectedPainting.labelPrice ?? '';
}

function createMaterialFromImageUrl(url) {
  const texture = new THREE.TextureLoader().load(publicAssetPath(url));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
  material.color.setScalar(1);
  material.toneMapped = false;
  return material;
}

function parseArtworkSize(input, pixelAspect) {
  if (!input) return null;
  const aspect = Number.isFinite(pixelAspect) && pixelAspect > 0 ? pixelAspect : defaultArtworkAspect;
  const values = input
    .replace(',', '.')
    .split(/[x×*\s;]+/i)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!values.length) return null;
  const widthCm = values[0];
  const heightCm = widthCm / aspect;
  return {
    widthMeters: widthCm / centimetersPerMeter,
    heightMeters: heightCm / centimetersPerMeter,
  };
}

function formatCm(value) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function fitNumberInputToValue(input, value) {
  const max = Number(input.max);
  if (Number.isFinite(max) && value > max) {
    input.max = String(Math.ceil(value));
  }
  const min = Number(input.min);
  if (Number.isFinite(min) && value < min) {
    input.min = String(Math.floor(value));
  }
  input.value = formatCm(value);
}

function readCmInput(input, fallback) {
  const value = Number(input.value);
  const resolved = Number.isFinite(value) && value > 0 ? value : fallback;
  const max = Number(input.max);
  if (Number.isFinite(max) && resolved > max) {
    input.max = String(Math.ceil(resolved));
  }
  const min = Number(input.min);
  if (Number.isFinite(min) && resolved < min) {
    return min;
  }
  return resolved;
}

function getCurrentArtworkAspect() {
  if (pendingArtMaterial && Number.isFinite(pendingArtAspect) && pendingArtAspect > 0) {
    return pendingArtAspect;
  }
  const directAspect = selectedPainting?.aspect ?? pendingArtAspect;
  if (Number.isFinite(directAspect) && directAspect > 0) return directAspect;
  const widthCm = Number(artWidthCmInput.value);
  const heightCm = Number(artHeightCmInput.value);
  if (Number.isFinite(widthCm) && Number.isFinite(heightCm) && widthCm > 0 && heightCm > 0) {
    return widthCm / heightCm;
  }
  return defaultArtworkAspect;
}

function getLabelSizeCm(sceneSizeCm) {
  return Math.max(1, sceneSizeCm - 30);
}

function updateArtworkSizeLabel(widthCm, heightCm) {
  const labelWidthCm = getLabelSizeCm(widthCm);
  const labelHeightCm = getLabelSizeCm(heightCm);
  artLabelSizeInput.value = `${formatCm(labelWidthCm)} x ${formatCm(labelHeightCm)} cm`;
  updateSelectedPaintingLabel();
}

function setArtworkSizeInputs(widthMeters, heightMeters, syncLabel = true) {
  const widthCm = widthMeters * centimetersPerMeter;
  const heightCm = heightMeters * centimetersPerMeter;
  fitNumberInputToValue(artWidthCmInput, widthCm);
  fitNumberInputToValue(artHeightCmInput, heightCm);
  if (syncLabel) updateArtworkSizeLabel(widthCm, heightCm);
}

function getArtworkSizeFromInputs() {
  const aspect = getCurrentArtworkAspect();
  const widthCm = readCmInput(artWidthCmInput, defaultArtworkWidthCm);
  const heightCm = widthCm / aspect;
  fitNumberInputToValue(artHeightCmInput, heightCm);
  return {
    width: widthCm / centimetersPerMeter,
    height: heightCm / centimetersPerMeter,
    aspect,
  };
}

function syncArtworkHeightFromWidth() {
  const aspect = getCurrentArtworkAspect();
  const widthCm = readCmInput(artWidthCmInput, defaultArtworkWidthCm);
  const heightCm = widthCm / aspect;
  fitNumberInputToValue(artHeightCmInput, heightCm);
  updateArtworkSizeLabel(widthCm, heightCm);
}

function syncArtworkWidthFromHeight() {
  const aspect = getCurrentArtworkAspect();
  const fallbackHeight = defaultArtworkWidthCm / aspect;
  const heightCm = readCmInput(artHeightCmInput, fallbackHeight);
  const widthCm = heightCm * aspect;
  fitNumberInputToValue(artWidthCmInput, widthCm);
  updateArtworkSizeLabel(widthCm, heightCm);
}

function applyArtworkRealSize(widthMeters, heightMeters) {
  setArtworkSizeInputs(widthMeters, heightMeters);
  syncArtPreview();
}

function syncPaintingSelection() {
  editablePaintings.forEach((paintingData) => {
    if (!paintingData.selectionOutline) return;
    paintingData.selectionOutline.visible = paintingData === selectedPainting;
  });
}

function getSpotPlacementForPainting(paintingData) {
  const targetPoint = paintingData.group.position.clone();
  const normal = paintingData.wallNormal ?? new THREE.Vector3(0, 0, 1).applyQuaternion(paintingData.group.quaternion);
  const roomIndex = getRoomIndexForZ(targetPoint.z);
  const trackId = chooseTrackForTarget(targetPoint);
  const trackSpec = trackSpecs[trackId] ?? trackSpecs.back;
  const position = targetPoint.clone().addScaledVector(normal, 1.35);
  position.y = roomHeight - 0.14;
  if (trackSpec.axis === 'x') {
    position.z = (galleryRooms[roomIndex]?.centerZ ?? 0) + trackSpec.fixed;
    position.x = THREE.MathUtils.clamp(position.x, trackSpec.min, trackSpec.max);
  } else {
    position.x = trackSpec.fixed;
    const centerZ = galleryRooms[roomIndex]?.centerZ ?? 0;
    position.z = centerZ + THREE.MathUtils.clamp(position.z - centerZ, trackSpec.min, trackSpec.max);
  }
  const trackPosition = getTrackPositionRatio(trackId, position, roomIndex);
  return { targetPoint, position, trackId, trackPosition, roomIndex };
}

function moveSpotToPainting(paintingData, lightData) {
  const placement = getSpotPlacementForPainting(paintingData);
  const resolvedPosition = getTrackPosition(placement.trackId, placement.trackPosition, placement.roomIndex);
  const direction = placement.targetPoint.clone().sub(resolvedPosition);
  const angles = anglesFromDirection(direction);
  lightData.position.copy(resolvedPosition);
  lightData.trackId = placement.trackId;
  lightData.trackPosition = placement.trackPosition;
  lightData.roomIndex = placement.roomIndex;
  lightData.yaw = THREE.MathUtils.clamp(angles.yaw, -180, 180);
  lightData.pitch = THREE.MathUtils.clamp(angles.pitch, -86, -18);
  if (!Number.isFinite(lightData.power)) lightData.power = 105;
  updateCeilingLight(lightData);
  return lightData;
}

function addSpotForPainting(paintingData, { select = true, openPanel = true, persist = true, sync = true } = {}) {
  if (paintingData.artSpot && ceilingLights.includes(paintingData.artSpot)) {
    moveSpotToPainting(paintingData, paintingData.artSpot);
    if (select) {
      selectedLightIndex = ceilingLights.indexOf(paintingData.artSpot);
    }
    if (openPanel) {
      lightPanel.classList.add('visible');
    }
    if (sync) {
      syncLightPanel();
    }
    if (persist) {
      saveLightingState();
    }
    return paintingData.artSpot;
  }

  const placement = getSpotPlacementForPainting(paintingData);
  const lightData = addCeilingLight({
    position: placement.position,
    targetPoint: placement.targetPoint,
    trackId: placement.trackId,
    trackPosition: placement.trackPosition,
    power: 105,
    roomIndex: placement.roomIndex,
    select,
  });
  paintingData.artSpot = lightData;
  if (openPanel) {
    lightPanel.classList.add('visible');
  }
  if (sync) {
    syncLightPanel();
  }
  if (persist) {
    saveLightingState();
  }
  return lightData;
}

function removeCeilingLight(lightData, { persist = true, sync = true } = {}) {
  if (!lightData) return false;
  const index = ceilingLights.indexOf(lightData);
  if (index >= 0) {
    ceilingLights.splice(index, 1);
    selectedLightIndex = Math.min(selectedLightIndex, Math.max(ceilingLights.length - 1, 0));
  }
  editablePaintings.forEach((paintingData) => {
    if (paintingData.artSpot === lightData) {
      paintingData.artSpot = null;
    }
  });
  lightRig.remove(lightData.spot, lightData.target, lightData.fixture);
  spotShadowSetupDirty = true;
  renderer.shadowMap.needsUpdate = true;
  if (sync) {
    syncLightPanel();
  }
  if (persist) {
    saveLightingState();
  }
  return index >= 0;
}

function removeArtworkLight(paintingData) {
  if (!paintingData?.artSpot) return;
  const lightData = paintingData.artSpot;
  paintingData.artSpot = null;
  removeCeilingLight(lightData);
}

function removeOrphanPaintingLights({ persist = true, sync = true } = {}) {
  const assignedLights = new Set();

  editablePaintings.forEach((paintingData) => {
    if (!paintingData.artSpot || !ceilingLights.includes(paintingData.artSpot)) {
      paintingData.artSpot = null;
      return;
    }
    if (assignedLights.has(paintingData.artSpot)) {
      paintingData.artSpot = null;
      return;
    }
    assignedLights.add(paintingData.artSpot);
  });

  ceilingLights
    .filter((lightData) => !assignedLights.has(lightData))
    .forEach((lightData) => removeCeilingLight(lightData, { persist: false, sync: false }));

  if (sync) {
    syncLightPanel();
  }
  if (persist) {
    saveLightingState();
  }
}

function addArtworkFromPreview() {
  const placement = getWallPlacement();
  if (!placement) {
    artPanel.classList.add('visible');
    artTitle.textContent = 'Není vybraná stěna';
    artStatus.textContent = pendingArtMaterial
      ? 'Obrázek zůstal připravený. Namiř tečku přímo na stěnu a zkus Přidat znovu.'
      : 'Nejdřív namiř tečku na stěnu, kde má obraz viset.';
    return false;
  }
  const material = pendingArtMaterial ?? new THREE.MeshStandardMaterial({ color: 0x9fb8ac, roughness: 0.72, metalness: 0 });
  const paintingData = addPainting({
    x: placement.point.x,
    y: placement.point.y,
    z: placement.point.z,
    ry: placement.ry,
    w: placement.width,
    h: placement.height,
    aspect: placement.aspect,
    material,
    wallNormal: placement.normal.clone(),
    frameSize: artFrameSizeInput.value,
    frameColor: artFrameColorInput.value,
    labelTitle: artLabelTitleInput.value.trim(),
    labelMedium: artLabelMediumInput.value.trim(),
    labelSize: artLabelSizeInput.value.trim(),
    labelDate: artLabelDateInput.value.trim(),
    labelPrice: artLabelPriceInput.value.trim(),
    imageSrc: pendingArtSource,
  });
  selectedPainting = paintingData;
  pendingArtMaterial = null;
  pendingArtSource = '';
  pendingArtAspect = defaultArtworkAspect;
  paintingData.artSpot = addSpotForPainting(paintingData);
  movingSelectedPainting = false;
  syncArtPanel();
  artTitle.textContent = 'Obraz přidaný';
  artStatus.textContent = 'Nový obraz je na stěně a má vlastní světlo.';
  return true;
}

function moveSelectedPaintingToPreview() {
  if (!selectedPainting) return false;
  const placement = getWallPlacement();
  if (!placement) {
    artTitle.textContent = 'Není vybraná stěna';
    artStatus.textContent = 'Pro přesun namiř zelený náhled na vnitřní stěnu mimo průchod.';
    return false;
  }

  selectedPainting.group.position.copy(placement.point);
  selectedPainting.group.rotation.y = placement.ry;
  selectedPainting.wallNormal = placement.normal.clone();
  selectedPainting.artSpot = addSpotForPainting(selectedPainting);
  movingSelectedPainting = false;
  moveOriginalTransform = null;
  syncArtPanel();
  syncArtPreview();
  artTitle.textContent = 'Obraz uchycený';
  artStatus.textContent = 'Obraz je přesunutý na nové místo.';
  return true;
}

function beginMoveSelectedPainting() {
  if (!selectedPainting) return;
  moveOriginalTransform = {
    position: selectedPainting.group.position.clone(),
    rotationY: selectedPainting.group.rotation.y,
    wallNormal: selectedPainting.wallNormal?.clone() ?? null,
  };
  movingSelectedPainting = true;
  syncArtPanel();
  syncArtPreview();
}

function cancelMoveSelectedPainting() {
  if (!selectedPainting || !moveOriginalTransform) {
    movingSelectedPainting = false;
    moveOriginalTransform = null;
    syncArtPanel();
    syncArtPreview();
    return;
  }
  selectedPainting.group.position.copy(moveOriginalTransform.position);
  selectedPainting.group.rotation.y = moveOriginalTransform.rotationY;
  selectedPainting.wallNormal = moveOriginalTransform.wallNormal;
  movingSelectedPainting = false;
  moveOriginalTransform = null;
  syncArtPanel();
  syncArtPreview();
}

function removeSelectedPainting() {
  if (!selectedPainting) return;
  removeArtworkLight(selectedPainting);
  room.remove(selectedPainting.group);
  const index = editablePaintings.indexOf(selectedPainting);
  if (index >= 0) editablePaintings.splice(index, 1);
  selectedPainting = null;
  movingSelectedPainting = false;
  moveOriginalTransform = null;
  syncArtPanel();
  syncArtPreview();
}

function updateSelectedPaintingSize() {
  if (!selectedPainting) return;
  const { width, height, aspect } = getArtworkSizeFromInputs();
  const position = selectedPainting.group.position.clone();
  const ry = selectedPainting.group.rotation.y;
  const material = selectedPainting.material;
  const wallNormal = selectedPainting.wallNormal;
  const artSpot = selectedPainting.artSpot;
  const frameSize = artFrameSizeInput.value;
  const frameColor = artFrameColorInput.value;
  const labelTitle = selectedPainting.labelTitle ?? '';
  const labelMedium = selectedPainting.labelMedium ?? '';
  const labelSize = selectedPainting.labelSize ?? '';
  const labelDate = selectedPainting.labelDate ?? '';
  const labelPrice = selectedPainting.labelPrice ?? '';
  const imageSrc = selectedPainting.imageSrc ?? '';
  room.remove(selectedPainting.group);
  const index = editablePaintings.indexOf(selectedPainting);
  if (index >= 0) editablePaintings.splice(index, 1);
  selectedPainting = addPainting({
    x: position.x,
    y: Number(artHeightInput.value),
    z: position.z,
    ry,
    w: width,
    h: height,
    aspect,
    material,
    wallNormal,
    frameSize,
    frameColor,
    labelTitle,
    labelMedium,
    labelSize,
    labelDate,
    labelPrice,
    imageSrc,
  });
  selectedPainting.artSpot = artSpot;
  selectedPainting.artSpot = addSpotForPainting(selectedPainting, { select: false, openPanel: false, persist: false, sync: false });
  syncArtPanel();
}

function updateSelectedPaintingLabel() {
  if (!selectedPainting) return;
  selectedPainting.labelTitle = artLabelTitleInput.value.trim();
  selectedPainting.labelMedium = artLabelMediumInput.value.trim();
  selectedPainting.labelSize = artLabelSizeInput.value.trim();
  selectedPainting.labelDate = artLabelDateInput.value.trim();
  selectedPainting.labelPrice = artLabelPriceInput.value.trim();
  updateArtworkLabel(selectedPainting);
}

function relightPainting(paintingData) {
  paintingData.artSpot = addSpotForPainting(paintingData, { select: false, openPanel: false, persist: false });
}

function swapPaintingTransforms(firstPainting, secondPainting) {
  if (!firstPainting || !secondPainting || firstPainting === secondPainting) return false;

  const firstPosition = firstPainting.group.position.clone();
  const firstRotationY = firstPainting.group.rotation.y;
  const firstNormal = firstPainting.wallNormal?.clone() ?? null;

  firstPainting.group.position.copy(secondPainting.group.position);
  firstPainting.group.rotation.y = secondPainting.group.rotation.y;
  firstPainting.wallNormal = secondPainting.wallNormal?.clone() ?? null;

  secondPainting.group.position.copy(firstPosition);
  secondPainting.group.rotation.y = firstRotationY;
  secondPainting.wallNormal = firstNormal;

  relightPainting(firstPainting);
  relightPainting(secondPainting);
  saveLightingState();
  return true;
}

function getPedestalSizeFromInputs() {
  return {
    type: pedestalTypeInput.value === 'table' ? 'table' : 'pillar',
    width: THREE.MathUtils.clamp(Number(pedestalWidthCmInput.value) / centimetersPerMeter, 0.25, 2.2),
    depth: THREE.MathUtils.clamp(Number(pedestalDepthCmInput.value) / centimetersPerMeter, 0.25, 2.2),
    height: THREE.MathUtils.clamp(Number(pedestalHeightCmInput.value) / centimetersPerMeter, 0.35, 1.8),
  };
}

function syncPedestalPanel() {
  pedestalTitle.textContent = selectedPedestal ? 'Vybraný podstavec' : 'Nový podstavec';
  pedestalStatus.textContent = movingSelectedPedestal
    ? 'Namiř tečku na podlahu a klikni Přidat na podlahu.'
      : selectedPedestal
        ? 'Objekt je vybraný. Můžeš ho přesunout, kolečkem otočit, změnit typ a rozměr, nebo smazat.'
        : 'Namiř tečku na podlahu a přidej nový podstavec.';
  movePedestalButton.disabled = !selectedPedestal;
  removePedestalButton.disabled = !selectedPedestal;
  movePedestalButton.textContent = movingSelectedPedestal ? 'Zrušit přesun' : 'Přesunout vybraný';
  addPedestalButton.textContent = movingSelectedPedestal ? 'Uchytit na podlahu' : 'Přidat na podlahu';
  if (!selectedPedestal) return;
  pedestalTypeInput.value = selectedPedestal.type ?? 'pillar';
  pedestalWidthCmInput.value = String(Math.round(selectedPedestal.width * centimetersPerMeter));
  pedestalDepthCmInput.value = String(Math.round(selectedPedestal.depth * centimetersPerMeter));
  pedestalHeightCmInput.value = String(Math.round(selectedPedestal.height * centimetersPerMeter));
}

function updatePedestalSelection() {
  displayPedestals.forEach((pedestalData) => {
    pedestalData.selection.visible = pedestalData === selectedPedestal;
  });
}

function addPedestalFromFloor() {
  const placement = getFloorPlacement();
  if (!placement) {
    pedestalPanel.classList.add('visible');
    pedestalTitle.textContent = 'Není vybraná podlaha';
    pedestalStatus.textContent = 'Namiř tečku níž na podlahu a zkus to znovu.';
    return false;
  }
  const size = getPedestalSizeFromInputs();
  selectedPedestal = createDisplayPedestal({
    x: placement.x,
    z: placement.z,
    ry: bodyYaw,
    ...size,
  });
  movingSelectedPedestal = false;
  updatePedestalSelection();
  syncPedestalPanel();
  return true;
}

function moveSelectedPedestalToFloor() {
  if (!selectedPedestal) return false;
  const placement = getFloorPlacement();
  if (!placement) {
    pedestalTitle.textContent = 'Není vybraná podlaha';
    pedestalStatus.textContent = 'Namiř tečku níž na podlahu a zkus přesun znovu.';
    return false;
  }
  selectedPedestal.group.position.x = placement.x;
  selectedPedestal.group.position.z = placement.z;
  movingSelectedPedestal = false;
  syncPedestalPanel();
  return true;
}

function removeSelectedPedestal() {
  if (!selectedPedestal) return;
  room.remove(selectedPedestal.group);
  const index = displayPedestals.indexOf(selectedPedestal);
  if (index >= 0) displayPedestals.splice(index, 1);
  selectedPedestal = null;
  movingSelectedPedestal = false;
  syncPedestalPanel();
}

function updateSelectedPedestalSize() {
  if (!selectedPedestal) return;
  const size = getPedestalSizeFromInputs();
  const position = selectedPedestal.group.position.clone();
  const ry = selectedPedestal.group.rotation.y;
  const content = selectedPedestal.content ?? null;
  const type = pedestalTypeInput.value === 'table' ? 'table' : 'pillar';
  room.remove(selectedPedestal.group);
  const index = displayPedestals.indexOf(selectedPedestal);
  if (index >= 0) displayPedestals.splice(index, 1);
  selectedPedestal = createDisplayPedestal({
    x: position.x,
    z: position.z,
    ry,
    content,
    type,
    ...size,
  });
  updatePedestalSelection();
}

function rotateSelectedPedestal(direction) {
  if (!selectedPedestal) return false;
  selectedPedestal.group.rotation.y += direction * THREE.MathUtils.degToRad(7.5);
  pedestalTitle.textContent = 'Podstavec otočený';
  pedestalStatus.textContent = 'Kolečkem můžeš doladit natočení. Nezapomeň galerii uložit nebo exportovat.';
  return true;
}

function saveGalleryFromEditor() {
  updateSelectedPaintingLabel();
  updateSelectedPaintingSize();
  updateSelectedPedestalSize();
  ensurePaintingLights();
  saveLightingState();
  const saved = saveGalleryState();
  artTitle.textContent = saved ? 'Galerie uložená' : 'Uložení se nepovedlo';
  artStatus.textContent = saved
    ? `Uloženo ${editablePaintings.length} obrazů. Změny zůstanou po zavření a znovu otevření téhle stránky v tomto prohlížeči.`
    : 'Prohlížeč odmítl uložit data. To se může stát u velkých vložených obrázků.';
}

function serializePublicGalleryConfig() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    gallery: serializeGalleryState(),
    lighting: serializeLightingState(),
  };
}

function exportGalleryFromEditor() {
  updateSelectedPaintingLabel();
  updateSelectedPaintingSize();
  updateSelectedPedestalSize();
  saveLightingState();
  saveGalleryState();

  const serialized = JSON.stringify(serializePublicGalleryConfig(), null, 2);
  const blob = new Blob([serialized], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'virtual-gallery-state.json';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);

  artTitle.textContent = 'Galerie exportovaná';
  artStatus.textContent = 'Stáhl se JSON se světly a rozmístěním obrazů. Ten pak můžeme vložit do kódu pro veřejnou verzi.';
}

function resetLocalGalleryFromEditor() {
  try {
    localStorage.removeItem(galleryStorageKey);
    localStorage.removeItem(lightingStorageKey);
  } catch {
    // Embedded browser storage can be unavailable.
  }
  artTitle.textContent = 'Lokální úpravy smazané';
  artStatus.textContent = 'Po znovunačtení se otevře čistá verze z GitHubu.';
  window.setTimeout(() => {
    window.location.href = `${window.location.origin}${window.location.pathname}?edit=1`;
  }, 450);
}

function getEditableTargetFromCrosshair() {
  getCenterRaycaster();
  const objects = [];
  ceilingLights.forEach((lightData) => {
    lightData.fixture.traverse((child) => {
      if (child.isMesh) objects.push(child);
    });
  });
  editablePaintings.forEach((paintingData) => {
    paintingData.group.traverse((child) => {
      if (child.isMesh) objects.push(child);
    });
  });
  displayPedestals.forEach((pedestalData) => {
    pedestalData.group.traverse((child) => {
      if (child.isMesh) objects.push(child);
    });
  });
  const hit = raycaster.intersectObjects(objects, false)[0];
  return hit?.object?.userData ?? null;
}

function selectEditableFromCrosshair() {
  const target = getEditableTargetFromCrosshair();
  if (!target) return false;
  if (target.lightData) {
    selectedLightIndex = ceilingLights.indexOf(target.lightData);
    lightPanel.classList.add('visible');
    artPanel.classList.remove('visible');
    pedestalPanel.classList.remove('visible');
    audioPanel.classList.remove('visible');
    artPreview.visible = false;
    syncLightPanel();
    return true;
  }
  if (target.paintingData) {
    if (swapSourcePainting && target.paintingData !== swapSourcePainting) {
      const firstTitle = swapSourcePainting.labelTitle || 'první obraz';
      const secondTitle = target.paintingData.labelTitle || 'druhý obraz';
      swapPaintingTransforms(swapSourcePainting, target.paintingData);
      selectedPainting = target.paintingData;
      swapSourcePainting = null;
      artPanel.classList.add('visible');
      lightPanel.classList.remove('visible');
      pedestalPanel.classList.remove('visible');
      audioPanel.classList.remove('visible');
      updateLightLabels();
      syncArtPanel();
      syncArtPreview();
      artTitle.textContent = 'Obrazy prohozené';
      artStatus.textContent = `${firstTitle} a ${secondTitle} mají prohozené místo. Nezapomeň kliknout Uložit galerii.`;
      return true;
    }
    selectedPainting = target.paintingData;
    movingSelectedPainting = false;
    artPanel.classList.add('visible');
    lightPanel.classList.remove('visible');
    pedestalPanel.classList.remove('visible');
    audioPanel.classList.remove('visible');
    updateLightLabels();
    syncArtPanel();
    syncArtPreview();
    return true;
  }
  if (target.pedestalData) {
    selectedPedestal = target.pedestalData;
    movingSelectedPedestal = false;
    pedestalPanel.classList.add('visible');
    artPanel.classList.remove('visible');
    lightPanel.classList.remove('visible');
    audioPanel.classList.remove('visible');
    syncPedestalPanel();
    return true;
  }
  return false;
}

const body = new THREE.Object3D();
body.position.set(0, 1.68, 4.6);
scene.add(body);
body.add(camera);

const galleryAudio = new Audio();
galleryAudio.preload = 'auto';
galleryAudio.volume = 1;
let audioContext = null;
let audioSourceNode = null;
let audioMasterGain = null;
let currentJazzTrackIndex = 0;
let galleryAudioRequested = !editorMode;
const audioPosition = new THREE.Vector3();
const audioDirection = new THREE.Vector3();
const audioUp = new THREE.Vector3();
const audioQuaternion = new THREE.Quaternion();

function setAudioParam(param, value) {
  if (!param) return;
  if (audioContext && typeof param.setTargetAtTime === 'function') {
    param.setTargetAtTime(value, audioContext.currentTime, 0.035);
  } else {
    param.value = value;
  }
}

function setPannerPosition(panner, position) {
  if (panner.positionX) {
    setAudioParam(panner.positionX, position.x);
    setAudioParam(panner.positionY, position.y);
    setAudioParam(panner.positionZ, position.z);
  } else if (typeof panner.setPosition === 'function') {
    panner.setPosition(position.x, position.y, position.z);
  }
}

function setPannerOrientation(panner, direction) {
  if (panner.orientationX) {
    setAudioParam(panner.orientationX, direction.x);
    setAudioParam(panner.orientationY, direction.y);
    setAudioParam(panner.orientationZ, direction.z);
  } else if (typeof panner.setOrientation === 'function') {
    panner.setOrientation(direction.x, direction.y, direction.z);
  }
}

function updateAudioToggle() {
  if (!audioToggle) return;
  const playing = !galleryAudio.paused && galleryAudioRequested;
  audioToggle.textContent = galleryAudioRequested || playing ? 'Vypnout jazz' : 'Zapnout jazz';
  audioToggle.classList.toggle('playing', playing);
}

function applyAudioVolume() {
  if (audioMasterGain) {
    setAudioParam(audioMasterGain.gain, audioSettings.volume);
  }
}

function getJazzTrackUrl(index) {
  return new URL(jazzPlaylist[index], window.location.href).href;
}

function initGalleryAudio() {
  if (!jazzPlaylist.length || audioContext) return;

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) {
    if (audioToggle) audioToggle.textContent = 'Audio nejde';
    return;
  }

  audioContext = new AudioContextCtor();
  audioSourceNode = audioContext.createMediaElementSource(galleryAudio);
  audioMasterGain = audioContext.createGain();
  audioMasterGain.gain.value = audioSettings.volume;
  audioMasterGain.connect(audioContext.destination);

  audioSpeakers.forEach((speaker) => {
    const gain = audioContext.createGain();
    gain.gain.value = 0.095;

    const panner = audioContext.createPanner();
    panner.panningModel = 'equalpower';
    panner.distanceModel = 'exponential';
    panner.refDistance = 0.9;
    panner.maxDistance = 9.5;
    panner.rolloffFactor = 1.9;
    panner.coneInnerAngle = 130;
    panner.coneOuterAngle = 230;
    panner.coneOuterGain = 0.16;
    setPannerPosition(panner, speaker.position);
    setPannerOrientation(panner, speaker.target.clone().sub(speaker.position).normalize());

    audioSourceNode.connect(gain);
    gain.connect(panner);
    panner.connect(audioMasterGain);
    speaker.panner = panner;
  });
}

async function playCurrentJazzTrack() {
  if (!jazzPlaylist.length) return;
  const trackUrl = getJazzTrackUrl(currentJazzTrackIndex);
  if (galleryAudio.src !== trackUrl) {
    galleryAudio.src = trackUrl;
  }
  galleryAudioRequested = true;
  updateAudioToggle();
  try {
    await audioContext?.resume();
    await galleryAudio.play();
  } catch {
    galleryAudioRequested = false;
    if (audioToggle) audioToggle.textContent = 'Klikni znovu';
  }
  updateAudioToggle();
}

function playNextJazzTrack() {
  currentJazzTrackIndex = (currentJazzTrackIndex + 1) % jazzPlaylist.length;
  galleryAudio.src = getJazzTrackUrl(currentJazzTrackIndex);
  if (galleryAudioRequested) {
    playCurrentJazzTrack();
  }
}

function toggleGalleryAudio() {
  if (!jazzPlaylist.length) return;
  initGalleryAudio();
  if (!audioContext) return;

  if (galleryAudioRequested) {
    galleryAudioRequested = false;
    galleryAudio.pause();
    updateAudioToggle();
    return;
  }

  playCurrentJazzTrack();
}

function tryStartRequestedAudio() {
  if (!galleryAudioRequested || !galleryAudio.paused) return;
  initGalleryAudio();
  if (!audioContext) return;
  playCurrentJazzTrack();
}

function updateGalleryAudioListener() {
  if (!audioContext) return;

  camera.getWorldPosition(audioPosition);
  camera.getWorldDirection(audioDirection);
  camera.getWorldQuaternion(audioQuaternion);
  audioUp.set(0, 1, 0).applyQuaternion(audioQuaternion);

  const { listener } = audioContext;
  if (listener.positionX) {
    setAudioParam(listener.positionX, audioPosition.x);
    setAudioParam(listener.positionY, audioPosition.y);
    setAudioParam(listener.positionZ, audioPosition.z);
    setAudioParam(listener.forwardX, audioDirection.x);
    setAudioParam(listener.forwardY, audioDirection.y);
    setAudioParam(listener.forwardZ, audioDirection.z);
    setAudioParam(listener.upX, audioUp.x);
    setAudioParam(listener.upY, audioUp.y);
    setAudioParam(listener.upZ, audioUp.z);
  } else {
    listener.setPosition(audioPosition.x, audioPosition.y, audioPosition.z);
    listener.setOrientation(audioDirection.x, audioDirection.y, audioDirection.z, audioUp.x, audioUp.y, audioUp.z);
  }
}

galleryAudio.addEventListener('ended', playNextJazzTrack);
audioToggle?.addEventListener('click', toggleGalleryAudio);
window.addEventListener('pointerdown', (event) => {
  if (event.target instanceof Element && event.target.closest('#audio-toggle, #light-editor, #art-editor, #pedestal-editor, #audio-editor')) {
    return;
  }
  tryStartRequestedAudio();
}, { passive: true });
updateAudioToggle();

function addLightFromView() {
  const worldPosition = new THREE.Vector3();
  const viewDirection = new THREE.Vector3();
  camera.getWorldPosition(worldPosition);
  camera.getWorldDirection(viewDirection);

  const targetPoint = worldPosition.add(viewDirection.multiplyScalar(4.2));
  targetPoint.x = THREE.MathUtils.clamp(targetPoint.x, -roomWidth / 2 + 0.45, roomWidth / 2 - 0.45);
  targetPoint.y = THREE.MathUtils.clamp(targetPoint.y, 0.85, roomHeight - 0.55);
  targetPoint.z = THREE.MathUtils.clamp(targetPoint.z, -roomDepth / 2 + 0.1, roomDepth / 2 - 0.1);

  const position = new THREE.Vector3(
    THREE.MathUtils.clamp(targetPoint.x * 0.72, -roomWidth / 2 + 0.55, roomWidth / 2 - 0.55),
    roomHeight - 0.14,
    THREE.MathUtils.clamp(targetPoint.z * 0.58, -roomDepth / 2 + 0.75, roomDepth / 2 - 0.75),
  );
  const trackId = chooseTrackForTarget(targetPoint);
  addCeilingLight({ position, targetPoint, trackId, power: 105, roomIndex: getRoomIndexForZ(targetPoint.z) });
  saveLightingState();
}

roomLightEnabledInput.addEventListener('change', () => {
  roomLightState.enabled = roomLightEnabledInput.checked;
  if (roomLightState.enabled && roomLightState.power <= 0) {
    roomLightState.power = 12;
  }
  updateRoomLight();
  syncRoomLightControls({ persist: true });
});

roomLightPowerInput.addEventListener('input', () => {
  setRoomLightPower(roomLightPowerInput.value);
});

roomLightPublicPowerInput.addEventListener('input', () => {
  setRoomLightPower(roomLightPublicPowerInput.value);
  showRoomLightControl();
});

toggleLightEditor.addEventListener('click', () => {
  lightPanel.classList.toggle('visible');
  if (lightPanel.classList.contains('visible')) {
    artPanel.classList.remove('visible');
    pedestalPanel.classList.remove('visible');
    audioPanel.classList.remove('visible');
    artPreview.visible = false;
  }
  updateLightLabels();
});

addLightButton.addEventListener('click', addLightFromView);

nextLightButton.addEventListener('click', () => {
  if (!ceilingLights.length) return;
  selectedLightIndex = (selectedLightIndex + 1) % ceilingLights.length;
  syncLightPanel();
  saveLightingState();
});

removeLightButton.addEventListener('click', () => {
  if (ceilingLights.length <= 1) return;
  removeCeilingLight(ceilingLights[selectedLightIndex], { persist: false, sync: false });
  selectedLightIndex %= ceilingLights.length;
  ensurePaintingLights();
  syncLightPanel();
  saveLightingState();
});

lightTrackPositionInput.addEventListener('input', () => {
  const current = ceilingLights[selectedLightIndex];
  if (!current) return;
  current.trackPosition = Number(lightTrackPositionInput.value);
  updateCeilingLight(current);
  saveLightingState();
});

lightYawInput.addEventListener('input', () => {
  const current = ceilingLights[selectedLightIndex];
  if (!current) return;
  current.yaw = Number(lightYawInput.value);
  updateCeilingLight(current);
  saveLightingState();
});

lightPitchInput.addEventListener('input', () => {
  const current = ceilingLights[selectedLightIndex];
  if (!current) return;
  current.pitch = Number(lightPitchInput.value);
  updateCeilingLight(current);
  saveLightingState();
});

lightPowerInput.addEventListener('input', () => {
  const current = ceilingLights[selectedLightIndex];
  if (!current) return;
  current.power = Number(lightPowerInput.value);
  updateCeilingLight(current);
  saveLightingState();
});

lightColorInput.addEventListener('input', () => {
  const current = ceilingLights[selectedLightIndex];
  if (!current) return;
  current.color = lightColorInput.value;
  updateCeilingLight(current);
  saveLightingState();
});

lightAngleInput.addEventListener('input', () => {
  const current = ceilingLights[selectedLightIndex];
  if (!current) return;
  current.angle = Number(lightAngleInput.value);
  updateCeilingLight(current);
  saveLightingState();
});

toggleArtEditor.addEventListener('click', () => {
  artPanel.classList.toggle('visible');
  if (artPanel.classList.contains('visible')) {
    lightPanel.classList.remove('visible');
    pedestalPanel.classList.remove('visible');
    audioPanel.classList.remove('visible');
    updateLightLabels();
  }
  syncArtPanel();
  syncArtPreview();
});

togglePedestalEditor.addEventListener('click', () => {
  pedestalPanel.classList.toggle('visible');
  if (pedestalPanel.classList.contains('visible')) {
    lightPanel.classList.remove('visible');
    artPanel.classList.remove('visible');
    audioPanel.classList.remove('visible');
    artPreview.visible = false;
  }
  syncPedestalPanel();
});

toggleAudioEditor.addEventListener('click', () => {
  audioPanel.classList.toggle('visible');
  if (audioPanel.classList.contains('visible')) {
    lightPanel.classList.remove('visible');
    artPanel.classList.remove('visible');
    pedestalPanel.classList.remove('visible');
    artPreview.visible = false;
  }
});

audioVolumeInput.addEventListener('input', () => {
  audioSettings.volume = THREE.MathUtils.clamp(Number(audioVolumeInput.value) / 100, 0, 1);
  applyAudioVolume();
  saveGalleryState();
});

addPedestalButton.addEventListener('click', () => {
  if (movingSelectedPedestal) {
    moveSelectedPedestalToFloor();
  } else {
    addPedestalFromFloor();
  }
});
movePedestalButton.addEventListener('click', () => {
  if (!selectedPedestal) return;
  movingSelectedPedestal = !movingSelectedPedestal;
  syncPedestalPanel();
});
removePedestalButton.addEventListener('click', removeSelectedPedestal);
[pedestalTypeInput, pedestalWidthCmInput, pedestalDepthCmInput, pedestalHeightCmInput].forEach((input) => {
  input.addEventListener('input', updateSelectedPedestalSize);
  input.addEventListener('change', updateSelectedPedestalSize);
});

addArtButton.addEventListener('click', () => {
  if (movingSelectedPainting) {
    moveSelectedPaintingToPreview();
    return;
  }
  addArtworkFromPreview();
});
moveArtButton.addEventListener('click', () => {
  if (!selectedPainting) return;
  if (movingSelectedPainting) {
    cancelMoveSelectedPainting();
  } else {
    beginMoveSelectedPainting();
  }
});
removeArtButton.addEventListener('click', removeSelectedPainting);
loadArtButton.addEventListener('click', () => artFileInput.click());
saveArtButton.addEventListener('click', saveGalleryFromEditor);
exportArtButton.addEventListener('click', exportGalleryFromEditor);
resetLocalArtButton.addEventListener('click', resetLocalGalleryFromEditor);
swapArtButton.addEventListener('click', () => {
  if (!selectedPainting) return;
  swapSourcePainting = selectedPainting;
  movingSelectedPainting = false;
  syncArtPanel();
  artTitle.textContent = 'Vyber druhý obraz';
  artStatus.textContent = 'Teď namiř tečku na druhý obraz a klikni. Obrazy si prohodí pozice.';
});

artFileInput.addEventListener('change', () => {
  const [file] = artFileInput.files;
  if (!file) return;
  artPanel.classList.add('visible');
  artTitle.textContent = 'Načítám obrázek';
  artStatus.textContent = file.name;
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    const image = new Image();
    image.addEventListener('load', () => {
      const pixelAspect = image.naturalWidth / image.naturalHeight;
      const defaultWidthCm = 60;
      const defaultHeightCm = Math.round(defaultWidthCm / pixelAspect);
      pendingArtAspect = pixelAspect;
      const sizeInput = window.prompt('Zadej reálnou šířku obrazu v cm. Výška se drží podle proporcí obrázku a jde potom doladit číselně v editoru.', `${defaultWidthCm}`);
      const size = parseArtworkSize(sizeInput, pixelAspect) ?? {
        widthMeters: defaultWidthCm / centimetersPerMeter,
        heightMeters: defaultHeightCm / centimetersPerMeter,
      };
      applyArtworkRealSize(size.widthMeters, size.heightMeters);
      if (!artLabelTitleInput.value.trim()) {
        artLabelTitleInput.value = file.name.replace(/\.[^.]+$/, '');
      }
      pendingArtMaterial = createMaterialFromImageUrl(reader.result);
      pendingArtSource = reader.result;
      artTitle.textContent = 'Obrázek načtený';
      artStatus.textContent = `Velikost: ${formatCm(size.widthMeters * centimetersPerMeter)} x ${formatCm(size.heightMeters * centimetersPerMeter)} cm. Namiř tečku na stěnu a vlož.`;
      addArtworkFromPreview();
    });
    image.addEventListener('error', () => {
      artTitle.textContent = 'Obrázek se nenačetl';
      artStatus.textContent = 'Soubor jde přečíst, ale prohlížeč ho neumí použít jako obrázek.';
    });
    image.src = reader.result;
  });
  reader.addEventListener('error', () => {
    artTitle.textContent = 'Obrázek se nenačetl';
    artStatus.textContent = 'Zkus jiný soubor typu JPG, PNG nebo WebP.';
  });
  reader.readAsDataURL(file);
  artFileInput.value = '';
});

[artFreeModeInput, artOffsetXInput, artHeightInput, artFrameSizeInput, artFrameColorInput].forEach((input) => {
  input.addEventListener('input', () => {
    syncArtPreview();
    updateSelectedPaintingSize();
  });
  input.addEventListener('change', () => {
    syncArtPreview();
    updateSelectedPaintingSize();
  });
});

artWidthCmInput.addEventListener('input', () => {
  syncArtworkHeightFromWidth();
  syncArtPreview();
  updateSelectedPaintingSize();
});
artWidthCmInput.addEventListener('change', () => {
  syncArtworkHeightFromWidth();
  syncArtPreview();
  updateSelectedPaintingSize();
});
artHeightCmInput.addEventListener('input', () => {
  syncArtworkWidthFromHeight();
  syncArtPreview();
  updateSelectedPaintingSize();
});
artHeightCmInput.addEventListener('change', () => {
  syncArtworkWidthFromHeight();
  syncArtPreview();
  updateSelectedPaintingSize();
});

[artLabelTitleInput, artLabelMediumInput, artLabelSizeInput, artLabelDateInput, artLabelPriceInput].forEach((input) => {
  input.addEventListener('input', updateSelectedPaintingLabel);
  input.addEventListener('change', updateSelectedPaintingLabel);
});

function selectLightFromPointer(event) {
  if (!lightPanel.classList.contains('visible')) return false;

  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const fixtureMeshes = ceilingLights.flatMap((lightData) => {
    const meshes = [];
    lightData.fixture.traverse((child) => {
      if (child.isMesh) meshes.push(child);
    });
    return meshes;
  });
  const hit = raycaster.intersectObjects(fixtureMeshes, false)[0];
  if (!hit?.object.userData.lightData) return false;

  selectedLightIndex = ceilingLights.indexOf(hit.object.userData.lightData);
  syncLightPanel();
  saveLightingState();
  return true;
}

const keys = new Set();
let draggingLook = false;
let pointerLocked = false;
let lookEnabled = false;
let lastMouseX = 0;
let lastMouseY = 0;
let fallbackTurning = false;
let fallbackOriginX = 0;
let fallbackOriginY = 0;
let fallbackTurnVelocity = 0;
let fallbackPitchVelocity = 0;
let bodyYaw = 0;
let headYaw = 0;
let pitch = 0;
let velocityBob = 0;
let bobTime = 0;

const maxHeadYaw = THREE.MathUtils.degToRad(82);
const maxPitchUp = THREE.MathUtils.degToRad(58);
const maxPitchDown = THREE.MathUtils.degToRad(48);
const moveSpeed = 2.7;
const sprintMultiplier = 1.85;
const turnSpeed = 1.9;
const fallbackTurnSpeed = 0.85;
const fallbackPitchSpeed = 0.52;
const eyeHeight = 1.68;
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
const touchMove = new THREE.Vector2();
const stickPointer = { id: null };
const lookPointer = { id: null, lastX: 0, lastY: 0 };

function isTextEditingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable
    || target.tagName === 'INPUT'
    || target.tagName === 'TEXTAREA'
    || target.tagName === 'SELECT';
}

if (isTouchDevice) {
  hint.textContent = 'Levy palec chuze · pravy palec pohled';
  hint.classList.add('active');
  mobileControls.classList.add('visible');
}

function syncCameraRotation() {
  body.rotation.y = bodyYaw;
  camera.rotation.order = 'YXZ';
  camera.rotation.y = headYaw;
  camera.rotation.x = pitch;
}

function resetView() {
  body.position.set(0, eyeHeight, 4.6);
  bodyYaw = 0;
  headYaw = 0;
  pitch = 0;
  fallbackTurning = false;
  fallbackTurnVelocity = 0;
  fallbackPitchVelocity = 0;
  syncCameraRotation();
}

function updateStatus() {
  if (isTouchDevice) {
    status.textContent = 'mobilní ovládání';
    return;
  }

  if (pointerLocked) {
    status.textContent = 'FPS pohled zapnutý';
  } else if (fallbackTurning) {
    status.textContent = 'plynulé otáčení myší';
  } else if (lookEnabled) {
    status.textContent = 'pohled zapnutý bez zamknutí myši';
  } else {
    status.textContent = 'pohled vypnutý';
  }
}

function disableLook() {
  lookEnabled = false;
  draggingLook = false;
  fallbackTurning = false;
  fallbackTurnVelocity = 0;
  fallbackPitchVelocity = 0;
  canvas.classList.remove('dragging');
  updateStatus();
}

function releaseLook() {
  if (document.pointerLockElement === canvas && document.exitPointerLock) {
    document.exitPointerLock();
  }
  disableLook();
}

document.addEventListener('keydown', (event) => {
  if (isTextEditingTarget(event.target)) {
    keys.clear();
    if (event.code === 'Escape') {
      event.target.blur();
      releaseLook();
    }
    return;
  }

  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE'].includes(event.code)) {
    event.preventDefault();
    if (event.code === 'KeyW') {
      tryStartRequestedAudio();
    }
  }

  if (event.code === 'Escape') {
    releaseLook();
  }

  if (event.code === 'KeyR') {
    resetView();
  }

  keys.add(event.code);
});

document.addEventListener('keyup', (event) => keys.delete(event.code));
document.addEventListener('focusin', (event) => {
  if (isTextEditingTarget(event.target)) {
    keys.clear();
  }
});

function applyLookDelta(deltaX, deltaY, sensitivity = 0.0021) {
  bodyYaw -= deltaX * sensitivity;
  pitch -= deltaY * sensitivity;
  headYaw = 0;
  pitch = THREE.MathUtils.clamp(pitch, -maxPitchUp, maxPitchDown);
  syncCameraRotation();
}

function updateFallbackTurn(event) {
  const maxDistance = 180;
  const dx = THREE.MathUtils.clamp(event.clientX - fallbackOriginX, -maxDistance, maxDistance);
  const dy = THREE.MathUtils.clamp(event.clientY - fallbackOriginY, -maxDistance, maxDistance);

  const rawTurn = dx / maxDistance;
  const rawPitch = dy / maxDistance;
  fallbackTurnVelocity = Math.sign(rawTurn) * Math.pow(Math.abs(rawTurn), 1.55);
  fallbackPitchVelocity = Math.sign(rawPitch) * Math.pow(Math.abs(rawPitch), 1.65);
}

canvas.addEventListener('mousedown', (event) => {
  if (event.button === 2) {
    event.preventDefault();
    releaseLook();
    return;
  }

  if (event.button !== 0 || isTouchDevice) return;
  if (movingSelectedPainting) {
    event.preventDefault();
    moveSelectedPaintingToPreview();
    return;
  }
  if (movingSelectedPedestal) {
    event.preventDefault();
    moveSelectedPedestalToFloor();
    return;
  }
  if (tryOpenRoomLightSwitch()) {
    event.preventDefault();
    return;
  }
  if (selectEditableFromCrosshair()) {
    event.preventDefault();
    return;
  }
  if (selectLightFromPointer(event)) {
    event.preventDefault();
    return;
  }
  canvas.focus();
  lookEnabled = true;
  draggingLook = true;
  fallbackTurning = true;
  fallbackOriginX = event.clientX;
  fallbackOriginY = event.clientY;
  fallbackTurnVelocity = 0;
  fallbackPitchVelocity = 0;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
  canvas.classList.add('dragging');
  updateStatus();

  if (!pointerLocked && canvas.requestPointerLock) {
    canvas.requestPointerLock();
  }
});

canvas.addEventListener('wheel', (event) => {
  if (!editorMode || !selectedPedestal || !pedestalPanel.classList.contains('visible')) return;
  event.preventDefault();
  rotateSelectedPedestal(event.deltaY > 0 ? -1 : 1);
}, { passive: false });

document.addEventListener('mousedown', (event) => {
  if (event.button !== 2 || isTouchDevice) return;
  if (pointerLocked || event.target === canvas) {
    event.preventDefault();
    releaseLook();
  }
}, true);

document.addEventListener('contextmenu', (event) => {
  if (pointerLocked || event.target === canvas) {
    event.preventDefault();
  }
});

document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === canvas;
  canvas.classList.toggle('dragging', pointerLocked);
  hint.classList.toggle('active', pointerLocked);
  if (pointerLocked) {
    lookEnabled = true;
    fallbackTurning = false;
    fallbackTurnVelocity = 0;
    fallbackPitchVelocity = 0;
  } else {
    disableLook();
  }
  updateStatus();
});

window.addEventListener('mouseup', () => {
  if (pointerLocked) return;
  disableLook();
});

canvas.addEventListener('mouseleave', () => {
  if (!pointerLocked) disableLook();
});

window.addEventListener('blur', disableLook);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) disableLook();
});

window.addEventListener('mousemove', (event) => {
  if (isTouchDevice) return;

  if (pointerLocked) {
    applyLookDelta(event.movementX, event.movementY);
    return;
  }

  if (lookEnabled) {
    updateFallbackTurn(event);
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    return;
  }

  if (draggingLook) {
    applyLookDelta(event.movementX, event.movementY);
  }
});

function resetStick() {
  stickPointer.id = null;
  touchMove.set(0, 0);
  moveStickKnob.style.transform = 'translate(-50%, -50%)';
}

function updateStick(event) {
  const rect = moveStick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;
  const max = 46;
  const length = Math.min(Math.hypot(dx, dy), max);
  const angle = Math.atan2(dy, dx);
  const knobX = Math.cos(angle) * length;
  const knobY = Math.sin(angle) * length;

  moveStickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
  touchMove.set(knobX / max, knobY / max);
}

moveStick.addEventListener('pointerdown', (event) => {
  if (!isTouchDevice) return;
  if (stickPointer.id !== null) return;

  stickPointer.id = event.pointerId;
  moveStick.setPointerCapture?.(event.pointerId);
  updateStick(event);
  event.preventDefault();
});

lookPad.addEventListener('pointerdown', (event) => {
  if (!isTouchDevice) return;
  if (lookPointer.id !== null) return;

  lookPointer.id = event.pointerId;
  lookPointer.lastX = event.clientX;
  lookPointer.lastY = event.clientY;
  lookPad.setPointerCapture?.(event.pointerId);
  event.preventDefault();
});

window.addEventListener('pointermove', (event) => {
  if (!isTouchDevice) return;

  if (event.pointerId === stickPointer.id) {
    updateStick(event);
    event.preventDefault();
  }

  if (event.pointerId === lookPointer.id) {
    const deltaX = event.clientX - lookPointer.lastX;
    const deltaY = event.clientY - lookPointer.lastY;
    lookPointer.lastX = event.clientX;
    lookPointer.lastY = event.clientY;
    applyLookDelta(deltaX, deltaY, 0.0042);
    event.preventDefault();
  }
}, { passive: false });

window.addEventListener('pointerup', (event) => {
  if (event.pointerId === stickPointer.id) resetStick();
  if (event.pointerId === lookPointer.id) lookPointer.id = null;
});

window.addEventListener('pointercancel', (event) => {
  if (event.pointerId === stickPointer.id) resetStick();
  if (event.pointerId === lookPointer.id) lookPointer.id = null;
});

const clock = new THREE.Clock();
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const movement = new THREE.Vector3();

function updateMovement(delta) {
  const previousPosition = body.position.clone();

  if (!pointerLocked && fallbackTurning) {
    bodyYaw -= fallbackTurnVelocity * fallbackTurnSpeed * delta;
    pitch -= fallbackPitchVelocity * fallbackPitchSpeed * delta;
    pitch = THREE.MathUtils.clamp(pitch, -maxPitchUp, maxPitchDown);
  }

  if (keys.has('KeyA') || keys.has('KeyQ')) bodyYaw += turnSpeed * delta;
  if (keys.has('KeyD') || keys.has('KeyE')) bodyYaw -= turnSpeed * delta;

  const walkYaw = bodyYaw + headYaw;
  forward.set(-Math.sin(walkYaw), 0, -Math.cos(walkYaw));
  right.set(Math.cos(bodyYaw), 0, -Math.sin(bodyYaw));
  movement.set(0, 0, 0);

  if (keys.has('KeyW')) movement.add(forward);
  if (keys.has('KeyS')) movement.sub(forward);
  if (isTouchDevice) {
    movement.addScaledVector(forward, -touchMove.y);
    movement.addScaledVector(right, touchMove.x);
  }

  const moving = movement.lengthSq() > 0;
  if (moving) {
    const speed = moveSpeed * (keys.has('ShiftLeft') || keys.has('ShiftRight') ? sprintMultiplier : 1);
    movement.normalize().multiplyScalar(speed * delta);
    body.position.add(movement);
  }

  const margin = 0.55;
  constrainToGallery(body.position, margin, previousPosition);

  velocityBob = THREE.MathUtils.lerp(velocityBob, moving ? 1 : 0, 1 - Math.pow(0.001, delta));
  bobTime += delta * 8.5 * velocityBob;
  camera.position.y = Math.sin(bobTime) * 0.028 * velocityBob;
  body.position.y = eyeHeight;
  syncCameraRotation();
}

function updateAutoRoomLights(delta) {
  const currentRoomIndex = getRoomIndexForZ(body.position.z);
  ceilingLights.forEach((lightData) => {
    const active = Math.abs((lightData.roomIndex ?? currentRoomIndex) - currentRoomIndex) <= 0;
    if (lightData.spot.visible !== active) {
      lightData.spot.visible = active;
      spotShadowSetupDirty = true;
    }
  });
  updateActiveSpotShadows(currentRoomIndex);

  navigationFillLights.forEach((fixture, index) => {
    const requestedPower = roomLightState.enabled ? roomLightState.power : 0;
    const targetPower = index === currentRoomIndex ? Math.min(requestedPower * 0.035, 2.8) : 0;
    fixture.light.intensity = THREE.MathUtils.lerp(fixture.light.intensity, targetPower, 1 - Math.pow(0.0004, delta));
  });

  autoRoomLights.forEach((fixture) => {
    const playerIsNearRoom = body.position.z >= fixture.minZ && body.position.z <= fixture.maxZ;
    const requestedPower = roomLightState.enabled ? roomLightState.power : 0;
    const targetPower = playerIsNearRoom ? requestedPower : 0;
    fixture.currentPower = THREE.MathUtils.lerp(fixture.currentPower, targetPower, 1 - Math.pow(0.0004, delta));
    fixture.light.intensity = fixture.currentPower;
    setRoomLightPanelColor(fixture.panelMaterial, fixture.currentPower);
  });
}

function updateArtworkBrightness(delta) {
  const currentRoomIndex = getRoomIndexForZ(body.position.z);
  editablePaintings.forEach((paintingData) => {
    const lightData = paintingData.artSpot;
    const lightRoomIndex = lightData?.roomIndex ?? getRoomIndexForZ(paintingData.group.position.z);
    const paintingRoomIndex = getRoomIndexForZ(paintingData.group.position.z);
    const lightIsInCurrentRoom = lightRoomIndex === currentRoomIndex && paintingRoomIndex === currentRoomIndex;
    const lightIsOn = Boolean(lightData && lightIsInCurrentRoom && (lightData.power ?? 0) > 0.5);
    const targetBrightness = lightIsOn
      ? 1
      : 0.018;
    const currentBrightness = paintingData.art.userData.displayBrightness ?? targetBrightness;
    const nextBrightness = THREE.MathUtils.lerp(currentBrightness, targetBrightness, 1 - Math.pow(0.0003, delta));
    paintingData.art.userData.displayBrightness = nextBrightness;
    if (paintingData.material?.color) {
      paintingData.material.color.setScalar(nextBrightness);
    }
    if (paintingData.label?.material?.color) {
      paintingData.label.material.color.setScalar(nextBrightness);
    }
  });
}

function updateCrosshairAndEditors() {
  hoveredEditable = getEditableTargetFromCrosshair();
  const isPaintingTarget = Boolean(hoveredEditable?.paintingData);
  const isAnyEditableTarget = Boolean(hoveredEditable?.lightData || hoveredEditable?.paintingData || hoveredEditable?.pedestalData);
  crosshair.classList.toggle('target', editorMode && isAnyEditableTarget);
  crosshair.classList.toggle('viewer-hidden', !editorMode && isPaintingTarget);
  if (movingSelectedPedestal && selectedPedestal) {
    const placement = getFloorPlacement();
    if (placement) {
      selectedPedestal.group.position.x = placement.x;
      selectedPedestal.group.position.z = placement.z;
    }
  }
  updatePedestalSelection();
  syncArtPreview();
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.05);
  updateMovement(delta);
  updateAutoRoomLights(delta);
  updateArtworkBrightness(delta);
  updateCrosshairAndEditors();
  updateGalleryAudioListener();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

syncCameraRotation();
updateStatus();
animate();

window.__galleryDebug = () => ({
  bodyPosition: body.position.toArray(),
  currentRoomIndex: getRoomIndexForZ(body.position.z),
  wallMeshes: wallMeshes.length,
  wallMaterial: {
    type: wallMaterial.type,
    color: `#${wallMaterial.color.getHexString()}`,
    emissive: wallMaterial.emissive ? `#${wallMaterial.emissive.getHexString()}` : null,
    emissiveIntensity: wallMaterial.emissiveIntensity ?? null,
    hasMap: Boolean(wallMaterial.map),
    vertexColors: wallMaterial.vertexColors,
  },
  autoRoomLights: autoRoomLights.map((fixture, index) => ({
    index,
    z: fixture.centerZ,
    minZ: fixture.minZ,
    maxZ: fixture.maxZ,
    currentPower: Number(fixture.currentPower.toFixed(3)),
    intensity: Number(fixture.light.intensity.toFixed(3)),
  })),
  visibleSpotLights: ceilingLights.filter((lightData) => lightData.spot.visible).length,
  displayPedestals: displayPedestals.length,
  audio: {
    tracks: jazzPlaylist.length,
    speakers: audioSpeakers.length,
    requested: galleryAudioRequested,
    paused: galleryAudio.paused,
    currentTrack: jazzPlaylist[currentJazzTrackIndex] ?? null,
  },
  rendererInfo: {
    calls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    geometries: renderer.info.memory.geometries,
    textures: renderer.info.memory.textures,
  },
  bodyYaw,
  headYaw,
  pitch,
  pointerLocked,
  lookEnabled,
  keys: [...keys],
});

window.__galleryLightingConfig = () => serializeLightingState();
window.__galleryPublicConfig = () => serializePublicGalleryConfig();
