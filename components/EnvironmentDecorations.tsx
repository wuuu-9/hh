
import React, { useMemo, useRef } from 'react';
import { Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../constants';

const GiftBox: React.FC<{ position: [number, number, number]; color: string; size: [number, number, number]; rotation: [number, number, number] }> = ({ position, color, size, rotation }) => {
  const boxRef = useRef<THREE.Mesh>(null);
  const gemsRef = useRef<THREE.Group>(null);

  // Custom shader for luxury "Gold Leaf" texture on the box
  const onBeforeCompileBox = (shader: any) => {
    shader.uniforms.uTime = { value: 0 };
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
       uniform float uTime;
       float hash(vec3 p) {
         p = fract(p * 0.1031);
         p += dot(p, p.yzx + 33.33);
         return fract((p.x + p.y) * p.z);
       }`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
       // Procedural "Gold Leaf" specks
       float speckNoise = hash(floor(vViewPosition * 120.0 + sin(uTime * 0.1)));
       if (speckNoise > 0.98) {
         totalEmissiveRadiance += vec3(0.83, 0.68, 0.21) * 2.0; // Gold color
       }
       // Satin sheen effect
       float satin = pow(1.0 - max(0.0, dot(vNormal, vec3(0,0,1))), 4.0);
       totalEmissiveRadiance += diffuseColor.rgb * satin * 0.15;`
    );
    if (boxRef.current) boxRef.current.userData.shader = shader;
  };

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (boxRef.current?.userData.shader) {
      boxRef.current.userData.shader.uniforms.uTime.value = t;
    }
    if (gemsRef.current) {
      // Gentle pulsing for the corner gems
      const pulse = Math.sin(t * 2 + position[0]) * 0.5 + 0.5;
      gemsRef.current.children.forEach((child) => {
        if ((child as any).material) {
          (child as any).material.emissiveIntensity = 1.0 + pulse * 2.0;
        }
      });
    }
  });

  const cornerOffsets = useMemo(() => {
    const x = size[0] / 2;
    const y = size[1] / 2;
    const z = size[2] / 2;
    return [
      [x, y, z], [x, y, -z], [-x, y, z], [-x, y, -z],
      [x, -y, z], [x, -y, -z], [-x, -y, z], [-x, -y, -z]
    ];
  }, [size]);

  return (
    <group position={position} rotation={rotation}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4} floatingRange={[-0.05, 0.05]}>
        {/* Main Box Body with Luxury Texture */}
        <mesh ref={boxRef} castShadow receiveShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.4} 
            metalness={0.3} 
            onBeforeCompile={onBeforeCompileBox}
          />
        </mesh>
        
        {/* Golden Edge Trims */}
        <mesh>
          <boxGeometry args={[size[0] + 0.01, size[1] + 0.01, size[2] + 0.01]} />
          {/* Removed linewidth property as it is not supported in MeshStandardMaterial wireframe mode */}
          <meshStandardMaterial color={COLORS.gold} wireframe transparent opacity={0.3} />
        </mesh>

        {/* Ribbon Horizontal */}
        <mesh position={[0, 0, 0]} scale={[1.04, 0.12, 1.04]}>
          <boxGeometry args={size} />
          <meshStandardMaterial color={COLORS.gold} metalness={1} roughness={0.1} />
        </mesh>
        
        {/* Ribbon Vertical */}
        <mesh position={[0, 0, 0]} scale={[0.12, 1.04, 1.04]}>
          <boxGeometry args={size} />
          <meshStandardMaterial color={COLORS.gold} metalness={1} roughness={0.1} />
        </mesh>

        {/* Glowing Corner Gems */}
        <group ref={gemsRef}>
          {cornerOffsets.map((offset, i) => (
            <mesh key={i} position={offset as [number, number, number]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshStandardMaterial 
                color={COLORS.goldBright} 
                emissive={COLORS.goldBright} 
                emissiveIntensity={2} 
              />
            </mesh>
          ))}
        </group>

        {/* Elaborate Bow Assembly */}
        <group position={[0, size[1] / 2, 0]}>
          <mesh position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color={COLORS.gold} metalness={1} roughness={0.05} emissive={COLORS.gold} emissiveIntensity={0.2} />
          </mesh>

          {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
            <group key={i} rotation={[0, angle, 0]}>
              <mesh position={[0.14, 0.1, 0]} rotation={[0, 0, Math.PI / 6]}>
                <torusGeometry args={[0.12, 0.03, 12, 24, Math.PI * 1.5]} />
                <meshStandardMaterial color={COLORS.gold} metalness={1} roughness={0.05} />
              </mesh>
              {/* Hanging Ribbon Ends */}
              {i % 2 === 0 && (
                <mesh position={[0.2, -0.1, 0]} rotation={[0.4, 0, 0.5]}>
                   <boxGeometry args={[0.1, 0.3, 0.01]} />
                   <meshStandardMaterial color={COLORS.gold} metalness={0.9} />
                </mesh>
              )}
            </group>
          ))}
        </group>
      </Float>
    </group>
  );
};

