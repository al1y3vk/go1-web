import { useEffect, useRef } from 'react'
import { Topic } from 'roslib'
import { useRos } from '../context/RosContext'

export interface ScanMsg {
  angle_min: number
  angle_increment: number
  range_min: number
  range_max: number
  ranges: number[]
}

export function useScan() {
  const { ros, connected } = useRos()
  const scanRef = useRef<ScanMsg | null>(null)
  const hzRef = useRef(0)

  useEffect(() => {
    if (!ros || !connected) return

    let count = 0
    let lastTime = Date.now()

    const topic = new Topic<ScanMsg>({
      ros,
      name: '/slamware_ros_sdk_server_node/scan',
      messageType: 'sensor_msgs/LaserScan',
      throttle_rate: 100,
    })

    topic.subscribe((msg) => {
      scanRef.current = msg
      count++
      const now = Date.now()
      if (now - lastTime > 1000) {
        hzRef.current = count / ((now - lastTime) / 1000)
        count = 0
        lastTime = now
      }
    })

    return () => { topic.unsubscribe() }
  }, [ros, connected])

  return { scanRef, hzRef }
}
