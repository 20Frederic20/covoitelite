"use client";

import AppLayout from "@/components/AppLayout";
import { motion } from "motion/react";
import { Mail, MessageSquare, Clock, MapPin, Send } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simuler l'envoi
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-primary">
              <Mail size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic">Contactez-nous</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Notre équipe est à votre disposition pour toute question, suggestion ou assistance technique.
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
              <div className="bg-card border border-border p-8 md:p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden">
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
        </motion.div>
      </div>
    </AppLayout>
  );
}
