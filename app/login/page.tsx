"use client";

import { useState, useEffect } from "react";
import { useStore, User, mapRole } from "@/store/useStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { MessageSquare, Mail, ArrowLeft } from "lucide-react";
import AuthPanel from "@/components/AuthPanel";
import OtpInput from "@/components/OtpInput";
import {
  isEmail,
  isValidBeninPhone,
  normalizeIdentifier,
  OTP_LENGTH,
  RESEND_SECONDS,
} from "@/lib/auth";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [channel, setChannel] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const { setUser, user } = useStore();
  const router = useRouter();

  // Redirect already-authenticated users
  useEffect(() => {
    if (user) {
      router.replace(user.role === "admin" ? "/admin" : "/");
    }
  }, [user, router]);
  const reduce = useReducedMotion();

  const raw = channel === "phone" ? phone : email;
  const canSubmit =
    channel === "phone" ? isValidBeninPhone(phone) : isEmail(email);

  // Resend countdown, restarted every time a code goes out.
  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [step, secondsLeft]);

  /* ── Étape 1 : demander l'OTP ── */
  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true);
    setError("");
    setSuccess("");
    setIsSuccess(false);
    try {
      await api.post("/api/v1/auth/request-otp", {
        identifier: normalizeIdentifier(raw),
      });
      setOtp("");
      setSecondsLeft(RESEND_SECONDS);
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Impossible d'envoyer le code. Vérifiez vos informations.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Renvoi de l'OTP ── */
  const resend = async () => {
    if (secondsLeft > 0 || isSuccess) return;
    setIsLoading(true);
    setOtp("");
    setError("");
    setSuccess("");
    try {
      await api.post("/api/v1/auth/request-otp", {
        identifier: normalizeIdentifier(raw),
      });
      setSecondsLeft(RESEND_SECONDS);
    } catch (err: any) {
      setError(err.message || "Impossible de renvoyer le code.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Étape 2 : vérifier l'OTP ── */
  const verify = async (code: string) => {
    if (code.length !== OTP_LENGTH || isSuccess) return;
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/api/v1/auth/verify-otp", {
        identifier: normalizeIdentifier(raw),
        otpCode: code,
      });
      const { accessToken, user: backendUser } = res.data;
      const userRole = mapRole(backendUser.roles);
      const mappedUser: User = {
        id: backendUser.id,
        name:
          backendUser.fullName ||
          `${backendUser.firstName || ""} ${backendUser.lastName || ""}`.trim() ||
          "Utilisateur",
        email: backendUser.email || "",
        phone: backendUser.phone || normalizeIdentifier(raw),
        role: userRole,
        rating: 4.8,
        tripsCount: 0,
        debtDays: 0,
      };
      setUser(mappedUser, accessToken);
      setIsSuccess(true);
      setSuccess("Connexion réussie ! Redirection...");
      setTimeout(() => {
        router.push(userRole === "admin" ? "/admin" : "/");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Code incorrect ou expiré. Veuillez réessayer.");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === OTP_LENGTH && !isSuccess) verify(otp);
  };

  return (
    <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[1.05fr_1fr]">
      <AuthPanel
        image="/hero-driver.jpg"
        alt="Un conducteur au volant, au lever du jour"
        title={
          <>
            Votre place vous
            <span className="block italic text-brand">attend.</span>
          </>
        }
        subtitle="Retrouvez vos trajets, vos réservations et vos conducteurs habituels."
        points={[
          "Conducteurs vérifiés avant chaque publication",
          "Prix affichés en FCFA, sans surprise",
          "Support disponible 24h/24",
        ]}
      />

      <main className="flex items-center justify-center gutter py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[24rem]"
        >
          {step === "identifier" ? (
            <>
              <h1 className="text-display text-ink">Bon retour 👋</h1>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                Connectez-vous avec votre numéro ou votre e-mail.
              </p>

              <form onSubmit={requestCode} className="mt-8 space-y-5">
                {/* Segmented control, exactly like the app */}
                <div className="flex gap-1 rounded-[12px] bg-surface-alt p-1">
                  {(
                    [
                      { key: "phone", label: "Téléphone" },
                      { key: "email", label: "Email" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setChannel(tab.key);
                        setError("");
                      }}
                      aria-pressed={channel === tab.key}
                      className={`h-10 flex-1 rounded-[10px] text-[13px] font-bold transition-colors ${
                        channel === tab.key
                          ? "bg-surface text-ink shadow-card"
                          : "text-slate hover:text-ink"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {channel === "phone" ? (
                  <div
                    className={`flex items-stretch overflow-hidden rounded-[12px] border-[1.5px] bg-surface transition-colors focus-within:border-brand-dark focus-within:ring-[3px] focus-within:ring-brand-tint ${
                      error ? "border-danger" : "border-line"
                    }`}
                  >
                    <span className="flex shrink-0 items-center gap-1.5 border-r border-line px-3.5 text-sm font-bold text-ink">
                      🇧🇯 +229
                    </span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoFocus
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="01 97 00 00 00"
                      aria-label="Numéro de téléphone"
                      className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-[15px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted"
                    />
                  </div>
                ) : (
                  <div
                    className={`flex items-stretch overflow-hidden rounded-[12px] border-[1.5px] bg-surface transition-colors focus-within:border-brand-dark focus-within:ring-[3px] focus-within:ring-brand-tint ${
                      error ? "border-danger" : "border-line"
                    }`}
                  >
                    <span className="flex shrink-0 items-center pl-3.5 text-muted">
                      <Mail size={17} />
                    </span>
                    <input
                      type="email"
                      autoFocus
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="exemple@email.com"
                      aria-label="Adresse e-mail"
                      className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[15px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted"
                    />
                  </div>
                )}

                {error && (
                  <p role="alert" className="text-sm font-semibold text-danger">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit || isLoading}
                  className="btn btn-primary btn-lg w-full"
                >
                  {isLoading ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <MessageSquare size={17} />
                  )}
                  {isLoading ? "Envoi en cours…" : "Recevoir un code"}
                </button>
              </form>

              <p className="mt-8 border-t border-line pt-6 text-sm font-semibold text-slate">
                Pas encore de compte ?{" "}
                <Link
                  href="/register"
                  className="font-bold text-ink transition-colors hover:text-brand-dark"
                >
                  Créer un compte
                </Link>
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setStep("identifier");
                  setError("");
                  setOtp("");
                  setSuccess("");
                  setIsSuccess(false);
                }}
                disabled={isLoading || isSuccess}
                className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-slate transition-colors hover:text-ink disabled:opacity-50 disabled:pointer-events-none"
              >
                <ArrowLeft size={15} />
                Recevoir le code autrement
              </button>

              <h1 className="text-display text-ink">Vérification</h1>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                Code à 6 chiffres envoyé à{" "}
                <span className="font-bold text-ink">{normalizeIdentifier(raw)}</span>.
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
                  disabled={isLoading || isSuccess}
                />

                {error && (
                  <p role="alert" className="text-sm font-semibold text-danger">
                    {error}
                  </p>
                )}

                {success && (
                  <p role="alert" className="text-sm font-semibold text-success bg-success-soft px-3.5 py-3 rounded-[12px] flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-success animate-pulse" />
                    {success}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={otp.length !== OTP_LENGTH || isLoading || isSuccess}
                  className="btn btn-primary btn-lg w-full"
                >
                  {isLoading ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : null}
                  {isLoading ? "Vérification…" : isSuccess ? "Connecté !" : "Continuer"}
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
                    disabled={isLoading || isSuccess}
                    className="font-bold text-brand-dark transition-colors hover:text-ink disabled:opacity-50 disabled:pointer-events-none"
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
