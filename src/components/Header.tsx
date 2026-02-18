import { useRos } from '../context/RosContext'

export function Header() {
  const { connected } = useRos()
  return (
    <header>
      <h1>Go1 Dashboard</h1>
      <span className={connected ? 'status connected' : 'status disconnected'}>
        {connected ? 'Connected' : 'Disconnected'}
      </span>
    </header>
  )
}
