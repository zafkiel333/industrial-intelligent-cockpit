import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ReeferContainerRackProps } from './three-types';

export const ThreeScene: React.FC<ReeferContainerRackProps> = (props) => {
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
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
    scene.fog = new THREE.FogExp2(0x315268, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(25, 15, 30);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Rack Structure
    const rackGroup = new THREE.Group();
    scene.add(rackGroup);

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.8, roughness: 0.3 });
    const beamGeo = new THREE.BoxGeometry(0.5, 20, 0.5);
    const horizBeamGeo = new THREE.BoxGeometry(20, 0.5, 0.5);
    const depthBeamGeo = new THREE.BoxGeometry(0.5, 0.5, 10);

    // Vertical beams
    for (let x = -10; x <= 10; x += 10) {
      for (let z = -5; z <= 5; z += 10) {
        const beam = new THREE.Mesh(beamGeo, steelMat);
        beam.position.set(x, 10, z);
        rackGroup.add(beam);
      }
    }

    // Horizontal beams
    for (let y = 0; y <= 20; y += 5) {
      for (let z = -5; z <= 5; z += 10) {
        const beam = new THREE.Mesh(horizBeamGeo, steelMat);
        beam.position.set(0, y, z);
        rackGroup.add(beam);
      }
      for (let x = -10; x <= 10; x += 10) {
        const beam = new THREE.Mesh(depthBeamGeo, steelMat);
        beam.position.set(x, y, 0);
        rackGroup.add(beam);
      }
    }

    // Containers and Cables
    const containers: THREE.Mesh[] = [];
    const cables: THREE.Mesh[] = [];
    const containerGeo = new THREE.BoxGeometry(8, 4, 8);
    
    // Power Panel
    const panelGeo = new THREE.BoxGeometry(2, 4, 1);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5, roughness: 0.5 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(12, 2, 0);
    rackGroup.add(panel);

    const cableGeo = new THREE.CylinderGeometry(0.1, 0.1, 10, 8);
    cableGeo.rotateZ(Math.PI / 2);

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 2; col++) {
        // Container
        const containerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.8 });
        const container = new THREE.Mesh(containerGeo, containerMat);
        container.position.set(col === 0 ? -5 : 5, row * 5 + 2.5, 0);
        rackGroup.add(container);
        containers.push(container);

        // Cable connecting to panel
        const cableMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cable = new THREE.Mesh(cableGeo, cableMat);
        cable.position.set(col === 0 ? 3.5 : 8.5, row * 5 + 2.5, 0);
        cable.scale.x = col === 0 ? 1.7 : 0.7; // Stretch to reach panel
        rackGroup.add(cable);
        cables.push(cable);
      }
    }

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      
      const { activePlugs, avgTemp, isTesting } = propsRef.current;

      // Update containers based on active plugs and temp
      containers.forEach((c, index) => {
        if (index < activePlugs) {
          // Active container: color based on temp
          // -20C = blue, 0C = white
          const tempRatio = Math.max(0, Math.min(1, (avgTemp + 20) / 20));
          const color = new THREE.Color(0x00aaff).lerp(new THREE.Color(0xffffff), tempRatio);
          (c.material as THREE.MeshStandardMaterial).color.copy(color);
          (c.material as THREE.MeshStandardMaterial).emissive.copy(color).multiplyScalar(0.2);
          
          // Cable glowing
          if (isTesting) {
            // Testing: cables flash yellow/red
            const flash = Math.sin(time * 10 + index) > 0 ? 0xffaa00 : 0xff0000;
            (cables[index].material as THREE.MeshBasicMaterial).color.setHex(flash);
          } else {
            // Normal: steady green
            (cables[index].material as THREE.MeshBasicMaterial).color.setHex(0x00ff00);
          }
          cables[index].visible = true;
        } else {
          // Inactive container
          (c.material as THREE.MeshStandardMaterial).color.setHex(0x555555);
          (c.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
          cables[index].visible = false;
        }
      });

      // Panel testing effect
      if (isTesting) {
        panel.position.x = 12 + Math.sin(time * 20) * 0.05; // Shaking
      } else {
        panel.position.x = 12;
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
      beamGeo.dispose();
      horizBeamGeo.dispose();
      depthBeamGeo.dispose();
      steelMat.dispose();
      containerGeo.dispose();
      panelGeo.dispose();
      panelMat.dispose();
      cableGeo.dispose();
      containers.forEach(c => (c.material as THREE.Material).dispose());
      cables.forEach(c => (c.material as THREE.Material).dispose());
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
