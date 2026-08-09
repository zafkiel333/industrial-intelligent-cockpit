import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SurfaceSubsidenceProps } from './three-types';

export const ThreeScene: React.FC<SurfaceSubsidenceProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a'); // slate-900
    scene.fog = new THREE.FogExp2('#0f172a', 0.015);
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(40, 30, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Terrain Geometry (High resolution for deformation)
    const terrainSize = 100;
    const segments = 64;
    const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);
    
    // Add some initial noise to terrain
    const positions = terrainGeo.attributes.position;
    const originalPositions = new Float32Array(positions.count * 3);
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      // Simple noise function
      const z = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2;
      positions.setZ(i, z);
      
      // Store original positions for deformation calculations
      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;
    }
    terrainGeo.computeVertexNormals();

    // Material with wireframe overlay for tech feel
    const terrainMat = new THREE.MeshStandardMaterial({ 
      color: 0x44403c, // stone-700
      roughness: 0.9,
      flatShading: true
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    // Wireframe helper
    const wireframeMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.2 });
    const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(terrainGeo), wireframeMat);
    terrain.add(wireframe);

    // Subsidence Center Marker (Target)
    const markerGeo = new THREE.TorusGeometry(5, 0.2, 16, 64);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.rotation.x = -Math.PI / 2;
    marker.position.y = 0.5;
    scene.add(marker);

    // Sensor Nodes
    const sensorGroup = new THREE.Group();
    scene.add(sensorGroup);
    const sensorGeo = new THREE.CylinderGeometry(0.5, 0.5, 2);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 }); // blue-500
    
    const sensorPositions = [
      { x: 15, z: 15 }, { x: -15, z: 15 }, { x: 15, z: -15 }, { x: -15, z: -15 },
      { x: 0, z: 25 }, { x: 0, z: -25 }, { x: 25, z: 0 }, { x: -25, z: 0 }
    ];

    const sensors: THREE.Mesh[] = [];
    sensorPositions.forEach(pos => {
      const sensor = new THREE.Mesh(sensorGeo, sensorMat);
      sensor.position.set(pos.x, 1, pos.z);
      sensorGroup.add(sensor);
      sensors.push(sensor);
    });

    // Crack Visualization (Line)
    const crackMat = new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 3 }); // yellow-400
    const crackGeo = new THREE.BufferGeometry();
    // Create a jagged line for the crack
    const crackPoints = [];
    let cx = -20, cz = -10;
    for (let i = 0; i < 10; i++) {
      crackPoints.push(new THREE.Vector3(cx, 0.2, cz));
      cx += 4 + Math.random() * 2;
      cz += (Math.random() - 0.5) * 5;
    }
    crackGeo.setFromPoints(crackPoints);
    const crackLine = new THREE.Line(crackGeo, crackMat);
    scene.add(crackLine);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { subsidenceRate, totalSubsidence, crackWidth, isAlert } = propsRef.current;

      // 1. Deform Terrain based on totalSubsidence
      // Create a sinkhole effect in the center
      const maxDeformation = (totalSubsidence / 500) * 15; // Map 0-500mm to 0-15 units depth
      const radius = 20;

      const posAttribute = terrainGeo.attributes.position;
      for (let i = 0; i < posAttribute.count; i++) {
        const x = originalPositions[i * 3];
        const y = originalPositions[i * 3 + 1];
        const origZ = originalPositions[i * 3 + 2];

        // Distance from center (0,0)
        const dist = Math.sqrt(x * x + y * y);
        
        // Gaussian-like depression
        let deformation = 0;
        if (dist < radius * 2) {
          deformation = maxDeformation * Math.exp(-(dist * dist) / (radius * radius));
        }

        // Apply deformation (Z is up in the PlaneGeometry before rotation)
        posAttribute.setZ(i, origZ - deformation);
      }
      posAttribute.needsUpdate = true;
      terrainGeo.computeVertexNormals(); // Recompute lighting

      // 2. Adjust Sensors to match terrain height
      sensors.forEach((sensor, index) => {
        const pos = sensorPositions[index];
        const dist = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
        let deformation = 0;
        if (dist < radius * 2) {
          deformation = maxDeformation * Math.exp(-(dist * dist) / (radius * radius));
        }
        sensor.position.y = 1 - deformation;
      });

      // 3. Animate Marker (Pulse)
      marker.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
      markerMat.opacity = 0.5 + Math.sin(time * 4) * 0.3;

      // 4. Update Crack Visualization
      // Width is simulated by opacity/color intensity here as LineBasicMaterial linewidth is often ignored by WebGL
      crackMat.opacity = Math.min(1, crackWidth / 20);
      if (crackWidth > 15) {
        crackMat.color.setHex(0xef4444); // Red if wide
      } else if (crackWidth > 5) {
        crackMat.color.setHex(0xfacc15); // Yellow
      } else {
        crackMat.color.setHex(0x4ade80); // Greenish if small
      }

      // 5. Alert Colors
      if (isAlert) {
        wireframeMat.color.setHex(0xef4444); // Red wireframe
        markerMat.color.setHex(0xef4444);
      } else if (subsidenceRate > 5 || totalSubsidence > 200) {
        wireframeMat.color.setHex(0xfacc15); // Yellow wireframe
        markerMat.color.setHex(0xfacc15);
      } else {
        wireframeMat.color.setHex(0x10b981); // Normal green wireframe
        markerMat.color.setHex(0x3b82f6); // Blue marker
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === mountRef.current) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
