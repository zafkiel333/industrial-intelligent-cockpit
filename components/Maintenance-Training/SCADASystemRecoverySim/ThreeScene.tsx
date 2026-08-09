import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SCADAState } from './three-types';

interface ThreeSceneProps {
  state: SCADAState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SCADAState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020617');

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(5, 5, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Server Rack
    const rackGeo = new THREE.BoxGeometry(3, 6, 2);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2, wireframe: true });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    scene.add(rack);

    // Servers & LEDs
    const servers: THREE.Group[] = [];
    const leds: THREE.Mesh[] = [];

    for (let i = 0; i < 4; i++) {
      const serverGroup = new THREE.Group();
      
      const serverGeo = new THREE.BoxGeometry(2.8, 1, 1.8);
      const serverMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 });
      const server = new THREE.Mesh(serverGeo, serverMat);
      serverGroup.add(server);

      // LEDs
      for (let j = 0; j < 3; j++) {
        const ledGeo = new THREE.BoxGeometry(0.2, 0.1, 0.1);
        const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // Green default
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(-1 + j * 0.4, 0, 0.95);
        serverGroup.add(led);
        leds.push(led);
      }

      serverGroup.position.y = 2 - i * 1.3;
      scene.add(serverGroup);
      servers.push(serverGroup);
    }

    // Holographic Network Ring
    const ringGeo = new THREE.TorusGeometry(4, 0.05, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentState = stateRef.current;

      // Rotate scene slowly
      scene.rotation.y += 0.002;
      ring.rotation.z -= 0.005;

      // Update LEDs based on state
      const time = Date.now();
      leds.forEach((led, index) => {
        const mat = led.material as THREE.MeshBasicMaterial;
        const serverIndex = Math.floor(index / 3);

        if (currentState.status === 'crashed') {
          mat.color.setHex(0xef4444); // Red
          mat.opacity = (Math.sin(time * 0.01 + index) + 1) / 2; // Blink
          mat.transparent = true;
          ringMat.color.setHex(0xef4444);
        } else if (currentState.status === 'rebooting') {
          if (serverIndex === currentState.activeNode) {
            mat.color.setHex(0xeab308); // Yellow
            mat.opacity = (Math.sin(time * 0.02) + 1) / 2; // Fast blink
          } else if (serverIndex < currentState.activeNode) {
            mat.color.setHex(0x10b981); // Green (recovered)
            mat.opacity = 1;
          } else {
            mat.color.setHex(0xef4444); // Red (waiting)
            mat.opacity = 0.5;
          }
          ringMat.color.setHex(0xeab308);
        } else {
          mat.color.setHex(0x10b981); // Green
          mat.opacity = Math.random() > 0.1 ? 1 : 0.2; // Random flicker for activity
          mat.transparent = true;
          ringMat.color.setHex(0x0ea5e9);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || 1;
      const h = mountRef.current.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
