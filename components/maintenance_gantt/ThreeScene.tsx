import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GanttThreeProps, GanttTaskNode } from './three-types';

export const GanttThreeScene: React.FC<GanttThreeProps> = ({ 
  tasks, 
  progress,
  onTaskSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.02); // Deep space fog

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    // Position camera to look down the "Time Tunnel"
    camera.position.set(-20, 15, 20); 

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;

    // --- Scene Construction ---

    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);

    const linesGroup = new THREE.Group();
    scene.add(linesGroup);

    // Time Axis (Z-Axis)
    const axisGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 120)
    ]);
    const axisMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.3 });
    const axisLine = new THREE.Line(axisGeo, axisMat);
    scene.add(axisLine);

    // Time Plane (Scanning Laser)
    const planeGeo = new THREE.PlaneGeometry(30, 30);
    const planeMat = new THREE.MeshBasicMaterial({ 
        color: 0x0ea5e9, 
        transparent: true, 
        opacity: 0.1, 
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const timePlane = new THREE.Mesh(planeGeo, planeMat);
    scene.add(timePlane);

    // Store node positions for linking
    const nodePositions: Record<string, THREE.Vector3> = {};
    const taskMeshes: THREE.Mesh[] = [];

    tasks.forEach(task => {
        // Map time to Z axis, Lane to X axis
        const z = task.startTime + (task.duration / 2); 
        const x = (task.lane - 2) * 5; // Spread lanes
        const y = task.critical ? 2 : 0; // Lift critical tasks

        const pos = new THREE.Vector3(x, y, z);
        nodePositions[task.id] = pos;

        // Task Node Geometry (Capsule representing duration)
        // Note: Three.js CapsuleGeometry might need newer version or specific import, using Cylinder for safety
        const geo = new THREE.CylinderGeometry(0.8, 0.8, Math.max(1, task.duration), 16);
        geo.rotateX(Math.PI / 2); // Align with Z axis
        
        let color = 0x64748b;
        if (task.status === 'completed') color = 0x10b981;
        else if (task.status === 'in-progress') color = 0x0ea5e9;
        else if (task.status === 'delayed') color = 0xef4444;
        
        if (task.critical) color = 0xf59e0b;

        const mat = new THREE.MeshPhongMaterial({ 
            color, 
            transparent: true, 
            opacity: 0.9,
            emissive: color,
            emissiveIntensity: task.status === 'in-progress' ? 0.6 : 0.2
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        mesh.userData = { id: task.id };
        nodesGroup.add(mesh);
        taskMeshes.push(mesh);

        // Labels (Simplified as floating sprites or small spheres)
        const labelGeo = new THREE.SphereGeometry(0.3);
        const labelMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const label = new THREE.Mesh(labelGeo, labelMat);
        label.position.set(0, 1.5, 0);
        mesh.add(label);
    });

    // Draw Dependencies
    tasks.forEach(task => {
        if (task.dependencies) {
            task.dependencies.forEach(parentId => {
                if (nodePositions[parentId]) {
                    const start = nodePositions[parentId];
                    const end = nodePositions[task.id];
                    const points = [start, end];
                    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                    const lineMat = new THREE.LineBasicMaterial({ 
                        color: 0x475569, 
                        transparent: true, 
                        opacity: 0.3 
                    });
                    const line = new THREE.Line(lineGeo, lineMat);
                    linesGroup.add(line);
                }
            });
        }
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);
    
    // Glowing particles for atmosphere
    const particlesCnt = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particlesCnt * 3);
    for(let i=0; i<particlesCnt*3; i++) {
        pPos[i] = (Math.random() - 0.5) * 60;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.1, color: 0x8b5cf6, transparent: true, opacity: 0.4 });
    const stars = new THREE.Points(pGeo, pMat);
    scene.add(stars);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(taskMeshes);
        if (intersects.length > 0) {
            onTaskSelect(intersects[0].object.userData.id);
        }
    };
    mountRef.current.addEventListener('click', onClick);

    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.01;

      // Move Time Plane
      // Map progress 0-100 to Z axis 0-100 roughly
      const targetZ = progress;
      timePlane.position.z = targetZ;
      timePlane.material.opacity = 0.1 + Math.sin(frame * 5) * 0.05;

      // Pulse active nodes
      taskMeshes.forEach(mesh => {
          // If task is currently active (intersecting time plane approx)
          if (Math.abs(mesh.position.z - targetZ) < 5) {
              mesh.scale.setScalar(1 + Math.sin(frame * 10) * 0.1);
          } else {
              mesh.scale.setScalar(1);
          }
      });

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
  }, [tasks, progress, onTaskSelect]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};