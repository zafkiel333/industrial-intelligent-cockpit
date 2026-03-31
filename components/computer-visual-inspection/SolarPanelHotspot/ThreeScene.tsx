import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HotSpot } from './three-types';

interface ThreeSceneProps {
  hotSpots: HotSpot[];
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ hotSpots }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);
  
  const propsRef = useRef({ hotSpots });

  useEffect(() => {
    propsRef.current = { hotSpots };
  }, [hotSpots]);

  useEffect(() => {
    if (!containerRef.current) return;

    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) {
      containerRef.current.removeChild(existingCanvas);
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = true;
    controlsRef.current = controls;

    // 1. Solar Panel Grid
    const panelGroup = new THREE.Group();
    scene.add(panelGroup);

    const rows = 4;
    const cols = 4;
    const panelGeo = new THREE.PlaneGeometry(1.8, 1);
    const panelMat = new THREE.MeshPhongMaterial({ color: 0x1e293b, side: THREE.DoubleSide });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const panel = new THREE.Mesh(panelGeo, panelMat);
        panel.position.set(c * 2.2 - 3.3, 0, r * 1.5 - 2.25);
        panel.rotation.x = -Math.PI / 6;
        panel.userData = { id: `panel_${r}_${c}` };
        panelGroup.add(panel);
      }
    }

    // 2. Hot Spot Markers
    const hotSpotGroup = new THREE.Group();
    scene.add(hotSpotGroup);

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(5, 10, 5);
    scene.add(sunLight);

    // 4. Animation Loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const { hotSpots: currentHotSpots } = propsRef.current;

      // Update hot spots
      if (hotSpotGroup.children.length !== currentHotSpots.length) {
        while(hotSpotGroup.children.length > 0) {
          hotSpotGroup.remove(hotSpotGroup.children[0]);
        }
        currentHotSpots.forEach(spot => {
          const targetPanel = panelGroup.children.find(p => p.userData.id === spot.panelId);
          if (targetPanel) {
            const markerGeo = new THREE.CircleGeometry(0.2, 16);
            const markerMat = new THREE.MeshBasicMaterial({ 
              color: spot.severity === 'high' ? 0xef4444 : 0xf59e0b,
              transparent: true,
              opacity: 0.8,
              side: THREE.DoubleSide
            });
            const marker = new THREE.Mesh(markerGeo, markerMat);
            marker.position.copy(targetPanel.position);
            marker.position.y += 0.1;
            marker.rotation.x = targetPanel.rotation.x;
            hotSpotGroup.add(marker);
          }
        });
      }

      // Pulse hot spots
      hotSpotGroup.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.scale.setScalar(1 + Math.sin(Date.now() * 0.01 + i) * 0.3);
        }
      });

      scene.rotation.y += 0.002;

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
