
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LifespanSceneProps, AgingPart } from './three-types';

export const HydroLifespanThreeScene: React.FC<LifespanSceneProps> = ({ 
  currentYearOffset, activePartId, onPartSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const parts: AgingPart[] = [
    { id: 'part-runner', name: '转轮 (Runner)', type: 'runner', initialHealth: 92, degradationRate: 1.8, position: [0, -3, 0] },
    { id: 'part-stator', name: '定子绝缘 (Stator)', type: 'stator', initialHealth: 95, degradationRate: 1.2, position: [0, 4, 0] },
    { id: 'part-bearing', name: '推力瓦 (Bearing)', type: 'bearing', initialHealth: 88, degradationRate: 2.5, position: [0, 1.5, 0] },
    { id: 'part-shaft', name: '主轴 (Shaft)', type: 'shaft', initialHealth: 98, degradationRate: 0.5, position: [0, 0, 0] },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0510, 0.02); // Deep violet fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    // Dynamic light color based on "Health" of the scene (Age)
    // New = Blue/Cyan, Old = Orange/Red
    const yearRatio = Math.min(1, currentYearOffset / 20);
    const lightColor = new THREE.Color().lerpColors(new THREE.Color(0x22d3ee), new THREE.Color(0xef4444), yearRatio);
    
    const mainLight = new THREE.PointLight(lightColor, 10, 50);
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);
    
    const rimLight = new THREE.SpotLight(0x8b5cf6, 5);
    rimLight.position.set(-10, 0, -10);
    scene.add(rimLight);

    // Time Ring (Floor)
    const gridHelper = new THREE.PolarGridHelper(30, 16, 8, 64, lightColor, 0x1e293b);
    gridHelper.position.y = -8;
    scene.add(gridHelper);

    const group = new THREE.Group();
    scene.add(group);

    // Create Parts
    const partMeshes: THREE.Mesh[] = [];

    parts.forEach(part => {
        // Calculate current health based on time slider
        const currentHealth = Math.max(0, part.initialHealth - (part.degradationRate * currentYearOffset));
        
        // Color interpolation: 100=Blue/Green, 50=Yellow, 0=Red/Black
        let partColor = new THREE.Color();
        if (currentHealth > 80) partColor.setHex(0x22d3ee); // Good
        else if (currentHealth > 50) partColor.setHex(0xfacc15); // Warning
        else partColor.setHex(0xef4444); // Critical

        let geo;
        if (part.type === 'stator') {
            geo = new THREE.CylinderGeometry(5, 5, 3, 32, 1, true);
        } else if (part.type === 'bearing') {
            geo = new THREE.CylinderGeometry(3, 3, 1, 32);
        } else if (part.type === 'shaft') {
            geo = new THREE.CylinderGeometry(0.8, 0.8, 12, 16);
        } else {
            // Runner
            geo = new THREE.TorusGeometry(3.5, 1, 16, 32);
        }

        const mat = new THREE.MeshPhongMaterial({
            color: partColor,
            emissive: partColor,
            emissiveIntensity: part.id === activePartId ? 0.8 : 0.2,
            transparent: true,
            opacity: 0.8 - (currentYearOffset * 0.02), // Old parts get ghostly/worn
            wireframe: currentHealth < 20 // Wireframe when failed
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...part.position);
        if (part.type === 'runner') mesh.rotation.x = Math.PI / 2;
        
        mesh.userData = { id: part.id };
        group.add(mesh);
        partMeshes.push(mesh);

        // Health Particles (Simulating entropy/wear)
        if (currentHealth < 60) {
            const pCount = Math.floor((60 - currentHealth) * 2);
            const pGeo = new THREE.BufferGeometry();
            const pPos = new Float32Array(pCount * 3);
            for(let i=0; i<pCount*3; i+=3) {
                pPos[i] = (Math.random()-0.5) * 3;
                pPos[i+1] = (Math.random()-0.5) * 3;
                pPos[i+2] = (Math.random()-0.5) * 3;
            }
            pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
            const pMat = new THREE.PointsMaterial({ color: 0xef4444, size: 0.1 });
            const particles = new THREE.Points(pGeo, pMat);
            particles.position.set(...part.position);
            group.add(particles);
        }
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
        onPartSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotation logic: Older units might vibrate/wobble
      const wobble = Math.max(0, (currentYearOffset - 10) * 0.002);
      
      group.rotation.y += 0.005;
      group.position.x = Math.sin(Date.now() * 0.01) * wobble;
      group.position.z = Math.cos(Date.now() * 0.01) * wobble;

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
  }, [currentYearOffset, activePartId]);

  return <div ref={mountRef} className="w-full h-full relative cursor-ew-resize" title="Drag to rotate, Scroll to zoom" />;
};
