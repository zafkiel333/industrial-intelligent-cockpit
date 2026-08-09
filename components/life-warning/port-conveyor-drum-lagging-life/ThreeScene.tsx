import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DrumState } from './three-types';

interface ThreeSceneProps {
  state: DrumState;
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
    scene.background = new THREE.Color(0x1e1b4b); // indigo-950
    scene.fog = new THREE.FogExp2(0x1e1b4b, 0.03);

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

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x6366f1, 2); // indigo-500
    spotLight.position.set(0, 15, 0);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    const drumGroup = new THREE.Group();
    scene.add(drumGroup);

    // Drum Core (Steel)
    const coreGeo = new THREE.CylinderGeometry(3.8, 3.8, 12, 64);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.rotation.x = Math.PI / 2;
    core.rotation.z = Math.PI / 2;
    drumGroup.add(core);

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(1, 1, 16, 32);
    const shaft = new THREE.Mesh(shaftGeo, coreMat);
    shaft.rotation.x = Math.PI / 2;
    shaft.rotation.z = Math.PI / 2;
    drumGroup.add(shaft);

    // Rubber Lagging (菱形花纹包胶)
    const laggingGeo = new THREE.CylinderGeometry(4, 4, 11.8, 64, 32);
    
    // Shader to show wear (thickness reduction, pattern disappearing) and heat from slip
    const laggingMat = new THREE.ShaderMaterial({
      uniforms: {
        uWear: { value: 0.0 }, // 0 to 1
        uSlip: { value: 0.0 }, // 0 to 1
        uBaseColor: { value: new THREE.Color(0x1c1917) }, // Dark rubber
        uWornColor: { value: new THREE.Color(0x44403c) }, // Lighter worn rubber
        uHotColor: { value: new THREE.Color(0xf43f5e) } // Rose-500 for heat
      },
      vertexShader: `
        uniform float uWear;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 pos = position;
          
          // Shrink radius based on wear
          // Normal points outward. Cylinder is along X axis due to rotation.
          // Actually, geometry is along Y axis before rotation, but we rotate the mesh.
          // So in local space, normal.xz are the radial directions.
          pos.x -= normal.x * uWear * 0.2;
          pos.z -= normal.z * uWear * 0.2;

          vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uWear;
        uniform float uSlip;
        uniform vec3 uBaseColor;
        uniform vec3 uWornColor;
        uniform vec3 uHotColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          // Diamond pattern (菱形花纹)
          float scale = 40.0;
          float diamond = abs(fract(vUv.x * scale + vUv.y * scale) - 0.5) + 
                          abs(fract(vUv.x * scale - vUv.y * scale) - 0.5);
          
          // Pattern fades as wear increases
          float patternVisibility = max(0.0, 1.0 - uWear * 1.5);
          float isGroove = smoothstep(0.4, 0.5, diamond) * patternVisibility;

          vec3 color = mix(uBaseColor, uWornColor, uWear);
          if (isGroove > 0.0) {
              color *= 0.6; // Darker in grooves
          }

          // Heat from slipping
          color = mix(color, uHotColor, uSlip * 0.8);

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.1);
          
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 16.0) * 0.1;
          
          gl_FragColor = vec4(color * diff + vec3(spec), 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    const lagging = new THREE.Mesh(laggingGeo, laggingMat);
    lagging.rotation.x = Math.PI / 2;
    lagging.rotation.z = Math.PI / 2;
    drumGroup.add(lagging);

    // Conveyor Belt (Top and bottom segments)
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.8 });
    
    // Top belt (coming in)
    const topBeltGeo = new THREE.BoxGeometry(11.8, 0.2, 10);
    const topBelt = new THREE.Mesh(topBeltGeo, beltMat);
    topBelt.position.set(0, 4, -5);
    scene.add(topBelt);

    // Bottom belt (going out)
    const bottomBeltGeo = new THREE.BoxGeometry(11.8, 0.2, 10);
    const bottomBelt = new THREE.Mesh(bottomBeltGeo, beltMat);
    bottomBelt.position.set(0, -4, -5);
    scene.add(bottomBelt);

    // Particles for dust/wear debris
    const dustCount = 500;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for(let i=0; i<dustCount; i++) {
        dustPos[i*3] = (Math.random() - 0.5) * 12;
        dustPos[i*3+1] = (Math.random() - 0.5) * 8;
        dustPos[i*3+2] = (Math.random() - 0.5) * 4 + 2; // Front of drum
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
        size: 0.1,
        color: 0x78716c,
        transparent: true,
        opacity: 0.5
    });
    const dustSystem = new THREE.Points(dustGeo, dustMat);
    scene.add(dustSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Drum Rotation
      // Speed in m/s. Radius is ~4m. Omega = v/r
      const omega = currentState.beltSpeed / 4.0;
      drumGroup.rotation.x -= omega * 0.016; // Rotate around X axis (which is local Y due to setup)

      // Update Shader
      const wearFactor = Math.min(1.0, currentState.laggingWear / 15.0); // 15mm is max wear
      laggingMat.uniforms.uWear.value = wearFactor;
      
      const slipFactor = Math.min(1.0, currentState.slipRate / 10.0); // 10% is severe slip
      laggingMat.uniforms.uSlip.value = slipFactor;

      // Dust animation (more dust if slipping or wearing)
      const positions = dustSystem.geometry.attributes.position.array as Float32Array;
      const dustIntensity = (currentState.beltSpeed * 0.1) + (slipFactor * 2.0);
      
      for(let i=0; i<dustCount; i++) {
          positions[i*3+1] -= 0.05 * dustIntensity; // Fall down
          positions[i*3+2] += 0.02 * dustIntensity; // Move forward
          
          if (positions[i*3+1] < -6 || positions[i*3+2] > 6) {
              // Respawn near the contact point of belt and drum
              positions[i*3] = (Math.random() - 0.5) * 12;
              positions[i*3+1] = (Math.random() > 0.5 ? 4 : -4) + (Math.random() - 0.5);
              positions[i*3+2] = Math.random() * 2;
          }
      }
      dustSystem.geometry.attributes.position.needsUpdate = true;
      dustMat.opacity = 0.2 + slipFactor * 0.6; // More visible when slipping

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
      coreGeo.dispose();
      coreMat.dispose();
      shaftGeo.dispose();
      laggingGeo.dispose();
      laggingMat.dispose();
      beltMat.dispose();
      topBeltGeo.dispose();
      bottomBeltGeo.dispose();
      dustGeo.dispose();
      dustMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
