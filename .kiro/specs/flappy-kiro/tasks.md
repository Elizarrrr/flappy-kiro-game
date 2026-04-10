# Implementation Plan: Flappy Kiro

## Overview

Implement a single-file browser game (`index.html`) with inline CSS and JS, plus a `game-logic.js` module for pure/testable functions. All rendering uses HTML5 Canvas. A central `CONFIG` object controls all tunable parameters. Game states: LOADING → START → PLAYING → GAME_OVER (or ERROR).

## Tasks

- [x] 1. Set up project skeleton and CONFIG
  - Create `index.html` with `<canvas id="gameCanvas">`, inline `<style>` for canvas centering, and a `<script>` block
  - Create `game-logic.js` as a separate module for pure functions (physics, collision, scoring, spawning helpers)
  - Declare the `CONFIG` object at the top of the script with all tunable parameters from the design
  - Declare `gameState`, `ghosty`, `pipes`, `clouds`, `particles`, `scorePopups`, and `shakeState` data structures
  - _Requirements: 1.1, 1.3_

- [x] 2. Asset loading and error handling
  - [x] 2.1 Implement `loadAssets()` to load `ghosty.png`, `jump.wav`, `game_over.wav` in parallel using `Promise.all`
    - On success set `gameState.phase = 'START'` and call `startGameLoop()`
    - On any failure set `gameState.phase = 'ERROR'` and render a descriptive error message to the canvas
    - Wire `<audio id="bgMusic">` element for background music; catch its `error` event and continue without music (non-fatal)
    - _Requirements: 1.4, 1.5, 9.1_

- [x] 3. Input handling
  - [x] 3.1 Attach `keydown` (spacebar), `click`, and `touchstart` listeners to the canvas
    - Dispatch to `handleFlap()` when `PLAYING`, `handleStart()` when `START`, `handleRestart()` when `GAME_OVER`
    - `handleFlap()` sets `ghosty.vy = CONFIG.flapVelocity` and plays `jump.wav` via Web Audio API
    - _Requirements: 2.1, 2.5_

- [x] 4. Physics — gravity, velocity, position
  - [x] 4.1 Implement `tickGhosty(ghosty, config)` in `game-logic.js`
    - Apply gravity: `vy += config.gravity`; cap at `config.maxFallSpeed`
    - Update position: `y += vy`
    - Compute `rotation` from `vy` clamped to `[-π/4, π/2]`
    - _Requirements: 2.2, 2.3, 2.4_

  - [ ]* 4.2 Write property test for `tickGhosty` — Property 1: Physics tick
    - **Property 1: Physics tick — gravity and position update**
    - **Validates: Requirements 2.2, 2.3**

  - [ ]* 4.3 Write property test for `tickGhosty` — Property 2: Ghosty rotation reflects velocity
    - **Property 2: Ghosty rotation reflects velocity**
    - **Validates: Requirements 2.4**

- [x] 5. Pipe spawning and scrolling
  - [x] 5.1 Implement `spawnPipe(config)` in `game-logic.js`
    - Randomize `gapY` within `[MIN_GAP_MARGIN, canvasH - scoreBarH - gapHeight - MIN_GAP_MARGIN]`
    - Return a pipe object with `x = config.canvasW`, `gapHeight = config.gapHeight`, `scored = false`
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 5.2 Write property test for `spawnPipe` — Property 3: Pipe spawn invariants
    - **Property 3: Pipe spawn invariants**
    - **Validates: Requirements 3.2, 3.3**

  - [x] 5.3 Implement `scrollPipes(pipes, config)` in `game-logic.js`
    - Decrement each pipe's `x` by `config.pipeSpeed`
    - Filter out pipes where `pipe.x + pipe.width < 0`
    - _Requirements: 3.4, 3.5_

  - [ ]* 5.4 Write property test for `scrollPipes` — Property 4: Pipe scrolling
    - **Property 4: Pipe scrolling**
    - **Validates: Requirements 3.4**

  - [ ]* 5.5 Write property test for `scrollPipes` — Property 5: Off-screen pipe cleanup
    - **Property 5: Off-screen pipe cleanup**
    - **Validates: Requirements 3.5**

