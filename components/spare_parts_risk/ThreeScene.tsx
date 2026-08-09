
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RiskThreeProps, SupplyNode } from './three-types';

export const RiskThreeScene: React.FC<RiskThreeProps> = ({ 
  nodes, 
  routes, 
  selectedRegion, 
  onNodeSelect,
  globeRotation
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Helper to convert Lat/Lon to Vector3
  const latLonToVector3 = (lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // No fog, space look
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 25);

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
    controls.autoRotate = globeRotation;
    controls.autoRotateSpeed = 1.0;
    controls.enablePan = false;

    // --- Scene Objects ---
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. The Earth Sphere (Wireframe/Tech style)
    const earthRadius = 8;
    const earthGeo = new THREE.IcosahedronGeometry(earthRadius, 4); // High detail
    const earthMat = new THREE.MeshPhongMaterial({ 
      color: 0x0f172a, 
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.2,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earth);

    // Inner Core (Solid blocker)
    const coreGeo = new THREE.SphereGeometry(earthRadius - 0.1, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(core);

    // Atmosphere Glow
    const atmoGeo = new THREE.SphereGeometry(earthRadius + 1.5, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({ 
        color: 0x3b82f6, 
        transparent: true, 
        opacity: 0.05,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmosphere);

    // 2. Nodes (Suppliers/Ports)
    const nodeMeshes: THREE.Mesh[] = [];
    const nodeMap = new Map<string, THREE.Vector3>();

    nodes.forEach(node => {
        const pos = latLonToVector3(node.lat, node.lon, earthRadius);
        nodeMap.set(node.id, pos);

        const color = node.riskLevel === 'critical' ? 0xef4444 : (node.riskLevel === 'warning' ? 0xf59e0b : 0x10b981);
        
        // Pin/Marker Geometry
        const pinGroup = new THREE.Group();
        pinGroup.position.copy(pos);
        pinGroup.lookAt(0,0,0); // Orient outwards

        // Stick
        const stickGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        stickGeo.translate(0, 0.5, 0);
        stickGeo.rotateX(Math.PI/2);
        const stickMat = new THREE.MeshBasicMaterial({ color: color });
        const stick = new THREE.Mesh(stickGeo, stickMat);
        pinGroup.add(stick);

        // Head
        const headGeo = node.type === 'supplier' ? new THREE.BoxGeometry(0.5, 0.5, 0.5) : new THREE.SphereGeometry(0.3);
        const headMat = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.5 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.z = 1.2; // Top of stick
        head.userData = { id: node.id };
        pinGroup.add(head);
        
        // Pulse Ring
        if (node.riskLevel !== 'safe') {
            const ringGeo = new THREE.RingGeometry(0.5, 0.6, 16);
            const ringMat = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.z = 0.1; // Just above surface
            pinGroup.add(ring);
            // Animate ring later
            (ring as any).userData = { isPulse: true, speed: Math.random() * 0.05 };
        }

        globeGroup.add(pinGroup);
        nodeMeshes.push(head); // For raycasting
    });

    // 3. Routes (Curves)
    const particles: THREE.Mesh[] = [];

    routes.forEach(route => {
        const startPos = nodeMap.get(route.from);
        const endPos = nodeMap.get(route.to);

        if (startPos && endPos) {
            // Bezier Control Points (Arc out from surface)
            const distance = startPos.distanceTo(endPos);
            const mid = startPos.clone().add(endPos).multiplyScalar(0.5).normalize().multiplyScalar(earthRadius + distance * 0.5);
            
            const curve = new THREE.QuadraticBezierCurve3(startPos, mid, endPos);
            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            
            const color = route.status === 'blocked' ? 0xef4444 : (route.status === 'delayed' ? 0xf59e0b : 0x3b82f6);
            const opacity = route.status === 'active' ? 0.3 : 0.8;

            const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
            const line = new THREE.Line(geometry, material);
            globeGroup.add(line);

            // Flow Particles
            if (route.status === 'active' || route.status === 'delayed') {
                const pGeo = new THREE.SphereGeometry(0.1, 8, 8);
                const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
                const particle = new THREE.Mesh(pGeo, pMat);
                globeGroup.add(particle);
                particles.push(particle);
                (particle as any).userData = { curve, t: Math.random(), speed: route.status === 'delayed' ? 0.001 : 0.005 };
            }
        }
    });


    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(20, 10, 10);
    scene.add(sunLight);
    const backLight = new THREE.PointLight(0x3b82f6, 1, 50);
    backLight.position.set(-15, 0, -20);
    scene.add(backLight);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      
      // Raycast against heads inside pinGroups
      // We need to traverse or list meshes. nodeMeshes has heads.
      const intersects = raycaster.intersectObjects(nodeMeshes, true);
      if (intersects.length > 0) {
        onNodeSelect(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Animate Particles
      particles.forEach((p: any) => {
          p.userData.t += p.userData.speed;
          if (p.userData.t > 1) p.userData.t = 0;
          const pos = p.userData.curve.getPointAt(p.userData.t);
          p.position.copy(pos);
      });

      // Animate Pulse Rings
      globeGroup.children.forEach(child => {
         if (child.children) {
             child.children.forEach((c: any) => {
                 if (c.userData.isPulse) {
                     c.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.5);
                     c.material.opacity = 0.8 - (c.scale.x - 1);
                 }
             });
         }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('click', onClick);
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [nodes, routes, globeRotation]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
