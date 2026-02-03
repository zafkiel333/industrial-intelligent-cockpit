
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ReliabilitySceneProps, ReliabilityNode } from './three-types';

export const ShipReliabilityThreeScene: React.FC<ReliabilitySceneProps> = ({ activeNodeId, onNodeSelect, simulationTime }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const nodes: ReliabilityNode[] = [
    { id: 'core-ship', name: '全船系统', reliability: 0.98, criticality: 'high', type: 'core', position: [0, 0, 0], dependencies: [] },
    
    // Propulsion Branch
    { id: 'sys-prop', name: '推进系统', reliability: 0.95, criticality: 'high', type: 'subsystem', position: [-8, 2, 5], dependencies: ['core-ship'] },
    { id: 'comp-me', name: '主机', reliability: 0.92, criticality: 'high', type: 'component', position: [-12, 4, 8], dependencies: ['sys-prop'] },
    { id: 'comp-shaft', name: '轴系', reliability: 0.99, criticality: 'medium', type: 'component', position: [-12, 0, 8], dependencies: ['sys-prop'] },
    
    // Power Branch
    { id: 'sys-power', name: '电力系统', reliability: 0.96, criticality: 'high', type: 'subsystem', position: [8, 2, 5], dependencies: ['core-ship'] },
    { id: 'comp-gen1', name: '1#发电机', reliability: 0.88, criticality: 'medium', type: 'component', position: [12, 5, 8], dependencies: ['sys-power'] },
    { id: 'comp-gen2', name: '2#发电机', reliability: 0.94, criticality: 'medium', type: 'component', position: [12, -1, 8], dependencies: ['sys-power'] },
    
    // Navigation Branch
    { id: 'sys-nav', name: '导航系统', reliability: 0.99, criticality: 'medium', type: 'subsystem', position: [0, 8, -5], dependencies: ['core-ship'] },
    { id: 'comp-radar', name: '雷达组', reliability: 0.97, criticality: 'medium', type: 'component', position: [0, 12, -8], dependencies: ['sys-nav'] },
    
    // Cargo Branch
    { id: 'sys-cargo', name: '货运监控', reliability: 0.94, criticality: 'low', type: 'subsystem', position: [0, -6, -5], dependencies: ['core-ship'] },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05010d, 0.02); // Dark purple fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 10, 35);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x4c1d95, 1);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xd946ef, 2, 50);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);
    const spotLight = new THREE.SpotLight(0x22d3ee, 5);
    spotLight.position.set(10, 20, 10);
    scene.add(spotLight);

    // Matrix Grid (Background)
    const gridGeo = new THREE.BufferGeometry();
    const gridPoints = [];
    for(let i=0; i<500; i++) {
        gridPoints.push((Math.random()-0.5)*60, (Math.random()-0.5)*60, (Math.random()-0.5)*60);
    }
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPoints, 3));
    const gridMat = new THREE.PointsMaterial({ color: 0x6d28d9, size: 0.1, transparent: true, opacity: 0.4 });
    const starField = new THREE.Points(gridGeo, gridMat);
    scene.add(starField);

    // Topology Group
    const topoGroup = new THREE.Group();
    scene.add(topoGroup);

    const meshes: THREE.Mesh[] = [];
    const lines: THREE.Line[] = [];

    // Create Lines first
    nodes.forEach(node => {
        if (node.dependencies) {
            node.dependencies.forEach(depId => {
                const parent = nodes.find(n => n.id === depId);
                if (parent) {
                    const points = [new THREE.Vector3(...parent.position), new THREE.Vector3(...node.position)];
                    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                    const lineMat = new THREE.LineBasicMaterial({ color: 0x4b5563, transparent: true, opacity: 0.3 });
                    const line = new THREE.Line(lineGeo, lineMat);
                    topoGroup.add(line);
                    lines.push(line);

                    // Data particles on lines
                    const pGeo = new THREE.SphereGeometry(0.1, 4, 4);
                    const pMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
                    const particle = new THREE.Mesh(pGeo, pMat);
                    particle.userData = { start: new THREE.Vector3(...parent.position), end: new THREE.Vector3(...node.position), progress: Math.random() };
                    topoGroup.add(particle);
                }
            });
        }
    });

    // Create Nodes
    nodes.forEach(node => {
        let geo;
        if (node.type === 'core') geo = new THREE.IcosahedronGeometry(2, 1);
        else if (node.type === 'subsystem') geo = new THREE.OctahedronGeometry(1.2, 0);
        else geo = new THREE.BoxGeometry(0.8, 0.8, 0.8);

        // Color based on reliability (simulated decay)
        const currentR = Math.max(0, node.reliability - simulationTime * (node.criticality === 'high' ? 0.3 : 0.1));
        const color = new THREE.Color().setHSL(currentR * 0.3, 1, 0.5); // Red (low R) to Green (high R)

        const mat = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...node.position);
        mesh.userData = { id: node.id, baseR: node.reliability };
        
        // Inner Glow
        const innerGeo = new THREE.SphereGeometry(node.type === 'core' ? 1 : 0.4, 16, 16);
        const innerMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        mesh.add(inner);

        topoGroup.add(mesh);
        meshes.push(mesh);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        onNodeSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Animate Nodes
      meshes.forEach((mesh, i) => {
          mesh.rotation.y += 0.01;
          mesh.rotation.z += 0.005;
          // Float
          mesh.position.y += Math.sin(time + i) * 0.002;

          // Highlight active
          if (mesh.userData.id === activeNodeId) {
              mesh.scale.setScalar(1.5);
              (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 2;
          } else {
              mesh.scale.setScalar(1);
              (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.5;
          }
      });

      // Animate Particles
      topoGroup.children.forEach(child => {
          if (child.userData.progress !== undefined) {
              child.userData.progress += 0.01;
              if (child.userData.progress > 1) child.userData.progress = 0;
              child.position.lerpVectors(child.userData.start, child.userData.end, child.userData.progress);
          }
      });

      starField.rotation.y -= 0.0005;

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
  }, [activeNodeId, simulationTime]);

  return <div ref={mountRef} className="w-full h-full relative cursor-pointer" />;
};