const Flower: React.FC<{ position: [number, number, number]; color: string; scale?: number }> = ({ position, color, scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      {/* Stylized Poinsettia/Rose */}
      <mesh>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI * 2) / 5, 0.5]} position={[0.04, 0, 0]} scale={[1.5, 0.5, 1]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
};

const GingerbreadMan: React.FC<{ position: [number, number, number]; rotationY: number; scale?: number }> = ({ position, rotationY, scale = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      const offset = position[0] + position[2];
      groupRef.current.position.y = position[1] + Math.sin(t * 3 + offset) * 0.04;
      groupRef.current.rotation.z = Math.sin(t * 2 + offset) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]} scale={scale * 0.35}>
       <mesh position={[0, 0.5, 0]} castShadow>
         <capsuleGeometry args={[0.3, 0.6, 4, 8]} />
         <meshStandardMaterial color="#8B4513" roughness={0.8} />
       </mesh>
       <mesh position={[0, 1.25, 0]} castShadow>
         <sphereGeometry args={[0.35, 16, 16]} />
         <meshStandardMaterial color="#8B4513" roughness={0.8} />
       </mesh>
       <mesh position={[0.45, 0.8, 0]} rotation={[0, 0, Math.PI / 2.5]} castShadow>
         <capsuleGeometry args={[0.12, 0.4, 4, 8]} />
         <meshStandardMaterial color="#8B4513" roughness={0.8} />
       </mesh>
       <mesh position={[-0.45, 0.8, 0]} rotation={[0, 0, -Math.PI / 2.5]} castShadow>
         <capsuleGeometry args={[0.12, 0.4, 4, 8]} />
         <meshStandardMaterial color="#8B4513" roughness={0.8} />
       </mesh>
       <mesh position={[0.22, 0.1, 0]} rotation={[0, 0, 0.1]} castShadow>
         <capsuleGeometry args={[0.14, 0.5, 4, 8]} />
         <meshStandardMaterial color="#8B4513" roughness={0.8} />
       </mesh>
       <mesh position={[-0.22, 0.1, 0]} rotation={[0, 0, -0.1]} castShadow>
         <capsuleGeometry args={[0.14, 0.5, 4, 8]} />
         <meshStandardMaterial color="#8B4513" roughness={0.8} />
       </mesh>
       <mesh position={[0.12, 1.3, 0.32]}>
         <sphereGeometry args={[0.04, 8, 8]} />
         <meshStandardMaterial color="white" roughness={0.2} emissive="white" emissiveIntensity={0.2} />
       </mesh>
       <mesh position={[-0.12, 1.3, 0.32]}>
         <sphereGeometry args={[0.04, 8, 8]} />
         <meshStandardMaterial color="white" roughness={0.2} emissive="white" emissiveIntensity={0.2} />
       </mesh>
       <group position={[0, 1.15, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
         <mesh>
           <torusGeometry args={[0.1, 0.02, 8, 16, Math.PI]} />
           <meshStandardMaterial color="white" />
         </mesh>
       </group>
       {[0.8, 0.55, 0.3].map((y, i) => (
         <mesh key={i} position={[0, y, 0.33]}>
           <sphereGeometry args={[0.06, 12, 12]} />
           <meshStandardMaterial 
            color={i === 0 ? COLORS.velvetRed : (i === 1 ? COLORS.emerald : COLORS.goldBright)} 
            emissive={i === 0 ? COLORS.velvetRed : (i === 1 ? COLORS.emerald : COLORS.goldBright)} 
            emissiveIntensity={1.5}
           />
         </mesh>
       ))}
    </group>
  );
};

