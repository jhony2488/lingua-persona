export const dictionary = {
  metadata: {
    description:
      "Learn English by talking to a virtual teacher — local AI, voice, and offline support.",
  },
  nav: {
    chat: "Chat",
    settings: "Settings",
  },
  footer: {
    tagline: "LinguaPersona — learn English with a local AI teacher",
  },
  home: {
    heroTitle: "Learn English with your own AI teacher",
    heroSubtitle:
      "LinguaPersona is a private, installable web app that lets you practice English conversation with an adaptive virtual teacher — running mostly on your own device.",
    startPracticing: "Start practicing",
    configureTeacher: "Configure teacher",
    features: [
      {
        title: "Local-first AI",
        description:
          "Language models run in your browser via WebLLM/WebGPU, with Ollama and external API fallbacks.",
      },
      {
        title: "Adaptive teacher",
        description:
          "A virtual teacher that adapts to your level — from A1 to C2 — with grammar feedback.",
      },
      {
        title: "Voice practice",
        description:
          "Speak and listen with the Web Speech API to train pronunciation and comprehension.",
      },
      {
        title: "Private by design",
        description:
          "Conversations, memory, and documents stay on your device — fully offline-capable PWA.",
      },
    ],
  },
  chat: {
    pickConversation: "Pick a conversation or create a new one.",
    newConversation: "New conversation",
    loading: "Loading…",
    noConversations: "No conversations yet.",
    untitled: "Untitled",
    practiceWithDate: "Practice {date}",
    talkAboutTopic: "Talk about: {topic}",
    talkAbout: "Talk about:",
    sayHello: "Say hello to start practicing.",
    teacherTyping: "Teacher is typing…",
    playMessage: "Play message",
    typeMessage: "Type or dictate a message…",
    selectConversationFirst: "Select a conversation first",
    sendMessage: "Send message",
    deleteConversation: "Delete conversation",
    speechNotSupported: "Speech recognition not supported",
    stopListening: "Stop listening",
    startVoiceInput: "Start voice input",
  },
  voice: {
    modeVoice: "Voice",
    modeChat: "Chat",
    tapToTalk: "Tap to talk",
    listening: "Listening…",
    thinking: "Thinking…",
    speaking: "Speaking…",
    errorRetry: "Could not reach the teacher. Tap to try again.",
    pickTopic: "Pick a conversation topic and start talking with {name}.",
    speechUnsupported: "Speech recognition is not supported in this browser.",
    speechUnsupportedHint: "Switch to chat mode to keep practicing.",
    startTalking: "Start talking",
    stopSession: "Stop session",
    toggleHistory: "Show transcript",
    flowAuto: "Auto",
    flowConfirm: "Confirm",
    draftPlaceholder: "Your speech appears here — edit and send.",
    you: "You",
  },
  settings: {
    title: "Teacher settings",
    description: "Personalize how your virtual teacher talks and teaches.",
    teacherName: "Teacher name",
    teacherVoice: "Teacher voice",
    voiceMale: "Male (Alex)",
    voiceFemale: "Female (Alexia)",
    dialect: "Dialect",
    americanEnglish: "American English",
    britishEnglish: "British English",
    yourLevel: "Your level",
    notifications: "Notifications",
    notificationsDescription:
      "Web Push support is prepared; permission state: {state}",
    permissionGranted: "granted",
    permissionDenied: "denied",
    permissionDefault: "default",
    permissionUnsupported: "unsupported",
    enable: "Enable",
  },
  plan: {
    title: "Study plan",
    home: "← Home",
    createProfileFirst:
      "Create your teacher profile first to generate a study plan.",
    goToChat: "Go to chat",
    weeks: "Weeks",
    focus: "Focus",
    focusBalanced: "Balanced",
    focusGrammar: "Grammar",
    focusSpeaking: "Speaking",
    generate: "Generate plan",
    generating: "Generating…",
    loadingPlans: "Loading plans…",
    noPlans: "No study plans yet — generate your first one above.",
    weekTitle: "Week {week}: {theme}",
    studyItem: "Study: {title}",
    readingItem: "Reading: {title}",
    levelCreated: "Level {level} · created {date}",
  },
  onboarding: {
    title: "Welcome to LinguaPersona",
    description:
      "Tell us your name and email to start practicing. Your data stays on this device.",
    namePlaceholder: "Your name",
    emailPlaceholder: "you@example.com",
    error: "Could not create your profile. Try again.",
    saving: "Saving…",
    start: "Start",
  },
  installBanner: {
    text: "Install LinguaPersona on your device for a faster, offline-ready experience.",
    install: "Install",
    notNow: "Not now",
  },
  offline: {
    title: "You are offline",
    text: "LinguaPersona needs an internet connection for this page. Some content may still be available from the cache.",
    tryAgain: "Try again",
  },
  common: {
    redirecting: "Redirecting…",
  },
};

export type Dictionary = typeof dictionary;
