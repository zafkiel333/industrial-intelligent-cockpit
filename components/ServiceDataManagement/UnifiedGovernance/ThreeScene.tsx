
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GovernanceSceneProps, DataDomainNode } from './three-types';

export const UnifiedGovernanceThreeScene: React.FC<GovernanceSceneProps> = ({ 
  activeDomain, onDomainSelect, globalProcessingLoad 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const domains: DataDomainNode[] = [
    { id: 'mining', name: '矿山装备域', color: '#f59e0b', position: [-12, 4, 0], packetRate: 0.8, protocol: 'OPC-UA' },
    { id: 'shipping', name: '航运装备域', color: '#3b82f6', position: [12, 4, 0], packetRate: 0.6, protocol: 'NMEA-0183' },
    { id: 'hydro', name: '水利装备域', color: '#06b6d4', position: [0, -8, 5], packetRate: 0.7, protocol: 'IEC-104' },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020205, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 35);

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
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;
    controls.minDistance = 20;
    controls.maxDistance = 60;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const coreLight = new THREE.PointLight(0xa855f7, 5, 50);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const group = new THREE.Group();
    scene.add(group);

    // --- 1. The Central Governance Core ---
    const coreGroup = new THREE.Group();
    group.add(coreGroup);

    // Inner Nucleus
    const nucleusGeo = new THREE.IcosahedronGeometry(2.5, 1);
    const nucleusMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        emissive: 0xa855f7,
        emissiveIntensity: 0.5,
        wireframe: true 
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    coreGroup.add(nucleus);

    // Middle Shell
    const shellGeo = new THREE.DodecahedronGeometry(3.5, 0);
    const shellMat = new THREE.MeshPhongMaterial({ 
        color: 0x6366f1, 
        transparent: true, 
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    coreGroup.add(shell);

    // Outer Ring System
    const ringGeo = new THREE.TorusGeometry(6, 0.1, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x4c1d95, transparent: true, opacity: 0.5 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    const ring2 = ring1.clone();
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 4;
    
    coreGroup.add(ring1);
    coreGroup.add(ring2);

    // --- 2. Domain Source Nodes ---
    const domainMeshes: THREE.Mesh[] = [];
    const particleSystems: THREE.Points[] = [];

    domains.forEach(d => {
        const dGroup = new THREE.Group();
        dGroup.position.set(...d.position);
        
        // Source Sphere
        const geo = new THREE.SphereGeometry(1.5, 32, 32);
        const mat = new THREE.MeshPhongMaterial({
            color: d.color,
            emissive: d.color,
            emissiveIntensity: d.id === activeDomain ? 0.8 : 0.2,
            wireframe: true
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData = { id: d.id };
        dGroup.add(mesh);
        domainMeshes.push(mesh);

        // Label Ring
        const labelGeo = new THREE.RingGeometry(2, 2.2, 32);
        const labelMat = new THREE.MeshBasicMaterial({ color: d.color, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
        const label = new THREE.Mesh(labelGeo, labelMat);
        label.lookAt(0,0,0);
        dGroup.add(label);

        group.add(dGroup);

        // --- 3. Data Flow Particles (Source -> Core) ---
        const pCount = 300;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        const pOffset = new Float32Array(pCount); // Random offset for timing
        
        // Create a curved path
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(...d.position),
            new THREE.Vector3(d.position[0]/2, d.position[1]/2 + 5, d.position[2]/2), // Control point
            new THREE.Vector3(0, 0, 0)
        );

        for(let i=0; i<pCount; i++) {
            pPos[i*3] = 0; pPos[i*3+1] = 0; pPos[i*3+2] = 0;
            pOffset[i] = Math.random();
        }
        
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ color: d.color, size: 0.15 });
        const particles = new THREE.Points(pGeo, pMat);
        particles.userData = { curve, offsets: pOffset, speed: d.packetRate * 0.5 };
        group.add(particles);
        particleSystems.push(particles);
    });

    // --- 4. Output Stream (Core -> Upwards) ---
    // Represents unified data going to the cloud/applications
    const outCount = 500;
    const outGeo = new THREE.BufferGeometry();
    const outPos = new Float32Array(outCount * 3);
    for(let i=0; i<outCount; i++) {
        const r = 2 * Math.random();
        const theta = Math.random() * Math.PI * 2;
        outPos[i*3] = r * Math.cos(theta);
        outPos[i*3+1] = Math.random() * 20; // Height
        outPos[i*3+2] = r * Math.sin(theta);
    }
    outGeo.setAttribute('position', new THREE.BufferAttribute(outPos, 3));
    const outMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.6 });
    const outParticles = new THREE.Points(outGeo, outMat);
    group.add(outParticles);


    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(domainMeshes);
      if (intersects.length > 0) {
        onDomainSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Core Animation
      nucleus.rotation.y += 0.01 * (1 + globalProcessingLoad);
      nucleus.rotation.z += 0.005;
      shell.rotation.y -= 0.005;
      ring1.rotation.x = Math.PI/2 + Math.sin(time) * 0.1;
      ring2.rotation.y = Math.PI/4 + Math.cos(time) * 0.1;

      // Input Particle Flow
      particleSystems.forEach(ps => {
          const positions = ps.geometry.attributes.position.array as Float32Array;
          const curve = ps.userData.curve;
          const offsets = ps.userData.offsets;
          const speed = ps.userData.speed * (1 + globalProcessingLoad * 0.5);

          for(let i=0; i<positions.length/3; i++) {
              let t = (time * speed + offsets[i]) % 1;
              const point = curve.getPoint(t);
              positions[i*3] = point.x + (Math.random()-0.5)*0.2; // Jitter
              positions[i*3+1] = point.y + (Math.random()-0.5)*0.2;
              positions[i*3+2] = point.z + (Math.random()-0.5)*0.2;
          }
          ps.geometry.attributes.position.needsUpdate = true;
      });

      // Output Particle Flow
      const outP = outParticles.geometry.attributes.position.array as Float32Array;
      for(let i=1; i<outP.length; i+=3) {
          outP[i] += 0.1 * (1+globalProcessingLoad);
          if (outP[i] > 20) outP[i] = 0;
      }
      outParticles.geometry.attributes.position.needsUpdate = true;

      // Domain Pulse
      domainMeshes.forEach(m => {
          if (m.userData.id === activeDomain) {
              m.scale.setScalar(1.2 + Math.sin(time*5)*0.1);
              (m.material as THREE.MeshPhongMaterial).emissiveIntensity = 1;
          } else {
              m.scale.setScalar(1);
              (m.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.2;
          }
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
  }, [activeDomain, globalProcessingLoad]);

  return <div ref={mountRef} className="w-full h-full relative cursor-pointer" />;
};
