import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OverheadCraneTrackProps } from './three-types';

export const ThreeScene: React.FC<OverheadCraneTrackProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth || 1;
    const height = mountRef.current.clientHeight || 1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a101a); // Dark blue-gray

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 5, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Factory Environment
    const floorGeo = new THREE.PlaneGeometry(100, 40);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Rails
    const railLength = 80;
    const railSpacing = 15;
    const railHeight = 10;
    
    const railGeo = new THREE.BoxGeometry(railLength, 0.5, 0.5);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8 });
    
    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(0, railHeight, -railSpacing / 2);
    scene.add(leftRail);

    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(0, railHeight, railSpacing / 2);
    scene.add(rightRail);

    // Pillars
    const pillarGeo = new THREE.BoxGeometry(1, railHeight, 1);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    for (let i = -30; i <= 30; i += 15) {
      const p1 = new THREE.Mesh(pillarGeo, pillarMat);
      p1.position.set(i, railHeight / 2, -railSpacing / 2);
      scene.add(p1);
      
      const p2 = new THREE.Mesh(pillarGeo, pillarMat);
      p2.position.set(i, railHeight / 2, railSpacing / 2);
      scene.add(p2);
    }

    // Crane Bridge
    const craneGroup = new THREE.Group();
    scene.add(craneGroup);

    const bridgeGeo = new THREE.BoxGeometry(2, 1, railSpacing + 2);
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xccaa00, metalness: 0.5 }); // Yellow crane
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.y = railHeight + 0.5;
    craneGroup.add(bridge);

    // Hoist
    const hoistGeo = new THREE.BoxGeometry(1.5, 1.5, 2);
    const hoistMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const hoist = new THREE.Mesh(hoistGeo, hoistMat);
    hoist.position.y = railHeight - 0.5;
    craneGroup.add(hoist);

    // Laser Calibration Beams
    const laserGeo = new THREE.CylinderGeometry(0.05, 0.05, railLength, 32);
    laserGeo.rotateZ(Math.PI / 2);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.6 });
    
    const leftLaser = new THREE.Mesh(laserGeo, laserMat);
    leftLaser.position.set(0, railHeight + 1, -railSpacing / 2);
    scene.add(leftLaser);

    const rightLaser = new THREE.Mesh(laserGeo, laserMat);
    rightLaser.position.set(0, railHeight + 1, railSpacing / 2);
    scene.add(rightLaser);

    // Deviation Indicators
    const devGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const devMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const devIndicator = new THREE.Mesh(devGeo, devMat);
    craneGroup.add(devIndicator);

    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const { cranePosition, deviation, isCalibrating } = propsRef.current;

      // Move crane
      craneGroup.position.x = cranePosition;

      // Apply deviation to one side of the bridge to simulate rail misalignment
      bridge.rotation.y = deviation * 0.1;
      
      // Update lasers
      if (isCalibrating) {
        laserMat.opacity = 0.6 + Math.sin(Date.now() * 0.01) * 0.3; // Pulsing laser
        leftLaser.visible = true;
        rightLaser.visible = true;
        
        // Show deviation indicator if deviation is high
        if (Math.abs(deviation) > 0.5) {
          devIndicator.visible = true;
          devIndicator.position.set(0, railHeight + 1, railSpacing / 2); // Show on right rail
          devMat.color.setHex(0xff0000); // Red for error
        } else {
          devIndicator.visible = true;
          devIndicator.position.set(0, railHeight + 1, railSpacing / 2);
          devMat.color.setHex(0x00ff00); // Green for aligned
        }
      } else {
        leftLaser.visible = false;
        rightLaser.visible = false;
        devIndicator.visible = false;
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
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      }
    });
    if (mountRef.current) resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      railGeo.dispose();
      railMat.dispose();
      pillarGeo.dispose();
      pillarMat.dispose();
      bridgeGeo.dispose();
      bridgeMat.dispose();
      hoistGeo.dispose();
      hoistMat.dispose();
      laserGeo.dispose();
      laserMat.dispose();
      devGeo.dispose();
      devMat.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
