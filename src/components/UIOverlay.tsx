'use client'

import React, { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { useSimulationStore } from '@/store/useSimulationStore'

export const UIOverlay = () => {
  const { progress } = useProgress()
  const { debugMode, toggleDebugMode, time, timeSpeed, setTimeSpeed, cameraMode, setCameraMode, introActive, setIntroActive, autoScan, setAutoScan, activeScanTarget, scannedHistory, targetLocked, setTargetLocked, isPickingUp, setIsPickingUp } = useSimulationStore()

  // Local state to force re-render for time display since Zustand's tick updates very fast
  const [displayTime, setDisplayTime] = useState(time)
  const [telemetry, setTelemetry] = useState({ altitude: 0, speed: 0, heading: 0 })

  useEffect(() => {
    // Subscribe to time changes to update the UI without causing the whole component to re-render constantly
    const unsub = useSimulationStore.subscribe((state) => {
      setDisplayTime(state.time)
      setTelemetry(state.droneTelemetry)
    })
    return () => unsub()
  }, [])

  // Format time (e.g. 13.5 -> 13:30)
  const hours = Math.floor(displayTime)
  const minutes = Math.floor((displayTime % 1) * 60)
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Cinematic Intro & Autonomous Scan Banner */}
      {(introActive || autoScan) && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'auto',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: 'rgba(0, 20, 40, 0.85)',
            border: '1px solid rgba(0, 180, 255, 0.6)',
            color: '#00e5ff',
            padding: '10px 24px',
            borderRadius: '24px',
            fontFamily: 'monospace',
            fontSize: '14px',
            fontWeight: 'bold',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 0 20px rgba(0, 180, 255, 0.3)',
            backdropFilter: 'blur(8px)'
          }}>
            <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              backgroundColor: '#00e5ff',
              borderRadius: '50%',
              boxShadow: '0 0 10px #00e5ff'
            }} />
            AUTONOMOUS INDUSTRY SCAN — PATROLLING ROADS
          </div>
          <button
            onClick={() => {
              setIntroActive(false)
              setAutoScan(false)
            }}
            style={{
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              padding: '6px 16px',
              borderRadius: '16px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              transition: 'all 0.2s'
            }}
          >
            [ TAKE MANUAL CONTROL ]
          </button>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontFamily: 'monospace' }}>
            Or press W / A / S / D / Space to fly manually
          </span>
        </div>
      )}

      {/* Top Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            fontFamily: 'monospace'
          }}>
            NaviMind 3D Simulation
          </div>

          {/* Telemetry Display */}
          {cameraMode === 'DRONE' && (
            <div style={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: '#00ffcc',
              padding: '10px 15px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              whiteSpace: 'pre'
            }}>
              {`ALT: ${telemetry.altitude.toFixed(1)}m\nSPD: ${telemetry.speed.toFixed(1)}m/s\nHDG: ${telemetry.heading.toFixed(0)}°`}
            </div>
          )}

          {/* Phase 10 / 13 / 14: LiDAR Front Scanner & Target Detection Panel */}
          {cameraMode === 'DRONE' && (
            <div style={{
              backgroundColor: 'rgba(0, 15, 30, 0.85)',
              border: '1px solid rgba(0, 229, 255, 0.5)',
              color: '#00e5ff',
              padding: '12px 16px',
              borderRadius: '10px',
              fontFamily: 'monospace',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 0 15px rgba(0, 229, 255, 0.2)',
              backdropFilter: 'blur(6px)',
              minWidth: '240px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 229, 255, 0.3)', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>FRONT LiDAR SCANNER</span>
                <span style={{ fontSize: '11px', color: activeScanTarget ? '#00ff66' : '#ffcc00' }}>
                  {activeScanTarget ? '● TARGET LOCKED' : '○ SWEEPING...'}
                </span>
              </div>

              {activeScanTarget ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                  <div style={{ color: '#fff', fontWeight: 'bold' }}>{activeScanTarget.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#aaa' }}>TYPE:</span>
                    <span>{activeScanTarget.category}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#aaa' }}>DIST:</span>
                    <span>{activeScanTarget.distance.toFixed(1)}m</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#aaa' }}>CONF:</span>
                    <span style={{ color: '#00ff66' }}>{activeScanTarget.confidence.toFixed(1)}%</span>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#8899aa', fontSize: '12px', fontStyle: 'italic', padding: '6px 0' }}>
                  Scanning facades & structures ahead...
                </div>
              )}

              {scannedHistory.length > 0 && (
                <div style={{ marginTop: '4px', borderTop: '1px solid rgba(0, 229, 255, 0.2)', paddingTop: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#88a', marginBottom: '2px' }}>SCANNED REGISTRY (PHASE 10):</div>
                  {scannedHistory.slice(0, 3).map((obj) => (
                    <div key={obj.id} style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', color: '#bcf' }}>
                      <span>✓ {obj.name}</span>
                      <span>{obj.confidence.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
          <button 
            onClick={() => {
              const nextScan = !autoScan
              setAutoScan(nextScan)
              if (nextScan) setIntroActive(false)
            }}
            style={{
              backgroundColor: autoScan ? '#00e5ff' : '#333',
              color: autoScan ? '#000' : 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              boxShadow: autoScan ? '0 0 12px rgba(0, 229, 255, 0.5)' : 'none'
            }}
          >
            Auto-Scan: {autoScan ? 'ON' : 'OFF'}
          </button>
          <button 
            onClick={() => setCameraMode(cameraMode === 'FREE' ? 'DRONE' : 'FREE')}
            style={{
              backgroundColor: cameraMode === 'DRONE' ? '#0070f3' : '#333',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: 'bold'
            }}
          >
            Camera: {cameraMode}
          </button>
          <button 
            onClick={toggleDebugMode}
            style={{
              backgroundColor: debugMode ? '#ff4040' : 'rgba(0,0,0,0.7)',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            Debug: {debugMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Bottom Section - Controls Dashboard */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: '20px',
        alignSelf: 'center',
        pointerEvents: 'auto',
      }}>
        {/* Time Dashboard */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '15px 30px',
          borderRadius: '12px',
          fontFamily: 'monospace',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            {formattedTime}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {[0, 1, 5, 10, 50].map((speed) => (
              <button
                key={speed}
                onClick={() => setTimeSpeed(speed)}
                style={{
                  backgroundColor: timeSpeed === speed ? '#0070f3' : '#333',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Weather Dashboard */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '15px 30px',
          borderRadius: '12px',
          fontFamily: 'monospace',
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>
            Weather: {useSimulationStore((state) => state.weather)}
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '200px' }}>
            {['SUNNY', 'CLOUDY', 'RAIN', 'FOG', 'STORM'].map((wType) => (
              <button
                key={wType}
                onClick={() => useSimulationStore.getState().setWeather(wType as any)}
                style={{
                  backgroundColor: useSimulationStore((state) => state.weather) === wType ? '#28a745' : '#333',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                {wType}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - AI Object Detection System (YOLOv8 / LiDAR) */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '320px',
        backgroundColor: activeScanTarget?.isEmergency 
          ? 'rgba(40, 5, 5, 0.92)' 
          : 'rgba(5, 15, 25, 0.88)',
        border: activeScanTarget?.isEmergency 
          ? '2px solid #ff3300' 
          : '1px solid rgba(0, 229, 255, 0.5)',
        borderRadius: '12px',
        padding: '16px',
        fontFamily: 'monospace',
        color: '#fff',
        pointerEvents: 'auto',
        boxShadow: activeScanTarget?.isEmergency 
          ? '0 0 25px rgba(255, 50, 0, 0.45)' 
          : '0 0 20px rgba(0, 229, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 50
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: activeScanTarget?.isEmergency ? '1px solid #ff3300' : '1px solid rgba(0, 229, 255, 0.3)',
          paddingBottom: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: activeScanTarget?.isEmergency ? '#ff3300' : '#00e5ff',
              boxShadow: activeScanTarget?.isEmergency ? '0 0 10px #ff3300' : '0 0 10px #00e5ff'
            }} />
            <span style={{ fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px' }}>
              AI DETECTION SYSTEM
            </span>
          </div>
          <span style={{
            fontSize: '11px',
            color: activeScanTarget?.isEmergency ? '#ff3300' : '#00ffcc',
            backgroundColor: activeScanTarget?.isEmergency ? 'rgba(255,50,0,0.2)' : 'rgba(0,255,200,0.1)',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            YOLOv8 + LiDAR
          </span>
        </div>

        {/* Status / Target Locked Alert */}
        {targetLocked && activeScanTarget?.isEmergency ? (
          <div style={{
            backgroundColor: 'rgba(255, 51, 0, 0.25)',
            border: '1px dashed #ff3300',
            padding: '10px',
            borderRadius: '6px',
            color: '#ff6633',
            fontSize: '12px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            ⚠️ SAFETY EQUIPMENT DETECTED<br />
            [ DRONE HOVERING — TARGET LOCKED ]
          </div>
        ) : (
          <div style={{
            fontSize: '11px',
            color: activeScanTarget ? '#00ffcc' : '#8899aa',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>MODE: {targetLocked ? 'HOVER LOCK' : 'ACTIVE SCAN'}</span>
            <span>{activeScanTarget ? '1 OBJECT FOUND' : 'SWEEPING SECTOR'}</span>
          </div>
        )}

        {/* Active Scan Target Details */}
        {activeScanTarget ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              padding: '10px',
              borderRadius: '6px',
              borderLeft: activeScanTarget.isEmergency ? '3px solid #ff3300' : '3px solid #00e5ff'
            }}>
              <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '2px' }}>DETECTED OBJECT:</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
                {activeScanTarget.name}
              </div>
              <div style={{ fontSize: '12px', color: activeScanTarget.isEmergency ? '#ff6633' : '#00e5ff', marginTop: '2px' }}>
                {activeScanTarget.category}
              </div>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '4px' }}>
                <span style={{ color: '#88a', fontSize: '10px', display: 'block' }}>CONFIDENCE</span>
                <span style={{ color: '#00ff66', fontWeight: 'bold' }}>{activeScanTarget.confidence.toFixed(1)}%</span>
              </div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '4px' }}>
                <span style={{ color: '#88a', fontSize: '10px', display: 'block' }}>DISTANCE</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{activeScanTarget.distance.toFixed(1)}m</span>
              </div>
              {activeScanTarget.coords && (
                <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '4px', gridColumn: 'span 2' }}>
                  <span style={{ color: '#88a', fontSize: '10px', display: 'block' }}>3D WORLD COORDS</span>
                  <span style={{ color: '#ccc' }}>
                    X: {activeScanTarget.coords[0].toFixed(1)} | Y: {activeScanTarget.coords[1].toFixed(1)} | Z: {activeScanTarget.coords[2].toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Bounding Box / Vision Analysis */}
            <div style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '8px',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#bbb',
              fontFamily: 'monospace'
            }}>
              <div style={{ color: '#88a', marginBottom: '4px' }}>VISION INFERENCE STATS:</div>
              <div>• Class ID: {activeScanTarget.isEmergency ? 'fire_extinguisher' : activeScanTarget.category.toLowerCase()}</div>
              <div>• Bounding Box: [Norm 0.88 x 0.94]</div>
              <div>• Status: {activeScanTarget.isEmergency ? 'READY / OPERATIONAL' : 'STRUCTURAL OK'}</div>
            </div>

            {/* Photographed Snapshot Picture Box on Target Detect */}
            {targetLocked && activeScanTarget.isEmergency && (
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                border: '1px solid #ff3300',
                borderRadius: '6px',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#ff6633',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  <span>[ ● CAPTURED PICTURE SNAPSHOT ]</span>
                  <span>CAM-01 F/1.8</span>
                </div>
                {/* Simulated Target Photo Viewfinder */}
                <div style={{
                  height: '110px',
                  backgroundColor: '#110505',
                  border: '1px dashed rgba(255,50,0,0.5)',
                  borderRadius: '4px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {/* Visual Render / Stylized Photo of Fire Extinguisher */}
                  <div style={{
                    width: '32px',
                    height: '65px',
                    backgroundColor: '#ff1a1a',
                    borderRadius: '3px',
                    boxShadow: '0 0 15px #ff1a1a',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <div style={{ width: '12px', height: '6px', backgroundColor: '#aaa', marginTop: '-6px' }} />
                    <div style={{ width: '20px', height: '4px', backgroundColor: '#ffcc00', marginTop: '6px' }} />
                  </div>
                  {/* Targeting Brackets */}
                  <div style={{ position: 'absolute', top: 8, left: 8, color: '#ff3300', fontSize: '10px' }}>┌</div>
                  <div style={{ position: 'absolute', top: 8, right: 8, color: '#ff3300', fontSize: '10px' }}>┐</div>
                  <div style={{ position: 'absolute', bottom: 8, left: 8, color: '#ff3300', fontSize: '10px' }}>└</div>
                  <div style={{ position: 'absolute', bottom: 8, right: 8, color: '#ff3300', fontSize: '10px' }}>┘</div>
                  <div style={{ position: 'absolute', bottom: 6, fontSize: '9px', color: '#ff9980', fontFamily: 'monospace' }}>
                    LOC: X:0.0 Y:1.8 Z:-6.0 | LOCK 99.4%
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Buttons: Pickup Airlift or Resume Patrol */}
            {targetLocked && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                {!isPickingUp ? (
                  <>
                    <button
                      onClick={() => {
                        setIsPickingUp(true)
                      }}
                      style={{
                        backgroundColor: '#ff3300',
                        color: 'white',
                        border: 'none',
                        padding: '11px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        letterSpacing: '0.5px',
                        boxShadow: '0 0 15px rgba(255, 51, 0, 0.6)',
                        transition: 'all 0.2s'
                      }}
                    >
                      [ START OBJECT PICKUP & AIRLIFT ]
                    </button>
                    <button
                      onClick={() => {
                        setTargetLocked(false)
                      }}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: '#ccc',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      Skip / Resume Patrol
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{
                      backgroundColor: 'rgba(0, 229, 255, 0.2)',
                      border: '1px solid #00e5ff',
                      padding: '8px',
                      borderRadius: '6px',
                      color: '#00e5ff',
                      fontSize: '11px',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>
                      🚀 AIRLIFT IN PROGRESS (26m ALTITUDE)<br />
                      [ HOLDING ABOVE INDUSTRIES ]
                    </div>
                    <button
                      onClick={() => {
                        setIsPickingUp(false)
                        setTargetLocked(false)
                      }}
                      style={{
                        backgroundColor: '#0070f3',
                        color: 'white',
                        border: 'none',
                        padding: '11px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                      }}
                    >
                      [ AIRLIFT COMPLETE — RESUME PATROL ]
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            padding: '20px 0',
            textAlign: 'center',
            color: '#8899aa',
            fontSize: '12px',
            fontStyle: 'italic'
          }}>
            Scanning industrial sector for objects & safety equipment...
          </div>
        )}

        {/* Scanned Log */}
        {scannedHistory.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
            <div style={{ fontSize: '11px', color: '#88a', marginBottom: '4px' }}>
              SCANNED LOG (PHASE 10/13):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
              {scannedHistory.slice(-4).reverse().map((obj, idx) => (
                <div key={idx} style={{
                  fontSize: '11px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: obj.isEmergency ? '#ff6633' : '#bcf',
                  backgroundColor: obj.isEmergency ? 'rgba(255,50,0,0.1)' : 'transparent',
                  padding: '2px 4px',
                  borderRadius: '3px'
                }}>
                  <span>{obj.isEmergency ? '⚠️' : '✓'} {obj.name}</span>
                  <span>{obj.confidence.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading Screen */}
      {progress < 100 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '20px 40px',
          borderRadius: '12px',
          fontFamily: 'monospace',
          fontSize: '24px'
        }}>
          Loading... {progress.toFixed(0)}%
        </div>
      )}
    </div>
  )
}
