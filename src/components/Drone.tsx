import React, { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDroneControls } from '@/hooks/useDroneControls'
import { useSimulationStore } from '@/store/useSimulationStore'

const SCENE_OBJECTS = [
  { id: 'fire_extinguisher_01', name: 'Fire Extinguisher Unit #01', category: 'EMERGENCY / SAFETY', pos: new THREE.Vector3(0, 1.8, -6), isEmergency: true },
  { id: 'ind_warehouse_alpha', name: 'Warehouse Block Alpha', category: 'BUILDING', pos: new THREE.Vector3(0, 10, 0) },
  { id: 'ind_crane_01', name: 'Port Gantry Crane #1', category: 'STRUCTURE', pos: new THREE.Vector3(18, 14, -12) },
  { id: 'ind_container_hub', name: 'Container Terminal East', category: 'LOGISTICS', pos: new THREE.Vector3(-22, 6, 16) },
  { id: 'city_tower_downtown', name: 'Downtown Central Tower', category: 'BUILDING', pos: new THREE.Vector3(0, 28, -28) },
  { id: 'ind_storage_silo', name: 'Industrial Storage Silos', category: 'BUILDING', pos: new THREE.Vector3(26, 16, 22) },
  { id: 'ind_dock_gateway', name: 'Main Port Gateway', category: 'INFRASTRUCTURE', pos: new THREE.Vector3(-12, 10, -26) },
  { id: 'ind_logistics_center', name: 'Logistics Distribution Unit', category: 'BUILDING', pos: new THREE.Vector3(15, 12, 25) }
]

const ScannerBeam = () => {
  const spotLightRef = useRef<THREE.SpotLight>(null)
  const targetRef = useRef<THREE.Object3D>(null)
  const beamGroupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (spotLightRef.current && targetRef.current) {
      spotLightRef.current.target = targetRef.current
    }
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    if (beamGroupRef.current) {
      // Actively sweep the LiDAR beam left-right and up-down across buildings ahead
      beamGroupRef.current.rotation.y = Math.sin(time * 3.5) * 0.22
      beamGroupRef.current.rotation.x = Math.sin(time * 2.2) * 0.12
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 2.5
      const scale = 1 + Math.sin(time * 8) * 0.15
      ringRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    // Located precisely at the FRONT NOSE of the drone (-2.2 on Z, -0.2 on Y)
    <group position={[0, -0.2, -2.2]} ref={beamGroupRef}>
      {/* High-intensity SpotLight casting crisp shadows forward onto buildings & ground */}
      <spotLight
        ref={spotLightRef}
        position={[0, 0, 0]}
        color="#00e5ff"
        intensity={130}
        angle={0.55}
        penumbra={0.35}
        distance={75}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0002}
      />
      <object3D ref={targetRef} position={[0, -16, -26]} />

      {/* Volumetric outer scanner cone pointing forward & down toward buildings */}
      <group rotation={[Math.PI / 2 + 0.45, 0, 0]}>
        <mesh position={[0, -14, 0]}>
          <coneGeometry args={[5.5, 28, 32, 1, true]} />
          <meshBasicMaterial
            color="#00e5ff"
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Volumetric inner bright laser core */}
        <mesh position={[0, -14, 0]}>
          <coneGeometry args={[1.2, 28, 16, 1, true]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.45}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Surface scanner ring at the beam terminus */}
        <mesh ref={ringRef} position={[0, -27.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.8, 4.4, 32]} />
          <meshBasicMaterial
            color="#00e5ff"
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  )
}

