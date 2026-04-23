import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const ParticleSparks = ({ sparkIntensity }: { sparkIntensity: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 200;
  
  // Create particle positions
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = [];
    for (let i = 0; i < particleCount; i++) {
        // Start near brushing area (z ~ 4.2)
        pos[i * 3] = (Math.random() - 0.5) * 2;
        pos[i * 3 + 1] = 0; // vertical spray roughly around y=0 initially
        pos[i * 3 + 2] = 4.2 + Math.random() * 0.5;

        vel.push({
           x: (Math.random() - 0.5) * 0.3,
           y: (Math.random() - 0.2) * 0.5,
           z: Math.random() * 0.5 + 0.2
        });
    }
    return [pos, vel];
  }, []);

  useFrame(() => {
    if (pointsRef.current && sparkIntensity > 0) {
       const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
       for(let i=0; i<particleCount; i++) {
          // If a particle should be active based on intensity
          if (i < particleCount * sparkIntensity) {
             positions[i*3] += velocities[i].x;
             positions[i*3+1] += velocities[i].y;
             positions[i*3+2] += velocities[i].z;

             // Reset if they went too far
             if (positions[i*3+2] > 7 || positions[i*3+1] > 3) {
                positions[i*3] = (Math.random() - 0.5) * 2;
                positions[i*3+1] = (Math.random() - 0.5);
                positions[i*3+2] = 4.2;
             }
          } else {
             // Hide inactive ones
             positions[i*3] = 0;
             positions[i*3+1] = 0;
             positions[i*3+2] = 4.2;
          }
       }
       pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (sparkIntensity === 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#fbbf24"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const ExcitationSlipRingModel = ({ rpm, sparkIntensity, brushWear }: { rpm: number, sparkIntensity: number, brushWear: number[] }) => {
  const ringRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (ringRef.current) {
      // RPM is typically 300, rendering that visually is too fast, blur it.
      // We simulate high speed rotation
      ringRef.current.rotation.y += (rpm / 60) * Math.PI * 2 * 0.01; 
    }
  });

  return (
    <group position={[0, -1, 0]}>
      {/* Central Shaft */}
      <mesh position={[0, 0, 0]}>
         <cylinderGeometry args={[2, 2, 10, 32]} />
         <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.5} />
      </mesh>

      {/* Rotating Slip Ring */}
      <group ref={ringRef} position={[0, 0, 0]}>
         <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[4, 4, 3, 64]} />
            <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.2} /> {/* Copper/Brass color */}
         </mesh>
         <mesh position={[0, -2, 0]}>
            <cylinderGeometry args={[4, 4, 3, 64]} />
            <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.2} />
         </mesh>
      </group>

      {/* Carbon Brushes & Holders */}
      {/* We represent 4 brushes around the upper ring (position Y=2) */}
      {[0, 1, 2, 3].map(i => {
         const angle = (i / 4) * Math.PI * 2;
         const x = Math.sin(angle) * (4 + 0.5); // base distance
         const z = Math.cos(angle) * (4 + 0.5);
         // Wear shifts the brush radially inward.
         // Max wear = 0.5 unit visual shift inwards maybe?
         const wearOffset = (50 - brushWear[i]) * 0.05; 
         
         const brushX = Math.sin(angle) * (4.2 - wearOffset);
         const brushZ = Math.cos(angle) * (4.2 - wearOffset);

         return (
            <group key={`brush-assembly-${i}`}>
               {/* Holder Assembly */}
               <mesh position={[x + Math.sin(angle)*1, 2, z + Math.cos(angle)*1]} rotation={[0, angle, 0]}>
                  <boxGeometry args={[1.5, 2, 2]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.3} />
               </mesh>
               
               {/* Spring/Wire (simplified as a rod) */}
               <mesh position={[x + Math.sin(angle)*0.5, 2, z + Math.cos(angle)*0.5]} rotation={[0, angle, Math.PI/2]}>
                  <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
                  <meshStandardMaterial color="#94a3b8" />
               </mesh>

               {/* The Carbon Brush itself */}
               <mesh position={[brushX, 2, brushZ]} rotation={[0, angle, 0]}>
                  <boxGeometry args={[1, 1.8, 4.5 * 0.2]} /> {/* Z scales with length remaining hypothetically, but simplified here to constant visual block */}
                  <meshStandardMaterial color="#020617" roughness={0.9} /> {/* Very dark gray/black */}
               </mesh>
               
               {/* Sparks attached to brush 2 (index 2) as per our data failure scenario */}
               {i === 0 && <ParticleSparks sparkIntensity={sparkIntensity} />}
            </group>
         )
      })}
    </group>
  );
};

export const ExcitationBrushThreeScene = ({ rpm, sparkIntensity, brushWear }: { rpm: number, sparkIntensity: number, brushWear: number[] }) => {
  return (
    <Canvas camera={{ position: [8, 12, 10], fov: 45 }}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />
      {/* Adding a dynamic red light if sparking heavily */}
      {sparkIntensity > 0.5 && <pointLight position={[0, 2, 5]} intensity={sparkIntensity * 5} color="#ef4444" distance={15} />}
      <ExcitationSlipRingModel rpm={rpm} sparkIntensity={sparkIntensity} brushWear={brushWear} />
      <OrbitControls target={[0, 1, 0]} enableDamping minDistance={8} maxDistance={25} enablePan={false} />
    </Canvas>
  );
};
