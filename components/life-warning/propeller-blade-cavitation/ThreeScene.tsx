import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PropellerState } from './three-types';

interface ThreeSceneProps {
  state: PropellerState;
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
    scene.background = new THREE.Color(0x001122); // Deep ocean blue
    scene.fog = new THREE.FogExp2(0x001122, 0.04);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(15, 5, -15);

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
    dirLight.position.set(10, 20, -10);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x3b82f6, 3); // blue-500
    spotLight.position.set(-10, 0, -10);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    const propellerGroup = new THREE.Group();
    scene.add(propellerGroup);

    // Propeller Hub
    const hubGeo = new THREE.CylinderGeometry(1.5, 2, 4, 32);
    const bronzeMat = new THREE.MeshStandardMaterial({ 
      color: 0xb45309, // amber-700 (Bronze)
      metalness: 0.8, 
      roughness: 0.3 
    });
    const hub = new THREE.Mesh(hubGeo, bronzeMat);
    hub.rotation.x = Math.PI / 2;
    propellerGroup.add(hub);

    // Propeller Blades (4 blades)
    const bladeCount = 4;
    const blades: THREE.Mesh[] = [];
    
    // Custom shader for blades to show cavitation pitting (erosion)
    const bladeMat = new THREE.ShaderMaterial({
      uniforms: {
        uCavitation: { value: 0.0 }, // 0 to 1
        uBaseColor: { value: new THREE.Color(0xb45309) }, // Bronze
        uPitColor: { value: new THREE.Color(0x1e293b) } // Dark grey/black pitting
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
        uniform float uCavitation;
        uniform vec3 uBaseColor;
        uniform vec3 uPitColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        // Noise function
        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          vec3 color = uBaseColor;
          
          // Cavitation usually happens near the blade tips and trailing edges
          // We simulate this by making the pitting more dense where vUv.y is high (tip)
          float tipFactor = smoothstep(0.4, 1.0, vUv.y);
          float noise = rand(vUv * 50.0);
          
          if (noise < uCavitation * tipFactor * 0.8) {
              color = uPitColor; // Pitting hole
          }

          vec3 lightDir = normalize(vec3(1.0, 1.0, -1.0));
          float diff = max(dot(vNormal, lightDir), 0.2);
          
          vec3 viewDir = normalize(-vPosition);
          vec3 halfDir = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
          
          gl_FragColor = vec4(color * diff + vec3(0.5) * spec, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    // Create a curved blade shape
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(2, 2, 1, 6); // Leading edge
    shape.quadraticCurveTo(-1, 7, -2, 6); // Tip
    shape.quadraticCurveTo(-3, 2, 0, 0); // Trailing edge

    const extrudeSettings = {
        depth: 0.2,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 0.1,
        bevelThickness: 0.1
    };
    const bladeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Center the geometry
    bladeGeo.translate(0, 1.5, -0.1); 

    for (let i = 0; i < bladeCount; i++) {
        const blade = new THREE.Mesh(bladeGeo, bladeMat.clone());
        const angle = (i / bladeCount) * Math.PI * 2;
        
        // Position and rotate blade around hub
        blade.rotation.z = angle;
        // Pitch angle
        blade.rotateOnAxis(new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0), Math.PI / 6);
        
        propellerGroup.add(blade);
        blades.push(blade);
    }

    // Cavitation Bubbles (Trailing from tips)
    const bubbleCount = 2000;
    const bubbleGeo = new THREE.BufferGeometry();
    const bubblePos = new Float32Array(bubbleCount * 3);
    const bubbleLife = new Float32Array(bubbleCount); // 0 to 1
    
    for(let i=0; i<bubbleCount; i++) {
       bubblePos[i*3] = 0;
       bubblePos[i*3+1] = 0;
       bubblePos[i*3+2] = 100; // Hide initially
       bubbleLife[i] = Math.random();
    }
    bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));
    bubbleGeo.setAttribute('aLife', new THREE.BufferAttribute(bubbleLife, 1));
    
    const bubbleMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xffffff) }
      },
      vertexShader: `
        attribute float aLife;
        varying float vLife;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (1.0 - aLife) * 10.0 * (10.0 / -mvPosition.z);
          vLife = aLife;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vLife;
        void main() {
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float ll = length(xy);
          if(ll > 0.5) discard;
          
          // Bubbles fade out as they collapse
          gl_FragColor = vec4(uColor, (1.0 - vLife) * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const bubbleSystem = new THREE.Points(bubbleGeo, bubbleMat);
    scene.add(bubbleSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Propeller Rotation
      const rps = currentState.rpm / 60;
      propellerGroup.rotation.z -= rps * Math.PI * 2 * 0.016;

      // Update Blade Shader (Pitting)
      blades.forEach(blade => {
          (blade.material as THREE.ShaderMaterial).uniforms.uCavitation.value = currentState.cavitationArea / 100;
      });

      // Bubble Physics (Cavitation generation)
      // Cavitation increases with RPM and decreases with water depth (pressure)
      const cavIntensity = Math.max(0, (currentState.rpm - 80) / 40) * Math.max(0.1, 1.0 - currentState.waterDepth / 20);
      
      const positions = bubbleSystem.geometry.attributes.position.array as Float32Array;
      const lives = bubbleSystem.geometry.attributes.aLife.array as Float32Array;
      
      const activeBubbles = Math.floor(cavIntensity * bubbleCount);

      for(let i=0; i<bubbleCount; i++) {
         if (i > activeBubbles) {
             positions[i*3+2] = 100; // Hide
             continue;
         }

         lives[i] += 0.02 + Math.random() * 0.02; // Age bubble
         
         // If bubble dies (collapses), respawn it at a blade tip
         if (lives[i] >= 1.0) {
             lives[i] = 0.0;
             
             // Pick a random blade
             const bladeIdx = Math.floor(Math.random() * bladeCount);
             const angle = (bladeIdx / bladeCount) * Math.PI * 2 + propellerGroup.rotation.z;
             
             // Spawn near tip (radius ~6)
             const r = 5.5 + Math.random();
             positions[i*3] = Math.cos(angle) * r;
             positions[i*3+1] = Math.sin(angle) * r;
             positions[i*3+2] = 0; // At propeller plane
         }

         // Move bubbles backwards (wake) and slightly outwards
         positions[i*3+2] += currentState.shipSpeed * 0.02 + 0.1; // Move Z
         
         // Swirl effect
         const currentAngle = Math.atan2(positions[i*3+1], positions[i*3]);
         const r = Math.sqrt(positions[i*3]*positions[i*3] + positions[i*3+1]*positions[i*3+1]);
         const newAngle = currentAngle - rps * 0.1;
         
         positions[i*3] = Math.cos(newAngle) * (r + 0.01);
         positions[i*3+1] = Math.sin(newAngle) * (r + 0.01);
      }
      bubbleSystem.geometry.attributes.position.needsUpdate = true;
      bubbleSystem.geometry.attributes.aLife.needsUpdate = true;

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
      hubGeo.dispose();
      bronzeMat.dispose();
      bladeGeo.dispose();
      bladeMat.dispose();
      bubbleGeo.dispose();
      bubbleMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
