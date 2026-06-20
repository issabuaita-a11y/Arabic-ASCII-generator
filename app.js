const elements = {
  sourceText: document.querySelector("#sourceText"),
  fillPreset: document.querySelector("#fillPreset"),
  fillText: document.querySelector("#fillText"),
  fontSelect: document.querySelector("#fontSelect"),
  scanFonts: document.querySelector("#scanFonts"),
  fontUploadTrigger: document.querySelector("#fontUploadTrigger"),
  fontUpload: document.querySelector("#fontUpload"),
  fontList: document.querySelector("#fontList"),
  fontWeight: document.querySelector("#fontWeight"),
  compositionSelect: document.querySelector("#compositionSelect"),
  artColor: document.querySelector("#artColor"),
  animationSelect: document.querySelector("#animationSelect"),
  gridToggle: document.querySelector("#gridToggle"),
  exportBackground: document.querySelector("#exportBackground"),
  exportScale: document.querySelector("#exportScale"),
  sizeRange: document.querySelector("#sizeRange"),
  detailRange: document.querySelector("#detailRange"),
  thresholdRange: document.querySelector("#thresholdRange"),
  sizeValue: document.querySelector("#sizeValue"),
  detailValue: document.querySelector("#detailValue"),
  thresholdValue: document.querySelector("#thresholdValue"),
  modeButtons: Array.from(document.querySelectorAll(".mode-button")),
  tabButtons: Array.from(document.querySelectorAll(".tab-button")),
  fontButtons: document.querySelector("#fontButtons"),
  weightButtons: document.querySelector("#weightButtons"),
  artCanvas: document.querySelector("#artCanvas"),
  maskCanvas: document.querySelector("#maskCanvas"),
  previewFrame: document.querySelector("#previewFrame"),
  textOutput: document.querySelector("#textOutput"),
  exportMenu: document.querySelector("#exportMenu"),
  exportToggle: document.querySelector("#exportToggle"),
  copyText: document.querySelector("#copyText"),
  downloadTxt: document.querySelector("#downloadTxt"),
  downloadPng: document.querySelector("#downloadPng"),
};

const state = {
  mode: "code",
  tab: "canvas",
  renderId: 0,
  animationId: 0,
  uploadedFonts: [],
  deviceFonts: [],
  lastArt: null,
  lastFamily: "",
  lastText: "",
  lastFileBase: "arabic-ascii",
};

const DEFAULT_FILL = "01IM:;/\\.,{}[]";
const MASK_WIDTH = 1800;
const MASK_HEIGHT = 980;
const CANVAS_CELL_WIDTH = 12;
const CANVAS_CELL_HEIGHT = 15;
const TEXT_CELL_ASPECT = 1.7;
const SHADE_RAMP = " .,:;irsXA253hMHGS#9B&@";
const PREVIEW_BACKGROUND = "#ffffff";
const GRID_COLOR = "#d6d6d6";

function cssFontFamily(family) {
  const safeFamily = String(family || "sans-serif").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${safeFamily}", "Geeza Pro", "Noto Naskh Arabic", "Noto Sans Arabic", Tahoma, Arial, sans-serif`;
}

function fileBase(text) {
  const normalized = text
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .slice(0, 32);
  return normalized || "arabic-ascii";
}

function graphemes(text) {
  const clean = String(text || "").replace(/\s+/g, "");
  if (!clean) return ["#"];
  if ("Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("ar", { granularity: "grapheme" });
    return Array.from(segmenter.segment(clean), (part) => part.segment).filter(Boolean);
  }
  return Array.from(clean);
}

function updateRangeLabels() {
  elements.sizeValue.textContent = elements.sizeRange.value;
  elements.detailValue.textContent = elements.detailRange.value;
  elements.thresholdValue.textContent = elements.thresholdRange.value;
}

function scheduleRender() {
  const renderId = ++state.renderId;
  window.requestAnimationFrame(() => {
    if (renderId === state.renderId) {
      renderArt().catch((error) => {
        console.error(error);
      });
    }
  });
}

