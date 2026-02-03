import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RouteThreeProps, CheckpointNode } from './three-types';

export const RouteThreeScene: React.FC<RouteThreeProps> = ({ 
  checkpoints, 
  activeRouteId, 
  isSimulating,
  onNodeClick 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const droneRef = useRef<THREE.Mesh>(null);
  const pathRef = useRef<THREE.CatmullRomCurve3 | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.02);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 15, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // --- Scene Objects ---

    // 1. Terrain Grid (Tactical Map Style)
    const gridHelper = new THREE.GridHelper(40, 40, 0x1e293b, 0x0f172a);
    scene.add(gridHelper);

    // 2. Factory Floor Plan (Abstract)
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshBasicMaterial({ 
      color: 0x0ea5e9, 
      transparent: true, 
      opacity: 0.05, 
      side: THREE.DoubleSide 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);

    // 3. Obstacles (Simplified Factory Machines)
    const obstacleGroup = new THREE.Group();
    const boxGeo = new THREE.BoxGeometry(2, 1.5, 2);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x334155, wireframe: false });
    const edges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x475569 });

    // Place some random "machines" to navigate around
    const obstaclePos = [[-5, 2], [5, -5], [8, 8], [-8, -8]];
    obstaclePos.forEach(pos => {
      const mesh = new THREE.Mesh(boxGeo, boxMat);
      mesh.position.set(pos[0], 0.75, pos[1]);
      obstacleGroup.add(mesh);
      const wire = new THREE.LineSegments(edges, lineMat);
      wire.position.copy(mesh.position);
      obstacleGroup.add(wire);
    });
    scene.add(obstacleGroup);

    // 4. Checkpoints & Route
    const pointsGroup = new THREE.Group();
    scene.add(pointsGroup);
    
    const clickObjects: THREE.Object3D[] = [];

    // Create Path
    const vectors = checkpoints.map(cp => new THREE.Vector3(...cp.position));
    if (vectors.length > 1) {
       // Create a closed loop path logic if end connects to start, but here open path
       const curve = new THREE.CatmullRomCurve3(vectors, false, 'catmullrom', 0.5);
       pathRef.current = curve;
       
       const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.1, 8, false);
       const tubeMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.6, wireframe: true });
       const pathMesh = new THREE.Mesh(tubeGeo, tubeMat);
       scene.add(pathMesh);
       
       // Solid core line
       const linePoints = curve.getPoints(100);
       const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
       const lineMaterial = new THREE.LineBasicMaterial({ color: 0x34d399 });
       const line = new THREE.Line(lineGeometry, lineMaterial);
       line.position.y = 0.1;
       scene.add(line);
    }

    // Create Markers
    checkpoints.forEach(cp => {
       const color = cp.type === 'start' ? 0x3b82f6 : (cp.type === 'end' ? 0xef4444 : (cp.type === 'critical' ? 0xf59e0b : 0x10b981));
       const geo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
       const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
       const marker = new THREE.Mesh(geo, mat);
       marker.position.set(cp.position[0], cp.position[1], cp.position[2]);
       marker.userData = { id: cp.id };
       pointsGroup.add(marker);
       clickObjects.push(marker);

       // Hovering Label/Icon placeholder (Cone)
       const iconGeo = new THREE.ConeGeometry(0.2, 0.5, 4);
       const iconMat = new THREE.MeshBasicMaterial({ color, wireframe: true });
       const icon = new THREE.Mesh(iconGeo, iconMat);
       icon.position.set(0, 1, 0);
       icon.rotation.x = Math.PI;
       marker.add(icon);

       // Floating animation
       (icon as any).userData = { offset: Math.random() };
    });

    // 5. Drone / Inspector Marker
    const droneGeo = new THREE.OctahedronGeometry(0.4, 0);
    const droneMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const drone = new THREE.Mesh(droneGeo, droneMat);
    drone.visible = false;
    scene.add(drone);
    // @ts-ignore
    droneRef.current = drone;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickObjects);
      if (intersects.length > 0) {
        onNodeClick(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    // Animation Loop
    let progress = 0;
    const animate = () => {
      requestAnimationFrame(animate);

      // Animate Markers
      pointsGroup.children.forEach(marker => {
         const icon = marker.children[0];
         if (icon) {
             const offset = (icon as any).userData.offset || 0;
             icon.position.y = 1 + Math.sin(Date.now() * 0.003 + offset) * 0.2;
             icon.rotation.y += 0.02;
         }
      });

      // Simulate Drone Movement
      if (isSimulating && pathRef.current && droneRef.current) {
         droneRef.current.visible = true;
         progress += 0.002;
         if (progress > 1) progress = 0;
         
         const point = pathRef.current.getPointAt(progress);
         droneRef.current.position.copy(point);
         droneRef.current.position.y += 1; // Fly above line
         
         // Rotate drone
         droneRef.current.rotation.x += 0.05;
         droneRef.current.rotation.y += 0.05;
      } else if (droneRef.current) {
         droneRef.current.visible = false;
         progress = 0;
      }

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
  }, [checkpoints, activeRouteId, isSimulating, onNodeClick]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};