import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ShipLoaderChuteProps } from './three-types';

export const ThreeScene: React.FC<ShipLoaderChuteProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (!mountRef.current) return;

    console.log('父容器clientHeight:', mountRef.current.clientHeight);
    console.log('父容器offsetParent:', mountRef.current.offsetParent); // 查看包含块
    console.log('父容器计算样式:', getComputedStyle(mountRef.current).height);

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight+600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a192f);
    scene.fog = new THREE.FogExp2(0x0a192f, 0.02);

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
    controls.target.set(4, 5, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x00ffff, 3);
    spotLight.position.set(10, 30, 10);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    // Boom structure
    const boomGeo = new THREE.BoxGeometry(20, 2, 4);
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x556677, metalness: 0.4, roughness: 0.6 });
    const boom = new THREE.Mesh(boomGeo, boomMat);
    boom.position.set(0, 10, 0);
    scene.add(boom);

    // Chute group
    const chuteGroup = new THREE.Group();
    chuteGroup.position.set(8, 9, 0);
    scene.add(chuteGroup);

    // Fixed upper chute
    const upperChuteGeo = new THREE.CylinderGeometry(1.5, 1.5, 4, 16);
    const upperChuteMat = new THREE.MeshStandardMaterial({ color: 0x445566, metalness: 0.3, roughness: 0.7 });
    const upperChute = new THREE.Mesh(upperChuteGeo, upperChuteMat);
    upperChute.position.y = -2;
    chuteGroup.add(upperChute);

    // Telescopic lower chute
    const lowerChuteGeo = new THREE.CylinderGeometry(1.2, 1.2, 4, 16);
    const lowerChuteMat = new THREE.MeshStandardMaterial({ color: 0x667788, metalness: 0.3, roughness: 0.7 });
    const lowerChute = new THREE.Mesh(lowerChuteGeo, lowerChuteMat);
    lowerChute.position.y = -4;
    chuteGroup.add(lowerChute);

    // Dust particles
    const dustCount = 1000;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustVel = [];
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 4;
      dustPos[i * 3 + 1] = -8 + (Math.random() * 4);
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      dustVel.push({
        x: (Math.random() - 0.5) * 2,
        y: Math.random() * 2,
        z: (Math.random() - 0.5) * 2
      });
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({ 
      color: 0x887766, 
      size: 0.2, 
      transparent: true, 
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    chuteGroup.add(dustParticles);

    // Water mist particles
    const mistCount = 500;
    const mistGeo = new THREE.BufferGeometry();
    const mistPos = new Float32Array(mistCount * 3);
    for (let i = 0; i < mistCount; i++) {
      mistPos[i * 3] = (Math.random() - 0.5) * 6;
      mistPos[i * 3 + 1] = -6 + (Math.random() * 2);
      mistPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
    const mistMat = new THREE.PointsMaterial({ 
      color: 0x00ffff, 
      size: 0.15, 
      transparent: true, 
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const mistParticles = new THREE.Points(mistGeo, mistMat);
    chuteGroup.add(mistParticles);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      
      const { chuteExtension, dustLevel, isSpraying } = propsRef.current;

      // Animate telescopic chute
      const targetY = -4 - (chuteExtension / 100) * 4;
      lowerChute.position.y += (targetY - lowerChute.position.y) * 0.1;

      // Animate dust
      dustMat.opacity = (dustLevel / 100) * 0.8;
      const positions = dustGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        positions[i * 3] += dustVel[i].x * delta;
        positions[i * 3 + 1] += dustVel[i].y * delta;
        positions[i * 3 + 2] += dustVel[i].z * delta;

        if (positions[i * 3 + 1] > -4) {
          positions[i * 3] = (Math.random() - 0.5) * 3;
          positions[i * 3 + 1] = lowerChute.position.y - 2;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
        }
      }
      dustGeo.attributes.position.needsUpdate = true;

      // Animate mist
      mistParticles.visible = isSpraying;
      if (isSpraying) {
        const mPositions = mistGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < mistCount; i++) {
          mPositions[i * 3 + 1] -= delta * 2;
          if (mPositions[i * 3 + 1] < lowerChute.position.y - 4) {
            mPositions[i * 3] = (Math.random() - 0.5) * 5;
            mPositions[i * 3 + 1] = lowerChute.position.y;
            mPositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
          }
        }
        mistGeo.attributes.position.needsUpdate = true;
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
      boomGeo.dispose();
      boomMat.dispose();
      upperChuteGeo.dispose();
      upperChuteMat.dispose();
      lowerChuteGeo.dispose();
      lowerChuteMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      mistGeo.dispose();
      mistMat.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={mountRef} className="absolute top-10 inset-x-0 bottom-0" />;
};
