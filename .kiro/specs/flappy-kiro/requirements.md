# Requirements Document

## Introduction

Flappy Kiro is a browser-based retro endless scroller game. The player controls a ghost character (Ghosty) through a series of pipe obstacles by tapping, clicking, or pressing spacebar to flap upward against gravity. The game runs entirely in the browser using vanilla HTML, CSS, and JavaScript with no external frameworks. It features a sketchy/retro visual style, sound effects, score tracking, and a persistent high score stored in localStorage.

## Glossary

- **Game**: The Flappy Kiro browser application
- **Ghosty**: The player-controlled ghost character sprite rendered using `assets/ghosty.png`
- **Pipe**: A green obstacle consisting of a top segment and a bottom segment with a gap between them through which Ghosty must pass
- **Gap**: The vertical opening between the top and bottom segments of a Pipe through which Ghosty can safely fly
- **Canvas**: The HTML5 canvas element on which the Game is rendered
- **Score**: The integer count of Pipes the player has successfully passed through in the current session
- **High_Score**: The highest Score ever achieved, persisted across sessions via localStorage
- **Score_Bar**: The UI element displayed at the bottom of the Canvas showing the current Score and High_Score
- **Game_Loop**: The continuous update-and-render cycle that drives game physics and animation
- **Gravity**: The constant downward acceleration applied to Ghosty each Game_Loop tick
- **Flap**: The upward velocity impulse applied to Ghosty when the player triggers an input
- **Collision**: Contact between Ghosty's bounding box and a Pipe, the top edge, or the bottom edge of the Canvas
- **Game_Over_Screen**: The overlay displayed after a Collision, showing the final Score and a restart option
- **Cloud**: A decorative background element that scrolls from right to left, has no collision behavior, and is rendered semi-transparently
- **Cloud_Layer**: A depth classification assigned to each Cloud that determines its scroll speed and opacity, simulating near, mid, and far parallax depth
- **Background_Music**: A looping audio track that plays continuously during active gameplay
- **Screen_Shake**: A brief camera-offset effect applied to the Canvas after a Collision to provide impact feedback
- **Particle**: A single short-lived visual element emitted from Ghosty's position to form a trailing effect during flight
- **Particle_Trail**: The continuous stream of Particles emitted behind Ghosty while the Game is running
- **Score_Popup**: A transient floating text element displaying "+1" that animates upward and fades out at the point of scoring

## Requirements

### Requirement 1: Game Initialization

**User Story:** As a player, I want the game to load and be ready to play in my browser, so that I can start playing immediately without any installation.

#### Acceptance Criteria

1. THE Game SHALL run in a modern browser using only a single HTML file, inline or linked CSS, and vanilla JavaScript with no external frameworks or build tools required.
2. WHEN the Game page loads, THE Game SHALL display the Canvas with the retro light-blue sketchy background, Ghosty centered vertically on the left side of the Canvas, and a start prompt instructing the player to press spacebar or tap to begin.
3. THE Canvas SHALL have a fixed resolution of 480x640 pixels and SHALL scale responsively to fit the viewport without distortion.
4. WHEN the Game page loads, THE Game SHALL load `assets/ghosty.png`, `assets/jump.wav`, and `assets/game_over.wav` before the first frame is rendered.
5. IF any asset fails to load, THEN THE Game SHALL display a descriptive error message on the Canvas and SHALL halt initialization.

---

### Requirement 2: Player Input and Ghosty Movement

**User Story:** As a player, I want to control Ghosty by tapping, clicking, or pressing spacebar, so that I can navigate through pipe gaps.

#### Acceptance Criteria

1. WHEN the player presses the spacebar, clicks the Canvas, or taps the Canvas on a touch device, THE Game SHALL apply a Flap impulse to Ghosty, setting Ghosty's vertical velocity to a fixed upward value.
2. WHILE the Game is running, THE Game SHALL apply Gravity to Ghosty each Game_Loop tick, incrementing Ghosty's downward velocity by a fixed acceleration value.
3. WHILE the Game is running, THE Game SHALL update Ghosty's vertical position each Game_Loop tick based on Ghosty's current velocity.
4. THE Game SHALL render Ghosty rotated to visually reflect Ghosty's current vertical velocity, tilting upward when ascending and downward when descending.
5. WHEN the player triggers a Flap, THE Game SHALL play `assets/jump.wav`.

---

### Requirement 3: Pipe Generation and Scrolling

**User Story:** As a player, I want pipes to scroll toward me continuously, so that the game presents an ongoing challenge.

#### Acceptance Criteria

1. WHILE the Game is running, THE Game SHALL spawn a new Pipe at the right edge of the Canvas at a fixed horizontal interval.
2. THE Game SHALL randomize the vertical position of each Pipe's Gap within a range that keeps the Gap fully within the Canvas bounds.
3. THE Game SHALL set the Gap height to a fixed value that is consistently passable but challenging.
4. WHILE the Game is running, THE Game SHALL move all active Pipes from right to left at a constant scroll speed each Game_Loop tick.
5. WHEN a Pipe has scrolled fully past the left edge of the Canvas, THE Game SHALL remove that Pipe from the active Pipe list.
6. THE Game SHALL render Pipes as green rectangular segments with a sketchy/retro visual style consistent with the example UI.

---

