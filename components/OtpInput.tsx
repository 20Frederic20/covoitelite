"use client";

import { useRef, useEffect } from "react";
import { OTP_LENGTH } from "@/lib/auth";

/**
 * Six single-digit cells, like the mobile OTP screen: typing advances, backspace
 * on an empty cell steps back, pasting a code fills every cell, and the form
 * submits itself as soon as the sixth digit lands.
 */
export default function OtpInput({
  value,
  onChange,
  onComplete,
  hasError = false,
  disabled = false,
}: {
  value: string;
  onChange: (next: string) => void;
  onComplete?: (code: string) => void;
  hasError?: boolean;
  disabled?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (disabled) return;
    const handle = requestAnimationFrame(() => refs.current[0]?.focus());
    return () => cancelAnimationFrame(handle);
  }, [disabled]);

  useEffect(() => {
    if (disabled) return;
    if (value === "") {
      refs.current[0]?.focus();
    }
  }, [value, disabled]);

  const setDigit = (index: number, digit: string) => {
    const next = value.padEnd(OTP_LENGTH, " ").split("");
    next[index] = digit || " ";
    const code = next.join("").replace(/\s/g, "");
    onChange(code);
    return code;
  };

  const handleChange = (index: number, raw: string) => {
    if (disabled) return;
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setDigit(index, "");
      return;
    }

    // A paste (or an autofilled one-time code) fills the whole row at once.
    if (digits.length > 1) {
      const code = digits.slice(0, OTP_LENGTH);
      onChange(code);
      refs.current[Math.min(code.length, OTP_LENGTH - 1)]?.focus();
      if (code.length === OTP_LENGTH) onComplete?.(code);
      return;
    }

    const code = setDigit(index, digits);
    if (index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
    if (code.length === OTP_LENGTH) onComplete?.(code);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "Backspace" && !value[index] && index > 0) {
      e.preventDefault();
      setDigit(index - 1, "");
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
  };

  return (
    <div className="flex gap-2 sm:gap-2.5">
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label={`Chiffre ${i + 1}`}
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className={`h-13 min-w-0 flex-1 rounded-[11px] border-[1.5px] bg-surface text-center text-xl font-extrabold text-ink transition-colors focus:outline-none ${
            disabled
              ? "opacity-50 cursor-not-allowed border-line bg-surface-alt"
              : hasError
                ? "border-danger"
                : "border-line focus:border-brand-dark focus:ring-[3px] focus:ring-brand-tint"
          }`}
          style={{ height: "3.25rem" }}
        />
      ))}
    </div>
  );
}
