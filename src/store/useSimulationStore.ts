import { create } from 'zustand'

export type WeatherType = 'SUNNY' | 'CLOUDY' | 'RAIN' | 'FOG' | 'STORM'
export type CameraMode = 'FREE' | 'DRONE'

export interface ScannedObjectInfo {
  id: string
  name: string
  category: string
  distance: number
  confidence: number
  coords?: [number, number, number]
  isEmergency?: boolean
}

interface SimulationState {
  debugMode: boolean
  toggleDebugMode: () => void
  
  weather: WeatherType
  setWeather: (w: WeatherType) => void

  cameraMode: CameraMode
  setCameraMode: (m: CameraMode) => void

  introActive: boolean
  setIntroActive: (active: boolean) => void

  autoScan: boolean
  setAutoScan: (active: boolean) => void

  targetLocked: boolean
  setTargetLocked: (locked: boolean) => void

  isPickingUp: boolean
  setIsPickingUp: (picking: boolean) => void

  droneWorldPos: [number, number, number]
  setDroneWorldPos: (pos: [number, number, number]) => void

  activeScanTarget: ScannedObjectInfo | null
  setActiveScanTarget: (target: ScannedObjectInfo | null) => void

  scannedHistory: ScannedObjectInfo[]
  addScannedObject: (target: ScannedObjectInfo) => void

  droneTelemetry: { altitude: number; speed: number; heading: number }
  setDroneTelemetry: (telemetry: { altitude: number; speed: number; heading: number }) => void

  time: number // 0 to 24
  timeSpeed: number
  setTime: (time: number) => void
  setTimeSpeed: (speed: number) => void
  tickTime: (delta: number) => void
}

export const useSimulationStore = create<SimulationState>((set) => ({
  debugMode: false,
  toggleDebugMode: () => set((state) => ({ debugMode: !state.debugMode })),
  
  weather: 'SUNNY',
  setWeather: (weather) => set({ weather }),

  cameraMode: 'DRONE',
  setCameraMode: (cameraMode) => set({ cameraMode }),

  introActive: true,
  setIntroActive: (introActive) => set({ introActive }),

  autoScan: true,
  setAutoScan: (autoScan) => set({ autoScan }),

  targetLocked: false,
  setTargetLocked: (targetLocked) => set({ targetLocked }),

  isPickingUp: false,
  setIsPickingUp: (isPickingUp) => set({ isPickingUp }),

  droneWorldPos: [0, 14, 16],
  setDroneWorldPos: (droneWorldPos) => set({ droneWorldPos }),

  activeScanTarget: null,
  setActiveScanTarget: (activeScanTarget) => set({ activeScanTarget }),

  scannedHistory: [],
  addScannedObject: (target) => set((state) => {
    const existing = state.scannedHistory.filter((i) => i.id !== target.id)
    return { scannedHistory: [target, ...existing].slice(0, 6) }
  }),

  droneTelemetry: { altitude: 0, speed: 0, heading: 0 },
  setDroneTelemetry: (droneTelemetry) => set({ droneTelemetry }),

  time: 12.0, // Start at noon
  timeSpeed: 1, // 1x speed
  setTime: (time) => set({ time }),
  setTimeSpeed: (speed) => set({ timeSpeed: speed }),
  tickTime: (delta) => set((state) => {
    // 1 real second = 1 in-game minute at 1x speed by default
    // We can adjust this ratio. Let's say at 1x speed, 1 second = 0.01 hours (36 seconds)
    let newTime = state.time + (delta * state.timeSpeed * 0.05)
    if (newTime >= 24) newTime -= 24
    return { time: newTime }
  })
}))
