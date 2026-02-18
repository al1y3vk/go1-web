import { useRos } from '../context/RosContext'
import type { View } from '../App'

interface Props {
  view: View
  onViewChange: (v: View) => void
}

export function Header({ view, onViewChange }: Props) {
  const { connected } = useRos()
  return (
    <header>
      <h1>Go1</h1>
      <nav className="view-tabs">
        <button
          className={view === 'dashboard' ? 'tab active' : 'tab'}
          onClick={() => onViewChange('dashboard')}>
          Dashboard
        </button>
        <button
          className={view === 'teleop' ? 'tab active' : 'tab'}
          onClick={() => onViewChange('teleop')}>
          Teleop
        </button>
      </nav>
      <span className={connected ? 'status connected' : 'status disconnected'}>
        {connected ? 'Connected' : 'Disconnected'}
      </span>
    </header>
  )
}
