import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MooringState } from './three-types';

interface ThreeSceneProps {
  state: MooringState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing canvas
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(15, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Dock
    const dockGeometry = new THREE.BoxGeometry(30, 1, 10);
    const dockMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const dock = new THREE.Mesh(dockGeometry, dockMaterial);
    dock.position.set(0, -0.5, -10);
    scene.add(dock);

    // Ship Hull (Simplified)
    const hullGeometry = new THREE.BoxGeometry(20, 4, 6);
    const hullMaterial = new THREE.MeshStandardMaterial({ color: 0x0ea5e9 });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    scene.add(hull);

    // Mooring Lines
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const lineGeometries: THREE.BufferGeometry[] = [];
    const lines: THREE.Line[] = [];
    const shipPoints = [
      [8, 1, 3], [8, 1, -3], [-8, 1, 3], [-8, 1, -3]
    ];
    const dockPoints = [
      [12, 0, -5], [12, 0, -15], [-12, 0, -5], [-12, 0, -15]
    ];

    shipPoints.forEach((sp, i) => {
      const dp = dockPoints[i];
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(sp[0], sp[1], sp[2]),
        new THREE.Vector3(dp[0], dp[1], dp[2])
      ]);
      const line = new THREE.Line(geometry, lineMaterial.clone());
      scene.add(line);
      lines.push(line);
      lineGeometries.push(geometry);
    });

    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      
      const { lines: lineStates, shipMovement } = stateRef.current;
      
      // Update ship position
      hull.position.x = shipMovement.x / 100;
      hull.position.z = shipMovement.z / 100;
      hull.rotation.y = THREE.MathUtils.degToRad(shipMovement.y);

      // Update lines
      lines.forEach((line, i) => {
        const state = lineStates[i];
        const sp = shipPoints[i];
        const dp = dockPoints[i];
        
        // Update geometry based on ship movement
        const currentSp = new THREE.Vector3(sp[0], sp[1], sp[2]).applyEuler(hull.rotation).add(hull.position);
        const points = [currentSp, new THREE.Vector3(dp[0], dp[1], dp[2])];
        line.geometry.setFromPoints(points);

        // Update color based on tension
        if (state.status === 'critical') {
          (line.material as THREE.LineBasicMaterial).color.setHex(0xf43f5e);
        } else if (state.status === 'warning') {
          (line.material as THREE.LineBasicMaterial).color.setHex(0xf59e0b);
        } else {
          (line.material as THREE.LineBasicMaterial).color.setHex(0x06b6d4);
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
