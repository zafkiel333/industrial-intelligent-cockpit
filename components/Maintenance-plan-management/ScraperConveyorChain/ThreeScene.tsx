import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ScraperConveyorChainProps } from './three-types';

export const ThreeScene: React.FC<ScraperConveyorChainProps> = (props) => {
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

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050a15, 0.02);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 15, 20);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0x00ffff, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const conveyorGroup = new THREE.Group();

    // Chute (Pan)
    const chuteGeo = new THREE.BoxGeometry(30, 1, 6);
    const chuteMat = new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.5, roughness: 0.5 });
    const chute = new THREE.Mesh(chuteGeo, chuteMat);
    chute.position.y = 0;
    conveyorGroup.add(chute);

    // Chains and Scrapers
    const chainGroup = new THREE.Group();
    const scrapers: THREE.Mesh[] = [];
    
    const scraperGeo = new THREE.BoxGeometry(0.5, 0.8, 5.8);
    const scraperMat = new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.8, roughness: 0.2 });
    
    const linkGeo = new THREE.TorusGeometry(0.2, 0.08, 8, 16);
    const linkMat = new THREE.MeshStandardMaterial({ color: 0x778899, metalness: 0.9, roughness: 0.1 });

    const numScrapers = 10;
    const spacing = 30 / numScrapers;

    for (let i = 0; i < numScrapers; i++) {
      const scraper = new THREE.Mesh(scraperGeo, scraperMat);
      scraper.position.set(-15 + i * spacing, 0.9, 0);
      scrapers.push(scraper);
      chainGroup.add(scraper);

      // Add chain links between scrapers
      for (let j = 0; j < 5; j++) {
        const link1 = new THREE.Mesh(linkGeo, linkMat);
        link1.position.set(-15 + i * spacing + j * (spacing/5), 0.9, 2);
        link1.rotation.x = Math.PI / 2;
        if (j % 2 !== 0) link1.rotation.y = Math.PI / 2;
        chainGroup.add(link1);

        const link2 = new THREE.Mesh(linkGeo, linkMat);
        link2.position.set(-15 + i * spacing + j * (spacing/5), 0.9, -2);
        link2.rotation.x = Math.PI / 2;
        if (j % 2 !== 0) link2.rotation.y = Math.PI / 2;
        chainGroup.add(link2);
      }
    }

    conveyorGroup.add(chainGroup);
    scene.add(conveyorGroup);

    // Coal particles
    const coalGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const coalMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const coals: THREE.Mesh[] = [];
    
    for (let i = 0; i < 50; i++) {
      const coal = new THREE.Mesh(coalGeo, coalMat);
      coal.position.set((Math.random() - 0.5) * 30, 1.2, (Math.random() - 0.5) * 4);
      coal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      coals.push(coal);
      scene.add(coal);
    }

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      const { chainSpeed, tension, isMaintaining } = propsRef.current;

      if (isMaintaining) {
        // Maintenance mode: stopped, highlight loose chain
        const tensionColor = new THREE.Color(0x00ffcc).lerp(new THREE.Color(0xff0000), (100 - tension) / 50);
        chainGroup.children.forEach(child => {
          if (child.geometry === linkGeo) {
            (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({ color: tensionColor, emissive: tensionColor, emissiveIntensity: 0.5 });
          }
        });
        
        // Simulate loose chain sagging
        const sag = (100 - tension) * 0.01;
        chainGroup.children.forEach(child => {
          if (child.geometry === linkGeo) {
             child.position.y = 0.9 - Math.sin(child.position.x * Math.PI / spacing) * sag;
          }
        });
      } else {
        // Normal mode: moving
        chainGroup.children.forEach(child => {
          if (child.geometry === linkGeo) {
            (child as THREE.Mesh).material = linkMat;
            child.position.y = 0.9; // Reset sag
          }
        });

        const moveDist = chainSpeed * delta * 0.1;
        
        // Move chain and scrapers
        chainGroup.children.forEach(child => {
          child.position.x += moveDist;
          if (child.position.x > 15) {
            child.position.x -= 30;
          }
        });

        // Move coal
        coals.forEach(coal => {
          coal.position.x += moveDist;
          if (coal.position.x > 15) {
            coal.position.x = -15;
            coal.position.z = (Math.random() - 0.5) * 4;
          }
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
      
      cancelAnimationFrame(animationId);
      renderer.dispose();
      chuteGeo.dispose();
      chuteMat.dispose();
      scraperGeo.dispose();
      scraperMat.dispose();
      linkGeo.dispose();
      linkMat.dispose();
      coalGeo.dispose();
      coalMat.dispose();
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