function applyFillPreset() {
  const preset = elements.fillPreset.value;
  if (preset === "custom") {
    elements.fillText.focus();
    return;
  }

  elements.fillText.value = preset;
  scheduleRender();
}

function handleCustomFillInput() {
  if (elements.fillText.value !== elements.fillPreset.value) {
    elements.fillPreset.value = "custom";
  }

  scheduleRender();
}

function syncFontButtons() {
  const selectedFamily = elements.fontSelect.value;
  document.querySelectorAll("[data-font]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.font === selectedFamily);
  });
}

function setFontFamily(family) {
  if (!family) return;

  const exists = Array.from(elements.fontSelect.options).some((option) => option.value === family);
  if (!exists) {
    elements.fontSelect.append(new Option(family, family));
  }

  elements.fontSelect.value = family;
  syncFontButtons();
  scheduleRender();
}

function syncWeightButtons() {
  const selectedWeight = elements.fontWeight.value;
  document.querySelectorAll("[data-weight]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.weight === selectedWeight);
  });
}

function setFontWeight(weight) {
  if (!weight) return;
  elements.fontWeight.value = weight;
  syncWeightButtons();
  scheduleRender();
}

async function loadSelectedFont(size) {
  const family = elements.fontSelect.value;
  const weight = elements.fontWeight.value;
  if (document.fonts && family) {
    await document.fonts.load(`${weight} ${size}px ${cssFontFamily(family)}`);
    await document.fonts.ready;
  }
}

function drawMask(lines, family, weight, requestedSize) {
  const canvas = elements.maskCanvas;
  canvas.width = MASK_WIDTH;
  canvas.height = MASK_HEIGHT;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.clearRect(0, 0, MASK_WIDTH, MASK_HEIGHT);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "rtl";

  const maxWidth = MASK_WIDTH - 140;
  const maxHeight = MASK_HEIGHT - 130;
  let fontSize = requestedSize;

  for (let i = 0; i < 7; i += 1) {
    ctx.font = `${weight} ${fontSize}px ${cssFontFamily(family)}`;
    const widest = Math.max(...lines.map((line) => ctx.measureText(line).width), 1);
    const lineHeight = fontSize * 1.16;
    const totalHeight = lineHeight * lines.length;
    const fit = Math.min(maxWidth / widest, maxHeight / totalHeight, 1);
    if (fit >= 0.995) break;
    fontSize = Math.max(28, fontSize * fit);
  }

  ctx.font = `${weight} ${fontSize}px ${cssFontFamily(family)}`;
  const lineHeight = fontSize * 1.16;
  const startY = MASK_HEIGHT / 2 - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, MASK_WIDTH / 2, startY + index * lineHeight);
  });

  return ctx.getImageData(0, 0, MASK_WIDTH, MASK_HEIGHT);
}

function findInkBounds(imageData) {
  const { data, width, height } = imageData;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (minX > maxX || minY > maxY) {
    return null;
  }

  const pad = 34;
  return {
    minX: Math.max(0, minX - pad),
    minY: Math.max(0, minY - pad),
    maxX: Math.min(width - 1, maxX + pad),
    maxY: Math.min(height - 1, maxY + pad),
  };
}

function cellCoverage(imageData, x1, y1, x2, y2) {
  const { data, width, height } = imageData;
  const left = Math.max(0, Math.floor(x1));
  const top = Math.max(0, Math.floor(y1));
  const right = Math.min(width - 1, Math.ceil(x2));
  const bottom = Math.min(height - 1, Math.ceil(y2));
  const step = Math.max(1, Math.floor(Math.min(right - left + 1, bottom - top + 1) / 7));
  let hits = 0;
  let total = 0;

  for (let y = top; y <= bottom; y += step) {
    for (let x = left; x <= right; x += step) {
      total += 1;
      if (data[(y * width + x) * 4 + 3] > 22) {
        hits += 1;
      }
    }
  }

  return total ? hits / total : 0;
}

