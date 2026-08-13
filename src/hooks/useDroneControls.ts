import { useEffect, useState } from 'react'

export const useDroneControls = () => {
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    yawLeft: false,
    yawRight: false,
    up: false,
    down: false,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': setKeys((k) => ({ ...k, forward: true })); break;
        case 'KeyS': setKeys((k) => ({ ...k, backward: true })); break;
        case 'KeyA': setKeys((k) => ({ ...k, left: true })); break;
        case 'KeyD': setKeys((k) => ({ ...k, right: true })); break;
        case 'KeyQ': setKeys((k) => ({ ...k, yawLeft: true })); break;
        case 'KeyE': setKeys((k) => ({ ...k, yawRight: true })); break;
        case 'KeyR': setKeys((k) => ({ ...k, up: true })); break;
        case 'KeyK': setKeys((k) => ({ ...k, down: true })); break;
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': setKeys((k) => ({ ...k, forward: false })); break;
        case 'KeyS': setKeys((k) => ({ ...k, backward: false })); break;
        case 'KeyA': setKeys((k) => ({ ...k, left: false })); break;
        case 'KeyD': setKeys((k) => ({ ...k, right: false })); break;
        case 'KeyQ': setKeys((k) => ({ ...k, yawLeft: false })); break;
        case 'KeyE': setKeys((k) => ({ ...k, yawRight: false })); break;
        case 'KeyR': setKeys((k) => ({ ...k, up: false })); break;
        case 'KeyK': setKeys((k) => ({ ...k, down: false })); break;
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return keys
}
