
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CascadeAnimatables, SystemNode } from './three-types';

interface ThreeSceneProps {
  nodes: SystemNode[];
  activeFailureNode: string | null; // ID of the root cause
  propagationLevel: number; // 0 to 1
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  nodes, 
  activeFailureNode,
  propagationLevel 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===ship-cascading-failure useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020408);
    scene.fog = new THREE.FogExp2(0x020408, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 25, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
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

    // --- Sci-Fi Lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const redLight = new THREE.PointLight(0xff0055, 0, 50);
    redLight.position.set(0, 5, 0);
    scene.add(redLight);
    
    const blueLight = new THREE.DirectionalLight(0x0ea5e9, 1);
    blueLight.position.set(10, 20, 10);
    scene.add(blueLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: CascadeAnimatables = { 
        nodeGroup: new THREE.Group(), 
        pulseParticles: new THREE.Group(),
        shockwaves: new THREE.Group()
    };
    
    group.add(animatables.nodeGroup!);
    group.add(animatables.pulseParticles!);
    group.add(animatables.shockwaves!);

    const disposables: any[] = [];

    // --- 1. Nodes Geometry ---
    const nodeGeo = new THREE.IcosahedronGeometry(1.5, 1);
    
    nodes.forEach(n => {
        let color = 0x0ea5e9; // Normal Blue
        if (n.status === 'warning') color = 0xf59e0b; // Orange
        if (n.status === 'failed' || n.status === 'critical') color = 0xff0055; // Red

        const mat = new THREE.MeshStandardMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: n.status === 'normal' ? 0.2 : 1.0,
            roughness: 0.2,
            metalness: 0.8
        });

        const mesh = new THREE.Mesh(nodeGeo, mat);
        mesh.position.copy(n.position);
        mesh.userData = { id: n.id, originalY: n.position.y };
        
        // Halo Ring
        const ringGeo = new THREE.TorusGeometry(2, 0.05, 8, 32);
        ringGeo.rotateX(Math.PI/2);
        const ringMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        mesh.add(ring);

        animatables.nodeGroup?.add(mesh);
        disposables.push(mat, ringGeo, ringMat);
    });
    disposables.push(nodeGeo);

    // --- 2. Connections (Links) ---
    const linkMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.4 });
    const activeLinkMat = new THREE.LineBasicMaterial({ color: 0xff0055, transparent: true, opacity: 0.8 });
    
    nodes.forEach(source => {
        source.connections.forEach(targetId => {
            const target = nodes.find(n => n.id === targetId);
            if (target) {
                const points = [source.position, target.position];
                const geo = new THREE.BufferGeometry().setFromPoints(points);
                // If source is failed, link turns red
                const isCritical = source.status === 'failed' || source.status === 'critical';
                const line = new THREE.Line(geo, isCritical ? activeLinkMat : linkMat);
                group.add(line);
                disposables.push(geo);
            }
        });
    });

    // --- 3. Propagation Pulses ---
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    // Initialize off-screen
    for(let i=0; i<pCount; i++) pPos[i*3+1] = -100;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0 });
    const pulses = new THREE.Points(pGeo, pMat);
    animatables.pulseParticles?.add(pulses);
    disposables.push(pGeo, pMat);

    // --- 4. Floor Grid ---
    const grid = new THREE.GridHelper(60, 60, 0x1e293b, 0x050a15);
    grid.position.y = -10;
    scene.add(grid);
    disposables.push(grid);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Node Animation
      animatables.nodeGroup?.children.forEach((mesh) => {
          const m = mesh as THREE.Mesh;
          // Floating
          m.position.y = m.userData.originalY + Math.sin(time * 2 + m.position.x) * 0.5;
          
          // Rotation
          m.rotation.y += 0.01;
          m.rotation.z += 0.005;

          // Pulse if failed
          const nodeData = nodes.find(n => n.id === m.userData.id);
          if (nodeData?.status === 'failed') {
              const scale = 1 + Math.sin(time * 10) * 0.1;
              m.scale.setScalar(scale);
          } else {
              m.scale.setScalar(1);
          }
      });

      // Propagation Animation (Simulated particles traveling)
      if (activeFailureNode && propagationLevel > 0) {
          redLight.intensity = 20 + Math.sin(time * 10) * 10;
          pMat.opacity = 0.8;
          pMat.color.setHex(0xff0055);
          
          // Simple visual of chaos spreading
          const positions = pulses.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<pCount; i++) {
              const t = (time * 0.5 + i * 0.01) % 1;
              // Expand from center/source approximately
              const angle = i * 0.5;
              const radius = t * 30 * propagationLevel;
              positions[i*3] = Math.cos(angle) * radius;
              positions[i*3+1] = Math.sin(time * 5 + i) * 2;
              positions[i*3+2] = Math.sin(angle) * radius;
          }
          pulses.geometry.attributes.position.needsUpdate = true;
      } else {
          redLight.intensity = 0;
          pMat.opacity = 0;
      }

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
      cancelAnimationFrame(animationId);
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      disposables.forEach(d => d?.dispose());
      renderer.dispose();
    };
  }, [nodes, activeFailureNode, propagationLevel]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
