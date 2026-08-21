import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SlewingBearingState } from './three-types';

interface ThreeSceneProps {
  state: SlewingBearingState;
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
    camera.position.set(0, 15, 25);

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

    const bearingGroup = new THREE.Group();
    scene.add(bearingGroup);

    // Outer Ring (Fixed)
    const outerRingGeo = new THREE.TorusGeometry(8, 1, 32, 64);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.8, roughness: 0.3 });
    const outerRing = new THREE.Mesh(outerRingGeo, metalMat);
    outerRing.rotation.x = Math.PI / 2;
    bearingGroup.add(outerRing);

    // Inner Ring (Rotating)
    const innerRingGeo = new THREE.TorusGeometry(6, 0.8, 32, 64);
    const innerRing = new THREE.Mesh(innerRingGeo, metalMat);
    innerRing.rotation.x = Math.PI / 2;
    bearingGroup.add(innerRing);

    // Rollers/Balls
    const rollerCount = 36;
    const rollers: THREE.Mesh[] = [];
    const rollerGeo = new THREE.SphereGeometry(0.8, 16, 16);
    // Shader for rollers to show stress/load
    const rollerMat = new THREE.ShaderMaterial({
        uniforms: {
            uLoad: { value: 0.0 },
            uBaseColor: { value: new THREE.Color(0xd4d4d8) }, // zinc-300
            uStressColor: { value: new THREE.Color(0xe11d48) } // rose-600
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uLoad;
            uniform vec3 uBaseColor;
            uniform vec3 uStressColor;
            varying vec3 vNormal;
            void main() {
                vec3 color = mix(uBaseColor, uStressColor, uLoad);
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.2);
                gl_FragColor = vec4(color * diff, 1.0);
            }
        `
    });

    for (let i = 0; i < rollerCount; i++) {
        const roller = new THREE.Mesh(rollerGeo, rollerMat.clone());
        const angle = (i / rollerCount) * Math.PI * 2;
        roller.position.x = Math.cos(angle) * 7;
        roller.position.z = Math.sin(angle) * 7;
        bearingGroup.add(roller);
        rollers.push(roller);
    }

    // Load visualization (Arrow/Force vector)
    const arrowHelper = new THREE.ArrowHelper(
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 5, 0),
        5,
        0xe11d48,
        1,
        0.5
    );
    bearingGroup.add(arrowHelper);

    // Grease/Iron particles
    const particleCount = 500;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 6.5 + Math.random() * 1.0;
        particlePos[i*3] = Math.cos(angle) * radius;
        particlePos[i*3+1] = (Math.random() - 0.5) * 0.5; // In the raceway
        particlePos[i*3+2] = Math.sin(angle) * radius;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
        size: 0.2,
        color: 0x52525b, // zinc-600 (grease)
        transparent: true,
        opacity: 0.8
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    bearingGroup.add(particleSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Rotation
      const speed = currentState.slewingSpeed * 0.05;
      innerRing.rotation.z -= speed * 0.016;

      // Overturning moment affects load distribution
      // Moment causes higher load on one side (e.g., front/back)
      const momentDirection = Math.sin(time * 0.5); // Simulate boom moving
      
      rollers.forEach((roller, i) => {
          const angle = (i / rollerCount) * Math.PI * 2;
          // Move rollers around the raceway
          const currentAngle = angle - innerRing.rotation.z * 0.5; // Rollers move at half speed
          roller.position.x = Math.cos(currentAngle) * 7;
          roller.position.z = Math.sin(currentAngle) * 7;

          // Calculate stress based on axial load and overturning moment
          const baseLoad = currentState.axialLoad / 2000; // Max ~2000t
          const momentLoad = (currentState.overturningMoment / 10000) * Math.cos(currentAngle - momentDirection);
          
          let totalLoad = baseLoad + momentLoad;
          totalLoad = Math.max(0, Math.min(1, totalLoad));

          (roller.material as THREE.ShaderMaterial).uniforms.uLoad.value = totalLoad;
      });

      // Update Force Arrow
      arrowHelper.setLength(3 + (currentState.axialLoad / 2000) * 4);
      // Tilt arrow based on moment
      const tiltAngle = (currentState.overturningMoment / 10000) * 0.5;
      arrowHelper.setDirection(new THREE.Vector3(Math.sin(tiltAngle), -Math.cos(tiltAngle), 0).normalize());

      // Grease particles (Iron content makes it darker/redder)
      const ironFactor = currentState.greaseIronContent / 500; // 500ppm is high
      particleMat.color.setRGB(
          0.32 + ironFactor * 0.5, // R increases (rust/iron)
          0.32 - ironFactor * 0.2, // G decreases
          0.35 - ironFactor * 0.2  // B decreases
      );

      // Rotate grease slowly
      particleSystem.rotation.y = innerRing.rotation.z * 0.5;

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
      outerRingGeo.dispose();
      innerRingGeo.dispose();
      metalMat.dispose();
      rollerGeo.dispose();
      rollerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
