import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CraneWheelState } from './three-types';

interface ThreeSceneProps {
  state: CraneWheelState;
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
    scene.background = new THREE.Color(0x18181b); // zinc-900
    scene.fog = new THREE.FogExp2(0x18181b, 0.02);

    const canvasWidth = mountRef.current.clientWidth || 1;
    const canvasHeight = mountRef.current.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);
    camera.position.set(10, 8, 12);

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

    const wheelGroup = new THREE.Group();
    scene.add(wheelGroup);

    // Rail
    const railGeo = new THREE.BoxGeometry(2, 2, 20);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x52525b, metalness: 0.6, roughness: 0.4 }); // zinc-600
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.y = -1;
    wheelGroup.add(rail);

    // Wheel
    // Create a custom shape for a double-flanged crane wheel
    const wheelPoints = [];
    wheelPoints.push(new THREE.Vector2(0, 2)); // center hole
    wheelPoints.push(new THREE.Vector2(1.5, 2)); // inner hub
    wheelPoints.push(new THREE.Vector2(1.5, 3.5)); // web
    wheelPoints.push(new THREE.Vector2(2.2, 3.5)); // flange inner base
    wheelPoints.push(new THREE.Vector2(2.5, 4.5)); // flange tip
    wheelPoints.push(new THREE.Vector2(3.0, 4.5)); // flange outer edge
    wheelPoints.push(new THREE.Vector2(3.0, 2.5)); // tread edge
    wheelPoints.push(new THREE.Vector2(5.0, 2.5)); // tread width
    wheelPoints.push(new THREE.Vector2(5.0, 4.5)); // opposite flange
    wheelPoints.push(new THREE.Vector2(5.5, 4.5));
    wheelPoints.push(new THREE.Vector2(5.8, 3.5));
    wheelPoints.push(new THREE.Vector2(6.5, 3.5));
    wheelPoints.push(new THREE.Vector2(6.5, 2));
    wheelPoints.push(new THREE.Vector2(8, 2));

    const wheelGeo = new THREE.LatheGeometry(wheelPoints, 32);
    // Center the geometry
    wheelGeo.translate(-4, 0, 0);
    wheelGeo.rotateZ(Math.PI / 2); // Lay flat
    wheelGeo.rotateY(Math.PI / 2); // Align with rail

    // Shader to show flange wear and heat from friction
    const wheelMat = new THREE.ShaderMaterial({
        uniforms: {
            uWear: { value: 0.0 },
            uMisalignment: { value: 0.0 },
            uBaseColor: { value: new THREE.Color(0x71717a) }, // zinc-500
            uWearColor: { value: new THREE.Color(0xf59e0b) }, // amber-500
            uHeatColor: { value: new THREE.Color(0xef4444) }  // red-500
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
            uniform float uMisalignment;
            uniform vec3 uBaseColor;
            uniform vec3 uWearColor;
            uniform vec3 uHeatColor;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                // Flanges are at approx x = -1.5 and x = 1.5
                float isFlange = smoothstep(1.0, 1.5, abs(vPosition.x));
                
                // If misaligned, one flange wears more
                float sideWear = (vPosition.x > 0.0) ? max(0.0, uMisalignment) : max(0.0, -uMisalignment);
                float totalWear = uWear * isFlange * (0.5 + sideWear * 0.5);
                
                vec3 color = mix(uBaseColor, uWearColor, totalWear);
                
                // Heat from friction on the flange
                color = mix(color, uHeatColor, totalWear * 0.8);
                
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(vNormal, lightDir), 0.2);
                gl_FragColor = vec4(color * diff, 1.0);
            }
        `,
        side: THREE.DoubleSide
    });

    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.y = 2.5; // Radius is 2.5
    wheelGroup.add(wheel);

    // Sparks (Friction between flange and rail)
    const sparkCount = 50;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    
    const sparkMat = new THREE.ShaderMaterial({
        uniforms: {
            uIntensity: { value: 0.0 },
            uTime: { value: 0.0 }
        },
        vertexShader: `
            uniform float uTime;
            uniform float uIntensity;
            void main() {
                vec3 pos = position;
                // Sparks fly backwards (positive Z) and outwards
                pos.z += mod(uTime * 10.0 + pos.x, 2.0) * uIntensity * 5.0;
                pos.x += sin(uTime * 20.0 + pos.y) * 0.5 * uIntensity;
                pos.y += cos(uTime * 15.0 + pos.z) * 0.5 * uIntensity;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = 4.0 * uIntensity * (10.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float uIntensity;
            void main() {
                if (uIntensity < 0.05) discard;
                vec2 coord = gl_PointCoord - vec2(0.5);
                if(length(coord) > 0.5) discard;
                gl_FragColor = vec4(1.0, 0.6, 0.1, uIntensity); // Orange sparks
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const sparkSystem = new THREE.Points(sparkGeo, sparkMat);
    wheelGroup.add(sparkSystem);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Wheel rotation (simulating travel)
      const speed = currentState.loadWeight > 0 ? 2 : 0; // Only rotate if moving/loaded
      wheel.rotation.x -= speed * 0.016;

      // Rail alignment offset (gnawing rail)
      const offset = currentState.railAlignment * 0.1; // Scale down for visual
      wheel.position.x = offset;

      // Update Shaders
      const wearRatio = Math.max(0, Math.min(1, currentState.flangeWear / 15)); // Max ~15mm wear
      const alignRatio = Math.max(-1, Math.min(1, currentState.railAlignment / 10)); // -10 to +10mm

      wheelMat.uniforms.uWear.value = wearRatio;
      wheelMat.uniforms.uMisalignment.value = alignRatio;

      // Sparks occur when misaligned and moving
      const friction = Math.abs(alignRatio) * (speed > 0 ? 1 : 0);
      sparkMat.uniforms.uIntensity.value = friction;
      sparkMat.uniforms.uTime.value = time;

      if (friction > 0.1 && Math.random() < 0.3) {
          const sPos = sparkSystem.geometry.attributes.position.array as Float32Array;
          for(let i=0; i<sparkCount; i++) {
              if (Math.random() < friction) {
                  // Spawn sparks at the contact point of the rubbing flange
                  const side = alignRatio > 0 ? 1.2 : -1.2;
                  sPos[i*3] = wheel.position.x + side;
                  sPos[i*3+1] = 0.5; // Near rail top
                  sPos[i*3+2] = 0;
              }
          }
          sparkSystem.geometry.attributes.position.needsUpdate = true;
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
      railGeo.dispose();
      railMat.dispose();
      wheelGeo.dispose();
      wheelMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};
