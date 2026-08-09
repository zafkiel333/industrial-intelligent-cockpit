
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FleetAnimatables, FleetViewMode } from './three-types';

interface ThreeSceneProps {
  correlationStrength?: number; // 0-1
  activeAlerts?: number;
  viewMode?: FleetViewMode;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ 
  correlationStrength = 0.5,
  activeAlerts = 3,
  viewMode = 'geo-distribution'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    console.log("===mining-ship-joint-failure useEffect===");

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020208);
    scene.fog = new THREE.FogExp2(0x020208, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 25);

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
    controls.autoRotateSpeed = 0.8;

    // --- 宇宙级光影 ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const sunLight = new THREE.DirectionalLight(0xa78bfa, 2);
    sunLight.position.set(50, 20, 30);
    scene.add(sunLight);

    const pointLight = new THREE.PointLight(0x22d3ee, 5, 50);
    pointLight.position.set(-10, 10, 10);
    scene.add(pointLight);

    const group = new THREE.Group();
    scene.add(group);

    const animatables: FleetAnimatables = {};
    const disposables: any[] = [];

    // --- 1. 全息地球 (Holographic Globe) ---
    const globeGroup = new THREE.Group();
    group.add(globeGroup);
    animatables.globe = globeGroup;

    // 经纬线网格球
    const sphereGeo = new THREE.IcosahedronGeometry(8, 3);
    const wireMat = new THREE.MeshBasicMaterial({ 
        color: 0x1e3a8a, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.15 
    });
    const wireGlobe = new THREE.Mesh(sphereGeo, wireMat);
    globeGroup.add(wireGlobe);
    disposables.push(sphereGeo, wireMat);

    // 核心实体球 (深色遮挡)
    const coreGeo = new THREE.SphereGeometry(7.9, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x02040a });
    const coreGlobe = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreGlobe);
    disposables.push(coreGeo, coreMat);

    // 大气层光晕
    const atmoGeo = new THREE.SphereGeometry(8.5, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
        color: 0x4c1d95,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmosphere);
    animatables.atmosphere = atmosphere;
    disposables.push(atmoGeo, atmoMat);

    // --- 2. 舰队节点 (Ship Nodes) ---
    const shipsGroup = new THREE.Group();
    globeGroup.add(shipsGroup);
    animatables.shipMarkers = shipsGroup;

    const shipPositions = [];
    const shipCount = 15;
    const shipGeo = new THREE.OctahedronGeometry(0.3, 0);
    
    for(let i=0; i<shipCount; i++) {
        // Random distribution on sphere surface
        const phi = Math.acos(-1 + (2 * i) / shipCount);
        const theta = Math.sqrt(shipCount * Math.PI) * phi;
        const r = 8.2;
        
        const x = r * Math.cos(theta) * Math.sin(phi);
        const y = r * Math.sin(theta) * Math.sin(phi);
        const z = r * Math.cos(phi);
        
        shipPositions.push(new THREE.Vector3(x, y, z));

        const isAlert = i < activeAlerts;
        const shipMat = new THREE.MeshBasicMaterial({ 
            color: isAlert ? 0xf43f5e : 0x22d3ee,
            wireframe: true
        });
        const ship = new THREE.Mesh(shipGeo, shipMat);
        ship.position.set(x, y, z);
        ship.lookAt(0, 0, 0);
        shipsGroup.add(ship);
        
        // 选中/报警光环
        if (isAlert) {
            const ringGeo = new THREE.RingGeometry(0.4, 0.5, 16);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.set(x, y, z);
            ring.lookAt(0, 0, 0);
            shipsGroup.add(ring);
        }
    }
    disposables.push(shipGeo);

    // --- 3. 关联连线 (Correlation Lines) ---
    const lineGroup = new THREE.Group();
    globeGroup.add(lineGroup);
    animatables.connectionLines = lineGroup;

    const lineMat = new THREE.LineBasicMaterial({ 
        color: 0x8b5cf6, 
        transparent: true, 
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    });

    // Create connections between some ships (simulating correlation)
    const lineGeo = new THREE.BufferGeometry();
    const points = [];
    
    // Connect first few ships (representing a cluster of similar failures)
    for(let i=0; i<Math.min(shipCount, 6); i++) {
        for(let j=i+1; j<Math.min(shipCount, 6); j++) {
            // Bezier curve points for arc effect could be complex, using straight lines for simplicity in this context
            // or simple subdivision for curve
            const p1 = shipPositions[i];
            const p2 = shipPositions[j];
            
            // Midpoint elevated
            const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(10 + correlationStrength * 2);
            
            const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
            points.push(...curve.getPoints(10));
        }
    }
    lineGeo.setFromPoints(points);
    const connections = new THREE.LineSegments(lineGeo, lineMat);
    lineGroup.add(connections);
    disposables.push(lineGeo, lineMat);

    // --- 4. 数据传输粒子 (Data Flow) ---
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    // Init on lines
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = 0; pPos[i*3+1] = 0; pPos[i*3+2] = 0; // Temp placeholder
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.8 });
    const dataFlow = new THREE.Points(pGeo, pMat);
    globeGroup.add(dataFlow);
    animatables.dataParticles = dataFlow;
    disposables.push(pGeo, pMat);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // 地球自转
      // controls autoRotate handles camera, we can also rotate group slowly
      // globeGroup.rotation.y += 0.001;

      // 连线脉动
      if (animatables.connectionLines) {
          lineMat.opacity = 0.2 + Math.sin(time * 3) * 0.1 * correlationStrength;
      }

      // 粒子沿连线运动
      if (animatables.dataParticles && points.length > 0) {
          const positions = animatables.dataParticles.geometry.attributes.position.array as Float32Array;
          const totalPoints = points.length;
          
          for(let i=0; i<pCount; i++) {
              // Map each particle to a position on the lines
              // Simple simulation: just cycling through points array indices
              const index = Math.floor((time * 20 + i * (totalPoints/pCount))) % totalPoints;
              const pt = points[index];
              positions[i*3] = pt.x;
              positions[i*3+1] = pt.y;
              positions[i*3+2] = pt.z;
          }
          animatables.dataParticles.geometry.attributes.position.needsUpdate = true;
      }

      // 大气层呼吸
      if (animatables.atmosphere) {
          const scale = 1 + Math.sin(time * 0.5) * 0.02;
          animatables.atmosphere.scale.setScalar(scale);
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
  }, [correlationStrength, activeAlerts, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
