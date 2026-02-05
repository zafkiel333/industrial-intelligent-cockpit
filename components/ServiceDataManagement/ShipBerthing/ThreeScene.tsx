
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BerthingSceneProps, PortEntityNode } from './three-types';

export const ShipBerthingThreeScene: React.FC<BerthingSceneProps> = ({ 
  shipDistance, shipAngle, tugForces, activeEntityId, onEntitySelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const entities: PortEntityNode[] = [
    { id: 'tug-01', name: '拖轮 A (3000HP)', type: 'tug', position: [5, 0, 8], status: 'active', data: 'Push: 85%' },
    { id: 'tug-02', name: '拖轮 B (4000HP)', type: 'tug', position: [-5, 0, 8], status: 'active', data: 'Pull: 40%' },
    { id: 'crane-01', name: '岸桥 STS-04', type: 'crane', position: [0, 8, -12], status: 'idle', data: 'Boom: Up' },
    { id: 'sensor-laser', name: '激光靠泊单元', type: 'sensor', position: [0, 2, -10], status: 'active', data: 'Lidar: ON' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(25, 25, 25);

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
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    // Port Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const moonLight = new THREE.DirectionalLight(0xa5f3fc, 1.5);
    moonLight.position.set(-20, 50, -20);
    scene.add(moonLight);
    const floodLight = new THREE.SpotLight(0xffaa00, 50);
    floodLight.position.set(0, 30, -10);
    floodLight.angle = 0.5;
    floodLight.penumbra = 0.5;
    scene.add(floodLight);

    // Ocean Surface
    const waterGeo = new THREE.PlaneGeometry(200, 200, 60, 60);
    const waterMat = new THREE.MeshPhongMaterial({ 
      color: 0x0f172a, 
      specular: 0x111111,
      shininess: 100,
      transparent: true, 
      opacity: 0.9,
      wireframe: false
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // Grid Overlay on Water
    const gridHelper = new THREE.GridHelper(200, 50, 0x0ea5e9, 0x0ea5e9);
    gridHelper.position.y = 0.1;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.1;
    scene.add(gridHelper);

    // Quay Wall
    const quayGeo = new THREE.BoxGeometry(60, 10, 10);
    const quayMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const quay = new THREE.Mesh(quayGeo, quayMat);
    quay.position.set(0, 4, -15);
    scene.add(quay);

    // Ship Group
    const shipGroup = new THREE.Group();
    scene.add(shipGroup);

    // Simple Container Ship Mesh
    const hullGeo = new THREE.BoxGeometry(20, 6, 60);
    const hullMat = new THREE.MeshPhongMaterial({ color: 0x1e3a8a });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = 3;
    shipGroup.add(hull);

    const deckHouseGeo = new THREE.BoxGeometry(18, 10, 8);
    const deckHouse = new THREE.Mesh(deckHouseGeo, new THREE.MeshPhongMaterial({ color: 0xffffff }));
    deckHouse.position.set(0, 9, -24);
    shipGroup.add(deckHouse);

    // Interactive Entities
    const entityMeshes: THREE.Mesh[] = [];
    
    // Tugs
    const tugGeo = new THREE.BoxGeometry(3, 2, 5);
    const tugMat = new THREE.MeshPhongMaterial({ color: 0xf97316 }); // Orange tugs
    
    entities.forEach(ent => {
      let mesh;
      if (ent.type === 'tug') {
        mesh = new THREE.Mesh(tugGeo, tugMat);
        mesh.position.set(...ent.position);
        
        // Force Vector Line
        const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-shipDistance/2)]);
        const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
        mesh.add(line);
      } else if (ent.type === 'crane') {
        // Crane Abstract
        mesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 2, 20), new THREE.MeshPhongMaterial({ color: 0xfacc15 }));
        mesh.position.set(...ent.position);
      } else {
        // Sensor
        mesh = new THREE.Mesh(new THREE.OctahedronGeometry(1), new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true }));
        mesh.position.set(...ent.position);
      }
      
      mesh.userData = { id: ent.id };
      scene.add(mesh);
      entityMeshes.push(mesh);

      // Label / Highlight Ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(2, 2.2, 32),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -1;
      mesh.add(ring);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(entityMeshes);
      if (intersects.length > 0) {
        onEntitySelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Update Ship Position based on props
      shipGroup.position.z = shipDistance; // Move ship towards quay (z-axis in this setup)
      shipGroup.rotation.y = THREE.MathUtils.degToRad(shipAngle); // Rotation

      // Animate Tugs (bobbing)
      const time = Date.now() * 0.002;
      entityMeshes.forEach(mesh => {
        if (mesh.userData.id.includes('tug')) {
           // Position tugs relative to ship center roughly
           // In real app, calculate offset. Here static relative position.
           mesh.position.y = Math.sin(time) * 0.2;
           // If selected
           if (mesh.userData.id === activeEntityId) {
             (mesh.material as THREE.MeshPhongMaterial).emissive.setHex(0x333333);
           } else {
             (mesh.material as THREE.MeshPhongMaterial).emissive.setHex(0x000000);
           }
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
  }, [shipDistance, shipAngle, activeEntityId]);

  return <div ref={mountRef} className="w-full h-full relative cursor-crosshair" />;
};
