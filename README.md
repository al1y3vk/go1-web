# go1-web

A browser-based teleoperation dashboard for the Unitree Go1 (and compatible ROS robots). Built with React, TypeScript, and Vite; communicates with the robot via [rosbridge](http://wiki.ros.org/rosbridge_suite).

## Features

- **Dashboard view** — three live panels: teleop controls, lidar scan, and camera feed
- **Teleop view** — full-screen camera with overlaid gamepad visual and status
- **Keyboard control** — WASD / arrow keys with spacebar stop
- **Gamepad control** — Xbox-layout controller with dead-man switch and turbo mode
- **Lidar visualizer** — canvas-rendered 2D scan with zoom, point, and fill options
- **Camera stream** — MJPEG feed via `web_video_server`
- **Auto-reconnect** — reconnects to rosbridge every 3 seconds on disconnect

## ROS Requirements

The following ROS nodes must be running on the robot (or a machine reachable from the browser host):

| Node | Default address | Purpose |
|------|----------------|---------|
| `rosbridge_server` | `ws://<robot-ip>:9090` | WebSocket bridge |
| `web_video_server` | `http://<robot-ip>:8080` | MJPEG camera stream |

Topics used:

| Topic | Type | Direction |
|-------|------|-----------|
| `/cmd_vel` | `geometry_msgs/Twist` | Published (outbound velocity commands) |
| `/slamware_ros_sdk_server_node/scan` | `sensor_msgs/LaserScan` | Subscribed (lidar data) |
| `/camera/front/color/image_raw` | — | Streamed via `web_video_server` |

## Controls

### Keyboard

| Key | Action |
|-----|--------|
| `W` / `↑` | Forward |
| `S` / `↓` | Backward |
| `A` | Strafe left |
| `D` | Strafe right |
| `J` / `←` | Turn left (yaw) |
| `L` / `→` | Turn right (yaw) |
| `Space` | Stop |

### Gamepad (Xbox layout)

| Input | Action |
|-------|--------|
| **LB** (hold) | Dead-man switch — must be held to move |
| **RB** (hold) | Turbo — doubles all speed limits |
| Left stick | Forward / backward / strafe |
| Right stick X | Yaw (turn) |

Default speed limits (m/s or rad/s):

| Axis | Normal | Turbo |
|------|--------|-------|
| Forward/backward | 0.5 | 1.0 |
| Strafe | 0.4 | 0.8 |
| Yaw | 1.0 | 2.0 |

A deadband of `0.08` is applied to all analog axes.

## Getting Started

### Prerequisites

- Node.js ≥ 18
- `npm`

### Install & run

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in a browser. The app automatically connects to `ws://<browser-host>:9090` — so if you serve the page from the robot itself, no extra configuration is needed.

### Build for production

```bash
npm run build       # outputs to dist/
npm run preview     # serve the production build locally
```

## Project Structure

```
src/
├── App.tsx                   # Root — switches between dashboard and teleop views
├── context/
│   └── RosContext.tsx         # roslib connection + auto-reconnect
├── components/
│   ├── Header.tsx             # Top bar with connection status and view toggle
│   ├── TeleopPanel.tsx        # Dashboard teleop card (keyboard/gamepad → /cmd_vel)
│   ├── TeleopView.tsx         # Full-screen teleop with camera background
│   ├── LidarPanel.tsx         # Canvas 2D lidar visualizer
│   ├── CameraPanel.tsx        # MJPEG camera panel
│   └── GamepadVisual.tsx      # SVG gamepad diagram with live button/axis state
└── hooks/
    ├── useKeyboard.ts         # Tracks held teleop keys via keydown/keyup events
    ├── useGamepad.ts          # Polls Gamepad API via requestAnimationFrame
    └── useScan.ts             # Subscribes to LaserScan and tracks Hz
```

## Tech Stack

- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev)
- [roslib](https://github.com/RobotWebTools/roslibjs) — ROS WebSocket client