- [x] 6. Collision detection
  - [x] 6.1 Implement `checkAABB(a, b)` in `game-logic.js`
    - Standard AABB: returns `true` iff rectangles overlap
    - _Requirements: 4.1_

  - [ ]* 6.2 Write property test for `checkAABB` — Property 6: AABB collision detection correctness
    - **Property 6: AABB collision detection correctness**
    - **Validates: Requirements 4.1**

  - [x] 6.3 Implement `checkBoundaryCollision(ghosty, config)` in `game-logic.js`
    - Returns `true` if `ghosty.y < 0` or `ghosty.y + ghosty.height > config.canvasH - config.scoreBarH`
    - _Requirements: 4.2_

  - [ ]* 6.4 Write property test for `checkBoundaryCollision` — Property 7: Canvas boundary collision
    - **Property 7: Canvas boundary collision**
    - **Validates: Requirements 4.2**

  - [x] 6.5 Wire collision checks into the game loop
    - On collision: stop loop, play `game_over.wav`, stop background music, trigger screen shake, set `gameState.phase = 'GAME_OVER'`, update high score
    - _Requirements: 4.3, 4.5, 9.2, 9.4_

- [x] 7. Scoring and high score persistence
  - [x] 7.1 Implement `checkScoring(ghosty, pipes, score)` in `game-logic.js`
    - For each unscored pipe where `ghosty.x > pipe.x + pipe.width`, mark `scored = true` and increment score
    - Return `{ score, newlyScored: pipe[] }`
    - _Requirements: 5.1_

  - [ ]* 7.2 Write property test for `checkScoring` — Property 9: Score increments on pipe pass
    - **Property 9: Score increments on pipe pass**
    - **Validates: Requirements 5.1**

  - [x] 7.3 Implement `formatScoreBar(score, highScore)` in `game-logic.js`
    - Returns the string `Score: {score} | High: {highScore}`
    - _Requirements: 5.2_

  - [ ]* 7.4 Write property test for `formatScoreBar` — Property 10: Score bar format
    - **Property 10: Score bar format**
    - **Validates: Requirements 5.2**

  - [x] 7.5 Implement `loadHighScore()` and `saveHighScore(score)` in `game-logic.js`
    - Wrap `localStorage` access in `try/catch`; fall back to in-memory value on error
    - Use key `flappyKiroHighScore`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 7.6 Write property test for high score persistence — Property 8: High score persistence
    - **Property 8: High score persistence**
    - **Validates: Requirements 4.5, 6.3**

- [x] 8. Checkpoint — core gameplay loop
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Cloud spawning and parallax scrolling
  - [x] 9.1 Implement `spawnCloud(config)` in `game-logic.js`
    - Randomize `layer` (0/1/2), `x = config.canvasW`, `y` within upper 60% of canvas, randomized `width`/`height`
    - _Requirements: 7.1, 7.2, 7.4_

  - [ ]* 9.2 Write property test for `spawnCloud` — Property 13: Cloud spawn position
    - **Property 13: Cloud spawn position**
    - **Validates: Requirements 7.4**

  - [x] 9.3 Implement `scrollClouds(clouds, config)` in `game-logic.js`
    - Scroll each cloud by its layer speed (`config.cloudLayers[layer].speed`); remove off-screen clouds
    - _Requirements: 7.1, 7.2_

  - [ ]* 9.4 Write property test for `scrollClouds` — Property 11: Cloud scroll speed invariant
    - **Property 11: Cloud scroll speed invariant**
    - **Validates: Requirements 7.1**

  - [ ]* 9.5 Write property test for cloud opacity ordering — Property 12: Cloud layer opacity ordering
    - **Property 12: Cloud layer opacity ordering**
    - **Validates: Requirements 7.3**

  - [ ]* 9.6 Write property test for clouds excluded from collision — Property 14: Clouds excluded from collision detection
    - **Property 14: Clouds excluded from collision detection**
    - **Validates: Requirements 7.5**

- [x] 10. Particles and score popups
  - [x] 10.1 Implement `emitParticle(ghosty, config)` in `game-logic.js`
    - Returns a new particle at Ghosty's trailing edge with negative `vx`, small random `vy`, `opacity = 0.7`
    - _Requirements: 9.6_

  - [ ]* 10.2 Write property test for particle emission — Property 17: Particle emission each tick
    - **Property 17: Particle emission each tick**
    - **Validates: Requirements 9.6**

  - [x] 10.3 Implement `tickParticles(particles, config)` in `game-logic.js`
    - Decrease each particle's opacity by `config.particleOpacityDecay`; filter out particles with `opacity <= 0`
    - _Requirements: 9.7_

  - [ ]* 10.4 Write property test for particle lifecycle — Property 18: Particle lifecycle
    - **Property 18: Particle lifecycle**
    - **Validates: Requirements 9.7**

  - [x] 10.5 Implement `spawnScorePopup(pipe, config)` in `game-logic.js`
    - Returns a popup with `x = pipe.x + pipe.width / 2`, `y = pipe.gapY + pipe.gapHeight / 2`, `opacity = 1`, `vy = -1.5`, `age = 0`, `maxAge = config.popupMaxAge`
    - _Requirements: 9.8_

  - [ ]* 10.6 Write property test for score popup spawn — Property 19: Score popup spawned at gap center
    - **Property 19: Score popup spawned at gap center**
    - **Validates: Requirements 9.8**

  - [x] 10.7 Implement `tickScorePopups(popups, dt, config)` in `game-logic.js`
    - Advance `age` by `dt`; move `y` by `vy`; decrease `opacity`; remove popups where `age >= maxAge`
    - _Requirements: 9.9_

  - [ ]* 10.8 Write property test for score popup lifecycle — Property 20: Score popup lifecycle
    - **Property 20: Score popup lifecycle**
    - **Validates: Requirements 9.9**

