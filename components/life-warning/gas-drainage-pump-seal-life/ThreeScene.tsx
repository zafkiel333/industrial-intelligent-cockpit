import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PumpSealState } from './three-types';

interface ThreeSceneProps {
  state: PumpSealState;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ state }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!mountRef.current) return;
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.03);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 0, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x2dd4bf, 2); // teal-400
    spotLight.position.set(0, 0, 20);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    const pumpGroup = new THREE.Group();
    scene.add(pumpGroup);

    // Pump Casing (Outer Ring)
    const casingGeo = new THREE.TorusGeometry(7, 1.5, 32, 64);
    const casingMat = new THREE.MeshStandardMaterial({ 
      color: 0x334155, 
      metalness: 0.8, 
      roughness: 0.4,
      transparent: true,
      opacity: 0.3 // Semi-transparent to see inside
    });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    pumpGroup.add(casing);

    // Impeller (Eccentrically mounted)
    const impellerGroup = new THREE.Group();
    impellerGroup.position.set(0, -1.5, 0); // Eccentricity
    pumpGroup.add(impellerGroup);

    const hubGeo = new THREE.CylinderGeometry(2, 2, 2, 32);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const hub = new THREE.Mesh(hubGeo, metalMat);
    hub.rotation.x = Math.PI / 2;
    impellerGroup.add(hub);

    // Blades
    const bladeCount = 12;
    for (let i = 0; i < bladeCount; i++) {
        const angle = (i / bladeCount) * Math.PI * 2;
        const bladeGeo = new THREE.BoxGeometry(0.2, 4, 1.8);
        const blade = new THREE.Mesh(bladeGeo, metalMat);
        blade.position.set(Math.cos(angle) * 3.5, Math.sin(angle) * 3.5, 0);
        blade.rotation.z = angle;
        impellerGroup.add(blade);
    }

    // Water Ring (The seal)
    const waterRingGeo = new THREE.TorusGeometry(6.5, 1.2, 32, 64);
    
    // Shader to simulate water ring dynamics (thickness, temperature, wear)
    const waterRingMat = new THREE.ShaderMaterial({
      uniforms: {
        uLevel: { value: 1.0 }, // 0 to 1
        uTemp: { value: 20.0 }, // Celsius
        uWear: { value: 0.0 }, // 0 to 1
        uTime: { value: 0.0 },
        uCoolColor: { value: new THREE.Color(0x0ea5e9) }, // sky-500
        uHotColor: { value: new THREE.Color(0xef4444) } // red-500
      },
      vertexShader: `
        uniform float uLevel;
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        // Noise
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m ; m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 pos = position;
          
          // Shrink the water ring based on level
          // Normal points outward from the torus tube
          pos -= normal * (1.0 - uLevel) * 0.8;
          
          // Add surface ripples
          float ripple = snoise(vec2(uv.x * 20.0 - uTime * 5.0, uv.y * 10.0));
          pos += normal * ripple * 0.1;

          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTemp;
        uniform float uWear;
        uniform vec3 uCoolColor;
        uniform vec3 uHotColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          // Heat mapping
          float heatFactor = clamp((uTemp - 20.0) / 60.0, 0.0, 1.0);
          vec3 color = mix(uCoolColor, uHotColor, heatFactor);
          
          // If wear is high, water gets dirty/bubbly
          vec3 dirtyColor = vec3(0.4, 0.5, 0.4);
          color = mix(color, dirtyColor, uWear * 0.5);

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // Water specularity
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 128.0);
          
          gl_FragColor = vec4(color * diff + vec3(0.8) * spec, 0.7);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    const waterRing = new THREE.Mesh(waterRingGeo, waterRingMat);
    pumpGroup.add(waterRing);

    // Gas Bubbles
    const bubbleCount = 500;
    const bubbleGeo = new THREE.BufferGeometry();
    const bubblePos = new Float32Array(bubbleCount * 3);
    for(let i=0; i<bubbleCount; i++) {
       const angle = Math.random() * Math.PI * 2;
       const r = 3 + Math.random() * 3;
       bubblePos[i*3] = Math.cos(angle) * r;
       bubblePos[i*3+1] = Math.sin(angle) * r;
       bubblePos[i*3+2] = (Math.random() - 0.5) * 1.5;
    }
    bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));
    
    const bubbleMat = new THREE.PointsMaterial({
      size: 0.2,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const bubbleSystem = new THREE.Points(bubbleGeo, bubbleMat);
    pumpGroup.add(bubbleSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Impeller Rotation
      impellerGroup.rotation.z -= 0.1;

      // Update Water Ring Shader
      waterRingMat.uniforms.uLevel.value = currentState.waterLevel / 100;
      waterRingMat.uniforms.uTemp.value = currentState.waterTemperature;
      waterRingMat.uniforms.uWear.value = currentState.sealWear / 100;
      waterRingMat.uniforms.uTime.value = time;

      // Bubble Animation (Gas being compressed)
      const positions = bubbleSystem.geometry.attributes.position.array as Float32Array;
      const vacuumFactor = currentState.vacuumDegree / 100; // 0 to 1
      
      for(let i=0; i<bubbleCount; i++) {
         let x = positions[i*3];
         let y = positions[i*3+1];
         
         // Rotate around center
         const angle = Math.atan2(y, x) - 0.05;
         let r = Math.sqrt(x*x + y*y);
         
         // Compression cycle (eccentricity)
         // Gas enters at top (r=6), compressed at bottom (r=3)
         if (y < 0) {
             r = Math.max(3.5, r - 0.05); // Compress
         } else {
             r = Math.min(6.5, r + 0.05); // Expand
         }
         
         // If water level is low, bubbles escape/scatter
         if (currentState.waterLevel < 60 && Math.random() > 0.9) {
             r += (Math.random() - 0.5) * 1.0;
         }

         positions[i*3] = Math.cos(angle) * r;
         positions[i*3+1] = Math.sin(angle) * r;
      }
      bubbleSystem.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || 1;
      const h = mountRef.current.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      casingGeo.dispose();
      casingMat.dispose();
      hubGeo.dispose();
      metalMat.dispose();
      waterRingGeo.dispose();
      waterRingMat.dispose();
      bubbleGeo.dispose();
      bubbleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
