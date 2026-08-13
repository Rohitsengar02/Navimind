'use client'

import React from 'react'
import { OrbitControls } from '@react-three/drei'
import { useSimulationStore } from '@/store/useSimulationStore'

export const Controls = () => {
  const cameraMode = useSimulationStore((state) => state.cameraMode)

  return (
    <OrbitControls 
      makeDefault
      enableDamping 
      dampingFactor={0.05} 
      minDistance={2} 
      maxDistance={200} 
      maxPolarAngle={Math.PI / 2 - 0.05} 
      enabled={cameraMode === 'FREE'}
    />
  )
}
