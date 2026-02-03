
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PortSceneProps, PortEquipmentNode } from './three-types';

export const PortLoadingThreeScene: React.FC<PortSceneProps> = ({ activeEquipmentId, onSelect, efficiency }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(-25, 20, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    // Industrial Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffd700, 1.5); // Sunlight
    dirLight.position.set(-20, 50, 20);
    scene.add(dirLight);
    const floodLight = new THREE.PointLight(0x3b82f6, 5, 50); // Yard light
    floodLight.position.set(0, 15, 0);
    scene.add(floodLight);

    // Ground (Concrete)
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        roughness: 0.8, 
        metalness: 0.2 
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Grid markings
    const grid = new THREE.GridHelper(100, 50, 0x334155, 0x334155);
    grid.position.y = 0.01;
    scene.add(grid);

    // AGV Path (Visual)
    const pathGeo = new THREE.RingGeometry(14, 16, 64);
    const pathMat = new THREE.MeshBasicMaterial({ color: 0x334155, side: THREE.DoubleSide });
    const pathMesh = new THREE.Mesh(pathGeo, pathMat);
    pathMesh.rotation.x = -Math.PI / 2;
    pathMesh.position.y = 0.02;
    scene.add(pathMesh);

    const agvGroup = new THREE.Group();
    scene.add(agvGroup);

    // STS Crane (Static Base)
    const craneGroup = new THREE.Group();
    craneGroup.position.set(-20, 0, 0);
    scene.add(craneGroup);

    // Crane Legs
    const legGeo = new THREE.BoxGeometry(2, 20, 2);
    const craneMat = new THREE.MeshPhongMaterial({ color: 0xfacc15 }); // Safety Yellow
    const leg1 = new THREE.Mesh(legGeo, craneMat); leg1.position.set(0, 10, 5);
    const leg2 = new THREE.Mesh(legGeo, craneMat); leg2.position.set(0, 10, -5);
    const leg3 = new THREE.Mesh(legGeo, craneMat); leg3.position.set(10, 10, 5);
    const leg4 = new THREE.Mesh(legGeo, craneMat); leg4.position.set(10, 10, -5);
    craneGroup.add(leg1, leg2, leg3, leg4);
    // Crane Boom
    const boomGeo = new THREE.BoxGeometry(30, 2, 4);
    const boom = new THREE.Mesh(boomGeo, craneMat);
    boom.position.set(-5, 21, 0);
    craneGroup.add(boom);

    // Container Stacks
    const containerGeo = new THREE.BoxGeometry(2.5, 2.5, 6);
    const colors = [0xef4444, 0x3b82f6, 0x10b981, 0xf97316];
    
    for(let x=0; x<3; x++) {
        for(let z=0; z<4; z++) {
            for(let y=0; y<Math.floor(Math.random() * 4) + 1; y++) {
                const mat = new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
                const box = new THREE.Mesh(containerGeo, mat);
                box.position.set(10 + x * 4, 1.25 + y * 2.5, -10 + z * 5);
                scene.add(box);
            }
        }
    }

    // Create AGVs
    const agvs: THREE.Mesh[] = [];
    const agvCount = 4;
    const agvGeo = new THREE.BoxGeometry(3, 1, 5);
    const agvMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    
    for(let i=0; i<agvCount; i++) {
        const agv = new THREE.Mesh(agvGeo, agvMat);
        // Add container on top of some AGVs
        if (i % 2 === 0) {
            const c = new THREE.Mesh(containerGeo, new THREE.MeshStandardMaterial({ color: colors[i] }));
            c.position.y = 1.75;
            agv.add(c);
        }
        
        agv.userData = { angle: (i / agvCount) * Math.PI * 2, id: `AGV-0${i+1}` };
        agvs.push(agv);
        agvGroup.add(agv);
    }

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        
        // Raycast against AGVs and Crane
        const intersects = raycaster.intersectObjects([...agvs, ...craneGroup.children]);
        if (intersects.length > 0) {
            // Simple logic: if hit crane part, select crane; if hit AGV, select AGV
            const hit = intersects[0].object;
            if (agvs.includes(hit as THREE.Mesh) || hit.parent === agvGroup) {
               const agvHit = agvs.find(a => a === hit || a.children.includes(hit as THREE.Mesh));
               if(agvHit) onSelect?.(agvHit.userData.id);
            } else {
               onSelect?.('STS-01');
            }
        }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Animate AGVs in circle
      agvs.forEach(agv => {
          agv.userData.angle += 0.005 * efficiency;
          const r = 15;
          agv.position.x = Math.cos(agv.userData.angle) * r;
          agv.position.z = Math.sin(agv.userData.angle) * r;
          agv.lookAt(
              Math.cos(agv.userData.angle + 0.1) * r, 
              0.5, 
              Math.sin(agv.userData.angle + 0.1) * r
          );
          
          if (agv.userData.id === activeEquipmentId) {
              (agv.material as THREE.MeshLambertMaterial).emissive.setHex(0x3b82f6);
          } else {
              (agv.material as THREE.MeshLambertMaterial).emissive.setHex(0x000000);
          }
      });

      // Highlight Crane if selected
      if (activeEquipmentId === 'STS-01') {
          // Pulse effect via ambient light or changing material manually
          // Simplified: We assume STS is selected if no AGV is selected for this demo visual
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
      renderer.domElement.removeEventListener('click', handleClick);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [activeEquipmentId, efficiency]);

  return <div ref={mountRef} className="w-full h-full relative cursor-crosshair" />;
};
