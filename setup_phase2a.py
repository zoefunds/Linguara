#!/usr/bin/env python3
"""Phase 2a — Frontend core: globals, i18n, layout, lib, store, auth pages."""

import os

ROOT = "/Users/macbook/Linguara"
FE = f"{ROOT}/frontend/src"

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"  ✓ {path.replace(ROOT+'/', '')}")

# ─── GLOBALS CSS ───
write(f"{FE}/app/globals.css", """\
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 239 84% 67%;
    --primary-foreground: 0 0% 100%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 100%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 239 84% 67%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 239 84% 67%;
    --primary-foreground: 0 0% 100%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 239 84% 67%;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground font-sans antialiased; }
}

/* Custom scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { @apply bg-muted; }
::-webkit-scrollbar-thumb { @apply bg-muted-foreground/30 rounded-full; }
::-webkit-scrollbar-thumb:hover { @apply bg-muted-foreground/50; }
""")

# ─── i18n ───
write(f"{FE}/i18n.ts", """\
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default,
}));
""")

write(f"{ROOT}/frontend/messages/en.json", """\
{
  "nav": {
    "product": "Product",
    "features": "Features",
    "pricing": "Pricing",
    "docs": "Docs",
    "login": "Log in",
    "getStarted": "Get started"
  },
  "hero": {
    "badge": "Powered by GenLayer AI Consensus",
    "title": "Trustworthy Translations,",
    "titleHighlight": "Verified On-Chain",
    "subtitle": "Linguara uses decentralized AI consensus to deliver accurate, context-aware translations across 100+ languages — with cryptographic proof of quality.",
    "cta": "Start translating free",
    "ctaSecondary": "See how it works",
    "statsTranslations": "Translations verified",
    "statsLanguages": "Languages supported",
    "statsConfidence": "Avg. confidence score",
    "statsUptime": "Uptime"
  },
  "features": {
    "title": "Enterprise-grade translation infrastructure",
    "subtitle": "Every translation passes through multi-agent AI consensus before delivery",
    "consensus": { "title": "AI Consensus", "desc": "3 independent AI agents translate simultaneously. Consensus determines the best output." },
    "semantic": { "title": "Semantic Verification", "desc": "Meaning, tone, and cultural context verified before delivery." },
    "confidence": { "title": "Confidence Scores", "desc": "Every translation ships with a cryptographically-backed trust score." },
    "audit": { "title": "Immutable Audit Trail", "desc": "Every translation decision is recorded on-chain via GenLayer." },
    "legal": { "title": "Legal & Healthcare", "desc": "Domain-specific translation for contracts, medical records, and government docs." },
    "wallet": { "title": "Your Wallet, Your Identity", "desc": "Every account gets a unique blockchain wallet. Export your private key anytime." }
  },
  "howItWorks": {
    "title": "How Linguara works",
    "step1": { "title": "Submit content", "desc": "Paste text, upload a document, or drop an image." },
    "step2": { "title": "AI agents translate", "desc": "3 independent agents produce translations in parallel." },
    "step3": { "title": "Consensus verification", "desc": "Semantic validators reach consensus on the best translation." },
    "step4": { "title": "Verified delivery", "desc": "Receive your translation with a confidence score and on-chain proof." }
  },
  "pricing": {
    "title": "Simple, transparent pricing",
    "free": { "name": "Free", "price": "$0", "period": "/month", "cta": "Get started" },
    "pro": { "name": "Pro", "price": "$29", "period": "/month", "cta": "Start free trial" },
    "enterprise": { "name": "Enterprise", "price": "Custom", "period": "", "cta": "Contact us" }
  },
  "auth": {
    "login": "Log in",
    "register": "Create account",
    "email": "Email address",
    "password": "Password",
    "fullName": "Full name",
    "forgotPassword": "Forgot password?",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "signUp": "Sign up",
    "orContinue": "Or continue with",
    "agreeTerms": "By creating an account, you agree to our Terms and Privacy Policy",
    "walletCreated": "A blockchain wallet will be created for your account"
  },
  "dashboard": {
    "translate": "Translate",
    "history": "History",
    "documents": "Documents",
    "audit": "Audit Trail",
    "wallet": "Wallet",
    "settings": "Settings",
    "reports": "Reports"
  },
  "translation": {
    "sourcePlaceholder": "Enter text to translate...",
    "sourceLang": "Source language",
    "targetLang": "Target language",
    "detect": "Auto detect",
    "domain": "Domain",
    "translate": "Translate",
    "translating": "Translating...",
    "confidence": "Confidence",
    "viewAudit": "View audit trail",
    "copyResult": "Copy",
    "domains": {
      "general": "General",
      "legal": "Legal",
      "medical": "Medical",
      "technical": "Technical",
      "financial": "Financial",
      "government": "Government"
    }
  },
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Try again",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "view": "View",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "submit": "Submit",
    "copy": "Copy",
    "copied": "Copied!"
  }
}
""")

