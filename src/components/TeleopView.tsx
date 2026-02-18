import { useEffect, useRef, useState } from 'react'
import { Topic } from 'roslib'
import { useRos } from '../context/RosContext'
import { useKeyboard } from '../hooks/useKeyboard'
import { useGamepad, type GamepadSnapshot } from '../hooks/useGamepad'
import { GamepadVisual } from './GamepadVisual'

interface Twist {
  linear: { x: number; y: number; z: number }
  angular: { x: number; y: number; z: number }
}

const VEL = {
  linear_x: 0.5, linear_x_turbo: 1.0,
  linear_y: 0.4, linear_y_turbo: 0.8,
  angular_z: 1.0, angular_z_turbo: 2.0,
}

const DEADBAND = 0.08

function applyDeadband(v: number): number {
  return Math.abs(v) < DEADBAND ? 0 : v
}

const CAMERA_TOPIC = '/camera/front/color/image_raw'
const EMPTY_GP: GamepadSnapshot = { axes: [], buttons: [], connected: false }

export function TeleopView() {
  const { ros, connected } = useRos()
  const keysRef = useKeyboard()
  const gpRef = useGamepad()
  const topicRef = useRef<Topic<Twist> | null>(null)
  const [status, setStatus] = useState('Idle')
  const [gpSnapshot, setGpSnapshot] = useState<GamepadSnapshot>(EMPTY_GP)
  const [camError, setCamError] = useState(false)

  useEffect(() => {
    if (!ros) return
    topicRef.current = new Topic<Twist>({
      ros,
      name: '/cmd_vel',
      messageType: 'geometry_msgs/Twist',
    })
    return () => { topicRef.current = null }
  }, [ros])

  useEffect(() => {
    let lastWasZero = true

    const id = setInterval(() => {
      const gp = gpRef.current
      setGpSnapshot({ ...gp, axes: [...gp.axes], buttons: [...gp.buttons] })

      if (!topicRef.current || !connected) return

      const keys = keysRef.current

      let lx = 0, ly = 0, az = 0
      let source = ''

      if (gp.connected && gp.buttons[4]) {
        const turbo = gp.buttons[5] ?? false
        const slx = turbo ? VEL.linear_x_turbo : VEL.linear_x
        const sly = turbo ? VEL.linear_y_turbo : VEL.linear_y
        const saz = turbo ? VEL.angular_z_turbo : VEL.angular_z

        lx = applyDeadband(gp.axes[1] ?? 0) * -slx
        ly = applyDeadband(gp.axes[0] ?? 0) * -sly
        az = applyDeadband(gp.axes[2] ?? 0) * -saz
        source = turbo ? 'Gamepad (turbo)' : 'Gamepad'
      } else if (keys.size > 0) {
        if (keys.has('w') || keys.has('arrowup'))    lx =  VEL.linear_x
        if (keys.has('s') || keys.has('arrowdown'))  lx = -VEL.linear_x
        if (keys.has('a'))                           ly =  VEL.linear_y
        if (keys.has('d'))                           ly = -VEL.linear_y
        if (keys.has('j') || keys.has('arrowleft'))  az =  VEL.angular_z
        if (keys.has('l') || keys.has('arrowright')) az = -VEL.angular_z
        if (keys.has(' ')) { lx = 0; ly = 0; az = 0 }
        source = 'Keyboard'
      }

      const isZero = lx === 0 && ly === 0 && az === 0

      if (isZero && lastWasZero) return
      lastWasZero = isZero

      topicRef.current.publish({
        linear: { x: lx, y: ly, z: 0 },
        angular: { x: 0, y: 0, z: az },
      })

      setStatus(isZero
        ? 'Idle'
        : `${source}  fwd=${lx.toFixed(2)} strafe=${ly.toFixed(2)} yaw=${az.toFixed(2)}`)
    }, 100)

    return () => clearInterval(id)
  }, [connected, keysRef, gpRef])

  const cameraUrl = `http://${location.hostname}:8080/stream?topic=${CAMERA_TOPIC}&type=mjpeg&quality=80`

  return (
    <div className="teleop-view">
      <div className="teleop-camera">
        {camError ? (
          <div className="no-camera">Camera not active</div>
        ) : (
          <img
            src={cameraUrl}
            alt="Camera feed"
            onError={() => setCamError(true)}
          />
        )}
      </div>

      <div className="teleop-overlay">
        {gpSnapshot.connected && (
          <GamepadVisual gp={gpSnapshot} className="teleop-gamepad-svg" />
        )}
        <div className={`teleop-overlay-status ${status === 'Idle' ? 'idle' : ''}`}>
          {connected ? status : 'ROS not connected'}
        </div>
      </div>
    </div>
  )
}
