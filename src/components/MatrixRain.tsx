"use client";
import { useEffect, useRef } from "react";

const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF$#<>/\\=+*CATCODE";

export default function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const size = 16;
    let w = 0, h = 0, drops: number[] = [], raf = 0, last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(w / size);
      drops = Array.from({ length: cols }, (_, i) => drops[i] ?? Math.floor(Math.random() * -h / size));
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h);
    };
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 55) return;
      last = t;
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${size - 2}px "Share Tech Mono", monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        const y = drops[i] * size;
        ctx.fillStyle = Math.random() > 0.975 ? "#c8ffc8" : "rgba(57,255,20,0.55)";
        ctx.fillText(ch, i * size, y);
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    if (reduce) { for (let k = 0; k < 60; k++) draw(k * 100); cancelAnimationFrame(raf); }
    else raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="matrix" aria-hidden="true" />;
}
