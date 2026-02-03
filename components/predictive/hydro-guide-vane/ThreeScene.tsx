
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GuideVaneSceneProps } from './three-types';

export const GuideVaneScene: React.FC<GuideVaneSceneProps> = ({ 
  opening, 
  servoPressure, 
  frictionIndex = [], 
  isMoving,
  showForces = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const ringRef = useRef<THREE.Group | null>(null);
  const vanesRef = useRef<THREE.Group[]>([]);
  const servosRef = useRef<THREE.Group[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0500, 0.04); // Dark amber/brown fog

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 12, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;
    controls.maxPolarAngle = Math.PI / 2;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 2, 20);
    amberLight.position.set(5, 5, 5);
    scene.add(amberLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 1, 20); // Contrast light
    blueLight.position.set(-5, 2, -5);
    scene.add(blueLight);

    // --- Materials ---
    const steelMat = new THREE.MeshStandardMaterial({ 
      color: 0x475569, metalness: 0.7, roughness: 0.3 
    });
    
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, metalness: 0.6, roughness: 0.4
    });

    const activeServoMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.2, metalness: 0.8, roughness: 0.2
    });

    // --- Geometry ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Regulating Ring (The large ring that rotates)
    const ringGroup = new THREE.Group();
    ringRef.current = ringGroup;
    mainGroup.add(ringGroup);

    const ringGeo = new THREE.TorusGeometry(4, 0.2, 16, 64);
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringGroup.add(ringMesh);

    // 2. Guide Vanes (24 vanes distributed)
    const vaneCount = 20;
    const vaneRadius = 5.5; // Circle outside the ring
    vanesRef.current = [];

    const vaneShape = new THREE.Shape();
    // Teardrop shape for vane profile
    vaneShape.moveTo(0, 0);
    vaneShape.quadraticCurveTo(0.3, 0.5, 0, 1.5);
    vaneShape.quadraticCurveTo(-0.3, 0.5, 0, 0);
    
    const vaneGeo = new THREE.ExtrudeGeometry(vaneShape, { depth: 2, bevelEnabled: false });
    vaneGeo.center(); // Center geometry for rotation

    const armGeo = new THREE.BoxGeometry(0.1, 0.1, 1.5); // Linkage arm

    for(let i=0; i<vaneCount; i++) {
        const angle = (i / vaneCount) * Math.PI * 2;
        
        // Vane Group (Pivot point)
        const vaneGroup = new THREE.Group();
        vaneGroup.position.set(Math.cos(angle)*vaneRadius, 0, Math.sin(angle)*vaneRadius);
        mainGroup.add(vaneGroup); // Add to main, not ring (they pivot in place)
        
        // The Vane Blade
        const vane = new THREE.Mesh(vaneGeo, steelMat.clone()); // Clone mat for individual color updates
        vane.rotation.x = Math.PI / 2; // Upright
        vaneGroup.add(vane);
        
        // The Link Arm (Connecting Ring to Vane)
        // Visual simplification: An arm attached to the ring pointing to the vane
        // We add the arm to the RING group at the corresponding spot
        const armGroup = new THREE.Group();
        armGroup.position.set(Math.cos(angle)*4, 0, Math.sin(angle)*4);
        armGroup.rotation.y = -angle; // Point outward roughly
        ringGroup.add(armGroup);
        
        const arm = new THREE.Mesh(armGeo, steelMat);
        arm.position.z = 0.75; // Offset
        armGroup.add(arm);

        // Store ref to vane group to rotate it
        // Store the mesh to color it
        vaneGroup.userData = { mesh: vane, baseAngle: -angle };
        vanesRef.current.push(vaneGroup);
    }

    // 3. Servomotors (2 large cylinders pushing the ring)
    const servoGroup1 = new THREE.Group();
    const servoGroup2 = new THREE.Group();
    servosRef.current = [servoGroup1, servoGroup2];
    mainGroup.add(servoGroup1);
    mainGroup.add(servoGroup2);

    const cylinderGeo = new THREE.CylinderGeometry(0.4, 0.4, 3, 16);
    cylinderGeo.rotateZ(Math.PI / 2);
    const rodGeo = new THREE.CylinderGeometry(0.2, 0.2, 3, 16);
    rodGeo.rotateZ(Math.PI / 2);

    // Position Servos tangent to ring
    const servoPos = 4.5;
    servoGroup1.position.set(-servoPos, 0, 3);
    servoGroup1.rotation.y = -Math.PI / 6;
    
    servoGroup2.position.set(servoPos, 0, -3);
    servoGroup2.rotation.y = Math.PI - Math.PI / 6;

    [servoGroup1, servoGroup2].forEach(g => {
        const body = new THREE.Mesh(cylinderGeo, steelMat);
        const rod = new THREE.Mesh(rodGeo, activeServoMat);
        rod.position.x = 1.5; // Extended
        rod.name = "rod";
        g.add(body);
        g.add(rod);
    });

    // --- Animation Loop ---
    let frameId: number;
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();

      // 1. Regulating Ring Rotation (Based on Opening %)
      // 0% -> 0 deg, 100% -> 15 deg (approx 0.26 rad)
      const targetRot = (opening / 100) * 0.26;
      if (ringRef.current) {
          // Smooth interpolation
          ringRef.current.rotation.y += (targetRot - ringRef.current.rotation.y) * 0.1;
      }

      // 2. Vane Rotation (Linked to Ring)
      // Vanes rotate more than the ring due to linkage leverage
      const currentRingRot = ringRef.current ? ringRef.current.rotation.y : 0;
      
      vanesRef.current.forEach((vaneGroup, i) => {
          const { mesh, baseAngle } = vaneGroup.userData;
          
          // Rotation logic
          vaneGroup.rotation.y = baseAngle + currentRingRot * 1.5; 

          // Friction Heat Visualization
          // If this vane index has high friction in props, glow red
          const friction = frictionIndex[i] || 0;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (friction > 0.5) {
              // High friction -> Red/Orange
              mat.color.setHSL(0.05, 1.0, 0.5); 
              mat.emissive.setHex(0xff0000);
              mat.emissiveIntensity = friction * 0.5 + Math.sin(Date.now()*0.01)*0.2;
          } else {
              mat.color.setHex(0x475569);
              mat.emissive.setHex(0x000000);
          }
      });

      // 3. Servo Piston Movement
      servosRef.current.forEach(g => {
          const rod = g.getObjectByName("rod");
          if (rod) {
              // Map opening to extension
              const ext = 1.5 + (opening / 100) * 1.0; 
              rod.position.x += (ext - rod.position.x) * 0.1;
              
              // Pulse intensity if moving and high pressure
              const mat = rod.material as THREE.MeshStandardMaterial;
              if (isMoving) {
                  mat.emissiveIntensity = 0.5 + (servoPressure / 20) * 0.5; // Pressure glows
              } else {
                  mat.emissiveIntensity = 0.2;
              }
          }
      });

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
  }, [opening, servoPressure, frictionIndex, isMoving, showForces]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
