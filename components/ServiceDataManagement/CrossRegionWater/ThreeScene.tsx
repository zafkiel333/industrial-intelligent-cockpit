
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CrossRegionSceneProps, WaterNode } from './three-types';

export const CrossRegionWaterThreeScene: React.FC<CrossRegionSceneProps> = ({ 
  activeNodeId, onNodeSelect, flowVelocity, waterQualityIndex 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Define route nodes along a curve
  const nodes: WaterNode[] = [
    { id: 'node-head', name: '渠首引水闸', type: 'sluice', distance: 0, status: 'normal', waterLevel: 125, flow: 450 },
    { id: 'node-pump1', name: '一级泵站枢纽', type: 'pump-station', distance: 30, status: 'normal', waterLevel: 135, flow: 448 },
    { id: 'node-aque', name: '跨河渡槽段', type: 'aqueduct', distance: 65, status: 'warning', waterLevel: 134, flow: 445 },
    { id: 'node-tun', name: '穿山隧洞段', type: 'tunnel', distance: 90, status: 'normal', waterLevel: 133, flow: 445 },
    { id: 'node-res', name: '调蓄水库', type: 'reservoir', distance: 120, status: 'normal', waterLevel: 130, flow: 440 },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 30, 40); // High angle view

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xa5f3fc, 1.5);
    dirLight.position.set(50, 50, 20);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x6366f1, 5, 100);
    pointLight.position.set(0, 20, 0);
    scene.add(pointLight);

    const group = new THREE.Group();
    scene.add(group);

    // --- 1. Procedural Terrain (Mountains & Plains) ---
    const planeGeo = new THREE.PlaneGeometry(120, 120, 60, 60);
    const posAttribute = planeGeo.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
        const x = posAttribute.getX(i);
        const y = posAttribute.getY(i);
        // Simple noise
        let z = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2;
        // Add a "valley" for the water
        const distToCenter = Math.abs(x); // River runs along Y axis mostly
        if (distToCenter < 10) {
            z = -2; // River bed
        } else {
            z += (distToCenter - 10) * 0.5; // Slope up banks
        }
        posAttribute.setZ(i, z);
    }
    planeGeo.computeVertexNormals();
    const terrainMat = new THREE.MeshPhongMaterial({ 
        color: 0x0f172a, 
        wireframe: true,
        transparent: true,
        opacity: 0.2,
        shininess: 0
    });
    const terrain = new THREE.Mesh(planeGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    group.add(terrain);

    // --- 2. Water Channel (The "Vein") ---
    const pathPoints = [];
    for (let i = -50; i <= 50; i += 5) {
        pathPoints.push(new THREE.Vector3(Math.sin(i * 0.1) * 10, 0, i)); // Winding path
    }
    const curve = new THREE.CatmullRomCurve3(pathPoints);
    
    // Channel Geometry
    const tubeGeo = new THREE.TubeGeometry(curve, 100, 3, 8, false);
    const waterColor = new THREE.Color().setHSL(0.55, 1, 0.5 * (waterQualityIndex / 100)); // Dynamic color based on quality
    const waterMat = new THREE.MeshPhongMaterial({ 
        color: waterColor,
        transparent: true, 
        opacity: 0.6,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.2
    });
    const channel = new THREE.Mesh(tubeGeo, waterMat);
    channel.position.y = -1.5; // Slightly embedded
    group.add(channel);

    // Flow Particles
    const pCount = 1000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = 0; pPos[i*3+1] = 0; pPos[i*3+2] = 0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.8 });
    const particles = new THREE.Points(pGeo, pMat);
    
    // Store particle progress
    const pProgress = new Float32Array(pCount);
    const pOffset = new Float32Array(pCount); // Lateral offset
    for(let i=0; i<pCount; i++) {
        pProgress[i] = Math.random();
        pOffset[i] = (Math.random() - 0.5) * 2;
    }
    particles.userData = { pProgress, pOffset };
    group.add(particles);

    // --- 3. Nodes along the route ---
    const nodeMeshes: THREE.Mesh[] = [];
    nodes.forEach((node, i) => {
        const t = (i + 1) / (nodes.length + 1); // Distribute roughly
        const point = curve.getPoint(t);
        const tangent = curve.getTangent(t);

        const nodeGroup = new THREE.Group();
        nodeGroup.position.copy(point);
        nodeGroup.lookAt(point.clone().add(tangent));
        
        let geo, color;
        if (node.type === 'pump-station') {
            geo = new THREE.BoxGeometry(4, 3, 4);
            color = 0x6366f1;
        } else if (node.type === 'aqueduct') {
            geo = new THREE.TorusGeometry(3, 0.5, 8, 16, Math.PI); // Arch
            color = 0xf59e0b;
        } else if (node.type === 'tunnel') {
            geo = new THREE.CylinderGeometry(3, 3, 6, 16, 1, true);
            nodeGroup.rotation.x = Math.PI / 2;
            color = 0x64748b;
        } else {
            geo = new THREE.OctahedronGeometry(2);
            color = 0x10b981;
        }

        if (node.status === 'warning') color = 0xf59e0b;
        if (node.id === activeNodeId) color = 0xffffff;

        const mat = new THREE.MeshPhongMaterial({ 
            color, wireframe: true, emissive: color, emissiveIntensity: 0.5 
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData = { id: node.id };
        
        // Add label indicator (vertical line)
        const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0, 8, 0)]);
        const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.5 }));
        nodeGroup.add(line);

        nodeGroup.add(mesh);
        group.add(nodeGroup);
        nodeMeshes.push(mesh);
    });

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        onNodeSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Animate Particles
      const positions = particles.geometry.attributes.position.array as Float32Array;
      const progress = particles.userData.pProgress;
      const offset = particles.userData.pOffset;
      
      for(let i=0; i<pCount; i++) {
          progress[i] += 0.001 * flowVelocity;
          if (progress[i] > 1) progress[i] = 0;
          
          const pt = curve.getPoint(progress[i]);
          const tan = curve.getTangent(progress[i]);
          // Simple offset perpendicular logic (approximate for visual)
          const perp = new THREE.Vector3(-tan.z, 0, tan.x).normalize().multiplyScalar(offset[i]);
          
          positions[i*3] = pt.x + perp.x;
          positions[i*3+1] = pt.y + 0.5; // Slightly above channel bottom
          positions[i*3+2] = pt.z + perp.z;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Highlight Pulse
      nodeMeshes.forEach(m => {
          if (m.userData.id === activeNodeId) {
             m.scale.setScalar(1.2 + Math.sin(time * 3) * 0.1);
          } else {
             m.scale.setScalar(1);
          }
          m.rotation.y += 0.01;
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
  }, [activeNodeId, flowVelocity, waterQualityIndex]);

  return <div ref={mountRef} className="w-full h-full relative cursor-pointer" />;
};
