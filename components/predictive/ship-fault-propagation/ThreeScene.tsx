
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PropagationAnimatables, SystemNode, SimStatus } from './three-types';

interface ThreeSceneProps {
  nodes: SystemNode[];
  activeFaultNode: string | null;
  propagationTime: number; // 0 to 1
  simStatus: SimStatus;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  nodes, 
  activeFaultNode, 
  propagationTime,
  simStatus 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 20, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const redLight = new THREE.PointLight(0xff0044, 0, 50);
    redLight.position.set(0, 5, 0);
    scene.add(redLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: PropagationAnimatables = { 
        nodeGroup: new THREE.Group(), 
        linkGroup: new THREE.Group(),
        pulseParticles: new THREE.Group(),
        impactWaves: new THREE.Group()
    };
    
    group.add(animatables.linkGroup!);
    group.add(animatables.nodeGroup!);
    group.add(animatables.pulseParticles!);
    group.add(animatables.impactWaves!);

    const disposables: any[] = [];

    // --- 1. Nodes ---
    const nodeGeo = new THREE.OctahedronGeometry(1.5, 0);
    const nodeMatNormal = new THREE.MeshStandardMaterial({ 
        color: 0x0ea5e9, 
        emissive: 0x0ea5e9, 
        emissiveIntensity: 0.5,
        wireframe: true
    });
    const nodeMatCritical = new THREE.MeshStandardMaterial({ 
        color: 0xff0044, 
        emissive: 0xff0000, 
        emissiveIntensity: 2.0,
        wireframe: false
    });
    const nodeMatWarning = new THREE.MeshStandardMaterial({ 
        color: 0xf59e0b, 
        emissive: 0xf59e0b, 
        emissiveIntensity: 1.0,
        wireframe: true
    });

    const nodeMeshes = new Map<string, THREE.Mesh>();

    nodes.forEach(node => {
        let mat = nodeMatNormal;
        if (node.status === 'critical') mat = nodeMatCritical;
        if (node.status === 'warning') mat = nodeMatWarning;

        const mesh = new THREE.Mesh(nodeGeo, mat.clone());
        // Handle POJO position from JSON
        mesh.position.set(node.position.x, node.position.y, node.position.z);
        
        // Store original position as a real Vector3 for animation reference
        mesh.userData = { 
          id: node.id, 
          originalPos: new THREE.Vector3(node.position.x, node.position.y, node.position.z) 
        };
        
        // Label Ring
        const ringGeo = new THREE.RingGeometry(2.0, 2.1, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: mat.color, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.lookAt(camera.position);
        mesh.add(ring);

        animatables.nodeGroup?.add(mesh);
        nodeMeshes.set(node.id, mesh);
        disposables.push(ringGeo, ringMat);
    });
    disposables.push(nodeGeo, nodeMatNormal, nodeMatCritical, nodeMatWarning);

    // --- 2. Links ---
    const linkMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.3 });
    const linkMatActive = new THREE.LineBasicMaterial({ color: 0xff0044, transparent: true, opacity: 0.8 });

    nodes.forEach(source => {
        source.connections.forEach(targetId => {
            const targetMesh = nodeMeshes.get(targetId);
            if (targetMesh) {
                // Ensure we use Vector3s
                const sourcePos = new THREE.Vector3(source.position.x, source.position.y, source.position.z);
                const points = [sourcePos, targetMesh.position];
                const geo = new THREE.BufferGeometry().setFromPoints(points);
                const isActive = source.status === 'critical' || source.status === 'warning';
                const line = new THREE.Line(geo, isActive ? linkMatActive : linkMat);
                animatables.linkGroup?.add(line);
                disposables.push(geo);
            }
        });
    });
    disposables.push(linkMat, linkMatActive);

    // --- 3. Particles (Fault Pulses) ---
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    // Init off-screen
    for(let i=0; i<pCount; i++) pPos[i*3] = 9999;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffaaaa, size: 0.3, transparent: true, opacity: 0.8 });
    const particles = new THREE.Points(pGeo, pMat);
    animatables.pulseParticles?.add(particles);
    disposables.push(pGeo, pMat);

    // --- 4. Grid Floor ---
    const grid = new THREE.GridHelper(80, 80, 0x1e293b, 0x050b16);
    grid.position.y = -10;
    scene.add(grid);
    disposables.push(grid);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Node Animation
      nodeMeshes.forEach((mesh, id) => {
          const node = nodes.find(n => n.id === id);
          
          // Rotation
          mesh.rotation.y += 0.01;
          mesh.rotation.z += 0.01;
          
          // Labels face camera
          mesh.children[0].lookAt(camera.position);

          if (node?.status === 'critical') {
              // Shake effect
              mesh.position.x = mesh.userData.originalPos.x + (Math.random() - 0.5) * 0.2;
              mesh.position.y = mesh.userData.originalPos.y + (Math.random() - 0.5) * 0.2;
              mesh.position.z = mesh.userData.originalPos.z + (Math.random() - 0.5) * 0.2;
              // Scale Pulse
              mesh.scale.setScalar(1 + Math.sin(time * 10) * 0.2);
              redLight.intensity = 10 + Math.sin(time * 10) * 5;
          } else if (node?.status === 'warning') {
              mesh.scale.setScalar(1 + Math.sin(time * 5) * 0.1);
          } else {
              mesh.position.y = mesh.userData.originalPos.y + Math.sin(time + mesh.position.x) * 0.5;
          }
      });

      // Pulse Particles along links
      if (simStatus === 'propagating') {
           const positions = particles.geometry.attributes.position.array as Float32Array;
           let idx = 0;
           
           nodes.forEach(source => {
               if (source.status === 'critical' || source.status === 'warning') {
                   source.connections.forEach(targetId => {
                       const targetMesh = nodeMeshes.get(targetId);
                       if (targetMesh) {
                           // Generate particles along this line
                           const sourcePos = new THREE.Vector3(source.position.x, source.position.y, source.position.z);
                           const dist = sourcePos.distanceTo(targetMesh.position);
                           const speed = 10; // units per sec
                           const countPerLine = 10;
                           
                           for(let i=0; i<countPerLine; i++) {
                               if (idx >= pCount) break;
                               
                               const t = ((time * speed) + i * (dist/countPerLine)) % dist;
                               const alpha = t / dist;
                               
                               const x = THREE.MathUtils.lerp(sourcePos.x, targetMesh.position.x, alpha);
                               const y = THREE.MathUtils.lerp(sourcePos.y, targetMesh.position.y, alpha);
                               const z = THREE.MathUtils.lerp(sourcePos.z, targetMesh.position.z, alpha);
                               
                               positions[idx*3] = x;
                               positions[idx*3+1] = y;
                               positions[idx*3+2] = z;
                               idx++;
                           }
                       }
                   });
               }
           });
           
           // Hide unused
           for(let i=idx; i<pCount; i++) {
               positions[i*3] = 9999;
           }
           particles.geometry.attributes.position.needsUpdate = true;
      } else {
           const positions = particles.geometry.attributes.position.array as Float32Array;
           for(let i=0; i<pCount; i++) positions[i*3] = 9999;
           particles.geometry.attributes.position.needsUpdate = true;
           redLight.intensity = 0;
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
  }, [nodes, activeFaultNode, propagationTime, simStatus]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
