"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const HIDE_EVENT = "chronostrap:hero-ready";
const SESSION_FLAG = "cs_loaded";
const MIN_VISIBLE_MS = 600;
const FALLBACK_MS = 4500;

export function LoadingScreen() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_FLAG)) return;
    setMounted(true);
    setVisible(true);

    const start = performance.now();
    let hideScheduled = false;

    function hide() {
      if (hideScheduled) return;
      hideScheduled = true;
      const elapsed = performance.now() - start;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
      window.setTimeout(() => setVisible(false), wait);
    }

    window.addEventListener(HIDE_EVENT, hide);
    const fallback = window.setTimeout(hide, FALLBACK_MS);

    return () => {
      window.removeEventListener(HIDE_EVENT, hide);
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <AnimatePresence
      onExitComplete={() => {
        setMounted(false);
        sessionStorage.setItem(SESSION_FLAG, "1");
      }}
    >
      {visible && (
        <motion.div
          key="chronostrap-loader"
          aria-busy
          aria-live="polite"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-100 flex items-center justify-center"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 40%, #fff 0%, #f4efe6 60%, #ebe3d2 100%)",
          }}
        >
          <div className="flex flex-col items-center gap-8">
            <div className="relative flex items-center justify-center">
              <motion.span
                aria-hidden
                className="absolute -inset-10 rounded-full bg-pop/15 blur-2xl"
                animate={{ opacity: [0.35, 0.85, 0.35], scale: [1, 1.18, 1] }}
                transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
              />
              <motion.img
                src="/logo.png"
                alt="ChronoStrap"
                className="relative h-16 w-auto brightness-0 lg:h-20"
                initial={{ opacity: 0, y: 8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  opacity: { duration: 0.5, ease: "easeOut" },
                  y: { duration: 0.5, ease: "easeOut" },
                  scale: { duration: 2.4, ease: "easeInOut", repeat: Infinity },
                }}
              />
            </div>

            <div className="relative h-px w-48 overflow-hidden bg-ink/10 lg:w-64">
              <motion.span
                aria-hidden
                className="absolute inset-y-0 left-0 w-1/3 bg-ink/70"
                initial={{ x: "-110%" }}
                animate={{ x: "360%" }}
                transition={{
                  duration: 1.6,
                  ease: [0.4, 0, 0.2, 1],
                  repeat: Infinity,
                }}
              />
            </div>

            <motion.p
              className="text-[10px] font-extrabold tracking-[0.32em] text-ink/55 uppercase"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              Crafting your view
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
