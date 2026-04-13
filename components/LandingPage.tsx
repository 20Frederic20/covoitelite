"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Car, Shield, Zap, Users, ArrowRight, Star, MapPin, Sun, Moon, Clock, Send, Mail } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Changer de thème"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Car size={24} className="text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tighter">CovoitElite</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Fonctionnalités</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">Comment ça marche</a>
            <a href="#safety" className="hover:text-primary transition-colors">Sécurité</a>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-bold hover:text-primary transition-colors">Connexion</Link>
            <Link href="/register" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-bold hover:bg-yellow-500 transition-all">
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full text-xs font-bold text-primary mb-6">
              <Zap size={14} />
              <span>LE COVOITURAGE NOUVELLE GÉNÉRATION</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-[0.9] mb-6">
              VOYAGEZ AVEC <br />
              <span className="text-primary italic">L&apos;ÉLITE.</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-lg mb-10 leading-relaxed">
              La plateforme de covoiturage premium au Bénin. Confort, sécurité et ponctualité pour tous vos trajets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-105 transition-transform">
                Commencer maintenant
                <ArrowRight size={20} />
              </Link>
              <Link href="/search" className="bg-card border border-border px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-muted transition-colors">
                Voir les trajets
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="relative bg-card border border-border rounded-[2.5rem] p-4 shadow-2xl overflow-hidden">
              <img 
                src="https://picsum.photos/seed/car/800/600" 
                alt="Elite Car" 
                className="rounded-[2rem] w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute bottom-8 left-8 right-8 bg-background/80 backdrop-blur-xl border border-border p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold text-primary-foreground">K</div>
                    <div>
                      <p className="font-bold text-sm">Koffi Mensah</p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Star size={10} className="text-primary fill-primary" />
                        <span>4.9 • Conducteur Élite</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-black">1 500 FCFA</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <MapPin size={14} className="text-primary" />
                  <span>Cotonou → Porto-Novo</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: "Utilisateurs", value: "10K+" },
            { label: "Trajets effectués", value: "50K+" },
            { label: "Villes couvertes", value: "25+" },
            { label: "Satisfaction", value: "4.9/5" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl md:text-5xl font-black text-primary mb-2">{stat.value}</p>
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase italic">Pourquoi CovoitElite ?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Nous avons repensé le covoiturage pour offrir une expérience digne des plus grands standards internationaux.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Sécurité Maximale",
                desc: "Tous nos conducteurs sont vérifiés physiquement et leurs véhicules inspectés. Une équipe d'administration veille 24/7."
              },
              {
                icon: Zap,
                title: "Rapidité & Fluidité",
                desc: "Une application ultra-rapide, une réservation en 3 clics et une ponctualité garantie."
              },
              {
                icon: Users,
                title: "Communauté d'Élite",
                desc: "Rejoignez un réseau de professionnels et de voyageurs exigeants."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-card border border-border p-10 rounded-[2.5rem] hover:border-primary transition-colors group">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon size={32} className="text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-32 px-6 bg-muted/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase italic">Comment ça marche ?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Un système simple, transparent et équitable pour tous les membres de l&apos;élite.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Publication",
                desc: "Un conducteur seul dans sa voiture crée une course du point A au point B et fixe son prix par place.",
                icon: Car
              },
              {
                step: "02",
                title: "Réservation & Confirmation",
                desc: "Les passagers demandent à rejoindre. Le conducteur reçoit leurs contacts et confirme les meilleures demandes (limite de places réelles).",
                icon: Users
              },
              {
                step: "03",
                title: "Financement",
                desc: "CovoitElite prélève une commission de 10% sur chaque place (ex: 70 FCFA pour une place à 700 FCFA).",
                icon: Star
              },
              {
                step: "04",
                title: "Règlement",
                desc: "Le conducteur règle ses commissions dues. Un retard de plus de 7 jours entraîne un blocage automatique.",
                icon: Shield
              }
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="text-8xl font-black text-muted/20 absolute -top-10 -left-4 group-hover:text-primary/10 transition-colors">
                  {item.step}
                </div>
                <div className="relative bg-card/50 border border-border p-8 rounded-3xl h-full backdrop-blur-sm hover:border-primary transition-all">
                  <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-primary-foreground">
                    <item.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Example Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 bg-card border border-border rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12"
          >
            <div className="flex-1">
              <h3 className="text-3xl font-black mb-6 uppercase italic">Exemple de calcul</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-background/40 rounded-2xl border border-border">
                  <span className="text-muted-foreground">Trajet (3 places à 700 FCFA)</span>
                  <span className="font-bold">2 100 FCFA</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-primary/10 rounded-2xl border border-primary/20">
                  <span className="text-primary font-bold">Commission CovoitElite (10%)</span>
                  <span className="font-bold text-primary">210 FCFA</span>
                </div>
                <p className="text-xs text-muted-foreground italic mt-4">
                  * Le conducteur perçoit la totalité des frais auprès des passagers et règle ensuite sa commission à la plateforme.
                </p>
              </div>
            </div>
            <div className="w-full md:w-1/3 bg-background rounded-3xl p-6 border border-border shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-500 uppercase">Alerte Blocage</p>
                  <p className="text-[10px] text-muted-foreground">Délai de paiement : 7 jours</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-red-500"></div>
                </div>
                <p className="text-[10px] text-right text-muted-foreground">6 jours restants avant blocage</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Section */}
      <section id="safety" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase italic">Votre sécurité, <br /><span className="text-primary">notre priorité.</span></h2>
              <div className="space-y-8">
                {[
                  {
                    title: "Vérification des profils",
                    desc: "Chaque conducteur doit fournir une pièce d'identité valide et passer un entretien de vérification avant de pouvoir publier des trajets."
                  },
                  {
                    title: "Inspection des véhicules",
                    desc: "Nous nous assurons que les véhicules utilisés sont en bon état et conformes aux normes de sécurité."
                  },
                  {
                    title: "Système de notation",
                    desc: "Les avis et notes de la communauté permettent de maintenir un standard d'excellence et d'identifier les meilleurs membres."
                  },
                  {
                    title: "Support 24/7",
                    desc: "Notre équipe d'administration est disponible à tout moment pour intervenir en cas de litige ou de problème sur la route."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-primary">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-card border border-border rounded-[3rem] p-8 shadow-2xl">
                <div className="aspect-square bg-muted rounded-[2rem] overflow-hidden relative">
                  <img 
                    src="https://picsum.photos/seed/safety/800/800" 
                    alt="Safety First" 
                    className="w-full h-full object-cover grayscale"
                  />
                  <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
                </div>
                <div className="mt-8 p-6 bg-background rounded-2xl border border-border">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-500">
                      <Shield size={24} />
                    </div>
                    <div>
                      <p className="font-bold">Conducteur Vérifié</p>
                      <p className="text-xs text-muted-foreground">Identité et véhicule validés</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} className="text-primary fill-primary" />)}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 bg-muted/10 border-t border-border">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-primary">
              <Mail size={32} />
            </div>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic">Contactez-nous</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Une question, un problème technique ou une suggestion ? Notre équipe est à votre écoute.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-card border border-border p-8 rounded-3xl shadow-lg">
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-primary">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Email</p>
                      <a href="mailto:apprentissagethough@gmail.com" className="font-bold hover:text-primary transition-colors break-all">
                        apprentissagethough@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-primary">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Disponibilité</p>
                      <p className="font-bold">24h/24, 7j/7</p>
                      <p className="text-xs text-muted-foreground">Réponse sous 24h</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-primary">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Localisation</p>
                      <p className="font-bold">Cotonou, Bénin</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary p-8 rounded-3xl text-primary-foreground">
                <h3 className="text-xl font-black mb-4 uppercase italic">Support Prioritaire</h3>
                <p className="text-sm leading-relaxed opacity-90">
                  Pour les urgences liées à un trajet en cours, veuillez mentionner votre numéro de téléphone dans votre message.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <div className="bg-card border border-border p-8 md:p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden h-full">
                {submitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-12"
                  >
                    <div className="bg-green-500/10 w-20 h-20 rounded-full flex items-center justify-center text-green-500 mb-6">
                      <Send size={40} />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic mb-4">Message Envoyé !</h2>
                    <p className="text-muted-foreground">Merci de nous avoir contactés. Notre équipe reviendra vers vous très prochainement.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Nom complet</label>
                        <input 
                          required
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Votre nom"
                          className="w-full bg-muted/50 border border-border rounded-xl p-4 focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Email</label>
                        <input 
                          required
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="votre@email.com"
                          className="w-full bg-muted/50 border border-border rounded-xl p-4 focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Sujet</label>
                      <input 
                        required
                        type="text" 
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        placeholder="De quoi s'agit-il ?"
                        className="w-full bg-muted/50 border border-border rounded-xl p-4 focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Message</label>
                      <textarea 
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Comment pouvons-nous vous aider ?"
                        className="w-full bg-muted/50 border border-border rounded-xl p-4 focus:outline-none focus:border-primary transition-colors resize-none"
                      ></textarea>
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-primary text-primary-foreground font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
                    >
                      Envoyer le message
                      <Send size={20} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-border px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Car size={24} className="text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tighter">CovoitElite</span>
          </div>
          <p className="text-muted-foreground text-sm">2026. Tous droits réservés. 20Frederic20. Fait avec amour au Bénin.</p>
          <div className="flex gap-6 text-muted-foreground text-sm font-bold">
            <Link href="/privacy" className="hover:text-primary">Confidentialité</Link>
            <Link href="/terms" className="hover:text-primary">Conditions</Link>
            <a href="#contact" className="hover:text-primary">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
