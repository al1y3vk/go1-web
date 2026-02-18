import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Ros } from 'roslib'

interface RosContextValue {
  ros: Ros | null
  connected: boolean
}

const RosContext = createContext<RosContextValue>({ ros: null, connected: false })

export function RosProvider({ children }: { children: ReactNode }) {
  const rosRef = useRef<Ros | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const url = `ws://${location.hostname}:9090`
    const ros = new Ros({})
    rosRef.current = ros

    function connect() {
      ros.connect(url)
    }

    ros.on('connection', () => setConnected(true))
    ros.on('close', () => {
      setConnected(false)
      setTimeout(connect, 3000)
    })
    ros.on('error', () => {})

    connect()

    return () => { ros.close() }
  }, [])

  return (
    <RosContext.Provider value={{ ros: rosRef.current, connected }}>
      {children}
    </RosContext.Provider>
  )
}

export function useRos() {
  return useContext(RosContext)
}
