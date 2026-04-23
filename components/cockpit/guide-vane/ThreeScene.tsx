import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const GuideVaneModel = ({ stroke, vanes }: { stroke: number, vanes: number[] }) => {
  const ringRef = useRef<THREE.Group>(null);
  const armsGroupRef = useRef<THREE.Group>(null);
  
  // Total of 24 vanes usually, we map the 4 quadrant sensors to interpolate or just show 12 simplified
  const vaneCount = 12;
  const radius = 6;
  const ringRotation = stroke * 0.0005; // Map 0-400mm to rad
  
  useFrame(() => {
    if (ringRef.current) {
        // Regulating ring rotates back and forth
        ringRef.current.rotation.y = THREE.MathUtils.lerp(ringRef.current.rotation.y, ringRotation, 0.1);
    }
  });

  return (
    <group position={[0, -1, 0]}>
      {/* Outer casing base */}
      <mesh position={[0, -3.5, 0]}>
         <cylinderGeometry args={[radius + 4, radius + 4, 1, 64]} />
         <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* Control Ring (Regulating Ring) */}
      <group ref={ringRef} position={[0, 2, 0]}>
         {/* The thick steel ring */}
         <mesh>
            <torusGeometry args={[radius + 2, 0.4, 16, 64]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
         </mesh>
         {/* Servomotor attachment rods (Connecting to the ring) */}
         <mesh position={[radius + 2.5, 0, 0]} rotation={[0, 0, Math.PI/2]}>
             <cylinderGeometry args={[0.2, 0.2, 3, 16]} />
             <meshStandardMaterial color="#f59e0b" metalness={0.7} />
         </mesh>
         <mesh position={[-radius - 2.5, 0, 0]} rotation={[0, 0, Math.PI/2]}>
             <cylinderGeometry args={[0.2, 0.2, 3, 16]} />
             <meshStandardMaterial color="#f59e0b" metalness={0.7} />
         </mesh>
      </group>

      {/* Guide Vanes Array (Wicket Gates) */}
      <group ref={armsGroupRef} position={[0, 0, 0]}>
         {Array.from({length: vaneCount}).map((_, i) => {
            const angle = (i / vaneCount) * Math.PI * 2;
            const x = Math.sin(angle) * (radius - 1);
            const z = Math.cos(angle) * (radius - 1);
            
            // Map the 4 sensor quadrant angles onto the 12 vanes
            const quad = Math.floor((i / vaneCount) * 4);
            const targetVaneDeg = vanes[quad] || 0;
            const vaneRad = (targetVaneDeg / 180) * Math.PI;

            // Highlight if stuck (diverging heavily from stroke logic)
            // Stroke 0 is approx 0 deg, stroke 400 is approx 20 deg
            const expectedRad = (stroke * 0.05 / 180) * Math.PI;
            const isStuck = Math.abs(vaneRad - expectedRad) > 0.1;

            return (
               <group key={`vane-sys-${i}`} position={[x, 0, z]}>
                  {/* Stem / linkage down from ring */}
                  <mesh position={[0, 1, 0]}>
                     <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
                     <meshStandardMaterial color={isStuck ? '#ef4444' : '#64748b'} metalness={isStuck ? 0 : 0.8} />
                  </mesh>
                  {/* The Guide Vane Blade */}
                  <mesh position={[0, -1.5, 0]} rotation={[0, vaneRad + angle, 0]}>
                     {/* Leaf shape roughly */}
                     <boxGeometry args={[0.2, 3, 2]} />
                     <meshStandardMaterial color={isStuck ? '#dc2626' : '#3b82f6'} metalness={0.5} roughness={0.4} />
                  </mesh>
               </group>
            )
         })}
      </group>
      
      {/* Inner runner cover / flow area */}
      <mesh position={[0, -1.5, 0]}>
         <cylinderGeometry args={[radius - 3, radius - 3, 4, 32]} />
         <meshStandardMaterial color="#020617" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

export const GuideVaneThreeScene = ({ stroke, vanes }: { stroke: number, vanes: number[] }) => {
  return (
    <Canvas camera={{ position: [12, 15, 15], fov: 45 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 15]} intensity={1.5} castShadow />
      <pointLight position={[0, 5, 0]} intensity={1.2} color="#ffffff" />
      <GuideVaneModel stroke={stroke} vanes={vanes} />
      <OrbitControls target={[0, -1, 0]} enableDamping minDistance={10} maxDistance={40} maxPolarAngle={Math.PI/2 - 0.2} enablePan={false} />
    </Canvas>
  );
};
