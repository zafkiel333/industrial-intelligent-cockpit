
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HydroLongTermProps, TimelineEvent } from './three-types';

export const HydroLongTermThreeScene: React.FC<HydroLongTermProps> = ({ 
  timeProgress, healthIndex, onEventSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const events: TimelineEvent[] = [
    { id: 'ev-01', type: 'start', label: '首次并网', timeOffset: 0.1, color: '#10b981' },
    { id: 'ev-02', type: 'maintenance', label: 'A级检修', timeOffset: 0.35, color: '#3b82f6' },
    { id: 'ev-03', type: 'fault', label: '剪断销剪断', timeOffset: 0.55, color: '#ef4444' },
    { id: 'ev-04', type: 'maintenance', label: '转轮更换', timeOffset: 0.8, color: '#8b5cf6' },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(25, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const mainLight = new THREE.PointLight(0x0d9488, 10, 50); // Teal light
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);
    const warmLight = new THREE.PointLight(0xd97706, 5, 50); // Amber light
    warmLight.position.set(-10, -5, -10);
    scene.add(warmLight);

    const group = new THREE.Group();
    scene.add(group);

    // 1. Central Turbine (Abstract)
    const turbineGroup = new THREE.Group();
    group.add(turbineGroup);

    // Runner Hub
    const hubGeo = new THREE.CylinderGeometry(2, 2, 3, 32);
    const hubMat = new THREE.MeshStandardMaterial({ 
        color: 0x334155, metalness: 0.8, roughness: 0.2 
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    turbineGroup.add(hub);

    // Blades
    const bladeGeo = new THREE.BoxGeometry(1.5, 4, 0.2);
    bladeGeo.translate(0, 2, 0); // Pivot at base
    const bladeMat = new THREE.MeshPhysicalMaterial({ 
        color: 0x94a3b8, metalness: 0.9, roughness: 0.1,
        clearcoat: 1.0, clearcoatRoughness: 0.1
    });
    
    for(let i=0; i<9; i++) {
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.rotation.x = Math.PI / 4; // Tilt
        blade.rotation.y = (i / 9) * Math.PI * 2;
        blade.position.y = 0;
        // Offset from center
        blade.position.x = Math.sin((i/9)*Math.PI*2) * 2;
        blade.position.z = Math.cos((i/9)*Math.PI*2) * 2;
        // Correct orientation
        blade.lookAt(0, 2, 0); 
        turbineGroup.add(blade);
    }

    // 2. Time Spiral (Helix)
    const curvePoints = [];
    const radius = 8;
    const heightScale = 15;
    for(let i=0; i<=100; i++) {
        const t = i/100;
        const angle = t * Math.PI * 4; // 2 turns
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (t - 0.5) * heightScale;
        curvePoints.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.2, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({ 
        color: 0x0d9488, transparent: true, opacity: 0.3, wireframe: true 
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    group.add(tube);

    // 3. Event Markers on Spiral
    const eventMeshes: THREE.Mesh[] = [];
    events.forEach(ev => {
        const point = curve.getPoint(ev.timeOffset);
        const geo = new THREE.OctahedronGeometry(0.8);
        const mat = new THREE.MeshBasicMaterial({ color: ev.color, wireframe: true });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(point);
        mesh.userData = { id: ev.id };
        group.add(mesh);
        eventMeshes.push(mesh);

        // Label Line
        const lineGeo = new THREE.BufferGeometry().setFromPoints([point, point.clone().add(new THREE.Vector3(0, 2, 0))]);
        const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: ev.color, transparent: true, opacity: 0.5 }));
        group.add(line);
    });

    // 4. Time Cursor (Ring)
    const cursorGeo = new THREE.TorusGeometry(10, 0.1, 16, 100);
    const cursorMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const cursor = new THREE.Mesh(cursorGeo, cursorMat);
    cursor.rotation.x = Math.PI / 2;
    group.add(cursor);

    // 5. Flow Particles
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount*3; i+=3) {
        pPos[i] = (Math.random()-0.5) * 5;
        pPos[i+1] = (Math.random()-0.5) * 20;
        pPos[i+2] = (Math.random()-0.5) * 5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xccfbf1, size: 0.1, transparent: true, opacity: 0.4 });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(eventMeshes);
      if (intersects.length > 0) {
        onEventSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Turbine Spin
      turbineGroup.rotation.y -= 0.05;

      // Cursor Movement
      const cursorY = (timeProgress - 0.5) * heightScale;
      cursor.position.y = THREE.MathUtils.lerp(cursor.position.y, cursorY, 0.1);
      
      // Highlight active events based on progress
      eventMeshes.forEach(mesh => {
          mesh.rotation.y += 0.02;
          // Scale up if near cursor
          const dist = Math.abs(mesh.position.y - cursor.position.y);
          if (dist < 2) {
              const s = 1 + (2 - dist) * 0.5;
              mesh.scale.set(s,s,s);
          } else {
              mesh.scale.set(1,1,1);
          }
      });

      // Particle Flow
      const pos = particles.geometry.attributes.position.array as Float32Array;
      for(let i=1; i<pos.length; i+=3) {
          pos[i] -= 0.1;
          if(pos[i] < -10) pos[i] = 10;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Health Color Tint
      if (healthIndex < 60) {
          mainLight.color.setHex(0xef4444);
          hubMat.emissive.setHex(0x7f1d1d);
      } else if (healthIndex < 80) {
          mainLight.color.setHex(0xf59e0b);
          hubMat.emissive.setHex(0x78350f);
      } else {
          mainLight.color.setHex(0x0d9488);
          hubMat.emissive.setHex(0x000000);
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
  }, [timeProgress, healthIndex]);

  return <div ref={mountRef} className="w-full h-full relative cursor-pointer" />;
};
