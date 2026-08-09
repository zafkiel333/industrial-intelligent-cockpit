import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const ValveModel = ({ angle, vibration, bypass }: { angle: number, vibration: number, bypass: boolean }) => {
  const valveCoreRef = useRef<THREE.Group>(null);
  const bypassRef = useRef<THREE.Mesh>(null);
  const wholeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (valveCoreRef.current) {
      // Rotate the spherical core mapping angle (0 to 90 degrees) to radians
      valveCoreRef.current.rotation.x = THREE.MathUtils.lerp(valveCoreRef.current.rotation.x, (angle / 90) * (Math.PI / 2), 0.1);
    }
    if (bypassRef.current) {
      bypassRef.current.material.emissiveIntensity = bypass ? 1 : 0;
    }
    if (wholeRef.current && vibration > 0) {
       // Shake the whole body slightly based on vibration
       wholeRef.current.position.y = (Math.random() - 0.5) * vibration * 0.02;
       wholeRef.current.position.x = (Math.random() - 0.5) * vibration * 0.02;
    }
  });

  return (
    <group ref={wholeRef}>
      {/* Outer Casing */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.5} transparent opacity={0.6} />
      </mesh>
      
      {/* Flanges */}
      <mesh position={[0, 0, 4]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[3.5, 3.5, 0.5, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      <mesh position={[0, 0, -4]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[3.5, 3.5, 0.5, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>

      {/* Internal Spherical Core (The actual valve mechanism) */}
      <group ref={valveCoreRef}>
        <mesh>
          <sphereGeometry args={[3.8, 32, 32]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Core opening hole (rendered as a dark tunnel passing through) */}
        <mesh rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[2.5, 2.5, 8, 32]} />
          <meshStandardMaterial color="#020617" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Bypass pipe system */}
      <group position={[3.5, 0, 0]}>
         {/* Bypass pipe routing */}
         <mesh position={[0, 0, 2]} rotation={[Math.PI/2, 0, 0]}>
           <cylinderGeometry args={[0.3, 0.3, 2, 16]} />
           <meshStandardMaterial color="#64748b" />
         </mesh>
         <mesh position={[0, 0, -2]} rotation={[Math.PI/2, 0, 0]}>
           <cylinderGeometry args={[0.3, 0.3, 2, 16]} />
           <meshStandardMaterial color="#64748b" />
         </mesh>
         <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
           <cylinderGeometry args={[0.3, 0.3, 4, 16]} />
           <meshStandardMaterial color="#64748b" />
         </mesh>
         {/* Bypass valve indicator */}
         <mesh position={[0, 0, 0]} ref={bypassRef}>
           <sphereGeometry args={[0.6, 16, 16]} />
           <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0} />
         </mesh>
      </group>

      {/* Water visualization inside if open */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
         <cylinderGeometry args={[2.4, 2.4, 10, 32]} />
         <meshPhysicalMaterial color="#0ea5e9" transmission={0.9} opacity={angle > 0 ? (angle/90) : 0} transparent roughness={0.1} />
      </mesh>

    </group>
  );
};

export const ValveThreeScene = ({ angle, vibration, bypass }: { angle: number, vibration: number, bypass: boolean }) => {
  return (
    <Canvas camera={{ position: [8, 6, 10], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
      {bypass && <pointLight position={[3.5, 0, 0]} color="#38bdf8" intensity={2} distance={5} />}
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#0ea5e9" />
      <ValveModel angle={angle} vibration={vibration} bypass={bypass} />
      <OrbitControls target={[0, 0, 0]} enableDamping minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.2} />
    </Canvas>
  );
};
