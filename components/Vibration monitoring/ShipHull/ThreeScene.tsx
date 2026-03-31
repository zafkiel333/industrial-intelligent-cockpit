import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ShipHullState } from './three-types';

interface ThreeSceneProps {
  state: ShipHullState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  // Update ref when state changes to allow animation loop to access fresh values
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
    scene.background = new THREE.Color(0x02050a);
    scene.fog = new THREE.FogExp2(0x02050a, 0.05);

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(40, 20, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 2);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff00ff, 2, 50);
    pointLight.position.set(-10, 5, -10);
    scene.add(pointLight);

    // 4. Ship Hull Model (Procedural)
    const hullGroup = new THREE.Group();
    scene.add(hullGroup);

    const hullLength = 40;
    const hullWidth = 8;
    const hullHeight = 6;
    
    // Create a more ship-like hull using a custom shape and extrusion
    const hullShape = new THREE.Shape();
    hullShape.moveTo(-hullWidth / 2, 0);
    hullShape.lineTo(hullWidth / 2, 0);
    hullShape.quadraticCurveTo(hullWidth / 2, hullHeight, 0, hullHeight);
    hullShape.quadraticCurveTo(-hullWidth / 2, hullHeight, -hullWidth / 2, 0);

    const extrudeSettings = {
      steps: 100, // Increased steps for smoother bending
      depth: hullLength,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
      bevelOffset: 0,
      bevelSegments: 5
    };

    const hullGeometry = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
    hullGeometry.center();
    hullGeometry.rotateX(Math.PI); // Flip it
    
    // Use a shader-like material for stress heatmap
    const hullMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a2a3a,
      transparent: true,
      opacity: 0.85,
      shininess: 100,
      vertexColors: true,
      emissive: 0x001122,
      emissiveIntensity: 0.5
    });
    
    // Initialize vertex colors
    const colors = new Float32Array(hullGeometry.attributes.position.count * 3);
    hullGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const hullMesh = new THREE.Mesh(hullGeometry, hullMaterial);
    hullGroup.add(hullMesh);

    // Internal Ribs (Wireframe)
    const ribGeometry = new THREE.ExtrudeGeometry(hullShape, { ...extrudeSettings, steps: 10 });
    ribGeometry.center();
    ribGeometry.rotateX(Math.PI);
    const ribMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.1 });
    const ribMesh = new THREE.Mesh(ribGeometry, ribMaterial);
    hullGroup.add(ribMesh);

    // Superstructure (Bridge)
    const bridgeGeom = new THREE.BoxGeometry(6, 4, 6);
    const bridgeMat = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
    const bridge = new THREE.Mesh(bridgeGeom, bridgeMat);
    bridge.position.set(-10, hullHeight / 2 + 2, 0);
    hullGroup.add(bridge);

    // Propeller
    const propGroup = new THREE.Group();
    const propBladeGeom = new THREE.BoxGeometry(0.2, 3, 0.8);
    const propMat = new THREE.MeshPhongMaterial({ color: 0xcd7f32, shininess: 100 });
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(propBladeGeom, propMat);
      blade.rotation.x = (i * Math.PI) / 2;
      blade.position.y = 0;
      propGroup.add(blade);
    }
    propGroup.position.set(hullLength / 2, -hullHeight / 2 + 1, 0);
    hullGroup.add(propGroup);

    // Scanning Line
    const scanLineGeom = new THREE.CylinderGeometry(hullWidth * 0.9, hullWidth * 0.9, 0.5, 32, 1, true);
    const scanLineMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff, 
      transparent: true, 
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const scanLine = new THREE.Mesh(scanLineGeom, scanLineMat);
    scanLine.rotation.z = Math.PI / 2;
    scene.add(scanLine);

    // Sensor Points & Floating Labels
    const sensorCount = 5;
    const sensors: THREE.Mesh[] = [];
    const labels: THREE.Sprite[] = [];
    const sensorGeom = new THREE.SphereGeometry(0.4, 16, 16);
    const sensorMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    
    const createTextSprite = (text: string) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return new THREE.Sprite();
      canvas.width = 128;
      canvas.height = 64;
      context.fillStyle = 'rgba(0, 255, 255, 0.8)';
      context.font = 'Bold 24px monospace';
      context.fillText(text, 10, 40);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(4, 2, 1);
      return sprite;
    };

    for (let i = 0; i < sensorCount; i++) {
      const sensor = new THREE.Mesh(sensorGeom, sensorMat);
      const x = (i / (sensorCount - 1) - 0.5) * hullLength * 0.8;
      sensor.position.set(x, hullHeight / 2 + 0.5, 0);
      hullGroup.add(sensor);
      sensors.push(sensor);

      // Add a holographic line
      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, hullHeight / 2 + 0.5, 0),
        new THREE.Vector3(x, hullHeight / 2 + 4, 0)
      ]);
      const line = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.4 }));
      hullGroup.add(line);

      // Add floating label
      const label = createTextSprite(`S-${i+1}: 0.0`);
      label.position.set(x, hullHeight / 2 + 4.5, 0);
      hullGroup.add(label);
      labels.push(label);
    }

    // Bow Spray Particles
    const sprayCount = 200;
    const sprayGeom = new THREE.BufferGeometry();
    const sprayPositions = new Float32Array(sprayCount * 3);
    const sprayVelocities = new Float32Array(sprayCount * 3);
    for (let i = 0; i < sprayCount; i++) {
      sprayPositions[i * 3] = hullLength / 2;
      sprayPositions[i * 3 + 1] = -hullHeight / 2;
      sprayPositions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      
      sprayVelocities[i * 3] = 0.1 + Math.random() * 0.2;
      sprayVelocities[i * 3 + 1] = 0.1 + Math.random() * 0.3;
      sprayVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    sprayGeom.setAttribute('position', new THREE.BufferAttribute(sprayPositions, 3));
    const sprayMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.6 });
    const spraySystem = new THREE.Points(sprayGeom, sprayMat);
    scene.add(spraySystem);

    // Particle Spray (Bubbles)
    const particleCount = 800;
    const particlesGeom = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * hullLength * 2;
      pPositions[i * 3 + 1] = -hullHeight / 2 - Math.random() * 5;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * hullWidth * 2;
    }
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const particlesMat = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.1, transparent: true, opacity: 0.4 });
    const particleSystem = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particleSystem);

    // Grid Helper for "Sci-Fi" look
    const grid = new THREE.GridHelper(200, 50, 0x00ffff, 0x002222);
    grid.position.y = -12;
    scene.add(grid);

    // Ocean Surface (Animated Plane)
    const oceanGeometry = new THREE.PlaneGeometry(400, 400, 100, 100);
    const oceanMaterial = new THREE.MeshPhongMaterial({
      color: 0x001a33,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -6;
    scene.add(ocean);

    // 5. Animation Loop
    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.02;

      const { vibrationAmplitude, seaState, hullStress, speed } = stateRef.current;

      // Propeller Rotation
      propGroup.rotation.x += speed * 0.02;

      // Ship Bending (Longitudinal Vibration)
      const positions = hullGeometry.attributes.position;
      const ribPositions = ribGeometry.attributes.position;
      const colorAttr = hullGeometry.attributes.color;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        
        // Longitudinal bending (Hogging/Sagging)
        const bendFactor = Math.sin(((x + hullLength/2) / hullLength) * Math.PI);
        const currentBend = bendFactor * Math.sin(frame * 15) * vibrationAmplitude * 1.5;
        
        // Apply bending
        if (y > -hullHeight/2) {
           positions.setY(i, y + currentBend);
        }

        // Stress Heatmap
        const stressIntensity = Math.abs(currentBend) * 1.8 + (hullStress / 180);
        const r = 0.05 + stressIntensity * 0.95;
        const g = 0.1 + (1 - stressIntensity) * 0.4;
        const b = 0.3 + (1 - stressIntensity) * 0.6;
        colorAttr.setXYZ(i, r, g, b);
      }
      positions.needsUpdate = true;
      colorAttr.needsUpdate = true;

      // Sync ribs with hull bending
      for (let i = 0; i < ribPositions.count; i++) {
        const x = ribPositions.getX(i);
        const y = ribPositions.getY(i);
        const bendFactor = Math.sin(((x + hullLength/2) / hullLength) * Math.PI);
        const currentBend = bendFactor * Math.sin(frame * 15) * vibrationAmplitude * 1.5;
        if (y > -hullHeight/2) {
           ribPositions.setY(i, y + currentBend);
        }
      }
      ribPositions.needsUpdate = true;

      // Ship Pitching and Heaving (Sea State)
      hullGroup.rotation.z = Math.sin(frame * 0.3) * 0.02 * seaState;
      hullGroup.rotation.x = Math.cos(frame * 0.15) * 0.01 * seaState;
      hullGroup.position.y = Math.sin(frame * 0.6) * 0.4 * seaState;

      // Scanning Line Animation
      const scanning = stateRef.current.isScanning;
      
      if (scanning) {
        scanLine.visible = true;
        scanLine.position.x = Math.sin(frame * 0.3) * hullLength * 0.8;
        scanLine.scale.y = 1 + Math.sin(frame * 4) * 0.2;
        scanLineMat.opacity = 0.2 + Math.sin(frame * 6) * 0.15;
        
        // Reveal ribs when scanning line is near
        ribMaterial.opacity = 0.1 + (Math.abs(scanLine.position.x - hullGroup.position.x) < 5 ? 0.4 : 0);
      } else {
        scanLine.visible = false;
        ribMaterial.opacity = 0.05; // Very faint when not scanning
      }

      // Ocean Waves
      const oceanPos = oceanGeometry.attributes.position;
      for (let i = 0; i < oceanPos.count; i++) {
        const ox = oceanPos.getX(i);
        const oy = oceanPos.getY(i);
        const oz = Math.sin(ox * 0.06 + frame) * Math.cos(oy * 0.06 + frame) * 1.5 * seaState;
        oceanPos.setZ(i, oz);
      }
      oceanPos.needsUpdate = true;

      // Bow Spray Animation
      const sPos = sprayGeom.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < sprayCount; i++) {
        sPos.array[i * 3] += sprayVelocities[i * 3] * speed * 0.1;
        sPos.array[i * 3 + 1] += sprayVelocities[i * 3 + 1] * seaState * 0.2;
        sPos.array[i * 3 + 2] += sprayVelocities[i * 3 + 2];
        
        sprayVelocities[i * 3 + 1] -= 0.01; // Gravity

        if (sPos.array[i * 3 + 1] < -6) {
          sPos.array[i * 3] = -hullLength / 2; // Start at bow (flipped hull)
          sPos.array[i * 3 + 1] = -hullHeight / 2;
          sPos.array[i * 3 + 2] = (Math.random() - 0.5) * 2;
          sprayVelocities[i * 3 + 1] = 0.1 + Math.random() * 0.3;
        }
      }
      sPos.needsUpdate = true;

      // Particle Animation (Bubbles)
      const pPos = particlesGeom.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        pPos.array[i * 3] -= 0.1 * speed; // Move backward
        pPos.array[i * 3 + 1] += 0.03; // Rise
        if (pPos.array[i * 3] < -hullLength) {
          pPos.array[i * 3] = hullLength;
          pPos.array[i * 3 + 1] = -hullHeight / 2 - Math.random() * 5;
        }
      }
      pPos.needsUpdate = true;

      // Sensor pulsing & Label updates
      sensors.forEach((s, i) => {
        s.scale.setScalar(1 + Math.sin(frame * 8 + i) * 0.4);
        const label = labels[i];
        if (label) {
          // Update label text (simulated)
          const val = (vibrationAmplitude * (1 + Math.sin(frame * 2 + i))).toFixed(2);
          // Note: Canvas texture update is expensive, maybe just oscillate position
          label.position.y = hullHeight / 2 + 4.5 + Math.sin(frame * 2 + i) * 0.2;
        }
      });

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
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      hullGeometry.dispose();
      hullMaterial.dispose();
      oceanGeometry.dispose();
      oceanMaterial.dispose();
      bridgeGeom.dispose();
      bridgeMat.dispose();
      scanLineGeom.dispose();
      scanLineMat.dispose();
      sensorGeom.dispose();
      sensorMat.dispose();
      particlesGeom.dispose();
      particlesMat.dispose();
      ribGeometry.dispose();
      ribMaterial.dispose();
      propBladeGeom.dispose();
      propMat.dispose();
      sprayGeom.dispose();
      sprayMat.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" />;
};
