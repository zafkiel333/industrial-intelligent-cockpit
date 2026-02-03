import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SkillThreeProps } from './three-types';

export const SkillThreeScene: React.FC<SkillThreeProps> = ({ 
  skills, 
  activeSkillId, 
  onSkillSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.04);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 5, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;

    // --- Scene Geometry ---

    const group = new THREE.Group();
    scene.add(group);

    // Central "Brain" Core
    const coreGeo = new THREE.IcosahedronGeometry(1.5, 2);
    const coreMat = new THREE.MeshPhongMaterial({ 
      color: 0x8b5cf6, 
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.5,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Inner Core Glow
    const glowGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);

    // Skill Nodes & Connections
    const nodes: THREE.Mesh[] = [];
    const lines: THREE.Line[] = [];

    const categoryColors = {
      mechanical: 0xf59e0b, // Amber
      electrical: 0x0ea5e9, // Blue
      software: 0xd946ef,   // Fuchsia
      safety: 0x10b981,     // Green
      management: 0xffffff  // White
    };

    skills.forEach((skill, i) => {
      // Position nodes in a spherical distribution
      const phi = Math.acos(-1 + (2 * i) / skills.length);
      const theta = Math.sqrt(skills.length * Math.PI) * phi;
      
      const radius = 4 + (100 - skill.level) * 0.03; // Higher skill = closer to core
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      // Node Mesh
      const size = 0.2 + (skill.level / 100) * 0.3;
      const geo = new THREE.SphereGeometry(size, 16, 16);
      const color = categoryColors[skill.category];
      
      const mat = new THREE.MeshPhongMaterial({ 
        color: color,
        emissive: activeSkillId === skill.id ? color : 0x000000,
        emissiveIntensity: activeSkillId === skill.id ? 1 : 0.2,
        transparent: true,
        opacity: 0.9
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.userData = { id: skill.id };
      group.add(mesh);
      nodes.push(mesh);

      // Connection Line to Core
      const points = [new THREE.Vector3(0,0,0), new THREE.Vector3(x, y, z)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({ 
        color: color, 
        transparent: true, 
        opacity: 0.2 
      });
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);
      lines.push(line);

      // Orbital Rings (Decorative)
      if (i % 3 === 0) {
         const ringGeo = new THREE.TorusGeometry(radius, 0.02, 16, 100);
         const ringMat = new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.1 });
         const ring = new THREE.Mesh(ringGeo, ringMat);
         ring.lookAt(new THREE.Vector3(x,y,z));
         group.add(ring);
      }
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x8b5cf6, 2, 20);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0x0ea5e9, 2, 20);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodes);
      if (intersects.length > 0) {
        onSkillSelect?.(intersects[0].object.userData.id);
      }
    };
    mountRef.current.addEventListener('click', onClick);

    // Animation Loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Pulse Core
      glow.scale.setScalar(0.8 + Math.sin(time * 2) * 0.1);

      // Animate Nodes
      nodes.forEach((node, i) => {
         // Gentle floating
         node.position.y += Math.sin(time * 2 + i) * 0.005;
         
         // Highlight active
         if (node.userData.id === activeSkillId) {
             node.scale.setScalar(1 + Math.sin(time * 10) * 0.2);
         } else {
             node.scale.setScalar(1);
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
  }, [skills, activeSkillId]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};