write(f"{ROOT}/frontend/messages/fr.json", """\
{
  "nav": {
    "product": "Produit",
    "features": "Fonctionnalités",
    "pricing": "Tarifs",
    "docs": "Documentation",
    "login": "Connexion",
    "getStarted": "Commencer"
  },
  "hero": {
    "badge": "Propulsé par le consensus IA GenLayer",
    "title": "Traductions fiables,",
    "titleHighlight": "Vérifiées sur la blockchain",
    "subtitle": "Linguara utilise le consensus IA décentralisé pour des traductions précises et contextuelles en 100+ langues — avec preuve cryptographique de qualité.",
    "cta": "Commencer gratuitement",
    "ctaSecondary": "Voir comment ça marche",
    "statsTranslations": "Traductions vérifiées",
    "statsLanguages": "Langues supportées",
    "statsConfidence": "Score de confiance moyen",
    "statsUptime": "Disponibilité"
  },
  "features": {
    "title": "Infrastructure de traduction professionnelle",
    "subtitle": "Chaque traduction passe par un consensus IA multi-agents avant livraison",
    "consensus": { "title": "Consensus IA", "desc": "3 agents IA indépendants traduisent simultanément." },
    "semantic": { "title": "Vérification sémantique", "desc": "Sens, ton et contexte culturel vérifiés." },
    "confidence": { "title": "Scores de confiance", "desc": "Chaque traduction inclut un score de fiabilité." },
    "audit": { "title": "Piste d'audit immuable", "desc": "Chaque décision est enregistrée sur GenLayer." },
    "legal": { "title": "Juridique & Santé", "desc": "Traduction spécialisée pour contrats et dossiers médicaux." },
    "wallet": { "title": "Votre portefeuille", "desc": "Chaque compte dispose d'un portefeuille blockchain unique." }
  },
  "howItWorks": {
    "title": "Comment fonctionne Linguara",
    "step1": { "title": "Soumettre le contenu", "desc": "Collez du texte, uploadez un document ou une image." },
    "step2": { "title": "Les agents IA traduisent", "desc": "3 agents indépendants produisent des traductions en parallèle." },
    "step3": { "title": "Vérification par consensus", "desc": "Les validateurs sémantiques choisissent la meilleure traduction." },
    "step4": { "title": "Livraison vérifiée", "desc": "Recevez votre traduction avec score de confiance et preuve on-chain." }
  },
  "pricing": {
    "title": "Tarification simple et transparente",
    "free": { "name": "Gratuit", "price": "0€", "period": "/mois", "cta": "Commencer" },
    "pro": { "name": "Pro", "price": "29€", "period": "/mois", "cta": "Essai gratuit" },
    "enterprise": { "name": "Entreprise", "price": "Sur devis", "period": "", "cta": "Nous contacter" }
  },
  "auth": {
    "login": "Connexion",
    "register": "Créer un compte",
    "email": "Adresse e-mail",
    "password": "Mot de passe",
    "fullName": "Nom complet",
    "forgotPassword": "Mot de passe oublié ?",
    "noAccount": "Pas de compte ?",
    "hasAccount": "Déjà un compte ?",
    "signUp": "S'inscrire",
    "orContinue": "Ou continuer avec",
    "agreeTerms": "En créant un compte, vous acceptez nos CGU et notre politique de confidentialité",
    "walletCreated": "Un portefeuille blockchain sera créé pour votre compte"
  },
  "dashboard": {
    "translate": "Traduire",
    "history": "Historique",
    "documents": "Documents",
    "audit": "Piste d'audit",
    "wallet": "Portefeuille",
    "settings": "Paramètres",
    "reports": "Rapports"
  },
  "translation": {
    "sourcePlaceholder": "Entrez le texte à traduire...",
    "sourceLang": "Langue source",
    "targetLang": "Langue cible",
    "detect": "Détection auto",
    "domain": "Domaine",
    "translate": "Traduire",
    "translating": "Traduction en cours...",
    "confidence": "Confiance",
    "viewAudit": "Voir la piste d'audit",
    "copyResult": "Copier",
    "domains": {
      "general": "Général",
      "legal": "Juridique",
      "medical": "Médical",
      "technical": "Technique",
      "financial": "Financier",
      "government": "Gouvernemental"
    }
  },
  "common": {
    "loading": "Chargement...",
    "error": "Une erreur est survenue",
    "retry": "Réessayer",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "view": "Voir",
    "close": "Fermer",
    "back": "Retour",
    "next": "Suivant",
    "submit": "Envoyer",
    "copy": "Copier",
    "copied": "Copié !"
  }
}
""")

