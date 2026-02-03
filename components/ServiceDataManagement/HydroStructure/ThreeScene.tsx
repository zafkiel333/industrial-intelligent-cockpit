
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { StructureProps, SensorNode } from './three-types';

export const HydroStructureThreeScene: React.FC<StructureProps> = ({ 
  waterLevel, stressLoad, crackGrowth, activeSensorId, onSensorSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const sensors: SensorNode[] = [
    { id: 's-plumb', type: 'displacement', position: [0, 8, 0], value: 0.5, status: 'normal', label: '正垂线 PL-01' },
    { id: 's-press-1', type: 'seepage', position: [-5, -5, 5], value: 24, status: 'warning', label: '扬压力 P-12' },
    { id: 's-stress-main', type: 'stress', position: [0, -2, 2], value: 4.5, status: 'normal', label: '坝踵应力 S-05' },
    { id: 's-crack-01', type: 'crack', position: [3, 2, 8], value: 0.2, status: 'alarm', label: '表面裂缝 C-09' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.01);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 20, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);
    const stressLight = new THREE.PointLight(0xff0000, stressLoad * 5, 20);
    stressLight.position.set(0, -5, 5); // Near the heel of the dam
    scene.add(stressLight);

    const group = new THREE.Group();
    scene.add(group);

    // --- Dam Model (Gravity Dam Section) ---
    const damShape = new THREE.Shape();
    damShape.moveTo(-2, 10); // Top left
    damShape.lineTo(2, 10);  // Top right
    damShape.lineTo(8, -10); // Bottom right (Toe)
    damShape.lineTo(-8, -10);// Bottom left (Heel)
    damShape.lineTo(-2, 10); // Close

    const extrudeSettings = { depth: 40, bevelEnabled: false };
    const damGeo = new THREE.ExtrudeGeometry(damShape, extrudeSettings);
    // Center the geometry
    damGeo.translate(0, 0, -20);
    
    // Material with "Stress" visualization capability (using vertex colors conceptually)
    const damMat = new THREE.MeshPhongMaterial({ 
        color: 0x64748b, 
        transparent: true, 
        opacity: 0.9,
        wireframe: false,
        shininess: 20
    });
    const dam = new THREE.Mesh(damGeo, damMat);
    group.add(dam);

    // Wireframe Overlay for "Digital Twin" feel
    const wireGeo = new THREE.WireframeGeometry(damGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.1 });
    const wire = new THREE.LineSegments(wireGeo, wireMat);
    group.add(wire);

    // Internal Gallery (Hollow Cylinder)
    const galleryGeo = new THREE.CylinderGeometry(1.5, 1.5, 42, 16);
    galleryGeo.rotateX(Math.PI / 2);
    galleryGeo.translate(0, -5, 0);
    const galleryMat = new THREE.MeshBasicMaterial({ color: 0x0f172a }); // Dark hole
    const gallery = new THREE.Mesh(galleryGeo, galleryMat);
    // Note: Simple overlapping for visual effect, boolean op is expensive
    // To make it look "inside", we can use a slightly larger cylinder with "frontSide" culling or just position sensors there
    
    // Sensors Visualization
    const sensorMeshes: THREE.Mesh[] = [];
    sensors.forEach(s => {
        const geo = new THREE.SphereGeometry(0.5);
        const color = s.status === 'alarm' ? 0xef4444 : s.status === 'warning' ? 0xf59e0b : 0x10b981;
        const mat = new THREE.MeshBasicMaterial({ color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...s.position);
        mesh.userData = { id: s.id };
        group.add(mesh);
        sensorMeshes.push(mesh);

        // Pulse Ring
        const ringGeo = new THREE.RingGeometry(0.6, 0.8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(mesh.position);
        ring.lookAt(camera.position);
        group.add(ring);
        // Animate ring in loop
        ring.userData = { isPulse: true, offset: Math.random() };
    });

    // Water (Upstream)
    const waterLevelY = -10 + (waterLevel / 100) * 18; // Map 0-100 to dam height range
    const waterGeo = new THREE.BoxGeometry(20, 20, 40); // Initial size, adjust scale
    const waterMat = new THREE.MeshPhongMaterial({ 
        color: 0x0ea5e9, 
        transparent: true, 
        opacity: 0.4,
        side: THREE.DoubleSide
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(-15, waterLevelY - 10, 0); // Position relative to dam face
    group.add(water);

    // Foundation Rock
    const rockGeo = new THREE.BoxGeometry(40, 5, 60);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.y = -12.5;
    group.add(rock);

    // Drone (Inspection)
    const drone = new THREE.Group();
    const dBody = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 1), new THREE.MeshBasicMaterial({color: 0xffffff}));
    drone.add(dBody);
    // Scanning Cone
    const coneGeo = new THREE.ConeGeometry(2, 5, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.rotation.x = -Math.PI / 2; // Point forward/down
    cone.rotation.z = -Math.PI / 4; // Tilt down
    drone.add(cone);
    scene.add(drone);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(sensorMeshes);
      if (intersects.length > 0) {
        onSensorSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Water Animation
      water.scale.y = (waterLevel / 100) + 0.1;
      water.position.y = -10 + (water.scale.y * 10); 

      // Stress Light Pulse
      stressLight.intensity = stressLoad * 5 + Math.sin(time * 5) * 2;

      // Drone Path Animation (Figure 8 on dam face)
      drone.position.x = -9; // Near upstream face
      drone.position.y = Math.sin(time * 0.5) * 8;
      drone.position.z = Math.cos(time * 0.5) * 15;
      drone.lookAt(-5, drone.position.y, drone.position.z);

      // Sensor Pulses
      group.children.forEach(child => {
          if (child.userData.isPulse) {
              const s = 1 + Math.sin(time * 3 + child.userData.offset) * 0.5;
              child.scale.set(s, s, s);
              child.lookAt(camera.position);
              (child.material as THREE.MeshBasicMaterial).opacity = 1 - (s - 1);
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
  }, [waterLevel, stressLoad, activeSensorId]);

  return <div ref={mountRef} className="w-full h-full relative cursor-pointer" />;
};
