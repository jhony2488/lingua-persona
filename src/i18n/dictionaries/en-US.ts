export const dictionary = {
  metadata: {
    description:
      "Learn English by talking to a virtual teacher — local AI, voice, and offline support.",
  },
  nav: {
    chat: "Chat",
    plan: "Plan",
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
  llm: {
    engine: "Engine",
    model: "Model",
    auto: "Auto",
    recommended: "recommended",
    downloading: "Downloading {model}… {pct}%",
    ready: "{engine} ready",
    offlineMode: "Practice mode (offline)",
    engineAuto: "Auto",
    engineWebllm: "WebLLM (browser GPU)",
    engineOllama: "Ollama (localhost)",
    engineLocal: "Offline practice",
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
  landing: {
    viewRepository: "Repository",
    contribute: "Contribute",
    releases: "Releases",
    tagline: "Free, open-source and private — runs on your device.",
    navDocs: "Docs",
    eyebrow: "Free · Open-source · Private",
    ctaPrimary: "Get the app",
    stats: [
      { value: "A1–C2", label: "All CEFR levels" },
      { value: "100%", label: "Local-first & private" },
      { value: "4", label: "Interface languages" },
      { value: "PWA", label: "Installable & offline" },
    ],
    howItWorks: {
      title: "How it works",
      steps: [
        {
          title: "Create your profile",
          text: "Pick your level, dialect and teacher persona — takes seconds, all stored on your device.",
        },
        {
          title: "Pick a topic",
          text: "Choose a conversation topic or generate a weekly study plan tailored to your level.",
        },
        {
          title: "Practice",
          text: "Chat by text or voice and get adaptive feedback — entirely offline if you want.",
        },
      ],
    },
    chatMock: {
      user: "How do I use 'used to' correctly?",
      teacher:
        "Great question! 'Used to' describes past habits — for example: I used to swim every day.",
      learner: "So: 'I used to play guitar' is correct?",
    },
    ctaTitle: "Start practicing today",
    ctaText:
      "Download the app for your platform or run it locally — your data never leaves your device.",
    footerLicense: "License",
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
  tour: {
    stepOf: "{current} of {total}",
    skip: "Skip",
    back: "Back",
    next: "Next",
    finish: "Finish",
    replayTitle: "Product tour",
    replay: "Replay",
    steps: {
      home: {
        title: "Welcome to LinguaPersona",
        description:
          "Your home base — an overview of what your private AI teacher can do.",
      },
      chat: {
        title: "Chat",
        description:
          "Practice English by text or voice with your adaptive teacher.",
      },
      plan: {
        title: "Study plan",
        description:
          "Generate a weekly study plan tailored to your level and focus.",
      },
      settings: {
        title: "Settings",
        description:
          "Pick your teacher's name, voice, dialect and your CEFR level.",
      },
      language: {
        title: "Interface language",
        description: "Switch the app between English, Portuguese and Spanish.",
      },
    },
  },
  common: {
    redirecting: "Redirecting…",
  },
};

export type Dictionary = typeof dictionary;
