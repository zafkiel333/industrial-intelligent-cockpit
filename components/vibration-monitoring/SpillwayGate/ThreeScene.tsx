import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup
    const existingCanvas = containerRef.current.querySelector('canvas');
    if (existingCanvas) containerRef.current.removeChild(existingCanvas);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(120, 80, 150);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Spillway Structure
    const structureGroup = new THREE.Group();
    scene.add(structureGroup);

    // Concrete Walls with more detail
    const wallGeom = new THREE.BoxGeometry(20, 150, 100);
    const wallMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      transparent: true, 
      opacity: 0.4,
      roughness: 0.8,
      metalness: 0.2
    });
    
    const leftWall = new THREE.Mesh(wallGeom, wallMat);
    leftWall.position.set(-40, 0, 0);
    structureGroup.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeom, wallMat);
    rightWall.position.set(40, 0, 0);
    structureGroup.add(rightWall);

    // Floor
    const floorGeom = new THREE.BoxGeometry(100, 10, 200);
    const floor = new THREE.Mesh(floorGeom, wallMat);
    floor.position.y = -75;
    structureGroup.add(floor);

    // Radial Gate with more detail
    const gateGroup = new THREE.Group();
    scene.add(gateGroup);

    // Curved gate face
    const gateFaceGeom = new THREE.CylinderGeometry(60, 60, 60, 32, 1, true, 0, Math.PI / 3);
    gateFaceGeom.rotateZ(Math.PI / 2);
    gateFaceGeom.rotateY(-Math.PI / 6);
    const gateMat = new THREE.MeshStandardMaterial({ 
      color: 0x0ea5e9, 
      side: THREE.DoubleSide,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.2
    });
    const gateFace = new THREE.Mesh(gateFaceGeom, gateMat);
    gateGroup.add(gateFace);

    // Gate frame/wireframe
    const gateWire = new THREE.WireframeGeometry(gateFaceGeom);
    const gateWireMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
    const gateWireMesh = new THREE.LineSegments(gateWire, gateWireMat);
    gateGroup.add(gateWireMesh);

    // Arms (Trunnion arms)
    const armGroup = new THREE.Group();
    gateGroup.add(armGroup);

    const armGeom = new THREE.CylinderGeometry(1.5, 2.5, 80, 8);
    armGeom.rotateX(Math.PI / 2);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
    
    const armLeft = new THREE.Mesh(armGeom, armMat);
    armLeft.position.set(-28, 0, -40);
    armLeft.rotation.y = 0.2;
    armGroup.add(armLeft);

    const armRight = new THREE.Mesh(armGeom, armMat);
    armRight.position.set(28, 0, -40);
    armRight.rotation.y = -0.2;
    armGroup.add(armRight);

    // Trunnion hubs
    const hubGeom = new THREE.CylinderGeometry(5, 5, 10, 16);
    hubGeom.rotateZ(Math.PI / 2);
    const hubLeft = new THREE.Mesh(hubGeom, armMat);
    hubLeft.position.set(-40, 0, -80);
    scene.add(hubLeft); // Fixed to walls

    const hubRight = new THREE.Mesh(hubGeom, armMat);
    hubRight.position.set(40, 0, -80);
    scene.add(hubRight);

    // Vibration Sensors (Glowing points)
    const sensorGeom = new THREE.SphereGeometry(2, 16, 16);
    const sensorMat = new THREE.MeshStandardMaterial({ 
      color: 0xef4444, 
      emissive: 0xef4444, 
      emissiveIntensity: 1 
    });
    const sensors: THREE.Mesh[] = [];
    [-25, 25].forEach(x => {
      const s = new THREE.Mesh(sensorGeom, sensorMat);
      s.position.set(x, 20, 10);
      gateGroup.add(s);
      sensors.push(s);
    });

    // Water Particles (Enhanced)
    const particles = new THREE.Group();
    scene.add(particles);
    const pCount = 200;
    const pGeom = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pVel = new Float32Array(pCount);
    
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 60;
      pPos[i * 3 + 1] = -50;
      pPos[i * 3 + 2] = Math.random() * 150 - 50;
      pVel[i] = 1 + Math.random() * 2;
    }
    
    pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pPointsMat = new THREE.PointsMaterial({
      color: 0x0ea5e9,
      size: 1.5,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    const waterPoints = new THREE.Points(pGeom, pPointsMat);
    particles.add(waterPoints);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0x0ea5e9, 5, 300, Math.PI / 4, 0.5);
    spotLight.position.set(0, 100, 100);
    scene.add(spotLight);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Gate Movement (Simulated opening/closing)
      const gateAngle = Math.sin(time * 0.3) * 0.3 - 0.2;
      gateGroup.rotation.x = gateAngle;

      // Vibration effect (High frequency jitter)
      const vibIntensity = 0.2 + Math.sin(time * 2) * 0.1;
      gateGroup.position.y = Math.sin(time * 60) * vibIntensity;
      gateGroup.position.z = Math.cos(time * 55) * vibIntensity;

      // Pulse sensors
      sensors.forEach(s => {
        (s.material as any).emissiveIntensity = 1 + Math.sin(time * 10) * 0.5;
      });

      // Water flow animation
      const positions = waterPoints.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pCount; i++) {
        positions[i * 3 + 2] += pVel[i];
        positions[i * 3 + 1] -= 0.1; // Gravity effect
        
        if (positions[i * 3 + 2] > 100) {
          positions[i * 3 + 2] = -20;
          positions[i * 3 + 1] = Math.sin(gateAngle) * 60 - 20;
          positions[i * 3] = (Math.random() - 0.5) * 60;
        }
      }
      waterPoints.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    const frameId = requestAnimationFrame(animate);

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
      if (rendererRef.current) rendererRef.current.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
