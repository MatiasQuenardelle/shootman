# Shootman - Hand Tracking Shooting Game

## Overview
A Next.js web application that uses the device camera to track hand gestures shaped like a pistol. Players aim with two extended fingers and "shoot" by moving their thumb, targeting moving objects on screen.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Hand Tracking**: MediaPipe Hands (via @mediapipe/hands or TensorFlow.js handpose)
- **Canvas Rendering**: HTML5 Canvas API or React-Konva
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useRef, useReducer)
- **Audio**: Web Audio API for sound effects

---

## Core Features

### 1. Camera Integration
- Access device camera using `navigator.mediaDevices.getUserMedia()`
- Display camera feed as background layer
- Handle permissions and fallback states

### 2. Hand Tracking & Gesture Detection
- Track 21 hand landmarks using MediaPipe Hands
- Detect "gun" gesture:
  - Index finger extended (pointing)
  - Middle finger extended (pointing)
  - Ring finger curled
  - Pinky finger curled
  - Thumb position tracked for "trigger"
- Calculate aim direction from extended fingers
- Detect "shoot" action when thumb moves (curls inward)

### 3. Aiming System
- Project aim vector from hand position to screen coordinates
- Display crosshair/laser sight following aim direction
- Smooth interpolation for stable aiming

### 4. Target System
- Spawn targets at random positions
- Multiple target types (different sizes, speeds, points)
- Movement patterns (linear, sine wave, random)
- Hit detection using ray-target intersection

### 5. Game Mechanics
- Score tracking
- Lives/health system
- Progressive difficulty (faster/smaller targets)
- Round/wave system
- Combo multipliers for consecutive hits

---

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Main game page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── Game/
│   │   ├── GameCanvas.tsx    # Main game rendering
│   │   ├── Camera.tsx        # Camera feed component
│   │   ├── Crosshair.tsx     # Aim indicator
│   │   └── Target.tsx        # Target component
│   ├── UI/
│   │   ├── ScoreBoard.tsx    # Score display
│   │   ├── StartScreen.tsx   # Game start menu
│   │   ├── GameOver.tsx      # Game over screen
│   │   └── Instructions.tsx  # How to play
│   └── Debug/
│       └── HandLandmarks.tsx # Debug visualization
├── hooks/
│   ├── useCamera.ts          # Camera access hook
│   ├── useHandTracking.ts    # MediaPipe integration
│   ├── useGestureDetection.ts# Gun gesture detection
│   └── useGameLoop.ts        # Game loop management
├── lib/
│   ├── handTracking.ts       # Hand tracking utilities
│   ├── gestureUtils.ts       # Gesture calculation helpers
│   ├── targetManager.ts      # Target spawning/management
│   ├── collision.ts          # Hit detection logic
│   └── audio.ts              # Sound effect manager
├── types/
│   └── index.ts              # TypeScript interfaces
└── constants/
    └── game.ts               # Game configuration
