
import React, { useState } from 'react';
import { Experience } from './components/Experience';
import { UIOverlay } from './components/UIOverlay';
import { BackgroundMusic } from './components/BackgroundMusic';
import { HandGestureController } from './components/HandGestureController';
import { TreeState } from './constants';

const App: React.FC = () => {
  const [selectedWish, setSelectedWish] = useState<string | null>(null);
  const [mode, setMode] = useState<TreeState>(TreeState.TREE);
  const [isMuted, setIsMuted] = useState(true);
  const [gestureRotation, setGestureRotation] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [magnifiedItem, setMagnifiedItem] = useState<string | null>(null);
  const [handStatus, setHandStatus] = useState<string>('Searching...');

  const handleOrnamentSelect = (label: string) => {
    setSelectedWish(label);
  };

  const toggleMode = () => {
    setMode(prev => prev === TreeState.TREE ? TreeState.SCATTERED : TreeState.TREE);
    setSelectedWish(null);
    setMagnifiedItem(null);
  };

  const handleGestureAction = (action: string, data?: any) => {
    setHandStatus(action);
    if (action === 'FIST') {
      setMode(TreeState.TREE);
      setMagnifiedItem(null);
    } else if (action === 'OPEN') {
      setMode(TreeState.SCATTERED);
    } else if (action === 'ROTATE') {
      setGestureRotation(data);
    } else if (action === 'GRAB' && data) {
      setMagnifiedItem(data); // data is the label of the item being grabbed
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#021a11] overflow-hidden">
      <BackgroundMusic isMuted={isMuted} />

      {/* Gesture Input Processing */}
      <HandGestureController 
        onAction={handleGestureAction} 
        mode={mode}
      />

      {/* 3D Experience with Gesture Pass-through */}
      <Experience 
        mode={mode} 
        onOrnamentSelect={handleOrnamentSelect}
        gestureRotation={gestureRotation}
        magnifiedItem={magnifiedItem}
      />
      
      <UIOverlay 
        mode={mode}
        onToggleMode={toggleMode}
        selectedWish={selectedWish} 
        onClearWish={() => setSelectedWish(null)}
        isMuted={isMuted}
        onToggleMusic={() => setIsMuted(!isMuted)}
        handStatus={handStatus}
        magnifiedItem={magnifiedItem}
        onCloseMagnification={() => setMagnifiedItem(null)}
      />

      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.9)] z-10"></div>
    </div>
  );
};

export default App;
