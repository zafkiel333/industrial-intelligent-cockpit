import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MotorBearingState } from './three-types';

interface ThreeSceneProps {
  state: MotorBearingState;
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
    camera.position.set(0, 10, 20);

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

    const spotLight = new THREE.SpotLight(0xf59e0b, 2); // amber-500
    spotLight.position.set(0, 15, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    const bearingGroup = new THREE.Group();
    scene.add(bearingGroup);

    // Bearing Outer Ring
    const outerRingGeo = new THREE.TorusGeometry(6, 1, 32, 64);
    const metalMat = new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, 
      metalness: 0.9, 
      roughness: 0.2 
    });
    const outerRing = new THREE.Mesh(outerRingGeo, metalMat);
    bearingGroup.add(outerRing);

    // Bearing Inner Ring (attached to shaft)
    const innerRingGeo = new THREE.TorusGeometry(4, 0.8, 32, 64);
    const innerRing = new THREE.Mesh(innerRingGeo, metalMat);
    bearingGroup.add(innerRing);

    // Shaft
    const shaftGeo = new THREE.CylinderGeometry(3.2, 3.2, 10, 32);
    const shaft = new THREE.Mesh(shaftGeo, metalMat);
    shaft.rotation.x = Math.PI / 2;
    bearingGroup.add(shaft);

    // Rolling Elements (Balls)
    const ballCount = 12;
    const balls: THREE.Mesh[] = [];
    const ballGeo = new THREE.SphereGeometry(0.9, 32, 32);
    
    // Custom shader for balls to show heat and defect (spalling)
    const ballMat = new THREE.ShaderMaterial({
      uniforms: {
        uTemp: { value: 40.0 }, // Celsius
        uDefect: { value: 0.0 }, // 0 to 1
        uBaseColor: { value: new THREE.Color(0xcbd5e1) },
        uHotColor: { value: new THREE.Color(0xef4444) }, // red-500
        uDefectColor: { value: new THREE.Color(0x1e293b) } // dark pit
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
        uniform float uDefect;
        uniform vec3 uBaseColor;
        uniform vec3 uHotColor;
        uniform vec3 uDefectColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;

        float rand(vec3 co){
            return fract(sin(dot(co ,vec3(12.9898,78.233, 45.164))) * 43758.5453);
        }

        void main() {
          vec3 color = uBaseColor;
          
          // Heat mapping
          float heatFactor = clamp((uTemp - 60.0) / 60.0, 0.0, 1.0);
          color = mix(color, uHotColor, heatFactor);
          
          // Defect (Spalling)
          float noise = rand(vPosition * 10.0);
          if (noise > 0.95 - (uDefect * 0.1)) {
              color = mix(color, uDefectColor, uDefect);
          }

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 64.0);
          
          gl_FragColor = vec4(color * diff + vec3(0.5) * spec, 1.0);
        }
      `
    });

    for (let i = 0; i < ballCount; i++) {
      const angle = (i / ballCount) * Math.PI * 2;
      const ball = new THREE.Mesh(ballGeo, ballMat.clone());
      ball.position.set(Math.cos(angle) * 5, Math.sin(angle) * 5, 0);
      bearingGroup.add(ball);
      balls.push(ball);
    }

    // Grease/Lubrication Particles
    const greaseCount = 500;
    const greaseGeo = new THREE.BufferGeometry();
    const greasePos = new Float32Array(greaseCount * 3);
    for(let i=0; i<greaseCount; i++) {
       const angle = Math.random() * Math.PI * 2;
       const r = 4.2 + Math.random() * 1.6;
       greasePos[i*3] = Math.cos(angle) * r;
       greasePos[i*3+1] = Math.sin(angle) * r;
       greasePos[i*3+2] = (Math.random() - 0.5) * 1.5;
    }
    greaseGeo.setAttribute('position', new THREE.BufferAttribute(greasePos, 3));
    
    const greaseMat = new THREE.PointsMaterial({
      size: 0.2,
      color: 0xfde047, // yellow-300 (fresh grease)
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const greaseSystem = new THREE.Points(greaseGeo, greaseMat);
    bearingGroup.add(greaseSystem);

    // Acoustic Emission Waves (Rings expanding outward)
    const waveGeo = new THREE.RingGeometry(6.5, 7, 64);
    const waveMat = new THREE.MeshBasicMaterial({
       color: 0xef4444,
       transparent: true,
       opacity: 0,
       side: THREE.DoubleSide
    });
    const wave1 = new THREE.Mesh(waveGeo, waveMat);
    const wave2 = new THREE.Mesh(waveGeo, waveMat.clone());
    bearingGroup.add(wave1);
    bearingGroup.add(wave2);

    const clock = new THREE.Clock();
    let waveTime = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Rotation
      const speed = 2.0;
      innerRing.rotation.z -= speed * 0.016;
      shaft.rotation.y -= speed * 0.016;
      
      // Balls rotate around center and spin
      balls.forEach((ball, i) => {
         const angle = (i / ballCount) * Math.PI * 2 - (time * speed * 0.5);
         ball.position.set(Math.cos(angle) * 5, Math.sin(angle) * 5, 0);
         ball.rotation.z += speed * 0.03;
         
         // Update shader
         const mat = ball.material as THREE.ShaderMaterial;
         mat.uniforms.uTemp.value = currentState.temperature;
         // Defect increases with acoustic emission
         mat.uniforms.uDefect.value = Math.max(0, (currentState.acousticEmission - 40) / 60);
      });

      // Vibration (Shake the whole group)
      const vib = currentState.vibrationVelocity * 0.02;
      if (vib > 0.05) {
         bearingGroup.position.x = (Math.random() - 0.5) * vib;
         bearingGroup.position.y = (Math.random() - 0.5) * vib;
      } else {
         bearingGroup.position.set(0, 0, 0);
      }

      // Grease Color (Degrades from yellow to black)
      const greaseHealth = currentState.greaseLife / 100;
      const r = 0.1 + 0.9 * greaseHealth;
      const g = 0.1 + 0.8 * greaseHealth;
      const b = 0.1 + 0.2 * greaseHealth;
      greaseMat.color.setRGB(r, g, b);
      greaseMat.opacity = 0.2 + 0.6 * greaseHealth;

      // Acoustic Emission Waves
      if (currentState.acousticEmission > 60) {
         waveTime += 0.05;
         
         const s1 = 1.0 + (waveTime % 1.0) * 0.5;
         wave1.scale.set(s1, s1, 1);
         (wave1.material as THREE.Material).opacity = (1.0 - (waveTime % 1.0)) * 0.5 * ((currentState.acousticEmission - 60)/40);
         
         const s2 = 1.0 + ((waveTime + 0.5) % 1.0) * 0.5;
         wave2.scale.set(s2, s2, 1);
         (wave2.material as THREE.Material).opacity = (1.0 - ((waveTime + 0.5) % 1.0)) * 0.5 * ((currentState.acousticEmission - 60)/40);
      } else {
         (wave1.material as THREE.Material).opacity = 0;
         (wave2.material as THREE.Material).opacity = 0;
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
      outerRingGeo.dispose();
      innerRingGeo.dispose();
      shaftGeo.dispose();
      metalMat.dispose();
      ballGeo.dispose();
      ballMat.dispose();
      greaseGeo.dispose();
      greaseMat.dispose();
      waveGeo.dispose();
      waveMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
