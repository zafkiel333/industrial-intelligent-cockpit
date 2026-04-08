import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ReeferCompressorState } from './three-types';

interface ThreeSceneProps {
  state: ReeferCompressorState;
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
    scene.background = new THREE.Color(0x111827); // gray-900
    scene.fog = new THREE.FogExp2(0x111827, 0.02);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(10, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const compressorGroup = new THREE.Group();
    scene.add(compressorGroup);

    // Compressor Body (Cutaway)
    const bodyGeo = new THREE.CylinderGeometry(4, 4, 10, 32, 1, true, 0, Math.PI * 1.5);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, metalness: 0.6, roughness: 0.4, side: THREE.DoubleSide });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    compressorGroup.add(body);

    // Motor Stator
    const statorGeo = new THREE.CylinderGeometry(3.8, 3.8, 4, 32, 1, true, 0, Math.PI * 1.5);
    
    // Shader for motor heat
    const statorMat = new THREE.ShaderMaterial({
        uniforms: {
            uTemp: { value: 0.0 },
            uBaseColor: { value: new THREE.Color(0xb45309) }, // Copper
            uHeatColor: { value: new THREE.Color(0xfef08a) }  // Hot yellow
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTemp;
            uniform vec3 uBaseColor;
            uniform vec3 uHeatColor;
            varying vec3 vNormal;
            void main() {
                vec3 color = mix(uBaseColor, uHeatColor, uTemp);
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.2);
                gl_FragColor = vec4(color * diff, 1.0);
            }
        `,
        side: THREE.DoubleSide
    });
    const stator = new THREE.Mesh(statorGeo, statorMat);
    stator.position.y = -2;
    compressorGroup.add(stator);

    // Rotor & Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 12, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.8, roughness: 0.2 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    compressorGroup.add(shaft);

    // Scroll mechanism (simplified as rotating disks)
    const scrollFixedGeo = new THREE.CylinderGeometry(3.5, 3.5, 1, 32, 1, true, 0, Math.PI * 1.5);
    const scrollFixed = new THREE.Mesh(scrollFixedGeo, bodyMat);
    scrollFixed.position.y = 3;
    compressorGroup.add(scrollFixed);

    const scrollOrbitGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.8, 32);
    const scrollOrbit = new THREE.Mesh(scrollOrbitGeo, shaftMat);
    scrollOrbit.position.y = 2;
    compressorGroup.add(scrollOrbit);

    // Refrigerant Gas Particles
    const gasCount = 600;
    const gasGeo = new THREE.BufferGeometry();
    const gasPos = new Float32Array(gasCount * 3);
    const gasState = new Float32Array(gasCount); // 0 = suction (cold), 1 = discharge (hot)

    for(let i=0; i<gasCount; i++) {
        gasPos[i*3] = (Math.random() - 0.5) * 6;
        gasPos[i*3+1] = -5 + Math.random() * 10;
        gasPos[i*3+2] = (Math.random() - 0.5) * 6;
        gasState[i] = gasPos[i*3+1] > 2 ? 1.0 : 0.0;
    }
    gasGeo.setAttribute('position', new THREE.BufferAttribute(gasPos, 3));
    gasGeo.setAttribute('aState', new THREE.BufferAttribute(gasState, 1));

    const gasMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uSuctionP: { value: 1.0 },
            uDischargeP: { value: 1.0 }
        },
        vertexShader: `
            attribute float aState;
            varying float vState;
            uniform float uTime;
            uniform float uSuctionP;
            uniform float uDischargeP;
            
            void main() {
                vState = aState;
                vec3 pos = position;
                
                // Gas flows upwards through motor to scroll
                float speed = 2.0 + (aState == 1.0 ? uDischargeP : uSuctionP) * 0.5;
                pos.y += uTime * speed;
                
                // Wrap around
                if (pos.y > 5.0) {
                    pos.y = -5.0;
                    pos.x = (fract(sin(uTime * pos.x) * 43758.5453) - 0.5) * 6.0;
                    pos.z = (fract(cos(uTime * pos.z) * 43758.5453) - 0.5) * 6.0;
                }
                
                // Swirl effect
                float angle = uTime * 2.0;
                float nx = pos.x * cos(angle) - pos.z * sin(angle);
                float nz = pos.x * sin(angle) + pos.z * cos(angle);
                pos.x = nx;
                pos.z = nz;

                // State change at scroll (y ~ 2)
                vState = pos.y > 2.0 ? 1.0 : 0.0;

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                // Size depends on pressure
                float size = vState == 1.0 ? (2.0 + uDischargeP * 0.2) : (4.0 + uSuctionP * 0.5);
                gl_PointSize = size * (10.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying float vState;
            void main() {
                // Suction = Blue (cold, low pressure), Discharge = Red (hot, high pressure)
                vec3 color = mix(vec3(0.2, 0.6, 1.0), vec3(1.0, 0.2, 0.1), vState);
                float alpha = mix(0.4, 0.8, vState);
                
                vec2 coord = gl_PointCoord - vec2(0.5);
                if(length(coord) > 0.5) discard;
                
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const gasSystem = new THREE.Points(gasGeo, gasMat);
    compressorGroup.add(gasSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Shaft rotation
      const speed = 30; // High speed
      shaft.rotation.y += speed * 0.016;

      // Scroll orbiting motion
      scrollOrbit.position.x = Math.cos(time * speed) * 0.5;
      scrollOrbit.position.z = Math.sin(time * speed) * 0.5;

      // Vibration effect on the whole group
      const vib = currentState.vibration * 0.01;
      compressorGroup.position.x = (Math.random() - 0.5) * vib;
      compressorGroup.position.y = (Math.random() - 0.5) * vib;
      compressorGroup.position.z = (Math.random() - 0.5) * vib;

      // Update Motor Heat Shader
      const tempRatio = Math.max(0, Math.min(1, (currentState.motorTemp - 40) / 80));
      statorMat.uniforms.uTemp.value = tempRatio;

      // Update Gas Shader
      gasMat.uniforms.uTime.value = time;
      gasMat.uniforms.uSuctionP.value = currentState.suctionPressure;
      gasMat.uniforms.uDischargeP.value = currentState.dischargePressure;

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
      bodyGeo.dispose();
      bodyMat.dispose();
      statorGeo.dispose();
      statorMat.dispose();
      shaftGeo.dispose();
      shaftMat.dispose();
      scrollFixedGeo.dispose();
      scrollOrbitGeo.dispose();
      gasGeo.dispose();
      gasMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
