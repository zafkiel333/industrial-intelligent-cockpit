import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TugboatPropulsionProps } from './three-types';

export const ThreeScene: React.FC<TugboatPropulsionProps> = (props) => {
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
    scene.fog = new THREE.FogExp2(0x050a15, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x00aaff, 3, 50);
    pointLight.position.set(5, 10, 5);
    scene.add(pointLight);

    // Z-Drive Group
    const zDriveGroup = new THREE.Group();
    scene.add(zDriveGroup);

    // Upper Gearbox
    const upperGeo = new THREE.CylinderGeometry(2, 2, 3, 32);
    const upperMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.8, roughness: 0.2 });
    const upper = new THREE.Mesh(upperGeo, upperMat);
    upper.position.y = 4;
    zDriveGroup.add(upper);

    // Vertical Shaft Housing
    const shaftGeo = new THREE.CylinderGeometry(1, 1, 6, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.7, roughness: 0.3 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = -0.5;
    zDriveGroup.add(shaft);

    // Lower Gearbox (Pod)
    const podGeo = new THREE.CapsuleGeometry(1.5, 3, 16, 32);
    podGeo.rotateZ(Math.PI / 2);
    const podMat = new THREE.MeshStandardMaterial({ color: 0x112233, metalness: 0.9, roughness: 0.1 });
    const pod = new THREE.Mesh(podGeo, podMat);
    pod.position.y = -4;
    zDriveGroup.add(pod);

    // Propeller Group
    const propellerGroup = new THREE.Group();
    propellerGroup.position.set(0, -4, -2);
    zDriveGroup.add(propellerGroup);

    // Hub
    const hubGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0xccaa44, metalness: 0.9, roughness: 0.2 }); // Bronze
    const hub = new THREE.Mesh(hubGeo, hubMat);
    propellerGroup.add(hub);

    // Blades
    const bladeGeo = new THREE.BoxGeometry(0.2, 3, 1);
    bladeGeo.translate(0, 1.5, 0);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xccaa44, metalness: 0.9, roughness: 0.2 });
    
    for (let i = 0; i < 4; i++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.z = (Math.PI / 2) * i;
      blade.rotation.x = Math.PI / 6; // Pitch
      propellerGroup.add(blade);
    }

    // Nozzle (Kort Nozzle)
    const nozzleGeo = new THREE.TorusGeometry(2.5, 0.4, 16, 64);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x441111, metalness: 0.5, roughness: 0.5 });
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzle.position.set(0, -4, -2);
    zDriveGroup.add(nozzle);

    // Wireframe for inspection mode
    const wireframeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.3 });
    const upperWire = new THREE.Mesh(upperGeo, wireframeMat);
    upperWire.position.copy(upper.position);
    upperWire.scale.set(1.05, 1.05, 1.05);
    zDriveGroup.add(upperWire);
    
    const podWire = new THREE.Mesh(podGeo, wireframeMat);
    podWire.position.copy(pod.position);
    podWire.scale.set(1.05, 1.05, 1.05);
    zDriveGroup.add(podWire);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      
      const { rpm, azimuthAngle, isInspecting } = propsRef.current;

      // Rotate entire Z-Drive based on azimuth angle
      const targetRotation = (azimuthAngle * Math.PI) / 180;
      zDriveGroup.rotation.y += (targetRotation - zDriveGroup.rotation.y) * 0.1;

      // Spin propeller based on RPM
      if (!isInspecting) {
        propellerGroup.rotation.z += (rpm / 60) * Math.PI * 2 * delta;
      }

      // Inspection mode effects
      if (isInspecting) {
        upper.material.opacity = 0.2;
        upper.material.transparent = true;
        pod.material.opacity = 0.2;
        pod.material.transparent = true;
        shaft.material.opacity = 0.2;
        shaft.material.transparent = true;
        
        upperWire.visible = true;
        podWire.visible = true;

        // Exploded view
        upper.position.y += (6 - upper.position.y) * 0.05;
        upperWire.position.copy(upper.position);
        pod.position.y += (-6 - pod.position.y) * 0.05;
        podWire.position.copy(pod.position);
        nozzle.position.z += (-4 - nozzle.position.z) * 0.05;
      } else {
        upper.material.opacity = 1;
        upper.material.transparent = false;
        pod.material.opacity = 1;
        pod.material.transparent = false;
        shaft.material.opacity = 1;
        shaft.material.transparent = false;
        
        upperWire.visible = false;
        podWire.visible = false;

        // Normal view
        upper.position.y += (4 - upper.position.y) * 0.1;
        pod.position.y += (-4 - pod.position.y) * 0.1;
        nozzle.position.z += (-2 - nozzle.position.z) * 0.1;
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
      upperGeo.dispose();
      upperMat.dispose();
      shaftGeo.dispose();
      shaftMat.dispose();
      podGeo.dispose();
      podMat.dispose();
      hubGeo.dispose();
      hubMat.dispose();
      bladeGeo.dispose();
      bladeMat.dispose();
      nozzleGeo.dispose();
      nozzleMat.dispose();
      wireframeMat.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
