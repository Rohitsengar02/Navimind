'use client'

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface RainProps {
  count?: number
  speed?: number
  opacity?: number
}

export const Rain: React.FC<RainProps> = ({ count = 5000, speed = 2, opacity = 0.5 }) => {
  const pointsRef = useRef<THREE.Points>(null)

  // Precompute initial positions and velocities for rain particles
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Spread rain over a 150x150 area, height 0 to 100
      pos[i * 3] = (Math.random() - 0.5) * 150
      pos[i * 3 + 1] = Math.random() * 100
      pos[i * 3 + 2] = (Math.random() - 0.5) * 150
      // Velocity varies slightly per raindrop
      vel[i] = speed + Math.random() * speed
    }

    return [pos, vel]
  }, [count, speed])

  useFrame((_, delta) => {
    if (pointsRef.current) {
      const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        // Move particle down
        positionsArray[i * 3 + 1] -= velocities[i] * delta * 20
        // Reset to top if it hits the ground
        if (positionsArray[i * 3 + 1] < 0) {
          positionsArray[i * 3 + 1] = 100
          // Randomize X and Z slightly upon reset to avoid repeating exact patterns
          positionsArray[i * 3] = (Math.random() - 0.5) * 150
          positionsArray[i * 3 + 2] = (Math.random() - 0.5) * 150
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#aaccff"
        size={0.1}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </points>
  )
}
