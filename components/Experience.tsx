
import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, Float } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ChristmasTree } from './Tree';
import { Ornaments } from './Ornaments';
import { SnowParticles } from './SnowParticles';
import { EnvironmentDecorations } from './EnvironmentDecorations';
import { COLORS, TreeState } from '../constants';

interface ExperienceProps {
  mode: TreeState;
  onOrnamentSelect: (label: string) => void;
  gestureRotation?: { x: number, y: number };
  magnifiedItem?: string | null;
}

export const Experience: React.FC<ExperienceProps> = ({ 
  mode, 
  onOrnamentSelect, 
  gestureRotation = { x: 0, y: 0 },
  magnifiedItem 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current && mode === TreeState.SCATTERED && !magnifiedItem) {
      // Smoothly rotate the scene based on hand movement
      const targetRotY = gestureRotation.x * 0.5;
      const targetRotX = gestureRotation.y * 0.2;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 2);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 2);
    }
  });

  return (
    <div className="absolute inset-0 z-0">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={45} />
        
        <color attach="background" args={[COLORS.midnight]} />
        <fog attach="fog" args={[COLORS.midnight, 8, 45]} />

        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <hemisphereLight args={['#0a4030', '#021a11', 0.6]} position={[0, 20, 0]} />
          <spotLight position={[15, 20, 10]} angle={0.3} penumbra={1} intensity={4} castShadow />

          <group ref={groupRef} position={[0, -0.5, 0]}>
            <ChristmasTree mode={mode} />
            <Ornaments mode={mode} onOrnamentSelect={onOrnamentSelect} magnifiedItem={magnifiedItem} />
            <SnowParticles />
            <EnvironmentDecorations />
            <SnowyGround />
            
            <ContactShadows opacity={0.4} scale={40} blur={2.5} far={10} resolution={512} color="#000000" />
          </group>

          <Environment preset="night" />
          
          <OrbitControls 
            enablePan={false} 
            minDistance={6} 
            maxDistance={25} 
            autoRotate={mode === TreeState.SCATTERED && !magnifiedItem}
            autoRotateSpeed={0.3}
            enabled={!magnifiedItem}
          />

          <EffectComposer>
            <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.2} radius={0.4} />
            {magnifiedItem && <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={5} height={480} />}
            <Noise opacity={0.04} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
};

// Simplified Ground for cleaner code
const SnowyGround: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]} receiveShadow>
    <planeGeometry args={[100, 100]} />
    <meshStandardMaterial color={COLORS.snow} roughness={0.9} />
  </mesh>
);