```

---

## Implementation Phases

### Phase 1: Project Setup & Camera
1. Initialize Next.js project with TypeScript
2. Configure Tailwind CSS
3. Implement camera access hook
4. Display camera feed on screen
5. Handle camera permissions UI

### Phase 2: Hand Tracking Integration
1. Install and configure MediaPipe Hands
2. Create hand tracking hook
3. Visualize hand landmarks (debug mode)
4. Optimize for performance (frame rate)

### Phase 3: Gesture Detection
1. Implement finger extension detection
2. Detect "gun" hand shape
3. Track thumb position for trigger
4. Implement shoot detection (thumb movement threshold)
5. Calculate aim vector from finger positions

### Phase 4: Game Canvas & Aiming
1. Create game canvas overlay
2. Implement crosshair component
3. Map hand position to screen coordinates
4. Smooth aim tracking with interpolation
5. Add visual feedback for valid gun gesture

### Phase 5: Target System
1. Create target class/component
2. Implement target spawning logic
3. Add movement patterns
4. Implement hit detection
5. Add target destruction animations

### Phase 6: Game Logic
1. Implement score system
2. Add lives/health
3. Create wave/round progression
4. Implement difficulty scaling
5. Add combo system

### Phase 7: UI & Polish
1. Create start screen
2. Add game over screen
3. Implement sound effects
4. Add visual effects (muzzle flash, hit particles)
5. Mobile responsiveness
6. Performance optimization

### Phase 8: Final Polish
1. Add high score persistence (localStorage)
2. Accessibility improvements
3. Loading states
4. Error handling
5. Testing across devices

---

## Key Technical Challenges

### 1. Hand Tracking Performance
- Run MediaPipe in web worker if needed
- Reduce camera resolution for faster processing
- Skip frames if necessary (process every 2nd frame)
- Use `requestAnimationFrame` efficiently

### 2. Gesture Detection Accuracy
- Implement debouncing for shoot detection
- Use rolling average for landmark positions
- Define clear thresholds for finger states
- Handle edge cases (partial hand visibility)

### 3. Aim Stability
- Apply low-pass filter to aim coordinates
- Use exponential smoothing
- Consider Kalman filter for prediction

### 4. Coordinate Mapping
- Camera feed is mirrored (handle flip)
- Map normalized hand coordinates to canvas size
- Account for different aspect ratios

---

## Hand Landmark Reference

MediaPipe provides 21 landmarks per hand:
- 0: Wrist
- 1-4: Thumb (CMC, MCP, IP, TIP)
- 5-8: Index finger (MCP, PIP, DIP, TIP)
- 9-12: Middle finger (MCP, PIP, DIP, TIP)
- 13-16: Ring finger (MCP, PIP, DIP, TIP)
- 17-20: Pinky (MCP, PIP, DIP, TIP)

**Gun Gesture Detection Logic:**
```
isGunShape =
  indexFingerExtended (landmarks 5-8 roughly linear) AND
  middleFingerExtended (landmarks 9-12 roughly linear) AND
  ringFingerCurled (landmark 15 close to palm) AND
  pinkyCurled (landmark 19 close to palm)

aimDirection = vector from landmark 5 to landmark 8 (index finger)

isShooting = thumbTip (4) moved toward index base (5) quickly
```

---

## Game Configuration

```typescript
const GAME_CONFIG = {
  // Targets
  TARGET_MIN_SIZE: 40,
  TARGET_MAX_SIZE: 80,
  TARGET_BASE_SPEED: 2,
  SPAWN_INTERVAL: 2000, // ms
  MAX_TARGETS: 5,

  // Scoring
  POINTS_PER_HIT: 100,
  COMBO_MULTIPLIER: 1.5,

  // Difficulty
  DIFFICULTY_INCREASE_RATE: 0.1,
  WAVE_TARGET_COUNT: 10,

  // Hand tracking
  HAND_DETECTION_CONFIDENCE: 0.7,
  SHOOT_THRESHOLD: 0.15, // thumb movement
  AIM_SMOOTHING: 0.3,

  // Game
  STARTING_LIVES: 3,
  MISSED_TARGET_PENALTY: 1, // life lost
};
```

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@mediapipe/hands": "^0.4.0",
    "@mediapipe/camera_utils": "^0.3.0",
    "@mediapipe/drawing_utils": "^0.3.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0"
  }
}
```

---

## Success Criteria

- [ ] Camera feed displays correctly
- [ ] Hand landmarks tracked accurately
- [ ] Gun gesture detected reliably
- [ ] Shooting triggered by thumb movement
- [ ] Crosshair follows aim smoothly
- [ ] Targets spawn and move correctly
- [ ] Hit detection works accurately
- [ ] Score updates on hits
- [ ] Game over triggers correctly
- [ ] Works on desktop and mobile browsers
- [ ] Maintains 30+ FPS during gameplay
