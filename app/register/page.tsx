"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { MessageSquare, Mail, User, Check, ArrowLeft } from "lucide-react";
import AuthPanel from "@/components/AuthPanel";
import OtpInput from "@/components/OtpInput";
import {
  isEmail,
  isValidBeninPhone,
  normalizePhone,
  DEMO_OTP,
  OTP_LENGTH,
  RESEND_SECONDS,
} from "@/lib/auth";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const { setUser } = useStore();
  const router = useRouter();
  const reduce = useReducedMotion();

  const canSubmit =
    accepted &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    isValidBeninPhone(phone) &&
    isEmail(email);

  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [step, secondsLeft]);

  const requestCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setOtp("");
    setSecondsLeft(RESEND_SECONDS);
    setStep("otp");
  };

  const resend = () => {
    if (secondsLeft > 0) return;
    setOtp("");
    setError("");
    setSecondsLeft(RESEND_SECONDS);
  };

  // No role is chosen here: everyone starts as a passenger, exactly like the app.
  // Becoming a driver is a separate, verified step.
  const verify = (code: string) => {
    if (code !== DEMO_OTP) {
      setError("Code incorrect.");
      setOtp("");
      return;
    }

    setUser({
      id: Math.random().toString(36).substring(2, 11),
      name: `${firstName.trim()} ${lastName.trim().toUpperCase()}`,
      email: email.trim().toLowerCase(),
      phone: normalizePhone(phone),
      role: "passenger",
      rating: 5.0,
      tripsCount: 0,
      debtDays: 0,
    });
    router.push("/");
  };

  const onSubmitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === OTP_LENGTH) verify(otp);
  };

  return (
    <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[1.05fr_1fr]">
      <AuthPanel
        image="/auth-road.jpg"
        alt="Une route ouverte, ligne jaune au centre"
        title={
          <>
            Prenez la route
            <span className="block italic text-brand">avec l&apos;élite.</span>
          </>
        }
        subtitle="Créez votre compte en une minute. Réservez une place, ou publiez le trajet que vous faites déjà."
        points={[
          "10 000 membres au Bénin",
          "Aucun frais pour les passagers",
          "Devenez conducteur quand vous voulez",
        ]}
      />

      <main className="flex items-center justify-center gutter py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[24rem]"
        >
          {step === "form" ? (
            <>
              <h1 className="text-display text-ink">Créer votre compte</h1>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                Renseignez vos informations, un code vous sera envoyé.
              </p>

              <form onSubmit={requestCode} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="field-label">
                      Prénom
                    </label>
                    <div className="flex items-stretch overflow-hidden rounded-[12px] border-[1.5px] border-line bg-surface transition-colors focus-within:border-brand-dark focus-within:ring-[3px] focus-within:ring-brand-tint">
                      <span className="flex shrink-0 items-center pl-3.5 text-muted">
                        <User size={16} />
                      </span>
                      <input
                        id="firstName"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) =>
                          setFirstName(
                            e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1),
                          )
                        }
                        placeholder="Aïcha"
                        className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[15px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lastName" className="field-label">
                      Nom
                    </label>
                    <div className="flex items-stretch overflow-hidden rounded-[12px] border-[1.5px] border-line bg-surface transition-colors focus-within:border-brand-dark focus-within:ring-[3px] focus-within:ring-brand-tint">
                      <span className="flex shrink-0 items-center pl-3.5 text-muted">
                        <User size={16} />
                      </span>
                      <input
                        id="lastName"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value.toUpperCase())}
                        placeholder="DOSSOU"
                        className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[15px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="field-label">
                    Téléphone
                  </label>
                  <div className="flex items-stretch overflow-hidden rounded-[12px] border-[1.5px] border-line bg-surface transition-colors focus-within:border-brand-dark focus-within:ring-[3px] focus-within:ring-brand-tint">
                    <span className="flex shrink-0 items-center gap-1.5 border-r border-line px-3.5 text-sm font-bold text-ink">
                      🇧🇯 +229
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01 97 00 00 00"
                      className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-[15px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="field-label">
                    E-mail
                  </label>
                  <div className="flex items-stretch overflow-hidden rounded-[12px] border-[1.5px] border-line bg-surface transition-colors focus-within:border-brand-dark focus-within:ring-[3px] focus-within:ring-brand-tint">
                    <span className="flex shrink-0 items-center pl-3.5 text-muted">
                      <Mail size={17} />
                    </span>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aicha@example.com"
                      className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[15px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAccepted(!accepted)}
                  aria-pressed={accepted}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <span
                    className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border-[1.5px] transition-colors ${
                      accepted
                        ? "border-brand bg-brand text-on-brand"
                        : "border-line bg-surface"
                    }`}
                  >
                    {accepted && <Check size={14} strokeWidth={3.5} />}
                  </span>
                  <span className="text-[13px] font-medium leading-relaxed text-slate">
                    J&apos;accepte les{" "}
                    <span className="font-bold text-ink">Conditions générales</span> et la{" "}
                    <span className="font-bold text-ink">Politique de confidentialité</span>.
                  </span>
                </button>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="btn btn-primary btn-lg w-full"
                >
                  <MessageSquare size={17} />
                  Recevoir un code
                </button>
              </form>

              <p className="mt-8 border-t border-line pt-6 text-sm font-semibold text-slate">
                Déjà inscrit ?{" "}
                <Link
                  href="/login"
                  className="font-bold text-ink transition-colors hover:text-brand-dark"
                >
                  Se connecter
                </Link>
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setError("");
                  setOtp("");
                }}
                className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-slate transition-colors hover:text-ink"
              >
                <ArrowLeft size={15} />
                Modifier mes informations
              </button>

              <h1 className="text-display text-ink">Vérification</h1>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                Code à 6 chiffres envoyé par e-mail à{" "}
                <span className="font-bold text-ink">{email.trim().toLowerCase()}</span>.
              </p>

              <form onSubmit={onSubmitOtp} className="mt-8 space-y-5">
                <OtpInput
                  value={otp}
                  onChange={(next) => {
                    setOtp(next);
                    if (error) setError("");
                  }}
                  onComplete={verify}
                  hasError={!!error}
                />

                {error ? (
                  <p role="alert" className="text-sm font-semibold text-danger">
                    {error}
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-muted">
                    Démonstration : saisissez {DEMO_OTP}.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={otp.length !== OTP_LENGTH}
                  className="btn btn-primary btn-lg w-full"
                >
                  Continuer
                </button>
              </form>

              <p className="mt-6 text-sm font-semibold text-slate">
                Pas reçu ?{" "}
                {secondsLeft > 0 ? (
                  <span className="text-muted">
                    Renvoyer (0:{String(secondsLeft).padStart(2, "0")})
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={resend}
                    className="font-bold text-brand-dark transition-colors hover:text-ink"
                  >
                    Renvoyer le code
                  </button>
                )}
              </p>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
