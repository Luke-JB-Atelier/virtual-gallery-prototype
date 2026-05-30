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
const lightKindInput = document.querySelector('#light-kind');
const moveLightButton = document.querySelector('#move-light');
const aimLightButton = document.querySelector('#aim-light');
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
const artLabelVisibleInput = document.querySelector('#art-label-visible');
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
const pedestalStickerFileInput = document.querySelector('#pedestal-sticker-file');
const loadPedestalStickerButton = document.querySelector('#load-pedestal-sticker');
const removePedestalStickerButton = document.querySelector('#remove-pedestal-sticker');
const pedestalStickerWidthCmInput = document.querySelector('#pedestal-sticker-width-cm');
const pedestalStickerHeightCmInput = document.querySelector('#pedestal-sticker-height-cm');
const pedestalStickerOffsetXCmInput = document.querySelector('#pedestal-sticker-offset-x-cm');
const pedestalStickerOffsetYCmInput = document.querySelector('#pedestal-sticker-offset-y-cm');
const toggleTextPanelEditor = document.querySelector('#toggle-text-panel-editor');
const textPanelPanel = document.querySelector('#text-panel-panel');
const textPanelTitle = document.querySelector('#text-panel-title');
const textPanelStatus = document.querySelector('#text-panel-status');
const addTextPanelButton = document.querySelector('#add-text-panel');
const moveTextPanelButton = document.querySelector('#move-text-panel');
const removeTextPanelButton = document.querySelector('#remove-text-panel');
const textPanelKindInput = document.querySelector('#text-panel-kind');
const textPanelTextInput = document.querySelector('#text-panel-text');
const textPanelDonorTools = document.querySelector('#text-panel-donor-tools');
const donorRowList = document.querySelector('#donor-row-list');
const addDonorRowButton = document.querySelector('#add-donor-row');
const textPanelWidthCmInput = document.querySelector('#text-panel-width-cm');
const textPanelHeightCmInput = document.querySelector('#text-panel-height-cm');
const textPanelFontSizeInput = document.querySelector('#text-panel-font-size');
const textPanelFontWeightInput = document.querySelector('#text-panel-font-weight');
const textPanelAlignInput = document.querySelector('#text-panel-align');
const textPanelBgColorInput = document.querySelector('#text-panel-bg-color');
const textPanelTextColorInput = document.querySelector('#text-panel-text-color');
const toggleAudioEditor = document.querySelector('#toggle-audio-editor');
const audioPanel = document.querySelector('#audio-panel');
const audioVolumeInput = document.querySelector('#audio-volume');

const donorContextMenu = document.createElement('div');
donorContextMenu.id = 'donor-context-menu';
donorContextMenu.innerHTML = '<button type="button" data-action="delete">Smazat řádek</button>';
document.body.append(donorContextMenu);
let donorContextRowIndex = null;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070a);
scene.fog = new THREE.Fog(0x05070a, 34, 70);

function getViewportSize() {
  const viewport = window.visualViewport;
  return {
    width: Math.max(1, Math.round(viewport?.width ?? window.innerWidth)),
    height: Math.max(1, Math.round(viewport?.height ?? window.innerHeight)),
  };
}

const viewportSize = getViewportSize();
const camera = new THREE.PerspectiveCamera(68, viewportSize.width / viewportSize.height, 0.05, 60);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const prefersCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
const isTouchDevice = prefersCoarsePointer;
const lowMemoryDevice = Number(navigator.deviceMemory) > 0 && Number(navigator.deviceMemory) <= 4;
const mobilePerformanceMode = prefersCoarsePointer || lowMemoryDevice || viewportSize.width <= 760;
const textureAnisotropy = mobilePerformanceMode ? 1 : 4;

function getRenderPixelRatio() {
  return Math.min(window.devicePixelRatio || 1, mobilePerformanceMode ? 1 : 2);
}

const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobilePerformanceMode, powerPreference: 'high-performance' });
renderer.setPixelRatio(getRenderPixelRatio());
renderer.setSize(viewportSize.width, viewportSize.height);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = !mobilePerformanceMode;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true;
const maxShadowedSpotLights = mobilePerformanceMode ? 0 : 3;

const roomWidth = 9;
const roomDepth = 12;
const roomHeight = 3.4;
const artworkWallEdgeGap = 0.04;
const centimetersPerMeter = 100;
const defaultArtworkWidthCm = 120;
const defaultArtworkAspect = 1;
const lightingStorageKey = 'virtual-gallery-lighting-oil-v3';
const galleryStorageKey = 'virtual-gallery-art-oil-v1';
const urlParams = new URLSearchParams(window.location.search);
const editorMode = urlParams.has('edit');
const forceGitHubState = urlParams.has('github') || urlParams.has('fresh');
const useLocalSavedState = (editorMode || urlParams.has('local')) && !forceGitHubState;
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
document.body.classList.toggle('mobile-performance', mobilePerformanceMode);

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


