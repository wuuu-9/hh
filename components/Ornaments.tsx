
import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS, TreeState } from '../constants';

interface OrnamentsProps {
  mode: TreeState;
  onOrnamentSelect: (label: string) => void;
  magnifiedItem?: string | null;
}

const MemoryPhoto: React.FC<{ label: string; mode: TreeState; magnified: boolean; treePos: [number, number, number]; scatterPos: [number, number, number] }> = ({ label, mode, magnified, treePos, scatterPos }) => {
  const meshRef = useRef<THREE.Group>(null);
  const progress = useRef(mode === TreeState.TREE ? 1 : 0);
  const magProgress = useRef(0);

  useFrame((state, delta) => {
    const target = mode === TreeState.TREE ? 1 : 0;
    progress.current = THREE.MathUtils.lerp(progress.current, target, delta * 2);
    
    const magTarget = magnified ? 1 : 0;
    magProgress.current = THREE.MathUtils.lerp(magProgress.current, magTarget, delta * 4);

    if (meshRef.current) {
      const x = THREE.MathUtils.lerp(scatterPos[0], treePos[0], progress.current);
      const y = THREE.MathUtils.lerp(scatterPos[1], treePos[1], progress.current);
      const z = THREE.MathUtils.lerp(scatterPos[2], treePos[2], progress.current);

      // In magnification mode, move to camera view
      const targetPos = new THREE.Vector3(x, y, z);
      if (magnified) {
        targetPos.set(0, 1, 5); // Center stage
      }
      
      meshRef.current.position.lerp(targetPos, delta * 5);
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(0.5, magnified ? 3 : 1, progress.current));
      
      if (magnified) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
      }
    }
  });

  return (
    <group ref={meshRef}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 1, 0.05]} />
          <meshStandardMaterial color={COLORS.gold} metalness={1} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.031]}>
          <planeGeometry args={[0.7, 0.9]} />
          <meshBasicMaterial color="#333" />
        </mesh>
        {/* Placeholder for "Photo" Content */}
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[0.65, 0.85]} />
          <meshStandardMaterial color={COLORS.emerald} emissive={COLORS.gold} emissiveIntensity={0.2} />
        </mesh>
      </Float>
      {magnified && (
        <Html position={[0, -0.8, 0]} center>
          <div className="bg-black/80 backdrop-blur-xl p-4 rounded-xl border border-[#D4AF37] text-white text-center w-[300px]">
            <h3 className="font-serif italic text-xl text-[#D4AF37] mb-2">{label}</h3>
            <p className="text-sm opacity-80 leading-relaxed">A cherished memory of elegance and festive warmth, captured by Arix Signature.</p>
          </div>
        </Html>
      )}
    </group>
  );
};

export const Ornaments: React.FC<OrnamentsProps> = ({ mode, onOrnamentSelect, magnifiedItem }) => {
  const photoItems = useMemo(() => [
    { label: "Memory of Gold", tPos: [1.2, 0.5, 0.8], sPos: [5, 2, -4] },
    { label: "Midnight Soiree", tPos: [-1.2, 0.8, -0.5], sPos: [-5, 4, 3] },
  ], []);

  return (
    <group>
      {photoItems.map((photo, i) => (
        <MemoryPhoto 
          key={i} 
          {...photo} 
          mode={mode} 
          magnified={magnifiedItem === photo.label}
          treePos={photo.tPos as any}
          scatterPos={photo.sPos as any}
        />
      ))}
      {/* Original Ornaments Logic (simplified for brevity) */}
      <mesh position={[0.8, -1, 0.8]} onClick={() => onOrnamentSelect("Prosperity")}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color={COLORS.gold} metalness={1} />
      </mesh>
    </group>
  );
};