export const Drone = () => {
  const { scene } = useGLTF('/buster_drone.glb')
  const droneRef = useRef<RapierRigidBody>(null)
  const keys = useDroneControls()
  
  const currentVel = useRef(new THREE.Vector3())
  const droneDirection = useRef(new THREE.Vector3())
  const rightDirection = useRef(new THREE.Vector3())
  
  // Camera smoothing targets initialized inside the industry port
  const currentCameraPosition = useRef(new THREE.Vector3(0, 20, 28))
  const currentCameraLookAt = useRef(new THREE.Vector3(0, 12, 5))

  useFrame((state, delta) => {
    if (!droneRef.current) return

    const { forward, backward, left, right, yawLeft, yawRight, up, down } = keys
    const { cameraMode, introActive, setIntroActive, autoScan, setAutoScan, targetLocked, setTargetLocked, isPickingUp, setDroneWorldPos } = useSimulationStore.getState()

    // Cancel intro / autoScan / targetLock automatically if user presses any flight control key
    if ((introActive || autoScan || targetLocked) && (forward || backward || left || right || yawLeft || yawRight || up || down)) {
      setIntroActive(false)
      setAutoScan(false)
      setTargetLocked(false)
    }

    const speed = 25
    const rotSpeed = 2.5
    
    const pos = droneRef.current.translation()
    const rot = droneRef.current.rotation()
    const currentQuat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w)

    droneDirection.current.set(0, 0, -1).applyQuaternion(currentQuat).normalize()
    rightDirection.current.set(1, 0, 0).applyQuaternion(currentQuat).normalize()

    let targetVelocity = new THREE.Vector3(0, 0, 0)
    let targetYaw = 0
    
    if (introActive || autoScan) {
      if (isPickingUp) {
        // AIRLIFT PHASE: Ascend above the industries (Y = 26m) holding the Fire Extinguisher!
        if (pos.y < 26) {
          targetVelocity.y = 8.0
        } else {
          targetVelocity.y = 0
        }
        targetVelocity.x = 0
        targetVelocity.z = 0
        targetYaw = 0.4
      } else if (targetLocked) {
        // Drone HOVERS IN PLACE when it finds the Emergency Fire Extinguisher!
        targetVelocity.set(0, 0, 0)
        targetYaw = 0
      } else {
        // Automatic industry road scanning patrol inside the industry:
      // Slide forwards & backwards smoothly along the road
      const time = state.clock.elapsedTime
      const forwardMotion = Math.cos(time * 0.45) * 14
      const strafeMotion = Math.sin(time * 0.75) * 9

      targetVelocity.addScaledVector(droneDirection.current, forwardMotion)
      targetVelocity.addScaledVector(rightDirection.current, strafeMotion)

      // Maintain ideal scanning altitude (~14m) inside industry
      if (pos.y > 15) targetVelocity.y = -3.2
      else if (pos.y < 12) targetVelocity.y = 3.2

      // Turn smoothly while scanning roads
      targetYaw = Math.sin(time * 0.3) * 0.4

      // Strictly turn around inside industry bounds: steer back toward center whenever reaching 15m from center
      if (pos.z < -15) {
        targetVelocity.z = 12
        targetYaw = 0.9
      } else if (pos.z > 15) {
        targetVelocity.z = -12
        targetYaw = 0.9
      }
      if (pos.x < -15) {
        targetVelocity.x = 12
        targetYaw = 0.9
      } else if (pos.x > 15) {
        targetVelocity.x = -12
        targetYaw = 0.9
      }
    }
    } else {
      if (forward) targetVelocity.addScaledVector(droneDirection.current, speed)
      if (backward) targetVelocity.addScaledVector(droneDirection.current, -speed)
      
      // Strafe is now Q/E
      if (yawRight) targetVelocity.addScaledVector(rightDirection.current, speed)
      if (yawLeft) targetVelocity.addScaledVector(rightDirection.current, -speed)

      if (up) targetVelocity.y += speed
      if (down) targetVelocity.y -= speed

      // A/D (left/right) steers (yaws) the drone
      if (left) targetYaw += rotSpeed
      if (right) targetYaw -= rotSpeed
    }

    const currentLinVel = droneRef.current.linvel()
    currentVel.current.set(currentLinVel.x, currentLinVel.y, currentLinVel.z)
    currentVel.current.lerp(targetVelocity, delta * 3)
    
    const euler = new THREE.Euler().setFromQuaternion(currentQuat, 'YXZ')
    
    // Visual banking when steering (tilt forward during intro/autoScan)
    const targetPitch = (introActive || autoScan) ? -0.15 : (forward ? -0.2 : (backward ? 0.2 : 0))
    const targetRoll = right ? -0.3 : (left ? 0.3 : 0)
    
    euler.x = THREE.MathUtils.lerp(euler.x, targetPitch, delta * 4)
    euler.z = THREE.MathUtils.lerp(euler.z, targetRoll, delta * 4)
    euler.y += targetYaw * delta
    
    const nextQuat = new THREE.Quaternion().setFromEuler(euler)
    droneRef.current.setRotation(nextQuat, true)

    droneRef.current.setLinvel(currentVel.current, true)
    
    // Strictly prevent the drone from ever leaving the industry boundaries (X/Z [-20, 20], Y [2, 28])
    const clampedX = THREE.MathUtils.clamp(pos.x, -20, 20)
    const clampedZ = THREE.MathUtils.clamp(pos.z, -20, 20)
    const clampedY = THREE.MathUtils.clamp(pos.y, 2, 28)
    if (Math.abs(pos.x - clampedX) > 0.05 || Math.abs(pos.z - clampedZ) > 0.05 || Math.abs(pos.y - clampedY) > 0.05) {
      droneRef.current.setTranslation({ x: clampedX, y: clampedY, z: clampedZ }, true)
    }

    const currentSpeed = currentVel.current.length()
    useSimulationStore.getState().setDroneTelemetry({
      altitude: clampedY,
      speed: currentSpeed,
      heading: THREE.MathUtils.radToDeg(euler.y) % 360
    })
    useSimulationStore.getState().setDroneWorldPos([clampedX, clampedY, clampedZ])

    // Phase 10 / 13: Sensor target detection (scan buildings and structures ahead of drone with front LiDAR beam)
    let bestTarget = null
    let minAngle = 0.65
    const dronePos = new THREE.Vector3(pos.x, pos.y, pos.z)

    for (const obj of SCENE_OBJECTS) {
      const dist = dronePos.distanceTo(obj.pos)
      if (dist < 52) {
        const dir = new THREE.Vector3().subVectors(obj.pos, dronePos).normalize()
        const dot = dir.dot(droneDirection.current)
        if (dot > minAngle) {
          minAngle = dot
          bestTarget = {
            id: obj.id,
            name: obj.name,
            category: obj.category,
            distance: dist,
            confidence: Math.min(99.4, 88.0 + (dot - 0.65) * 30 + (52 - dist) * 0.2),
            coords: [obj.pos.x, obj.pos.y, obj.pos.z] as [number, number, number],
            isEmergency: (obj as any).isEmergency || false
          }
        }
      }
    }

    const { setActiveScanTarget, addScannedObject } = useSimulationStore.getState()
    setActiveScanTarget(bestTarget)
    if (bestTarget) {
      addScannedObject(bestTarget)
      // Automatically lock target and STOP drone hovering when Fire Extinguisher (emergency object) is detected within 38m!
      if (bestTarget.isEmergency && autoScan && !targetLocked && bestTarget.distance < 38) {
        setTargetLocked(true)
      }
    }

    if (cameraMode === 'DRONE') {
      // 0.3 meter front of drone during autonomous scan!
      // When airlifting above the industries, pull back to show drone carrying object!
      const idealOffset = isPickingUp
        ? new THREE.Vector3(0, 3.5, 10)
        : (introActive || autoScan)
          ? new THREE.Vector3(0, 0.15, -0.3) // 0.3 meters front of drone!
          : new THREE.Vector3(0, 3, 10)
      idealOffset.applyQuaternion(currentQuat)
      const idealPosition = new THREE.Vector3(pos.x, pos.y, pos.z).add(idealOffset)
      
      const idealLook = isPickingUp
        ? new THREE.Vector3(0, -3.5, 0)
        : (introActive || autoScan)
          ? new THREE.Vector3(0, -1.8, -18) // looking forward & down from 0.3m front camera!
          : new THREE.Vector3(0, 0, -20)
      idealLook.applyQuaternion(currentQuat)
      const idealLookAt = new THREE.Vector3(pos.x, pos.y, pos.z).add(idealLook)
      
      // Smoothly interpolate both camera position and look target
      currentCameraPosition.current.lerp(idealPosition, delta * 3.5)
      currentCameraLookAt.current.lerp(idealLookAt, delta * 4)
      
      state.camera.position.copy(currentCameraPosition.current)
      state.camera.lookAt(currentCameraLookAt.current)
    }
  })

  return (
    <RigidBody 
      ref={droneRef} 
      position={[0, 14, 16]} 
      colliders="hull" 
      type="dynamic"
      gravityScale={0}
      linearDamping={2}
      angularDamping={2}
    >
      <primitive object={scene} scale={0.5} />
      <ScannerBeam />
    </RigidBody>
  )
}

useGLTF.preload('/buster_drone.glb')

