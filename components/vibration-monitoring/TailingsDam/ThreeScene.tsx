import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ShovelHoistState } from './three-types';

interface ThreeSceneProps {
  state: ShovelHoistState;
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
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(50, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(15, 12, 15);

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

    // 4. Shovel Hoist Model
    const shovelGroup = new THREE.Group();
    scene.add(shovelGroup);

    // Main Body (Base)
    const bodyGeo = new THREE.BoxGeometry(6, 3, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.5;
    shovelGroup.add(body);

    // Boom (Arm)
    const boomGroup = new THREE.Group();
    boomGroup.position.set(0, 3, 3);
    shovelGroup.add(boomGroup);

    const boomGeo = new THREE.BoxGeometry(1, 12, 1);
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.1 });
    const boom = new THREE.Mesh(boomGeo, boomMat);
    boom.rotation.x = -Math.PI / 4;
    boom.position.set(0, 4, 4);
    boomGroup.add(boom);

    // Hoist Winch (Drum)
    const winchGeo = new THREE.CylinderGeometry(1.5, 1.5, 4, 32);
    const winchMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.9, roughness: 0.1 });
    const winch = new THREE.Mesh(winchGeo, winchMat);
    winch.rotation.z = Math.PI / 2;
    winch.position.set(0, 4, -1);
    shovelGroup.add(winch);

    // Cable Pulley at the top of the boom
    const pulleyGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 32);
    const pulleyMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const pulley = new THREE.Mesh(pulleyGeo, pulleyMat);
    pulley.rotation.z = Math.PI / 2;
    pulley.position.set(0, 8.5, 8.5);
    boomGroup.add(pulley);

    // Bucket (Dipper)
    const bucketGeo = new THREE.BoxGeometry(3, 3, 4);
    const bucketMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7, roughness: 0.3 });
    const bucket = new THREE.Mesh(bucketGeo, bucketMat);
    shovelGroup.add(bucket);

    // Cables (Lines)
    const cableMat = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const cablePoints = [
      new THREE.Vector3(0, 4, -1), // From winch
      new THREE.Vector3(0, 8.5, 8.5), // To pulley
      new THREE.Vector3(0, 0, 0) // To bucket (dynamic)
    ];
    const cableGeo = new THREE.BufferGeometry().setFromPoints(cablePoints);
    const cable = new THREE.Line(cableGeo, cableMat);
    shovelGroup.add(cable);

    // Grid Helper
    const grid = new THREE.GridHelper(40, 40, 0x00ffff, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // 5. Animation Loop
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      
      const { vibration, hoistSpeed, bucketHeight } = stateRef.current;

      // Winch rotation
      winch.rotation.x += hoistSpeed * 0.1;
      pulley.rotation.x += hoistSpeed * 0.1;

      // Bucket movement
      const targetY = 2 + bucketHeight * 6;
      bucket.position.set(0, targetY, 8.5);

      // Vibration effect
      if (vibration > 0.5) {
        const shake = (Math.random() - 0.5) * vibration * 0.1;
        bucket.position.x += shake;
        bucket.position.z += shake;
      }

      // Update cables
      const positions = cable.geometry.attributes.position.array as Float32Array;
      // Point 2 (Bucket connection)
      positions[6] = bucket.position.x;
      positions[7] = bucket.position.y + 1.5;
      positions[8] = bucket.position.z;
      cable.geometry.attributes.position.needsUpdate = true;

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
