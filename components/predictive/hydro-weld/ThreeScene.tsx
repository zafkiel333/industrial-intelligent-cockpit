
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WeldSceneProps } from './three-types';

export const WeldThreeScene: React.FC<WeldSceneProps> = ({ 
  pipeDiameter,
  weldWidth,
  cracks,
  stressFactor,
  isScanning,
  scanProgress,
  viewMode
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const weldRef = useRef<THREE.Mesh | null>(null);
  const scanRingRef = useRef<THREE.Group | null>(null);
  const crackGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(10, 5, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.5;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x38bdf8, 1);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const scannerLight = new THREE.PointLight(0x22d3ee, 0, 10);
    scene.add(scannerLight);

    // Materials
    const pipeMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, metalness: 0.8, roughness: 0.3, transparent: true, opacity: 0.9 
    });
    
    const weldMat = new THREE.MeshStandardMaterial({ 
        color: 0x94a3b8, metalness: 0.9, roughness: 0.4, emissive: 0x000000 
    });

    const crackMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });

    // Geometry
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Pipe Segment
    const pipeGeo = new THREE.CylinderGeometry(4, 4, 10, 64, 1, true);
    pipeGeo.rotateZ(Math.PI / 2);
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    mainGroup.add(pipe);

    // 2. Weld Seam (The ring)
    const weldGeo = new THREE.CylinderGeometry(4.05, 4.05, 0.8, 64, 1, true);
    weldGeo.rotateZ(Math.PI / 2);
    const weld = new THREE.Mesh(weldGeo, weldMat);
    weldRef.current = weld;
    mainGroup.add(weld);

    // 3. Cracks
    const crackGroup = new THREE.Group();
    crackGroupRef.current = crackGroup;
    mainGroup.add(crackGroup);

    cracks.forEach(c => {
        const rad = c.angle * (Math.PI / 180);
        // Crack is a thin arc on the surface
        const crackGeo = new THREE.TorusGeometry(4.06, 0.05, 8, 16, (c.length / 100));
        const crack = new THREE.Mesh(crackGeo, crackMat);
        crack.rotation.y = Math.PI / 2;
        crack.rotation.x = -rad;
        crackGroup.add(crack);
    });

    // 4. Scan Ring (UT Probe visual)
    const scanGroup = new THREE.Group();
    scanRingRef.current = scanGroup;
    scene.add(scanGroup);

    const probe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 1), new THREE.MeshStandardMaterial({color: 0x22d3ee}));
    probe.position.set(0, 4.3, 0);
    scanGroup.add(probe);

    // Beam Visual
    const beamGeo = new THREE.CylinderGeometry(0.05, 0.5, 4, 16);
    const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({color: 0x22d3ee, transparent: true, opacity: 0.2}));
    beam.position.y = 2.3;
    probe.add(beam);

    // --- Animation ---
    let frameId: number;
    const animate = () => {
        frameId = requestAnimationFrame(animate);
        controls.update();

        // Scanning Logic
        if (isScanning && scanRingRef.current) {
            scanRingRef.current.rotation.x = scanProgress * Math.PI * 2;
            scannerLight.intensity = 5;
            scannerLight.position.copy(probe.getWorldPosition(new THREE.Vector3()));
        } else if (scanRingRef.current) {
            scannerLight.intensity = 0;
        }

        // Stress Glow
        if (weldRef.current) {
            const mat = weldRef.current.material as THREE.MeshStandardMaterial;
            const stressColor = new THREE.Color(0xff0000);
            mat.emissive.lerpColors(new THREE.Color(0x000000), stressColor, stressFactor);
            mat.emissiveIntensity = stressFactor * 0.5;
        }

        // View Modes
        if (viewMode === 'xray') {
            pipeMat.opacity = 0.1;
            pipeMat.wireframe = true;
        } else {
            pipeMat.opacity = 0.9;
            pipeMat.wireframe = false;
        }

        renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && rendererRef.current) {
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, [cracks, stressFactor, isScanning, scanProgress, viewMode]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
