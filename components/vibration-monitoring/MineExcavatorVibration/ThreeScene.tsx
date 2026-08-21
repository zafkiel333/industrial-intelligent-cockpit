import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ShovelSwingState } from './three-types';

interface ThreeSceneProps {
  state: ShovelSwingState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Cleanup existing canvases
    const existingCanvases = containerRef.current.querySelectorAll('canvas');
    existingCanvases.forEach(canvas => canvas.remove());

    // 2. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(50, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(12, 10, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff00ff, 1);
    pointLight.position.set(-10, 5, -10);
    scene.add(pointLight);

    // 4. Shovel Swing Model
    const shovelGroup = new THREE.Group();
    scene.add(shovelGroup);

    // Undercarriage (Tracks)
    const trackGeo = new THREE.BoxGeometry(8, 2, 10);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const tracks = new THREE.Mesh(trackGeo, trackMat);
    tracks.position.y = 1;
    shovelGroup.add(tracks);

    // Swing Bearing (Rotating part)
    const swingGroup = new THREE.Group();
    swingGroup.position.y = 2;
    shovelGroup.add(swingGroup);

    const bearingGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.5, 64);
    const bearingMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.1 });
    const bearing = new THREE.Mesh(bearingGeo, bearingMat);
    bearing.position.y = 0.25;
    swingGroup.add(bearing);

    // Upper Structure (House)
    const houseGeo = new THREE.BoxGeometry(7, 4, 9);
    const houseMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.7, roughness: 0.3 });
    const house = new THREE.Mesh(houseGeo, houseMat);
    house.position.set(0, 2.5, 0);
    swingGroup.add(house);

    // Boom (Arm)
    const boomGeo = new THREE.BoxGeometry(1, 10, 1);
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const boom = new THREE.Mesh(boomGeo, boomMat);
    boom.rotation.x = -Math.PI / 4;
    boom.position.set(0, 5, 5);
    swingGroup.add(boom);

    // Bucket (Dipper)
    const bucketGeo = new THREE.BoxGeometry(3, 3, 3);
    const bucketMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
    const bucket = new THREE.Mesh(bucketGeo, bucketMat);
    bucket.position.set(0, 1, 9);
    swingGroup.add(bucket);

    // Grid Helper
    const grid = new THREE.GridHelper(40, 40, 0x00ffff, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // 5. Animation Loop
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      
      const { vibration, swingSpeed, swingAngle } = stateRef.current;

      // Swing rotation
      swingGroup.rotation.y = swingAngle;

      // Vibration effect on the upper structure
      if (vibration > 0.5) {
        const shake = (Math.random() - 0.5) * vibration * 0.05;
        house.position.x = shake;
        house.position.z = shake;
      } else {
        house.position.x = 0;
        house.position.z = 0;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 6. Resize Handling
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
