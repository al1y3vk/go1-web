import { useState } from 'react'
import { RosProvider } from './context/RosContext'
import { Header } from './components/Header'
import { TeleopPanel } from './components/TeleopPanel'
import { LidarPanel } from './components/LidarPanel'
import { CameraPanel } from './components/CameraPanel'
import { TeleopView } from './components/TeleopView'

export type View = 'dashboard' | 'teleop'

export default function App() {
  const [view, setView] = useState<View>('dashboard')

  return (
    <RosProvider>
      <div className="app">
        <Header view={view} onViewChange={setView} />
        {view === 'dashboard' ? (
          <div className="panels">
            <TeleopPanel />
            <LidarPanel />
            <CameraPanel />
          </div>
        ) : (
          <TeleopView />
        )}
      </div>
    </RosProvider>
  )
}
