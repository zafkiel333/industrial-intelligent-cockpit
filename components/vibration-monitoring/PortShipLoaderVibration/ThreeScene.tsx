import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ShipLoaderVibrationState } from './three-types';

interface ThreeSceneProps {
  state?: ShipLoaderVibrationState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stateRef = useRef<ShipLoaderVibrationState>(state || {
    slewSpeed: 0.4,
    vibrationIntensity: 0.2,
    beltSpeed: 4.0,
    chuteExtension: 5,
    loadingRate: 2500
  });

  useEffect(() => {
    if (state) {
      stateRef.current = state;
    }
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
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Ship Loader Model
    const loaderGroup = new THREE.Group();
    scene.add(loaderGroup);

    // Base
    const baseGeom = new THREE.CylinderGeometry(4, 4, 1, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const base = new THREE.Mesh(baseGeom, baseMat);
    loaderGroup.add(base);

    // Slewing Platform
    const platformGroup = new THREE.Group();
    platformGroup.position.y = 1;
    loaderGroup.add(platformGroup);

    const platGeom = new THREE.BoxGeometry(6, 1, 6);
    const platMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const platform = new THREE.Mesh(platGeom, platMat);
    platformGroup.add(platform);

    // Boom
    const boomGroup = new THREE.Group();
    boomGroup.position.y = 1;
    platformGroup.add(boomGroup);

    const boomGeom = new THREE.BoxGeometry(20, 1.5, 3);
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const boom = new THREE.Mesh(boomGeom, boomMat);
    boom.position.x = 10;
    boomGroup.add(boom);

    // Telescopic Chute
    const chuteGroup = new THREE.Group();
    chuteGroup.position.set(20, 0, 0);
    boomGroup.add(chuteGroup);

    const chuteGeom = new THREE.CylinderGeometry(0.8, 0.8, 4, 32);
    const chuteMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.3 });
    const chute = new THREE.Mesh(chuteGeom, chuteMat);
    chute.position.y = -2;
    chuteGroup.add(chute);

    const innerChuteGeom = new THREE.CylinderGeometry(0.6, 0.6, 4, 32);
    const innerChuteMat = new THREE.MeshStandardMaterial({ color: 0x0e7490 });
    const innerChute = new THREE.Mesh(innerChuteGeom, innerChuteMat);
    innerChute.position.y = -4;
    chuteGroup.add(innerChute);

    // Grid
    const grid = new THREE.GridHelper(40, 20, 0x00ffff, 0x1e293b);
    grid.position.y = -0.5;
    scene.add(grid);

    // Animation Loop
    let frameId: number;
    let slewAngle = 0;
    let chuteExt = 0;
    let chuteDir = 1;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      const { slewSpeed, vibrationIntensity, chuteExtension } = stateRef.current;
      const time = Date.now() * 0.001;

      // Slewing
      slewAngle += slewSpeed * 0.01;
      platformGroup.rotation.y = slewAngle;

      // Chute Extension Animation
      chuteExt += 0.02 * chuteDir;
      if (chuteExt > 2 || chuteExt < 0) chuteDir *= -1;
      innerChute.position.y = -4 - chuteExt;

      // Vibration effect on boom
      const vib = Math.sin(time * 110) * (vibrationIntensity * 0.05);
      boomGroup.position.y = 1 + vib;

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
      cancelAnimationFrame(frameId);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
