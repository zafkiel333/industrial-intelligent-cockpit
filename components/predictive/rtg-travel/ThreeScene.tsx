
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RtgAnimatables, RtgViewMode } from './three-types';

interface ThreeSceneProps {
  speed?: number; // 0-1
  gearboxTemp?: number; // 0-1
  vibrationLevel?: number; // 0-1
  viewMode?: RtgViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  speed = 0.5,
  gearboxTemp = 0.3,
  vibrationLevel = 0.1,
  viewMode = 'reality'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040a);
    scene.fog = new THREE.FogExp2(0x02040a, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 8, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 2, 0);

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 2);
    sunLight.position.set(10, 20, 10);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const warningLight = new THREE.PointLight(0xff4400, 0, 20);
    warningLight.position.set(2, 4, 0);
    scene.add(warningLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: RtgAnimatables = {};
    const disposables: any[] = [];

    // --- 1. Bogie Frame (Chassis) ---
    const frameGeo = new THREE.BoxGeometry(8, 1, 3);
    const frameMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        metalness: 0.8, 
        roughness: 0.3 
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 2.5;
    group.add(frame);
    disposables.push(frameGeo, frameMat);

    // --- 2. Wheels (Rubber Tyres) ---
    const wheelGeo = new THREE.CylinderGeometry(1.8, 1.8, 1.2, 32);
    wheelGeo.rotateX(Math.PI / 2);
    const rubberMat = new THREE.MeshStandardMaterial({ 
        color: 0x111111, 
        roughness: 0.9,
        metalness: 0.1
    });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });

    const createWheel = (x: number) => {
        const wGroup = new THREE.Group();
        wGroup.position.set(x, 1.8, 0);
        
        const tyre = new THREE.Mesh(wheelGeo, rubberMat);
        wGroup.add(tyre);

        const rimGeo = new THREE.CylinderGeometry(1, 1, 1.3, 16);
        rimGeo.rotateX(Math.PI / 2);
        const rim = new THREE.Mesh(rimGeo, rimMat);
        wGroup.add(rim);

        // Spokes/Bolts detail
        const boltGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.4, 8);
        boltGeo.rotateX(Math.PI / 2);
        for(let i=0; i<6; i++) {
            const bolt = new THREE.Mesh(boltGeo, rimMat);
            const a = (i/6) * Math.PI * 2;
            bolt.position.set(Math.cos(a)*0.6, Math.sin(a)*0.6, 0);
            wGroup.add(bolt);
        }

        group.add(wGroup);
        return wGroup;
    };

    const wheelF = createWheel(3);
    const wheelR = createWheel(-3);
    // Add to animatables as mesh (casting group) for rotation
    animatables.wheelFront = wheelF as any; 
    animatables.wheelRear = wheelR as any;
    disposables.push(wheelGeo, rubberMat, rimMat);

    // --- 3. Drive System (Motor & Gearbox) ---
    const driveGroup = new THREE.Group();
    driveGroup.position.set(0, 4, 0);
    group.add(driveGroup);

    // Motor
    const motorGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.5, 32);
    motorGeo.rotateZ(Math.PI / 2);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.position.x = -1.5;
    driveGroup.add(motor);
    animatables.motor = motor;

    // Gearbox
    const gearGeo = new THREE.BoxGeometry(2, 2.5, 2);
    const gearMat = new THREE.MeshStandardMaterial({ 
        color: 0xf97316, // Orange typical for gearboxes
        metalness: 0.6,
        roughness: 0.4
    });
    const gearbox = new THREE.Mesh(gearGeo, gearMat);
    gearbox.position.x = 1;
    driveGroup.add(gearbox);
    animatables.gearbox = gearbox;
    disposables.push(motorGeo, motorMat, gearGeo, gearMat);

    // Vertical Shaft (to wheel axle - simplified representation)
    const vShaftGeo = new THREE.CylinderGeometry(0.2, 0.2, 2, 16);
    const vShaft = new THREE.Mesh(vShaftGeo, rimMat);
    vShaft.position.set(1, -1.5, 0);
    driveGroup.add(vShaft);
    disposables.push(vShaftGeo);

    // --- 4. Thermal Overlay (Heatmap) ---
    const heatGeo = new THREE.BoxGeometry(2.1, 2.6, 2.1);
    const heatMat = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        transparent: true, 
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const heatBox = new THREE.Mesh(heatGeo, heatMat);
    heatBox.position.copy(gearbox.position);
    driveGroup.add(heatBox);
    
    // Thermal overlay for motor
    const heatMotorGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.6, 32);
    heatMotorGeo.rotateZ(Math.PI / 2);
    const heatMotor = new THREE.Mesh(heatMotorGeo, heatMat);
    heatMotor.position.copy(motor.position);
    driveGroup.add(heatMotor);

    animatables.thermalOverlay = new THREE.Group();
    animatables.thermalOverlay.add(heatBox);
    animatables.thermalOverlay.add(heatMotor);
    disposables.push(heatGeo, heatMat, heatMotorGeo);

    // --- 5. Vibration Particles ---
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 4;
        pPos[i*3+1] = (Math.random() - 0.5) * 4;
        pPos[i*3+2] = (Math.random() - 0.5) * 4;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0xef4444, 
        size: 0.1, 
        transparent: true, 
        opacity: 0 
    });
    const particles = new THREE.Points(pGeo, pMat);
    driveGroup.add(particles);
    animatables.vibrationParticles = particles;
    disposables.push(pGeo, pMat);

    // --- 6. Ground ---
    const grid = new THREE.GridHelper(50, 50, 0x334155, 0x0f172a);
    grid.position.y = 0;
    scene.add(grid);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Wheel Rotation
      const rotSpeed = speed * 0.2;
      if (animatables.wheelFront) animatables.wheelFront.rotation.z -= rotSpeed;
      if (animatables.wheelRear) animatables.wheelRear.rotation.z -= rotSpeed;

      // Vibration Shake
      if (vibrationLevel > 0.2) {
          const shake = vibrationLevel * 0.05;
          driveGroup.position.x = Math.sin(time * 50) * shake;
          driveGroup.position.y = 4 + Math.cos(time * 45) * shake;
      } else {
          driveGroup.position.set(0, 4, 0);
      }

      // View Mode Logic
      if (viewMode === 'thermal-map') {
          // Heatmap visibility
          const box = animatables.thermalOverlay?.children[0] as THREE.Mesh;
          const motorHeat = animatables.thermalOverlay?.children[1] as THREE.Mesh;
          if (box && motorHeat) {
             (box.material as THREE.MeshBasicMaterial).opacity = gearboxTemp * 0.6 + Math.sin(time * 2) * 0.1;
             (motorHeat.material as THREE.MeshBasicMaterial).opacity = gearboxTemp * 0.4;
          }
          warningLight.intensity = gearboxTemp * 20;
      } else {
          if (animatables.thermalOverlay) {
              animatables.thermalOverlay.children.forEach(c => (c as THREE.Mesh).material.opacity = 0);
          }
          warningLight.intensity = 0;
      }

      if (viewMode === 'vibration-analysis') {
          if (animatables.vibrationParticles) {
              const mat = animatables.vibrationParticles.material as THREE.PointsMaterial;
              mat.opacity = vibrationLevel * 0.8;
              animatables.vibrationParticles.rotation.y += 0.01;
              const positions = animatables.vibrationParticles.geometry.attributes.position.array as Float32Array;
              for(let i=0; i<pCount; i++) {
                  positions[i*3+1] += Math.sin(time * 10 + i) * 0.02 * vibrationLevel;
              }
              animatables.vibrationParticles.geometry.attributes.position.needsUpdate = true;
          }
      } else {
          if (animatables.vibrationParticles) (animatables.vibrationParticles.material as THREE.PointsMaterial).opacity = 0;
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
  }, [speed, gearboxTemp, vibrationLevel, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
