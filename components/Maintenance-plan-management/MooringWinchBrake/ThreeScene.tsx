import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MooringWinchBrakeProps } from './three-types';

export const ThreeScene: React.FC<MooringWinchBrakeProps> = (props) => {
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

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffddaa, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const winchGroup = new THREE.Group();

    // Winch Drum
    const drumGeo = new THREE.CylinderGeometry(3, 3, 8, 32);
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.6, roughness: 0.4 });
    const drum = new THREE.Mesh(drumGeo, drumMat);
    drum.rotation.x = Math.PI / 2;
    winchGroup.add(drum);

    // Mooring Rope (wrapped around drum)
    const ropeGeo = new THREE.CylinderGeometry(3.1, 3.1, 6, 32);
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xddccaa, roughness: 0.9 }); // Manila/synthetic rope color
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    rope.rotation.x = Math.PI / 2;
    winchGroup.add(rope);

    // Brake Drum (attached to main drum)
    const brakeDrumGeo = new THREE.CylinderGeometry(3.5, 3.5, 1.5, 32);
    const brakeDrumMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
    const brakeDrum = new THREE.Mesh(brakeDrumGeo, brakeDrumMat);
    brakeDrum.rotation.x = Math.PI / 2;
    brakeDrum.position.z = 4.5;
    winchGroup.add(brakeDrum);

    // Brake Band (The part being replaced)
    const brakeBandGeo = new THREE.TorusGeometry(3.6, 0.2, 16, 64, Math.PI * 1.5);
    const brakeBandMat = new THREE.MeshStandardMaterial({ color: 0x884422, roughness: 0.8 }); // Friction material
    const brakeBand = new THREE.Mesh(brakeBandGeo, brakeBandMat);
    brakeBand.position.z = 4.5;
    winchGroup.add(brakeBand);

    // Brake Lever/Mechanism
    const leverGeo = new THREE.BoxGeometry(0.5, 4, 0.5);
    const leverMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.7 });
    const lever = new THREE.Mesh(leverGeo, leverMat);
    lever.position.set(4, 2, 4.5);
    winchGroup.add(lever);

    // Base/Frame
    const baseGeo = new THREE.BoxGeometry(10, 1, 12);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x223322, metalness: 0.5, roughness: 0.6 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -3.5;
    winchGroup.add(base);

    scene.add(winchGroup);

    // Grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x444444, 0x222222);
    gridHelper.position.y = -4;
    scene.add(gridHelper);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { brakeWear, isReplacing, tension } = propsRef.current;

      if (isReplacing) {
        // Replacement mode: Brake band opens up and moves away
        brakeBand.position.y = Math.min(3, brakeBand.position.y + delta * 2);
        brakeBand.position.x = Math.min(3, brakeBand.position.x + delta * 2);
        
        // Highlight new brake band color
        brakeBandMat.color.setHex(0xaa5533); // Fresh friction material
        
        // Stop drum
        drum.rotation.y = 0;
        rope.rotation.y = 0;
        brakeDrum.rotation.y = 0;
        
        // Lever released
        lever.rotation.z = Math.PI / 4;
      } else {
        // Normal mode: Brake band in place
        brakeBand.position.set(0, 0, 4.5);
        
        // Visual wear on brake band
        const wearColor = new THREE.Color(0x884422).lerp(new THREE.Color(0x333333), brakeWear / 100);
        brakeBandMat.color.copy(wearColor);
        
        // Thickness decreases with wear (visual trick by scaling)
        const thickness = 1 - (brakeWear / 100) * 0.5;
        brakeBand.scale.set(1, 1, thickness);

        // Tension effect: Drum rotates slightly back and forth under load, lever engages
        if (tension > 50) {
            lever.rotation.z = 0; // Brake applied hard
            drum.rotation.y = Math.sin(time * 10) * 0.02 * (tension / 100); // Straining
        } else {
            lever.rotation.z = Math.PI / 8; // Brake partially applied
            drum.rotation.y += delta * 0.5; // Paying out/heaving in slowly
        }
        rope.rotation.y = drum.rotation.y;
        brakeDrum.rotation.y = drum.rotation.y;
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
      drumGeo.dispose();
      drumMat.dispose();
      ropeGeo.dispose();
      ropeMat.dispose();
      brakeDrumGeo.dispose();
      brakeDrumMat.dispose();
      brakeBandGeo.dispose();
      brakeBandMat.dispose();
      leverGeo.dispose();
      leverMat.dispose();
      baseGeo.dispose();
      baseMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