write(f"{ROOT}/frontend/messages/es.json", """\
{
  "nav": { "product": "Producto", "features": "Funciones", "pricing": "Precios", "docs": "Documentación", "login": "Iniciar sesión", "getStarted": "Empezar" },
  "hero": { "badge": "Potenciado por consenso IA GenLayer", "title": "Traducciones confiables,", "titleHighlight": "Verificadas en cadena", "subtitle": "Linguara usa consenso IA descentralizado para traducciones precisas en 100+ idiomas — con prueba criptográfica de calidad.", "cta": "Empezar gratis", "ctaSecondary": "Ver cómo funciona", "statsTranslations": "Traducciones verificadas", "statsLanguages": "Idiomas soportados", "statsConfidence": "Puntuación media de confianza", "statsUptime": "Disponibilidad" },
  "features": { "title": "Infraestructura de traducción empresarial", "subtitle": "Cada traducción pasa por consenso IA multi-agente", "consensus": { "title": "Consenso IA", "desc": "3 agentes IA traducen simultáneamente." }, "semantic": { "title": "Verificación semántica", "desc": "Significado, tono y contexto cultural verificados." }, "confidence": { "title": "Puntuaciones de confianza", "desc": "Cada traducción incluye una puntuación de fiabilidad." }, "audit": { "title": "Auditoría inmutable", "desc": "Cada decisión se registra en GenLayer." }, "legal": { "title": "Legal y Salud", "desc": "Traducción especializada para contratos y expedientes médicos." }, "wallet": { "title": "Tu billetera", "desc": "Cada cuenta tiene una billetera blockchain única." } },
  "howItWorks": { "title": "Cómo funciona Linguara", "step1": { "title": "Envía contenido", "desc": "Pega texto, sube un documento o una imagen." }, "step2": { "title": "Los agentes IA traducen", "desc": "3 agentes independientes producen traducciones en paralelo." }, "step3": { "title": "Verificación por consenso", "desc": "Los validadores semánticos eligen la mejor traducción." }, "step4": { "title": "Entrega verificada", "desc": "Recibe tu traducción con puntuación de confianza y prueba on-chain." } },
  "pricing": { "title": "Precios simples y transparentes", "free": { "name": "Gratis", "price": "$0", "period": "/mes", "cta": "Empezar" }, "pro": { "name": "Pro", "price": "$29", "period": "/mes", "cta": "Prueba gratis" }, "enterprise": { "name": "Empresas", "price": "Personalizado", "period": "", "cta": "Contáctanos" } },
  "auth": { "login": "Iniciar sesión", "register": "Crear cuenta", "email": "Correo electrónico", "password": "Contraseña", "fullName": "Nombre completo", "forgotPassword": "¿Olvidaste tu contraseña?", "noAccount": "¿No tienes cuenta?", "hasAccount": "¿Ya tienes cuenta?", "signUp": "Registrarse", "orContinue": "O continuar con", "agreeTerms": "Al crear una cuenta, aceptas nuestros Términos y Política de Privacidad", "walletCreated": "Se creará una billetera blockchain para tu cuenta" },
  "dashboard": { "translate": "Traducir", "history": "Historial", "documents": "Documentos", "audit": "Auditoría", "wallet": "Billetera", "settings": "Configuración", "reports": "Informes" },
  "translation": { "sourcePlaceholder": "Ingresa el texto a traducir...", "sourceLang": "Idioma fuente", "targetLang": "Idioma destino", "detect": "Detección automática", "domain": "Dominio", "translate": "Traducir", "translating": "Traduciendo...", "confidence": "Confianza", "viewAudit": "Ver auditoría", "copyResult": "Copiar", "domains": { "general": "General", "legal": "Legal", "medical": "Médico", "technical": "Técnico", "financial": "Financiero", "government": "Gubernamental" } },
  "common": { "loading": "Cargando...", "error": "Algo salió mal", "retry": "Reintentar", "save": "Guardar", "cancel": "Cancelar", "delete": "Eliminar", "edit": "Editar", "view": "Ver", "close": "Cerrar", "back": "Atrás", "next": "Siguiente", "submit": "Enviar", "copy": "Copiar", "copied": "¡Copiado!" }
}
""")

