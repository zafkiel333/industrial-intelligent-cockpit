import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { StoragePoolSlopeProps } from './three-types';

export const ThreeScene: React.FC<StoragePoolSlopeProps> = (props) => {
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
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 50, 20);
    scene.add(directionalLight);

    // Slope Structure
    const slopeGroup = new THREE.Group();
    
    // Main Slope
    const slopeGeo = new THREE.PlaneGeometry(60, 60, 30, 30);
    
    // Displace vertices to create a slope and terrain
    const posAttribute = slopeGeo.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      const y = posAttribute.getY(i);
      // Create a slope from top to bottom
      let z = (y + 30) * 0.5; 
      // Add some noise
      z += Math.sin(x * 0.2) * Math.cos(y * 0.2) * 2;
      posAttribute.setZ(i, z);
    }
    slopeGeo.computeVertexNormals();

    const slopeMat = new THREE.MeshStandardMaterial({ 
      color: 0x4d7c0f, // lime-700
      roughness: 0.9,
      metalness: 0.1,
      wireframe: true
    });
    const slope = new THREE.Mesh(slopeGeo, slopeMat);
    slope.rotation.x = -Math.PI / 2;
    slopeGroup.add(slope);

    // Retaining Wall
    const wallGeo = new THREE.BoxGeometry(60, 10, 2);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x64748b }); // slate-500
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 5, 30);
    slopeGroup.add(wall);

    // Water Pool at the bottom
    const poolGeo = new THREE.PlaneGeometry(60, 20);
    const poolMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // sky-600
      transparent: true,
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.8
    });
    const pool = new THREE.Mesh(poolGeo, poolMat);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0, 0.5, 40);
    slopeGroup.add(pool);

    // Monitoring Sensors (GNSS/Prisms)
    const sensors: THREE.Mesh[] = [];
    const sensorGeo = new THREE.CylinderGeometry(0.5, 0.5, 2, 16);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 }); // yellow-400
    
    const sensorPositions = [
      [-15, 15, -10], [0, 20, -20], [15, 10, 0], [-20, 5, 15], [20, 8, 10]
    ];

    sensorPositions.forEach(pos => {
      const sensor = new THREE.Mesh(sensorGeo, sensorMat);
      sensor.position.set(pos[0], pos[1], pos[2]);
      slopeGroup.add(sensor);
      sensors.push(sensor);
      
      // Add a small blinking light to each sensor
      const lightGeo = new THREE.SphereGeometry(0.3, 8, 8);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0x22c55e }); // green-500
      const light = new THREE.Mesh(lightGeo, lightMat);
      light.position.y = 1.2;
      sensor.add(light);
    });

    // Rain particles
    const rainCount = 1000;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPos[i] = (Math.random() - 0.5) * 80;
      rainPos[i + 1] = Math.random() * 40 + 10;
      rainPos[i + 2] = (Math.random() - 0.5) * 80;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0xbae6fd, // sky-200
      size: 0.2,
      transparent: true,
      opacity: 0.6
    });
    const rainSystem = new THREE.Points(rainGeo, rainMat);
    scene.add(rainSystem);

    scene.add(slopeGroup);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { displacement, soilMoisture, rainfall, isAlert } = propsRef.current;

      // Rain animation based on rainfall
      if (rainfall > 0) {
        rainSystem.visible = true;
        const positions = rainGeo.attributes.position.array as Float32Array;
        for (let i = 1; i < rainCount * 3; i += 3) {
          positions[i] -= (rainfall / 10) + 0.5; // fall speed
          if (positions[i] < 0) {
            positions[i] = 40; // reset to top
          }
        }
        rainGeo.attributes.position.needsUpdate = true;
        rainMat.opacity = Math.min(0.8, rainfall / 50);
      } else {
        rainSystem.visible = false;
      }

      // Slope color based on moisture (darker when wet)
      const moistureFactor = soilMoisture / 100;
      slopeMat.color.setHSL(0.25, 0.6, 0.3 - (moistureFactor * 0.15));

      // Sensor blinking and displacement visualization
      sensors.forEach((sensor, index) => {
        const light = sensor.children[0] as THREE.Mesh;
        const lightMat = light.material as THREE.MeshBasicMaterial;
        
        if (isAlert) {
          lightMat.color.setHex(Math.sin(time * 8 + index) > 0 ? 0xff0000 : 0x550000);
          // Exaggerate displacement slightly for visual effect during alert
          sensor.position.x += Math.sin(time * 2 + index) * (displacement / 50) * 0.05;
        } else {
          lightMat.color.setHex(Math.sin(time * 2 + index) > 0 ? 0x22c55e : 0x064e3b);
        }
      });

      // Water pool ripple
      pool.position.y = 0.5 + Math.sin(time) * 0.2;

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
