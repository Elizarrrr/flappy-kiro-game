/**
 * game-logic.js — Pure functions for Flappy Kiro
 *
 * All functions here are side-effect-free and operate only on their
 * arguments. They can be required/imported in Node.js for property-based
 * testing without a browser or canvas.
 *
 * Functions are stubs; full implementations are added in later tasks.
 */

// ─── PHYSICS ─────────────────────────────────────────────────────────────────

/**
 * Apply one game-loop tick of gravity + position update to ghosty.
 * Also computes the rotation angle from the current velocity.
 *
 * @param {{ y: number, vy: number, rotation: number }} ghosty
 * @param {{ gravity: number, maxFallSpeed: number }} config
 * @returns {{ y: number, vy: number, rotation: number }}
 */
function tickGhosty(ghosty, config) {
  ghosty.vy += config.gravity;
  ghosty.vy = Math.min(ghosty.vy, config.maxFallSpeed);
  ghosty.y += ghosty.vy;

  // Map vy from [-9, 12] to [-π/4, π/2]
  const vyMin = -9, vyMax = 12;
  const rotMin = -Math.PI / 4, rotMax = Math.PI / 2;
  const t = (ghosty.vy - vyMin) / (vyMax - vyMin);
  ghosty.rotation = rotMin + t * (rotMax - rotMin);
  ghosty.rotation = Math.max(rotMin, Math.min(rotMax, ghosty.rotation));

  return ghosty;
}

// ─── PIPE SPAWNING & SCROLLING ───────────────────────────────────────────────

/**
 * Spawn a new pipe at the right edge of the canvas with a randomised gap.
 *
 * @param {{ canvasW: number, canvasH: number, scoreBarH: number, pipeWidth: number, gapHeight: number }} config
 * @returns {{ x: number, gapY: number, gapHeight: number, width: number, scored: boolean }}
 */
function spawnPipe(config) {
  const MIN_GAP_MARGIN = 60;
  const minGapY = MIN_GAP_MARGIN;
  const maxGapY = config.canvasH - config.scoreBarH - config.gapHeight - MIN_GAP_MARGIN;
  const gapY = minGapY + Math.random() * (maxGapY - minGapY);
  return {
    x:         config.canvasW,
    gapY,
    gapHeight: config.gapHeight,
    width:     config.pipeWidth,
    scored:    false,
  };
}

/**
 * Scroll all pipes left by pipeSpeed and remove any that have left the canvas.
 *
 * @param {Array} pipes
 * @param {{ pipeSpeed: number }} config
 * @returns {Array} updated pipes array
 */
function scrollPipes(pipes, config) {
  return pipes
    .map(pipe => ({ ...pipe, x: pipe.x - config.pipeSpeed }))
    .filter(pipe => pipe.x + pipe.width >= 0);
}

// ─── COLLISION DETECTION ─────────────────────────────────────────────────────

/**
 * Axis-Aligned Bounding Box collision test.
 *
 * @param {{ x: number, y: number, width: number, height: number }} a
 * @param {{ x: number, y: number, width: number, height: number }} b
 * @returns {boolean}
 */
