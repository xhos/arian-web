import { useEffect, useRef, useState } from "react";

type CollapseProps = {
  open: boolean;
  duration?: number;   // ms
  easing?: string;     // css timing function
  children: React.ReactNode;
  className?: string;
};

export function Collapse({
  open,
  duration = 300,
  easing = "ease-out",
  children,
  className = "",
}: CollapseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the component with correct starting height
  useEffect(() => {
    const el = containerRef.current;
    if (!el || isInitialized) return;
    
    el.style.height = open ? "auto" : "0px";
    setIsInitialized(true);
  }, [open, isInitialized]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isInitialized) return;

    const onEnd = () => {
      isTransitioningRef.current = false;
      el.style.transition = "";
      if (open) el.style.height = "auto";
    };

    el.removeEventListener("transitionend", onEnd);

    const currentHeight = el.getBoundingClientRect().height;
    const targetHeight = open ? el.scrollHeight : 0;

    if (Math.abs(currentHeight - targetHeight) < 1 && !isTransitioningRef.current) {
      el.style.height = open ? "auto" : "0px";
      return;
    }

    isTransitioningRef.current = true;

    el.style.height = `${currentHeight}px`;
    el.style.overflow = "hidden";
    el.style.transition = `height ${duration}ms ${easing}`;

    void el.offsetHeight;

    el.style.height = `${targetHeight}px`;

    el.addEventListener("transitionend", onEnd);
    return () => el.removeEventListener("transitionend", onEnd);
  }, [open, duration, easing, isInitialized]);

  return (
    <div
      ref={containerRef}
      style={{ height: "0px" }}
      className={`overflow-hidden will-change-[height] ${className}`}
    >
      {children}
    </div>
  );
}