# ─── MIDDLEWARE for i18n routing ───
write(f"{ROOT}/frontend/src/middleware.ts", """\
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'fr', 'es', 'de', 'pt', 'ar', 'zh', 'ja', 'ko', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\\\..*).*)'],
};
""")

# ─── LIB ───
write(f"{FE}/lib/utils.ts", """\
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export function getConfidenceColor(score: number): string {
  if (score >= 90) return 'text-emerald-500';
  if (score >= 75) return 'text-yellow-500';
  return 'text-red-500';
}

export function getConfidenceBg(score: number): string {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 75) return 'bg-yellow-500';
  return 'bg-red-500';
}
""")

write(f"{FE}/lib/api.ts", """\
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          Cookies.set('access_token', data.data.accessToken, { expires: 1/96 }); // 15min
          Cookies.set('refresh_token', data.data.refreshToken, { expires: 7 });
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(original);
        } catch {
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: { email: string; password: string; fullName: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  exportKey: (password: string) =>
    api.post('/auth/export-key', { password }),
};

// Translations
export const translationApi = {
  create: (data: {
    sourceText: string;
    targetLanguage: string;
    sourceLanguage?: string;
    domain?: string;
    documentType?: string;
  }) => api.post('/translations', data),
  get: (id: string) => api.get(`/translations/${id}`),
  list: (page = 1, limit = 20) =>
    api.get(`/translations?page=${page}&limit=${limit}`),
  audit: (page = 1, limit = 50) =>
    api.get(`/translations/audit?page=${page}&limit=${limit}`),
};
""")

# ─── STORE ───
write(f"{FE}/store/auth.store.ts", """\
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  plan: string;
  emailVerified: boolean;
  preferredLanguage: string;
  wallet?: { address: string };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<{ address: string }>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login({ email, password });
          Cookies.set('access_token', data.data.accessToken, { expires: 1/96, secure: true, sameSite: 'strict' });
          Cookies.set('refresh_token', data.data.refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
          set({ user: { ...data.data.user, wallet: data.data.wallet } });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, password, fullName) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.register({ email, password, fullName });
          Cookies.set('access_token', data.data.accessToken, { expires: 1/96, secure: true, sameSite: 'strict' });
          Cookies.set('refresh_token', data.data.refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
          set({ user: { ...data.data.user, wallet: data.data.wallet } });
          return data.data.wallet;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        const refreshToken = Cookies.get('refresh_token');
        if (refreshToken) await authApi.logout(refreshToken).catch(() => {});
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        set({ user: null });
      },

      fetchMe: async () => {
        try {
          const { data } = await authApi.me();
          set({ user: data.data });
        } catch {
          set({ user: null });
        }
      },
    }),
    { name: 'linguara-auth', partialize: (s) => ({ user: s.user }) }
  )
);
""")

# ─── PROVIDERS ───
write(f"{FE}/app/providers.tsx", """\
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
""")

# ─── ROOT LAYOUT ───
write(f"{FE}/app/layout.tsx", """\
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'Linguara — Trustworthy AI Translation', template: '%s | Linguara' },
  description: 'Decentralized AI consensus translation platform. Accurate, context-aware, and cryptographically verified across 100+ languages.',
  keywords: ['translation', 'AI', 'blockchain', 'GenLayer', 'multilingual', 'verified'],
  authors: [{ name: 'Linguara' }],
  openGraph: {
    title: 'Linguara — Trustworthy AI Translation',
    description: 'Decentralized AI consensus translation, verified on-chain.',
    type: 'website',
    url: 'https://linguara.vercel.app',
  },
  twitter: { card: 'summary_large_image', title: 'Linguara', description: 'AI-powered translation verified on-chain.' },
  metadataBase: new URL('https://linguara.vercel.app'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
""")

# ─── UI COMPONENTS ───
write(f"{FE}/components/ui/button.tsx", """\
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-12 rounded-md px-8 text-base',
        xl: 'h-14 rounded-lg px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
""")

write(f"{FE}/components/ui/input.tsx", """\
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
""")

write(f"{FE}/components/ui/card.tsx", """\
import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)} {...props} />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
""")

write(f"{FE}/components/ui/badge.tsx", """\
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-emerald-500/20 text-emerald-500',
        warning: 'border-transparent bg-yellow-500/20 text-yellow-500',
        info: 'border-transparent bg-indigo-500/20 text-indigo-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
""")

write(f"{FE}/components/ui/progress.tsx", """\
'use client';
import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn('h-full w-full flex-1 bg-primary transition-all', indicatorClassName)}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
""")

write(f"{FE}/components/ui/label.tsx", """\
'use client';
import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const labelVariants = cva('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70');

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
""")

