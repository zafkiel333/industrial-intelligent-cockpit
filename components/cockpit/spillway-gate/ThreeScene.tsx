import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useHelper } from '@react-three/drei';
import * as THREE from 'three';

const GateModel = ({ opening, vibration }: { opening: number, vibration: number }) => {
  const gateRef = useRef<THREE.Group>(null);
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (gateRef.current) {
      // Rotate gate arm based on opening (0 to 100%)
      // An opening of 100% means swinging up by maybe 45 degrees
      const targetAngle = (opening / 100) * (Math.PI / 4);
      gateRef.current.rotation.x = THREE.MathUtils.lerp(gateRef.current.rotation.x, targetAngle, 0.05);

      if (vibration > 0) {
         gateRef.current.position.y = Math.sin(clock.getElapsedTime() * 50) * (vibration * 0.005);
      }
    }
    if (waterRef.current) {
       // Animate water passing underneath if open
       if (opening > 0) {
         waterRef.current.position.z = (clock.getElapsedTime() * (opening * 0.05)) % 5;
       }
    }
  });

  return (
    <group>
      {/* Concrete Pier / Dam structure */}
      <mesh position={[-5, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 10, 15]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh position={[5, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 10, 15]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh position={[0, -4, 0]} receiveShadow>
        <boxGeometry args={[6, 2, 15]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Radial Gate assembly pivoted at y=0, z=-5 */}
      <group position={[0, 0, -5]} ref={gateRef}>
        {/* Pivot points */}
        <mesh position={[-3, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        <mesh position={[3, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>

        {/* Arms */}
        <mesh position={[-2.5, -2, 3]} rotation={[0.4, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 6, 0.5]} />
          <meshStandardMaterial color="#ef4444" metalness={0.5} />
        </mesh>
        <mesh position={[2.5, -2, 3]} rotation={[0.4, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 6, 0.5]} />
          <meshStandardMaterial color="#ef4444" metalness={0.5} />
        </mesh>

        {/* Gate Face */}
        <mesh position={[0, -4.5, 6]} rotation={[-0.2, 0, 0]} castShadow>
          {/* A curved surface approximated with a box for simplicity or cylinder segment */}
          <cylinderGeometry args={[6, 6, 6, 32, 1, false, Math.PI * 0.75 + 0.1, Math.PI * 0.5 - 0.2]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.7} roughness={0.2} transparent opacity={0.9} />
        </mesh>
      </group>

      {/* Flowing Water */}
      {opening > 0 && (
         <mesh position={[0, -2.8, 5]} rotation={[-Math.PI/2, 0, 0]} ref={waterRef}>
           <planeGeometry args={[6, 20, 16, 16]} />
           <meshPhysicalMaterial color="#0ea5e9" transmission={0.9} opacity={1} transparent roughness={0.1} ior={1.33} />
         </mesh>
      )}

      {/* Upstream pool */}
      <mesh position={[0, 0, 10]} rotation={[-Math.PI/2, 0, 0]}>
         <planeGeometry args={[6, 10]} />
         <meshStandardMaterial color="#0284c7" transparent opacity={0.8} />
      </mesh>
    </group>
  );
};

export const SpillwayThreeScene = ({ opening, vibration }: { opening: number, vibration: number }) => {
  return (
    <Canvas camera={{ position: [2.5, 6, 16], fov: 40 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-10, 5, 5]} intensity={1} color="#38bdf8" />
      <GateModel opening={opening} vibration={vibration} />
      <OrbitControls target={[0, -2, 2]} enableDamping minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.1} />
    </Canvas>
  );
};
