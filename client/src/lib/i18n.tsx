import React, { createContext, useContext, useState } from "react";

export type Lang = "fr" | "en" | "es";

const translations = {
  fr: {
    // Header
    "header.login": "Connexion",
    "header.register": "Inscription",
    "header.logout": "Déconnexion",
    "header.subtitle": "EQRS — Modèle Johnson & Ettinger",
    "header.subtext": "Évaluation Quantitative des Risques Sanitaires • Intrusion de vapeurs",

    // Footer
    "footer.rights": "Tous droits réservés.",
    "footer.legal":
      "Ce logiciel de modélisation EQRS Johnson & Ettinger est la propriété exclusive de la SARL G.M.E.P.",
    "footer.repro":
      "Toute reproduction, diffusion ou utilisation, même partielle, sans autorisation écrite préalable est interdite.",
    "footer.conception": "Conception et développement",

    // Landing — Hero
    "landing.hero.badge": "Modèle EPA J&E (2004)",
    "landing.hero.title1": "Modélisation EQRS",
    "landing.hero.title2": "Johnson & Ettinger",
    "landing.hero.desc":
      "Outil professionnel d'évaluation quantitative des risques sanitaires liés à l'intrusion de vapeurs dans les bâtiments. Calculs en temps réel, 74 substances, conformité réglementaire.",
    "landing.hero.cta": "Commencer l'essai gratuit",
    "landing.hero.seePricing": "Voir les tarifs",
    "landing.hero.trial": "14 jours d'essai gratuit — sans carte bancaire",

    // Landing — Features
    "landing.features.title": "Un outil complet de modélisation environnementale",
    "landing.features.subtitle":
      "Conforme aux recommandations de l'EPA et aux exigences réglementaires françaises.",
    "landing.features.substances.title": "74 substances",
    "landing.features.substances.desc":
      "Base de données complète incluant COV, métaux, HAP et autres polluants réglementaires.",
    "landing.features.realtime.title": "Calculs temps réel",
    "landing.features.realtime.desc":
      "Résultats instantanés : QD, ERI, VLEP, facteur d'atténuation et concentrations intérieures.",
    "landing.features.sensitivity.title": "Analyse de sensibilité",
    "landing.features.sensitivity.desc":
      "Étude paramétrique sur 8 variables clés pour évaluer l'incertitude du modèle.",
    "landing.features.model.title": "Modèle J&E EPA 2004",
    "landing.features.model.desc":
      "Implémentation fidèle du modèle Johnson & Ettinger publié par l'US EPA.",

    // Landing — Pricing
    "landing.pricing.title": "Tarifs simples et transparents",
    "landing.pricing.subtitle": "Accédez à l'outil EQRS complet. Sans engagement.",
    "landing.pricing.trialBadge": "Essayez gratuitement pendant 14 jours avant de vous engager",
    "landing.pricing.monthly": "Mensuel",
    "landing.pricing.annual": "Annuel",
    "landing.pricing.save15": "Économisez 15%",
    "landing.pricing.perMonth": "/mois",
    "landing.pricing.perYear": "/an",
    "landing.pricing.monthlyBilling": "Facturation mensuelle, résiliable à tout moment.",
    "landing.pricing.annualEquiv": "Soit ~208€/mois. Facturation annuelle.",
    "landing.pricing.subscribe": "S'abonner",
    "landing.pricing.fullAccess": "Accès complet à l'outil EQRS",
    "landing.pricing.substances": "74 substances disponibles",
    "landing.pricing.license": "Licence mono-poste (1 clé d'activation)",
    "landing.pricing.updates": "Mises à jour incluses",
    "landing.pricing.emailSupport": "Support par e-mail",
    "landing.pricing.prioritySupport": "Support prioritaire",

    // Landing — License conditions
    "landing.conditions.title": "Conditions de licence",
    "landing.conditions.item1":
      "Le tarif indiqué correspond à un seul poste de travail (ordinateur unique).",
    "landing.conditions.item2":
      "Chaque abonnement donne droit à une clé d'activation unique, liée à un seul poste.",
    "landing.conditions.item3":
      "La clé d'activation est strictement personnelle et incessible. Elle ne peut être partagée, transférée ou utilisée simultanément sur plusieurs postes.",
    "landing.conditions.item4":
      "Pour une utilisation sur plusieurs postes, une licence supplémentaire doit être souscrite pour chaque poste additionnel.",
    "landing.conditions.item5":
      "Toute utilisation frauduleuse (partage de clé, accès simultanés multiples) entraînera la suspension immédiate de l'abonnement sans remboursement.",
    "landing.conditions.item6":
      "Le logiciel EQRS Johnson & Ettinger est la propriété exclusive de la SARL G.M.E.P. Toute reproduction, diffusion ou rétro-ingénierie est interdite.",

    // Demo Calculator
    "demo_title": "Testez le modèle J&E",
    "demo_subtitle": "Démo gratuite — 5 substances",
    "demo_substance": "Substance",
    "demo_soil_gas": "Concentration sol-gaz (µg/m³)",
    "demo_groundwater": "Concentration eaux souterraines (µg/L)",
    "demo_distance": "Distance source-dalle (m)",
    "demo_calculate": "Calculer",
    "demo_alpha": "Facteur d'atténuation α",
    "demo_cindoor_sg": "Cindoor sol-gaz",
    "demo_cindoor_gw": "Cindoor nappe",
    "demo_qd": "QD Inhalation Adulte",
    "demo_eri": "ERI Inhalation Adulte",
    "demo_acceptable": "Acceptable",
    "demo_vigilance": "Vigilance",
    "demo_unacceptable": "Inacceptable",
    "demo_upgrade": "Accédez aux 74 substances et aux calculs complets",
    "demo_more_substances": "69 substances supplémentaires avec l'abonnement",
    "demo_results": "Résultats",
    "demo_enter_values": "Entrez des concentrations et cliquez Calculer",
    "demo_non_volatile": "Le modèle J&E ne s'applique pas aux métaux non volatils",
    "demo_slab_thickness": "Épaisseur du dallage (m)",
    "demo_advanced_params": "Paramètres avancés",
    "demo_porosity": "Porosité totale du sol (n)",
    "demo_water_content": "Teneur en eau volumique (θw)",

    // Login
    "login.title": "Connexion",
    "login.subtitle": "Accédez à votre espace EQRS",
    "login.email": "Adresse e-mail",
    "login.password": "Mot de passe",
    "login.submit": "Se connecter",
    "login.forgotPassword": "Mot de passe oublié ?",
    "login.noAccount": "Pas encore de compte ?",
    "login.createAccount": "Créer un compte",

    // Register
    "register.title": "Créer un compte",
    "register.subtitle": "Inscrivez-vous pour accéder à l'outil EQRS",
    "register.name": "Nom complet",
    "register.email": "Adresse e-mail",
    "register.password": "Mot de passe",
    "register.confirmPassword": "Confirmer le mot de passe",
    "register.minChars": "Min. 8 caractères",
    "register.submit": "Créer mon compte",
    "register.alreadyAccount": "Déjà un compte ?",
    "register.signIn": "Se connecter",

    // Dashboard
    "dashboard.hello": "Bonjour,",
    "dashboard.welcome": "Bienvenue dans votre espace EQRS Johnson & Ettinger.",
    "dashboard.subscriptionRequired": "Abonnement requis pour accéder à l'outil EQRS",
    "dashboard.toolTitle": "Outil EQRS Johnson & Ettinger",
    "dashboard.active.desc": "Votre abonnement est actif. Vous pouvez accéder à l'outil de modélisation.",
    "dashboard.trial.label": "Essai gratuit",
    "dashboard.trial.desc":
      "Vous bénéficiez d'un accès gratuit pendant 14 jours (jusqu'au {date}). Souscrivez un abonnement avant la fin de l'essai pour continuer.",
    "dashboard.accessTool": "Accéder à l'outil EQRS",
    "dashboard.mySubscription": "Mon abonnement",
    "dashboard.status": "Statut",
    "dashboard.statusActive": "Actif",
    "dashboard.plan": "Formule",
    "dashboard.nextRenewal": "Prochain renouvellement",
    "dashboard.licenseKey": "Clé d'activation",
    "dashboard.licenseWarning":
      "Cette clé est liée à votre poste de travail. Ne la partagez pas.",
    "dashboard.manageSubscription": "Gérer mon abonnement",
    "dashboard.upgradePrompt": "Passez à un abonnement payant pour continuer après l'essai :",
    "dashboard.conditions":
      "Conditions : Tarif par poste de travail. Chaque abonnement donne droit à une clé d'activation unique, liée à un seul poste. Pour plusieurs postes, une licence supplémentaire est requise par poste.",

    // Forgot password
    "forgot.title": "Mot de passe oublié",
    "forgot.subtitle": "Entrez votre adresse e-mail pour recevoir un code de réinitialisation",
    "forgot.email": "Adresse e-mail",
    "forgot.sendCode": "Envoyer le code",
    "forgot.newPassword": "Nouveau mot de passe",
    "forgot.verificationCode": "Code de vérification",
    "forgot.newPasswordLabel": "Nouveau mot de passe",
    "forgot.confirmPassword": "Confirmer le mot de passe",
    "forgot.reset": "Réinitialiser le mot de passe",
    "forgot.newPasswordTitle": "Nouveau mot de passe",
    "forgot.newPasswordSubtitle": "Entrez le code reçu par e-mail et votre nouveau mot de passe",
    "forgot.doneTitle": "Mot de passe modifié",
    "forgot.doneDesc": "Votre mot de passe a été réinitialisé avec succès.",
    "forgot.backToLogin": "Retour à la connexion",
    "forgot.signIn": "Se connecter",
  },

  en: {
    // Header
    "header.login": "Sign in",
    "header.register": "Sign up",
    "header.logout": "Sign out",
    "header.subtitle": "EQRS — Johnson & Ettinger Model",
    "header.subtext": "Quantitative Health Risk Assessment • Vapor Intrusion",

    // Footer
    "footer.rights": "All rights reserved.",
    "footer.legal":
      "This EQRS Johnson & Ettinger modeling software is the exclusive property of SARL G.M.E.P.",
    "footer.repro":
      "Any reproduction, distribution, or use, even partial, without prior written authorization is prohibited.",
    "footer.conception": "Design and development",

    // Landing — Hero
    "landing.hero.badge": "EPA J&E Model (2004)",
    "landing.hero.title1": "EQRS Johnson & Ettinger",
    "landing.hero.title2": "Modeling",
    "landing.hero.desc":
      "Professional quantitative health risk assessment tool for vapor intrusion in buildings. Real-time calculations, 74 substances, regulatory compliance.",
    "landing.hero.cta": "Start free trial",
    "landing.hero.seePricing": "See pricing",
    "landing.hero.trial": "14-day free trial — no credit card required",

    // Landing — Features
    "landing.features.title": "A complete environmental modeling tool",
    "landing.features.subtitle": "Compliant with EPA recommendations and regulatory requirements.",
    "landing.features.substances.title": "74 substances",
    "landing.features.substances.desc":
      "Complete database including VOCs, metals, PAHs and other regulated pollutants.",
    "landing.features.realtime.title": "Real-time calculations",
    "landing.features.realtime.desc":
      "Instant results: HQ, ERI, OELV, attenuation factor and indoor concentrations.",
    "landing.features.sensitivity.title": "Sensitivity analysis",
    "landing.features.sensitivity.desc":
      "Parametric study on 8 key variables to assess model uncertainty.",
    "landing.features.model.title": "J&E EPA 2004 Model",
    "landing.features.model.desc":
      "Faithful implementation of the Johnson & Ettinger model published by the US EPA.",

    // Landing — Pricing
    "landing.pricing.title": "Simple and transparent pricing",
    "landing.pricing.subtitle": "Access the full EQRS tool. No commitment.",
    "landing.pricing.trialBadge": "Try for free for 14 days before committing",
    "landing.pricing.monthly": "Monthly",
    "landing.pricing.annual": "Annual",
    "landing.pricing.save15": "Save 15%",
    "landing.pricing.perMonth": "/month",
    "landing.pricing.perYear": "/year",
    "landing.pricing.monthlyBilling": "Monthly billing, cancel anytime.",
    "landing.pricing.annualEquiv": "Approx. €208/month. Annual billing.",
    "landing.pricing.subscribe": "Subscribe",
    "landing.pricing.fullAccess": "Full access to the EQRS tool",
    "landing.pricing.substances": "74 substances available",
    "landing.pricing.license": "Single-seat license (1 activation key)",
    "landing.pricing.updates": "Updates included",
    "landing.pricing.emailSupport": "Email support",
    "landing.pricing.prioritySupport": "Priority support",

    // Landing — License conditions
    "landing.conditions.title": "License conditions",
    "landing.conditions.item1":
      "The stated price corresponds to a single workstation (one computer).",
    "landing.conditions.item2":
      "Each subscription entitles you to a unique activation key, linked to a single workstation.",
    "landing.conditions.item3":
      "The activation key is strictly personal and non-transferable. It cannot be shared, transferred or used simultaneously on multiple workstations.",
    "landing.conditions.item4":
      "For use on multiple workstations, an additional license must be purchased for each additional workstation.",
    "landing.conditions.item5":
      "Any fraudulent use (key sharing, multiple simultaneous accesses) will result in immediate suspension of the subscription without refund.",
    "landing.conditions.item6":
      "The EQRS Johnson & Ettinger software is the exclusive property of SARL G.M.E.P. Any reproduction, distribution or reverse engineering is prohibited.",

    // Demo Calculator
    "demo_title": "Try the J&E Model",
    "demo_subtitle": "Free demo — 5 substances",
    "demo_substance": "Substance",
    "demo_soil_gas": "Soil gas concentration (µg/m³)",
    "demo_groundwater": "Groundwater concentration (µg/L)",
    "demo_distance": "Source-to-slab distance (m)",
    "demo_calculate": "Calculate",
    "demo_alpha": "Attenuation factor α",
    "demo_cindoor_sg": "Cindoor soil gas",
    "demo_cindoor_gw": "Cindoor groundwater",
    "demo_qd": "HQ Inhalation Adult",
    "demo_eri": "ILCR Inhalation Adult",
    "demo_acceptable": "Acceptable",
    "demo_vigilance": "Monitoring",
    "demo_unacceptable": "Unacceptable",
    "demo_upgrade": "Access all 74 substances and full calculations",
    "demo_more_substances": "69 additional substances with subscription",
    "demo_results": "Results",
    "demo_enter_values": "Enter concentrations and click Calculate",
    "demo_non_volatile": "The J&E model does not apply to non-volatile metals",
    "demo_slab_thickness": "Slab thickness (m)",
    "demo_advanced_params": "Advanced parameters",
    "demo_porosity": "Total soil porosity (n)",
    "demo_water_content": "Volumetric water content (θw)",

    // Login
    "login.title": "Sign in",
    "login.subtitle": "Access your EQRS workspace",
    "login.email": "Email address",
    "login.password": "Password",
    "login.submit": "Sign in",
    "login.forgotPassword": "Forgot password?",
    "login.noAccount": "Don't have an account?",
    "login.createAccount": "Create an account",

    // Register
    "register.title": "Create an account",
    "register.subtitle": "Sign up to access the EQRS tool",
    "register.name": "Full name",
    "register.email": "Email address",
    "register.password": "Password",
    "register.confirmPassword": "Confirm password",
    "register.minChars": "Min. 8 characters",
    "register.submit": "Create my account",
    "register.alreadyAccount": "Already have an account?",
    "register.signIn": "Sign in",

    // Dashboard
    "dashboard.hello": "Hello,",
    "dashboard.welcome": "Welcome to your EQRS Johnson & Ettinger workspace.",
    "dashboard.subscriptionRequired": "Subscription required to access the EQRS tool",
    "dashboard.toolTitle": "EQRS Johnson & Ettinger Tool",
    "dashboard.active.desc": "Your subscription is active. You can access the modeling tool.",
    "dashboard.trial.label": "Free trial",
    "dashboard.trial.desc":
      "You have free access for 14 days (until {date}). Subscribe before the trial ends to continue.",
    "dashboard.accessTool": "Access EQRS tool",
    "dashboard.mySubscription": "My subscription",
    "dashboard.status": "Status",
    "dashboard.statusActive": "Active",
    "dashboard.plan": "Plan",
    "dashboard.nextRenewal": "Next renewal",
    "dashboard.licenseKey": "License key",
    "dashboard.licenseWarning": "This key is linked to your workstation. Do not share it.",
    "dashboard.manageSubscription": "Manage my subscription",
    "dashboard.upgradePrompt": "Upgrade to a paid plan to continue after the trial:",
    "dashboard.conditions":
      "Conditions: Price per workstation. Each subscription entitles one unique activation key linked to one workstation. For multiple workstations, an additional license is required per workstation.",

    // Forgot password
    "forgot.title": "Forgot password",
    "forgot.subtitle": "Enter your email to receive a reset code",
    "forgot.email": "Email address",
    "forgot.sendCode": "Send code",
    "forgot.newPassword": "New password",
    "forgot.verificationCode": "Verification code",
    "forgot.newPasswordLabel": "New password",
    "forgot.confirmPassword": "Confirm password",
    "forgot.reset": "Reset password",
    "forgot.newPasswordTitle": "New password",
    "forgot.newPasswordSubtitle": "Enter the code received by email and your new password",
    "forgot.doneTitle": "Password changed",
    "forgot.doneDesc": "Your password has been successfully reset.",
    "forgot.backToLogin": "Back to sign in",
    "forgot.signIn": "Sign in",
  },

  es: {
    // Header
    "header.login": "Iniciar sesión",
    "header.register": "Registrarse",
    "header.logout": "Cerrar sesión",
    "header.subtitle": "EQRS — Modelo Johnson & Ettinger",
    "header.subtext": "Evaluación Cuantitativa de Riesgos Sanitarios • Intrusión de vapores",

    // Footer
    "footer.rights": "Todos los derechos reservados.",
    "footer.legal":
      "Este software de modelización EQRS Johnson & Ettinger es propiedad exclusiva de la SARL G.M.E.P.",
    "footer.repro":
      "Toda reproducción, difusión o uso, incluso parcial, sin autorización escrita previa está prohibida.",
    "footer.conception": "Diseño y desarrollo",

    // Landing — Hero
    "landing.hero.badge": "Modelo EPA J&E (2004)",
    "landing.hero.title1": "Modelización EQRS",
    "landing.hero.title2": "Johnson & Ettinger",
    "landing.hero.desc":
      "Herramienta profesional de evaluación cuantitativa de riesgos sanitarios por intrusión de vapores en edificios. Cálculos en tiempo real, 74 sustancias, cumplimiento normativo.",
    "landing.hero.cta": "Comenzar prueba gratuita",
    "landing.hero.seePricing": "Ver precios",
    "landing.hero.trial": "14 días de prueba gratuita — sin tarjeta de crédito",

    // Landing — Features
    "landing.features.title": "Una herramienta completa de modelización ambiental",
    "landing.features.subtitle": "Conforme a las recomendaciones de la EPA y los requisitos normativos.",
    "landing.features.substances.title": "74 sustancias",
    "landing.features.substances.desc":
      "Base de datos completa que incluye COV, metales, HAP y otros contaminantes reglamentados.",
    "landing.features.realtime.title": "Cálculos en tiempo real",
    "landing.features.realtime.desc":
      "Resultados instantáneos: CI, RCEI, VLA, factor de atenuación y concentraciones interiores.",
    "landing.features.sensitivity.title": "Análisis de sensibilidad",
    "landing.features.sensitivity.desc":
      "Estudio paramétrico sobre 8 variables clave para evaluar la incertidumbre del modelo.",
    "landing.features.model.title": "Modelo J&E EPA 2004",
    "landing.features.model.desc":
      "Implementación fiel del modelo Johnson & Ettinger publicado por la US EPA.",

    // Landing — Pricing
    "landing.pricing.title": "Precios simples y transparentes",
    "landing.pricing.subtitle": "Acceda a la herramienta EQRS completa. Sin compromiso.",
    "landing.pricing.trialBadge": "Pruebe gratis durante 14 días antes de comprometerse",
    "landing.pricing.monthly": "Mensual",
    "landing.pricing.annual": "Anual",
    "landing.pricing.save15": "Ahorre 15%",
    "landing.pricing.perMonth": "/mes",
    "landing.pricing.perYear": "/año",
    "landing.pricing.monthlyBilling": "Facturación mensual, cancelable en cualquier momento.",
    "landing.pricing.annualEquiv": "Aprox. 208€/mes. Facturación anual.",
    "landing.pricing.subscribe": "Suscribirse",
    "landing.pricing.fullAccess": "Acceso completo a la herramienta EQRS",
    "landing.pricing.substances": "74 sustancias disponibles",
    "landing.pricing.license": "Licencia monopuesto (1 clave de activación)",
    "landing.pricing.updates": "Actualizaciones incluidas",
    "landing.pricing.emailSupport": "Soporte por correo electrónico",
    "landing.pricing.prioritySupport": "Soporte prioritario",

    // Landing — License conditions
    "landing.conditions.title": "Condiciones de licencia",
    "landing.conditions.item1":
      "El precio indicado corresponde a un único puesto de trabajo (un solo ordenador).",
    "landing.conditions.item2":
      "Cada suscripción otorga derecho a una clave de activación única, vinculada a un solo puesto.",
    "landing.conditions.item3":
      "La clave de activación es estrictamente personal e intransferible. No puede ser compartida, transferida ni utilizada simultáneamente en varios puestos.",
    "landing.conditions.item4":
      "Para el uso en varios puestos, se debe adquirir una licencia adicional por cada puesto adicional.",
    "landing.conditions.item5":
      "Cualquier uso fraudulento (compartir clave, accesos simultáneos múltiples) resultará en la suspensión inmediata de la suscripción sin reembolso.",
    "landing.conditions.item6":
      "El software EQRS Johnson & Ettinger es propiedad exclusiva de la SARL G.M.E.P. Toda reproducción, difusión o ingeniería inversa está prohibida.",

    // Demo Calculator
    "demo_title": "Pruebe el modelo J&E",
    "demo_subtitle": "Demo gratuita — 5 sustancias",
    "demo_substance": "Sustancia",
    "demo_soil_gas": "Concentración gas del suelo (µg/m³)",
    "demo_groundwater": "Concentración aguas subterráneas (µg/L)",
    "demo_distance": "Distancia fuente-losa (m)",
    "demo_calculate": "Calcular",
    "demo_alpha": "Factor de atenuación α",
    "demo_cindoor_sg": "Cindoor gas del suelo",
    "demo_cindoor_gw": "Cindoor aguas subterráneas",
    "demo_qd": "CP Inhalación Adulto",
    "demo_eri": "ERI Inhalación Adulto",
    "demo_acceptable": "Aceptable",
    "demo_vigilance": "Vigilancia",
    "demo_unacceptable": "Inaceptable",
    "demo_upgrade": "Acceda a las 74 sustancias y cálculos completos",
    "demo_more_substances": "69 sustancias adicionales con la suscripción",
    "demo_results": "Resultados",
    "demo_enter_values": "Ingrese concentraciones y haga clic en Calcular",
    "demo_non_volatile": "El modelo J&E no se aplica a los metales no volátiles",
    "demo_slab_thickness": "Espesor de la losa (m)",
    "demo_advanced_params": "Parámetros avanzados",
    "demo_porosity": "Porosidad total del suelo (n)",
    "demo_water_content": "Contenido volumétrico de agua (θw)",

    // Login
    "login.title": "Iniciar sesión",
    "login.subtitle": "Acceda a su espacio EQRS",
    "login.email": "Correo electrónico",
    "login.password": "Contraseña",
    "login.submit": "Iniciar sesión",
    "login.forgotPassword": "¿Olvidó su contraseña?",
    "login.noAccount": "¿No tiene cuenta?",
    "login.createAccount": "Crear una cuenta",

    // Register
    "register.title": "Crear una cuenta",
    "register.subtitle": "Regístrese para acceder a la herramienta EQRS",
    "register.name": "Nombre completo",
    "register.email": "Correo electrónico",
    "register.password": "Contraseña",
    "register.confirmPassword": "Confirmar contraseña",
    "register.minChars": "Mín. 8 caracteres",
    "register.submit": "Crear mi cuenta",
    "register.alreadyAccount": "¿Ya tiene una cuenta?",
    "register.signIn": "Iniciar sesión",

    // Dashboard
    "dashboard.hello": "Hola,",
    "dashboard.welcome": "Bienvenido a su espacio EQRS Johnson & Ettinger.",
    "dashboard.subscriptionRequired": "Se requiere suscripción para acceder a la herramienta EQRS",
    "dashboard.toolTitle": "Herramienta EQRS Johnson & Ettinger",
    "dashboard.active.desc": "Su suscripción está activa. Puede acceder a la herramienta de modelización.",
    "dashboard.trial.label": "Prueba gratuita",
    "dashboard.trial.desc":
      "Tiene acceso gratuito durante 14 días (hasta el {date}). Suscríbase antes de que finalice la prueba para continuar.",
    "dashboard.accessTool": "Acceder a la herramienta EQRS",
    "dashboard.mySubscription": "Mi suscripción",
    "dashboard.status": "Estado",
    "dashboard.statusActive": "Activo",
    "dashboard.plan": "Plan",
    "dashboard.nextRenewal": "Próxima renovación",
    "dashboard.licenseKey": "Clave de activación",
    "dashboard.licenseWarning":
      "Esta clave está vinculada a su puesto de trabajo. No la comparta.",
    "dashboard.manageSubscription": "Gestionar mi suscripción",
    "dashboard.upgradePrompt": "Pase a un plan de pago para continuar después de la prueba:",
    "dashboard.conditions":
      "Condiciones: Precio por puesto de trabajo. Cada suscripción otorga una clave de activación única vinculada a un puesto. Para varios puestos, se requiere una licencia adicional por puesto.",

    // Forgot password
    "forgot.title": "Contraseña olvidada",
    "forgot.subtitle": "Ingrese su correo electrónico para recibir un código de restablecimiento",
    "forgot.email": "Correo electrónico",
    "forgot.sendCode": "Enviar código",
    "forgot.newPassword": "Nueva contraseña",
    "forgot.verificationCode": "Código de verificación",
    "forgot.newPasswordLabel": "Nueva contraseña",
    "forgot.confirmPassword": "Confirmar contraseña",
    "forgot.reset": "Restablecer contraseña",
    "forgot.newPasswordTitle": "Nueva contraseña",
    "forgot.newPasswordSubtitle": "Ingrese el código recibido por correo y su nueva contraseña",
    "forgot.doneTitle": "Contraseña modificada",
    "forgot.doneDesc": "Su contraseña ha sido restablecida con éxito.",
    "forgot.backToLogin": "Volver al inicio de sesión",
    "forgot.signIn": "Iniciar sesión",
  },
} as const;

type TranslationKey = keyof typeof translations.fr;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "fr",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");

  function t(key: TranslationKey, vars?: Record<string, string>): string {
    const dict = translations[lang] as Record<string, string>;
    let text = dict[key] ?? (translations.fr as Record<string, string>)[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
