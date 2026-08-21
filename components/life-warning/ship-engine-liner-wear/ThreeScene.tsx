import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LinerState } from './three-types';

interface ThreeSceneProps {
  state: LinerState;
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
    scene.background = new THREE.Color(0x315268); // 2026-08-21：统一为工业蓝灰三维视窗背景
    scene.fog = new THREE.FogExp2(0x315268, 0.02);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(0, 5, 20);

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

    const spotLight = new THREE.SpotLight(0xf97316, 2); // orange-500
    spotLight.position.set(0, 15, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    const engineGroup = new THREE.Group();
    scene.add(engineGroup);

    // Cylinder Liner (Cutaway)
    const linerGeo = new THREE.CylinderGeometry(5, 5.5, 12, 64, 32, true, 0, Math.PI * 1.5);
    
    // Shader for liner to show wear (scuffing/scoring) and temperature
    const linerMat = new THREE.ShaderMaterial({
      uniforms: {
        uWear: { value: 0.0 }, // 0 to 1
        uTemp: { value: 0.0 }, // 0 to 1
        uBaseColor: { value: new THREE.Color(0x64748b) }, // slate-500
        uWearColor: { value: new THREE.Color(0x1e293b) }, // dark scoring
        uHotColor: { value: new THREE.Color(0xf97316) } // orange-500
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uWear;
        uniform float uTemp;
        uniform vec3 uBaseColor;
        uniform vec3 uWearColor;
        uniform vec3 uHotColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          vec3 color = uBaseColor;
          
          // Vertical scoring marks (wear)
          float scoreNoise = rand(vec2(vUv.x * 100.0, 0.0));
          if (scoreNoise < uWear * 0.5) {
              color = mix(color, uWearColor, 0.8);
          }
          
          // Heat mapping (hotter at the top combustion zone)
          float heatZone = smoothstep(0.5, 1.0, vUv.y);
          color = mix(color, uHotColor, uTemp * heatZone * 0.8);

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // Honing marks (crosshatch pattern)
          float hatch1 = sin((vUv.x * 50.0 + vUv.y * 50.0) * 3.14);
          float hatch2 = sin((vUv.x * 50.0 - vUv.y * 50.0) * 3.14);
          float honing = (hatch1 + hatch2) * 0.05 * (1.0 - uWear); // Fades as it wears
          
          gl_FragColor = vec4(color * diff + vec3(honing), 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    const liner = new THREE.Mesh(linerGeo, linerMat);
    engineGroup.add(liner);

    // Piston
    const pistonGroup = new THREE.Group();
    engineGroup.add(pistonGroup);

    const pistonGeo = new THREE.CylinderGeometry(4.9, 4.9, 4, 32);
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const piston = new THREE.Mesh(pistonGeo, pistonMat);
    pistonGroup.add(piston);

    // Piston Rings
    const ringGeo = new THREE.TorusGeometry(4.95, 0.1, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xfde047, metalness: 0.9, roughness: 0.1 }); // Bronze/Yellowish
    
    for(let i=0; i<3; i++) {
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 1.5 - i * 0.5;
        pistonGroup.add(ring);
    }

    // Connecting Rod
    const rodGeo = new THREE.CylinderGeometry(0.8, 0.8, 8, 16);
    const rod = new THREE.Mesh(rodGeo, pistonMat);
    rod.position.y = -4;
    pistonGroup.add(rod);

    // Combustion Fire/Gas Particles
    const fireCount = 500;
    const fireGeo = new THREE.BufferGeometry();
    const firePos = new Float32Array(fireCount * 3);
    for(let i=0; i<fireCount; i++) {
       firePos[i*3] = (Math.random() - 0.5) * 8;
       firePos[i*3+1] = 4 + Math.random() * 2;
       firePos[i*3+2] = (Math.random() - 0.5) * 8;
    }
    fireGeo.setAttribute('position', new THREE.BufferAttribute(firePos, 3));
    
    const fireMat = new THREE.PointsMaterial({
      size: 0.8,
      color: 0xf97316, // orange-500
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending
    });
    const fireSystem = new THREE.Points(fireGeo, fireMat);
    engineGroup.add(fireSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Piston Kinematics
      // Speed determines frequency
      const freq = currentState.pistonSpeed * 2.0;
      const stroke = 4.0;
      pistonGroup.position.y = Math.sin(time * freq) * stroke;

      // Update Liner Shader
      linerMat.uniforms.uWear.value = Math.min(1.0, currentState.wearDepth / 2.0); // 2mm is max
      linerMat.uniforms.uTemp.value = Math.max(0, (currentState.temperature - 150) / 150);

      // Combustion Effect (Flashes when piston is at top dead center)
      const cycle = Math.sin(time * freq);
      if (cycle > 0.9) {
          fireMat.opacity = 0.8 * ((currentState.temperature - 100) / 200);
          const positions = fireSystem.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<fireCount; i++) {
             // Expand outwards
             positions[i*3] *= 1.05;
             positions[i*3+2] *= 1.05;
             
             // Reset if too far
             if (Math.abs(positions[i*3]) > 4.5) {
                 positions[i*3] = (Math.random() - 0.5) * 2;
                 positions[i*3+1] = pistonGroup.position.y + 2 + Math.random() * 2;
                 positions[i*3+2] = (Math.random() - 0.5) * 2;
             }
          }
          fireSystem.geometry.attributes.position.needsUpdate = true;
      } else {
          fireMat.opacity *= 0.8; // Fade out
      }

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
      linerGeo.dispose();
      linerMat.dispose();
      pistonGeo.dispose();
      pistonMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      rodGeo.dispose();
      fireGeo.dispose();
      fireMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