function charForCell(mode, coverage, fillUnits, fillIndex) {
  if (mode === "solid") return "#";
  if (mode === "shade") {
    const shadeIndex = Math.max(1, Math.min(SHADE_RAMP.length - 1, Math.round(coverage * (SHADE_RAMP.length - 1))));
    return SHADE_RAMP[shadeIndex];
  }
  return fillUnits[fillIndex % fillUnits.length];
}

function buildTextArt(imageData, bounds, text, filler) {
  const cols = Number(elements.detailRange.value);
  const cropWidth = bounds.maxX - bounds.minX + 1;
  const cropHeight = bounds.maxY - bounds.minY + 1;
  const rows = Math.max(8, Math.ceil((cropHeight / cropWidth) * cols / TEXT_CELL_ASPECT));
  const gate = Number(elements.thresholdRange.value) / 100;
  const fillUnits = graphemes(filler || text);
  const lines = [];
  const cells = [];
  let fillIndex = 0;

  for (let row = 0; row < rows; row += 1) {
    let line = "";
    for (let col = 0; col < cols; col += 1) {
      const x1 = bounds.minX + (col / cols) * cropWidth;
      const x2 = bounds.minX + ((col + 1) / cols) * cropWidth;
      const y1 = bounds.minY + (row / rows) * cropHeight;
      const y2 = bounds.minY + ((row + 1) / rows) * cropHeight;
      const coverage = cellCoverage(imageData, x1, y1, x2, y2);

      if (coverage >= gate) {
        const char = charForCell(state.mode, coverage, fillUnits, fillIndex);
        line += char;
        cells.push({ row, col, char, coverage });
        fillIndex += 1;
      } else {
        line += " ";
      }
    }
    lines.push(line.replace(/\s+$/g, ""));
  }

  return { lines, cells, cols, rows };
}

function getArtColors() {
  const artColor = elements.artColor.value || "#111111";
  const bgColor = PREVIEW_BACKGROUND;
  return { artColor, bgColor };
}

function getLayoutMetrics(art, scale) {
  const composition = elements.compositionSelect.value;
  const cellWidth = CANVAS_CELL_WIDTH * scale;
  const cellHeight = CANVAS_CELL_HEIGHT * scale;
  const baseWidth = Math.max(1, art.cols * cellWidth);
  const baseHeight = Math.max(1, art.rows * cellHeight);

  if (composition === "circle") {
    const size = Math.ceil(Math.max(baseWidth, baseHeight * 2.18, 420 * scale));
    const radiusOuter = size / 2 - 14 * scale;
    return {
      composition,
      cols: art.cols,
      rows: art.rows,
      cellWidth,
      cellHeight,
      width: size,
      height: size,
      centerX: size / 2,
      centerY: size / 2,
      radiusOuter,
      radiusInner: Math.max(12 * scale, radiusOuter - baseHeight),
    };
  }

  if (composition === "arc") {
    const curve = Math.max(48 * scale, Math.min(135 * scale, baseWidth * 0.11));
    return {
      composition,
      cols: art.cols,
      rows: art.rows,
      cellWidth,
      cellHeight,
      width: Math.ceil(baseWidth),
      height: Math.ceil(baseHeight + curve + 18 * scale),
      curve,
    };
  }

  return {
    composition,
    cols: art.cols,
    rows: art.rows,
    cellWidth,
    cellHeight,
    width: Math.ceil(baseWidth),
    height: Math.ceil(baseHeight),
  };
}

