import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { HydrologicalStationProps } from './three-types';

export const ThreeScene: React.FC<HydrologicalStationProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    mountRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#080c16');
    
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(20, 15, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Station Structure
    const stationGroup = new THREE.Group();
    
    // Platform
    const platformGeo = new THREE.CylinderGeometry(4, 4, 1, 32);
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = 0.5;
    stationGroup.add(platform);

    // Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.5, 0.5, 10, 16);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 5;
    stationGroup.add(pillar);

    // Sensors
    const sensorGeo = new THREE.BoxGeometry(1.5, 1, 1.5);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.y = 10;
    stationGroup.add(sensor);

    // Anemometer (Wind speed)
    const anemometerGroup = new THREE.Group();
    anemometerGroup.position.set(0, 11, 0);
    const rodGeo = new THREE.CylinderGeometry(0.1, 0.1, 2);
    const rod = new THREE.Mesh(rodGeo, pillarMat);
    rod.rotation.z = Math.PI / 2;
    anemometerGroup.add(rod);
    
    const cupGeo = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI);
    const cupMat = new THREE.MeshStandardMaterial({ color: 0xcc0000 });
    const cup1 = new THREE.Mesh(cupGeo, cupMat);
    cup1.position.set(1, 0, 0);
    anemometerGroup.add(cup1);
    const cup2 = new THREE.Mesh(cupGeo, cupMat);
    cup2.position.set(-1, 0, 0);
    cup2.rotation.y = Math.PI;
    anemometerGroup.add(cup2);
    
    stationGroup.add(anemometerGroup);

    scene.add(stationGroup);

    // Water Surface
    const waterGeo = new THREE.PlaneGeometry(40, 40, 32, 32);
    const waterMat = new THREE.MeshPhongMaterial({ 
      color: 0x0055ff, 
      transparent: true, 
      opacity: 0.6,
      shininess: 100
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // Rain Particles
    const rainGeo = new THREE.BufferGeometry();
    const rainCount = 1500;
    const rainPos = new Float32Array(rainCount * 3);
    for(let i=0; i<rainCount*3; i+=3) {
      rainPos[i] = (Math.random() - 0.5) * 40;
      rainPos[i+1] = Math.random() * 20;
      rainPos[i+2] = (Math.random() - 0.5) * 40;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    });
    const rain = new THREE.Points(rainGeo, rainMat);
    scene.add(rain);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { waterLevel, flowVelocity, rainfall, isAlert } = propsRef.current;

      // Water level and waves
      water.position.y = (waterLevel / 100) * 5 - 2; // Map 0-100 to -2 to 3
      const vertices = waterGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = Math.sin(vertices[i] * 0.5 + time * (flowVelocity/10)) * 0.5;
      }
      waterGeo.attributes.position.needsUpdate = true;

      // Anemometer rotation
      anemometerGroup.rotation.y += (flowVelocity / 50);

      // Rain animation
      const rPositions = rainGeo.attributes.position.array as Float32Array;
      for(let i=1; i<rainCount*3; i+=3) {
        rPositions[i] -= (rainfall / 20) + 0.1;
        if (rPositions[i] < 0) {
          rPositions[i] = 20;
        }
      }
      rainGeo.attributes.position.needsUpdate = true;
      rain.visible = rainfall > 0;

      if (isAlert) {
        cupMat.color.setHex(0xff0000);
        waterMat.color.setHex(0x002288);
      } else {
        cupMat.color.setHex(0x00ff00);
        waterMat.color.setHex(0x0055ff);
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
