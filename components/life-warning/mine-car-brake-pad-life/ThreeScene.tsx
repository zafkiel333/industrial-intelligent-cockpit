import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BrakePadState } from './three-types';

interface ThreeSceneProps {
  state: BrakePadState;
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
    scene.fog = new THREE.FogExp2(0x315268, 0.03);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0xf43f5e, 2); // rose-500
    spotLight.position.set(0, 10, 10);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    const brakeGroup = new THREE.Group();
    scene.add(brakeGroup);

    // Brake Disc
    const discGeo = new THREE.CylinderGeometry(6, 6, 0.5, 64);
    
    // Shader for disc to show heat (glowing red/orange)
    const discMat = new THREE.ShaderMaterial({
      uniforms: {
        uTemp: { value: 20.0 }, // Celsius
        uBaseColor: { value: new THREE.Color(0x64748b) }, // slate-500
        uHotColor: { value: new THREE.Color(0xff4500) } // OrangeRed
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTemp;
        uniform vec3 uBaseColor;
        uniform vec3 uHotColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 color = uBaseColor;
          
          // Heat mapping (glows above 200C)
          float heatFactor = clamp((uTemp - 200.0) / 400.0, 0.0, 1.0);
          
          // Add some radial banding to simulate friction rings
          float radius = length(vPosition.xy);
          float rings = sin(radius * 20.0) * 0.1 + 0.9;
          
          color = mix(color * rings, uHotColor, heatFactor);

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          // High specularity for metal disc
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 64.0);
          
          // Add emissive glow if very hot
          vec3 emissive = uHotColor * pow(heatFactor, 2.0) * 2.0;
          
          gl_FragColor = vec4(color * diff + vec3(0.5) * spec + emissive, 1.0);
        }
      `
    });

    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = Math.PI / 2;
    brakeGroup.add(disc);

    // Brake Caliper
    const caliperGroup = new THREE.Group();
    caliperGroup.position.set(5, 0, 0); // Placed on the edge of the disc
    brakeGroup.add(caliperGroup);

    const caliperBodyGeo = new THREE.BoxGeometry(3, 4, 2);
    const caliperMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.5 }); // Red caliper
    const caliperBody = new THREE.Mesh(caliperBodyGeo, caliperMat);
    caliperGroup.add(caliperBody);

    // Brake Pads (Inside caliper)
    const padGeo = new THREE.BoxGeometry(2.5, 3, 1);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 }); // Dark grey friction material
    
    const pad1 = new THREE.Mesh(padGeo, padMat);
    pad1.position.set(0, 0, 0.6); // Outer pad
    caliperGroup.add(pad1);

    const pad2 = new THREE.Mesh(padGeo, padMat);
    pad2.position.set(0, 0, -0.6); // Inner pad
    caliperGroup.add(pad2);

    // Heat/Smoke Particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
       particlePos[i*3] = 5 + (Math.random() - 0.5) * 2;
       particlePos[i*3+1] = (Math.random() - 0.5) * 3;
       particlePos[i*3+2] = (Math.random() - 0.5) * 1;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    
    const particleMat = new THREE.PointsMaterial({
      size: 0.5,
      color: 0x94a3b8, // smoke
      transparent: true,
      opacity: 0.0,
      blending: THREE.NormalBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Update Disc Shader
      discMat.uniforms.uTemp.value = currentState.temperature;

      // Disc Rotation (Speed decreases as braking force increases)
      const baseSpeed = 5.0;
      const brakingEffect = currentState.brakingForce / 50; // 0 to 1
      const currentSpeed = baseSpeed * (1.0 - brakingEffect);
      disc.rotation.y -= currentSpeed * 0.016;

      // Pad Thickness (Scale Z axis)
      // Assuming 20mm is new (scale 1.0), 5mm is worn (scale 0.25)
      const thicknessScale = Math.max(0.1, currentState.padThickness / 20.0);
      pad1.scale.z = thicknessScale;
      pad2.scale.z = thicknessScale;
      
      // Move pads closer to disc as they wear to simulate caliper piston adjustment
      // and squeeze during braking
      const squeeze = brakingEffect * 0.1;
      pad1.position.z = 0.25 + (thicknessScale * 0.5) - squeeze;
      pad2.position.z = -0.25 - (thicknessScale * 0.5) + squeeze;

      // Smoke Particles (Appear when temperature is very high)
      if (currentState.temperature > 400) {
          particleMat.opacity = Math.min(0.6, (currentState.temperature - 400) / 200);
          const positions = particleSystem.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<particleCount; i++) {
             positions[i*3+1] += 0.05 + Math.random() * 0.05; // Rise up
             positions[i*3] += (Math.random() - 0.5) * 0.05; // Drift
             
             if (positions[i*3+1] > 5) {
                 positions[i*3] = 5 + (Math.random() - 0.5) * 2;
                 positions[i*3+1] = (Math.random() - 0.5) * 2;
             }
          }
          particleSystem.geometry.attributes.position.needsUpdate = true;
      } else {
          particleMat.opacity = 0;
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
      discGeo.dispose();
      discMat.dispose();
      caliperBodyGeo.dispose();
      caliperMat.dispose();
      padGeo.dispose();
      padMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
