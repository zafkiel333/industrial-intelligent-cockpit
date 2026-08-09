import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { HydraulicSupportRoofProps } from './three-types';

export const ThreeScene: React.FC<HydraulicSupportRoofProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#111827'); // gray-900
    scene.fog = new THREE.FogExp2('#111827', 0.02);
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(20, 10, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // Lighting (Underground environment)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0xffffff, 1.5, 50, Math.PI / 4, 0.5, 1);
    spotLight.position.set(0, 15, 0);
    scene.add(spotLight);

    // Environment (Coal seam / Roof / Floor)
    const envGroup = new THREE.Group();
    
    // Roof
    const roofGeo = new THREE.BoxGeometry(40, 2, 40);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.9 }); // gray-700
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 10;
    envGroup.add(roof);

    // Floor
    const floorGeo = new THREE.BoxGeometry(40, 2, 40);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 1 }); // gray-800
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -1;
    envGroup.add(floor);

    scene.add(envGroup);

    // Hydraulic Support
    const supportGroup = new THREE.Group();
    
    // Base
    const baseGeo = new THREE.BoxGeometry(6, 1, 12);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.3 }); // amber-500
    const supportBase = new THREE.Mesh(baseGeo, metalMat);
    supportBase.position.y = 0.5;
    supportGroup.add(supportBase);

    // Canopy (Top part holding the roof)
    const canopyGeo = new THREE.BoxGeometry(6, 1, 14);
    const canopy = new THREE.Mesh(canopyGeo, metalMat);
    canopy.position.y = 8.5;
    supportGroup.add(canopy);

    // Hydraulic Legs (Cylinders)
    const legGeo = new THREE.CylinderGeometry(0.8, 0.8, 8, 16);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 }); // slate-400
    
    const leg1 = new THREE.Mesh(legGeo, legMat);
    leg1.position.set(-1.5, 4.5, 3);
    supportGroup.add(leg1);
    
    const leg2 = new THREE.Mesh(legGeo, legMat);
    leg2.position.set(1.5, 4.5, 3);
    supportGroup.add(leg2);

    const leg3 = new THREE.Mesh(legGeo, legMat);
    leg3.position.set(-1.5, 4.5, -3);
    supportGroup.add(leg3);
    
    const leg4 = new THREE.Mesh(legGeo, legMat);
    leg4.position.set(1.5, 4.5, -3);
    supportGroup.add(leg4);

    // Shield (Back plate)
    const shieldGeo = new THREE.BoxGeometry(5, 9, 1);
    const shield = new THREE.Mesh(shieldGeo, metalMat);
    shield.position.set(0, 4.5, -5.5);
    shield.rotation.x = -Math.PI / 12;
    supportGroup.add(shield);

    // Pressure Sensors (Glowing rings on legs)
    const sensorGeo = new THREE.TorusGeometry(0.9, 0.1, 8, 16);
    const sensorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 }); // sky-400
    const sensors: THREE.Mesh[] = [];
    [leg1, leg2, leg3, leg4].forEach(leg => {
      const sensor = new THREE.Mesh(sensorGeo, sensorMat.clone());
      sensor.rotation.x = Math.PI / 2;
      sensor.position.y = 0; // Middle of leg
      leg.add(sensor);
      sensors.push(sensor);
    });

    scene.add(supportGroup);

    // Dust particles
    const dustCount = 500;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPos[i] = (Math.random() - 0.5) * 30;
      dustPos[i + 1] = Math.random() * 10;
      dustPos[i + 2] = (Math.random() - 0.5) * 30;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0x9ca3af, size: 0.1, transparent: true, opacity: 0.3 });
    const dustSystem = new THREE.Points(dustGeo, dustMat);
    scene.add(dustSystem);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { supportPressure, roofSubsidence, tiltAngle, isAlert } = propsRef.current;

      // Roof subsidence animation
      const targetRoofY = 10 - (roofSubsidence / 100); // Scale subsidence for visual effect
      roof.position.y += (targetRoofY - roof.position.y) * 0.1; // Smooth transition

      // Canopy follows roof
      canopy.position.y = roof.position.y - 1.5;
      
      // Legs scale to match canopy height
      const legHeight = canopy.position.y - 1;
      const scaleY = legHeight / 8;
      [leg1, leg2, leg3, leg4].forEach(leg => {
        leg.scale.y = scaleY;
        leg.position.y = 1 + legHeight / 2;
      });

      // Tilt angle animation
      supportGroup.rotation.z = (tiltAngle * Math.PI) / 180;

      // Pressure sensor visualization
      sensors.forEach((sensor, index) => {
        const mat = sensor.material as THREE.MeshBasicMaterial;
        if (isAlert) {
          mat.color.setHex(0xef4444); // red-500
          sensor.scale.setScalar(1 + Math.sin(time * 10 + index) * 0.2);
        } else {
          // Color based on pressure (blue -> yellow -> red)
          const pressureRatio = supportPressure / 40; // Assuming 40 MPa is max normal
          mat.color.setHSL(0.6 - (pressureRatio * 0.6), 0.8, 0.5);
          sensor.scale.setScalar(1);
        }
      });

      // Dust animation
      const positions = dustGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < dustCount * 3; i += 3) {
        positions[i] -= 0.02; // Fall slowly
        if (positions[i] < 0) {
          positions[i] = 10; // Reset to top
        }
      }
      dustGeo.attributes.position.needsUpdate = true;
      // Increase dust opacity if subsidence is high
      dustMat.opacity = 0.3 + (roofSubsidence / 200);

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
