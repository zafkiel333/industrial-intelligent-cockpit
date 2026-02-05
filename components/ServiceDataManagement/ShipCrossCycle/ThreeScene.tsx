
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CrossCycleSceneProps, LifecycleNode } from './three-types';

export const ShipCrossCycleThreeScene: React.FC<CrossCycleSceneProps> = ({ currentYear, showRetrofit, onNodeSelect }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Define key lifecycle components
  const nodes: LifecycleNode[] = [
    { id: 'hull-plate', name: '船体外板', type: 'structure', installYear: 0, lifespan: 25, position: [0, 0, 0], wearRate: 0.02 },
    { id: 'main-engine', name: '主机总成', type: 'machinery', installYear: 0, lifespan: 20, position: [-4, 2, 0], wearRate: 0.03 },
    { id: 'propeller', name: '螺旋桨', type: 'machinery', installYear: 0, lifespan: 15, position: [10, -2, 0], wearRate: 0.04 },
    { id: 'scrubber', name: '脱硫塔 (Retrofit)', type: 'outfitting', installYear: 10, lifespan: 15, position: [-2, 8, 0], wearRate: 0.01 } // Retrofit item
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 30);

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
    controls.autoRotateSpeed = 0.5;

    // Time-based Lighting
    // Young ship = Cool Blue Light; Old ship = Warm Amber Light
    const ageFactor = Math.min(1, currentYear / 25);
    const lightColor = new THREE.Color().lerpColors(new THREE.Color(0x22d3ee), new THREE.Color(0xd97706), ageFactor);
    
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const mainLight = new THREE.PointLight(lightColor, 10, 50);
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);

    // Time Ring (Floor)
    const gridHelper = new THREE.PolarGridHelper(30, 16, 8, 64, lightColor, 0x1e293b);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    // Ship Group
    const shipGroup = new THREE.Group();
    scene.add(shipGroup);

    // Abstract Hull
    const hullGeo = new THREE.CylinderGeometry(2, 4, 18, 6);
    hullGeo.rotateZ(Math.PI / 2);
    
    // Material changes with age (Corrosion simulation visually)
    const hullMat = new THREE.MeshPhongMaterial({
      color: lightColor,
      transparent: true,
      opacity: 0.6 - (ageFactor * 0.3), // Becomes more ghost-like or worn
      wireframe: false,
      shininess: 100 - (ageFactor * 80) // Loses shine
    });
    const hullMesh = new THREE.Mesh(hullGeo, hullMat);
    shipGroup.add(hullMesh);

    // Wireframe overlay to represent "Digital Twin" persistence
    const wireGeo = new THREE.WireframeGeometry(hullGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
    const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
    shipGroup.add(wireMesh);

    // Retrofit Highlight (Scrubber/Energy Saving Device)
    if (showRetrofit || currentYear >= 10) {
        const retrofitGeo = new THREE.BoxGeometry(2, 4, 2);
        const retrofitMat = new THREE.MeshBasicMaterial({ 
            color: 0x10b981, 
            wireframe: true,
            transparent: true,
            opacity: currentYear >= 10 ? 0.8 : 0.2 // Solid if installed, ghost if planned
        });
        const retrofitMesh = new THREE.Mesh(retrofitGeo, retrofitMat);
        retrofitMesh.position.set(-5, 3, 0);
        shipGroup.add(retrofitMesh);
        
        // Label Line
        if (currentYear >= 10) {
            const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-5,5,0), new THREE.Vector3(-5,8,0)]);
            const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({color: 0x10b981}));
            shipGroup.add(line);
        }
    }

    // Wear & Tear Visualization (Particles indicating stress/aging areas)
    if (currentYear > 5) {
        const pCount = Math.floor(currentYear * 20);
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        for(let i=0; i<pCount*3; i+=3) {
            // Randomly distributed around hull
            const theta = Math.random() * Math.PI * 2;
            const r = 3 + Math.random();
            const x = (Math.random() - 0.5) * 16;
            pPos[i] = x;
            pPos[i+1] = Math.sin(theta) * r;
            pPos[i+2] = Math.cos(theta) * r;
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ 
            color: 0xef4444, 
            size: 0.1, 
            transparent: true, 
            opacity: Math.min(0.8, (currentYear - 5) / 10) 
        });
        const rustParticles = new THREE.Points(pGeo, pMat);
        shipGroup.add(rustParticles);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      
      shipGroup.rotation.y = Math.sin(Date.now() * 0.0005) * 0.1; // Gentle sway
      shipGroup.position.y = Math.sin(Date.now() * 0.001) * 0.2; // Bobbing

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
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [currentYear, showRetrofit]);

  return <div ref={mountRef} className="w-full h-full relative cursor-ew-resize" />;
};
