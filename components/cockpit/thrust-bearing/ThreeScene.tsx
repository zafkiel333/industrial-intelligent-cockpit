import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const BearingModel = ({ padTemps, oilThickness }: { padTemps: number[], oilThickness: number }) => {
  const rotorRef = useRef<THREE.Group>(null);
  const oilLayerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (rotorRef.current) {
      rotorRef.current.rotation.y = clock.getElapsedTime() * 2;
    }
  });

  const getPadColor = (temp: number) => {
    // 50 C = cyan, 60 C = Red
    if (temp < 54) return '#0ea5e9';
    if (temp < 58) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <group>
      {/* Thrust Block / Mirror plate (Rotating part) */}
      <group ref={rotorRef} position={[0, 0.5 + oilThickness * 0.01, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[5, 5, 1, 32]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry args={[2, 2, 3, 32]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
      </group>

      {/* Oil Film Layer */}
      <mesh position={[0, 0, 0]} ref={oilLayerRef}>
        <cylinderGeometry args={[4.8, 4.8, oilThickness * 0.01 + 0.1, 32]} />
        <meshPhysicalMaterial color="#fbbf24" transparent opacity={0.6} transmission={0.5} />
      </mesh>

      {/* Thrust Pads (Stationary) */}
      {padTemps.map((temp, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.sin(angle) * 3.5;
        const z = Math.cos(angle) * 3.5;
        return (
          <mesh key={i} position={[x, -0.5, z]} rotation={[0, angle, 0]} receiveShadow>
            <boxGeometry args={[1.5, 0.8, 2]} />
            {/* Emissive color based on temperature */}
            <meshStandardMaterial 
              color={getPadColor(temp)} 
              emissive={getPadColor(temp)}
              emissiveIntensity={temp > 56 ? (temp - 56) * 0.8 : 0}
            />
          </mesh>
        );
      })}

      {/* Base Support */}
      <mesh position={[0, -1.5, 0]} receiveShadow>
        <cylinderGeometry args={[6, 6, 1, 32]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
};

export const ThrustBearingThreeScene = ({ padTemps, oilThickness }: { padTemps: number[], oilThickness: number }) => {
  return (
    <Canvas camera={{ position: [0, 10, 20], fov: 40 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
      <pointLight position={[-10, 5, -10]} intensity={0.8} color="#0ea5e9" />
      <BearingModel padTemps={padTemps} oilThickness={oilThickness} />
      <OrbitControls target={[0, 0, 0]} enableDamping maxPolarAngle={Math.PI / 2 + 0.1} minDistance={10} maxDistance={30} enablePan={false} />
    </Canvas>
  );
};
