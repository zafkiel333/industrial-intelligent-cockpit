
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HealthSceneProps, HealthNode } from './three-types';

export const HydroHealthThreeScene: React.FC<HealthSceneProps> = ({ 
  activeNodeId, onNodeSelect, isExploded, visualizationMode 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const nodes: HealthNode[] = [
    { id: 'part-stator', name: '定子 (Stator)', type: 'stator', healthScore: 92, status: 'healthy', position: [0, 4, 0], explodedPosition: [0, 8, 0] },
    { id: 'part-rotor', name: '转子 (Rotor)', type: 'rotor', healthScore: 88, status: 'healthy', position: [0, 4, 0], explodedPosition: [0, 4, 0] }, // Rotor stays or moves slightly
    { id: 'part-bearing', name: '推力轴承 (Thrust Bearing)', type: 'bearing', healthScore: 72, status: 'degraded', position: [0, 1.5, 0], explodedPosition: [0, 1, 0] },
    { id: 'part-shaft', name: '主轴 (Shaft)', type: 'shaft', healthScore: 95, status: 'healthy', position: [0, -2, 0], explodedPosition: [0, -2, 0] },
    { id: 'part-runner', name: '转轮 (Runner)', type: 'runner', healthScore: 65, status: 'critical', position: [0, -5, 0], explodedPosition: [0, -8, 0] },
    { id: 'part-gov', name: '调速器 (Governor)', type: 'governor', healthScore: 90, status: 'healthy', position: [5, 2, 0], explodedPosition: [10, 2, 0] },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(25, 15, 25);

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
    const mainLight = new THREE.DirectionalLight(0x14b8a6, 2);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);
    const fillLight = new THREE.PointLight(0xf97316, 1, 50);
    fillLight.position.set(-10, -5, -10);
    scene.add(fillLight);

    // Floor Grid
    const gridHelper = new THREE.GridHelper(40, 20, 0x0d9488, 0x0f172a);
    gridHelper.position.y = -10;
    scene.add(gridHelper);

    const group = new THREE.Group();
    scene.add(group);

    const partMeshes: THREE.Mesh[] = [];

    // Helper to get color based on mode and health
    const getColor = (node: HealthNode) => {
        if (visualizationMode === 'health') {
            if (node.status === 'critical') return 0xef4444;
            if (node.status === 'degraded') return 0xf59e0b;
            return 0x10b981;
        } else if (visualizationMode === 'thermal') {
            // Mock thermal map: Rotor usually hotter
            return node.type === 'rotor' || node.type === 'stator' ? 0xf97316 : 0x3b82f6;
        } else {
            // Stress mode
            return node.type === 'runner' || node.type === 'bearing' ? 0xd946ef : 0x64748b;
        }
    };

    nodes.forEach(node => {
        let geo;
        if (node.type === 'stator') geo = new THREE.CylinderGeometry(5, 5, 3, 32, 1, true);
        else if (node.type === 'rotor') geo = new THREE.CylinderGeometry(4.2, 4.2, 2.8, 32);
        else if (node.type === 'bearing') geo = new THREE.CylinderGeometry(3, 3, 1, 32);
        else if (node.type === 'shaft') geo = new THREE.CylinderGeometry(1, 1, 8, 16);
        else if (node.type === 'runner') geo = new THREE.TorusGeometry(3.5, 1, 16, 32);
        else geo = new THREE.BoxGeometry(2, 3, 2); // Governor

        const color = getColor(node);
        const mat = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: node.id === activeNodeId ? 0.9 : 0.6,
            wireframe: false,
            shininess: 50,
            emissive: color,
            emissiveIntensity: node.id === activeNodeId ? 0.5 : 0.1
        });

        const mesh = new THREE.Mesh(geo, mat);
        if (node.type === 'runner') mesh.rotation.x = Math.PI / 2;
        
        mesh.position.set(...node.position);
        mesh.userData = { 
            id: node.id, 
            basePos: new THREE.Vector3(...node.position),
            explPos: new THREE.Vector3(...node.explodedPosition)
        };
        
        group.add(mesh);
        partMeshes.push(mesh);

        // Add wireframe overlay for tech look
        const wireGeo = new THREE.WireframeGeometry(geo);
        const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
        const wire = new THREE.LineSegments(wireGeo, wireMat);
        mesh.add(wire);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(partMeshes);
      if (intersects.length > 0) {
        onNodeSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Animate Explode / Collapse
      partMeshes.forEach(mesh => {
          const target = isExploded ? mesh.userData.explPos : mesh.userData.basePos;
          mesh.position.lerp(target, 0.1);

          // Rotate some parts if active or just idle animation
          if (mesh.userData.id === 'part-rotor' || mesh.userData.id === 'part-runner' || mesh.userData.id === 'part-shaft') {
             // Slowly rotate for visual effect
             const axis = mesh.userData.id === 'part-runner' ? 'z' : 'y'; // Runner is rotated X, so local Z is world Y
             mesh.rotation[axis] += 0.01;
          }
          
          // Pulse effect for critical/degraded
          const node = nodes.find(n => n.id === mesh.userData.id);
          if (node && node.status !== 'healthy') {
              const pulse = Math.sin(time * 5) * 0.2 + 0.8;
              (mesh.material as THREE.MeshPhongMaterial).opacity = pulse * 0.8;
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
  }, [activeNodeId, isExploded, visualizationMode]);

  return <div ref={mountRef} className="w-full h-full relative cursor-pointer" />;
};
