import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const MainShaftModel = ({ dx, dy, speed }: { dx: number, dy: number, speed: number }) => {
  const shaftRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (shaftRef.current) {
      // Rotation simulation
      shaftRef.current.rotation.y += speed * 0.05;
      
      // X and Y displacements mapping (microns converted to visual units, exaggerated heavily for visibility)
      // Base radius of shaft is 1. Displacement of 100 microns is very small in reality, we exaggerated it:
      const visualDx = dx * 0.005;
      const visualDz = dy * 0.005; 
      
      shaftRef.current.position.x = visualDx;
      shaftRef.current.position.z = visualDz;
    }

    if (ringRef.current) {
        // Red flashing effect if eccentric
        const severity = Math.sqrt(dx*dx + dy*dy);
        if (severity > 50) {
            (ringRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = (Math.sin(clock.getElapsedTime() * 10) + 1) * 0.5;
        } else {
            (ringRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
        }
    }
  });

  return (
    <group>
      {/* Guide Bearing Assembly (Stationary) */}
      <group position={[0, 0, 0]}>
         {/* Support structure */}
         <mesh position={[0, -2, 0]}>
            <cylinderGeometry args={[4, 4.5, 1, 32]} />
            <meshStandardMaterial color="#1e293b" />
         </mesh>
         
         {/* Inner Ring (The bearing pads) */}
         <mesh ref={ringRef} position={[0, 0, 0]}>
            <cylinderGeometry args={[2.2, 3, 2, 32]} />
            <meshStandardMaterial color="#475569" metalness={0.7} emissive="#ef4444" emissiveIntensity={0} />
         </mesh>
      </group>

      {/* Main Shaft (Rotating and Wobbling) */}
      <group ref={shaftRef}>
        {/* Main section */}
        <mesh position={[0, 3, 0]}>
          <cylinderGeometry args={[2.0, 2.0, 12, 32]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Flange coupling */}
        <mesh position={[0, 8, 0]}>
           <cylinderGeometry args={[3, 3, 0.5, 32]} />
           <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
      </group>
      
      {/* Grid helper for visual reference of displacement */}
      <gridHelper args={[10, 10, '#334155', '#1e293b']} position={[0, -2.5, 0]} />
    </group>
  );
};

export const MainShaftThreeScene = ({ dx, dy, speed }: { dx: number, dy: number, speed: number }) => {
  return (
    <Canvas camera={{ position: [8, 12, 18], fov: 40 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      <MainShaftModel dx={dx} dy={dy} speed={speed} />
      <OrbitControls target={[0, 4, 0]} enableDamping minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.1} minDistance={10} maxDistance={30} enablePan={false} />
    </Canvas>
  );
};
