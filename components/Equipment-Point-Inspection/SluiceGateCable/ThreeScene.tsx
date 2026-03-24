import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SluiceGateCableProps } from './three-types';

export const ThreeScene: React.FC<SluiceGateCableProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1e293b'); // slate-800
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(20, 10, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Cable Structure
    const cableGroup = new THREE.Group();
    
    // Main Cable (Cylinder)
    const cableGeo = new THREE.CylinderGeometry(1, 1, 40, 32);
    const cableMat = new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, // slate-400
      metalness: 0.8,
      roughness: 0.3,
      wireframe: false
    });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.rotation.z = Math.PI / 4; // Angled cable
    cableGroup.add(cable);

    // Cable Strands (visual detail)
    const strandGeo = new THREE.CylinderGeometry(0.1, 0.1, 40, 8);
    const strandMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
    for (let i = 0; i < 6; i++) {
      const strand = new THREE.Mesh(strandGeo, strandMat);
      const angle = (i / 6) * Math.PI * 2;
      strand.position.x = Math.cos(angle) * 0.9;
      strand.position.z = Math.sin(angle) * 0.9;
      cable.add(strand); // Add to main cable so it rotates with it
    }

    // Inspection Robot (Climbing the cable)
    const robotGroup = new THREE.Group();
    
    // Robot Body
    const robotBodyGeo = new THREE.BoxGeometry(3, 4, 3);
    const robotBodyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b }); // amber-500
    const robotBody = new THREE.Mesh(robotBodyGeo, robotBodyMat);
    robotGroup.add(robotBody);

    // Robot Clamps
    const clampGeo = new THREE.BoxGeometry(4, 0.5, 1);
    const clampMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const topClamp = new THREE.Mesh(clampGeo, clampMat);
    topClamp.position.y = 1.5;
    robotGroup.add(topClamp);
    const bottomClamp = new THREE.Mesh(clampGeo, clampMat);
    bottomClamp.position.y = -1.5;
    robotGroup.add(bottomClamp);

    // Scanner Ring
    const ringGeo = new THREE.TorusGeometry(2.5, 0.2, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 }); // sky-400
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    robotGroup.add(ring);

    // Align robot with cable
    robotGroup.rotation.z = Math.PI / 4;
    scene.add(robotGroup);
    scene.add(cableGroup);

    // Wear/Damage visualization (Red spots on cable)
    const damageGeo = new THREE.CylinderGeometry(1.05, 1.05, 2, 16);
    const damageMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0 }); // red-500
    const damageSpot = new THREE.Mesh(damageGeo, damageMat);
    damageSpot.position.y = 5;
    cable.add(damageSpot);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { tension, wearLevel, vibration, isAlert } = propsRef.current;

      // Robot movement along the cable
      const robotPos = Math.sin(time * 0.5) * 15;
      robotGroup.position.x = -robotPos * Math.sin(Math.PI / 4);
      robotGroup.position.y = robotPos * Math.cos(Math.PI / 4);

      // Scanner ring animation
      ring.position.y = Math.sin(time * 5) * 1.5;
      ring.scale.setScalar(1 + Math.sin(time * 10) * 0.1);

      // Vibration effect on cable
      const vibAmount = (vibration / 100) * 0.5;
      cable.position.x = Math.sin(time * 20) * vibAmount;
      cable.position.z = Math.cos(time * 25) * vibAmount;

      // Wear visualization
      damageMat.opacity = wearLevel / 100;

      // Alert visualization
      if (isAlert) {
        ringMat.color.setHex(0xef4444); // red-500
        robotBodyMat.color.setHex(0xb45309); // amber-700
      } else {
        ringMat.color.setHex(0x38bdf8); // sky-400
        robotBodyMat.color.setHex(0xf59e0b); // amber-500
      }

      // Tension visualization (cable color slightly changes)
      const tensionRatio = tension / 100;
      cableMat.color.setHSL(0.6, 0.2, 0.5 - (tensionRatio * 0.2));

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