const Balloon: React.FC<{ position: [number, number, number]; color: string; scale?: number }> = ({ position, color, scale = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const stringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (stringRef.current) {
        // Subtle swaying for the string
        stringRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.05;
        stringRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.6 + position[2]) * 0.05;
    }
  });

  return (
    <group position={position} scale={scale}>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5} floatingRange={[-0.3, 0.3]}>
        {/* Balloon Body */}
        <mesh castShadow>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial 
            color={color} 
            metalness={0.9} 
            roughness={0.1} 
            envMapIntensity={2} 
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Balloon Tie */}
        <mesh position={[0, -0.3, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.05, 0.1, 8]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Balloon String */}
        <mesh ref={stringRef} position={[0, -1.35, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 2, 8]} />
          <meshStandardMaterial color={COLORS.gold} metalness={0.5} roughness={0.5} transparent opacity={0.6} />
        </mesh>
      </Float>
    </group>
  );
};

interface SleighCargoProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  mainColor?: string;
  accentColor?: string;
  glowColor?: string;
}

const SleighCargo: React.FC<SleighCargoProps> = ({ 
  position, 
  rotation, 
  scale = 1.4, 
  mainColor = COLORS.emerald, 
  accentColor = COLORS.gold,
  glowColor = COLORS.goldBright
}) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, 0.1, 0]}>
        {[0.7, -0.7].map((z, idx) => (
          <group key={idx} position={[0, 0, z]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[4, 0.1, 0.1]} />
              <meshStandardMaterial color={accentColor} metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[2.1, 0.35, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <torusGeometry args={[0.4, 0.05, 8, 24, Math.PI * 1.2]} />
              <meshStandardMaterial color={accentColor} metalness={1} roughness={0.1} />
            </mesh>
            <mesh position={[-1, 0.25, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.5]} />
              <meshStandardMaterial color={accentColor} metalness={0.9} />
            </mesh>
            <mesh position={[1, 0.25, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.5]} />
              <meshStandardMaterial color={accentColor} metalness={0.9} />
            </mesh>
          </group>
        ))}
      </group>
      
      <group position={[0, 0.7, 0]}>
        <mesh castShadow>
          <boxGeometry args={[3.2, 0.15, 1.8]} />
          <meshStandardMaterial color={mainColor} metalness={0.4} roughness={0.3} />
        </mesh>
        
        <mesh position={[-1.5, 0.6, 0]} rotation={[0, 0, 0.2]} castShadow>
          <boxGeometry args={[0.2, 1.4, 1.8]} />
          <meshStandardMaterial color={mainColor} roughness={0.1} />
        </mesh>

        <mesh position={[1.5, 0.35, 0]} rotation={[0, 0, -0.6]} castShadow>
          <boxGeometry args={[0.15, 1.1, 1.8]} />
          <meshStandardMaterial color={mainColor} roughness={0.1} />
        </mesh>

        <mesh position={[0, 0.8, 0.9]}>
          <boxGeometry args={[3.2, 0.1, 0.05]} />
          <meshStandardMaterial color={accentColor} metalness={1} />
        </mesh>
        <mesh position={[0, 0.8, -0.9]}>
          <boxGeometry args={[3.2, 0.1, 0.05]} />
          <meshStandardMaterial color={accentColor} metalness={1} />
        </mesh>

        {[0.9, -0.9].map((zSide, sideIdx) => (
          <group key={sideIdx} position={[0, 0.85, zSide]}>
            {[-1.2, -0.6, 0, 0.6, 1.2].map((xPos, lightIdx) => {
              return (
                <mesh key={lightIdx} position={[xPos, 0, 0]}>
                  <sphereGeometry args={[0.05, 12, 12]} />
                  <meshStandardMaterial 
                    color={glowColor} 
                    emissive={glowColor} 
                    emissiveIntensity={4} 
                  />
                </mesh>
              );
            })}
          </group>
        ))}
      </group>

      <group position={[0, 0.8, 0]}>
        <GiftBox position={[-0.6, 0.45, 0]} color={COLORS.velvetRed} size={[0.9, 0.9, 0.9]} rotation={[0, 0.3, 0]} />
        <GiftBox position={[-1.2, 0.6, 0.5]} color={COLORS.emerald} size={[0.3, 1.2, 0.3]} rotation={[0.1, 0, 0.1]} />
        <GiftBox position={[0.4, 0.15, 0]} color={COLORS.sapphireBlue} size={[1.6, 0.3, 0.6]} rotation={[0, -0.2, 0]} />
        <GiftBox position={[0.5, 0.45, -0.4]} color={COLORS.velvetPurple} size={[1.2, 0.3, 0.4]} rotation={[0, 0.4, 0]} />
        <GiftBox position={[0.1, 0.3, 0.6]} color={COLORS.gold} size={[0.4, 0.4, 0.4]} rotation={[0, -0.5, 0]} />
        
        <group position={[0, 0.2, 0]}>
          {Array.from({ length: 18 }).map((_, i) => (
            <Flower 
              key={i} 
              position={[
                (Math.random() - 0.5) * 2.5, 
                0.2 + Math.random() * 0.4, 
                (Math.random() - 0.5) * 1.4
              ]} 
              color={i % 3 === 0 ? accentColor : (i % 2 === 0 ? COLORS.velvetRed : mainColor)}
              scale={0.9 + Math.random() * 0.6}
            />
          ))}
        </group>
      </group>

      <pointLight position={[0, 2, 0]} intensity={4} color={glowColor} distance={8} />
      <pointLight position={[-1.5, 1, 0]} intensity={2} color={mainColor} distance={4} />
      <pointLight position={[1.5, 1, 0]} intensity={1.5} color={glowColor} distance={3} />
    </group>
  );
};

