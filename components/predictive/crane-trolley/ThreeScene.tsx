
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TrolleyAnimatables, TrolleyViewMode } from './three-types';

interface ThreeSceneProps {
  wearLevel?: number; // 0-1
  vibrationLevel?: number; // 0-1
  viewMode?: TrolleyViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  wearLevel = 0.2, 
  vibrationLevel = 0.1,
  viewMode = 'mechanical' 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040a);
    scene.fog = new THREE.FogExp2(0x02040a, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(5, 20, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const orangeLight = new THREE.PointLight(0xf97316, 20, 40);
    orangeLight.position.set(-5, 2, 0);
    scene.add(orangeLight);

    const blueLight = new THREE.PointLight(0x0ea5e9, 15, 40);
    blueLight.position.set(5, 2, 0);
    scene.add(blueLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: TrolleyAnimatables = { wheels: [] };
    const disposables: any[] = [];

    // --- 1. Rails (Track) ---
    const railGeo = new THREE.BoxGeometry(30, 0.5, 0.5);
    const railMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, 
        metalness: 0.8, 
        roughness: 0.3 
    });
    
    const railL = new THREE.Mesh(railGeo, railMat);
    railL.position.set(0, 0, 2);
    group.add(railL);
    animatables.railLeft = railL;

    const railR = railL.clone();
    railR.position.set(0, 0, -2);
    group.add(railR);
    animatables.railRight = railR;
    disposables.push(railGeo, railMat);

    // Rail Wear Overlay (Visualized as red patches on rails)
    if (viewMode === 'wear-profile') {
        const wearGeo = new THREE.BoxGeometry(5, 0.52, 0.52);
        const wearMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.6 });
        const w1 = new THREE.Mesh(wearGeo, wearMat);
        w1.position.set(5, 0, 2);
        group.add(w1);
        const w2 = new THREE.Mesh(wearGeo, wearMat);
        w2.position.set(-5, 0, -2);
        group.add(w2);
        disposables.push(wearGeo, wearMat);
    }

    // --- 2. Trolley Assembly ---
    const trolleyGroup = new THREE.Group();
    group.add(trolleyGroup);
    animatables.trolleyGroup = trolleyGroup;

    // Frame
    const frameGeo = new THREE.BoxGeometry(4, 1, 5);
    const frameMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        metalness: 0.7, 
        roughness: 0.4,
        emissive: viewMode === 'stress-field' ? 0x1e1b4b : 0x000000
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 1;
    trolleyGroup.add(frame);
    disposables.push(frameGeo, frameMat);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 32);
    wheelGeo.rotateX(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const wheelPos = [
        { x: -1.5, z: 2 }, { x: 1.5, z: 2 },
        { x: -1.5, z: -2 }, { x: 1.5, z: -2 }
    ];

    wheelPos.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(pos.x, 0.5, pos.z);
        trolleyGroup.add(wheel);
        animatables.wheels?.push(wheel);
    });
    disposables.push(wheelGeo, wheelMat);

    // Hoist Drum
    const drumGeo = new THREE.CylinderGeometry(0.8, 0.8, 3, 32);
    drumGeo.rotateZ(Math.PI / 2);
    const drumMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
    const drum = new THREE.Mesh(drumGeo, drumMat);
    drum.position.set(0, 1.8, 0);
    trolleyGroup.add(drum);
    animatables.hoistDrum = drum;
    disposables.push(drumGeo, drumMat);

    // --- 3. Ropes & Spreader ---
    const spreaderGeo = new THREE.BoxGeometry(2, 0.5, 4);
    const spreaderMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
    const spreader = new THREE.Mesh(spreaderGeo, spreaderMat);
    group.add(spreader); // Add to group, not trolley, to simulate cable
    animatables.spreader = spreader;
    disposables.push(spreaderGeo, spreaderMat);

    // Ropes (Dynamic Lines)
    const ropeGeo = new THREE.BufferGeometry();
    // 4 points (2 on drum, 2 on spreader)
    const ropePos = new Float32Array(12); 
    ropeGeo.setAttribute('position', new THREE.BufferAttribute(ropePos, 3));
    const ropeMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    const ropes = new THREE.LineSegments(ropeGeo, ropeMat);
    group.add(ropes); // Add to main group to connect trolley and spreader
    animatables.ropes = ropes as any; // Type casting for simplicity
    disposables.push(ropeGeo, ropeMat);


    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Trolley Movement (Back and Forth)
      if (animatables.trolleyGroup) {
          animatables.trolleyGroup.position.x = Math.sin(time * 0.5) * 10;
          
          // Vibration Effect
          const vib = vibrationLevel * 0.1;
          animatables.trolleyGroup.position.y = Math.sin(time * 50) * vib;
      }

      // Wheels Rotation
      animatables.wheels?.forEach(wheel => {
          wheel.rotation.z = -animatables.trolleyGroup!.position.x / 0.5; // Approx rolling
      });

      // Hoist Drum Rotation
      if (animatables.hoistDrum) {
          animatables.hoistDrum.rotation.x = time;
      }

      // Spreader Vertical Movement
      if (animatables.spreader && animatables.trolleyGroup) {
          animatables.spreader.position.x = animatables.trolleyGroup.position.x;
          animatables.spreader.position.y = -4 + Math.sin(time * 0.8) * 2;

          // Update Ropes
          if (animatables.ropes) {
              const pos = (animatables.ropes as any).geometry.attributes.position.array;
              const trolleyX = animatables.trolleyGroup.position.x;
              const spreaderY = animatables.spreader.position.y;
              
              // Line 1
              pos[0] = trolleyX; pos[1] = 1.8; pos[2] = 1;
              pos[3] = trolleyX; pos[4] = spreaderY; pos[5] = 1.5;
              // Line 2
              pos[6] = trolleyX; pos[7] = 1.8; pos[8] = -1;
              pos[9] = trolleyX; pos[10] = spreaderY; pos[11] = -1.5;
              
              (animatables.ropes as any).geometry.attributes.position.needsUpdate = true;
          }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d?.dispose());
      renderer.dispose();
    };
  }, [wearLevel, vibrationLevel, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
