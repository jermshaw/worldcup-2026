import { useEffect, useRef } from 'react';
import wcBallVideo from '../assets/nav/ball-animated.mp4';

interface Props {
  className?: string;
  size?: number;
}

export default function BallAnimation({ className, size = 50 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let raf = 0;

    function drawFrame() {
      if (!ctx || !canvas || !video) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        // Zero out near-black pixels
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum < 30) d[i + 3] = 0;
      }
      ctx.putImageData(imageData, 0, 0);
      raf = requestAnimationFrame(drawFrame);
    }

    function onMeta() {
      if (!canvas || !video) return;
      canvas.width = video.videoWidth || size * 2;
      canvas.height = video.videoHeight || size * 2;
    }

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('playing', () => {
      raf = requestAnimationFrame(drawFrame);
    });

    video.play().catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [size]);

  return (
    <>
      <video ref={videoRef} muted loop playsInline style={{ display: 'none' }}>
        <source src={wcBallVideo} type="video/mp4" />
      </video>
      <canvas ref={canvasRef} className={className} style={{ width: size, height: size }} />
    </>
  );
}
