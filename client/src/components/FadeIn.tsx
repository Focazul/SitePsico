import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  fullWidth?: boolean;
}

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.65,
  className = "",
  direction = "up",
  fullWidth = false,
}: FadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { y: 16, x: 0 };
      case "down": return { y: -16, x: 0 };
      case "left": return { x: 16, y: 0 };
      case "right": return { x: -16, y: 0 };
      case "none": return { x: 0, y: 0 };
      default: return { y: 20, x: 0 };
    }
  };

  const initial = { opacity: 0, ...getInitialPosition() };
  const animate = isInView ? { opacity: 1, y: 0, x: 0 } : initial;

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      style={{ width: fullWidth ? "100%" : "auto" }}
    >
      {children}
    </motion.div>
  );
}
