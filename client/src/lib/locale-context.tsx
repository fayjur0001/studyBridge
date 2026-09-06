"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type Locale = "en-GB" | "en-US" | "fr-FR" | "es-ES" | "de-DE";

const messages: Record<Locale, Record<string, string>> = {
  "en-GB": {},
  "en-US": {},
  "fr-FR": {
    dashboard: "Tableau de bord", messaging: "Messages", recommendations: "Recommandations IA", applications: "Candidatures", tools: "Outils IA", saved: "Éléments enregistrés", documents: "Documents", explore: "Explorer les universités", profile: "Profil", settings: "Paramètres", logout: "Déconnexion",
    recommendedForYou: "Recommandé pour vous", matchedPrograms: "Programmes correspondant à votre profil", rankedDescription: "Classés selon vos pays et domaines d'études préférés — une correspondance transparente.", setPreferences: "Définissez vos préférences pour de meilleures correspondances", setPreferencesDescription: "Ajoutez vos pays et domaines d'études préférés sur votre page de profil pour personnaliser ces résultats.", profilePage: "page de profil", noPrograms: "Aucun programme n'est encore disponible.", whyMatches: "Pourquoi cette correspondance", viewProgram: "Voir les détails du programme", viewDetails: "Voir les détails", match: "Correspondance", welcomeBack: "Bon retour", applicationTimeline: "Chronologie des candidatures", aiToolsTitle: "Améliorez votre parcours universitaire.",
  },
  "es-ES": {
    dashboard: "Panel", messaging: "Mensajes", recommendations: "Recomendaciones de IA", applications: "Solicitudes", tools: "Herramientas de IA", saved: "Guardados", documents: "Documentos", explore: "Explorar universidades", profile: "Perfil", settings: "Configuración", logout: "Cerrar sesión", recommendedForYou: "Recomendado para ti", matchedPrograms: "Programas para tu perfil", viewProgram: "Ver detalles del programa", viewDetails: "Ver detalles", match: "Coincidencia", welcomeBack: "Bienvenido de nuevo", applicationTimeline: "Cronología de solicitudes", aiToolsTitle: "Mejora tu trayectoria académica.",
  },
  "de-DE": {
    dashboard: "Übersicht", messaging: "Nachrichten", recommendations: "KI-Empfehlungen", applications: "Bewerbungen", tools: "KI-Tools", saved: "Gespeichert", documents: "Dokumente", explore: "Universitäten entdecken", profile: "Profil", settings: "Einstellungen", logout: "Abmelden", recommendedForYou: "Für Sie empfohlen", matchedPrograms: "Programme für Ihr Profil", viewProgram: "Programmdetails ansehen", viewDetails: "Details ansehen", match: "Übereinstimmung", welcomeBack: "Willkommen zurück", applicationTimeline: "Bewerbungszeitplan", aiToolsTitle: "Verbessern Sie Ihren akademischen Weg.",
  },
};

const english: Record<string, string> = {
  dashboard: "Dashboard", messaging: "Messaging", recommendations: "AI Recommendations", applications: "Applications", tools: "AI Tools Hub", saved: "Saved Items", documents: "Document Vault", explore: "Explore Universities", profile: "Profile", settings: "Settings", logout: "Logout",
  recommendedForYou: "Recommended For You", matchedPrograms: "Programs Matched to Your Profile", rankedDescription: "Ranked using your preferred countries and fields of study from your profile — a transparent match, not a black-box score.", setPreferences: "Set your preferences to get better matches", setPreferencesDescription: "Add your preferred countries and fields of study on your profile page to personalize these results.", profilePage: "profile page", noPrograms: "No programs in the catalog yet.", whyMatches: "Why it matches", viewProgram: "View Program Details", viewDetails: "View Details", match: "Match", welcomeBack: "Welcome back", applicationTimeline: "Application Timeline", aiToolsTitle: "Elevate Your Academic Journey.",
};

const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void; t: (key: string) => string }>({ locale: "en-GB", setLocale: () => {}, t: (key) => english[key] ?? key });

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [locale, setLocale] = useState<Locale>("en-GB");

  useEffect(() => {
    if (user?.role !== "student") return;
    api.get<{ language: Locale }>("/api/student/settings").then(({ language }) => setLocale(language)).catch(() => {});
  }, [user?.id, user?.role]);

  const t = (key: string) => messages[locale][key] ?? english[key] ?? key;
  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
