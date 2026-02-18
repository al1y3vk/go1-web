import { useEffect, useRef, useState } from 'react'
import { Topic } from 'roslib'
import { useRos } from '../context/RosContext'
import { useKeyboard } from '../hooks/useKeyboard'
import { useGamepad } from '../hooks/useGamepad'

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

export function TeleopPanel() {
  const { ros, connected } = useRos()
  const keysRef = useKeyboard()
  const gpRef = useGamepad()
  const topicRef = useRef<Topic<Twist> | null>(null)
  const [status, setStatus] = useState('Idle')
  const [gpConnected, setGpConnected] = useState(false)

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
      if (!topicRef.current || !connected) return

      const keys = keysRef.current
      const gp = gpRef.current

      setGpConnected(gp.connected)

      let lx = 0, ly = 0, az = 0
      let source = ''

      // Gamepad: LB (button 4) = dead-man, RB (button 5) = turbo
      if (gp.connected && gp.buttons[4]) {
        const turbo = gp.buttons[5] ?? false
        const slx = turbo ? VEL.linear_x_turbo : VEL.linear_x
        const sly = turbo ? VEL.linear_y_turbo : VEL.linear_y
        const saz = turbo ? VEL.angular_z_turbo : VEL.angular_z

        lx = applyDeadband(gp.axes[1] ?? 0) * -slx  // left Y inverted
        ly = applyDeadband(gp.axes[0] ?? 0) * -sly  // left X inverted
        az = applyDeadband(gp.axes[2] ?? 0) * -saz  // right X inverted
        source = turbo ? 'Gamepad (turbo)' : 'Gamepad'
      } else if (keys.size > 0) {
        // Keyboard — matches control_via_keyboard.cpp layout
        if (keys.has('w') || keys.has('arrowup'))    lx =  VEL.linear_x
        if (keys.has('s') || keys.has('arrowdown'))  lx = -VEL.linear_x
        if (keys.has('a'))                           ly =  VEL.linear_y   // strafe left
        if (keys.has('d'))                           ly = -VEL.linear_y   // strafe right
        if (keys.has('j') || keys.has('arrowleft'))  az =  VEL.angular_z  // turn left
        if (keys.has('l') || keys.has('arrowright')) az = -VEL.angular_z  // turn right
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

  return (
    <div className="panel teleop-panel">
      <div className="panel-header">Teleop</div>
      <div className="panel-body">
        <div className="teleop-hints">
          <p><kbd>W</kbd><kbd>S</kbd> fwd/back, <kbd>A</kbd><kbd>D</kbd> strafe, <kbd>J</kbd><kbd>L</kbd> turn</p>
          <p>Arrows: up/down + left/right turn. <kbd>Space</kbd> = stop</p>
          <p>Gamepad: hold <kbd>LB</kbd> to enable, <kbd>RB</kbd> = turbo</p>
        </div>
        <div className={`teleop-status ${connected ? '' : 'disabled'}`}>
          {connected ? status : 'ROS not connected'}
        </div>
        {gpConnected && <div className="gamepad-indicator">Gamepad connected</div>}
      </div>
    </div>
  )
}
