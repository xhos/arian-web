"use client";
import { useEffect, useRef, useState } from "react";

type Star = { x: number; y: number; z: number; p: number; s: number };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function AsciiStars({
  density = 0.03,
  speed = 0.6,
  twinkle = true,
  sparkle = true,
  radius = 100,
  fps = 20,
  className = "",
  cw = 8, // px per char column
  ch = 16, // px per row
  seed = 1337, // deterministic layout
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
  seed?: number;
}) {
  const root = useRef<HTMLDivElement>(null); // the container we clip to
  const layer = useRef<HTMLDivElement>(null); // absolutely-positioned overlay
  const pre = useRef<HTMLPreElement>(null);

  // grid measured from the container (NOT from the <pre>, so no feedback loop)
  const [grid, setGrid] = useState({ cols: 60, rows: 40 });

  // deterministic RNG
  const rng = useRef(makeRng(seed));

  // persistent stars + previous grid for rescaling
  const stars = useRef<Star[]>([]);
  const prevGrid = useRef(grid);

  // pointer (container-relative → char coords)
  const mouse = useRef({ x: -999, y: -999, active: false });

  // --- size from container content box
  useEffect(() => {
    if (!layer.current) return;

    const update = () => {
      const el = layer.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cols = Math.max(40, (r.width / cw) | 0);
      const rows = Math.max(20, (r.height / ch) | 0);

      // scale existing stars to new grid
      const pg = prevGrid.current;
      if (pg.cols !== cols || pg.rows !== rows) {
        const sx = cols / pg.cols;
        const sy = rows / pg.rows;
        for (const st of stars.current) {
          st.x = (st.x * sx) % cols;
          st.y = (st.y * sy) % rows;
        }
        prevGrid.current = { cols, rows };
      }
      setGrid({ cols, rows });

      // maintain density without nuking the array
      const target = Math.max(80, (cols * rows * density) | 0);
      if (stars.current.length < target) {
        stars.current.push(
          ...makeStars(target - stars.current.length, { cols, rows }, rng.current)
        );
      } else if (stars.current.length > target) {
        stars.current.length = target;
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(layer.current);
    return () => ro.disconnect();
  }, [cw, ch, density]);

  // init stars once
  useEffect(() => {
    if (!stars.current.length) {
      const { cols, rows } = grid;
      const n = Math.max(80, (cols * rows * density) | 0);
      stars.current = makeStars(n, grid, rng.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pointer mapping relative to the container
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = layer.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x >= r.width || y >= r.height) {
        mouse.current.active = false;
        return;
      }
      mouse.current = { x: (x / cw) | 0, y: (y / ch) | 0, active: true };
    };
    const onLeave = () => (mouse.current.active = false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [cw, ch]);

  // animation
  useEffect(() => {
    let id = 0,
      last = 0,
      acc = 0;
    const step = 1000 / Math.max(1, fps);
    const pal = [" ", ".", ",", ":", ";", "+", "*", "x", "%", "#", "@"];
    const spark = ["·", "•", "✶", "✷", "✦"];

    const tick = (t: number) => {
      const delta = Math.min(50, t - last);
      last = t;
      acc += delta;
      if (acc < step) {
        id = requestAnimationFrame(tick);
        return;
      }
      acc = 0;

      const { cols, rows } = grid;
      const buf = Array.from({ length: rows }, () => Array(cols).fill(" "));
      const { x: mx, y: my, active } = mouse.current;

      for (let i = 0; i < stars.current.length; i++) {
        const st = stars.current[i];

        // drift + wrap inside container grid
        st.x += (0.2 + st.z * speed) * (delta * 0.001);
        if (st.x >= cols) st.x -= cols;

        if (twinkle) st.p += delta * 0.001 * (0.6 + st.s * 0.8);

        const gx = st.x | 0;
        const gy = st.y | 0;
        if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;

        let b = twinkle ? 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(st.p)) : 0.7;

        if (active) {
          const dx = gx - mx,
            dy = gy - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < radius) {
            const k = 1 - d2 / radius;
            const force = k * k; // quadratic falloff for stronger nearby effect
            b = Math.min(1, b + force * 1.2);

            // stronger repulsion in both x and y directions
            const pushX = dx > 0 ? 0.8 : -0.8;
            const pushY = dy > 0 ? 0.8 : -0.8;

            st.x += pushX * force;
            st.y += pushY * force;

            // wrap around edges
            if (st.x < 0) st.x += cols;
            if (st.x >= cols) st.x -= cols;
            if (st.y < 0) st.y += rows;
            if (st.y >= rows) st.y -= rows;
          }
        }

        const idx = clamp((b * (pal.length - 1)) | 0, 0, pal.length - 1);
        buf[gy][gx] =
          sparkle && b > 0.9 && st.s > 0.7
            ? spark[(i + ((st.p * 10) | 0)) % spark.length]
            : pal[idx];
      }

      if (pre.current) pre.current.textContent = buf.map((r) => r.join("")).join("\n");
      id = requestAnimationFrame(tick);
    };

    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [grid, speed, twinkle, sparkle, fps, radius]);

  return (
    <div
      ref={root}
      className={`relative ${className}`} // parent should be sized by your layout
    >
      <div
        ref={layer}
        className="absolute inset-0 overflow-hidden bg-background text-foreground/70"
        style={{ contain: "strict", pointerEvents: "none" }} // ensure content never expands the box
      >
        <pre
          ref={pre}
          className="m-0 h-full w-full font-mono select-none opacity-80"
          style={{
            position: "absolute",
            inset: 0, // absolutely fill without affecting layout
            whiteSpace: "pre",
            lineHeight: `${ch}px`,
            fontSize: `${Math.round(ch * 0.875)}px`, // rough match to keep cw/ch sane
            padding: 16,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function makeStars(n: number, g: { cols: number; rows: number }, rnd: () => number): Star[] {
  const out: Star[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      x: rnd() * g.cols,
      y: rnd() * g.rows,
      z: rnd(),
      p: rnd() * 6.28318,
      s: rnd(),
    });
  }
  return out;
}

function makeRng(seed: number) {
  let s = seed >>> 0 || 1;
  return function rng() {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 0x100000000) / 0x100000000;
  };
}