function drawGrid(ctx, art, metrics, gridColor, scale) {
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = Math.max(1, scale);

  if (metrics.composition === "circle") {
    for (let row = 0; row <= art.rows; row += 2) {
      const radius = metrics.radiusOuter - row * metrics.cellHeight;
      if (radius <= metrics.radiusInner) break;
      ctx.beginPath();
      ctx.arc(metrics.centerX, metrics.centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let col = 0; col < art.cols; col += 4) {
      const angle = -Math.PI / 2 + (col / art.cols) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(
        metrics.centerX + Math.cos(angle) * metrics.radiusInner,
        metrics.centerY + Math.sin(angle) * metrics.radiusInner
      );
      ctx.lineTo(
        metrics.centerX + Math.cos(angle) * metrics.radiusOuter,
        metrics.centerY + Math.sin(angle) * metrics.radiusOuter
      );
      ctx.stroke();
    }
  } else {
    for (let x = 0; x < metrics.width; x += metrics.cellWidth) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, metrics.height);
      ctx.stroke();
    }
    for (let y = 0; y < metrics.height; y += metrics.cellHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(metrics.width, y + 0.5);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function getCellPosition(cell, art, metrics) {
  if (metrics.composition === "circle") {
    const angle = -Math.PI / 2 + ((cell.col + 0.5) / art.cols) * Math.PI * 2;
    const radius = metrics.radiusOuter - (cell.row + 0.54) * metrics.cellHeight;
    return {
      x: metrics.centerX + Math.cos(angle) * radius,
      y: metrics.centerY + Math.sin(angle) * radius,
      rotation: angle + Math.PI / 2,
      scanPosition: (angle + Math.PI * 1.5) % (Math.PI * 2),
    };
  }

  const x = cell.col * metrics.cellWidth + metrics.cellWidth / 2;
  let y = cell.row * metrics.cellHeight + metrics.cellHeight * 0.55;
  let rotation = 0;

  if (metrics.composition === "arc") {
    const t = art.cols > 1 ? cell.col / (art.cols - 1) : 0.5;
    y = metrics.curve + y - Math.sin(t * Math.PI) * metrics.curve * 0.82;
    rotation = Math.cos(t * Math.PI) * -0.18;
  }

  return { x, y, rotation, scanPosition: y };
}

function getCellAlpha(cell, position, metrics, animation, timestamp, scale) {
  if (animation === "scan") {
    if (metrics.composition === "circle") {
      const cycle = Math.PI * 2;
      const scan = ((timestamp / 1700) % 1) * cycle;
      const rawDistance = Math.abs(position.scanPosition - scan);
      const distance = Math.min(rawDistance, cycle - rawDistance);
      return 0.42 + Math.max(0, 1 - distance / 0.34) * 0.58;
    }

    const scanY = ((timestamp / 1700) % 1) * metrics.height;
    const distance = Math.abs(position.scanPosition - scanY);
    return 0.42 + Math.max(0, 1 - distance / (62 * scale)) * 0.58;
  }

  if (animation === "flicker") {
    const pulse = Math.sin(timestamp / 75 + cell.col * 1.7 + cell.row * 0.91);
    return pulse > -0.18 ? 1 : 0.58;
  }

  if (animation === "wave") {
    const pulse = Math.sin(timestamp / 260 + cell.col * 0.18 + cell.row * 0.42);
    return 0.78 + (pulse + 1) * 0.11;
  }

  if (animation === "reveal") {
    const cycle = (timestamp / 2600) % 1;
    const positionRatio = (cell.col / Math.max(1, metrics.cols || 1)) * 0.72 + (cell.row / Math.max(1, metrics.rows || 1)) * 0.28;
    const head = cycle * 1.35 - 0.12;
    const distance = head - positionRatio;
    if (distance < 0) return 0.08;
    return Math.min(1, 0.18 + distance / 0.16);
  }

  if (animation === "orbit") {
    const pulse = Math.sin(timestamp / 520 + cell.col * 0.25 + cell.row * 0.36);
    return 0.86 + (pulse + 1) * 0.07;
  }

  if (animation === "glitch") {
    const noise = seededNoise(cell.col, cell.row, Math.floor(timestamp / 120));
    return noise > 0.94 ? 0.42 : 1;
  }

  return 1;
}

function seededNoise(col, row, frame) {
  const raw = Math.sin(col * 12.9898 + row * 78.233 + frame * 37.719) * 43758.5453;
  return raw - Math.floor(raw);
}

function getAnimationTransform(cell, position, metrics, animation, timestamp, scale) {
  if (animation === "wave") {
    return {
      x: position.x,
      y: position.y + Math.sin(timestamp / 260 + cell.col * 0.18 + cell.row * 0.42) * 3.4 * scale,
      rotation: position.rotation,
      char: cell.char,
    };
  }

  if (animation === "orbit") {
    const phase = timestamp / 680 + cell.col * 0.21 + cell.row * 0.47;
    return {
      x: position.x + Math.cos(phase) * 1.7 * scale,
      y: position.y + Math.sin(phase) * 1.7 * scale,
      rotation: position.rotation + Math.sin(phase) * 0.035,
      char: cell.char,
    };
  }

  if (animation === "glitch") {
    const frame = Math.floor(timestamp / 120);
    const noise = seededNoise(cell.col, cell.row, frame);
    if (noise > 0.92) {
      const chars = elements.fillText.value.trim() || DEFAULT_FILL;
      const units = graphemes(chars);
      const char = units[Math.floor(noise * units.length) % units.length] || cell.char;
      return {
        x: position.x + (noise > 0.965 ? 4 : -3) * scale,
        y: position.y,
        rotation: position.rotation,
        char,
      };
    }
  }

  return {
    x: position.x,
    y: position.y,
    rotation: position.rotation,
    char: cell.char,
  };
}

function drawArtCanvas(canvas, art, options = {}) {
  const scale = options.scale || 1;
  const metrics = getLayoutMetrics(art, scale);
  const { artColor, bgColor } = getArtColors();
  const includeBackground = options.includeBackground !== false;
  const includeGrid = options.includeGrid === true && includeBackground;
  const animation = options.animation || "none";
  const timestamp = options.timestamp || 0;

  if (canvas.width !== metrics.width) canvas.width = metrics.width;
  if (canvas.height !== metrics.height) canvas.height = metrics.height;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, metrics.width, metrics.height);

  if (includeBackground) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, metrics.width, metrics.height);
  }

  if (includeGrid) {
    drawGrid(ctx, art, metrics, GRID_COLOR, scale);
  }

  ctx.font = `${Math.max(8, Math.round(13 * scale))}px "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "ltr";
  ctx.fillStyle = artColor;

  art.cells.forEach((cell) => {
    const position = getCellPosition(cell, art, metrics);
    const alpha = getCellAlpha(cell, position, metrics, animation, timestamp, scale);
    const animated = getAnimationTransform(cell, position, metrics, animation, timestamp, scale);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(animated.x, animated.y);
    ctx.rotate(animated.rotation);
    ctx.fillText(animated.char, 0, 0);
    ctx.restore();
  });
}

function drawPreview(art, timestamp = 0) {
  drawArtCanvas(elements.artCanvas, art, {
    scale: 1,
    includeBackground: true,
    includeGrid: elements.gridToggle.checked,
    animation: elements.animationSelect.value,
    timestamp,
  });
}

function stopAnimationLoop() {
  if (state.animationId) {
    window.cancelAnimationFrame(state.animationId);
    state.animationId = 0;
  }
}

function updateAnimation() {
  const animation = elements.animationSelect.value;
  elements.previewFrame.classList.toggle("is-scan", animation === "scan");
  elements.previewFrame.classList.toggle("is-flicker", animation === "flicker");
}

function startAnimationLoop() {
  stopAnimationLoop();
  updateAnimation();

  if (!state.lastArt) return;

  if (elements.animationSelect.value === "none") {
    drawPreview(state.lastArt, 0);
    return;
  }

  const tick = (timestamp) => {
    drawPreview(state.lastArt, timestamp);
    state.animationId = window.requestAnimationFrame(tick);
  };

  state.animationId = window.requestAnimationFrame(tick);
}

function trimTransparentCanvas(sourceCanvas, padding) {
  const ctx = sourceCanvas.getContext("2d");
  const { width, height } = sourceCanvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return sourceCanvas;

  const left = Math.max(0, minX - padding);
  const top = Math.max(0, minY - padding);
  const cropWidth = Math.min(width - left, maxX - minX + 1 + padding * 2);
  const cropHeight = Math.min(height - top, maxY - minY + 1 + padding * 2);
  const trimmed = document.createElement("canvas");
  trimmed.width = cropWidth;
  trimmed.height = cropHeight;
  trimmed.getContext("2d").drawImage(sourceCanvas, left, top, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return trimmed;
}

function createExportCanvas() {
  const scale = Number(elements.exportScale.value || 4);
  const includeBackground = elements.exportBackground.checked;
  const canvas = document.createElement("canvas");
  drawArtCanvas(canvas, state.lastArt, {
    scale,
    includeBackground,
    includeGrid: includeBackground && elements.gridToggle.checked,
    animation: "none",
    timestamp: 0,
  });

  if (includeBackground) return canvas;
  return trimTransparentCanvas(canvas, Math.round(22 * scale));
}

async function renderArt() {
  stopAnimationLoop();
  updateRangeLabels();
  updateAnimation();
  const rawText = elements.sourceText.value.trim() || "حب";
  const lines = rawText.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const filler = elements.fillText.value.trim() || DEFAULT_FILL;
  const family = elements.fontSelect.value || "Geeza Pro";
  const weight = elements.fontWeight.value;
  const requestedSize = Number(elements.sizeRange.value);

  await loadSelectedFont(requestedSize);

  const imageData = drawMask(lines.length ? lines : ["حب"], family, weight, requestedSize);
  const bounds = findInkBounds(imageData);
  if (!bounds) {
    elements.textOutput.textContent = "";
    return;
  }

  const art = buildTextArt(imageData, bounds, rawText, filler);
  state.lastArt = art;
  state.lastFamily = family;
  state.lastText = art.lines.join("\n");
  state.lastFileBase = fileBase(rawText);

  drawPreview(art, 0);
  elements.textOutput.textContent = state.lastText;
  elements.textOutput.style.color = elements.artColor.value || "#111111";
  elements.textOutput.style.backgroundColor = "transparent";
  startAnimationLoop();
}

async function handleFontUpload(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  const loaded = [];
  const failed = [];

  for (const [index, file] of files.entries()) {
    try {
      const buffer = await file.arrayBuffer();
      const family = `Uploaded Arabic ${Date.now()} ${index}`;
      const face = new FontFace(family, buffer);
      await face.load();
      document.fonts.add(face);

      const label = file.name.replace(/\.(ttf|otf|woff2?|TTF|OTF|WOFF2?)$/, "");
      const option = new Option(label, family);
      option.dataset.uploaded = "true";
      elements.fontSelect.prepend(option);
      loaded.push({ label, family });
    } catch (error) {
      console.error(error);
      failed.push(file.name);
    }
  }

  if (loaded.length) {
    state.uploadedFonts.unshift(...loaded);
    renderFontList();
    setFontFamily(loaded[0].family);
  } else {
    elements.fontList.textContent = "تعذر تحميل الخطوط";
  }

  event.target.value = "";
}

function renderFontList() {
  const fonts = [...state.uploadedFonts, ...state.deviceFonts];
  elements.fontList.textContent = "";

  if (!fonts.length) {
    elements.fontList.textContent = "لم يتم اختيار خطوط بعد";
    return;
  }

  fonts.slice(0, 10).forEach((font) => {
    const button = document.createElement("button");
    button.className = "font-pill";
    button.type = "button";
    button.dataset.font = font.family;
    button.textContent = font.label;
    elements.fontList.append(button);
  });

  if (fonts.length > 10) {
    const more = document.createElement("span");
    more.textContent = `+${fonts.length - 10}`;
    elements.fontList.append(more);
  }

  syncFontButtons();
}

async function scanLocalFonts() {
  if (!("queryLocalFonts" in window)) {
    elements.fontList.textContent = "فحص خطوط الجهاز غير متاح";
    return;
  }

  try {
    const availableFonts = await window.queryLocalFonts();
    const existing = new Set(Array.from(elements.fontSelect.options, (option) => option.value));
    const families = Array.from(new Set(availableFonts.map((font) => font.family))).sort((a, b) => a.localeCompare(b));

    families.forEach((family) => {
      if (!existing.has(family)) {
        elements.fontSelect.append(new Option(family, family));
      }
    });

    const arabicFamilies = families.filter((family) => /arabic|naskh|kufi|amiri|geeza|scheherazade|ruqaa|dubai|cairo|tajawal/i.test(family));
    state.deviceFonts = arabicFamilies.slice(0, 10).map((family) => ({ label: family, family }));
    renderFontList();

    const arabicHint = arabicFamilies[0];
    if (arabicHint) {
      setFontFamily(arabicHint);
    } else {
      elements.fontList.textContent = "لم يتم العثور على خطوط عربية واضحة";
    }
  } catch (error) {
    console.error(error);
    elements.fontList.textContent = "تعذر فحص خطوط الجهاز";
  }
}

async function copyArtText() {
  if (!state.lastText) return;

  let copied = false;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(state.lastText);
      copied = true;
    } catch {
      copied = false;
    }
  }

  if (!copied) {
    const helper = document.createElement("textarea");
    helper.value = state.lastText;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.left = "-9999px";
    document.body.append(helper);
    helper.select();
    copied = document.execCommand("copy");
    helper.remove();
  }

}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadTextFile() {
  const blob = new Blob([state.lastText], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, `${state.lastFileBase}.txt`);
}

function downloadPngFile() {
  if (!state.lastArt) {
    return;
  }

  const exportCanvas = createExportCanvas();
  exportCanvas.toBlob((blob) => {
    if (!blob) {
      return;
    }
    downloadBlob(blob, `${state.lastFileBase}.png`);
  }, "image/png");
}

function setMode(mode) {
  state.mode = mode;
  elements.modeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });
  scheduleRender();
}

function setTab(tab) {
  state.tab = tab;
  elements.tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tab);
  });
  elements.artCanvas.classList.toggle("is-hidden", tab !== "canvas");
  elements.textOutput.classList.toggle("is-hidden", tab !== "text");
}

function setExportMenu(open) {
  elements.exportMenu.classList.toggle("is-open", open);
  elements.exportToggle.setAttribute("aria-expanded", String(open));
}

function toggleExportMenu() {
  setExportMenu(!elements.exportMenu.classList.contains("is-open"));
}

[
  elements.sourceText,
  elements.compositionSelect,
  elements.artColor,
  elements.animationSelect,
  elements.gridToggle,
  elements.exportBackground,
  elements.sizeRange,
  elements.detailRange,
  elements.thresholdRange,
].forEach((control) => {
  control.addEventListener("input", scheduleRender);
  control.addEventListener("change", scheduleRender);
});

elements.fillPreset.addEventListener("change", applyFillPreset);
elements.fillText.addEventListener("input", handleCustomFillInput);
elements.fontButtons.addEventListener("click", (event) => {
  const button = event.target.closest("[data-font]");
  if (button) setFontFamily(button.dataset.font);
});
elements.fontList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-font]");
  if (button) setFontFamily(button.dataset.font);
});
elements.weightButtons.addEventListener("click", (event) => {
  const button = event.target.closest("[data-weight]");
  if (button) setFontWeight(button.dataset.weight);
});
elements.fontUploadTrigger.addEventListener("click", () => elements.fontUpload.click());
elements.fontUpload.addEventListener("change", handleFontUpload);
elements.scanFonts.addEventListener("click", scanLocalFonts);
elements.exportToggle.addEventListener("click", toggleExportMenu);
elements.copyText.addEventListener("click", copyArtText);
elements.downloadTxt.addEventListener("click", downloadTextFile);
elements.downloadPng.addEventListener("click", downloadPngFile);

[elements.copyText, elements.downloadTxt, elements.downloadPng].forEach((button) => {
  button.addEventListener("click", () => setExportMenu(false));
});

document.addEventListener("click", (event) => {
  if (!elements.exportMenu.contains(event.target)) {
    setExportMenu(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setExportMenu(false);
  }
});

elements.modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

elements.tabButtons.forEach((button) => {
  button.addEventListener("click", () => setTab(button.dataset.tab));
});

updateRangeLabels();
syncFontButtons();
syncWeightButtons();
setTab("canvas");
scheduleRender();