write(f"{FE}/components/ui/select.tsx", """\
'use client';
import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        position === 'popper' && 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport className={cn('p-1', position === 'popper' && 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]')}>
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)} {...props} />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem, SelectLabel };
""")

write(f"{FE}/components/ui/toast.tsx", """\
'use client';
import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn('fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]', className)}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & { variant?: 'default' | 'destructive' }
>(({ className, variant = 'default', ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(
      'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
      variant === 'destructive' ? 'destructive border-destructive bg-destructive text-destructive-foreground' : 'border bg-background text-foreground',
      className
    )}
    {...props}
  />
));
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn('absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100', className)}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export { ToastProvider, ToastViewport, Toast, ToastClose, ToastTitle, ToastDescription };
""")

write(f"{FE}/hooks/use-toast.ts", """\
'use client';
import * as React from 'react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

type Action =
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string };

function reducer(state: ToastState, action: Action): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      return { toasts: [action.toast, ...state.toasts].slice(0, 3) };
    case 'REMOVE_TOAST':
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

const listeners: Array<(state: ToastState) => void> = [];
let memState: ToastState = { toasts: [] };

function dispatch(action: Action) {
  memState = reducer(memState, action);
  listeners.forEach((l) => l(memState));
}

export function toast({ title, description, variant = 'default', duration = 4000 }: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2);
  dispatch({ type: 'ADD_TOAST', toast: { id, title, description, variant, duration } });
  setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), duration);
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { const idx = listeners.indexOf(setState); if (idx > -1) listeners.splice(idx, 1); };
  }, []);
  return { toasts: state.toasts, toast };
}
""")

write(f"{FE}/components/ui/toaster.tsx", """\
'use client';
import { useToast } from '@/hooks/use-toast';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from './toast';

export function Toaster() {
  const { toasts } = useToast();
  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant }) => (
        <Toast key={id} variant={variant}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
""")

# ─── AUTH PAGES ───
write(f"{FE}/app/(auth)/login/page.tsx", """\
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Globe, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/hooks/use-toast';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      router.push('/dashboard/translate');
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: err?.response?.data?.message || 'Invalid email or password',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <Globe className="h-7 w-7" />
            <span>Linguara</span>
          </Link>
          <p className="text-muted-foreground text-sm">Trustworthy multilingual translation</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full" variant="gradient" size="lg" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : 'Sign in'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                Sign up free
              </Link>
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Protected by blockchain-verified identity</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
""")

write(f"{FE}/app/(auth)/register/page.tsx", """\
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Globe, Loader2, Wallet, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/hooks/use-toast';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const wallet = await registerUser(data.email, data.password, data.fullName);
      setWalletAddress(wallet.address);
      setTimeout(() => router.push('/dashboard/translate'), 2500);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: err?.response?.data?.message || 'Could not create account',
      });
    }
  };

  if (walletAddress) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8 space-y-4">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-bold">Account created!</h2>
          <p className="text-muted-foreground">Your blockchain wallet has been generated</p>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Wallet address</p>
            <p className="font-mono text-xs break-all text-foreground">{walletAddress}</p>
          </div>
          <p className="text-xs text-muted-foreground">Redirecting to dashboard...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <Globe className="h-7 w-7" />
            <span>Linguara</span>
          </Link>
          <p className="text-muted-foreground text-sm">Start translating with AI consensus</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Free forever · No credit card required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" placeholder="Jane Smith" {...register('fullName')} />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Min. 8 characters" {...register('password')} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3">
                <Wallet className="h-4 w-4 text-indigo-400 shrink-0" />
                <p className="text-xs text-indigo-300">A blockchain wallet will be auto-generated for your account</p>
              </div>

              <Button type="submit" className="w-full" variant="gradient" size="lg" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : 'Create account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground text-center">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">Sign in</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
""")

write(f"{FE}/app/(auth)/forgot-password/page.tsx", """\
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Globe, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<{ email: string }>();

  const onSubmit = async ({ email }: { email: string }) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <Globe className="h-7 w-7" /><span>Linguara</span>
          </Link>
        </div>
        <Card className="border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle>Reset password</CardTitle>
            <CardDescription>Enter your email to receive a reset link</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4 py-4">
                <Mail className="h-12 w-12 text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">
                  If that email is registered, a reset link has been sent. Check your inbox.
                </p>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full"><ArrowLeft className="mr-2 h-4 w-4" />Back to login</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" {...register('email', { required: true })} />
                </div>
                <Button type="submit" className="w-full" variant="gradient" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Send reset link'}
                </Button>
                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full"><ArrowLeft className="mr-2 h-4 w-4" />Back to login</Button>
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
""")

print("✓ Phase 2a complete")
