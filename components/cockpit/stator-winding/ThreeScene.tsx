import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const StatorWindingModel = ({ slotTemps }: { slotTemps: number[] }) => {
  const rotorRef = useRef<THREE.Group>(null);
  
  // Create geometry arrays for performance
  const slotCount = 36;
  const radius = 6;
  
  useFrame(({ clock }) => {
    if (rotorRef.current) {
      // Spinning the inner rotor representation slowly
      rotorRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    }
  });

  const getSlotColor = (temp: number) => {
     if (temp < 70) return '#3b82f6'; // Blue
     if (temp < 80) return '#eab308'; // Yellow
     if (temp < 90) return '#f97316'; // Orange
     return '#ef4444'; // Red
  };

  const slotMeshes = useMemo(() => {
     const meshes = [];
     for(let i = 0; i < slotCount; i++) {
        const angle = (i / slotCount) * Math.PI * 2;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        
        // Map abstract 6 sensors to the 36 slots
        const sensorIndex = Math.floor(i / (slotCount/6));
        const temp = slotTemps[sensorIndex] || 65;
        const color = getSlotColor(temp);

        meshes.push(
           <mesh key={`slot-${i}`} position={[x, 0, z]} rotation={[0, angle, 0]}>
             <boxGeometry args={[0.3, 10, 1]} />
             <meshStandardMaterial 
                color={color} 
                emissive={color} 
                emissiveIntensity={temp > 80 ? (temp - 80) * 0.1 : 0.2} 
                roughness={0.2} 
                metalness={0.8}
             />
           </mesh>
        );
     }
     return meshes;
  }, [slotTemps]);

  return (
    <group position={[0, -2, 0]}>
      {/* Outer Stator Core Shell */}
      <mesh position={[0, 0, 0]}>
         <cylinderGeometry args={[radius + 1.2, radius + 1.2, 10, 64]} />
         <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Embedded Copper Winding Bars (The Slots) */}
      <group>
         {slotMeshes}
      </group>

      {/* Inner Rotating Field (Rotor) abstract representation */}
      <group ref={rotorRef}>
         <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[radius - 1, radius - 1, 10.5, 32]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.5} />
         </mesh>
         {/* Magnetic poles representation */}
         <mesh position={[0, 0, 0]}>
            <boxGeometry args={[radius * 2 - 1.8, 11, 2]} />
            <meshStandardMaterial color="#475569" metalness={0.9} />
         </mesh>
         <mesh position={[0, 0, 0]} rotation={[0, Math.PI/2, 0]}>
            <boxGeometry args={[radius * 2 - 1.8, 11, 2]} />
            <meshStandardMaterial color="#475569" metalness={0.9} />
         </mesh>
      </group>
      
      {/* Cooling Pipes indicator */}
      <mesh position={[0, -5, 0]}>
         <torusGeometry args={[radius + 1.5, 0.2, 16, 100]} />
         <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

export const StatorWindingThreeScene = ({ slotTemps }: { slotTemps: number[] }) => {
  return (
    <Canvas camera={{ position: [0, 18, 18], fov: 40 }}>
      {/* Very dark background for glowing effect */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} />
      <pointLight position={[0, 5, 0]} intensity={1} color="#ffffff" distance={20} />
      <StatorWindingModel slotTemps={slotTemps} />
      <OrbitControls target={[0, 2, 0]} enableDamping minDistance={15} maxDistance={35} maxPolarAngle={Math.PI/2 - 0.1} enablePan={false} />
    </Canvas>
  );
};
