import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PortEvacSimulationProps } from './three-types';

export const ThreeScene: React.FC<PortEvacSimulationProps> = ({ alertLevel, evacProgress }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ alertLevel, evacProgress });

  useEffect(() => {
    propsRef.current = { alertLevel, evacProgress };
  }, [alertLevel, evacProgress]);

  useEffect(() => {
    if (!mountRef.current) return;
    
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 40, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Warning light
    const warningLight = new THREE.PointLight(0xff0000, 0, 100);
    warningLight.position.set(0, 20, 0);
    scene.add(warningLight);

    // City/Port layout
    const gridHelper = new THREE.GridHelper(60, 60, 0x334155, 0x1e293b);
    scene.add(gridHelper);

    // Buildings
    const buildings = new THREE.Group();
    const bGeo = new THREE.BoxGeometry(2, 1, 2);
    const bMat = new THREE.MeshPhongMaterial({ color: '#475569' });
    for(let i=0; i<20; i++) {
      const b = new THREE.Mesh(bGeo, bMat);
      b.position.set((Math.random() - 0.5) * 40, 0.5, (Math.random() - 0.5) * 40);
      b.scale.y = Math.random() * 5 + 1;
      b.position.y = b.scale.y / 2;
      buildings.add(b);
    }
    scene.add(buildings);

    // Evacuation Routes (Lines)
    const routeMat = new THREE.LineBasicMaterial({ color: '#10b981', linewidth: 2 });
    const routes = new THREE.Group();
    const points1 = [new THREE.Vector3(-20, 0.1, -20), new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(20, 0.1, 20)];
    const geo1 = new THREE.BufferGeometry().setFromPoints(points1);
    routes.add(new THREE.Line(geo1, routeMat));
    const points2 = [new THREE.Vector3(20, 0.1, -20), new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(-20, 0.1, 20)];
    const geo2 = new THREE.BufferGeometry().setFromPoints(points2);
    routes.add(new THREE.Line(geo2, routeMat));
    scene.add(routes);

    // Vehicles (Particles)
    const vehicleGeo = new THREE.BufferGeometry();
    const vehicleCount = 100;
    const posArray = new Float32Array(vehicleCount * 3);
    for(let i=0; i<vehicleCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 40;
    vehicleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const vehicleMat = new THREE.PointsMaterial({ size: 0.5, color: '#f59e0b' });
    const vehicles = new THREE.Points(vehicleGeo, vehicleMat);
    scene.add(vehicles);

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.02;

      const currentProps = propsRef.current;

      // Warning light intensity based on alert level
      if (currentProps.alertLevel === 'high') {
        warningLight.intensity = (Math.sin(time * 10) + 1) * 2;
        warningLight.color.setHex(0xff0000);
      } else if (currentProps.alertLevel === 'medium') {
        warningLight.intensity = (Math.sin(time * 5) + 1);
        warningLight.color.setHex(0xf59e0b);
      } else {
        warningLight.intensity = 0;
      }

      // Move vehicles towards exits (corners)
      const positions = vehicles.geometry.attributes.position.array as Float32Array;
      const speed = currentProps.alertLevel === 'high' ? 0.2 : (currentProps.alertLevel === 'medium' ? 0.1 : 0.02);
      
      for(let i=0; i<vehicleCount; i++) {
        const x = positions[i*3];
        const z = positions[i*3 + 2];
        
        // Simple logic: move outward
        if (x > 0) positions[i*3] += speed;
        else positions[i*3] -= speed;
        
        if (z > 0) positions[i*3 + 2] += speed;
        else positions[i*3 + 2] -= speed;

        // Reset if out of bounds (simulating new vehicles entering or looping for visual effect)
        if (Math.abs(positions[i*3]) > 30 || Math.abs(positions[i*3 + 2]) > 30) {
          positions[i*3] = (Math.random() - 0.5) * 10;
          positions[i*3 + 2] = (Math.random() - 0.5) * 10;
        }
      }
      vehicles.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
