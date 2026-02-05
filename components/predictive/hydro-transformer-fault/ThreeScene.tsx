
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformerFaultSceneProps } from './three-types';

export const TransformerFaultScene: React.FC<TransformerFaultSceneProps> = ({ 
  components,
  activeComponentId,
  onSelect,
  simulationProgress
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const groupsRef = useRef<THREE.Group[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050308, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(10, 8, 10);
    camera.lookAt(0, 1, 0);

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

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x06b6d4, 2, 20);
    blueLight.position.set(5, 5, 5);
    scene.add(blueLight);

    const magentaLight = new THREE.PointLight(0xd946ef, 2, 20);
    magentaLight.position.set(-5, 2, -5);
    scene.add(magentaLight);

    // --- Materials ---
    const ghostMat = new THREE.MeshPhysicalMaterial({
        color: 0x334155,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.9, // Very transparent
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
    });

    const wireMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.3 });

    const solidMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.6,
        roughness: 0.4,
        transparent: true,
        opacity: 0.8
    });

    const highlightMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2
    });

    const riskMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xef4444,
        emissiveIntensity: 0.5,
        metalness: 0.5,
        roughness: 0.5
    });

    // --- Geometry Construction ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    groupsRef.current = [];

    const createComponent = (id: string, geo: THREE.BufferGeometry, pos: THREE.Vector3, rot?: THREE.Euler) => {
        const group = new THREE.Group();
        group.userData = { id, basePos: pos.clone() };
        
        const mesh = new THREE.Mesh(geo, solidMat.clone());
        mesh.name = "mesh";
        group.add(mesh);

        // Wireframe overlay for tech look
        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, wireMat);
        group.add(line);

        group.position.copy(pos);
        if (rot) group.rotation.copy(rot);

        mainGroup.add(group);
        groupsRef.current.push(group);
    };

    // 1. Tank (The container, ghosted)
    const tankGeo = new THREE.BoxGeometry(5, 4, 3);
    const tank = new THREE.Mesh(tankGeo, ghostMat);
    tank.position.y = 2;
    mainGroup.add(tank);
    // Wireframe for tank
    const tankEdges = new THREE.EdgesGeometry(tankGeo);
    const tankLine = new THREE.LineSegments(tankEdges, new THREE.LineBasicMaterial({ color: 0x06b6d4, opacity: 0.2, transparent: true }));
    tankLine.position.y = 2;
    mainGroup.add(tankLine);

    // 2. Internal Components (The focus)
    
    // Core & Windings
    const windingGeo = new THREE.CylinderGeometry(0.8, 0.8, 3, 32);
    createComponent('winding-a', windingGeo, new THREE.Vector3(-1.2, 2, 0));
    createComponent('winding-b', windingGeo, new THREE.Vector3(0, 2, 0));
    createComponent('winding-c', windingGeo, new THREE.Vector3(1.2, 2, 0));

    // Bushings
    const bushGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 16);
    createComponent('bushing-hv', bushGeo, new THREE.Vector3(0, 4.5, 0.5));
    
    // OLTC (On-Load Tap Changer)
    const oltcGeo = new THREE.BoxGeometry(1, 3, 1);
    createComponent('oltc', oltcGeo, new THREE.Vector3(2.8, 2, 0));

    // Core Frame
    const coreGeo = new THREE.BoxGeometry(4, 3.2, 0.5);
    createComponent('core', coreGeo, new THREE.Vector3(0, 2, -0.8));

    // 3. Probability Cloud (Particle System)
    const pCount = 2000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pSizes = new Float32Array(pCount);
    
    // Initialize particles randomly within tank volume
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 5;
        pPos[i*3+1] = (Math.random() - 0.5) * 4 + 2;
        pPos[i*3+2] = (Math.random() - 0.5) * 3;
        pSizes[i] = 0; // Start hidden
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));
    
    const pMat = new THREE.PointsMaterial({
        color: 0xffffff,
        vertexColors: true,
        size: 0.1,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    // Create color attribute
    const pColors = new Float32Array(pCount * 3);
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const particles = new THREE.Points(pGeo, pMat);
    particlesRef.current = particles;
    scene.add(particles);

    // --- Interaction ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e: MouseEvent) => {
        const rect = mountRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        // Check intersections with component groups
        // We need to raycast against children meshes
        const meshes: THREE.Object3D[] = [];
        groupsRef.current.forEach(g => meshes.push(...g.children));
        
        const hits = raycaster.intersectObjects(meshes);
        if (hits.length > 0) {
            // Find parent group
            let target = hits[0].object;
            while(target.parent && target.parent !== mainGroup) {
                target = target.parent;
            }
            if (target.userData.id) onSelect(target.userData.id);
        } else {
            onSelect('');
        }
    };
    mountRef.current.addEventListener('click', onClick);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 1. Update Components visual state based on Probability
      groupsRef.current.forEach(group => {
          const { id } = group.userData;
          const data = components.find(c => c.id === id);
          const mesh = group.getObjectByName('mesh') as THREE.Mesh;
          
          if (!data || !mesh) return;

          const isSelected = activeComponentId === id;
          const isHighRisk = data.probability > 70;

          if (isSelected) {
              mesh.material = highlightMat;
          } else if (isHighRisk) {
              mesh.material = riskMat;
              // Pulse effect
              (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.3;
          } else {
              mesh.material = solidMat;
          }
      });

      // 2. Update Particles (Probability Cloud)
      if (particlesRef.current) {
          const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
          const colors = particlesRef.current.geometry.attributes.color.array as Float32Array;
          const sizes = particlesRef.current.geometry.attributes.size.array as Float32Array;
          
          // Map simulationProgress to turbulence/visibility
          const intensity = simulationProgress * 0.8 + 0.2;

          for(let i=0; i<pCount; i++) {
              // Basic movement
              positions[i*3+1] += Math.sin(time + positions[i*3]) * 0.01 * intensity;
              
              // Find closest component
              // Simplified: concentrate around high risk components
              const highRiskComp = components.find(c => c.probability > 60);
              if (highRiskComp) {
                 // Move particles towards high risk area slightly
              }

              // Color based on risk context (simulated here with random)
              // If simProgress is high, make more red particles
              const isRisk = i < pCount * simulationProgress && Math.random() > 0.5;
              
              colors[i*3] = 1; // R
              colors[i*3+1] = isRisk ? 0 : 0.5; // G (Red if risk)
              colors[i*3+2] = isRisk ? 0 : 1; // B (Magenta or Red)

              sizes[i] = isRisk ? 0.15 : 0; // Only show 'active' risk particles
          }
          
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
          particlesRef.current.geometry.attributes.color.needsUpdate = true;
          particlesRef.current.geometry.attributes.size.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && renderer && camera) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeEventListener('click', onClick);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [components, activeComponentId, simulationProgress]);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};