function addFloorEdgeDarkening(mesh, width = roomWidth, depth = roomDepth) {
  const geometry = mesh.geometry;
  const position = geometry.attributes.position;
  const colors = [];
  const centerColor = new THREE.Color(0xb84438);
  const edgeColor = new THREE.Color(0x4b1218);

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const edgeDistance = Math.max(Math.abs(x) / (width / 2), Math.abs(y) / (depth / 2));
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
const sideRoomStep = roomWidth + corridorLength;
const galleryRooms = [
  { id: 'main', centerX: 0, centerZ: 0, hasBackDoor: false, hasFrontDoor: true },
  { id: 'room-2', centerX: 0, centerZ: roomStep, hasBackDoor: true, hasFrontDoor: true, hasLeftDoor: true },
  { id: 'room-3', centerX: 0, centerZ: roomStep * 2, hasBackDoor: true, hasFrontDoor: false },
  { id: 'future-1', centerX: -sideRoomStep, centerZ: roomStep, hasRightDoor: true, hasLeftDoor: true },
  { id: 'future-2', centerX: -sideRoomStep * 2, centerZ: roomStep, hasRightDoor: true },
];

function addRoomFloorAndCeiling(centerX, centerZ) {
  const floorMesh = plane(roomWidth, roomDepth, floorMaterial, [centerX, 0, centerZ], [-Math.PI / 2, 0, 0], 24);
  addFloorEdgeDarkening(floorMesh, roomWidth, roomDepth);
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

function addSideBarrelVault(centerX, centerZ) {
  const halfWidth = doorway.width / 2;
  const length = corridorLength;
  const springY = doorway.height;
  const arcSegments = 18;
  const lengthSegments = 8;
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let xIndex = 0; xIndex <= lengthSegments; xIndex += 1) {
    const x = centerX - length / 2 + (xIndex / lengthSegments) * length;
    for (let zIndex = 0; zIndex <= arcSegments; zIndex += 1) {
      const theta = Math.PI - (zIndex / arcSegments) * Math.PI;
      const z = centerZ + Math.cos(theta) * halfWidth;
      const y = springY + Math.sin(theta) * halfWidth;
      vertices.push(x, y, z);
      uvs.push(zIndex / arcSegments, xIndex / lengthSegments);
    }
  }

  for (let xIndex = 0; xIndex < lengthSegments; xIndex += 1) {
    for (let zIndex = 0; zIndex < arcSegments; zIndex += 1) {
      const a = xIndex * (arcSegments + 1) + zIndex;
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

function addCorridorFloorAndCeiling(centerX, centerZ) {
  const floorMesh = plane(doorway.width, corridorLength, floorMaterial, [centerX, 0, centerZ], [-Math.PI / 2, 0, 0], 8);
  addFloorEdgeDarkening(floorMesh, doorway.width, corridorLength);
  addBarrelVault(centerZ);
}

function addSideCorridorFloorAndCeiling(centerX, centerZ) {
  const carpetLength = corridorLength + 0.22;
  const carpetWidth = doorway.width * 1.02;
  const floorMesh = plane(carpetLength, carpetWidth, floorMaterial, [centerX, 0.006, centerZ], [-Math.PI / 2, 0, 0], 8);
  addFloorEdgeDarkening(floorMesh, carpetLength, carpetWidth);
  addSideBarrelVault(centerX, centerZ);
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

function addArchedDoorHeader(z, centerX = 0) {
  const halfWidth = doorway.width / 2;
  const springY = doorway.height;
  const archSegments = 36;
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= archSegments; i += 1) {
    const theta = Math.PI - (i / archSegments) * Math.PI;
    const x = centerX + Math.cos(theta) * halfWidth;
    const archY = springY + Math.sin(theta) * halfWidth;
    vertices.push(x, archY, z, x, roomHeight, z);
    uvs.push((x - centerX + halfWidth) / doorway.width, archY / roomHeight, (x - centerX + halfWidth) / doorway.width, 1);
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
  const mesh = new THREE.Mesh(geometry, archWallMaterial);
  room.add(mesh);
  wallMeshes.push(mesh);
}

function addSideArchedDoorHeader(x, centerZ) {
  const halfWidth = doorway.width / 2;
  const springY = doorway.height;
  const archSegments = 36;
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= archSegments; i += 1) {
    const theta = Math.PI - (i / archSegments) * Math.PI;
    const z = centerZ + Math.cos(theta) * halfWidth;
    const archY = springY + Math.sin(theta) * halfWidth;
    vertices.push(x, archY, z, x, roomHeight, z);
    uvs.push((z - centerZ + halfWidth) / doorway.width, archY / roomHeight, (z - centerZ + halfWidth) / doorway.width, 1);
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
  const mesh = new THREE.Mesh(geometry, archWallMaterial);
  room.add(mesh);
  wallMeshes.push(mesh);
}

galleryRooms.forEach(({ centerX, centerZ }) => addRoomFloorAndCeiling(centerX, centerZ));

const x0 = -roomWidth / 2;
const x1 = roomWidth / 2;
const galleryMinX = Math.min(...galleryRooms.map(({ centerX }) => centerX - roomWidth / 2));
const galleryMaxX = Math.max(...galleryRooms.map(({ centerX }) => centerX + roomWidth / 2));
const galleryMinZ = -roomDepth / 2;
const galleryMaxZ = roomStep * 2 + roomDepth / 2;
const doorTopHeight = roomHeight - doorway.height;
const doorTopCenterY = doorway.height + doorTopHeight / 2;
const doorLeftX = -doorway.width / 2;
const doorRightX = doorway.width / 2;

function addDoorWallZ(centerX, z) {
  addWallSegment(centerX + x0, z, centerX + doorLeftX, z);
  addWallSegment(centerX + doorRightX, z, centerX + x1, z);
  addArchedDoorHeader(z, centerX);
}

function addDoorWallX(x, centerZ) {
  const backZ = centerZ - roomDepth / 2;
  const frontZ = centerZ + roomDepth / 2;
  addWallSegment(x, backZ, x, centerZ - doorway.width / 2);
  addWallSegment(x, centerZ + doorway.width / 2, x, frontZ);
  addSideArchedDoorHeader(x, centerZ);
}

function addSolidRoomWallZ(centerX, z, rotationY) {
  addWall(roomWidth, roomHeight, [centerX, roomHeight / 2, z], [0, rotationY, 0], 18);
  addWallTrim(roomWidth, [centerX, 0.035, z], rotationY);
  addWallTrim(roomWidth, [centerX, roomHeight - 0.035, z], rotationY);
}

function addRectangularRoomWalls({ centerX, centerZ, hasBackDoor = false, hasFrontDoor = false, hasLeftDoor = false, hasRightDoor = false }) {
  const backZ = centerZ - roomDepth / 2;
  const frontZ = centerZ + roomDepth / 2;
  const leftX = centerX - roomWidth / 2;
  const rightX = centerX + roomWidth / 2;
  if (hasBackDoor) {
    addDoorWallZ(centerX, backZ);
  } else {
    addSolidRoomWallZ(centerX, backZ, 0);
  }
  if (hasFrontDoor) {
    addDoorWallZ(centerX, frontZ);
  } else {
    addSolidRoomWallZ(centerX, frontZ, Math.PI);
  }
  if (hasLeftDoor) {
    addDoorWallX(leftX, centerZ);
  } else {
    addWallSegment(leftX, backZ, leftX, frontZ);
  }
  if (hasRightDoor) {
    addDoorWallX(rightX, centerZ);
  } else {
    addWallSegment(rightX, backZ, rightX, frontZ);
  }
}

function addCorridorWalls(startZ, endZ) {
  addCorridorFloorAndCeiling(0, (startZ + endZ) / 2);
  addWallSegment(doorLeftX, startZ, doorLeftX, endZ, doorway.height, doorway.height / 2, { floorTrim: false, ceilingTrim: false });
  addWallSegment(doorRightX, startZ, doorRightX, endZ, doorway.height, doorway.height / 2, { floorTrim: false, ceilingTrim: false });
}

function addSideCorridorWalls(startX, endX, centerZ) {
  addSideCorridorFloorAndCeiling((startX + endX) / 2, centerZ);
  addWallSegment(startX, centerZ - doorway.width / 2, endX, centerZ - doorway.width / 2, doorway.height, doorway.height / 2, { floorTrim: false, ceilingTrim: false });
  addWallSegment(startX, centerZ + doorway.width / 2, endX, centerZ + doorway.width / 2, doorway.height, doorway.height / 2, { floorTrim: false, ceilingTrim: false });
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
  opacity: 0.42,
  depthWrite: false,
  wireframe: true,
});

function createFlatCapTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#2c2d2d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 2600; i += 1) {
    const shade = 30 + Math.floor(Math.random() * 45);
    ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.22)`;
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1.2, 1.2);
  }

  ctx.lineWidth = 1.15;
  for (let x = -256; x < canvas.width * 2; x += 12) {
    ctx.strokeStyle = 'rgba(210, 210, 205, 0.07)';
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 256, 256);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.beginPath();
    ctx.moveTo(x + 6, 0);
    ctx.lineTo(x + 262, 256);
    ctx.stroke();
  }

  for (let x = 0; x < canvas.width * 2; x += 12) {
    ctx.strokeStyle = 'rgba(185, 185, 180, 0.055)';
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - 256, 256);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.35, 1.35);
  texture.anisotropy = textureAnisotropy;
  return texture;
}

const flatCapTexture = createFlatCapTexture();
const flatCapMaterial = new THREE.MeshStandardMaterial({
  color: 0x4a4b49,
  map: flatCapTexture,
  bumpMap: flatCapTexture,
  bumpScale: 0.018,
  roughness: 0.96,
  metalness: 0,
});
const flatCapInsideMaterial = new THREE.MeshStandardMaterial({
  color: 0x070707,
  roughness: 0.9,
  metalness: 0,
  side: THREE.DoubleSide,
});
const capCoinMaterial = new THREE.MeshStandardMaterial({
  color: 0xc79b42,
  roughness: 0.28,
  metalness: 0.72,
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
  galleryRooms.forEach(({ centerX, centerZ }) => {
    const target = new THREE.Vector3(centerX, 1.48, centerZ);
    const cornerX = roomWidth / 2 - 0.16;
    const cornerZ = roomDepth / 2 - 0.18;
    [
      new THREE.Vector3(centerX + cornerX, roomHeight - 0.34, centerZ - cornerZ),
      new THREE.Vector3(centerX - cornerX, roomHeight - 0.34, centerZ + cornerZ),
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

function createTipHatContent(pedestalWidth, pedestalDepth, pedestalHeight, content = {}) {
  const hat = new THREE.Group();
  const scale = THREE.MathUtils.clamp(Number(content.scale) || 1, 0.55, 1.4);
  const hatRadius = Math.min(pedestalWidth, pedestalDepth) * 0.3 * scale;
  const topY = pedestalHeight + 0.026;
  hat.position.set(
    Number.isFinite(content.offsetX) ? content.offsetX : 0,
    topY,
    Number.isFinite(content.offsetZ) ? content.offsetZ : 0,
  );
  hat.rotation.y = Number.isFinite(content.rotationY) ? content.rotationY : 0;

  const brim = new THREE.Mesh(new THREE.TorusGeometry(hatRadius * 1.2, hatRadius * 0.065, 12, 56), flatCapMaterial);
  brim.position.y = hatRadius * 0.08;
  brim.rotation.x = Math.PI / 2;
  brim.scale.z = 0.82;

  const bowlWall = new THREE.Mesh(
    new THREE.CylinderGeometry(hatRadius * 0.82, hatRadius * 1.04, hatRadius * 0.42, 48, 1, true),
    flatCapMaterial,
  );
  bowlWall.position.y = hatRadius * 0.25;
  bowlWall.scale.z = 0.86;

  const rolledLip = new THREE.Mesh(new THREE.TorusGeometry(hatRadius * 0.95, hatRadius * 0.055, 12, 48), flatCapMaterial);
  rolledLip.position.y = hatRadius * 0.46;
  rolledLip.rotation.x = Math.PI / 2;
  rolledLip.scale.z = 0.84;

  const inside = new THREE.Mesh(new THREE.CircleGeometry(hatRadius * 0.86, 48), flatCapInsideMaterial);
  inside.position.y = hatRadius * 0.445;
  inside.rotation.x = -Math.PI / 2;
  inside.scale.z = 0.8;

  const outerBowl = new THREE.Mesh(
    new THREE.SphereGeometry(hatRadius * 0.88, 40, 12, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.48),
    flatCapMaterial,
  );
  outerBowl.position.y = hatRadius * 0.22;
  outerBowl.scale.set(1.04, 0.58, 0.82);

  const band = new THREE.Mesh(new THREE.TorusGeometry(hatRadius * 0.98, hatRadius * 0.025, 8, 48), flatCapInsideMaterial);
  band.position.y = hatRadius * 0.15;
  band.rotation.x = Math.PI / 2;
  band.scale.z = 0.84;

  hat.add(brim, bowlWall, rolledLip, inside, outerBowl, band);

  [
    [-0.19, 0.05, 0.12],
    [0.04, -0.08, -0.18],
    [0.2, 0.03, 0.22],
    [-0.02, 0.16, -0.08],
  ].forEach(([coinX, coinZ, rotation], index) => {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(hatRadius * 0.09, hatRadius * 0.09, hatRadius * 0.016, 24), capCoinMaterial);
    coin.position.set(hatRadius * coinX, hatRadius * 0.49 + index * hatRadius * 0.01, hatRadius * coinZ);
    coin.rotation.set(Math.PI / 2 + 0.06 * index, rotation, 0.18 * index);
    coin.castShadow = true;
    coin.receiveShadow = true;
    hat.add(coin);
  });

  hat.children.forEach((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
  });

  return hat;
}

function createPedestalCoinsContent(pedestalWidth, pedestalDepth, pedestalHeight, content = {}) {
  const coins = new THREE.Group();
  const scale = THREE.MathUtils.clamp(Number(content.scale) || 1, 0.55, 1.6);
  const coinRadius = Math.min(pedestalWidth, pedestalDepth) * 0.043 * scale;
  const coinThickness = coinRadius * 0.14;
  const topY = pedestalHeight + coinThickness / 2 + 0.006;
  coins.position.set(
    Number.isFinite(content.offsetX) ? content.offsetX : 0,
    topY,
    Number.isFinite(content.offsetZ) ? content.offsetZ : 0,
  );
  coins.rotation.y = Number.isFinite(content.rotationY) ? content.rotationY : 0;

  const spreadX = Math.max(0.12, pedestalWidth * 0.26);
  const spreadZ = Math.max(0.12, pedestalDepth * 0.26);
  [
    [-0.7, -0.28, 0.18],
    [-0.28, 0.44, -0.42],
    [0.18, -0.08, 0.72],
    [0.66, 0.28, -0.18],
    [0.42, -0.58, 0.36],
    [-0.58, 0.02, -0.82],
    [0.02, 0.72, 0.08],
  ].forEach(([coinX, coinZ, rotation], index) => {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(coinRadius, coinRadius, coinThickness, 32), capCoinMaterial);
    coin.position.set(spreadX * coinX, index * coinThickness * 0.08, spreadZ * coinZ);
    coin.rotation.set(0, rotation, 0);
    coin.castShadow = true;
    coin.receiveShadow = true;
    coins.add(coin);
  });

  return coins;
}

function normalizePedestalStickers(stickers) {
  if (!Array.isArray(stickers)) return [];
  return stickers
    .filter((sticker) => sticker && typeof sticker.imageSrc === 'string' && sticker.imageSrc)
    .map((sticker) => ({
      imageSrc: sticker.imageSrc,
      face: ['front', 'back', 'left', 'right'].includes(sticker.face) ? sticker.face : 'front',
      width: THREE.MathUtils.clamp(Number(sticker.width) || 0.42, 0.08, 1.8),
      height: THREE.MathUtils.clamp(Number(sticker.height) || 0.42, 0.08, 1.8),
      offsetX: Number.isFinite(sticker.offsetX) ? sticker.offsetX : 0,
      offsetY: Number.isFinite(sticker.offsetY) ? sticker.offsetY : 0.55,
    }));
}

function createPedestalStickerContent(pedestalWidth, pedestalDepth, pedestalHeight, pedestalType, sticker) {
  if (!sticker?.imageSrc) return null;
  const stickerWidth = THREE.MathUtils.clamp(Number(sticker.width) || 0.42, 0.08, Math.max(0.08, pedestalWidth * 0.96));
  const stickerHeight = THREE.MathUtils.clamp(Number(sticker.height) || 0.42, 0.08, Math.max(0.08, pedestalHeight * 0.9));
  const material = createMaterialFromImageUrl(sticker.imageSrc);
  material.transparent = true;
  material.depthWrite = false;

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(stickerWidth, stickerHeight), material);
  const usableWidth = pedestalType === 'pillar' ? pedestalWidth * 0.82 : pedestalWidth;
  const usableDepth = pedestalType === 'pillar' ? pedestalDepth * 0.82 : pedestalDepth;
  const maxOffsetX = Math.max(0, usableWidth / 2 - stickerWidth / 2 - 0.01);
  const offsetX = THREE.MathUtils.clamp(Number(sticker.offsetX) || 0, -maxOffsetX, maxOffsetX);
  const offsetY = THREE.MathUtils.clamp(
    Number(sticker.offsetY) || pedestalHeight * 0.52,
    stickerHeight / 2 + 0.03,
    Math.max(stickerHeight / 2 + 0.03, pedestalHeight - stickerHeight / 2 - 0.03),
  );
  const faceOffset = 0.014;
  const face = ['front', 'back', 'left', 'right'].includes(sticker.face) ? sticker.face : 'front';

  if (face === 'back') {
    mesh.position.set(offsetX, offsetY, -usableDepth / 2 - faceOffset);
    mesh.rotation.y = Math.PI;
  } else if (face === 'left') {
    mesh.position.set(-usableWidth / 2 - faceOffset, offsetY, offsetX);
    mesh.rotation.y = -Math.PI / 2;
  } else if (face === 'right') {
    mesh.position.set(usableWidth / 2 + faceOffset, offsetY, offsetX);
    mesh.rotation.y = Math.PI / 2;
  } else {
    mesh.position.set(offsetX, offsetY, usableDepth / 2 + faceOffset);
  }

  mesh.renderOrder = 18;
  mesh.userData.isPedestalSticker = true;
  return mesh;
}

function createFlatCapContent(pedestalWidth, pedestalDepth, pedestalHeight, content = {}) {
  const cap = new THREE.Group();
  const scale = THREE.MathUtils.clamp(Number(content.scale) || 1, 0.55, 1.4);
  const capRadius = Math.min(pedestalWidth, pedestalDepth) * 0.28 * scale;
  const topY = pedestalHeight + 0.026;
  cap.position.set(
    Number.isFinite(content.offsetX) ? content.offsetX : 0,
    topY,
    Number.isFinite(content.offsetZ) ? content.offsetZ : 0,
  );
  cap.rotation.y = Number.isFinite(content.rotationY) ? content.rotationY : 0;

  const side = new THREE.Mesh(
    new THREE.CylinderGeometry(capRadius * 1.08, capRadius * 1.28, capRadius * 0.34, 36, 1, true),
    flatCapMaterial,
  );
  side.position.y = capRadius * 0.16;
  side.scale.z = 0.72;

  const rim = new THREE.Mesh(new THREE.TorusGeometry(capRadius * 1.15, capRadius * 0.075, 10, 44), flatCapMaterial);
  rim.position.y = capRadius * 0.34;
  rim.rotation.x = Math.PI / 2;
  rim.scale.z = 0.72;

  const inside = new THREE.Mesh(new THREE.CircleGeometry(capRadius * 1.02, 36), flatCapInsideMaterial);
  inside.position.y = capRadius * 0.325;
  inside.rotation.x = -Math.PI / 2;
  inside.scale.z = 0.68;

  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(capRadius * 0.92, 32, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
    flatCapMaterial,
  );
  crown.position.set(0, capRadius * 0.32, -capRadius * 0.04);
  crown.scale.set(1.22, 0.18, 0.82);

  const visor = new THREE.Mesh(new THREE.SphereGeometry(capRadius * 0.72, 24, 8), flatCapMaterial);
  visor.position.set(0, capRadius * 0.18, capRadius * 0.82);
  visor.scale.set(0.9, 0.08, 0.28);
  visor.rotation.x = -0.16;

  const button = new THREE.Mesh(new THREE.CylinderGeometry(capRadius * 0.09, capRadius * 0.11, capRadius * 0.035, 18), flatCapMaterial);
  button.position.set(0, capRadius * 0.46, -capRadius * 0.03);

  cap.add(side, rim, inside, crown, visor, button);

  [
    [-0.16, 0.1, 0.1],
    [0.07, -0.02, -0.28],
    [0.2, 0.08, 0.28],
  ].forEach(([coinX, coinZ, rotation], index) => {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(capRadius * 0.105, capRadius * 0.105, capRadius * 0.018, 24), capCoinMaterial);
    coin.position.set(capRadius * coinX, capRadius * 0.36 + index * capRadius * 0.012, capRadius * coinZ);
    coin.rotation.set(Math.PI / 2 + 0.08 * index, rotation, 0.18 * index);
    coin.castShadow = true;
    coin.receiveShadow = true;
    cap.add(coin);
  });

  cap.children.forEach((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
  });

  return cap;
}

function normalizePedestalContent(content) {
  if (!content) return null;
  const stickers = normalizePedestalStickers(content.stickers);
  if (['bowler-hat', 'flat-cap', 'coins'].includes(content.type)) {
    return {
      ...content,
      type: 'coins',
      scale: Number.isFinite(content.scale) ? content.scale : 1.18,
      stickers,
    };
  }
  return {
    ...content,
    stickers,
  };
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
  const resolvedContent = normalizePedestalContent(content);

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

  if (resolvedContent?.type === 'coins') {
    group.add(createPedestalCoinsContent(width, depth, height, resolvedContent));
  }
  normalizePedestalStickers(resolvedContent?.stickers).forEach((sticker) => {
    const stickerMesh = createPedestalStickerContent(width, depth, height, type, sticker);
    if (stickerMesh) group.add(stickerMesh);
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
    content: resolvedContent,
  };
  group.userData.pedestalData = pedestalData;
  group.traverse((child) => {
    child.userData.pedestalData = pedestalData;
  });
  room.add(group);
  displayPedestals.push(pedestalData);
  return pedestalData;
}

const barrierPostMaterial = new THREE.MeshStandardMaterial({
  color: 0xd6b15a,
  roughness: 0.22,
  metalness: 0.78,
});

function createBarrierRopeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#960715';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 5;
  for (let x = -32; x < canvas.width + 32; x += 16) {
    ctx.strokeStyle = 'rgba(80, 0, 8, 0.55)';
    ctx.beginPath();
    ctx.moveTo(x, canvas.height + 4);
    ctx.lineTo(x + 34, -4);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 95, 95, 0.16)';
    ctx.beginPath();
    ctx.moveTo(x + 6, canvas.height + 4);
    ctx.lineTo(x + 40, -4);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(7, 1);
  texture.anisotropy = textureAnisotropy;
  return texture;
}

const barrierRopeTexture = createBarrierRopeTexture();
const barrierRopeMaterial = new THREE.MeshStandardMaterial({
  color: 0x980814,
  map: barrierRopeTexture,
  bumpMap: barrierRopeTexture,
  bumpScale: 0.012,
  roughness: 0.58,
  metalness: 0.02,
});

function addFutureWingBarrier() {
  const group = new THREE.Group();
  group.position.set(-sideRoomStep - roomWidth / 2 - 0.16, 0, roomStep);

  const postPositions = [-0.58, 0, 0.58];
  postPositions.forEach((z) => {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.05, 32), barrierPostMaterial);
    base.position.set(0, 0.025, z);
    base.castShadow = true;
    base.receiveShadow = true;

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.032, 1.05, 24), barrierPostMaterial);
    post.position.set(0, 0.56, z);
    post.castShadow = true;
    post.receiveShadow = true;

    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 16), barrierPostMaterial);
    cap.position.set(0, 1.12, z);
    cap.castShadow = true;
    cap.receiveShadow = true;

    group.add(base, post, cap);
  });

  const attachmentPoints = [-0.58, 0, 0.58];
  attachmentPoints.forEach((z) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.044, 0.007, 8, 28), barrierPostMaterial);
    ring.position.set(0.024, 0.95, z);
    ring.rotation.y = Math.PI / 2;
    ring.castShadow = true;
    ring.receiveShadow = true;

    const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.09, 16), barrierPostMaterial);
    peg.position.set(0.055, 0.95, z);
    peg.rotation.z = Math.PI / 2;
    peg.castShadow = true;
    peg.receiveShadow = true;

    const clasp = new THREE.Mesh(new THREE.SphereGeometry(0.027, 16, 12), barrierPostMaterial);
    clasp.position.set(0.098, 0.95, z);
    clasp.castShadow = true;
    clasp.receiveShadow = true;

    group.add(ring, peg, clasp);
  });

  [[-0.58, 0], [0, 0.58]].forEach(([startZ, endZ]) => {
    const midZ = (startZ + endZ) / 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.1, 0.95, startZ),
      new THREE.Vector3(0.118, 0.72, midZ),
      new THREE.Vector3(0.1, 0.95, endZ),
    ]);
    const rope = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.024, 12, false), barrierRopeMaterial);
    rope.castShadow = true;
    rope.receiveShadow = true;
    group.add(rope);
  });

  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 180;
  const ctx = signCanvas.getContext('2d');
  ctx.fillStyle = '#f7f4ea';
  ctx.fillRect(0, 0, signCanvas.width, signCanvas.height);
  ctx.strokeStyle = '#1b1b1b';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, signCanvas.width - 10, signCanvas.height - 10);
  ctx.fillStyle = '#151515';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 54px Arial, Helvetica, sans-serif';
  ctx.fillText('PŘIPRAVUJEME', signCanvas.width / 2, signCanvas.height / 2);
  const signTexture = new THREE.CanvasTexture(signCanvas);
  signTexture.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.32),
    new THREE.MeshBasicMaterial({ map: signTexture, side: THREE.DoubleSide, toneMapped: false }),
  );
  sign.position.set(-0.025, 1.48, 0);
  sign.rotation.y = Math.PI / 2;
  group.add(sign);

  room.add(group);
}

// Three main rooms plus a side digital-art wing. The second side room stays closed to visitors.
addRectangularRoomWalls(galleryRooms[0]);
addCorridorWalls(roomDepth / 2, roomStep - roomDepth / 2);
addRectangularRoomWalls(galleryRooms[1]);
addCorridorWalls(roomStep + roomDepth / 2, roomStep * 2 - roomDepth / 2);
addRectangularRoomWalls(galleryRooms[2]);
addSideCorridorWalls(-sideRoomStep + roomWidth / 2, -roomWidth / 2, roomStep);
addRectangularRoomWalls(galleryRooms[3]);
addSideCorridorWalls(-sideRoomStep * 2 + roomWidth / 2, -sideRoomStep - roomWidth / 2, roomStep);
addRectangularRoomWalls(galleryRooms[4]);
addFutureWingBarrier();
addCornerSpeakers();

const navigationSpaces = [
  { minX: x0, maxX: x1, minZ: galleryMinZ, maxZ: roomDepth / 2, padZMin: 1, padZMax: 0 },
  { minX: doorLeftX, maxX: doorRightX, minZ: roomDepth / 2, maxZ: roomStep - roomDepth / 2, isConnector: true },
  { minX: x0, maxX: x1, minZ: roomStep - roomDepth / 2, maxZ: roomStep + roomDepth / 2, padZMin: 0, padZMax: 0 },
  { minX: doorLeftX, maxX: doorRightX, minZ: roomStep + roomDepth / 2, maxZ: roomStep * 2 - roomDepth / 2, isConnector: true },
  { minX: x0, maxX: x1, minZ: roomStep * 2 - roomDepth / 2, maxZ: galleryMaxZ, padZMin: 0, padZMax: 1 },
  { minX: -sideRoomStep + roomWidth / 2 - 1, maxX: x0 + 1, minZ: roomStep - doorway.width / 2, maxZ: roomStep + doorway.width / 2, isConnector: true },
  { minX: -sideRoomStep - roomWidth / 2, maxX: -sideRoomStep + roomWidth / 2, minZ: roomStep - roomDepth / 2, maxZ: roomStep + roomDepth / 2, padZMin: 0, padZMax: 0 },
  ...(editorMode ? [
    { minX: -sideRoomStep * 2 + roomWidth / 2 - 1, maxX: -sideRoomStep - roomWidth / 2 + 1, minZ: roomStep - doorway.width / 2, maxZ: roomStep + doorway.width / 2, isConnector: true },
    { minX: -sideRoomStep * 2 - roomWidth / 2, maxX: -sideRoomStep * 2 + roomWidth / 2, minZ: roomStep - roomDepth / 2, maxZ: roomStep + roomDepth / 2, padZMin: 0, padZMax: 0 },
  ] : []),
];

const closedFutureWingBounds = {
  minX: -sideRoomStep * 2 - roomWidth / 2 - 0.5,
  maxX: -sideRoomStep - roomWidth / 2 + 0.12,
  minZ: roomStep - roomDepth / 2 - corridorLength - 0.5,
  maxZ: roomStep + roomDepth / 2 + corridorLength + 0.5,
};

function isInsideClosedFutureWing(position) {
  return !editorMode
    && position.x >= closedFutureWingBounds.minX
    && position.x <= closedFutureWingBounds.maxX
    && position.z >= closedFutureWingBounds.minZ
    && position.z <= closedFutureWingBounds.maxZ;
}

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

function addRoomNavigationLight(centerX, centerZ) {
  const fill = new THREE.PointLight(0x6f8195, 2.8, roomDepth * 1.45, 1.05);
  fill.position.set(centerX, roomHeight * 0.52, centerZ);
  fill.castShadow = false;
  scene.add(fill);
  return fill;
}

const navigationFillLights = galleryRooms.map(({ centerX, centerZ }) => ({
  centerX,
  centerZ,
  light: addRoomNavigationLight(centerX, centerZ),
}));

const roomLightState = {
  enabled: true,
  power: 12,
};
const savedLighting = normalizeLoadedLightingState(useLocalSavedState
  ? loadLightingState() ?? exportedGalleryState?.lighting ?? null
  : exportedGalleryState?.lighting ?? null);
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

function addRoomLightPanel(centerX, centerZ) {
  const panelMaterial = roomLightPanelMaterial.clone();
  panelMaterial.color.set(0x15120d);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.05), panelMaterial);
  panel.position.set(centerX, roomHeight - 0.075, centerZ);
  panel.rotation.x = Math.PI / 2;
  room.add(panel);

  const frame = new THREE.Group();
  frameParts.forEach(({ size, position }) => {
    const framePart = new THREE.Mesh(new THREE.BoxGeometry(...size), roomLightFrameMaterial);
    framePart.position.set(position[0] + centerX, position[1], position[2] + centerZ);
    frame.add(framePart);
  });
  room.add(frame);

  const light = new THREE.PointLight(0xfff4e8, 0, 11, 1.25);
  light.position.set(centerX, roomHeight - 0.28, centerZ);
  scene.add(light);

  return {
    centerX,
    centerZ,
    minX: centerX - roomWidth / 2 - corridorLength,
    maxX: centerX + roomWidth / 2 + corridorLength,
    minZ: centerZ - roomDepth / 2 - corridorLength,
    maxZ: centerZ + roomDepth / 2 + corridorLength,
    panelMaterial,
    light,
    currentPower: 0,
  };
}

const autoRoomLights = galleryRooms.map(({ centerX, centerZ }, index) => {
  if (index === 0) {
    return {
      centerX,
      centerZ,
      minX: centerX - roomWidth / 2 - corridorLength,
      maxX: centerX + roomWidth / 2 + corridorLength,
      minZ: centerZ - roomDepth / 2 - corridorLength,
      maxZ: centerZ + roomDepth / 2 + corridorLength,
      panelMaterial: roomLightPanelMaterial,
      light: roomLight,
      currentPower: 0,
    };
  }
  return addRoomLightPanel(centerX, centerZ);
});
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
  if (document.activeElement === roomLightPublicPowerInput) {
    roomLightPublicPowerInput.blur();
  }
  window.clearTimeout(showRoomLightControl.hideTimer);
  showRoomLightControl.hideTimer = window.setTimeout(() => {
    roomLightControl.classList.remove('visible');
  }, 6000);
}

function adjustRoomLightPowerFromWheel(event) {
  const direction = event.deltaY > 0 ? -1 : 1;
  const step = event.shiftKey ? 1 : 4;
  setRoomLightPower(roomLightState.power + direction * step);
  showRoomLightControl();
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
  'inner-a-back': { id: 'inner-a-back', axis: 'x', fixedAxis: 'z', fixed: -roomDepth / 2 + 2.45, min: -roomWidth / 2 + 1.2, max: roomWidth / 2 - 1.2, custom: true },
  'inner-a-front': { id: 'inner-a-front', axis: 'x', fixedAxis: 'z', fixed: roomDepth / 2 - 2.45, min: -roomWidth / 2 + 1.2, max: roomWidth / 2 - 1.2, custom: true },
  'inner-a-left': { id: 'inner-a-left', axis: 'z', fixedAxis: 'x', fixed: -roomWidth / 2 + 1.55, min: -roomDepth / 2 + 1.7, max: roomDepth / 2 - 1.7, custom: true },
  'inner-a-right': { id: 'inner-a-right', axis: 'z', fixedAxis: 'x', fixed: roomWidth / 2 - 1.55, min: -roomDepth / 2 + 1.7, max: roomDepth / 2 - 1.7, custom: true },
  'inner-b-back': { id: 'inner-b-back', axis: 'x', fixedAxis: 'z', fixed: -roomDepth / 2 + 3.55, min: -roomWidth / 2 + 2.0, max: roomWidth / 2 - 2.0, custom: true },
  'inner-b-front': { id: 'inner-b-front', axis: 'x', fixedAxis: 'z', fixed: roomDepth / 2 - 3.55, min: -roomWidth / 2 + 2.0, max: roomWidth / 2 - 2.0, custom: true },
  'inner-b-left': { id: 'inner-b-left', axis: 'z', fixedAxis: 'x', fixed: -roomWidth / 2 + 2.45, min: -roomDepth / 2 + 2.85, max: roomDepth / 2 - 2.85, custom: true },
  'inner-b-right': { id: 'inner-b-right', axis: 'z', fixedAxis: 'x', fixed: roomWidth / 2 - 2.45, min: -roomDepth / 2 + 2.85, max: roomDepth / 2 - 2.85, custom: true },
};

function getTrackPosition(trackId, trackPosition, roomIndex = 0) {
  const spec = trackSpecs[trackId] ?? trackSpecs.back;
  const centerX = galleryRooms[roomIndex]?.centerX ?? 0;
  const centerZ = galleryRooms[roomIndex]?.centerZ ?? 0;
  const t = THREE.MathUtils.clamp(trackPosition, 0, 1);
  const along = THREE.MathUtils.lerp(spec.min, spec.max, t);
  return new THREE.Vector3(
    spec.axis === 'x' ? centerX + along : centerX + spec.fixed,
    roomHeight - 0.14,
    spec.axis === 'z' ? centerZ + along : centerZ + spec.fixed,
  );
}

function getTrackPositionRatio(trackId, position, roomIndex = 0) {
  const spec = trackSpecs[trackId] ?? trackSpecs.back;
  const centerX = galleryRooms[roomIndex]?.centerX ?? 0;
  const centerZ = galleryRooms[roomIndex]?.centerZ ?? 0;
  const along = spec.axis === 'x' ? position.x - centerX : position.z - centerZ;
  return THREE.MathUtils.clamp((along - spec.min) / (spec.max - spec.min), 0, 1);
}

function chooseTrackForTarget(targetPoint) {
  const roomIndex = getRoomIndexForPosition(targetPoint.x, targetPoint.z);
  const centerX = galleryRooms[roomIndex]?.centerX ?? 0;
  const centerZ = galleryRooms[roomIndex]?.centerZ ?? 0;
  const distances = [
    { id: 'back', distance: Math.abs(targetPoint.z - (centerZ - roomDepth / 2)) },
    { id: 'front', distance: Math.abs(targetPoint.z - (centerZ + roomDepth / 2)) },
    { id: 'left', distance: Math.abs(targetPoint.x - (centerX - roomWidth / 2)) },
    { id: 'right', distance: Math.abs(targetPoint.x - (centerX + roomWidth / 2)) },
  ];
  distances.sort((a, b) => a.distance - b.distance);
  return distances[0].id;
}

function scoreTrackForTarget(spec, targetPoint, centerX, centerZ) {
  const along = spec.axis === 'x' ? targetPoint.x - centerX : targetPoint.z - centerZ;
  const fixedDistance = spec.axis === 'x'
    ? Math.abs(targetPoint.z - (centerZ + spec.fixed))
    : Math.abs(targetPoint.x - (centerX + spec.fixed));
  const alongDistance = Math.abs(along - THREE.MathUtils.clamp(along, spec.min, spec.max));
  return fixedDistance ** 2 + alongDistance ** 2;
}

function chooseCustomTrackForTarget(targetPoint) {
  const roomIndex = getRoomIndexForPosition(targetPoint.x, targetPoint.z);
  const centerX = galleryRooms[roomIndex]?.centerX ?? 0;
  const centerZ = galleryRooms[roomIndex]?.centerZ ?? 0;
  const customTracks = Object.values(trackSpecs).filter((spec) => spec.custom);
  customTracks.sort((first, second) => (
    scoreTrackForTarget(first, targetPoint, centerX, centerZ)
    - scoreTrackForTarget(second, targetPoint, centerX, centerZ)
  ));
  return customTracks[0]?.id ?? chooseTrackForTarget(targetPoint);
}

function getRoomIndexForPosition(x, z) {
  let bestIndex = 0;
  let bestDistance = Infinity;
  galleryRooms.forEach((galleryRoom, index) => {
    const distance = (x - galleryRoom.centerX) ** 2 + (z - galleryRoom.centerZ) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function getRoomIndexForZ(z) {
  return getRoomIndexForPosition(0, z);
}

function createTrack(spec, centerX = 0, centerZ = 0) {
  const length = spec.max - spec.min;
  const geometry = spec.axis === 'x'
    ? new THREE.BoxGeometry(length, 0.035, 0.08)
    : new THREE.BoxGeometry(0.08, 0.035, length);
  const mesh = new THREE.Mesh(geometry, trackMaterial);
  const center = (spec.min + spec.max) / 2;
  mesh.position.set(
    spec.axis === 'x' ? centerX + center : centerX + spec.fixed,
    trackHeight,
    spec.axis === 'z' ? centerZ + center : centerZ + spec.fixed,
  );
  room.add(mesh);
}

galleryRooms.forEach(({ centerX, centerZ }) => {
  Object.values(trackSpecs).forEach((spec) => createTrack(spec, centerX, centerZ));
});

const ceilingLights = [];
let selectedLightIndex = 0;
let spotShadowSetupDirty = true;
let spotShadowRoomIndex = null;
let movingSelectedLight = false;
let aimingSelectedLight = false;
let aimingLightStartPosition = null;
let aimingLightOriginalDirection = null;
const maxLightAimDistance = 3;

function getLightKind(lightData) {
  return lightData?.kind === 'display' ? 'display' : 'painting';
}

function getSelectedLight() {
  return ceilingLights[selectedLightIndex] ?? null;
}

function getLightKindLabel(kind) {
  return kind === 'display' ? 'Vnitřní bodovka' : 'Světlo obrazu';
}

function getLightPitchRange(kind) {
  return kind === 'display'
    ? { min: -88, max: -4 }
    : { min: -86, max: -18 };
}

function clampLightPitch(kind, pitchValue) {
  const range = getLightPitchRange(kind);
  return THREE.MathUtils.clamp(pitchValue, range.min, range.max);
}

function getLightKindOrdinal(lightData) {
  const kind = getLightKind(lightData);
  const sameKindLights = ceilingLights.filter((otherLight) => getLightKind(otherLight) === kind);
  return {
    index: sameKindLights.indexOf(lightData) + 1,
    total: sameKindLights.length,
  };
}

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
  lightData.fixture.scale.setScalar(getLightKind(lightData) === 'display' ? 0.78 : 1);
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
  ceilingLights.forEach((lightData) => {
    const label = lightData.fixture.userData.numberLabel;
    if (!label) return;
    const kind = getLightKind(lightData);
    const { index } = getLightKindOrdinal(lightData);
    label.visible = labelsVisible;
    updateLightNumberLabel(label, `${kind === 'display' ? 'V' : 'O'}${index}`, lightData === ceilingLights[selectedLightIndex]);
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

function createDisplayFixture() {
  const fixture = new THREE.Group();

  const ceilingPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.026, 28), fixtureTrimMaterial);
  ceilingPlate.position.y = 0.01;

  const firstJoint = new THREE.Mesh(new THREE.SphereGeometry(0.045, 18, 10), fixtureTrimMaterial);
  firstJoint.position.y = -0.04;

  const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.18, 14), fixtureTrimMaterial);
  upperArm.position.y = -0.13;

  const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.04, 18, 10), fixtureTrimMaterial);
  elbow.position.set(0.055, -0.22, 0);

  const lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.18, 14), fixtureTrimMaterial);
  lowerArm.position.set(0.09, -0.3, 0);
  lowerArm.rotation.z = -0.42;

  const headJoint = new THREE.Mesh(new THREE.SphereGeometry(0.04, 18, 10), fixtureTrimMaterial);
  headJoint.position.set(0.125, -0.39, 0);

  const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.098, 0.2, 28), fixtureMaterial);
  bodyMesh.position.set(0.13, -0.51, 0);

  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.074, 0.012, 28), lensMaterial);
  lens.position.set(0.13, -0.62, 0);

  const selectionRing = new THREE.Mesh(new THREE.TorusGeometry(0.092, 0.006, 8, 32), selectedRingMaterial);
  selectionRing.rotation.x = Math.PI / 2;
  selectionRing.position.set(0.13, -0.628, 0);
  selectionRing.userData.selectionRing = true;

  const numberLabel = createLightNumberLabel();
  numberLabel.position.set(0.22, -0.2, 0);
  fixture.userData.numberLabel = numberLabel;

  fixture.add(ceilingPlate, firstJoint, upperArm, elbow, lowerArm, headJoint, bodyMesh, lens, selectionRing, numberLabel);
  return fixture;
}

function addCeilingLight({ position, targetPoint, trackId = 'back', trackPosition, yaw = 180, pitch = -38, power = 100, color = '#fff4e8', angle = 30, roomIndex, kind = 'painting', select = true }) {
  const resolvedKind = kind === 'display' ? 'display' : 'painting';
  const roomPoint = targetPoint ?? position ?? new THREE.Vector3();
  const resolvedRoomIndex = roomIndex ?? getRoomIndexForPosition(roomPoint.x ?? 0, roomPoint.z ?? 0);
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
  const fixture = resolvedKind === 'display' ? createDisplayFixture() : createFixture();
  const lightData = {
    position: resolvedPosition,
    trackId,
    trackPosition: resolvedTrackPosition,
    yaw: THREE.MathUtils.clamp(angles.yaw, -180, 180),
    pitch: clampLightPitch(resolvedKind, angles.pitch),
    power,
    color,
    angle,
    kind: resolvedKind,
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
    moveLightButton.disabled = true;
    aimLightButton.disabled = true;
    return;
  }

  selectedLightIndex = THREE.MathUtils.clamp(selectedLightIndex, 0, ceilingLights.length - 1);
  const current = ceilingLights[selectedLightIndex];
  const kind = getLightKind(current);
  const { index, total } = getLightKindOrdinal(current);
  lightTitle.textContent = `${getLightKindLabel(kind)} ${index}/${total}`;
  moveLightButton.textContent = movingSelectedLight ? 'Uchytit pozici' : 'Přesunout světlo';
  aimLightButton.textContent = aimingSelectedLight ? 'Uchytit směr' : 'Nastavit směr';
  const pitchRange = getLightPitchRange(kind);
  lightPitchInput.min = String(pitchRange.min);
  lightPitchInput.max = String(pitchRange.max);
  lightTrackPositionInput.value = String(current.trackPosition);
  lightYawInput.value = String(Math.round(current.yaw));
  lightPitchInput.value = String(Math.round(current.pitch));
  lightPowerInput.value = String(Math.round(current.power));
  lightColorInput.value = current.color ?? '#fff4e8';
  lightAngleInput.value = String(Math.round(current.angle ?? 30));
  removeLightButton.disabled = ceilingLights.length <= 1;
  moveLightButton.disabled = false;
  aimLightButton.disabled = false;
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
      kind: getLightKind(lightData),
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

function normalizeLoadedLightingState(lighting) {
  if (!lighting || !Array.isArray(lighting.ceilingLights)) return lighting ?? null;
  const normalized = {
    ...lighting,
    ceilingLights: lighting.ceilingLights.map((lightData) => ({
      ...lightData,
      kind: lightData.kind === 'display' ? 'display' : 'painting',
    })),
  };
  normalized.ceilingLights = normalized.ceilingLights.filter((lightData, index, allLights) => {
    if (lightData.kind !== 'display') return true;
    return !allLights.some((otherLight, otherIndex) => (
      otherIndex !== index
      && otherLight.kind === 'painting'
      && otherLight.roomIndex === lightData.roomIndex
      && otherLight.trackId === lightData.trackId
      && Math.abs((otherLight.trackPosition ?? 0) - (lightData.trackPosition ?? 0)) < 0.012
      && Math.abs((otherLight.yaw ?? 0) - (lightData.yaw ?? 0)) < 2
      && Math.abs((otherLight.pitch ?? 0) - (lightData.pitch ?? 0)) < 2
    ));
  });
  normalized.selectedLightIndex = Number.isInteger(normalized.selectedLightIndex)
    ? Math.min(normalized.selectedLightIndex, Math.max(0, normalized.ceilingLights.length - 1))
    : 0;
  return normalized;
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
      labelVisible: paintingData.labelVisible !== false,
      actionUrl: paintingData.actionUrl ?? '',
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
    textPanels: displayTextPanels.map((textPanelData) => ({
      x: Number(textPanelData.group.position.x.toFixed(4)),
      y: Number(textPanelData.group.position.y.toFixed(4)),
      z: Number(textPanelData.group.position.z.toFixed(4)),
      ry: Number(textPanelData.group.rotation.y.toFixed(6)),
      width: Number(textPanelData.width.toFixed(4)),
      height: Number(textPanelData.height.toFixed(4)),
      text: textPanelData.text ?? '',
      bgColor: textPanelData.bgColor ?? '#f7f4ea',
      textColor: textPanelData.textColor ?? '#111315',
      kind: getTextPanelKind(textPanelData.kind),
      fontSize: Number((textPanelData.fontSize ?? 50).toFixed(2)),
      fontWeight: Number((textPanelData.fontWeight ?? 850).toFixed(0)),
      textAlign: textPanelData.textAlign ?? 'center',
      wallNormal: textPanelData.wallNormal?.toArray().map((value) => Number(value.toFixed(4))) ?? null,
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
  label.visible = paintingData.labelVisible !== false;
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
  const titleSize = fitLabelText(ctx, title, maxTextWidth, 56, 36, 900);
  ctx.font = `900 ${titleSize}px Arial, Helvetica, sans-serif`;
  ctx.fillText(title, paddingX, 48);

  ctx.fillStyle = '#101214';
  details.forEach((line, index) => {
    const lineSize = fitLabelText(ctx, line, maxTextWidth, 47, 33, 900);
    ctx.font = `900 ${lineSize}px Arial, Helvetica, sans-serif`;
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

function getTextPanelCanvasSize(width, height) {
  const panelRatio = THREE.MathUtils.clamp(width / Math.max(height, 0.01), 0.25, 4);
  const longSide = 1280;
  const minShortSide = 360;
  let canvasWidth;
  let canvasHeight;

  if (panelRatio >= 1) {
    canvasWidth = longSide;
    canvasHeight = Math.round(canvasWidth / panelRatio);
    if (canvasHeight < minShortSide) {
      canvasHeight = minShortSide;
      canvasWidth = Math.round(canvasHeight * panelRatio);
    }
  } else {
    canvasHeight = longSide;
    canvasWidth = Math.round(canvasHeight * panelRatio);
    if (canvasWidth < minShortSide) {
      canvasWidth = minShortSide;
      canvasHeight = Math.round(canvasWidth / panelRatio);
    }
  }

  return {
    width: canvasWidth,
    height: canvasHeight,
  };
}

function syncTextPanelCanvasSize(textPanelData, labelCanvas) {
  const { width, height } = getTextPanelCanvasSize(textPanelData.width, textPanelData.height);
  if (labelCanvas.width === width && labelCanvas.height === height) return;
  labelCanvas.width = width;
  labelCanvas.height = height;
}

function wrapCanvasText(ctx, text, maxWidth) {
  const wrapped = [];
  const paragraphs = String(text || '').split(/\r?\n/);
  paragraphs.forEach((paragraph) => {
    if (paragraph.length === 0) {
      wrapped.push('');
      return;
    }

    const tokens = paragraph.replace(/\t/g, '    ').match(/[^ \t]+|[ \t]+/g) ?? [];
    let line = '';

    tokens.forEach((token) => {
      const candidate = `${line}${token}`;
      const isWhitespace = /^[ \t]+$/.test(token);
      if (ctx.measureText(candidate).width <= maxWidth || line.length === 0) {
        line = candidate;
        return;
      }

      if (isWhitespace) {
        wrapped.push(line.replace(/[ \t]+$/g, ''));
        line = '';
        return;
      }

      wrapped.push(line.replace(/[ \t]+$/g, ''));
      line = token.replace(/^[ \t]+/g, '');
    });

    wrapped.push(line.replace(/[ \t]+$/g, ''));
  });
  return wrapped;
}

function getTextPanelKind(kind) {
  return kind === 'donors' ? 'donors' : 'plain';
}

function isDonorBoardPlaceholder(text) {
  return /^tady bude tabule d[áa]rc[ůu]?$/i.test(String(text || '').trim());
}

function getDefaultDonorBoardText() {
  return [
    'Tady bude tabule dárců',
    '',
    'Jméno podporovatele | 500 Kč',
  ].join('\n');
}

function parseDonorBoardRows(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !isDonorBoardPlaceholder(line))
    .map((line) => {
      const parts = line.split(/\s*[|;]\s*/);
      if (parts.length >= 2) {
        return {
          name: parts.slice(0, -1).join(' | ').trim(),
          amount: parts.at(-1).trim(),
        };
      }

      const match = line.match(/^(.+?)\s{2,}(.+)$/) ?? line.match(/^(.+?)\s[-–—]\s(.+)$/);
      if (!match) return null;
      return {
        name: match[1].trim(),
        amount: match[2].trim(),
      };
    })
    .filter((row) => row?.name && row?.amount);
}

function fitCanvasText(ctx, text, maxWidth, maxSize, minSize, weight = 800, family = 'Arial, Helvetica, sans-serif') {
  let size = maxSize;
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth || size <= minSize) return size;
    size -= 2;
  } while (size >= minSize);
  return minSize;
}

function drawFittedCanvasText(ctx, text, x, y, maxWidth, size, minSize, weight, align = 'left') {
  const resolvedSize = fitCanvasText(ctx, text, maxWidth, size, minSize, weight);
  ctx.font = `${weight} ${resolvedSize}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  return resolvedSize;
}

function drawDonorBoardPanel(ctx, labelCanvas, textPanelData) {
  const bgColor = textPanelData.bgColor || '#f7f4ea';
  const textColor = textPanelData.textColor || '#111315';
  const rows = parseDonorBoardRows(textPanelData.text);
  const paddingX = Math.max(58, labelCanvas.width * 0.075);
  const paddingY = Math.max(58, labelCanvas.height * 0.065);
  const innerX = paddingX;
  const innerY = paddingY;
  const innerWidth = labelCanvas.width - paddingX * 2;
  const innerHeight = labelCanvas.height - paddingY * 2;
  const accentColor = '#b8873a';

  ctx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.fillRect(0, 0, labelCanvas.width, Math.round(labelCanvas.height * 0.16));

  ctx.strokeStyle = 'rgba(18, 15, 12, 0.42)';
  ctx.lineWidth = Math.max(8, labelCanvas.width * 0.012);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, labelCanvas.width - ctx.lineWidth, labelCanvas.height - ctx.lineWidth);
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = Math.max(3, labelCanvas.width * 0.004);
  ctx.strokeRect(innerX * 0.62, innerY * 0.62, labelCanvas.width - innerX * 1.24, labelCanvas.height - innerY * 1.24);

  const titleSize = Math.min(92, Math.max(48, labelCanvas.height * 0.09));
  ctx.fillStyle = textColor;
  ctx.textBaseline = 'top';
  drawFittedCanvasText(ctx, 'TABULE DÁRCŮ', labelCanvas.width / 2, innerY, innerWidth, titleSize, 32, 1000, 'center');

  const subtitleY = innerY + titleSize * 1.08;
  ctx.fillStyle = 'rgba(17, 19, 21, 0.72)';
  drawFittedCanvasText(
    ctx,
    'Na tabuli uvádím podporovatele od 500 Kč. Děkuji všem, kdo pomáhají galerii růst.',
    labelCanvas.width / 2,
    subtitleY,
    innerWidth,
    Math.min(40, Math.max(24, labelCanvas.height * 0.038)),
    18,
    800,
    'center',
  );

  const tableTop = subtitleY + Math.max(72, labelCanvas.height * 0.105);
  const headerHeight = Math.max(44, labelCanvas.height * 0.055);
  const rowAreaHeight = innerY + innerHeight - tableTop - headerHeight - Math.max(20, labelCanvas.height * 0.025);
  const rowHeight = Math.max(28, Math.min(52, rowAreaHeight / Math.max(rows.length || 1, 8)));
  const maxRows = Math.max(1, Math.floor(rowAreaHeight / rowHeight));
  const visibleRows = rows.slice(0, maxRows);
  const amountColumnWidth = innerWidth * 0.31;
  const nameX = innerX + 22;
  const amountX = innerX + innerWidth - 22;

  ctx.fillStyle = 'rgba(20, 18, 14, 0.12)';
  ctx.fillRect(innerX, tableTop, innerWidth, headerHeight);
  ctx.strokeStyle = 'rgba(20, 18, 14, 0.2)';
  ctx.lineWidth = 2;
  ctx.strokeRect(innerX, tableTop, innerWidth, headerHeight + rowHeight * Math.max(visibleRows.length, 1));
  ctx.beginPath();
  ctx.moveTo(innerX + innerWidth - amountColumnWidth, tableTop);
  ctx.lineTo(innerX + innerWidth - amountColumnWidth, tableTop + headerHeight + rowHeight * Math.max(visibleRows.length, 1));
  ctx.stroke();

  ctx.fillStyle = textColor;
  const headerFontSize = Math.min(34, Math.max(22, headerHeight * 0.48));
  ctx.font = `950 ${headerFontSize}px Arial, Helvetica, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('Jméno', nameX, tableTop + headerHeight / 2);
  ctx.textAlign = 'right';
  ctx.fillText('Podpora', amountX, tableTop + headerHeight / 2);

  if (!visibleRows.length) {
    ctx.fillStyle = 'rgba(17, 19, 21, 0.66)';
    ctx.textAlign = 'center';
    ctx.font = `800 ${Math.min(42, Math.max(24, rowHeight * 0.72))}px Arial, Helvetica, sans-serif`;
    ctx.fillText('Tady bude tabule dárců', labelCanvas.width / 2, tableTop + headerHeight + rowHeight / 2);
  }

  visibleRows.forEach((row, index) => {
    const rowTop = tableTop + headerHeight + index * rowHeight;
    if (index % 2 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.13)';
      ctx.fillRect(innerX, rowTop, innerWidth, rowHeight);
    }
    ctx.strokeStyle = 'rgba(20, 18, 14, 0.13)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(innerX, rowTop + rowHeight);
    ctx.lineTo(innerX + innerWidth, rowTop + rowHeight);
    ctx.stroke();

    const rowFontSize = Math.min(34, Math.max(20, rowHeight * 0.46));
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'middle';
    drawFittedCanvasText(ctx, row.name, nameX, rowTop + rowHeight / 2, innerWidth - amountColumnWidth - 42, rowFontSize, 16, 850, 'left');
    drawFittedCanvasText(ctx, row.amount, amountX, rowTop + rowHeight / 2, amountColumnWidth - 42, rowFontSize, 16, 900, 'right');
  });
}

function redrawTextPanel(textPanelData) {
  if (!textPanelData?.panel) return;
  const { canvas: labelCanvas, texture } = textPanelData.panel.userData;
  syncTextPanelCanvasSize(textPanelData, labelCanvas);
  const ctx = labelCanvas.getContext('2d');
  if (getTextPanelKind(textPanelData.kind) === 'donors') {
    drawDonorBoardPanel(ctx, labelCanvas, textPanelData);
    texture.needsUpdate = true;
    return;
  }

  const rawText = String(textPanelData.text ?? '');
  const text = rawText.trim().length ? rawText : 'Textová tabulka';
  const bgColor = textPanelData.bgColor || '#f7f4ea';
  const textColor = textPanelData.textColor || '#111315';
  const fontSize = THREE.MathUtils.clamp(Number(textPanelData.fontSize ?? 58), 24, 136);
  const fontWeight = THREE.MathUtils.clamp(Number(textPanelData.fontWeight ?? 850), 500, 1000);
  const textAlign = ['left', 'center', 'right'].includes(textPanelData.textAlign) ? textPanelData.textAlign : 'center';
  const paddingX = Math.max(34, labelCanvas.width * 0.055);
  const paddingY = Math.max(34, labelCanvas.height * 0.085);
  const maxTextWidth = labelCanvas.width - paddingX * 2;
  const maxTextHeight = labelCanvas.height - paddingY * 2;
  let resolvedFontSize = fontSize;
  let lines = [];

  do {
    ctx.font = `${fontWeight} ${resolvedFontSize}px Arial, Helvetica, sans-serif`;
    lines = wrapCanvasText(ctx, text, maxTextWidth);
    const lineHeight = resolvedFontSize * 1.28;
    const textHeight = lines.length * lineHeight;
    const widestLine = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0);
    if ((textHeight <= maxTextHeight && widestLine <= maxTextWidth) || resolvedFontSize <= 14) break;
    resolvedFontSize -= 2;
  } while (resolvedFontSize >= 14);

  ctx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
  ctx.strokeStyle = 'rgba(20, 20, 18, 0.24)';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, labelCanvas.width - 12, labelCanvas.height - 12);

  ctx.fillStyle = textColor;
  ctx.textBaseline = 'top';
  ctx.textAlign = textAlign;
  ctx.font = `${fontWeight} ${resolvedFontSize}px Arial, Helvetica, sans-serif`;
  const lineHeight = resolvedFontSize * 1.28;
  const startY = Math.max(paddingY, (labelCanvas.height - lines.length * lineHeight) / 2);
  const textX = textAlign === 'left'
    ? paddingX
    : textAlign === 'right'
      ? labelCanvas.width - paddingX
      : labelCanvas.width / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, textX, startY + index * lineHeight);
  });

  texture.needsUpdate = true;
}

function updateTextPanelGeometry(textPanelData) {
  if (!textPanelData?.panel) return;
  textPanelData.panel.geometry.dispose();
  textPanelData.panel.geometry = new THREE.PlaneGeometry(textPanelData.width, textPanelData.height);

  const thickness = 0.012;
  const depth = 0.012;
  const selectionWidth = textPanelData.width + thickness * 2;
  const selectionHeight = textPanelData.height + thickness * 2;
  const [top, bottom, left, right] = textPanelData.selection.children;
  top.geometry.dispose();
  top.geometry = new THREE.BoxGeometry(selectionWidth, thickness, depth);
  top.position.set(0, selectionHeight / 2, 0.018);
  bottom.geometry.dispose();
  bottom.geometry = new THREE.BoxGeometry(selectionWidth, thickness, depth);
  bottom.position.set(0, -selectionHeight / 2, 0.018);
  left.geometry.dispose();
  left.geometry = new THREE.BoxGeometry(thickness, selectionHeight, depth);
  left.position.set(-selectionWidth / 2, 0, 0.018);
  right.geometry.dispose();
  right.geometry = new THREE.BoxGeometry(thickness, selectionHeight, depth);
  right.position.set(selectionWidth / 2, 0, 0.018);
}

function createTextPanel({
  x = 0,
  y = 1.7,
  z = roomDepth / 2 - 0.06,
  ry = Math.PI,
  width = 1.2,
  height = 0.38,
  text = 'Textová tabulka',
  bgColor = '#f7f4ea',
  textColor = '#111315',
  kind = 'plain',
  fontSize = 58,
  fontWeight = 850,
  textAlign = 'center',
  wallNormal = null,
} = {}) {
  const labelCanvas = document.createElement('canvas');
  const canvasSize = getTextPanelCanvasSize(width, height);
  labelCanvas.width = canvasSize.width;
  labelCanvas.height = canvasSize.height;
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

  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = ry;
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  panel.renderOrder = 10;
  panel.userData.canvas = labelCanvas;
  panel.userData.texture = texture;
  group.add(panel);

  const selection = new THREE.Group();
  const selectionTop = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), selectedPaintingMaterial);
  const selectionBottom = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), selectedPaintingMaterial);
  const selectionLeft = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), selectedPaintingMaterial);
  const selectionRight = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), selectedPaintingMaterial);
  selection.add(selectionTop, selectionBottom, selectionLeft, selectionRight);
  selection.visible = false;
  selection.renderOrder = 12;
  group.add(selection);

  const textPanelData = {
    group,
    panel,
    selection,
    width,
    height,
    text,
    bgColor,
    textColor,
    kind: getTextPanelKind(kind),
    fontSize,
    fontWeight,
    textAlign,
    wallNormal,
  };
  updateTextPanelGeometry(textPanelData);
  redrawTextPanel(textPanelData);
  group.userData.textPanelData = textPanelData;
  group.traverse((child) => {
    child.userData.textPanelData = textPanelData;
  });
  room.add(group);
  displayTextPanels.push(textPanelData);
  return textPanelData;
}

function isValidArtworkConfig(config) {
  if (!config) return false;
  const finiteNumbers = ['x', 'y', 'z', 'ry', 'w', 'h'].every((key) => Number.isFinite(config[key]));
  if (!finiteNumbers) return false;
  const withinGallery = config.x >= galleryMinX - 0.2
    && config.x <= galleryMaxX + 0.2
    && config.z >= galleryMinZ - 0.2
    && config.z <= galleryMaxZ + 0.2;
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
    x: THREE.MathUtils.clamp(Number.isFinite(config.x) ? config.x : fallbackArtwork.x ?? 0, galleryMinX + 0.08, galleryMaxX - 0.08),
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
    labelVisible: config.labelVisible !== false,
    actionUrl: config.actionUrl ?? '',
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
const displayTextPanels = [];
let selectedPainting = null;
let selectedPedestal = null;
let selectedTextPanel = null;
let pendingArtMaterial = null;
let pendingArtSource = '';
let pendingArtAspect = defaultArtworkAspect;
let hoveredEditable = null;
let movingSelectedPainting = false;
let movingSelectedPedestal = false;
let movingSelectedTextPanel = false;
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
  labelVisible = true,
  actionUrl = '',
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
    labelVisible: labelVisible !== false,
    actionUrl,
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
      if (getLightKind(lightData) !== 'painting') return;
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
  const totalPaintings = savedPaintings.length ? savedPaintings.length : oilArtworks.length;

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
      x: THREE.MathUtils.clamp(config.x, galleryMinX + 0.35, galleryMaxX - 0.35),
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

function isValidTextPanelConfig(config) {
  return config
    && Number.isFinite(config.x)
    && Number.isFinite(config.y)
    && Number.isFinite(config.z)
    && Number.isFinite(config.ry)
    && Number.isFinite(config.width)
    && Number.isFinite(config.height)
    && config.width > 0.15
    && config.height > 0.08;
}

function addSavedTextPanels() {
  const savedTextPanels = Array.isArray(savedGallery?.textPanels) ? savedGallery.textPanels : [];
  savedTextPanels.filter(isValidTextPanelConfig).forEach((config) => {
    createTextPanel({
      x: THREE.MathUtils.clamp(config.x, galleryMinX + 0.08, galleryMaxX - 0.08),
      y: THREE.MathUtils.clamp(config.y, 0.45, roomHeight - 0.28),
      z: THREE.MathUtils.clamp(config.z, galleryMinZ + 0.08, galleryMaxZ - 0.08),
      ry: config.ry,
      width: THREE.MathUtils.clamp(config.width, 0.2, 3),
      height: THREE.MathUtils.clamp(config.height, 0.12, 2.5),
      text: typeof config.text === 'string' ? config.text : 'Textová tabulka',
      bgColor: typeof config.bgColor === 'string' ? config.bgColor : '#f7f4ea',
      textColor: typeof config.textColor === 'string' ? config.textColor : '#111315',
      kind: getTextPanelKind(config.kind),
      fontSize: Number.isFinite(config.fontSize) ? config.fontSize : 58,
      fontWeight: Number.isFinite(config.fontWeight) ? config.fontWeight : 850,
      textAlign: ['left', 'center', 'right'].includes(config.textAlign) ? config.textAlign : 'center',
      wallNormal: Array.isArray(config.wallNormal) && config.wallNormal.length === 3
        ? new THREE.Vector3(...config.wallNormal)
        : null,
    });
  });
}

addSavedTextPanels();

function getCenterRaycaster() {
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  return raycaster;
}

function rememberCanvasPointer(event) {
  const rect = canvas.getBoundingClientRect();
  const inside = event.clientX >= rect.left
    && event.clientX <= rect.right
    && event.clientY >= rect.top
    && event.clientY <= rect.bottom;
  if (inside) {
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    hasCanvasPointer = true;
  }
  return inside;
}

function getPointerRaycaster() {
  if (!hasCanvasPointer) return null;
  const rect = canvas.getBoundingClientRect();
  if (lastMouseX < rect.left || lastMouseX > rect.right || lastMouseY < rect.top || lastMouseY > rect.bottom) {
    return null;
  }
  pointer.x = ((lastMouseX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((lastMouseY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  return raycaster;
}

function getPlacementRaycaster(usePointer = false) {
  return (usePointer && getPointerRaycaster()) || getCenterRaycaster();
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

function getWallPlacement({ usePointer = false } = {}) {
  getPlacementRaycaster(usePointer);
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
  if (((onBackWall && roomLayout.hasBackDoor) || (onFrontWall && roomLayout.hasFrontDoor)) && Math.abs(hit.point.x - roomLayout.centerX) < doorClearance) {
    return null;
  }

  const centerY = artFreeModeInput.checked
    ? clampArtworkCenterY(height, hit.point.y)
    : Number(artHeightInput.value);
  const offset = artFreeModeInput.checked ? 0 : Number(artOffsetXInput.value);
  const point = hit.point.clone();

  if (axis === 'x') {
    point.x += offset;
  } else {
    point.z += offset;
  }
  point.y = clampArtworkCenterY(height, centerY);
  point.addScaledVector(normal, 0.065);

  let ry = 0;
  if (Math.abs(normal.x) > Math.abs(normal.z)) {
    ry = normal.x > 0 ? Math.PI / 2 : -Math.PI / 2;
  } else {
    ry = normal.z > 0 ? 0 : Math.PI;
  }

  return { point, normal, ry, width, height, axis, aspect };
}

function getTextPanelPlacement({ usePointer = false } = {}) {
  getPlacementRaycaster(usePointer);
  const hit = raycaster.intersectObjects(wallMeshes, false)[0];
  if (!hit) return null;

  const cameraPosition = new THREE.Vector3();
  camera.getWorldPosition(cameraPosition);
  const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
  if (normal.dot(cameraPosition.clone().sub(hit.point)) < 0) {
    normal.negate();
  }

  const { width, height } = getTextPanelSizeFromInputs();
  const point = hit.point.clone();
  point.y = THREE.MathUtils.clamp(point.y, 0.55 + height / 2, roomHeight - 0.24 - height / 2);
  point.addScaledVector(normal, 0.071);

  let ry = 0;
  if (Math.abs(normal.x) > Math.abs(normal.z)) {
    ry = normal.x > 0 ? Math.PI / 2 : -Math.PI / 2;
  } else {
    ry = normal.z > 0 ? 0 : Math.PI;
  }

  return { point, normal, ry, width, height };
}

function syncArtPreview() {
  if (!artPanel.classList.contains('visible') || (selectedPainting && !movingSelectedPainting && !pendingArtMaterial)) {
    artPreview.visible = false;
    return;
  }

  const placement = getWallPlacement({ usePointer: movingSelectedPainting });
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
        ? 'Teď přesouváš vybraný obraz kurzorem myši po stěně. Levým klikem ho uchytíš.'
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
  syncArtworkHeightRange(selectedPainting.h, selectedPainting.group.position.y);
  artFrameSizeInput.value = selectedPainting.frameSize ?? 'medium';
  artFrameColorInput.value = selectedPainting.frameColor ?? defaultFrameColor;
  artLabelTitleInput.value = selectedPainting.labelTitle ?? '';
  artLabelMediumInput.value = selectedPainting.labelMedium ?? '';
  artLabelSizeInput.value = selectedPainting.labelSize ?? '';
  artLabelDateInput.value = selectedPainting.labelDate ?? '';
  artLabelPriceInput.value = selectedPainting.labelPrice ?? '';
  artLabelVisibleInput.checked = selectedPainting.labelVisible !== false;
}

function createMaterialFromImageUrl(url) {
  const texture = new THREE.TextureLoader().load(publicAssetPath(url));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = mobilePerformanceMode ? 1 : renderer.capabilities.getMaxAnisotropy();
  const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
  material.color.setScalar(1);
  material.toneMapped = false;
  return material;
}

function getArtworkHeightRange(artworkHeight) {
  const halfHeight = Math.max(artworkHeight, 0.01) / 2;
  const min = halfHeight + artworkWallEdgeGap;
  const max = roomHeight - halfHeight - artworkWallEdgeGap;
  if (max < min) {
    return {
      min: roomHeight / 2,
      max: roomHeight / 2,
    };
  }
  return { min, max };
}

function clampArtworkCenterY(artworkHeight, centerY) {
  const range = getArtworkHeightRange(artworkHeight);
  const value = Number(centerY);
  return THREE.MathUtils.clamp(Number.isFinite(value) ? value : roomHeight / 2, range.min, range.max);
}

function syncArtworkHeightRange(artworkHeight, preferredValue = Number(artHeightInput.value)) {
  const range = getArtworkHeightRange(artworkHeight);
  artHeightInput.min = range.min.toFixed(2);
  artHeightInput.max = range.max.toFixed(2);
  artHeightInput.value = clampArtworkCenterY(artworkHeight, preferredValue).toFixed(2);
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
  syncArtworkHeightRange(heightMeters);
  if (syncLabel) updateArtworkSizeLabel(widthCm, heightCm);
}

function getArtworkSizeFromInputs() {
  const aspect = getCurrentArtworkAspect();
  const widthCm = readCmInput(artWidthCmInput, defaultArtworkWidthCm);
  const heightCm = widthCm / aspect;
  fitNumberInputToValue(artHeightCmInput, heightCm);
  syncArtworkHeightRange(heightCm / centimetersPerMeter);
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
  syncArtworkHeightRange(heightCm / centimetersPerMeter);
  updateArtworkSizeLabel(widthCm, heightCm);
}

function syncArtworkWidthFromHeight() {
  const aspect = getCurrentArtworkAspect();
  const fallbackHeight = defaultArtworkWidthCm / aspect;
  const heightCm = readCmInput(artHeightCmInput, fallbackHeight);
  const widthCm = heightCm * aspect;
  fitNumberInputToValue(artWidthCmInput, widthCm);
  syncArtworkHeightRange(heightCm / centimetersPerMeter);
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
  const roomIndex = getRoomIndexForPosition(targetPoint.x, targetPoint.z);
  const centerX = galleryRooms[roomIndex]?.centerX ?? 0;
  const centerZ = galleryRooms[roomIndex]?.centerZ ?? 0;
  const trackId = chooseTrackForTarget(targetPoint);
  const trackSpec = trackSpecs[trackId] ?? trackSpecs.back;
  const position = targetPoint.clone().addScaledVector(normal, 1.35);
  position.y = roomHeight - 0.14;
  if (trackSpec.axis === 'x') {
    position.z = centerZ + trackSpec.fixed;
    position.x = centerX + THREE.MathUtils.clamp(position.x - centerX, trackSpec.min, trackSpec.max);
  } else {
    position.x = centerX + trackSpec.fixed;
    position.z = centerZ + THREE.MathUtils.clamp(position.z - centerZ, trackSpec.min, trackSpec.max);
  }
  const trackPosition = getTrackPositionRatio(trackId, position, roomIndex);
  return { targetPoint, position, trackId, trackPosition, roomIndex };
}

function moveSpotToPainting(paintingData, lightData) {
  lightData.kind = 'painting';
  const placement = getSpotPlacementForPainting(paintingData);
  const resolvedPosition = getTrackPosition(placement.trackId, placement.trackPosition, placement.roomIndex);
  const direction = placement.targetPoint.clone().sub(resolvedPosition);
  const angles = anglesFromDirection(direction);
  lightData.position.copy(resolvedPosition);
  lightData.trackId = placement.trackId;
  lightData.trackPosition = placement.trackPosition;
  lightData.roomIndex = placement.roomIndex;
  lightData.yaw = THREE.MathUtils.clamp(angles.yaw, -180, 180);
  lightData.pitch = clampLightPitch('painting', angles.pitch);
  if (!Number.isFinite(lightData.power)) lightData.power = 105;
  updateCeilingLight(lightData);
  return lightData;
}

function addSpotForPainting(paintingData, { select = true, openPanel = true, persist = true, sync = true } = {}) {
  if (paintingData.artSpot && ceilingLights.includes(paintingData.artSpot) && getLightKind(paintingData.artSpot) === 'painting') {
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
  paintingData.artSpot = null;

  const placement = getSpotPlacementForPainting(paintingData);
  const lightData = addCeilingLight({
    position: placement.position,
    targetPoint: placement.targetPoint,
    trackId: placement.trackId,
    trackPosition: placement.trackPosition,
    power: 105,
    kind: 'painting',
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
    if (getLightKind(paintingData.artSpot) !== 'painting') {
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
    .filter((lightData) => getLightKind(lightData) === 'painting' && !assignedLights.has(lightData))
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
    labelVisible: artLabelVisibleInput.checked,
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
  const placement = getWallPlacement({ usePointer: true });
  if (!placement) {
    artTitle.textContent = 'Není vybraná stěna';
    artStatus.textContent = 'Pro přesun dej kurzor myši na vnitřní stěnu mimo průchod.';
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
  releaseLook();
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
  position.y = clampArtworkCenterY(height, Number(artHeightInput.value));
  artHeightInput.value = position.y.toFixed(2);
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
  const labelVisible = selectedPainting.labelVisible !== false;
  const actionUrl = selectedPainting.actionUrl ?? '';
  const imageSrc = selectedPainting.imageSrc ?? '';
  room.remove(selectedPainting.group);
  const index = editablePaintings.indexOf(selectedPainting);
  if (index >= 0) editablePaintings.splice(index, 1);
  selectedPainting = addPainting({
    x: position.x,
    y: position.y,
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
    labelVisible,
    actionUrl,
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
  selectedPainting.labelVisible = artLabelVisibleInput.checked;
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
        ? 'Objekt je vybraný. Můžeš ho přesunout, kolečkem otočit, změnit typ, rozměr, nebo nalepit obrázek na čelo.'
        : 'Namiř tečku na podlahu a přidej nový podstavec.';
  movePedestalButton.disabled = !selectedPedestal;
  removePedestalButton.disabled = !selectedPedestal;
  movePedestalButton.textContent = movingSelectedPedestal ? 'Zrušit přesun' : 'Přesunout vybraný';
  addPedestalButton.textContent = movingSelectedPedestal ? 'Uchytit na podlahu' : 'Přidat na podlahu';
  const selectedSticker = selectedPedestal?.content?.stickers?.[0] ?? null;
  loadPedestalStickerButton.disabled = !selectedPedestal;
  removePedestalStickerButton.disabled = !selectedSticker;
  if (!selectedPedestal) {
    pedestalStickerWidthCmInput.value = '42';
    pedestalStickerHeightCmInput.value = '42';
    pedestalStickerOffsetXCmInput.value = '0';
    pedestalStickerOffsetYCmInput.value = '55';
    return;
  }
  pedestalTypeInput.value = selectedPedestal.type ?? 'pillar';
  pedestalWidthCmInput.value = String(Math.round(selectedPedestal.width * centimetersPerMeter));
  pedestalDepthCmInput.value = String(Math.round(selectedPedestal.depth * centimetersPerMeter));
  pedestalHeightCmInput.value = String(Math.round(selectedPedestal.height * centimetersPerMeter));
  const defaultStickerSize = Math.min(selectedPedestal.width, selectedPedestal.height * 0.55, 0.5);
  pedestalStickerWidthCmInput.value = String(Math.round((selectedSticker?.width ?? defaultStickerSize) * centimetersPerMeter));
  pedestalStickerHeightCmInput.value = String(Math.round((selectedSticker?.height ?? defaultStickerSize) * centimetersPerMeter));
  pedestalStickerOffsetXCmInput.value = String(Math.round((selectedSticker?.offsetX ?? 0) * centimetersPerMeter));
  pedestalStickerOffsetYCmInput.value = String(Math.round((selectedSticker?.offsetY ?? selectedPedestal.height * 0.52) * centimetersPerMeter));
}

function updatePedestalSelection() {
  displayPedestals.forEach((pedestalData) => {
    pedestalData.selection.visible = pedestalData === selectedPedestal
      && (movingSelectedPedestal || pedestalPanel.classList.contains('visible'));
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

function replaceSelectedPedestalContent(content) {
  if (!selectedPedestal) return;
  const position = selectedPedestal.group.position.clone();
  const ry = selectedPedestal.group.rotation.y;
  const { width, depth, height, type } = selectedPedestal;
  room.remove(selectedPedestal.group);
  const index = displayPedestals.indexOf(selectedPedestal);
  if (index >= 0) displayPedestals.splice(index, 1);
  selectedPedestal = createDisplayPedestal({
    x: position.x,
    z: position.z,
    ry,
    width,
    depth,
    height,
    type,
    content,
  });
  updatePedestalSelection();
  syncPedestalPanel();
}

function readPedestalStickerFromInputs(imageSrc = selectedPedestal?.content?.stickers?.[0]?.imageSrc ?? '') {
  if (!selectedPedestal || !imageSrc) return null;
  const width = THREE.MathUtils.clamp(
    Number(pedestalStickerWidthCmInput.value) / centimetersPerMeter || Math.min(selectedPedestal.width * 0.62, 0.48),
    0.08,
    Math.max(0.08, selectedPedestal.width * 0.96),
  );
  const height = THREE.MathUtils.clamp(
    Number(pedestalStickerHeightCmInput.value) / centimetersPerMeter || width,
    0.08,
    Math.max(0.08, selectedPedestal.height * 0.9),
  );
  const offsetX = THREE.MathUtils.clamp(
    Number(pedestalStickerOffsetXCmInput.value) / centimetersPerMeter || 0,
    -selectedPedestal.width / 2,
    selectedPedestal.width / 2,
  );
  const offsetY = THREE.MathUtils.clamp(
    Number(pedestalStickerOffsetYCmInput.value) / centimetersPerMeter || selectedPedestal.height * 0.52,
    height / 2 + 0.03,
    Math.max(height / 2 + 0.03, selectedPedestal.height - height / 2 - 0.03),
  );
  return {
    imageSrc,
    face: 'front',
    width,
    height,
    offsetX,
    offsetY,
  };
}

function updateSelectedPedestalSticker() {
  if (!selectedPedestal?.content?.stickers?.[0]) return;
  const nextSticker = readPedestalStickerFromInputs();
  if (!nextSticker) return;
  replaceSelectedPedestalContent({
    ...(selectedPedestal.content ?? {}),
    stickers: [nextSticker],
  });
}

function removeSelectedPedestalSticker() {
  if (!selectedPedestal?.content?.stickers?.length) return;
  const nextContent = { ...(selectedPedestal.content ?? {}) };
  delete nextContent.stickers;
  replaceSelectedPedestalContent(Object.keys(nextContent).length ? nextContent : null);
}

function rotateSelectedPedestal(direction) {
  if (!selectedPedestal) return false;
  selectedPedestal.group.rotation.y += direction * THREE.MathUtils.degToRad(7.5);
  pedestalTitle.textContent = 'Podstavec otočený';
  pedestalStatus.textContent = 'Kolečkem můžeš doladit natočení. Nezapomeň galerii uložit nebo exportovat.';
  return true;
}

function getTextPanelSizeFromInputs() {
  return {
    width: THREE.MathUtils.clamp(Number(textPanelWidthCmInput.value) / centimetersPerMeter, 0.2, 3),
    height: THREE.MathUtils.clamp(Number(textPanelHeightCmInput.value) / centimetersPerMeter, 0.12, 2.5),
  };
}

function getDonorRowsFromEditor() {
  return [...donorRowList.querySelectorAll('.donor-row')]
    .map((row) => ({
      name: row.querySelector('.donor-name-cell')?.value.trim() ?? '',
      amount: row.querySelector('.donor-amount-cell')?.value.trim() ?? '',
    }))
    .filter((row) => row.name || row.amount);
}

function serializeDonorRows(rows) {
  return rows
    .filter((row) => row.name && row.amount)
    .map((row) => `${row.name} | ${row.amount}`)
    .join('\n');
}

function syncDonorTextFromGrid() {
  textPanelTextInput.value = serializeDonorRows(getDonorRowsFromEditor());
  if (!selectedTextPanel) return;
  selectedTextPanel.text = textPanelTextInput.value;
  selectedTextPanel.kind = 'donors';
  redrawTextPanel(selectedTextPanel);
}

function hideDonorContextMenu() {
  donorContextRowIndex = null;
  donorContextMenu.classList.remove('visible');
}

function showDonorContextMenu(event, index) {
  const rows = getDonorRowsFromEditor();
  if (!rows[index]) return;
  event.preventDefault();
  event.stopPropagation();
  donorContextRowIndex = index;
  const menuWidth = 150;
  const menuHeight = 38;
  donorContextMenu.style.left = `${Math.min(event.clientX, window.innerWidth - menuWidth - 8)}px`;
  donorContextMenu.style.top = `${Math.min(event.clientY, window.innerHeight - menuHeight - 8)}px`;
  donorContextMenu.classList.add('visible');
}

function removeDonorRow(index) {
  const rows = getDonorRowsFromEditor();
  if (!rows[index]) return;
  const label = [rows[index].name, rows[index].amount].filter(Boolean).join(' - ');
  if (!window.confirm(`Opravdu smazat řádek "${label}"?`)) return;
  rows.splice(index, 1);
  textPanelTextInput.value = serializeDonorRows(rows);
  if (selectedTextPanel) {
    selectedTextPanel.text = textPanelTextInput.value;
    selectedTextPanel.kind = 'donors';
    redrawTextPanel(selectedTextPanel);
  }
  renderDonorEditorRows();
}

function renderDonorEditorRows() {
  const rows = parseDonorBoardRows(textPanelTextInput.value);
  rows.push({ name: '', amount: '' });
  donorRowList.replaceChildren();

  rows.forEach((row, index) => {
    const rowElement = document.createElement('div');
    rowElement.className = 'donor-row';
    rowElement.dataset.index = String(index);

    const nameInput = document.createElement('input');
    nameInput.className = 'donor-name-cell';
    nameInput.type = 'text';
    nameInput.placeholder = 'Jméno';
    nameInput.value = row.name ?? '';

    const amountInput = document.createElement('input');
    amountInput.className = 'donor-amount-cell';
    amountInput.type = 'text';
    amountInput.placeholder = '500 Kč';
    amountInput.value = row.amount ?? '';

    const syncFromInput = () => {
      hideDonorContextMenu();
      syncDonorTextFromGrid();
    };

    nameInput.addEventListener('input', syncFromInput);
    amountInput.addEventListener('input', syncFromInput);
    rowElement.addEventListener('contextmenu', (event) => {
      showDonorContextMenu(event, index);
    });

    rowElement.append(nameInput, amountInput);
    donorRowList.append(rowElement);
  });
}

function syncTextPanelPanel() {
  textPanelTitle.textContent = selectedTextPanel ? 'Vybraná tabulka' : 'Nová tabulka';
  const selectedKind = getTextPanelKind(selectedTextPanel?.kind ?? textPanelKindInput.value);
  textPanelDonorTools.classList.toggle('visible', selectedKind === 'donors');
  textPanelTextInput.closest('label').style.display = selectedKind === 'donors' ? 'none' : 'grid';
  textPanelTextInput.placeholder = selectedKind === 'donors'
    ? 'Každý řádek: Jméno | 500 Kč'
    : 'Napiš text na tabulku';
  textPanelStatus.textContent = movingSelectedTextPanel
    ? 'Pohybuj tabulkou kurzorem myši po stěně a klikni pro uchycení.'
      : selectedTextPanel
        ? selectedKind === 'donors'
          ? 'Tabule dárců je vybraná. Přidej jméno a částku, nebo uprav seznam řádků ve formátu Jméno | částka.'
          : 'Tabulka je vybraná. Můžeš změnit text, barvy, velikost, přesunout ji, kolečkem otočit, nebo smazat.'
        : 'Namiř tečku na stěnu a přidej textovou tabulku.';
  moveTextPanelButton.disabled = !selectedTextPanel;
  removeTextPanelButton.disabled = !selectedTextPanel;
  moveTextPanelButton.textContent = movingSelectedTextPanel ? 'Zrušit přesun' : 'Přesunout vybranou';
  addTextPanelButton.textContent = movingSelectedTextPanel ? 'Uchytit na stěnu' : 'Přidat na stěnu';
  if (!selectedTextPanel) return;
  textPanelKindInput.value = selectedKind;
  const panelText = selectedTextPanel.text ?? '';
  textPanelTextInput.value = selectedKind === 'donors' && isDonorBoardPlaceholder(panelText) ? '' : panelText;
  if (selectedKind === 'donors') renderDonorEditorRows();
  textPanelWidthCmInput.value = String(Math.round(selectedTextPanel.width * centimetersPerMeter));
  textPanelHeightCmInput.value = String(Math.round(selectedTextPanel.height * centimetersPerMeter));
  textPanelFontSizeInput.value = String(Math.round(selectedTextPanel.fontSize ?? 58));
  textPanelFontWeightInput.value = String(Math.round(selectedTextPanel.fontWeight ?? 850));
  textPanelAlignInput.value = selectedTextPanel.textAlign ?? 'center';
  textPanelBgColorInput.value = selectedTextPanel.bgColor ?? '#f7f4ea';
  textPanelTextColorInput.value = selectedTextPanel.textColor ?? '#111315';
}

function updateTextPanelSelection() {
  displayTextPanels.forEach((textPanelData) => {
    textPanelData.selection.visible = textPanelData === selectedTextPanel;
  });
}

function addTextPanelFromWall() {
  const placement = getTextPanelPlacement();
  if (!placement) {
    textPanelPanel.classList.add('visible');
    textPanelTitle.textContent = 'Není vybraná stěna';
    textPanelStatus.textContent = 'Namiř tečku na stěnu nebo nad dveře a zkus to znovu.';
    return false;
  }
  selectedTextPanel = createTextPanel({
    x: placement.point.x,
    y: placement.point.y,
    z: placement.point.z,
    ry: placement.ry,
    width: placement.width,
    height: placement.height,
    text: textPanelTextInput.value.trim().length
      ? textPanelTextInput.value
      : getTextPanelKind(textPanelKindInput.value) === 'donors'
        ? ''
        : 'Textová tabulka',
    bgColor: textPanelBgColorInput.value,
    textColor: textPanelTextColorInput.value,
    kind: getTextPanelKind(textPanelKindInput.value),
    fontSize: Number(textPanelFontSizeInput.value),
    fontWeight: Number(textPanelFontWeightInput.value),
    textAlign: textPanelAlignInput.value,
    wallNormal: placement.normal.clone(),
  });
  movingSelectedTextPanel = false;
  updateTextPanelSelection();
  syncTextPanelPanel();
  return true;
}

function moveSelectedTextPanelToWall() {
  if (!selectedTextPanel) return false;
  const placement = getTextPanelPlacement({ usePointer: true });
  if (!placement) {
    textPanelTitle.textContent = 'Není vybraná stěna';
    textPanelStatus.textContent = 'Pro přesun dej kurzor myši na stěnu nebo nad dveře.';
    return false;
  }
  selectedTextPanel.group.position.copy(placement.point);
  selectedTextPanel.group.rotation.y = placement.ry;
  selectedTextPanel.wallNormal = placement.normal.clone();
  movingSelectedTextPanel = false;
  syncTextPanelPanel();
  return true;
}

function removeSelectedTextPanel() {
  if (!selectedTextPanel) return;
  room.remove(selectedTextPanel.group);
  const index = displayTextPanels.indexOf(selectedTextPanel);
  if (index >= 0) displayTextPanels.splice(index, 1);
  selectedTextPanel = null;
  movingSelectedTextPanel = false;
  syncTextPanelPanel();
}

function updateSelectedTextPanel() {
  if (!selectedTextPanel) return;
  const { width, height } = getTextPanelSizeFromInputs();
  selectedTextPanel.width = width;
  selectedTextPanel.height = height;
  selectedTextPanel.text = getTextPanelKind(textPanelKindInput.value) === 'donors' && isDonorBoardPlaceholder(textPanelTextInput.value)
    ? ''
    : textPanelTextInput.value;
  selectedTextPanel.bgColor = textPanelBgColorInput.value;
  selectedTextPanel.textColor = textPanelTextColorInput.value;
  selectedTextPanel.kind = getTextPanelKind(textPanelKindInput.value);
  selectedTextPanel.fontSize = Number(textPanelFontSizeInput.value);
  selectedTextPanel.fontWeight = Number(textPanelFontWeightInput.value);
  selectedTextPanel.textAlign = textPanelAlignInput.value;
  syncTextPanelPanel();
  updateTextPanelGeometry(selectedTextPanel);
  redrawTextPanel(selectedTextPanel);
}

function appendDonorRow() {
  const rows = getDonorRowsFromEditor();
  rows.push({ name: '', amount: '' });
  textPanelTextInput.value = serializeDonorRows(rows);
  renderDonorEditorRows();
  donorRowList.lastElementChild?.querySelector('.donor-name-cell')?.focus();
  return true;
}

function rotateSelectedTextPanel(direction) {
  if (!selectedTextPanel) return false;
  selectedTextPanel.group.rotation.y += direction * THREE.MathUtils.degToRad(7.5);
  textPanelTitle.textContent = 'Tabulka otočená';
  textPanelStatus.textContent = 'Kolečkem můžeš doladit natočení. Nezapomeň galerii uložit nebo exportovat.';
  return true;
}

function saveGalleryFromEditor() {
  updateSelectedPaintingLabel();
  updateSelectedPaintingSize();
  updateSelectedPedestalSize();
  updateSelectedTextPanel();
  ensurePaintingLights();
  saveLightingState();
  const saved = saveGalleryState();
  artTitle.textContent = saved ? 'Galerie uložená' : 'Uložení se nepovedlo';
  artStatus.textContent = saved
    ? `Uloženo ${editablePaintings.length} obrazů a ${displayTextPanels.length} tabulek. Změny zůstanou po zavření a znovu otevření téhle stránky v tomto prohlížeči.`
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
  updateSelectedTextPanel();
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
  artStatus.textContent = 'Stáhl se JSON se světly, obrazy, podstavci a textovými tabulkami. Ten pak můžeme vložit do kódu pro veřejnou verzi.';
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
    window.location.href = `${window.location.origin}${window.location.pathname}?edit=1&github=1`;
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
  displayTextPanels.forEach((textPanelData) => {
    textPanelData.group.traverse((child) => {
      if (child.isMesh) objects.push(child);
    });
  });
  const hit = raycaster.intersectObjects(objects, false)[0];
  return hit?.object?.userData ?? null;
}

function selectEditableFromCrosshair() {
  if (!editorMode) return false;
  const target = getEditableTargetFromCrosshair();
  if (!target) return false;
  if (target.lightData) {
    selectedLightIndex = ceilingLights.indexOf(target.lightData);
    lightPanel.classList.add('visible');
    artPanel.classList.remove('visible');
    pedestalPanel.classList.remove('visible');
    textPanelPanel.classList.remove('visible');
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
      textPanelPanel.classList.remove('visible');
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
    textPanelPanel.classList.remove('visible');
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
    textPanelPanel.classList.remove('visible');
    audioPanel.classList.remove('visible');
    syncPedestalPanel();
    return true;
  }
  if (target.textPanelData) {
    selectedTextPanel = target.textPanelData;
    movingSelectedTextPanel = false;
    textPanelPanel.classList.add('visible');
    artPanel.classList.remove('visible');
    lightPanel.classList.remove('visible');
    pedestalPanel.classList.remove('visible');
    audioPanel.classList.remove('visible');
    syncTextPanelPanel();
    return true;
  }
  return false;
}

const paintingActionMaxDistance = 2.2;

function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => {
        status.textContent = 'E-mail zkopírovaný';
      })
      .catch(() => {
        status.textContent = text;
      });
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand('copy');
    status.textContent = 'E-mail zkopírovaný';
  } catch {
    status.textContent = text;
  }
  textarea.remove();
}

function openPaintingActionFromCrosshair() {
  const target = getEditableTargetFromCrosshair();
  const paintingData = target?.paintingData;
  const actionUrl = paintingData?.actionUrl?.trim();
  if (!actionUrl) return false;
  const cameraPosition = new THREE.Vector3();
  camera.getWorldPosition(cameraPosition);
  if (cameraPosition.distanceTo(paintingData.group.position) > paintingActionMaxDistance) {
    status.textContent = 'Přijď blíž k obrazu';
    return true;
  }
  if (actionUrl.startsWith('copy:')) {
    copyTextToClipboard(actionUrl.slice(5));
    return true;
  }
  let resolvedUrl = actionUrl;
  try {
    resolvedUrl = new URL(actionUrl, window.location.href).href;
  } catch {
    status.textContent = 'Odkaz není platný';
    return true;
  }
  if (!window.confirm('Otevřít odkaz v novém okně?')) {
    status.textContent = 'Otevření odkazu zrušeno';
    return true;
  }
  window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
  return true;
}

const body = new THREE.Object3D();
body.position.set(0, 1.68, 2.4);
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
  if (event.target instanceof Element && event.target.closest('#audio-toggle, #light-editor, #art-editor, #pedestal-editor, #text-panel-editor, #audio-editor')) {
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
  const roomIndex = getRoomIndexForPosition(body.position.x, body.position.z);
  const centerX = galleryRooms[roomIndex]?.centerX ?? 0;
  const centerZ = galleryRooms[roomIndex]?.centerZ ?? 0;
  targetPoint.x = centerX + THREE.MathUtils.clamp(targetPoint.x - centerX, -roomWidth / 2 + 0.45, roomWidth / 2 - 0.45);
  targetPoint.y = THREE.MathUtils.clamp(targetPoint.y, 0.85, roomHeight - 0.55);
  targetPoint.z = centerZ + THREE.MathUtils.clamp(targetPoint.z - centerZ, -roomDepth / 2 + 0.1, roomDepth / 2 - 0.1);

  const position = new THREE.Vector3(
    centerX + THREE.MathUtils.clamp((targetPoint.x - centerX) * 0.72, -roomWidth / 2 + 0.55, roomWidth / 2 - 0.55),
    roomHeight - 0.14,
    centerZ + THREE.MathUtils.clamp((targetPoint.z - centerZ) * 0.58, -roomDepth / 2 + 0.75, roomDepth / 2 - 0.75),
  );
  const kind = lightKindInput.value === 'painting' ? 'painting' : 'display';
  const trackId = kind === 'display' ? chooseCustomTrackForTarget(targetPoint) : chooseTrackForTarget(targetPoint);
  addCeilingLight({
    position,
    targetPoint,
    trackId,
    power: kind === 'display' ? 72 : 105,
    angle: kind === 'display' ? 34 : 30,
    kind,
    roomIndex,
  });
  saveLightingState();
}

function getLightTrackPlacementFromPointer(lightData) {
  const placementRaycaster = getPointerRaycaster() || getCenterRaycaster();
  const point = new THREE.Vector3();
  const hit = placementRaycaster.ray.intersectPlane(galleryFloorPlane, point);
  if (!hit) return null;
  constrainToGallery(point, 0.42, body.position.clone());
  const kind = getLightKind(lightData);
  const roomIndex = getRoomIndexForPosition(point.x, point.z);
  const trackId = kind === 'display' ? chooseCustomTrackForTarget(point) : chooseTrackForTarget(point);
  const trackPosition = getTrackPositionRatio(trackId, point, roomIndex);
  return { trackId, trackPosition, roomIndex };
}

function applyLightTrackPlacement(lightData, placement) {
  if (!lightData || !placement) return false;
  lightData.trackId = placement.trackId;
  lightData.trackPosition = placement.trackPosition;
  lightData.roomIndex = placement.roomIndex;
  updateCeilingLight(lightData);
  lightTrackPositionInput.value = String(lightData.trackPosition);
  return true;
}

function updateMovingSelectedLight() {
  if (!movingSelectedLight) return;
  const lightData = getSelectedLight();
  const placement = getLightTrackPlacementFromPointer(lightData);
  applyLightTrackPlacement(lightData, placement);
}

function beginMoveSelectedLight() {
  const lightData = getSelectedLight();
  if (!lightData) return;
  aimingSelectedLight = false;
  movingSelectedLight = true;
  releaseLook();
  syncLightPanel();
  lightTitle.textContent = 'Přesun světla';
  status.textContent = 'Pohybuj myší po scéně a klikni pro uchycení světla na lištu.';
}

function finishMoveSelectedLight() {
  if (!movingSelectedLight) return;
  updateMovingSelectedLight();
  movingSelectedLight = false;
  syncLightPanel();
  saveLightingState();
}

function beginAimSelectedLight() {
  const lightData = getSelectedLight();
  if (!lightData) return;
  movingSelectedLight = false;
  aimingSelectedLight = true;
  aimingLightStartPosition = body.position.clone();
  aimingLightOriginalDirection = {
    yaw: lightData.yaw,
    pitch: lightData.pitch,
  };
  canvas.focus();
  lookEnabled = true;
  if (!pointerLocked && canvas.requestPointerLock) {
    canvas.requestPointerLock();
  }
  syncLightPanel();
  lightTitle.textContent = 'Nastavení směru';
  status.textContent = 'Dívej se tam, kam má světlo svítit. Levým klikem směr uchytíš.';
}

function finishAimSelectedLight({ commit = true } = {}) {
  const lightData = getSelectedLight();
  if (!aimingSelectedLight || !lightData) return;
  if (!commit && aimingLightOriginalDirection) {
    lightData.yaw = aimingLightOriginalDirection.yaw;
    lightData.pitch = aimingLightOriginalDirection.pitch;
    updateCeilingLight(lightData);
  }
  aimingSelectedLight = false;
  aimingLightStartPosition = null;
  aimingLightOriginalDirection = null;
  syncLightPanel();
  if (commit) {
    saveLightingState();
    status.textContent = 'Směr světla uchycený';
  } else {
    status.textContent = 'Nastavení směru zrušené, odešel jsi moc daleko od světla.';
  }
}

function updateAimingSelectedLight() {
  if (!aimingSelectedLight) return;
  const lightData = getSelectedLight();
  if (!lightData) {
    finishAimSelectedLight({ commit: false });
    return;
  }
  if (aimingLightStartPosition && body.position.distanceTo(aimingLightStartPosition) > maxLightAimDistance) {
    finishAimSelectedLight({ commit: false });
    return;
  }
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  const angles = anglesFromDirection(direction);
  lightData.yaw = THREE.MathUtils.clamp(angles.yaw, -180, 180);
  lightData.pitch = clampLightPitch(getLightKind(lightData), angles.pitch);
  updateCeilingLight(lightData);
  lightYawInput.value = String(Math.round(lightData.yaw));
  lightPitchInput.value = String(Math.round(lightData.pitch));
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
    textPanelPanel.classList.remove('visible');
    audioPanel.classList.remove('visible');
    artPreview.visible = false;
  }
  updateLightLabels();
});

addLightButton.addEventListener('click', addLightFromView);

moveLightButton.addEventListener('click', () => {
  if (!getSelectedLight()) return;
  if (movingSelectedLight) {
    finishMoveSelectedLight();
  } else {
    beginMoveSelectedLight();
  }
});

aimLightButton.addEventListener('click', () => {
  if (!getSelectedLight()) return;
  if (aimingSelectedLight) {
    finishAimSelectedLight({ commit: true });
  } else {
    beginAimSelectedLight();
  }
});

nextLightButton.addEventListener('click', () => {
  if (!ceilingLights.length) return;
  movingSelectedLight = false;
  if (aimingSelectedLight) finishAimSelectedLight({ commit: false });
  selectedLightIndex = (selectedLightIndex + 1) % ceilingLights.length;
  syncLightPanel();
  saveLightingState();
});

removeLightButton.addEventListener('click', () => {
  if (ceilingLights.length <= 1) return;
  movingSelectedLight = false;
  if (aimingSelectedLight) finishAimSelectedLight({ commit: false });
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
  current.pitch = clampLightPitch(getLightKind(current), Number(lightPitchInput.value));
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

lightKindInput.addEventListener('change', () => {
  status.textContent = lightKindInput.value === 'display'
    ? 'Nově přidané světlo bude vnitřní bodovka.'
    : 'Nově přidané světlo bude světlo obrazu.';
});

toggleArtEditor.addEventListener('click', () => {
  artPanel.classList.toggle('visible');
  if (artPanel.classList.contains('visible')) {
    lightPanel.classList.remove('visible');
    pedestalPanel.classList.remove('visible');
    textPanelPanel.classList.remove('visible');
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
    textPanelPanel.classList.remove('visible');
    audioPanel.classList.remove('visible');
    artPreview.visible = false;
  }
  syncPedestalPanel();
});

toggleTextPanelEditor.addEventListener('click', () => {
  textPanelPanel.classList.toggle('visible');
  if (textPanelPanel.classList.contains('visible')) {
    lightPanel.classList.remove('visible');
    artPanel.classList.remove('visible');
    pedestalPanel.classList.remove('visible');
    audioPanel.classList.remove('visible');
    artPreview.visible = false;
  }
  syncTextPanelPanel();
});

toggleAudioEditor.addEventListener('click', () => {
  audioPanel.classList.toggle('visible');
  if (audioPanel.classList.contains('visible')) {
    lightPanel.classList.remove('visible');
    artPanel.classList.remove('visible');
    pedestalPanel.classList.remove('visible');
    textPanelPanel.classList.remove('visible');
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
loadPedestalStickerButton.addEventListener('click', () => {
  if (!selectedPedestal) return;
  pedestalStickerFileInput.click();
});
removePedestalStickerButton.addEventListener('click', removeSelectedPedestalSticker);
[pedestalStickerWidthCmInput, pedestalStickerHeightCmInput, pedestalStickerOffsetXCmInput, pedestalStickerOffsetYCmInput].forEach((input) => {
  input.addEventListener('input', updateSelectedPedestalSticker);
  input.addEventListener('change', updateSelectedPedestalSticker);
});
pedestalStickerFileInput.addEventListener('change', () => {
  const [file] = pedestalStickerFileInput.files;
  if (!file || !selectedPedestal) return;
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    const image = new Image();
    image.addEventListener('load', () => {
      const aspect = image.naturalWidth / image.naturalHeight || 1;
      const defaultWidth = Math.min(selectedPedestal.width * 0.62, 0.48);
      const defaultHeight = defaultWidth / aspect;
      pedestalStickerWidthCmInput.value = String(Math.round(defaultWidth * centimetersPerMeter));
      pedestalStickerHeightCmInput.value = String(Math.round(defaultHeight * centimetersPerMeter));
      pedestalStickerOffsetXCmInput.value = '0';
      pedestalStickerOffsetYCmInput.value = String(Math.round(selectedPedestal.height * 0.52 * centimetersPerMeter));
      const sticker = readPedestalStickerFromInputs(reader.result);
      replaceSelectedPedestalContent({
        ...(selectedPedestal.content ?? {}),
        stickers: sticker ? [sticker] : [],
      });
      pedestalTitle.textContent = 'Obrázek nalepený';
      pedestalStatus.textContent = 'Obrázek je na čele podstavce. Velikost a polohu doladíš číselně v panelu.';
      pedestalStickerFileInput.value = '';
    });
    image.src = reader.result;
  });
  reader.readAsDataURL(file);
});

addTextPanelButton.addEventListener('click', () => {
  if (movingSelectedTextPanel) {
    moveSelectedTextPanelToWall();
  } else {
    addTextPanelFromWall();
  }
});
moveTextPanelButton.addEventListener('click', () => {
  if (!selectedTextPanel) return;
  movingSelectedTextPanel = !movingSelectedTextPanel;
  if (movingSelectedTextPanel) {
    releaseLook();
  }
  syncTextPanelPanel();
});
removeTextPanelButton.addEventListener('click', removeSelectedTextPanel);
addDonorRowButton.addEventListener('click', appendDonorRow);
donorContextMenu.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('button[data-action="delete"]');
  if (!deleteButton) return;
  event.preventDefault();
  event.stopPropagation();
  const index = donorContextRowIndex;
  hideDonorContextMenu();
  if (index !== null) removeDonorRow(index);
});
textPanelKindInput.addEventListener('change', () => {
  if (getTextPanelKind(textPanelKindInput.value) === 'donors') {
    textPanelTextInput.placeholder = 'Každý řádek: Jméno | 500 Kč';
  }
  if (!selectedTextPanel) syncTextPanelPanel();
});
[
  textPanelKindInput,
  textPanelTextInput,
  textPanelWidthCmInput,
  textPanelHeightCmInput,
  textPanelFontSizeInput,
  textPanelFontWeightInput,
  textPanelAlignInput,
  textPanelBgColorInput,
  textPanelTextColorInput,
].forEach((input) => {
  input.addEventListener('input', updateSelectedTextPanel);
  input.addEventListener('change', updateSelectedTextPanel);
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

[artLabelVisibleInput, artLabelTitleInput, artLabelMediumInput, artLabelSizeInput, artLabelDateInput, artLabelPriceInput].forEach((input) => {
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
let hasCanvasPointer = false;
let passiveMouseLook = false;
let passiveLookInitialized = false;
let fallbackTurning = false;
let fallbackOriginX = 0;
let fallbackOriginY = 0;
let fallbackTurnVelocity = 0;
let fallbackPitchVelocity = 0;
const initialBodyYaw = 0;
let bodyYaw = initialBodyYaw;
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
const touchMove = new THREE.Vector2();
const stickPointer = { id: null };
const lookPointer = { id: null, lastX: 0, lastY: 0, captureTarget: null };

function isTextEditingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  if (target === roomLightPublicPowerInput) return false;
  return target.isContentEditable
    || target.tagName === 'INPUT'
    || target.tagName === 'TEXTAREA'
    || target.tagName === 'SELECT';
}

if (isTouchDevice) {
  hint.textContent = 'Levy palec chuze · tahem po scene pohled';
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
  body.position.set(0, eyeHeight, 2.4);
  bodyYaw = initialBodyYaw;
  headYaw = 0;
  pitch = 0;
  fallbackTurning = false;
  fallbackTurnVelocity = 0;
  fallbackPitchVelocity = 0;
  syncCameraRotation();
}

function teleportOutOfClosedFutureWing() {
  if (!isInsideClosedFutureWing(body.position)) return false;
  resetView();
  keys.clear();
  touchMove.set(0, 0);
  velocityBob = 0;
  bobTime = 0;
  status.textContent = 'Tahle část galerie je zatím zavřená';
  return true;
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
  passiveMouseLook = false;
  passiveLookInitialized = false;
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
    if (openPaintingActionFromCrosshair()) {
      releaseLook();
      return;
    }
    releaseLook();
    return;
  }

  if (event.button !== 0 || isTouchDevice) return;
  rememberCanvasPointer(event);
  if (aimingSelectedLight) {
    event.preventDefault();
    finishAimSelectedLight({ commit: true });
    return;
  }
  if (movingSelectedLight) {
    event.preventDefault();
    finishMoveSelectedLight();
    return;
  }
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
  if (movingSelectedTextPanel) {
    event.preventDefault();
    moveSelectedTextPanelToWall();
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
  passiveMouseLook = false;
  passiveLookInitialized = false;
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
  if (roomLightControl.classList.contains('visible')) {
    event.preventDefault();
    adjustRoomLightPowerFromWheel(event);
    return;
  }
  if (!editorMode) return;
  if (selectedTextPanel && textPanelPanel.classList.contains('visible')) {
    event.preventDefault();
    rotateSelectedTextPanel(event.deltaY > 0 ? -1 : 1);
    return;
  }
  if (!selectedPedestal || !pedestalPanel.classList.contains('visible')) return;
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

document.addEventListener('click', (event) => {
  if (!donorContextMenu.contains(event.target)) hideDonorContextMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') hideDonorContextMenu();
});

window.addEventListener('blur', hideDonorContextMenu);

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
  if (draggingLook || fallbackTurning) disableLook();
});

canvas.addEventListener('mouseleave', () => {
  hasCanvasPointer = false;
  passiveLookInitialized = false;
  if (!pointerLocked && !passiveMouseLook) disableLook();
});

function resetTouchControls() {
  if (!isTouchDevice) return;
  resetStick();
  lookPointer.id = null;
  lookPointer.captureTarget = null;
  canvas.classList.remove('dragging');
}

window.addEventListener('blur', () => {
  disableLook();
  resetTouchControls();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    disableLook();
    resetTouchControls();
  }
});

window.addEventListener('mousemove', (event) => {
  if (isTouchDevice) return;
  if (!pointerLocked) {
    rememberCanvasPointer(event);
  }

  if (pointerLocked) {
    applyLookDelta(event.movementX, event.movementY);
    return;
  }

  if (lookEnabled) {
    if (fallbackTurning) {
      updateFallbackTurn(event);
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    } else if (passiveMouseLook && event.target === canvas) {
      if (passiveLookInitialized) {
        applyLookDelta(event.clientX - lastMouseX, event.clientY - lastMouseY, 0.0019);
      }
      passiveLookInitialized = true;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
      hasCanvasPointer = true;
    }
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

function safelySetPointerCapture(element, pointerId) {
  try {
    element.setPointerCapture?.(pointerId);
  } catch {
    // Synthetic tests and a few mobile browsers can reject capture; the window fallback still tracks movement.
  }
}

function safelyReleasePointerCapture(element, pointerId) {
  try {
    element?.releasePointerCapture?.(pointerId);
  } catch {
    // Capture may already be gone after pointercancel/orientation changes.
  }
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
  const deadZone = 8;
  const moveAmount = length <= deadZone ? 0 : (length - deadZone) / (max - deadZone);

  moveStickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
  touchMove.set(Math.cos(angle) * moveAmount, Math.sin(angle) * moveAmount);
}

function isMobileUiTouchTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest([
    '#move-stick',
    '#audio-toggle',
    '#room-light-control',
    '#light-editor',
    '#art-editor',
    '#pedestal-editor',
    '#text-panel-editor',
    '#audio-editor',
    'button',
    'input',
    'textarea',
    'select',
  ].join(',')));
}

function beginTouchLook(event) {
  if (!isTouchDevice || event.pointerType !== 'touch') return;
  if (lookPointer.id !== null || event.pointerId === stickPointer.id) return;
  if (isMobileUiTouchTarget(event.target)) return;

  lookPointer.id = event.pointerId;
  lookPointer.lastX = event.clientX;
  lookPointer.lastY = event.clientY;
  lookPointer.captureTarget = event.currentTarget;
  safelySetPointerCapture(event.currentTarget, event.pointerId);
  canvas.classList.add('dragging');
  event.preventDefault();
}

function releaseTouchLook(event) {
  if (event.pointerId !== lookPointer.id) return;
  safelyReleasePointerCapture(lookPointer.captureTarget, event.pointerId);
  lookPointer.id = null;
  lookPointer.captureTarget = null;
  canvas.classList.remove('dragging');
}

moveStick.addEventListener('pointerdown', (event) => {
  if (!isTouchDevice) return;
  if (stickPointer.id !== null) return;

  stickPointer.id = event.pointerId;
  updateStick(event);
  safelySetPointerCapture(moveStick, event.pointerId);
  tryStartRequestedAudio();
  event.preventDefault();
});

canvas.addEventListener('pointerdown', beginTouchLook, { passive: false });

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
    applyLookDelta(deltaX, deltaY, 0.0034);
    event.preventDefault();
  }
}, { passive: false });

window.addEventListener('pointerup', (event) => {
  if (event.pointerId === stickPointer.id) resetStick();
  releaseTouchLook(event);
});

window.addEventListener('pointercancel', (event) => {
  if (event.pointerId === stickPointer.id) resetStick();
  releaseTouchLook(event);
});

const clock = new THREE.Clock();
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const movement = new THREE.Vector3();

function updateMovement(delta) {
  const previousPosition = body.position.clone();

  if (teleportOutOfClosedFutureWing()) return;

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
    const speed = moveSpeed
      * (isTouchDevice ? 0.82 : 1)
      * (keys.has('ShiftLeft') || keys.has('ShiftRight') ? sprintMultiplier : 1);
    movement.normalize().multiplyScalar(speed * delta);
    body.position.add(movement);
  }

  if (teleportOutOfClosedFutureWing()) return;

  const margin = 0.55;
  constrainToGallery(body.position, margin, previousPosition);

  if (teleportOutOfClosedFutureWing()) return;

  velocityBob = THREE.MathUtils.lerp(velocityBob, moving ? 1 : 0, 1 - Math.pow(0.001, delta));
  bobTime += delta * 8.5 * velocityBob;
  camera.position.y = Math.sin(bobTime) * (isTouchDevice ? 0.012 : 0.028) * velocityBob;
  body.position.y = eyeHeight;
  syncCameraRotation();
}

function updateAutoRoomLights(delta) {
  const currentRoomIndex = getRoomIndexForPosition(body.position.x, body.position.z);
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
    const playerIsNearRoom = body.position.x >= fixture.minX
      && body.position.x <= fixture.maxX
      && body.position.z >= fixture.minZ
      && body.position.z <= fixture.maxZ;
    const requestedPower = roomLightState.enabled ? roomLightState.power : 0;
    const targetPower = playerIsNearRoom ? requestedPower : 0;
    fixture.currentPower = THREE.MathUtils.lerp(fixture.currentPower, targetPower, 1 - Math.pow(0.0004, delta));
    fixture.light.intensity = fixture.currentPower;
    setRoomLightPanelColor(fixture.panelMaterial, fixture.currentPower);
  });
}

function updateArtworkBrightness(delta) {
  const currentRoomIndex = getRoomIndexForPosition(body.position.x, body.position.z);
  editablePaintings.forEach((paintingData) => {
    const lightData = paintingData.artSpot;
    const lightRoomIndex = lightData?.roomIndex ?? getRoomIndexForPosition(paintingData.group.position.x, paintingData.group.position.z);
    const paintingRoomIndex = getRoomIndexForPosition(paintingData.group.position.x, paintingData.group.position.z);
    const lightIsInCurrentRoom = lightRoomIndex === currentRoomIndex && paintingRoomIndex === currentRoomIndex;
    const lightIsOn = Boolean(lightData && getLightKind(lightData) === 'painting' && lightIsInCurrentRoom && (lightData.power ?? 0) > 0.5);
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
  const isAnyEditableTarget = Boolean(hoveredEditable?.lightData || hoveredEditable?.paintingData || hoveredEditable?.pedestalData || hoveredEditable?.textPanelData);
  crosshair.classList.toggle('target', editorMode && isAnyEditableTarget);
  crosshair.classList.toggle('viewer-hidden', !editorMode && isPaintingTarget);
  if (movingSelectedPedestal && selectedPedestal) {
    const placement = getFloorPlacement();
    if (placement) {
      selectedPedestal.group.position.x = placement.x;
      selectedPedestal.group.position.z = placement.z;
    }
  }
  if (movingSelectedTextPanel && selectedTextPanel) {
    const placement = getTextPanelPlacement({ usePointer: true });
    if (placement) {
      selectedTextPanel.group.position.copy(placement.point);
      selectedTextPanel.group.rotation.y = placement.ry;
      selectedTextPanel.wallNormal = placement.normal.clone();
    }
  }
  updateMovingSelectedLight();
  updateAimingSelectedLight();
  updatePedestalSelection();
  updateTextPanelSelection();
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

function resizeRendererToViewport() {
  const { width, height } = getViewportSize();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(getRenderPixelRatio());
  renderer.setSize(width, height);
}

window.addEventListener('resize', resizeRendererToViewport);
window.visualViewport?.addEventListener('resize', resizeRendererToViewport);
window.addEventListener('orientationchange', () => {
  resizeRendererToViewport();
  window.setTimeout(resizeRendererToViewport, 250);
});

syncCameraRotation();
updateStatus();
animate();

window.__galleryDebug = () => ({
  bodyPosition: body.position.toArray(),
  currentRoomIndex: getRoomIndexForPosition(body.position.x, body.position.z),
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
    x: fixture.centerX,
    z: fixture.centerZ,
    minX: fixture.minX,
    maxX: fixture.maxX,
    minZ: fixture.minZ,
    maxZ: fixture.maxZ,
    currentPower: Number(fixture.currentPower.toFixed(3)),
    intensity: Number(fixture.light.intensity.toFixed(3)),
  })),
  visibleSpotLights: ceilingLights.filter((lightData) => lightData.spot.visible).length,
  lightAssignments: {
    paintingLights: ceilingLights.filter((lightData) => getLightKind(lightData) === 'painting').length,
    displayLights: ceilingLights.filter((lightData) => getLightKind(lightData) === 'display').length,
    displayLightsAssignedToPaintings: editablePaintings.filter((paintingData) => getLightKind(paintingData.artSpot) === 'display').length,
  },
  displayPedestals: displayPedestals.length,
  displayTextPanels: displayTextPanels.length,
  textPanelDetails: displayTextPanels.map((textPanelData) => ({
    width: Number(textPanelData.width.toFixed(3)),
    height: Number(textPanelData.height.toFixed(3)),
    canvas: [
      textPanelData.panel.userData.canvas.width,
      textPanelData.panel.userData.canvas.height,
    ],
    text: String(textPanelData.text ?? '').slice(0, 80),
  })),
  audio: {
    tracks: jazzPlaylist.length,
    speakers: audioSpeakers.length,
    requested: galleryAudioRequested,
    paused: galleryAudio.paused,
    currentTrack: jazzPlaylist[currentJazzTrackIndex] ?? null,
  },
  rendererInfo: {
    mobilePerformanceMode,
    pixelRatio: renderer.getPixelRatio(),
    shadowsEnabled: renderer.shadowMap.enabled,
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
  touchMove: touchMove.toArray(),
  stickPointerId: stickPointer.id,
  lookPointerId: lookPointer.id,
  keys: [...keys],
});

window.__galleryLightingConfig = () => serializeLightingState();
window.__galleryPublicConfig = () => serializePublicGalleryConfig();
