import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DredgerCutterHeadProps } from './three-types';

export const ThreeScene: React.FC<DredgerCutterHeadProps> = (props) => {
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
    scene.fog = new THREE.FogExp2(0x001122, 0.03); // Murky underwater

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 10, 20);

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

    const spotLight = new THREE.SpotLight(0x00ffff, 3);
    spotLight.position.set(10, 20, 10);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // Cutter Head Group
    const cutterGroup = new THREE.Group();
    scene.add(cutterGroup);

    // Main Hub
    const hubGeo = new THREE.SphereGeometry(2, 32, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.4 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    cutterGroup.add(hub);

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(1, 1, 10, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.x = -5;
    cutterGroup.add(shaft);

    // Blades and Teeth
    const numBlades = 6;
    const teethPerBlade = 5;
    const bladeGeo = new THREE.TorusGeometry(3, 0.5, 16, 32, Math.PI);
    const toothGeo = new THREE.ConeGeometry(0.3, 1, 8);
    
    const teeth: THREE.Mesh[] = [];
    const originalToothMats: THREE.MeshStandardMaterial[] = [];

    for (let i = 0; i < numBlades; i++) {
      const bladeGroup = new THREE.Group();
      
      // Blade curve
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.7, roughness: 0.5 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.y = Math.PI / 2;
      blade.position.x = 1;
      bladeGroup.add(blade);

      // Teeth on blade
      for (let j = 0; j < teethPerBlade; j++) {
        const t = j / (teethPerBlade - 1);
        const angle = t * Math.PI;
        
        const toothMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9, roughness: 0.1 });
        const tooth = new THREE.Mesh(toothGeo, toothMat);
        
        // Position along the torus
        tooth.position.set(1, Math.sin(angle) * 3, Math.cos(angle) * 3);
        
        // Point outward
        tooth.lookAt(1, Math.sin(angle) * 4, Math.cos(angle) * 4);
        tooth.rotateX(Math.PI / 2);

        bladeGroup.add(tooth);
        teeth.push(tooth);
        originalToothMats.push(toothMat);
      }

      bladeGroup.rotation.x = (i / numBlades) * Math.PI * 2;
      // Twist the blade slightly
      bladeGroup.rotation.z = Math.PI / 6;
      cutterGroup.add(bladeGroup);
    }

    // Particles (Sediment)
    const particleCount = 1000;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 15;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x665544, size: 0.1, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      
      const { rpm, wearLevel, isReplacing } = propsRef.current;

      if (!isReplacing) {
        // Normal operation: rotate cutter head
        cutterGroup.rotation.x -= (rpm / 60) * Math.PI * 2 * delta;
        
        // Swirl particles
        particles.rotation.x -= (rpm / 120) * Math.PI * 2 * delta;
        particleMat.opacity = 0.6;

        // Apply wear color to teeth
        const wearColor = new THREE.Color(0xaaaaaa).lerp(new THREE.Color(0x884422), wearLevel / 100);
        teeth.forEach(t => (t.material as THREE.MeshStandardMaterial).color.copy(wearColor));
      } else {
        // Replacement mode: stop rotation, highlight specific teeth
        particles.rotation.x -= 0.1 * delta; // Slow drift
        particleMat.opacity = 0.2; // Clearer water

        // Highlight every 5th tooth for replacement
        teeth.forEach((t, index) => {
          const mat = t.material as THREE.MeshStandardMaterial;
          if (index % 5 === 0) {
            mat.color.setHex(0xffaa00); // Highlight yellow
            mat.emissive.setHex(0xff5500);
            mat.emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 5) * 0.5;
            // Slightly detach
            t.position.x = 1.5;
          } else {
            mat.color.setHex(0x555555); // Dim others
            mat.emissiveIntensity = 0;
            t.position.x = 1.0;
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
      resizeObserver.disconnect();
      cancelAnimationFrame(animationId);
      renderer.dispose();
      hubGeo.dispose();
      hubMat.dispose();
      shaftGeo.dispose();
      shaftMat.dispose();
      bladeGeo.dispose();
      toothGeo.dispose();
      originalToothMats.forEach(m => m.dispose());
      particleGeo.dispose();
      particleMat.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
