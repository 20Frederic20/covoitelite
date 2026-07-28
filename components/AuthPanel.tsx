"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Car, ArrowLeft, Check } from "lucide-react";

/**
 * The left half of the auth screens: a photograph under an ink veil, cut by the
 * same chevron the landing hero uses. It carries the brand while the right half
 * stays quiet enough to fill in a form.
 */
export default function AuthPanel({
  image,
  alt,
  title,
  subtitle,
  points,
}: {
  image: string;
  alt: string;
  title: React.ReactNode;
  subtitle: string;
  points: string[];
}) {
  const reduce = useReducedMotion();

  return (
    <aside className="relative isolate flex min-h-[19rem] flex-col justify-between overflow-hidden bg-night p-7 sm:p-9 lg:min-h-dvh lg:p-12">
      <Image
        src={image}
        alt={alt}
        fill
        priority
        sizes="(max-width: 1023px) 100vw, 50vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-[#121316]/95 via-[#121316]/80 to-[#121316]/60"
      />
      {/* The chevron sits on the edge as an accent — it never crosses the text. */}
      <svg
        viewBox="0 0 100 140"
        aria-hidden
        className="pointer-events-none absolute -right-[3%] top-1/2 h-[26%] w-auto -translate-y-1/2 text-brand"
        fill="currentColor"
      >
        <path d="M0 0 L58 70 L0 140 L42 140 L100 70 L42 0 Z" />
      </svg>
      <svg
        viewBox="0 0 100 140"
        aria-hidden
        className="pointer-events-none absolute -right-[14%] top-1/2 h-[60%] w-auto -translate-y-1/2 text-white/[0.06]"
        fill="currentColor"
      >
        <path d="M0 0 L58 70 L0 140 L42 140 L100 70 L42 0 Z" />
      </svg>

      <div className="relative z-10 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-brand text-on-brand">
            <Car size={19} strokeWidth={2.4} />
          </span>
          <span className="text-lg font-extrabold tracking-[-0.03em] text-white">
            Covoit<span className="text-brand">elite</span>
          </span>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-2 text-[13px] font-bold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Accueil</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mt-10 max-w-md"
      >
        <h2 className="text-display text-white">{title}</h2>
        <p className="mt-4 text-lead text-white/65">{subtitle}</p>

        <ul className="mt-8 space-y-3">
          {points.map((point, i) => (
            <motion.li
              key={point}
              initial={{ opacity: 0, x: reduce ? 0 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.08 }}
              className="flex items-center gap-3 text-sm font-semibold text-white/75"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                <Check size={13} strokeWidth={3} />
              </span>
              {point}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </aside>
  );
}
