import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PortConveyorBeltProps } from './three-types';

export const ThreeScene: React.FC<PortConveyorBeltProps> = (props) => {
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
    scene.background = new THREE.Color(0x1a1a1a); // Industrial dark

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffaa00, 1.2); // Warm industrial light
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const conveyorGroup = new THREE.Group();

    // Frame
    const frameGeo = new THREE.BoxGeometry(40, 1, 6);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.6 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 4;
    conveyorGroup.add(frame);

    // Rollers (Idlers)
    const rollerGeo = new THREE.CylinderGeometry(0.5, 0.5, 5.5, 16);
    const rollerMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.8 });
    const rollers: THREE.Mesh[] = [];
    
    for (let x = -18; x <= 18; x += 3) {
      const roller = new THREE.Mesh(rollerGeo, rollerMat);
      roller.rotation.x = Math.PI / 2;
      roller.position.set(x, 4.8, 0);
      rollers.push(roller);
      conveyorGroup.add(roller);
    }

    // Belt (Top and Bottom)
    const beltGeo = new THREE.BoxGeometry(40, 0.2, 5);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    
    const topBelt = new THREE.Mesh(beltGeo, beltMat);
    topBelt.position.y = 5.3;
    conveyorGroup.add(topBelt);

    const bottomBelt = new THREE.Mesh(beltGeo, beltMat);
    bottomBelt.position.y = 3.5;
    conveyorGroup.add(bottomBelt);

    // Bulk Material (Coal/Ore)
    const materialGeo = new THREE.BoxGeometry(38, 1, 4);
    const materialMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 1.0 }); // Dark coal-like
    const bulkMaterial = new THREE.Mesh(materialGeo, materialMat);
    bulkMaterial.position.y = 5.9;
    
    // Add some noise to the top of the material
    const positions = bulkMaterial.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        if (positions.getY(i) > 0) {
            positions.setY(i, positions.getY(i) + Math.random() * 0.5);
        }
    }
    bulkMaterial.geometry.computeVertexNormals();
    conveyorGroup.add(bulkMaterial);

    // Maintenance Crane / Hoist (Visible during overhaul)
    const hoistGeo = new THREE.BoxGeometry(2, 6, 8);
    const hoistMat = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
    const hoist = new THREE.Mesh(hoistGeo, hoistMat);
    hoist.position.set(0, 10, 0);
    hoist.visible = false;
    scene.add(hoist);

    scene.add(conveyorGroup);

    // Grid
    const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Texture for belt movement
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    if (context) {
        context.fillStyle = '#111';
        context.fillRect(0, 0, 256, 256);
        context.fillStyle = '#222';
        for (let i = 0; i < 256; i += 32) {
            context.fillRect(i, 0, 16, 256);
        }
    }
    const beltTexture = new THREE.CanvasTexture(canvas);
    beltTexture.wrapS = THREE.RepeatWrapping;
    beltTexture.wrapT = THREE.RepeatWrapping;
    beltMat.map = beltTexture;

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { beltSpeed, isOverhauling, rollerWear } = propsRef.current;

      if (isOverhauling) {
        // Overhaul mode: Belt stopped, hoist active, material hidden
        beltTexture.offset.x = 0;
        bulkMaterial.visible = false;
        hoist.visible = true;
        
        // Hoist moves along the belt
        hoist.position.x = Math.sin(time) * 15;
        
        // Highlight worn rollers
        rollers.forEach((roller, index) => {
            if (index % 3 === 0) { // Simulate some rollers being worn
                const wearColor = new THREE.Color(0x8899aa).lerp(new THREE.Color(0xff3300), rollerWear / 100);
                roller.material.color.copy(wearColor);
            }
        });
        
        // Lift top belt slightly
        topBelt.position.y = 6.0;
      } else {
        // Normal mode: Belt running, material visible
        hoist.visible = false;
        bulkMaterial.visible = true;
        topBelt.position.y = 5.3;
        
        // Move belt texture
        beltTexture.offset.x -= (beltSpeed / 10) * delta;
        
        // Rotate rollers
        rollers.forEach(roller => {
            roller.rotation.y += (beltSpeed / 5) * delta;
            roller.material.color.setHex(0x8899aa); // Reset color
        });
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
      frameGeo.dispose();
      frameMat.dispose();
      rollerGeo.dispose();
      rollerMat.dispose();
      beltGeo.dispose();
      beltMat.dispose();
      materialGeo.dispose();
      materialMat.dispose();
      hoistGeo.dispose();
      hoistMat.dispose();
      beltTexture.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
