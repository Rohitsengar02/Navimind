'use client'

import React from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

export const IndustryPort = () => {
  // Load the custom GLTF model
  const { scene } = useGLTF('/industry.glb')

  // Traverse the scene to enable shadow casting and receiving for all meshes
  scene.traverse((child: any) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return (
    // Wrap the entire model in a trimesh collider so the drone respects all geometry (walls, floors, roofs)
    <RigidBody type="fixed" colliders="trimesh" position={[0, -0.5, 0]}>
      <primitive object={scene} />
    </RigidBody>
  )
}

// Preload the model to prevent UI freezing
useGLTF.preload('/industry.glb')
