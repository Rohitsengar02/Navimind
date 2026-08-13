'use client'

import React from 'react'
import { SimulationCanvas } from '@/components/SimulationCanvas'
import { UIOverlay } from '@/components/UIOverlay'

export default function SimulationPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <SimulationCanvas />
      <UIOverlay />
    </div>
  )
}
