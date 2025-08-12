"use client";
import { useEffect, useMemo, useRef, useState } from "react";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function AsciiStars({
  density = 0.03,
  speed = 0.6,
  twinkle = true,
  sparkle = true,
  radius = 100,
  fps = 20,
  className = "",
  cw = 8,
  ch = 16,
}: {
  density?: number;
  speed?: number;
  twinkle?: boolean;
  sparkle?: boolean;
  radius?: number;
  fps?: number;
  className?: string;
  cw?: number;
  ch?: number;
}) {
  const pre = useRef<HTMLPreElement>(null);
  const div = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState({ cols: 60, rows: 40 });
  const mouse = useRef({ x: -999, y: -999, active: false });

  const stars = useMemo(() => {
    const { cols, rows } = grid;
    const n = Math.max(80, cols * rows * density | 0);
    return Array.from({ length: n }, () => ({
      x: Math.random() * cols,
      y: Math.random() * rows,
      z: Math.random(),
      p: Math.random() * 6.28,
      s: Math.random(),
    }));
  }, [grid, density]);

  useEffect(() => {
    const update = () => {
      if (!div.current) return;
      const r = div.current.getBoundingClientRect();
      setGrid({
        cols: Math.max(40, r.width / cw | 0),
        rows: Math.max(20, r.height / ch | 0),
      });
    };
    update();
    const ro = new ResizeObserver(update);
    if (div.current) ro.observe(div.current);
    return () => ro.disconnect();
  }, [cw, ch]);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!div.current) return;
      const r = div.current.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x >= r.width || y >= r.height) {
        mouse.current.active = false;
        return;
      }
      mouse.current = { x: x / cw | 0, y: y / ch | 0, active: true };
    };
    const leave = () => (mouse.current.active = false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
    };
  }, [cw, ch]);

  useEffect(() => {
    let id = 0;
    let last = 0;
    let acc = 0;
    const dt = 1000 / fps;
    const { cols, rows } = grid;
    const pal = [" ", ".", ",", ":", ";", "+", "*", "x", "%", "#", "@"];
    const spark = ["·", "•", "✶", "✷", "✦"];

    const tick = (t: number) => {
      const delta = Math.min(50, t - last);
      last = t;
      acc += delta;
      if (acc < dt) {
        id = requestAnimationFrame(tick);
        return;
      }
      acc = 0;

      const buf = Array(rows).fill(0).map(() => Array(cols).fill(" "));
      const { x: mx, y: my, active } = mouse.current;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.x += (0.2 + star.z * speed) * delta * 0.001;
        if (star.x >= cols) star.x -= cols;
        if (twinkle) star.p += delta * 0.001 * (0.6 + star.s * 0.8);

        const gx = star.x | 0;
        const gy = star.y | 0;
        if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;

        let b = twinkle ? 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(star.p)) : 0.7;

        if (active) {
          const dx = gx - mx;
          const dy = gy - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < radius) {
            const k = 1 - d2 / radius;
            b = Math.min(1, b + k * 0.9);
            star.y += (dy > 0 ? 0.15 : -0.15) * k;
            if (star.y < 0) star.y += rows;
            if (star.y >= rows) star.y -= rows;
          }
        }

        const idx = clamp((b * (pal.length - 1)) | 0, 0, pal.length - 1);
        buf[gy][gx] = sparkle && b > 0.9 && star.s > 0.7
          ? spark[(i + ((star.p * 10) | 0)) % spark.length]
          : pal[idx];
      }

      if (pre.current) pre.current.textContent = buf.map(r => r.join("")).join("\n");
      id = requestAnimationFrame(tick);
    };

    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [grid, stars, speed, twinkle, sparkle, fps, radius]);

  return (
    <div
      ref={div}
      className={`absolute inset-0 overflow-hidden bg-background text-foreground/70 ${className}`}
      style={{ pointerEvents: "none" }}
    >
      <pre
        ref={pre}
        className="h-full w-full m-0 p-4 leading-[16px] text-[14px] font-mono opacity-80 select-none"
        style={{ whiteSpace: "pre" }}
      />
    </div>
  );
}
