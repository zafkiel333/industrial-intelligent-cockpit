
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShaftVibrationProps } from './three-types';

export const ShaftVibrationScene: React.FC<ShaftVibrationProps> = ({ 
  rpm,
  vibUpper,
  vibLower,
  vibWater,
  phaseUpper,
  phaseLower,
  phaseWater,
  showModeShape = true,
  showCenterline = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const shaftGroupRef = useRef<THREE.Group | null>(null);
  const centerlineRef = useRef<THREE.Line | null>(null);
  const orbitTrailsRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050505, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(15, 5, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 1.5;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    scene.add(hemiLight);

    const blueLight = new THREE.PointLight(0x06b6d4, 2, 30);
    blueLight.position.set(10, 10, 10);
    scene.add(blueLight);

    const magentaLight = new THREE.PointLight(0xd946ef, 2, 30);
    magentaLight.position.set(-10, -5, -10);
    scene.add(magentaLight);

    // --- Geometry Construction ---
    const mainGroup = new THREE.Group();
    shaftGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // Materials
    const steelMat = new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, 
      metalness: 0.5, 
      roughness: 0.4 
    });
    
    const bearingMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.6,
      roughness: 0.4,
      transparent: true,
      opacity: 0.3
    });

    const activeMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });

    // 1. Static Reference Bearings (Visual Guides)
    const bearingGroup = new THREE.Group();
    scene.add(bearingGroup);
    
    const createBearing = (y: number, label: string) => {
        const geo = new THREE.CylinderGeometry(2.2, 2.2, 0.5, 32);
        const mesh = new THREE.Mesh(geo, bearingMat);
        mesh.position.y = y;
        bearingGroup.add(mesh);
        
        // Label or ring
        const ringGeo = new THREE.TorusGeometry(2.5, 0.05, 8, 64);
        ringGeo.rotateX(Math.PI/2);
        const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x475569 }));
        ring.position.y = y;
        bearingGroup.add(ring);
    };

    createBearing(6, "Upper");
    createBearing(0, "Lower");
    createBearing(-6, "Water");

    // 2. The Shaft System (Segmented for Bending)
    // We will construct the shaft using segments that we can offset in the animation loop
    // to simulate the mode shape curve.
    
    // Generator Rotor (Top)
    const rotorGeo = new THREE.CylinderGeometry(4, 4, 1.5, 32);
    const rotor = new THREE.Mesh(rotorGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.5 }));
    rotor.name = "rotor";
    // We don't add to scene yet, we add to a dynamic object in animate loop or just update position
    
    // Turbine Runner (Bottom)
    const runnerGeo = new THREE.CylinderGeometry(3, 1, 2, 32);
    const runner = new THREE.Mesh(runnerGeo, new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 }));
    runner.name = "runner";

    // Main Shaft (Visual only, actual line drawn separately)
    // We use a TubeGeometry updated every frame for the best "bending" look, 
    // or just animate a straight shaft for rigid body modes. 
    // Given "Vibration Trend", showing the deflection (bowing) is cool.
    
    // --- Centerline Visualization ---
    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
    const centerline = new THREE.Line(lineGeo, lineMat);
    centerlineRef.current = centerline;
    if (showCenterline) scene.add(centerline);

    // --- Orbit Trails ---
    const orbitGroup = new THREE.Group();
    orbitTrailsRef.current = orbitGroup;
    scene.add(orbitGroup);

    // Create 3 trail lines for the bearings
    [6, 0, -6].forEach(y => {
        const trailGeo = new THREE.BufferGeometry();
        // pre-allocate buffer
        const positions = new Float32Array(300 * 3); // 300 points
        trailGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.5 }));
        trail.position.y = y; // relative base
        trail.userData = { yBase: y, points: [], idx: 0 };
        orbitGroup.add(trail);
    });

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    // Temporary objects to build the shaft visual
    // We will use a series of cylinders to approximate the shaft to allow "bending"
    const segments: THREE.Mesh[] = [];
    const segmentCount = 20;
    const shaftLength = 16;
    const startY = 8;
    
    for(let i=0; i<segmentCount; i++) {
        const segGeo = new THREE.CylinderGeometry(0.8, 0.8, shaftLength/segmentCount, 16);
        const seg = new THREE.Mesh(segGeo, steelMat);
        mainGroup.add(seg);
        segments.push(seg);
    }
    
    // Add Rotor and Runner to mainGroup
    mainGroup.add(rotor);
    mainGroup.add(runner);

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += (rpm / 60) * 0.1; // Scale time by RPM
      controls.update();

      // Calculate Displacement for each height
      // Interpolate vibration between Upper(6), Lower(0), Water(-6)
      
      const getDisplacement = (y: number, t: number) => {
          // Linear interpolation of amplitude and phase for simplicity
          // Real shafts use cubic splines or modal shapes
          let amp = 0;
          let ph = 0;

          if (y > 0) { // Upper to Lower
             const ratio = y / 6;
             amp = vibUpper * ratio + vibLower * (1 - ratio);
             ph = phaseUpper * ratio + phaseLower * (1 - ratio);
          } else { // Lower to Water
             const ratio = Math.abs(y) / 6;
             amp = vibWater * ratio + vibLower * (1 - ratio);
             ph = phaseWater * ratio + phaseLower * (1 - ratio);
          }
          
          // Add a "bow" factor if vibration is high to simulate shaft bending mode
          const bow = Math.sin((y + 6) / 12 * Math.PI) * (vibUpper + vibWater) * 0.5;
          
          const rad = (ph + t * 10) * (Math.PI / 180); // t*10 simulates rotation frequency
          // Visual scale factor
          const scale = 2.0; 
          const x = Math.cos(rad) * (amp + bow) * scale;
          const z = Math.sin(rad) * (amp + bow) * scale;
          return { x, z };
      };

      // Update Segments
      const points: THREE.Vector3[] = [];
      
      segments.forEach((seg, i) => {
          const y = startY - (i * (shaftLength/segmentCount)) - (shaftLength/segmentCount)/2;
          const disp = getDisplacement(y, time * 50); // *50 for rotation speed
          
          seg.position.set(disp.x, y, disp.z);
          // Calculate rotation to follow curve (lookAt next point)
          // Simplified: just displace
          seg.rotation.y += 0.05; // Spin
      });

      // Update Large Masses
      const rotorDisp = getDisplacement(7, time * 50);
      rotor.position.set(rotorDisp.x, 7, rotorDisp.z);
      rotor.rotation.y += 0.05;

      const runnerDisp = getDisplacement(-7, time * 50);
      runner.position.set(runnerDisp.x, -7, runnerDisp.z);
      runner.rotation.y += 0.05;

      // Update Centerline
      if (centerlineRef.current) {
          const curvePoints = [];
          for(let y = 8; y >= -8; y -= 0.5) {
              const d = getDisplacement(y, time * 50);
              curvePoints.push(new THREE.Vector3(d.x, y, d.z));
          }
          centerlineRef.current.geometry.setFromPoints(curvePoints);
      }

      // Update Orbit Trails
      if (orbitTrailsRef.current) {
          orbitTrailsRef.current.children.forEach((trail: any) => {
              const y = trail.userData.yBase;
              const d = getDisplacement(y, time * 50);
              
              const arr = trail.userData.points;
              arr.push(d.x, 0, d.z); // Local Y is 0 for the trail, visual Y is set by group position? No, line positions relative
              // Actually we need to set line vertices.
              // Let's keep a fixed buffer and cycle
              
              // Correct way for Line buffer update:
              const positions = trail.geometry.attributes.position.array;
              // Shift
              for(let i = positions.length - 1; i > 2; i--) {
                  positions[i] = positions[i-3];
              }
              positions[0] = d.x;
              positions[1] = 0; // Flat trail on that plane
              positions[2] = d.z;
              trail.geometry.attributes.position.needsUpdate = true;
              
              // Rotate trail to match camera? No, it's 3D trace.
          });
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current && renderer && camera) {
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [rpm, vibUpper, vibLower, vibWater, phaseUpper, phaseLower, phaseWater, showCenterline]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
