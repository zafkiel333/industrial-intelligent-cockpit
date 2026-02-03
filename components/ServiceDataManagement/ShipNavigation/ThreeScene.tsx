
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShipNavProps, NavNode } from './three-types';

export const ShipNavigationThreeScene: React.FC<ShipNavProps> = ({ 
  heading, speed, roll, pitch, rudderAngle, activeNodeId, onNodeSelect 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const nodes: NavNode[] = [
    { id: 'wind-vec', type: 'vector', position: [5, 10, 5], label: '相对风速', value: '12.5', unit: 'm/s', vectorDir: new THREE.Vector3(-1, 0, -0.5), color: '#06b6d4' },
    { id: 'curr-vec', type: 'vector', position: [8, 0, 8], label: '洋流流速', value: '1.2', unit: 'kn', vectorDir: new THREE.Vector3(0.5, 0, -1), color: '#3b82f6' },
    { id: 'prop-sens', type: 'sensor', position: [0, -2, 12], label: '轴功率计', value: '18500', unit: 'kW', color: '#f59e0b' },
    { id: 'bow-sens', type: 'sensor', position: [0, 2, -15], label: '船首加速度', value: '0.05', unit: 'g', color: '#10b981' }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    // Use a fog to simulate sea distance
    scene.fog = new THREE.FogExp2(0x020617, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below water

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffd700, 2);
    sunLight.position.set(50, 50, -50);
    scene.add(sunLight);
    const blueLight = new THREE.PointLight(0x0ea5e9, 1, 50);
    blueLight.position.set(0, 10, 0);
    scene.add(blueLight);

    // Ocean Grid (Dynamic)
    const gridGeo = new THREE.PlaneGeometry(200, 200, 40, 40);
    const gridMat = new THREE.MeshBasicMaterial({ 
      color: 0x0ea5e9, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.15 
    });
    const oceanGrid = new THREE.Mesh(gridGeo, gridMat);
    oceanGrid.rotation.x = -Math.PI / 2;
    scene.add(oceanGrid);

    // Ship Group (Target for rotation)
    const shipGroup = new THREE.Group();
    scene.add(shipGroup);

    // Construct Low-Poly Ship
    const hullMat = new THREE.MeshPhongMaterial({ color: 0x1e293b, flatShading: true, shininess: 80 });
    const deckMat = new THREE.MeshPhongMaterial({ color: 0x334155 });
    const accentMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Anti-fouling paint

    // Hull
    const hullGeo = new THREE.BufferGeometry();
    // Simplified hull vertices logic
    const hullShape = new THREE.Shape();
    hullShape.moveTo(0, -15);
    hullShape.lineTo(4, -5);
    hullShape.lineTo(4, 10);
    hullShape.lineTo(0, 12); // Bow
    hullShape.lineTo(-4, 10);
    hullShape.lineTo(-4, -5);
    hullShape.lineTo(0, -15); // Stern
    const hullExtrude = new THREE.ExtrudeGeometry(hullShape, { depth: 5, bevelEnabled: false });
    const hull = new THREE.Mesh(hullExtrude, hullMat);
    hull.rotation.x = Math.PI / 2;
    hull.position.y = 2.5;
    shipGroup.add(hull);

    // Underwater Hull
    const underHull = hull.clone();
    underHull.scale.set(0.95, 0.95, 0.5);
    underHull.position.y = -0.5;
    underHull.material = accentMat;
    shipGroup.add(underHull);

    // Bridge / Superstructure
    const bridgeGeo = new THREE.BoxGeometry(7, 6, 4);
    const bridge = new THREE.Mesh(bridgeGeo, deckMat);
    bridge.position.set(0, 5.5, -8);
    shipGroup.add(bridge);

    const funnelGeo = new THREE.CylinderGeometry(1, 1.5, 4, 8);
    const funnel = new THREE.Mesh(funnelGeo, new THREE.MeshPhongMaterial({ color: 0xffffff }));
    funnel.position.set(0, 8, -11);
    // Funnel tilt
    funnel.rotation.x = -0.2;
    shipGroup.add(funnel);

    // Wake Particles
    const particleCount = 200;
    const particles = new THREE.Group();
    scene.add(particles);
    const particleGeo = new THREE.PlaneGeometry(0.5, 0.5);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    
    for(let i=0; i<particleCount; i++) {
        const p = new THREE.Mesh(particleGeo, particleMat);
        p.rotation.x = -Math.PI/2;
        p.position.set((Math.random()-0.5)*10, 0.1, 15 + Math.random()*30);
        p.userData = { speed: 0.2 + Math.random()*0.3, offset: Math.random()*100 };
        particles.add(p);
    }

    // Vectors and Sensors
    const interactiveObjects: THREE.Object3D[] = [];
    nodes.forEach(node => {
        if (node.type === 'vector' && node.vectorDir) {
            const arrowLen = 8;
            const arrowColor = new THREE.Color(node.color);
            const arrowHelper = new THREE.ArrowHelper(node.vectorDir.normalize(), new THREE.Vector3(...node.position), arrowLen, arrowColor, 1.5, 1);
            // Make arrow thicker visually by adding a transparent cylinder around it for clicking
            const hitBox = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, arrowLen, 8), new THREE.MeshBasicMaterial({visible: false}));
            hitBox.position.copy(arrowHelper.position).add(node.vectorDir.clone().multiplyScalar(arrowLen/2));
            hitBox.quaternion.copy(arrowHelper.quaternion);
            hitBox.rotation.x = -Math.PI/2; // Adjust for arrowhelper orientation
            hitBox.userData = { id: node.id };
            
            scene.add(arrowHelper);
            // We can't easily click arrow helpers, so we use the hitBox trick or just click nearby
            // For simplicity in this demo, let's add a sphere at the base
            const baseSphere = new THREE.Mesh(new THREE.SphereGeometry(0.8), new THREE.MeshBasicMaterial({color: node.color}));
            baseSphere.position.set(...node.position);
            baseSphere.userData = { id: node.id };
            shipGroup.add(baseSphere); // Attach to ship so it moves with it? Vectors usually relative to ship in this view
            interactiveObjects.push(baseSphere);
        } else {
            // Sensor point
            const geo = new THREE.OctahedronGeometry(0.6);
            const mat = new THREE.MeshBasicMaterial({ color: node.color, wireframe: true });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(...node.position);
            mesh.userData = { id: node.id };
            shipGroup.add(mesh);
            interactiveObjects.push(mesh);

            // Pulse effect
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(0.8, 1, 16),
                new THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
            );
            ring.position.set(...node.position);
            ring.lookAt(new THREE.Vector3(node.position[0]+1, node.position[1], node.position[2])); // Just orient somehow
            shipGroup.add(ring);
        }
    });

    // Interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects);
      if (intersects.length > 0) {
        onNodeSelect?.(intersects[0].object.userData.id);
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Ship Motion Simulation
      // Roll
      shipGroup.rotation.z = Math.sin(time * 0.8) * (roll * Math.PI / 180);
      // Pitch
      shipGroup.rotation.x = Math.sin(time * 0.5) * (pitch * Math.PI / 180);
      
      // Rudder visualization (if we had a rudder mesh)
      
      // Wake animation
      particles.children.forEach((p: any) => {
          p.position.z += p.userData.speed * (speed / 10); // Speed factor
          p.scale.setScalar(1 + (p.position.z - 15) / 20);
          p.material.opacity = 0.4 * (1 - (p.position.z - 15) / 40);
          if (p.position.z > 60) {
              p.position.z = 15;
              p.scale.setScalar(1);
              p.material.opacity = 0.4;
          }
      });

      // Ocean Grid movement
      oceanGrid.position.z = (time * speed * 2) % 10; 

      // Interactive object animations
      interactiveObjects.forEach(obj => {
          obj.rotation.y += 0.02;
          if (obj.userData.id === activeNodeId) {
              const s = 1.5 + Math.sin(time * 5) * 0.2;
              obj.scale.set(s,s,s);
          } else {
              obj.scale.set(1,1,1);
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
  }, [activeNodeId]);

  return <div ref={mountRef} className="w-full h-full relative cursor-crosshair" />;
};
