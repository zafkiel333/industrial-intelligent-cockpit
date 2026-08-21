import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LuffingMechanismState } from './three-types';

interface ThreeSceneProps {
  state: LuffingMechanismState;
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
    camera.position.set(15, 10, 20);

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

    const mechanismGroup = new THREE.Group();
    scene.add(mechanismGroup);

    // Rack and Pinion Luffing Mechanism
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x737373, metalness: 0.7, roughness: 0.3 }); // neutral-500
    
    // Pinion Gear
    const pinionGeo = new THREE.CylinderGeometry(2, 2, 1, 16);
    
    // Shader to show gear wear
    const gearMat = new THREE.ShaderMaterial({
        uniforms: {
            uWear: { value: 0.0 },
            uBaseColor: { value: new THREE.Color(0x737373) },
            uWearColor: { value: new THREE.Color(0xd97706) } // amber-600 (rust/wear)
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uWear;
            uniform vec3 uBaseColor;
            uniform vec3 uWearColor;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                // Wear is higher at the outer edge (teeth)
                float edgeFactor = smoothstep(1.0, 2.0, length(vPosition.xz));
                vec3 color = mix(uBaseColor, uWearColor, uWear * edgeFactor);
                
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.2);
                gl_FragColor = vec4(color * diff, 1.0);
            }
        `
    });

    const pinion = new THREE.Mesh(pinionGeo, gearMat);
    pinion.rotation.x = Math.PI / 2;
    mechanismGroup.add(pinion);

    // Rack
    const rackGeo = new THREE.BoxGeometry(1, 15, 1);
    const rack = new THREE.Mesh(rackGeo, gearMat.clone());
    rack.position.set(2.5, 0, 0);
    mechanismGroup.add(rack);

    // Support Structure
    const supportGeo = new THREE.BoxGeometry(4, 4, 2);
    const supportMat = new THREE.MeshStandardMaterial({ color: 0x262626, metalness: 0.5, roughness: 0.5 });
    const support = new THREE.Mesh(supportGeo, supportMat);
    support.position.set(0, 0, -1.5);
    mechanismGroup.add(support);

    // Wire Rope (Tension visualization)
    const ropeGeo = new THREE.CylinderGeometry(0.1, 0.1, 12, 8);
    const ropeMat = new THREE.ShaderMaterial({
        uniforms: {
            uTension: { value: 0.0 },
            uBaseColor: { value: new THREE.Color(0xa3a3a3) }, // neutral-400
            uTensionColor: { value: new THREE.Color(0xef4444) } // red-500
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTension;
            uniform vec3 uBaseColor;
            uniform vec3 uTensionColor;
            varying vec3 vNormal;
            void main() {
                vec3 color = mix(uBaseColor, uTensionColor, uTension);
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.2);
                gl_FragColor = vec4(color * diff, 1.0);
            }
        `
    });
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    rope.position.set(2.5, 6, 0);
    mechanismGroup.add(rope);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Luffing motion (up and down)
      // Simulate the boom moving up and down
      const luffingPhase = Math.sin(time * 0.5); // -1 to 1
      
      pinion.rotation.z = luffingPhase * 2;
      rack.position.y = luffingPhase * 4;
      rope.position.y = luffingPhase * 4 + 6;

      // Vibration effect
      const vib = currentState.vibration * 0.02;
      mechanismGroup.position.x = (Math.random() - 0.5) * vib;
      mechanismGroup.position.y = (Math.random() - 0.5) * vib;

      // Update Shaders
      const wearRatio = Math.max(0, Math.min(1, currentState.gearWear / 5)); // Max ~5mm wear
      (pinion.material as THREE.ShaderMaterial).uniforms.uWear.value = wearRatio;
      (rack.material as THREE.ShaderMaterial).uniforms.uWear.value = wearRatio;

      const tensionRatio = Math.max(0, Math.min(1, currentState.ropeTension / 500)); // Max ~500kN
      ropeMat.uniforms.uTension.value = tensionRatio;

      // Rope becomes thinner under high tension
      const ropeScale = 1.0 - (tensionRatio * 0.2);
      rope.scale.set(ropeScale, 1, ropeScale);

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
      pinionGeo.dispose();
      rackGeo.dispose();
      (pinion.material as THREE.Material).dispose();
      (rack.material as THREE.Material).dispose();
      supportGeo.dispose();
      supportMat.dispose();
      ropeGeo.dispose();
      ropeMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
