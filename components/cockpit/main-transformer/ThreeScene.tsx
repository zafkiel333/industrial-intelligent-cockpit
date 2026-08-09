import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const TransformerModel = ({ fans, temperature, discharge }: { fans: number, temperature: number, discharge: number }) => {
  const fanRefs = useRef<THREE.Group[]>([]);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    // Rotate cooling fans
    fanRefs.current.forEach((ref, index) => {
      if (ref && index < fans) {
        ref.rotation.z += 15 * delta;
      }
    });

    // Make core throb if high discharge/temperature
    if (coreRef.current && discharge > 300) {
      coreRef.current.material.emissiveIntensity = Math.abs(Math.sin(_ .clock.getElapsedTime() * 10)) * 2;
    } else if (coreRef.current) {
      coreRef.current.material.emissiveIntensity = temperature > 80 ? 0.5 : 0;
    }
  });

  return (
    <group position={[0, -2, 0]}>
      {/* Base platform */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[12, 1, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Main Tank Body */}
      <mesh position={[0, 3, 0]} castShadow receiveShadow ref={coreRef}>
        <boxGeometry args={[6, 6, 4]} />
        <meshStandardMaterial 
           color="#334155" 
           metalness={0.6} 
           roughness={0.4} 
           emissive="#ef4444" 
           emissiveIntensity={0}
        />
      </mesh>

      {/* High Voltage Bushings */}
      {[[-2, 6.5, 0], [0, 6.5, 0], [2, 6.5, 0]].map((pos, i) => (
        <group position={pos as [number, number, number]} key={`hv-${i}`}>
           <mesh position={[0, 1.5, 0]} castShadow>
             <cylinderGeometry args={[0.2, 0.4, 3, 16]} />
             <meshStandardMaterial color="#94a3b8" metalness={0.8} />
           </mesh>
           {/* Corona rings */}
           <mesh position={[0, 2.8, 0]} rotation={[Math.PI/2, 0, 0]}>
             <torusGeometry args={[0.4, 0.05, 16, 32]} />
             <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
           </mesh>
        </group>
      ))}

      {/* Radiators and Fans */}
      {[-1, 1].map((side) => (
        <group position={[side * 4, 3, 0]} key={`rad-${side}`}>
          {/* Radiator bank */}
          <mesh castShadow>
             <boxGeometry args={[1.5, 5, 5]} />
             <meshStandardMaterial color="#475569" />
          </mesh>
          {/* Fan 1 */}
          <group position={[side * 0.8, 1.5, 0]} rotation={[0, side === 1 ? -Math.PI/2 : Math.PI/2, 0]} ref={el => { if (el) fanRefs.current.push(el) }}>
            <mesh>
              <cylinderGeometry args={[0.8, 0.8, 0.2, 16]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh rotation={[0, 0, 0]}>
              <boxGeometry args={[1.4, 0.1, 0.1]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
            <mesh rotation={[0, 0, Math.PI/2]}>
              <boxGeometry args={[1.4, 0.1, 0.1]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
          </group>
          {/* Fan 2 */}
          <group position={[side * 0.8, -1.5, 0]} rotation={[0, side === 1 ? -Math.PI/2 : Math.PI/2, 0]} ref={el => { if (el) fanRefs.current.push(el) }}>
            <mesh>
              <cylinderGeometry args={[0.8, 0.8, 0.2, 16]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh rotation={[0, 0, 0]}>
              <boxGeometry args={[1.4, 0.1, 0.1]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
            <mesh rotation={[0, 0, Math.PI/2]}>
              <boxGeometry args={[1.4, 0.1, 0.1]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
          </group>
        </group>
      ))}
      
      {/* Visual discharge arcs if critical */}
      {discharge > 400 && (
         <mesh position={[0, 6, 1]}>
           <sphereGeometry args={[0.5, 16, 16]} />
           <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.6} />
         </mesh>
      )}

    </group>
  );
};

export const TransformerThreeScene = ({ fans, temperature, discharge }: { fans: number, temperature: number, discharge: number }) => {
  return (
    <Canvas camera={{ position: [12, 10, 15], fov: 40 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
      {discharge > 400 && <pointLight position={[0, 5, 0]} color="#a855f7" intensity={2} distance={10} />}
      <TransformerModel fans={fans} temperature={temperature} discharge={discharge} />
      <OrbitControls target={[0, 3, 0]} enableDamping minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.1} />
    </Canvas>
  );
};
