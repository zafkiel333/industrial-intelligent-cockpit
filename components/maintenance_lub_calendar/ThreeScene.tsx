import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LubThreeProps, LubPoint } from './three-types';

export const LubCalendarThreeScene: React.FC<LubThreeProps> = ({ 
  points, 
  activeTaskId, 
  flowSpeed 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.03);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(8, 8, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- Scene Objects ---

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Distributor Block (Manifold)
    const manifoldGeo = new THREE.CylinderGeometry(2, 2, 1.5, 8);
    const manifoldMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      roughness: 0.2, 
      metalness: 0.8 
    });
    const manifold = new THREE.Mesh(manifoldGeo, manifoldMat);
    mainGroup.add(manifold);

    // Top Cap (Reservoir connection)
    const capGeo = new THREE.CylinderGeometry(1, 1, 0.5, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.2 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 1;
    mainGroup.add(cap);

    // 2. Pipes & Flow Particles
    const particlesData: { mesh: THREE.Mesh, path: THREE.CatmullRomCurve3, speed: number, t: number, active: boolean }[] = [];

    points.forEach((pt, idx) => {
      const isActive = pt.id === activeTaskId;
      const pipeColor = isActive ? 0xf59e0b : 0x475569;
      
      // Convert arrays to Vector3
      const vectors = pt.pipePath.map(p => new THREE.Vector3(...p));
      const curve = new THREE.CatmullRomCurve3(vectors);
      
      // Tube
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.15, 8, false);
      const tubeMat = new THREE.MeshPhysicalMaterial({ 
        color: pipeColor, 
        metalness: 0.5, 
        roughness: 0.1,
        transparent: true,
        opacity: 0.7,
        emissive: isActive ? 0xf59e0b : 0x000000,
        emissiveIntensity: isActive ? 0.5 : 0
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      mainGroup.add(tube);

      // Nozzle at end
      const nozzleGeo = new THREE.ConeGeometry(0.3, 0.5, 16);
      const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
      const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
      const endPoint = vectors[vectors.length - 1];
      nozzle.position.copy(endPoint);
      // Look at previous point roughly
      nozzle.lookAt(vectors[vectors.length - 2]);
      mainGroup.add(nozzle);

      // Flow Particles (Oil droplets)
      const pCount = 5;
      for(let i=0; i<pCount; i++) {
        const pGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
        const particle = new THREE.Mesh(pGeo, pMat);
        mainGroup.add(particle);
        
        particlesData.push({
          mesh: particle,
          path: curve,
          speed: 0.002 + Math.random() * 0.002, // Base speed
          t: i / pCount, // Distribute along path
          active: isActive
        });
      }
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);
    
    // Amber glow for oil feel
    const pointLight = new THREE.PointLight(0xf59e0b, 2, 20);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // Floor Grid
    const grid = new THREE.GridHelper(20, 20, 0x1e293b, 0x0f172a);
    grid.position.y = -3;
    scene.add(grid);

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update Particles
      particlesData.forEach(p => {
        // If active task, speed up significantly
        const currentSpeed = (p.active ? p.speed * 5 : p.speed) * (flowSpeed > 0 ? 1 : 0);
        
        p.t += currentSpeed;
        if (p.t > 1) p.t = 0;

        const pos = p.path.getPointAt(p.t);
        p.mesh.position.copy(pos);
        
        // Scale pulse if active
        if (p.active) {
            p.mesh.scale.setScalar(1.5);
            (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xffffff); // White hot
        } else {
            p.mesh.scale.setScalar(1);
            (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xf59e0b); // Gold
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
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [points, activeTaskId, flowSpeed]);

  return <div ref={mountRef} className="w-full h-full" />;
};