function checkAABB(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

/**
 * Check whether ghosty has hit the top or bottom canvas boundary.
 *
 * @param {{ y: number, height: number }} ghosty
 * @param {{ canvasH: number, scoreBarH: number }} config
 * @returns {boolean}
 */
function checkBoundaryCollision(ghosty, config) {
  return ghosty.y < 0 || ghosty.y + ghosty.height > config.canvasH - config.scoreBarH;
}

// ─── SCORING ─────────────────────────────────────────────────────────────────

/**
 * Check whether ghosty has passed any unscored pipes and increment the score.
 *
 * @param {{ x: number, width: number }} ghosty
 * @param {Array} pipes
 * @param {number} score
 * @returns {{ score: number, newlyScored: Array }}
 */
function checkScoring(ghosty, pipes, score) {
  const newlyScored = [];
  for (const pipe of pipes) {
    if (!pipe.scored && ghosty.x > pipe.x + pipe.width) {
      pipe.scored = true;
      score++;
      newlyScored.push(pipe);
    }
  }
  return { score, newlyScored };
}

/**
 * Format the score bar string.
 *
 * @param {number} score
 * @param {number} highScore
 * @returns {string}  e.g. "Score: 3 | High: 7"
 */
function formatScoreBar(score, highScore) {
  return `Score: ${score} | High: ${highScore}`;
}

/**
 * Load the high score from localStorage (falls back to 0 on error).
 *
 * @returns {number}
 */
function loadHighScore() {
  try {
    return parseInt(localStorage.getItem('flappyKiroHighScore'), 10) || 0;
  } catch {
    return 0;
  }
}

/**
 * Persist the high score to localStorage (silently ignores errors).
 *
 * @param {number} score
 */
function saveHighScore(score) {
  try {
    localStorage.setItem('flappyKiroHighScore', String(score));
  } catch {}
}

// ─── CLOUD SPAWNING & SCROLLING ──────────────────────────────────────────────

/**
 * Spawn a new cloud at the right edge of the canvas.
 *
 * @param {{ canvasW: number, canvasH: number, cloudLayers: Array }} config
 * @returns {{ x: number, y: number, width: number, height: number, layer: number }}
 */
function spawnCloud(config) {
  const layer = Math.floor(Math.random() * 3);
  const x = config.canvasW;
  const y = Math.random() * config.canvasH * 0.6;
  const width = 40 + Math.random() * 60;
  const height = 20 + Math.random() * 25;
  return { x, y, width, height, layer };
}

/**
 * Scroll all clouds left by their layer speed and remove off-screen ones.
 *
 * @param {Array} clouds
 * @param {{ cloudLayers: Array }} config
 * @returns {Array} updated clouds array
 */
function scrollClouds(clouds, config) {
  return clouds
    .map(cloud => ({ ...cloud, x: cloud.x - config.cloudLayers[cloud.layer].speed }))
    .filter(cloud => cloud.x + cloud.width >= 0);
}

// ─── PARTICLES ───────────────────────────────────────────────────────────────

/**
 * Emit a single new particle from ghosty's trailing edge.
 *
 * @param {{ x: number, y: number, height: number }} ghosty
 * @param {object} config
 * @returns {{ x: number, y: number, vx: number, vy: number, opacity: number, size: number }}
 */
function emitParticle(ghosty, config) {
  return {
    x:       ghosty.x,
    y:       ghosty.y + ghosty.height / 2 + (Math.random() - 0.5) * 10,
    vx:      -(0.5 + Math.random() * 1.5),
    vy:      (Math.random() - 0.5) * 1.0,
    opacity: 0.7,
    size:    2 + Math.random() * 3,
  };
}

/**
 * Advance all particles by one tick: move, decay opacity, remove dead ones.
 *
 * @param {Array} particles
 * @param {{ particleOpacityDecay: number }} config
 * @returns {Array} updated particles array
 */
function tickParticles(particles, config) {
  return particles
    .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, opacity: p.opacity - config.particleOpacityDecay }))
    .filter(p => p.opacity > 0);
}

// ─── SCORE POPUPS ────────────────────────────────────────────────────────────

/**
 * Spawn a score popup at the center of the scored pipe's gap.
 *
 * @param {{ x: number, width: number, gapY: number, gapHeight: number }} pipe
 * @param {{ popupMaxAge: number }} config
 * @returns {{ x: number, y: number, opacity: number, vy: number, age: number, maxAge: number }}
 */
function spawnScorePopup(pipe, config) {
  return {
    x:      pipe.x + pipe.width / 2,
    y:      pipe.gapY + pipe.gapHeight / 2,
    opacity: 1,
    vy:     -1.5,
    age:    0,
    maxAge: config.popupMaxAge,
  };
}

/**
 * Advance all score popups: move, age, fade, remove expired ones.
 *
 * @param {Array} popups
 * @param {number} dt  delta time in ms
 * @param {{ popupMaxAge: number }} config
 * @returns {Array} updated popups array
 */
function tickScorePopups(popups, dt, config) {
  return popups
    .map(p => ({ ...p, age: p.age + dt, y: p.y + p.vy, opacity: 1 - ((p.age + dt) / p.maxAge) }))
    .filter(p => p.age < p.maxAge);
}

// ─── SCREEN SHAKE ────────────────────────────────────────────────────────────

/**
 * Activate the screen shake effect.
 *
 * @param {{ active: boolean, elapsed: number, offsetX: number, offsetY: number }} shakeState
 * @param {{ shakeDuration: number, shakeMagnitude: number }} config
 */
function triggerShake(shakeState, config) {
  shakeState.active    = true;
  shakeState.elapsed   = 0;
  shakeState.duration  = config.shakeDuration;
  shakeState.magnitude = config.shakeMagnitude;
}

/**
 * Advance the screen shake by dt milliseconds.
 *
 * @param {{ active: boolean, elapsed: number, offsetX: number, offsetY: number }} shakeState
 * @param {number} dt  delta time in ms
 * @param {{ shakeDuration: number, shakeMagnitude: number }} config
 */
function tickShake(shakeState, dt, config) {
  if (!shakeState.active) return;
  shakeState.elapsed += dt;
  if (shakeState.elapsed >= shakeState.duration) {
    shakeState.active  = false;
    shakeState.offsetX = 0;
    shakeState.offsetY = 0;
  } else {
    shakeState.offsetX = (Math.random() - 0.5) * 2 * shakeState.magnitude;
    shakeState.offsetY = (Math.random() - 0.5) * 2 * shakeState.magnitude;
  }
}

// ─── EXPORTS (Node.js / test environment) ────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    tickGhosty,
    spawnPipe,
    scrollPipes,
    checkAABB,
    checkBoundaryCollision,
    checkScoring,
    formatScoreBar,
    loadHighScore,
    saveHighScore,
    spawnCloud,
    scrollClouds,
    emitParticle,
    tickParticles,
    spawnScorePopup,
    tickScorePopups,
    triggerShake,
    tickShake,
  };
}