type CandleShape = 'pillar' | 'taper' | 'votive';

interface CandleProps {
  position: [number, number, number];
  color?: string;
  shape?: CandleShape;
  scale?: number;
}

const Candle: React.FC<CandleProps> = ({ 
  position, 
  color = COLORS.gold, 
  shape = 'pillar',
  scale = 1
}) => {
  const dims = useMemo(() => {
    switch (shape) {
      case 'taper': return { r: 0.02, h: 0.8 }; // Taller tapers
      case 'votive': return { r: 0.08, h: 0.3 }; // Taller votives to beat the snow
      case 'pillar':
      default: return { r: 0.06, h: 0.6 }; // Taller pillars
    }
  }, [shape]);

  const flameRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (flameRef.current) {
        flameRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 10) * 0.1);
    }
  });

  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, dims.h / 2, 0]}>
        <cylinderGeometry args={[dims.r, dims.r, dims.h, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>

      <group ref={flameRef} position={[0, dims.h, 0]}>
        <Float speed={5} rotationIntensity={1} floatIntensity={0.8}>
          <mesh>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial 
              color="#ffaa00" 
              emissive="#ff4400" 
              emissiveIntensity={8} 
            />
          </mesh>
          <pointLight intensity={1.5} color="#ff9900" distance={3} decay={2} />
        </Float>
      </group>
    </group>
  );
};

const GroundGlow: React.FC<{ position: [number, number, number]; color: string; intensity?: number }> = ({ position, color, intensity = 2 }) => {
    return (
        <group position={position}>
            <pointLight intensity={intensity} color={color} distance={4} decay={2} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <planeGeometry args={[0.5, 0.5]} />
                <meshBasicMaterial color={color} transparent opacity={0.1} />
            </mesh>
        </group>
    );
};

// --- REFINED LANTERN COMPONENTS ---

type LanternType = 'tall' | 'square' | 'round';

interface LanternProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  type?: LanternType;
  color?: string;
}

