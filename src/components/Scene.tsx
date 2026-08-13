'use client'

import React, { useRef } from 'react'
import { Sky, Environment } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { CityMap } from './CityMap'
import { Drone } from './Drone'
import { Rain } from './weather/Rain'
import { IndustryPort } from './IndustryPort'
import { FireExtinguisher } from './FireExtinguisher'
import { useSimulationStore, WeatherType } from '@/store/useSimulationStore'
import * as THREE from 'three'

const DayNightCycle = () => {
  const { time, tickTime, weather } = useSimulationStore()
  const lightRef = useRef<THREE.DirectionalLight>(null)

  useFrame((state, delta) => {
    tickTime(delta)

    const angle = ((useSimulationStore.getState().time - 6) / 12) * Math.PI
    const x = Math.cos(angle) * 100
    const y = Math.sin(angle) * 100
    const z = 20

    if (lightRef.current) {
      lightRef.current.position.set(x, y, z)
      
      // Dim sun based on weather
      let maxIntensity = 1.5
      if (weather === 'CLOUDY') maxIntensity = 0.8
      if (weather === 'FOG') maxIntensity = 0.5
      if (weather === 'RAIN') maxIntensity = 0.3
      if (weather === 'STORM') maxIntensity = 0.1

      lightRef.current.intensity = y > 0 ? Math.min(y / 20, maxIntensity) : 0
    }
  })

  return (
    <>
      <directionalLight
        ref={lightRef}
        castShadow
        position={[100, 50, 100]}
        intensity={1.5}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
    </>
  )
}

const WeatherAtmosphere = () => {
  const weather = useSimulationStore((state) => state.weather)

  let fogColor = '#bfd1e5'
  let fogNear = 20
  let fogFar = 150

  if (weather === 'CLOUDY') {
    fogColor = '#8899aa'
    fogFar = 120
  } else if (weather === 'RAIN') {
    fogColor = '#667788'
    fogNear = 10
    fogFar = 80
  } else if (weather === 'FOG') {
    fogColor = '#dddddd'
    fogNear = 5
    fogFar = 30
  } else if (weather === 'STORM') {
    fogColor = '#222222'
    fogNear = 5
    fogFar = 50
  }

  return (
    <>
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
      {/* Simplify sky based on weather: sunny is clear, others are more turbid */}
      <Sky 
        sunPosition={[0, 100, 0]} 
        turbidity={weather === 'SUNNY' ? 0.1 : weather === 'FOG' ? 10 : 5} 
        rayleigh={weather === 'SUNNY' ? 0.5 : 2} 
      />
      <Environment preset={weather === 'SUNNY' ? "city" : "night"} />
      
      {/* Rain particles */}
      {(weather === 'RAIN' || weather === 'STORM') && (
        <Rain speed={weather === 'STORM' ? 4 : 2} count={weather === 'STORM' ? 10000 : 5000} />
      )}
    </>
  )
}

export const Scene = () => {
  return (
    <>
      <WeatherAtmosphere />

      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <DayNightCycle />

      {/* Custom Industry Port Environment */}
      <IndustryPort />

      {/* Safety / Emergency Equipment Object */}
      <FireExtinguisher position={[0, 1.8, -6]} />

      {/* Drone */}
      <Drone />
    </>
  )
}
