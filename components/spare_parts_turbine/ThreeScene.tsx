
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TurbineThreeProps } from './three-types';

export const TurbineThreeScene: React.FC<TurbineThreeProps> = ({ 
  parts, 
  activePartId, 
  rpm,
  flowRate,
  onPartSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020817, 0.03); // Deep blue fog

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(10, 8, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;

    // --- Turbine Assembly Group ---
    const turbineGroup = new THREE.Group();
    scene.add(turbineGroup);

    // 1. Spiral Case (Volute) - Simplified as Torus segments
    const casingPart = parts.find(p => p.type === 'casing');
    const casingColor = casingPart?.id === activePartId ? 0xffffff : 0x1e3a8a;
    const casingGeo = new THREE.TorusGeometry(5, 1.5, 16, 50, Math.PI * 1.8);
    const casingMat = new THREE.MeshPhongMaterial({ 
        color: casingColor, 
        transparent: true, 
        opacity: 0.3, 
        wireframe: true 
    });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    casing.rotation.x = Math.PI / 2;
    casing.userData = { id: casingPart?.id };
    turbineGroup.add(casing);

    // 2. Stay Vanes / Guide Vanes Ring
    const vanesPart = parts.find(p => p.type === 'guide_vane');
    const vanesGroup = new THREE.Group();
    const vaneCount = 16;
    for(let i=0; i<vaneCount; i++) {
        const angle = (i / vaneCount) * Math.PI * 2;
        const vaneGeo = new THREE.BoxGeometry(0.5, 2, 0.1);
        const vaneMat = new THREE.MeshStandardMaterial({ 
            color: vanesPart?.id === activePartId ? 0x22d3ee : 0x0ea5e9,
            emissive: 0x0ea5e9,
            emissiveIntensity: 0.2
        });
        const vane = new THREE.Mesh(vaneGeo, vaneMat);
        vane.position.set(Math.cos(angle) * 3.5, 0, Math.sin(angle) * 3.5);
        vane.rotation.y = -angle + Math.PI/4; // Angled for flow
        vane.userData = { id: vanesPart?.id };
        vanesGroup.add(vane);
    }
    turbineGroup.add(vanesGroup);

    // 3. Runner (The moving part)
    const runnerPart = parts.find(p => p.type === 'runner');
    const runnerGroup = new THREE.Group();
    
    // Hub
    const hubGeo = new THREE.CylinderGeometry(1, 1.5, 1.5, 16);
    const hubMat = new THREE.MeshStandardMaterial({ 
        color: 0x64748b, 
        roughness: 0.4,
        metalness: 0.8
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    runnerGroup.add(hub);

    // Blades
    const bladeCount = 9;
    for(let i=0; i<bladeCount; i++) {
        const angle = (i / bladeCount) * Math.PI * 2;
        // Curved blade approximation
        const bladeGeo = new THREE.TorusKnotGeometry(0.8, 0.2, 32, 4, 2, 3);
        const bladeMat = new THREE.MeshStandardMaterial({ 
            color: runnerPart?.id === activePartId ? 0xfcd34d : 0x94a3b8, // Gold if active
            metalness: 0.7,
            roughness: 0.2,
            emissive: runnerPart?.id === activePartId ? 0xfcd34d : 0x000000,
            emissiveIntensity: 0.2
        });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        // Position and rotate to look like turbine blades
        blade.position.set(Math.cos(angle) * 1.8, 0, Math.sin(angle) * 1.8);
        blade.rotation.y = -angle;
        blade.rotation.x = Math.PI / 2;
        blade.scale.set(1, 0.2, 1.5);
        blade.userData = { id: runnerPart?.id };
        runnerGroup.add(blade);
    }
    turbineGroup.add(runnerGroup);

    // 4. Main Shaft
    const shaftPart = parts.find(p => p.type === 'shaft');
    const shaftGeo = new THREE.CylinderGeometry(0.6, 0.6, 8, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ 
        color: shaftPart?.id === activePartId ? 0xffffff : 0x475569,
        metalness: 0.5,
        roughness: 0.5
    });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 4;
    shaft.userData = { id: shaftPart?.id };
    turbineGroup.add(shaft);

    // 5. Water Particles (Flow Visualization)
    const particleCount = 400;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pSpeeds = new Float32Array(particleCount);
    
    for(let i=0; i<particleCount; i++) {
        // Spiral distribution
        const angle = Math.random() * Math.PI * 2;
        const r = 3 + Math.random() * 2;
        pPos[i*3] = Math.cos(angle) * r;
        pPos[i*3+1] = 2 - Math.random() * 4; // Height
        pPos[i*3+2] = Math.sin(angle) * r;
        pSpeeds[i] = 1 + Math.random();
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ 
        color: 0x06b6d4, 
        size: 0.08, 
        transparent: true, 
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const blueLight = new THREE.PointLight(0x0ea5e9, 5, 20);
    blueLight.position.set(5, 5, 5);
    scene.add(blueLight);
    const cyanLight = new THREE.PointLight(0x22d3ee, 5, 20);
    cyanLight.position.set(-5, 2, -5);
    scene.add(cyanLight);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const clickableObjects = [casing, ...vanesGroup.children, ...runnerGroup.children, shaft];

    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickableObjects);
        if (intersects.length > 0) {
            onPartSelect(intersects[0].object.userData.id);
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate Runner & Shaft based on RPM
      const rotationSpeed = (rpm / 60) * 0.1; // Scale down for visual
      runnerGroup.rotation.y -= rotationSpeed;
      shaft.rotation.y -= rotationSpeed;

      // Animate Water Particles (Spiral down)
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<particleCount; i++) {
          const i3 = i*3;
          let x = positions[i3];
          let y = positions[i3+1];
          let z = positions[i3+2];
          
          // Move down
          y -= 0.05 * flowRate;
          
          // Spiral inward
          const angle = Math.atan2(z, x) - (0.05 * flowRate);
          const r = Math.sqrt(x*x + z*z);
          let newR = r;
          if (r > 1.5) newR -= 0.01 * flowRate; // Converge to runner

          positions[i3] = Math.cos(angle) * newR;
          positions[i3+1] = y;
          positions[i3+2] = Math.sin(angle) * newR;

          // Reset if too low
          if (y < -3) {
              positions[i3+1] = 2 + Math.random();
              const startAngle = Math.random() * Math.PI * 2;
              const startR = 4 + Math.random();
              positions[i3] = Math.cos(startAngle) * startR;
              positions[i3+2] = Math.sin(startAngle) * startR;
          }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
          mountRef.current.removeEventListener('click', onClick);
          mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [parts, activePartId, rpm, flowRate, onPartSelect]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
