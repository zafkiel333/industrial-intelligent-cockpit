import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const PumpRunnerModel = ({ rpm, mode, guideVaneAngle, cavIndex }: { rpm: number, mode: string, guideVaneAngle: number, cavIndex: number }) => {
  const runnerRef = useRef<THREE.Group>(null);
  const vanesRef = useRef<THREE.Group>(null);
  const bubbleRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    // Rotation mapping based on real RPM (scaled down)
    if (runnerRef.current) {
      runnerRef.current.rotation.y += (rpm / 60) * Math.PI * 2 * 0.016; 
    }

    if (vanesRef.current) {
      // Guide vane opening 0-45 deg mapped
      const angleRad = (guideVaneAngle / 180) * Math.PI;
      vanesRef.current.children.forEach((vane) => {
         vane.rotation.y = THREE.MathUtils.lerp(vane.rotation.y, angleRad, 0.1);
      });
    }

    // Cavitation bubbles agitation
    if (bubbleRef.current) {
      if (cavIndex < 0.18) {
         bubbleRef.current.visible = true;
         const positions = bubbleRef.current.geometry.attributes.position.array as Float32Array;
         for (let i = 0; i < positions.length; i += 3) {
            positions[i+1] += (Math.random() - 0.5) * 0.5;
            positions[i] += (Math.random() - 0.5) * 0.2;
            positions[i+2] += (Math.random() - 0.5) * 0.2;

            if (positions[i+1] > 2) {
               positions[i+1] = -3;
               positions[i] = (Math.random() - 0.5) * 8;
               positions[i+2] = (Math.random() - 0.5) * 8;
            }
         }
         bubbleRef.current.geometry.attributes.position.needsUpdate = true;
      } else {
         bubbleRef.current.visible = false;
      }
    }
  });

  return (
    <group>
      {/* Draft Tube / Water passage representation */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[5.5, 4.5, 6, 32, 1, true]} />
        <meshPhysicalMaterial color="#0ea5e9" transparent opacity={0.1} transmission={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Runner */}
      <group ref={runnerRef} position={[0, 0, 0]}>
        <mesh>
           <cylinderGeometry args={[1, 4, 2, 16]} />
           <meshStandardMaterial color={mode === 'pump' ? '#8b5cf6' : mode === 'turbine' ? '#3b82f6' : '#94a3b8'} metalness={0.8} />
        </mesh>
        
        {/* Runner Blades */}
        {Array.from({length: 7}).map((_, i) => (
          <mesh key={`blade-${i}`} position={[Math.sin(i * Math.PI * 2 / 7) * 2.5, -0.5, Math.cos(i * Math.PI * 2 / 7) * 2.5]} rotation={[0.4, i * Math.PI * 2 / 7 + 0.5, 0.4]}>
            <boxGeometry args={[0.2, 2.5, 2.5]} />
            <meshStandardMaterial color={mode === 'pump' ? '#7c3aed' : mode === 'turbine' ? '#2563eb' : '#64748b'} metalness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Guide Vanes Ring */}
      <group ref={vanesRef}>
        {Array.from({length: 16}).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          return (
            <group key={`vane-${i}`} position={[Math.sin(angle) * 4.8, 0, Math.cos(angle) * 4.8]}>
               <mesh>
                 <boxGeometry args={[0.1, 2, 1.2]} />
                 <meshStandardMaterial color="#f59e0b" metalness={0.6} />
               </mesh>
            </group>
          )
        })}
      </group>

      {/* Cavitation Bubbles */}
      <points ref={bubbleRef} visible={false}>
         <bufferGeometry>
            <bufferAttribute 
               attach="attributes-position" 
               count={200} 
               array={new Float32Array(600).map(() => (Math.random() - 0.5) * 8)} 
               itemSize={3} 
            />
         </bufferGeometry>
         <pointsMaterial size={0.2} color="#ffffff" transparent opacity={0.6} />
      </points>

    </group>
  );
};

export const PumpRunnerThreeScene = ({ rpm, mode, guideVaneAngle, cavIndex }: { rpm: number, mode: string, guideVaneAngle: number, cavIndex: number }) => {
  return (
    <Canvas camera={{ position: [0, 8, 20], fov: 40 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />
      <pointLight position={[-8, -2, -8]} intensity={1} color="#8b5cf6" />
      <PumpRunnerModel rpm={rpm} mode={mode} guideVaneAngle={guideVaneAngle} cavIndex={cavIndex} />
      <OrbitControls target={[0, -1, 0]} enableDamping minDistance={10} maxDistance={30} enablePan={false} />
    </Canvas>
  );
};