### Requirement 4: Collision Detection and Game Over

**User Story:** As a player, I want the game to end when I hit a pipe or the screen edge, so that the game has meaningful consequences for mistakes.

#### Acceptance Criteria

1. WHILE the Game is running, THE Game SHALL check for Collision between Ghosty's bounding box and each active Pipe's top and bottom segments every Game_Loop tick.
2. WHILE the Game is running, THE Game SHALL check whether Ghosty's position has exceeded the top or bottom edge of the Canvas every Game_Loop tick.
3. WHEN a Collision is detected, THE Game SHALL immediately stop the Game_Loop, play `assets/game_over.wav`, and display the Game_Over_Screen.
4. THE Game_Over_Screen SHALL display the final Score, the High_Score, and a clearly labeled restart button or prompt.
5. IF the final Score exceeds the stored High_Score, THEN THE Game SHALL update the High_Score in localStorage before displaying the Game_Over_Screen.

---

### Requirement 5: Scoring

**User Story:** As a player, I want to see my score increase as I pass through pipes, so that I have a sense of progress and achievement.

#### Acceptance Criteria

1. WHEN Ghosty's horizontal position passes the trailing edge of a Pipe's Gap without a Collision, THE Game SHALL increment the Score by one.
2. WHILE the Game is running, THE Score_Bar SHALL display the current Score and the High_Score in the format `Score: X | High: X`.
3. THE Score_Bar SHALL be rendered at the bottom of the Canvas and SHALL remain visible at all times during gameplay.
4. THE Game SHALL initialize the Score to zero at the start of each new game session.

---

### Requirement 6: High Score Persistence

**User Story:** As a player, I want my high score to be saved between sessions, so that I have a long-term goal to beat.

#### Acceptance Criteria

1. WHEN the Game page loads, THE Game SHALL read the stored High_Score from localStorage and use it as the initial High_Score value.
2. IF no High_Score value exists in localStorage, THEN THE Game SHALL initialize the High_Score to zero.
3. WHEN a game session ends with a Score greater than the current High_Score, THE Game SHALL write the new High_Score to localStorage.
4. THE Game SHALL persist the High_Score using the localStorage key `flappyKiroHighScore`.

---

### Requirement 7: Decorative Background Elements

**User Story:** As a player, I want a visually rich background, so that the game feels polished and immersive.

#### Acceptance Criteria

1. WHILE the Game is running, THE Game SHALL render Cloud elements scrolling from right to left at speeds slower than the Pipe scroll speed.
2. THE Game SHALL assign each Cloud a Cloud_Layer from at least three distinct depth layers, where each Cloud_Layer has a unique scroll speed slower than the Pipe scroll speed and slower than all foreground Cloud_Layers, so that Clouds at different depths appear to move at visibly different rates.
3. THE Game SHALL render each Cloud with a semi-transparent fill, where Clouds in farther Cloud_Layers are rendered at a lower opacity than Clouds in nearer Cloud_Layers.
4. THE Game SHALL spawn Cloud elements at randomized vertical positions within the upper portion of the Canvas.
5. THE Cloud elements SHALL be rendered as simple sketchy box or cloud shapes consistent with the example UI style and SHALL NOT interact with Ghosty's collision detection.

---

### Requirement 8: Game Restart

**User Story:** As a player, I want to restart the game quickly after a game over, so that I can try to beat my high score without friction.

#### Acceptance Criteria

1. WHEN the Game_Over_Screen is displayed and the player presses spacebar, clicks the restart button, or taps the restart button, THE Game SHALL reset the Score to zero, remove all active Pipes and Clouds, reposition Ghosty to the starting position, and restart the Game_Loop.
2. WHEN the Game restarts, THE Game SHALL retain the High_Score value from the previous session.
3. WHEN the Game restarts, THE Game SHALL NOT reload the page or re-fetch assets.

---

### Requirement 9: Audio and Visual Feedback

**User Story:** As a player, I want rich audio and visual feedback during gameplay, so that actions and events feel responsive and satisfying.

#### Acceptance Criteria

1. WHEN the Game_Loop starts, THE Game SHALL begin playing Background_Music in a continuous loop at a volume level that does not overpower sound effects.
2. WHEN a Collision is detected, THE Game SHALL stop the Background_Music.
3. WHEN the Game restarts, THE Game SHALL resume playing Background_Music from the beginning.
4. WHEN a Collision is detected, THE Game SHALL apply a Screen_Shake effect to the Canvas by offsetting the render origin by a fixed pixel amount for a fixed duration before returning to the original position.
5. THE Screen_Shake SHALL complete within 500 milliseconds of the Collision and SHALL NOT interfere with the display of the Game_Over_Screen.
6. WHILE the Game is running, THE Game SHALL emit Particles from Ghosty's trailing edge each Game_Loop tick to form a Particle_Trail.
7. THE Game SHALL render each Particle as a small semi-transparent shape that moves opposite to Ghosty's direction of travel, decreases in opacity over its lifetime, and is removed from the active Particle list when its opacity reaches zero.
8. WHEN the Score is incremented, THE Game SHALL spawn a Score_Popup at the position of the scored Pipe's Gap center.
9. THE Score_Popup SHALL animate upward and fade out over a fixed duration not exceeding 1000 milliseconds, then be removed from the active Score_Popup list.
