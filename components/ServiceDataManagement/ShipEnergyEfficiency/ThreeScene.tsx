
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShipEfficiencyProps, EfficiencyNode } from './three-types';

export const ShipEnergyEfficiencyThreeScene: React.FC<ShipEfficiencyProps> = ({ 
  activeNodeId, onNodeSelect, trimAngle, whrsActive 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const nodes: EfficiencyNode[] = [
    { id: 'main-engine', name: '主机做功', type: 'consumer', efficiency: 52, energyFlow: 12500, position: [-2, 0, 0], status: 'optimal' },
    { id: 'propeller', name: '推进效率', type: 'consumer', efficiency: 68, energyFlow: 8500, position: [8, -2, 0], status: 'loss' },
    { id: 'whrs', name: '余热回收系统', type: 'recovery', efficiency: 95, energyFlow: 1200, position: [-4, 3, 0], status: 'harvesting' },
    { id: 'hull-res', name: '船体阻力', type: 'resistance', efficiency: 88, energyFlow: 0, position: [10, 0, 0], status: 'loss' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020905, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 10, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x10b981, 0.3);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);
    const orangeLight = new THREE.PointLight(0xf97316, 2, 50);
    orangeLight.position.set(-5, 5, 0);
    scene.add(orangeLight);

    // Ship Group
    const shipGroup = new THREE.Group();
    scene.add(shipGroup);

    // Wireframe Hull
    const hullShape = new THREE.Shape();
    hullShape.moveTo(-12, 4);
    hullShape.lineTo(8, 4); // Deck
    hullShape.bezierCurveTo(12, 4, 14, 0, 12, -4); // Bow
    hullShape.lineTo(-10, -4); // Bottom
    hullShape.lineTo(-12, 4); // Stern
    
    const extrudeSettings = { depth: 6, bevelEnabled: false, curveSegments: 32 };
    const hullGeo = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
    const hullMat = new THREE.MeshBasicMaterial({ 
      color: 0x059669, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.15 
    });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.z = -3;
    shipGroup.add(hull);

    // Water Surface
    const waterGeo = new THREE.PlaneGeometry(100, 100, 30, 30);
    const waterMat = new THREE.MeshBasicMaterial({ color: 0x064e3b, wireframe: true, transparent: true, opacity: 0.1 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -2;
    scene.add(water);

    // Energy Flow Particles
    const particles = new THREE.Group();
    shipGroup.add(particles);

    // 1. Fuel to Engine (Green)
    const fuelPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8, -3, 0),
      new THREE.Vector3(-2, 0, 0)
    ]);
    
    // 2. Engine to Propeller (Blue - Mechanical)
    const mechPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2, 0, 0),
      new THREE.Vector3(8, -2, 0)
    ]);

    // 3. Engine to WHRS (Orange - Heat)
    const heatPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2, 0, 0),
      new THREE.Vector3(-4, 3, 0),
      new THREE.Vector3(-6, 5, 0) // Exhaust
    ]);

    const createFlow = (path: THREE.Curve<THREE.Vector3>, color: number, count: number, speed: number) => {
        const geo = new THREE.BufferGeometry();
        const pos = [];
        for(let i=0; i<count; i++) pos.push(0,0,0);
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ color, size: 0.2, transparent: true });
        const points = new THREE.Points(geo, mat);
        
        const progress = Float32Array.from({length: count}, (_, i) => i/count);
        points.userData = { path, progress, speed };
        return points;
    };

    const fuelFlow = createFlow(fuelPath, 0x10b981, 20, 0.005);
    particles.add(fuelFlow);

    const mechFlow = createFlow(mechPath, 0x3b82f6, 30, 0.008);
    particles.add(mechFlow);

    if (whrsActive) {
        const heatFlow = createFlow(heatPath, 0xf97316, 25, 0.006);
        particles.add(heatFlow);
    }

    // Nodes
    const nodeMeshes: THREE.Mesh[] = [];
    nodes.forEach(node => {
        const geo = new THREE.OctahedronGeometry(0.6);
        const mat = new THREE.MeshBasicMaterial({ 
            color: node.status === 'loss' ? 0xef4444 : node.status === 'harvesting' ? 0xf97316 : 0x10b981,
            wireframe: true
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...node.position);
        mesh.userData = { id: node.id };
        shipGroup.add(mesh);
        nodeMeshes.push(mesh);

        // Glow
        const glowGeo = new THREE.SphereGeometry(0.8, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({ 
            color: mat.color, 
            transparent: true, 
            opacity: 0.2 
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        mesh.add(glow);
    });

    // Hull Resistance Lines (Streamlines)
    const streamlines = new THREE.Group();
    for(let i=0; i<5; i++) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(14, -3 + i, 2),
            new THREE.Vector3(8, -3 + i, 2.5),
            new THREE.Vector3(0, -3 + i, 2.8),
            new THREE.Vector3(-8, -3 + i, 2.5),
            new THREE.Vector3(-14, -3 + i, 1)
        ]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.2 });
        const line = new THREE.Line(lineGeo, lineMat);
        streamlines.add(line);
    }
    shipGroup.add(streamlines);


    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        onNodeSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Trim Animation
      shipGroup.rotation.z = THREE.MathUtils.degToRad(trimAngle);

      // Particle Flow Animation
      particles.children.forEach((p: any) => {
          const positions = p.geometry.attributes.position.array;
          const path = p.userData.path;
          const speed = p.userData.speed;
          
          for(let i=0; i<p.userData.progress.length; i++) {
              p.userData.progress[i] += speed;
              if(p.userData.progress[i] > 1) p.userData.progress[i] = 0;
              
              const point = path.getPoint(p.userData.progress[i]);
              positions[i*3] = point.x;
              positions[i*3+1] = point.y;
              positions[i*3+2] = point.z;
          }
          p.geometry.attributes.position.needsUpdate = true;
      });

      // Node Animation
      nodeMeshes.forEach(mesh => {
          mesh.rotation.y += 0.02;
          if (mesh.userData.id === activeNodeId) {
              mesh.scale.setScalar(1.5);
          } else {
              mesh.scale.setScalar(1);
          }
      });

      // Streamline Animation
      streamlines.position.x = Math.sin(Date.now() * 0.001) * 0.5;

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
  }, [activeNodeId, trimAngle, whrsActive]);

  return <div ref={mountRef} className="w-full h-full relative cursor-crosshair" />;
};
