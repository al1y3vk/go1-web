import { RosProvider } from './context/RosContext'
import { Header } from './components/Header'
import { TeleopPanel } from './components/TeleopPanel'
import { LidarPanel } from './components/LidarPanel'
import { CameraPanel } from './components/CameraPanel'

export default function App() {
  return (
    <RosProvider>
      <div className="app">
        <Header />
        <div className="panels">
          <TeleopPanel />
          <LidarPanel />
          <CameraPanel />
        </div>
      </div>
    </RosProvider>
  )
}