const Lantern: React.FC<LanternProps> = ({ 
  position, 
  rotation = [0, 0, 0], 
  scale = 1, 
  type = 'square', 
  color = COLORS.gold 
}) => {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1.2 + Math.sin(state.clock.elapsedTime * 12) * 0.3 + Math.random() * 0.15;
    }
  });

  const GlassMaterial = useMemo(() => (
    <meshStandardMaterial 
      color="#fff" 
      transparent 
      opacity={0.3} 
      roughness={0.05} 
      metalness={0.9} 
      envMapIntensity={2}
    />
  ), []);

  const FrameMaterial = useMemo(() => (
    <meshStandardMaterial 
      color={color} 
      metalness={1} 
      roughness={0.15} 
    />
  ), [color]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Float speed={2} rotationIntensity={0.15} floatIntensity={0.25}>
        <group position={[0, -0.05, 0]}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.12, 12]} />
            <meshStandardMaterial color="#fffbe6" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.13, 0]}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshStandardMaterial color="#ffaa00" emissive="#ff6600" emissiveIntensity={10} />
          </mesh>
          <pointLight 
            ref={lightRef} 
            position={[0, 0.13, 0]} 
            intensity={2} 
            color="#ff9933" 
            distance={5} 
            decay={1.8} 
          />
        </group>

        {type === 'square' && (
          <group>
            <mesh position={[0, 0.42, 0]} rotation={[0, Math.PI / 4, 0]}>
              <cylinderGeometry args={[0.01, 0.28, 0.18, 4]} />
              <primitive object={FrameMaterial} attach="material" />
            </mesh>
            <mesh position={[0, 0.52, 0]}>
              <torusGeometry args={[0.05, 0.01, 8, 16]} />
              <primitive object={FrameMaterial} attach="material" />
            </mesh>
            {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
              <mesh key={i} rotation={[0, angle, 0]} position={[0, 0.05, 0.19]}>
                <planeGeometry args={[0.36, 0.6]} />
                <primitive object={GlassMaterial} attach="material" />
              </mesh>
            ))}
            {[[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]].map((p, i) => (
              <mesh key={i} position={[p[0], 0.05, p[1]]}>
                <boxGeometry args={[0.03, 0.72, 0.03]} />
                <primitive object={FrameMaterial} attach="material" />
              </mesh>
            ))}
            <mesh position={[0, -0.32, 0]}>
              <boxGeometry args={[0.44, 0.06, 0.44]} />
              <primitive object={FrameMaterial} attach="material" />
            </mesh>
          </group>
        )}

        {type === 'tall' && (
          <group>
            <mesh position={[0, 0.55, 0]}>
              <cylinderGeometry args={[0.02, 0.22, 0.15, 6]} />
              <primitive object={FrameMaterial} attach="material" />
            </mesh>
            <mesh position={[0, 0.62, 0]}>
              <sphereGeometry args={[0.04, 12, 12]} />
              <primitive object={FrameMaterial} attach="material" />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.8, 6]} />
              <primitive object={GlassMaterial} attach="material" />
            </mesh>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = (i * Math.PI * 2) / 6;
              return (
                <mesh key={i} position={[Math.cos(angle) * 0.2, 0.05, Math.sin(angle) * 0.2]}>
                  <cylinderGeometry args={[0.015, 0.015, 0.9, 8]} />
                  <primitive object={FrameMaterial} attach="material" />
                </mesh>
              );
            })}
            <mesh position={[0, 0.48, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.04, 6]} />
              <primitive object={FrameMaterial} attach="material" />
            </mesh>
            <mesh position={[0, -0.35, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.06, 6]} />
              <primitive object={FrameMaterial} attach="material" />
            </mesh>
          </group>
        )}

        {type === 'round' && (
          <group>
            <mesh position={[0, 0.05, 0]}>
              <sphereGeometry args={[0.24, 24, 24]} />
              <primitive object={GlassMaterial} attach="material" />
            </mesh>
            {[0, Math.PI / 4, Math.PI / 2, Math.PI * 0.75].map((angle, i) => (
              <mesh key={i} rotation={[0, angle, 0]}>
                <torusGeometry args={[0.25, 0.012, 12, 48]} />
                <primitive object={FrameMaterial} attach="material" />
              </mesh>
            ))}
            <mesh position={[0, 0.38, 0]}>
              <cylinderGeometry args={[0.1, 0.15, 0.1, 16]} />
              <primitive object={FrameMaterial} attach="material" />
            </mesh>
            <mesh position={[0, -0.28, 0]}>
              <cylinderGeometry args={[0.15, 0.18, 0.08, 16]} />
              <primitive object={FrameMaterial} attach="material" />
            </mesh>
          </group>
        )}
      </Float>
    </group>
  );
};

