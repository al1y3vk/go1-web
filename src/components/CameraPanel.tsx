import { useState } from 'react'

const CAMERA_TOPIC = '/camera/front/color/image_raw'
const CAMERA_URL = `http://${location.hostname}:8080/stream?topic=${CAMERA_TOPIC}&type=mjpeg&quality=50`

export function CameraPanel() {
  const [error, setError] = useState(false)

  return (
    <div className="panel">
      <div className="panel-header">Camera Feed</div>
      <div className="panel-body" style={{ background: '#0a0a1a' }}>
        {error ? (
          <div className="no-camera">
            Camera not active.<br />
            Check that RealSense + web_video_server are running.
          </div>
        ) : (
          <img
            src={CAMERA_URL}
            alt="Camera feed"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={() => setError(true)}
          />
        )}
      </div>
      <div className="stats">
        {error ? 'No camera feed' : `Streaming: ${CAMERA_TOPIC}`}
      </div>
    </div>
  )
}
