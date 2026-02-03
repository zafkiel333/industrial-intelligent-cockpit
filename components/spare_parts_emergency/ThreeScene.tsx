
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EmergencyThreeProps } from './three-types';

export const EmergencyThreeScene: React.FC<EmergencyThreeProps> = ({ 
  nodes, 
  routes, 
  activeIncidentId, 
  onNodeSelect,
  radarScanning
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0505, 0.04); // Reddish fog for emergency feel

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 15, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // --- Scene Objects ---
    const mapGroup = new THREE.Group();
    scene.add(mapGroup);

    // 1. Terrain Grid (Tactical Hex Grid)
    const gridHelper = new THREE.GridHelper(50, 50, 0xef4444, 0x1e1b4b);
    gridHelper.position.y = -0.5;
    mapGroup.add(gridHelper);

    // 2. Nodes (Warehouses & Incidents)
    const nodeMeshes: THREE.Mesh[] = [];
    const nodePosMap = new Map<string, THREE.Vector3>();

    nodes.forEach(node => {
        const pos = new THREE.Vector3(...node.position);
        nodePosMap.set(node.id, pos);

        let geo, mat;
        if (node.type === 'incident') {
            geo = new THREE.ConeGeometry(0.8, 2, 4);
            mat = new THREE.MeshPhongMaterial({ 
                color: 0xff0000, 
                emissive: 0xff0000, 
                emissiveIntensity: 1.0,
                transparent: true,
                opacity: 0.9
            });
            // Ripple effect ring
            const ringGeo = new THREE.RingGeometry(1, 1.2, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, transparent: true });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.copy(pos);
            ring.position.y = 0.1;
            mapGroup.add(ring);
            (ring as any).userData = { isRipple: true, phase: Math.random() };

        } else {
            // Warehouse
            geo = new THREE.BoxGeometry(1.5, 1, 1.5);
            mat = new THREE.MeshStandardMaterial({ 
                color: 0x0ea5e9, 
                emissive: 0x0ea5e9, 
                emissiveIntensity: 0.2 
            });
        }

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        if (node.type === 'incident') {
            mesh.rotation.x = Math.PI; // Point down
            mesh.position.y += 2;
        } else {
            mesh.position.y += 0.5;
        }
        
        mesh.userData = { id: node.id };
        mapGroup.add(mesh);
        nodeMeshes.push(mesh);
    });

    // 3. Transport Units (Drones/Trucks)
    const transportGroup = new THREE.Group();
    mapGroup.add(transportGroup);

    routes.forEach(route => {
        const start = nodePosMap.get(route.from);
        const end = nodePosMap.get(route.to);
        
        if (start && end) {
            // Trajectory Line
            const curve = new THREE.QuadraticBezierCurve3(
                start,
                start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, route.mode === 'drone' ? 5 : 0, 0)),
                end
            );
            const pts = curve.getPoints(50);
            const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const lineMat = new THREE.LineBasicMaterial({ 
                color: route.mode === 'drone' ? 0xf59e0b : 0x0ea5e9, 
                transparent: true, 
                opacity: 0.3 
            });
            const line = new THREE.Line(lineGeo, lineMat);
            transportGroup.add(line);

            // Vehicle
            const vehicleGeo = route.mode === 'drone' ? new THREE.OctahedronGeometry(0.3) : new THREE.BoxGeometry(0.4, 0.3, 0.6);
            const vehicleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const vehicle = new THREE.Mesh(vehicleGeo, vehicleMat);
            
            // Position vehicle along curve
            const pos = curve.getPointAt(route.progress);
            vehicle.position.copy(pos);
            transportGroup.add(vehicle);
        }
    });

    // Radar Scan Effect
    const radarGeo = new THREE.PlaneGeometry(30, 30);
    const radarMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.05,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const radar = new THREE.Mesh(radarGeo, radarMat);
    radar.rotation.x = Math.PI / 2;
    radar.position.y = 0.2;
    // We will use texture or shader for a real scan, but for now rotating plane
    if (radarScanning) {
        // Create a simple scan line group
        const scanLineGeo = new THREE.BoxGeometry(30, 0.1, 0.5);
        const scanLineMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 });
        const scanLine = new THREE.Mesh(scanLineGeo, scanLineMat);
        radar.add(scanLine);
        mapGroup.add(radar);
    }

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);
    const spot = new THREE.SpotLight(0xff0000, 5, 50, Math.PI/4, 0.5);
    spot.position.set(0, 20, 0);
    scene.add(spot);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodeMeshes);
        if (intersects.length > 0) onNodeSelect(intersects[0].object.userData.id);
    };
    mountRef.current.addEventListener('click', onClick);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.02;

      if (radarScanning) {
        radar.rotation.z -= 0.05;
      }

      // Ripple animation
      mapGroup.children.forEach(child => {
          if ((child as any).userData.isRipple) {
              const phase = (child as any).userData.phase;
              const s = 1 + Math.sin(time * 3 + phase) * 0.5;
              child.scale.setScalar(s);
              (child as THREE.Mesh).material.opacity = 1 - (s - 0.5);
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
  }, [nodes, routes, activeIncidentId, radarScanning]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};
