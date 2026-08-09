
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ReservoirProps, GateNode } from './three-types';

export const ReservoirDispatchThreeScene: React.FC<ReservoirProps> = ({ 
  waterLevel, gates, onGateSelect, activeGateId, dischargeIntensity 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 35); // Frontal view of the dam

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.04,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controls.minDistance = 15;
    controls.maxDistance = 60;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(20, 50, 20);
    scene.add(sunLight);
    const blueFill = new THREE.PointLight(0x06b6d4, 5, 50);
    blueFill.position.set(0, 10, 10);
    scene.add(blueFill);

    const group = new THREE.Group();
    scene.add(group);

    // --- Dam Structure ---
    // Main Dam Body (Curved)
    const damGeo = new THREE.CylinderGeometry(25, 28, 12, 64, 1, true, Math.PI * 1.2, Math.PI * 0.6);
    const damMat = new THREE.MeshPhongMaterial({ 
        color: 0x334155, 
        side: THREE.DoubleSide,
        flatShading: false
    });
    const dam = new THREE.Mesh(damGeo, damMat);
    dam.position.y = 0;
    dam.rotation.y = Math.PI / 2; // Face forward
    group.add(dam);

    // Top Road
    const roadGeo = new THREE.TorusGeometry(25, 1, 4, 64, Math.PI * 0.6);
    const roadMat = new THREE.MeshBasicMaterial({ color: 0x475569 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = Math.PI / 2;
    road.rotation.z = Math.PI * 1.2;
    road.position.y = 6;
    group.add(road);

    // --- Water ---
    // Upstream Water
    const waterGeo = new THREE.PlaneGeometry(80, 40, 64, 32);
    const waterMat = new THREE.MeshPhongMaterial({ 
        color: 0x0891b2, 
        transparent: true, 
        opacity: 0.8, 
        shininess: 100,
        specular: 0x111111,
        side: THREE.DoubleSide
    });
    const upWater = new THREE.Mesh(waterGeo, waterMat);
    upWater.rotation.x = -Math.PI / 2;
    upWater.position.z = -20;
    upWater.position.y = waterLevel; // Dynamic Level
    group.add(upWater);

    // Downstream Water
    const downWater = upWater.clone();
    downWater.position.z = 25;
    downWater.position.y = -6;
    group.add(downWater);

    // --- Gates & Interactive Elements ---
    const gateMeshes: THREE.Mesh[] = [];
    const dischargeParticles: THREE.Points[] = [];

    // Create 5 gates along the dam curve
    const gateCount = 5;
    const radius = 24.5;
    const startAngle = Math.PI * 1.35;
    const endAngle = Math.PI * 1.65;
    
    // We map props gates to visual gates. If props has fewer/more, we adjust logic or mock.
    // Assuming props.gates has length 5 for this visual.
    
    gates.forEach((gateData, i) => {
        const angle = startAngle + (endAngle - startAngle) * (i / (gateCount - 1));
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const gateGroup = new THREE.Group();
        gateGroup.position.set(x, 3, z);
        gateGroup.lookAt(0, 3, 0); // Face center
        
        // Gate Frame
        const frameGeo = new THREE.BoxGeometry(2, 3, 1);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        gateGroup.add(frame);

        // Gate Leaf (Movable)
        const leafGeo = new THREE.BoxGeometry(1.8, 2.8, 0.2);
        const leafColor = gateData.status === 'error' ? 0xef4444 : (gateData.id === activeGateId ? 0x22d3ee : 0x94a3b8);
        const leafMat = new THREE.MeshStandardMaterial({ color: leafColor });
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        
        // Visualize Opening: Lift the gate
        const maxLift = 2.0;
        const currentLift = (gateData.opening / 100) * maxLift;
        leaf.position.set(0, 0 + currentLift, 0.4); 
        leaf.userData = { id: gateData.id };
        gateGroup.add(leaf);
        gateMeshes.push(leaf);

        // Water Discharge Particles (Flowing out)
        if (gateData.opening > 0) {
            const pCount = Math.floor(gateData.opening * 5);
            const pGeo = new THREE.BufferGeometry();
            const pPos = new Float32Array(pCount * 3);
            const pVel = new Float32Array(pCount * 3); // Velocity for animation
            
            for(let k=0; k<pCount; k++) {
                pPos[k*3] = (Math.random()-0.5) * 1.5; // width
                pPos[k*3+1] = (Math.random()-0.5) * 2; // height start
                pPos[k*3+2] = 0;
                
                pVel[k*3] = (Math.random()-0.5) * 0.2; // spread
                pVel[k*3+1] = -0.1 - Math.random() * 0.2; // fall
                pVel[k*3+2] = 0.5 + Math.random() * 0.5; // forward push
            }
            pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
            const pMat = new THREE.PointsMaterial({ color: 0xcffafe, size: 0.1, transparent: true, opacity: 0.6 });
            const particles = new THREE.Points(pGeo, pMat);
            
            // Align particles with gate
            particles.position.copy(gateGroup.position);
            particles.rotation.copy(gateGroup.rotation);
            particles.userData = { velocities: pVel, originalPos: pPos.slice() };
            
            // Correction: particles need to shoot OUT from the dam center
            // Simple rotation fix: rotate 180 as lookAt points inward
            particles.rotateY(Math.PI);

            group.add(particles);
            dischargeParticles.push(particles);
        }

        group.add(gateGroup);
    });

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(gateMeshes);
      if (intersects.length > 0) {
        onGateSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Animate Upstream Water (Waves)
      const positions = upWater.geometry.attributes.position.array as Float32Array;
      for(let i=0; i<positions.length; i+=3) {
          // Z is up/down in plane geometry rotated X
          positions[i+2] = Math.sin(positions[i]*0.2 + time) * 0.2 + Math.cos(positions[i+1]*0.2 + time) * 0.2;
      }
      upWater.geometry.attributes.position.needsUpdate = true;
      upWater.position.y = waterLevel; // Sync prop

      // Animate Particles (Discharge)
      dischargeParticles.forEach(p => {
          const pos = p.geometry.attributes.position.array as Float32Array;
          const vel = p.userData.velocities;
          const orig = p.userData.originalPos;
          
          for(let i=0; i<pos.length; i+=3) {
              pos[i] += vel[i];
              pos[i+1] += vel[i+1]; // Gravity
              pos[i+2] += vel[i+2] * dischargeIntensity; // Push

              // Reset if too low or far
              if (pos[i+1] < -12 || pos[i+2] > 15) {
                  pos[i] = orig[i];
                  pos[i+1] = orig[i+1];
                  pos[i+2] = orig[i+2];
              }
          }
          p.geometry.attributes.position.needsUpdate = true;
      });

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
      renderer.domElement.removeEventListener('click', handleClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [waterLevel, gates, activeGateId, dischargeIntensity]);

  return <div ref={mountRef} className="w-full h-full relative cursor-pointer" />;
};