- [x] 11. Screen shake
  - [x] 11.1 Implement `triggerShake(shakeState, config)` and `tickShake(shakeState, dt)` in `game-logic.js`
    - `triggerShake` sets `active = true`, `elapsed = 0`
    - `tickShake` advances `elapsed`; computes random offset within `magnitude`; sets `active = false` when `elapsed >= duration`
    - _Requirements: 9.4, 9.5_

- [x] 12. Rendering pipeline
  - [x] 12.1 Implement `drawBackground(ctx, config)` — solid light-blue fill with sketchy grid lines
    - _Requirements: 1.2_

  - [x] 12.2 Implement `drawClouds(ctx, clouds, config)` — render clouds far→near using layer opacity from `CONFIG.cloudLayers`
    - _Requirements: 7.2, 7.3_

  - [x] 12.3 Implement `drawPipes(ctx, pipes, config)` — green rectangles with sketchy border for top and bottom segments
    - _Requirements: 3.6_

  - [x] 12.4 Implement `drawGhosty(ctx, ghosty, image)` — draw rotated sprite centered on ghosty position
    - _Requirements: 2.4_

  - [x] 12.5 Implement `drawParticles(ctx, particles)` — semi-transparent circles at each particle position
    - _Requirements: 9.7_

  - [x] 12.6 Implement `drawScorePopups(ctx, popups)` — floating "+1" text at popup position with current opacity
    - _Requirements: 9.8, 9.9_

  - [x] 12.7 Implement `drawScoreBar(ctx, score, highScore, config)` — bottom bar with `formatScoreBar` output
    - _Requirements: 5.2, 5.3_

  - [x] 12.8 Implement `drawStartScreen(ctx, config)` and `drawGameOverScreen(ctx, score, highScore, config)`
    - Start screen: Ghosty centered, prompt to press spacebar or tap
    - Game over screen: final score, high score, restart prompt
    - _Requirements: 1.2, 4.4_

- [x] 13. Game loop wiring
  - [x] 13.1 Implement `gameLoop(timestamp)` using `requestAnimationFrame`
    - Compute delta time capped at 100 ms
    - Call all tick functions (physics, pipes, clouds, particles, popups, shake, scoring, collision)
    - Apply shake offset to canvas context, then call all draw functions in painter's-algorithm order
    - _Requirements: 1.4, 2.2, 2.3, 3.4, 9.6_

  - [x] 13.2 Implement `startGame()` and `restartGame()`
    - `startGame`: set phase to PLAYING, start bgMusic, schedule first pipe spawn
    - `restartGame`: reset score, clear pipes/particles/popups, reposition ghosty, resume bgMusic, restart loop
    - _Requirements: 8.1, 8.2, 8.3, 9.1, 9.3_

  - [ ]* 13.3 Write property test for game restart state reset — Property 15: Game restart resets state
    - **Property 15: Game restart resets state**
    - **Validates: Requirements 8.1**

  - [ ]* 13.4 Write property test for high score preserved across restart — Property 16: High score preserved across restart
    - **Property 16: High score preserved across restart**
    - **Validates: Requirements 8.2**

- [ ] 14. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- `game-logic.js` exports pure functions; `index.html` imports it via `<script src="game-logic.js">` before the main script
- Property tests use [fast-check](https://github.com/dubzzz/fast-check) with `numRuns: 100`; tag format: `// Feature: flappy-kiro, Property {N}: {text}`
- `assets/bg_music.ogg` is not yet present — the game must handle its absence gracefully (non-fatal audio error)
- All game logic functions reference `CONFIG.*` — no magic numbers in logic code
