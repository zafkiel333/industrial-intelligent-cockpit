import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GateSceneProps } from './three-types';

export const GateStructureScene: React.FC<GateSceneProps> = ({ 
  openingHeight,
  waterLevelUpstream,
  waterLevelDownstream,
  stressMap,
  vibrationIntensity,
  trunnionHealth
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const gateGroupRef = useRef<THREE.Group | null>(null);
  const waterUpRef = useRef<THREE.Mesh | null>(null);
  const waterDownRef = useRef<THREE.Mesh | null>(null);
  const trunnionRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x020610, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(15, 12, 18);
    camera.lookAt(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    //2026.02.05,修复了复数个3d建模的问题，原因是有多个canvas，需要在进入前清空
    // 新增：清空挂载节点，避免多canvas
    const existingCanvas = mountRef.current.querySelector('canvas');
    if (existingCanvas) {
      mountRef.current.removeChild(existingCanvas);
    }
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(10, 20, 10);
    scene.add(sunLight);

    const tealLight = new THREE.PointLight(0x2dd4bf, 2, 20);
    tealLight.position.set(0, 5, 5);
    scene.add(tealLight);

    // --- Materials ---
    const concreteMat = new THREE.MeshStandardMaterial({ 
        color: 0x64748b, roughness: 0.9, metalness: 0.1 
    });
    
    const steelGateMat = new THREE.MeshStandardMaterial({ 
        color: 0x475569, roughness: 0.4, metalness: 0.6 
    });

    const armMat = new THREE.MeshStandardMaterial({
        color: 0x334155, roughness: 0.5, metalness: 0.5
    });

    const waterMat = new THREE.MeshPhysicalMaterial({
        color: 0x0ea5e9,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.8,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Civil Structure (Piers & Floor)
    const floorGeo = new THREE.BoxGeometry(20, 1, 15);
    const floor = new THREE.Mesh(floorGeo, concreteMat);
    floor.position.y = -0.5;
    mainGroup.add(floor);

    // Side Piers
    const pierGeo = new THREE.BoxGeometry(2, 12, 15);
    const leftPier = new THREE.Mesh(pierGeo, concreteMat);
    leftPier.position.set(-6, 5.5, 0);
    mainGroup.add(leftPier);

    const rightPier = new THREE.Mesh(pierGeo, concreteMat);
    rightPier.position.set(6, 5.5, 0);
    mainGroup.add(rightPier);

    // 2. Radial Gate Assembly
    const gateGroup = new THREE.Group();
    // Pivot point is usually downstream, high up. Let's place trunnion at Z=5, Y=6
    gateGroup.position.set(0, 6, 4); 
    gateGroupRef.current = gateGroup;
    mainGroup.add(gateGroup);

    // Trunnion Axis
    const trunnionGeo = new THREE.CylinderGeometry(0.5, 0.5, 12, 16);
    trunnionGeo.rotateZ(Math.PI/2);
    const trunnion = new THREE.Mesh(trunnionGeo, steelGateMat);
    trunnion.name = "trunnion";
    trunnionRef.current = trunnion;
    gateGroup.add(trunnion);

    // Skin Plate (Curved Surface)
    // Radius ~8m. Arc ~60 degrees.
    const radius = 8;
    const widthGate = 10;
    const skinShape = new THREE.Shape();
    skinShape.absarc(0, 0, radius, Math.PI - 0.6, Math.PI + 0.2, false); // Arc segment
    // Create line back? No, skin plate is thin.
    // Let's use Tube or Lathe or extrude a curve. 
    // Easier: Cylinder segment
    const skinGeo = new THREE.CylinderGeometry(radius, radius, widthGate, 32, 1, true, Math.PI - 0.6, 0.8);
    skinGeo.rotateZ(Math.PI/2); // Cylinder axis is Y, rotate to X
    const skinPlate = new THREE.Mesh(skinGeo, steelGateMat);
    gateGroup.add(skinPlate);

    // Support Arms (Struts)
    // Connect Trunnion (0,0,0 local) to Skin Plate
    const armCount = 2; // Upper and Lower per side
    [-4, 4].forEach(x => {
        // Upper Arm
        const arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, radius-0.5), armMat);
        arm1.position.set(x, Math.sin(Math.PI - 0.5)*radius/2, Math.cos(Math.PI - 0.5)*radius/2);
        arm1.lookAt(x, Math.sin(Math.PI - 0.5)*radius, Math.cos(Math.PI - 0.5)*radius);
        gateGroup.add(arm1);

        // Lower Arm
        const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, radius-0.5), armMat);
        arm2.position.set(x, Math.sin(Math.PI + 0.1)*radius/2, Math.cos(Math.PI + 0.1)*radius/2);
        arm2.lookAt(x, Math.sin(Math.PI + 0.1)*radius, Math.cos(Math.PI + 0.1)*radius);
        gateGroup.add(arm2);
        
        // Cross bracing
        const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3), armMat);
        brace.position.set(x, 0, -radius/2);
        gateGroup.add(brace);
    });

    // 3. Water Volumes
    const waterUpGeo = new THREE.BoxGeometry(9.8, 1, 8);
    const waterUp = new THREE.Mesh(waterUpGeo, waterMat);
    waterUp.position.set(0, 0, -5); // Upstream (behind curve)
    waterUpRef.current = waterUp;
    mainGroup.add(waterUp);

    const waterDownGeo = new THREE.BoxGeometry(9.8, 1, 6);
    const waterDown = new THREE.Mesh(waterDownGeo, waterMat);
    waterDown.position.set(0, 0, 8); // Downstream
    waterDownRef.current = waterDown;
    mainGroup.add(waterDown);

    // --- Animation Loop ---
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;
      controls.update();

      // 1. Gate Opening Animation
      if (gateGroupRef.current) {
          // openingHeight 0-100% -> Angle rotation
          // Closed at approx 0 rotation (based on geometry setup)
          // Open pulls the skin plate UP. Since pivot is at top-back (0,6,4), 
          // Skin plate is forward-down. Rotating X-axis positive lifts it.
          const targetRot = (openingHeight / 100) * 0.8; // 0 to ~45 deg
          gateGroupRef.current.rotation.x = targetRot;

          // Vibration effect
          if (vibrationIntensity > 0) {
              gateGroupRef.current.position.y = 6 + Math.sin(time * 20) * 0.05 * vibrationIntensity;
          }
      }

      // 2. Water Levels
      if (waterUpRef.current) {
          // Scale based on waterLevelUpstream (relative to floor)
          const h = Math.max(0.1, waterLevelUpstream);
          waterUpRef.current.scale.y = h;
          waterUpRef.current.position.y = h / 2;
          // Waves
          waterUpRef.current.position.y += Math.sin(time) * 0.05;
      }
      if (waterDownRef.current) {
          const h = Math.max(0.1, waterLevelDownstream);
          waterDownRef.current.scale.y = h;
          waterDownRef.current.position.y = h / 2;
          // Turbulence
          waterDownRef.current.scale.y += Math.sin(time * 3) * 0.02 * (openingHeight > 0 ? 1 : 0);
      }

      // 3. Stress & Health Coloring
      if (gateGroupRef.current) {
          const skin = gateGroupRef.current.children.find(c => c.type === 'Mesh' && (c as THREE.Mesh).geometry.type === 'CylinderGeometry') as THREE.Mesh;
          if (skin) {
              const mat = skin.material as THREE.MeshStandardMaterial;
              if (stressMap) {
                  // Pulse red based on opening (load)
                  const stress = (waterLevelUpstream / 10) * 0.8 + Math.sin(time)*0.1;
                  mat.emissive.setHex(0xff0000);
                  mat.emissiveIntensity = stress;
                  mat.color.setHex(0x555555);
              } else {
                  mat.emissive.setHex(0x000000);
                  mat.emissiveIntensity = 0;
                  mat.color.setHex(0x475569);
              }
          }
      }

      // Trunnion Health Color
      if (trunnionRef.current) {
          const tMat = trunnionRef.current.material as THREE.MeshStandardMaterial;
          if (trunnionHealth < 60) {
              tMat.emissive.setHex(0xff0000);
              tMat.emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.5;
          } else if (trunnionHealth < 80) {
              tMat.emissive.setHex(0xf59e0b);
              tMat.emissiveIntensity = 0.3;
          } else {
              tMat.emissive.setHex(0x000000);
              tMat.emissiveIntensity = 0;
          }
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
  }, [openingHeight, waterLevelUpstream, waterLevelDownstream, stressMap, vibrationIntensity, trunnionHealth]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