export const EnvironmentDecorations: React.FC = () => {
  const decorations = useMemo(() => [
    { type: 'box', pos: [2.5, -1.4, 1.5], col: COLORS.velvetRed, size: [0.8, 0.8, 0.8], rot: [0, Math.PI / 6, 0] },
    { type: 'box', pos: [-2.2, -1.5, 2.0], col: COLORS.velvetPurple, size: [0.6, 0.6, 0.6], rot: [0, -Math.PI / 4, 0] },
    { type: 'box', pos: [1.8, -1.6, 3.2], col: COLORS.sapphireBlue, size: [0.4, 0.4, 0.4], rot: [0, Math.PI / 10, 0] },
    { type: 'box', pos: [-0.8, -1.45, -3], col: COLORS.gold, size: [0.7, 0.7, 0.7], rot: [0, Math.PI / 3, 0] },
    { type: 'box', pos: [5.5, -1.55, 3.8], col: COLORS.emerald, size: [0.5, 0.5, 0.5], rot: [0, 0.4, 0] },
    { type: 'box', pos: [4.2, -1.6, 4.5], col: COLORS.velvetRed, size: [0.4, 0.4, 0.4], rot: [0, -0.2, 0] },
    { type: 'box', pos: [-4.8, -1.475, 4.5], col: COLORS.sapphireBlue, size: [0.65, 0.65, 0.65], rot: [0, 0.5, 0] },
    { type: 'box', pos: [-5.2, -1.55, 3.5], col: COLORS.velvetPurple, size: [0.5, 0.5, 0.5], rot: [0, -0.3, 0] },

    // Expanded Clusters of Candles - Elevated to -1.5 to stay above snow mounds
    { type: 'candle', pos: [2.5, -1.5, 0], shape: 'pillar', col: COLORS.gold },
    { type: 'candle', pos: [2.8, -1.5, 0.3], shape: 'votive', col: COLORS.gold },
    { type: 'candle', pos: [2.3, -1.5, 0.5], shape: 'taper', col: COLORS.gold },
    { type: 'candle', pos: [-2.2, -1.5, -0.5], shape: 'taper', col: COLORS.velvetRed },
    { type: 'candle', pos: [-2.5, -1.5, -0.8], shape: 'pillar', col: COLORS.velvetRed },
    { type: 'candle', pos: [-1.9, -1.5, -0.2], shape: 'votive', col: COLORS.velvetRed },
    { type: 'candle', pos: [0.8, -1.5, 2.8], shape: 'pillar', col: COLORS.emerald },
    { type: 'candle', pos: [1.1, -1.5, 3.1], shape: 'votive', col: COLORS.gold },
    { type: 'candle', pos: [0.5, -1.5, 3.2], shape: 'taper', col: COLORS.emerald },
    { type: 'candle', pos: [-1.5, -1.5, 2.5], shape: 'taper', col: COLORS.gold },
    { type: 'candle', pos: [-1.8, -1.5, 2.8], shape: 'pillar', col: COLORS.emerald },
    { type: 'candle', pos: [5.2, -1.5, 2.8], shape: 'pillar', col: COLORS.velvetRed },
    { type: 'candle', pos: [5.5, -1.5, 3.5], shape: 'votive', col: COLORS.gold },
    { type: 'candle', pos: [6.0, -1.5, 2.0], shape: 'pillar', col: COLORS.velvetPurple },
    { type: 'candle', pos: [-6.2, -1.5, 3.0], shape: 'votive', col: COLORS.velvetPurple },
    { type: 'candle', pos: [-4.0, -1.5, 5.0], shape: 'taper', col: COLORS.emerald },
    { type: 'candle', pos: [-3.5, -1.5, 4.5], shape: 'pillar', col: COLORS.velvetRed },
    { type: 'candle', pos: [-7.0, -1.5, 0.0], shape: 'pillar', col: COLORS.gold },
    { type: 'candle', pos: [7.0, -1.5, 1.0], shape: 'taper', col: COLORS.emerald },
    { type: 'candle', pos: [0.0, -1.5, 6.0], shape: 'pillar', col: COLORS.velvetRed },
    { type: 'candle', pos: [-2.0, -1.5, 6.5], shape: 'votive', col: COLORS.gold },
    { type: 'candle', pos: [2.0, -1.5, 6.5], shape: 'votive', col: COLORS.gold },
  ] as any[], []);

  const lanterns = useMemo(() => [
    { type: 'square', pos: [3.5, -1.5, 0.5], scale: 1.2, rot: [0, 0.5, 0] },
    { type: 'tall', pos: [-3.0, -1.5, 1.8], scale: 1.0, rot: [0, -0.8, 0] },
    { type: 'round', pos: [0, -1.5, 4.0], scale: 1.3, rot: [0, 0, 0] },
    { type: 'square', pos: [-4.5, -1.5, -1.5], scale: 0.8, rot: [0, 1.2, 0] },
    { type: 'tall', pos: [5.0, -1.5, -2.5], scale: 1.1, rot: [0, -0.4, 0] },
    { type: 'round', pos: [-2, -1.5, -5.0], scale: 1.0, rot: [0, 0.2, 0] },
    { type: 'square', pos: [4, -1.5, -6.0], scale: 0.9, rot: [0, -0.2, 0] },
  ] as any[], []);

  const balloons = useMemo(() => [
      { pos: [4, 1.5, 3], col: COLORS.gold, sc: 1.2 },
      { pos: [4.5, 2.2, 3.5], col: COLORS.velvetRed, sc: 1.0 },
      { pos: [-4.5, 1.8, 2.5], col: COLORS.emerald, sc: 1.1 },
      { pos: [-3.8, 2.8, 4.0], col: COLORS.sapphireBlue, sc: 0.9 },
      { pos: [0, 3.5, -4], col: COLORS.gold, sc: 1.3 },
      { pos: [-6, 2.5, -2], col: COLORS.velvetPurple, sc: 1.1 },
      { pos: [6, 3.0, -2], col: COLORS.velvetRed, sc: 1.1 },
      { pos: [2.5, 4.5, 5], col: COLORS.emerald, sc: 1.0 },
      { pos: [-2.5, 5.0, 6], col: COLORS.gold, sc: 1.2 },
  ] as any[], []);

  const gingerbreadCircle = useMemo(() => {
    const radius = 4.2;
    const count = 12;
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        pos: [Math.cos(angle) * radius, -1.5, Math.sin(angle) * radius] as [number, number, number],
        rot: -angle + Math.PI / 2
      };
    });
  }, []);

  // Extra ground lights for ambiance
  const groundGlows = useMemo(() => [
      { pos: [0, -1.8, 2], col: COLORS.gold, intensity: 1.5 },
      { pos: [-3, -1.8, -2], col: COLORS.velvetRed, intensity: 1.2 },
      { pos: [3, -1.8, -2], col: COLORS.emerald, intensity: 1.2 },
      { pos: [6, -1.8, 4], col: COLORS.gold, intensity: 1.0 },
      { pos: [-6, -1.8, 4], col: COLORS.velvetPurple, intensity: 1.0 },
      { pos: [0, -1.8, -5], col: COLORS.gold, intensity: 0.8 },
  ], []);

  return (
    <group>
      {decorations.map((d, i) => (
        d.type === 'box' ? (
          <GiftBox key={i} position={d.pos} color={d.col} size={d.size} rotation={d.rot} />
        ) : (
          <Candle key={i} position={d.pos} color={d.col} shape={d.shape} />
        )
      ))}
      
      {lanterns.map((l, i) => (
        <Lantern key={i} position={l.pos} rotation={l.rot} scale={l.scale} type={l.type} />
      ))}

      {balloons.map((b, i) => (
          <Balloon key={i} position={b.pos} color={b.col} scale={b.sc} />
      ))}

      {groundGlows.map((g, i) => (
          <GroundGlow key={i} position={g.pos as any} color={g.col} intensity={g.intensity} />
      ))}

      {gingerbreadCircle.map((g, i) => (
        <GingerbreadMan key={i} position={g.pos} rotationY={g.rot} />
      ))}

      <SleighCargo position={[-5.2, -1.8, -3.0]} rotation={[0, 0.8, 0]} mainColor={COLORS.emerald} glowColor="#FFFFFF" />
      <SleighCargo position={[5.8, -1.8, -2.5]} rotation={[0, -0.5, 0]} mainColor={COLORS.velvetRed} glowColor="#FFFF00" />
    </group>
  );
};
