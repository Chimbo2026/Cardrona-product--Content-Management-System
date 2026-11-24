import { useEffect, useRef, useState } from 'react';
import { Eraser } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function SignaturePad({ value, onChange }) {
  const { bi } = useLanguage();
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const movesRef = useRef(0);
  const [hasInk, setHasInk] = useState(Boolean(value));

  const prepareCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 300;
    const height = canvas.clientHeight || 150;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1d1d1d';
    return ctx;
  };

  useEffect(() => {
    const ctx = prepareCanvas();
    if (ctx && value) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas && ctx) {
          ctx.drawImage(img, 0, 0, canvas.clientWidth, canvas.clientHeight);
        }
      };
      img.src = value;
    }
  }, []);

  const locate = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const startStroke = (event) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    drawingRef.current = true;
    movesRef.current = 0;
    const { x, y } = locate(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawStroke = (event) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = locate(event);
    ctx.lineTo(x, y);
    ctx.stroke();
    movesRef.current += 1;
    if (!hasInk) setHasInk(true);
  };

  const endStroke = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (movesRef.current === 0) {
      const ctx = prepareCanvas();
      if (ctx) ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      setHasInk(false);
      onChange('');
      return;
    }
    onChange(canvas.toDataURL('image/png'));
    setHasInk(true);
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    const ctx = prepareCanvas();
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    setHasInk(false);
    onChange('');
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-white ${
        hasInk ? 'border-border' : 'border-dashed border-slate-300'
      }`}
    >
      <canvas
        ref={canvasRef}
        className="h-[150px] w-full touch-none"
        onPointerDown={startStroke}
        onPointerMove={drawStroke}
        onPointerUp={endStroke}
        onPointerLeave={endStroke}
        onPointerCancel={endStroke}
      />
      {!hasInk && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] text-slate-400">
          {bi('请在此处手写签名', 'Sign here')}
        </span>
      )}
      <button
        type="button"
        onClick={clearPad}
        className="absolute right-2 top-2 inline-flex h-7 items-center gap-1 rounded-full border border-border bg-white/95 px-2 text-[10px] text-slate-600 shadow-sm"
      >
        <Eraser className="h-3 w-3" /> {bi('清除', 'Clear')}
      </button>
    </div>
  );
}