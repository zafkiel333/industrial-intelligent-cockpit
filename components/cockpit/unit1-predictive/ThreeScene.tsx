import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Instances, Instance, Text, Line as DreiLine } from '@react-three/drei';
import * as THREE from 'three';

const PadInstances = ({ padsTemp, globalMin = 30, globalMax = 80 }: { padsTemp: number[], globalMin?: number, globalMax?: number }) => {
  return (
    <group>
      {/* Dynamic 3D Pads based on Temperature */}
      {padsTemp.map((temp, i) => {
        const totalPads = 16;
        const angle = (i / totalPads) * Math.PI * 2;
        const radius = 3;
        
        // Use the globally computed temperature scale for the entire dataset
        const tempRange = Math.max(0.1, globalMax - globalMin);
        
        const normalized = Math.max(0, Math.min(1, (temp - globalMin) / tempRange)); 
        
        const color = new THREE.Color().lerpColors(
          new THREE.Color('#0ea5e9'), // Sky blue for cool
          new THREE.Color('#ef4444'), // Red for hot
          normalized
        );
        
        // Moderate the height exaggeration: enough to see differences, but not extreme
        const baseHeight = 0.5;
        const extrudedHeight = baseHeight + (normalized * 2.5);
        
        // Positions
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        // Rotation points inwards to the center shaft
        
        return (
          <group key={i} position={[x, extrudedHeight / 2 - 0.25, z]} rotation={[0, -angle, 0]}>
            <mesh>
               <boxGeometry args={[1, extrudedHeight, 1.2]} />
               <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} emissive={color} emissiveIntensity={0.3 + (normalized * 0.5)} />
            </mesh>
            
            <Text 
              position={[0, extrudedHeight / 2 + 0.1, 0]} 
              rotation={[-Math.PI / 2, 0, 0]} 
              fontSize={0.25} 
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {i + 1}#
            </Text>
          </group>
        );
      })}
    </group>
  );
};

const RotatingAssembly = ({ padsTemp, isPrediction, globalMin, globalMax }: { padsTemp: number[], isPrediction: boolean, globalMin?: number, globalMax?: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.8; // Rotating shaft
    }
    if (ringRef.current) {
      // Glow ring pulses faster if prediction
      const pulseSpeed = isPrediction ? 5 : 2;
      const scale = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.02;
      ringRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      <group ref={groupRef}>
        {/* Main Shaft (Rotor) */}
        <mesh position={[0, 4, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 8, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Thrust Collar (Mirror finish disc - transparent to see data) */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[4.2, 4.2, 0.4, 64]} />
          <meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.1} transparent opacity={0.15} depthWrite={false} />
        </mesh>
      </group>

      {/* Stationary Thrust Pads Array */}
      <group position={[0, -0.6, 0]}>
         {/* Inner Ring base */}
         <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[2, 4.5, 0.2, 64]} />
            <meshStandardMaterial color="#334155" />
         </mesh>
         <PadInstances padsTemp={padsTemp} globalMin={globalMin} globalMax={globalMax} />
         
         {/* Energy Edge Ring (Visual Sci-Fi effect changes color based on prediction state) */}
         <mesh ref={ringRef} position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
           <torusGeometry args={[4.6, 0.05, 16, 100]} />
           <meshStandardMaterial 
              color={isPrediction ? "#f59e0b" : "#0ea5e9"} 
              emissive={isPrediction ? "#f59e0b" : "#0ea5e9"} 
              emissiveIntensity={1} 
           />
         </mesh>
      </group>
    </group>
  );
};

export const Unit1ThreeScene = ({ padsTemp, isPrediction, globalMin, globalMax }: { padsTemp: number[], isPrediction: boolean, globalMin?: number, globalMax?: number }) => {
  return (
    <div className="w-full h-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] relative">
       {/* Background decorative glow changes in prediction mode */}
       <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[100px] pointer-events-none transition-colors duration-1000 ${isPrediction ? 'bg-amber-500/10' : 'bg-blue-500/10'}`} />
       
      <Canvas camera={{ position: [8, 6, 8], fov: 45 }}>
        <color attach="background" args={['transparent']} />
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 5, 0]} intensity={2} color={isPrediction ? "#f59e0b" : "#0ea5e9"} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <RotatingAssembly padsTemp={padsTemp} isPrediction={isPrediction} globalMin={globalMin} globalMax={globalMax} />
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI/2 - 0.1}/>
        
        {/* Holographic grid base */}
        <gridHelper args={[30, 30, isPrediction ? '#78350f' : '#1e293b', isPrediction ? '#451a03' : '#0f172a']} position={[0, -2, 0]} />
      </Canvas>
      {/* HUD overlay for 3D view mode */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
         <span className="text-[10px] tracking-widest text-slate-500 uppercase">3D 态势演进模型</span>
         {isPrediction && <span className="text-amber-400 text-xs font-bold font-mono uppercase bg-amber-900/30 px-2 rounded-full border border-amber-500/30">预测环境 (PREDICTION SPACE)</span>}
      </div>
    </div>
  );
};
