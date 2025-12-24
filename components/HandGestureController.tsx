
import React, { useEffect, useRef } from 'react';
import { TreeState } from '../constants';

interface HandGestureControllerProps {
  onAction: (action: string, data?: any) => void;
  mode: TreeState;
}

export const HandGestureController: React.FC<HandGestureControllerProps> = ({ onAction, mode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastGestureRef = useRef<string>('');
  const frameId = useRef<number>(0);

  useEffect(() => {
    let hands: any;
    let camera: any;

    const initMediaPipe = async () => {
      // Import MediaPipe from ESM
      const mpHands = await import('https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.js');
      const mpCamera = await import('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.4.1646424915/camera_utils.js');
      
      // Fix: Casting window to any to access MediaPipe objects that may be attached to the global scope
      const Hands = (mpHands as any).Hands || (window as any).Hands;
      const Camera = (mpCamera as any).Camera || (window as any).Camera;

      if (!Hands || !Camera) return;

      hands = new Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      hands.onResults(onResults);

      if (videoRef.current) {
        camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) await hands.send({ image: videoRef.current });
          },
          width: 640,
          height: 480,
        });
        camera.start();
      }
    };

    const onResults = (results: any) => {
      if (!canvasRef.current || !results.multiHandLandmarks) return;

      const canvasCtx = canvasRef.current.getContext('2d')!;
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Visualize hand for HUD
        drawHand(canvasCtx, landmarks);

        // Gesture Detection Logic
        const isFist = checkFist(landmarks);
        const isOpen = checkOpen(landmarks);
        const palmCenter = landmarks[9]; // Middle finger MCP

        if (isFist && lastGestureRef.current !== 'FIST') {
          onAction('FIST');
          lastGestureRef.current = 'FIST';
        } else if (isOpen && lastGestureRef.current !== 'OPEN') {
          onAction('OPEN');
          lastGestureRef.current = 'OPEN';
        } else if (isOpen) {
          // Rotation logic based on palm position
          const rotationX = (palmCenter.x - 0.5) * 2;
          const rotationY = (palmCenter.y - 0.5) * 2;
          onAction('ROTATE', { x: rotationX, y: rotationY });
          lastGestureRef.current = 'OPEN';
        } else if (checkGrab(landmarks)) {
           // Basic Grab/Pinch detection
           onAction('GRAB', 'Memory of Gold'); // Placeholder label
           lastGestureRef.current = 'GRAB';
        }
      } else {
        onAction('NOT_FOUND');
      }
      canvasCtx.restore();
    };

    const drawHand = (ctx: CanvasRenderingContext2D, landmarks: any) => {
      ctx.fillStyle = '#D4AF37';
      ctx.strokeStyle = '#06402B';
      ctx.lineWidth = 2;
      
      landmarks.forEach((point: any) => {
        ctx.beginPath();
        ctx.arc(point.x * 200, point.y * 150, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const checkFist = (l: any) => {
      // Distance between tips and palm center
      const tips = [8, 12, 16, 20];
      const palm = l[0];
      return tips.every(t => Math.hypot(l[t].x - palm.x, l[t].y - palm.y) < 0.15);
    };

    const checkOpen = (l: any) => {
      const tips = [8, 12, 16, 20];
      const palm = l[0];
      return tips.every(t => Math.hypot(l[t].x - palm.x, l[t].y - palm.y) > 0.35);
    };

    const checkGrab = (l: any) => {
      // Pinch between thumb (4) and index (8)
      const dist = Math.hypot(l[4].x - l[8].x, l[4].y - l[8].y);
      return dist < 0.05;
    };

    initMediaPipe();

    return () => {
      if (camera) camera.stop();
      if (hands) hands.close();
    };
  }, [onAction]);

  return (
    <div className="hidden">
      <video ref={videoRef} />
      <canvas ref={canvasRef} width={200} height={150} className="fixed bottom-4 left-4 z-50 rounded-xl border-2 border-[#D4AF37] bg-black/40" />
    </div>
  );
};
