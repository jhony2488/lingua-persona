import type { Dictionary } from "./en-US";

export const dictionary: Dictionary = {
  metadata: {
    description:
      "Aprende inglés hablando con un profesor virtual — IA local, voz y soporte sin conexión.",
  },
  nav: {
    chat: "Chat",
    settings: "Configuración",
  },
  footer: {
    tagline: "LinguaPersona — aprende inglés con un profesor de IA local",
  },
  home: {
    heroTitle: "Aprende inglés con tu propio profesor de IA",
    heroSubtitle:
      "LinguaPersona es una aplicación web privada e instalable que te permite practicar conversación en inglés con un profesor virtual adaptativo — funcionando casi todo en tu propio dispositivo.",
    startPracticing: "Empezar a practicar",
    configureTeacher: "Configurar profesor",
    features: [
      {
        title: "IA local-first",
        description:
          "Los modelos de lenguaje se ejecutan en tu navegador vía WebLLM/WebGPU, con Ollama y APIs externas como respaldo.",
      },
      {
        title: "Profesor adaptativo",
        description:
          "Un profesor virtual que se adapta a tu nivel — de A1 a C2 — con corrección gramatical.",
      },
      {
        title: "Práctica de voz",
        description:
          "Habla y escucha con la Web Speech API para entrenar pronunciación y comprensión.",
      },
      {
        title: "Privado por diseño",
        description:
          "Las conversaciones, la memoria y los documentos permanecen en tu dispositivo — PWA totalmente offline.",
      },
    ],
  },
  chat: {
    pickConversation: "Elige una conversación o crea una nueva.",
    newConversation: "Nueva conversación",
    loading: "Cargando…",
    noConversations: "Aún no hay conversaciones.",
    untitled: "Sin título",
    practiceWithDate: "Práctica del {date}",
    talkAboutTopic: "Hablar sobre: {topic}",
    talkAbout: "Hablar sobre:",
    sayHello: "Saluda para empezar a practicar.",
    teacherTyping: "El profesor está escribiendo…",
    playMessage: "Escuchar mensaje",
    typeMessage: "Escribe o dicta un mensaje…",
    selectConversationFirst: "Selecciona una conversación primero",
    sendMessage: "Enviar mensaje",
    deleteConversation: "Eliminar conversación",
    speechNotSupported: "Reconocimiento de voz no compatible",
    stopListening: "Dejar de escuchar",
    startVoiceInput: "Iniciar entrada de voz",
  },
  voice: {
    modeVoice: "Voz",
    modeChat: "Chat",
    tapToTalk: "Toca para hablar",
    listening: "Escuchando…",
    thinking: "Pensando…",
    speaking: "Hablando…",
    errorRetry: "No se pudo contactar al profesor. Toca para reintentar.",
    pickTopic: "Elige un tema de conversación y empieza a hablar con {name}.",
    speechUnsupported:
      "El reconocimiento de voz no es compatible con este navegador.",
    speechUnsupportedHint: "Cambia al modo chat para seguir practicando.",
    startTalking: "Empezar a hablar",
    stopSession: "Terminar sesión",
    toggleHistory: "Mostrar transcripción",
    flowAuto: "Auto",
    flowConfirm: "Confirmar",
    draftPlaceholder: "Tu voz aparece aquí — edita y envía.",
    you: "Tú",
  },
  settings: {
    title: "Configuración del profesor",
    description: "Personaliza cómo tu profesor virtual habla y enseña.",
    teacherName: "Nombre del profesor",
    teacherVoice: "Voz del profesor",
    voiceMale: "Masculina (Alex)",
    voiceFemale: "Femenina (Alexia)",
    dialect: "Dialecto",
    americanEnglish: "Inglés americano",
    britishEnglish: "Inglés británico",
    yourLevel: "Tu nivel",
    notifications: "Notificaciones",
    notificationsDescription:
      "Soporte de Web Push preparado; estado del permiso: {state}",
    permissionGranted: "concedido",
    permissionDenied: "denegado",
    permissionDefault: "predeterminado",
    permissionUnsupported: "no compatible",
    enable: "Activar",
  },
  plan: {
    title: "Plan de estudios",
    home: "← Inicio",
    createProfileFirst:
      "Crea tu perfil de profesor primero para generar un plan de estudios.",
    goToChat: "Ir al chat",
    weeks: "Semanas",
    focus: "Enfoque",
    focusBalanced: "Equilibrado",
    focusGrammar: "Gramática",
    focusSpeaking: "Conversación",
    generate: "Generar plan",
    generating: "Generando…",
    loadingPlans: "Cargando planes…",
    noPlans: "Aún no hay planes — genera el primero arriba.",
    weekTitle: "Semana {week}: {theme}",
    studyItem: "Estudiar: {title}",
    readingItem: "Lectura: {title}",
    levelCreated: "Nivel {level} · creado el {date}",
  },
  onboarding: {
    title: "Bienvenido a LinguaPersona",
    description:
      "Dinos tu nombre y correo para empezar a practicar. Tus datos permanecen en este dispositivo.",
    namePlaceholder: "Tu nombre",
    emailPlaceholder: "tu@ejemplo.com",
    error: "No se pudo crear tu perfil. Inténtalo de nuevo.",
    saving: "Guardando…",
    start: "Empezar",
  },
  installBanner: {
    text: "Instala LinguaPersona en tu dispositivo para una experiencia más rápida y lista para offline.",
    install: "Instalar",
    notNow: "Ahora no",
  },
  offline: {
    title: "Estás sin conexión",
    text: "LinguaPersona necesita conexión a internet para esta página. Parte del contenido puede seguir disponible en la caché.",
    tryAgain: "Reintentar",
  },
  common: {
    redirecting: "Redirigiendo…",
  },
};
