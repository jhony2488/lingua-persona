import type { Dictionary } from "./en-US";

export const dictionary: Dictionary = {
  metadata: {
    description:
      "Aprenda inglês conversando com um professor virtual — IA local, voz e suporte offline.",
  },
  nav: {
    chat: "Chat",
    settings: "Configurações",
  },
  footer: {
    tagline: "LinguaPersona — aprenda inglês com um professor de IA local",
  },
  home: {
    heroTitle: "Aprenda inglês com seu próprio professor de IA",
    heroSubtitle:
      "LinguaPersona é um web app privado e instalável que permite praticar conversação em inglês com um professor virtual adaptativo — rodando quase todo no seu próprio dispositivo.",
    startPracticing: "Começar a praticar",
    configureTeacher: "Configurar professor",
    features: [
      {
        title: "IA local-first",
        description:
          "Modelos de linguagem rodam no seu navegador via WebLLM/WebGPU, com Ollama e APIs externas como fallback.",
      },
      {
        title: "Professor adaptativo",
        description:
          "Um professor virtual que se adapta ao seu nível — de A1 a C2 — com feedback de gramática.",
      },
      {
        title: "Prática de voz",
        description:
          "Fale e ouça com a Web Speech API para treinar pronúncia e compreensão.",
      },
      {
        title: "Privado por design",
        description:
          "Conversas, memória e documentos ficam no seu dispositivo — PWA totalmente offline.",
      },
    ],
  },
  chat: {
    pickConversation: "Escolha uma conversa ou crie uma nova.",
    newConversation: "Nova conversa",
    loading: "Carregando…",
    noConversations: "Nenhuma conversa ainda.",
    untitled: "Sem título",
    practiceWithDate: "Prática de {date}",
    talkAboutTopic: "Falar sobre: {topic}",
    talkAbout: "Falar sobre:",
    sayHello: "Diga olá para começar a praticar.",
    teacherTyping: "O professor está digitando…",
    playMessage: "Ouvir mensagem",
    typeMessage: "Digite ou dite uma mensagem…",
    selectConversationFirst: "Selecione uma conversa primeiro",
    sendMessage: "Enviar mensagem",
    deleteConversation: "Excluir conversa",
    speechNotSupported: "Reconhecimento de voz não suportado",
    stopListening: "Parar de ouvir",
    startVoiceInput: "Iniciar entrada de voz",
  },
  voice: {
    modeVoice: "Voz",
    modeChat: "Chat",
    tapToTalk: "Toque para falar",
    listening: "Ouvindo…",
    thinking: "Pensando…",
    speaking: "Falando…",
    errorRetry:
      "Não foi possível falar com o professor. Toque para tentar de novo.",
    pickTopic:
      "Escolha um tópico de conversação e comece a falar com {name}.",
    speechUnsupported:
      "Reconhecimento de voz não é suportado neste navegador.",
    speechUnsupportedHint: "Mude para o modo chat para continuar praticando.",
    startTalking: "Começar a falar",
    stopSession: "Encerrar sessão",
    toggleHistory: "Mostrar transcrição",
    flowAuto: "Automático",
    flowConfirm: "Confirmar",
    draftPlaceholder: "Sua fala aparece aqui — edite e envie.",
    you: "Você",
  },
  settings: {
    title: "Configurações do professor",
    description: "Personalize como seu professor virtual fala e ensina.",
    teacherName: "Nome do professor",
    teacherVoice: "Voz do professor",
    voiceMale: "Masculina (Alex)",
    voiceFemale: "Feminina (Alexia)",
    dialect: "Dialeto",
    americanEnglish: "Inglês americano",
    britishEnglish: "Inglês britânico",
    yourLevel: "Seu nível",
    notifications: "Notificações",
    notificationsDescription:
      "Suporte a Web Push preparado; estado da permissão: {state}",
    permissionGranted: "concedida",
    permissionDenied: "negada",
    permissionDefault: "padrão",
    permissionUnsupported: "não suportada",
    enable: "Ativar",
  },
  plan: {
    title: "Plano de estudos",
    home: "← Início",
    createProfileFirst:
      "Crie seu perfil de professor primeiro para gerar um plano de estudos.",
    goToChat: "Ir para o chat",
    weeks: "Semanas",
    focus: "Foco",
    focusBalanced: "Equilibrado",
    focusGrammar: "Gramática",
    focusSpeaking: "Conversação",
    generate: "Gerar plano",
    generating: "Gerando…",
    loadingPlans: "Carregando planos…",
    noPlans: "Nenhum plano ainda — gere o primeiro acima.",
    weekTitle: "Semana {week}: {theme}",
    studyItem: "Estudar: {title}",
    readingItem: "Leitura: {title}",
    levelCreated: "Nível {level} · criado em {date}",
  },
  onboarding: {
    title: "Bem-vindo ao LinguaPersona",
    description:
      "Diga seu nome e e-mail para começar a praticar. Seus dados ficam neste dispositivo.",
    namePlaceholder: "Seu nome",
    emailPlaceholder: "voce@exemplo.com",
    error: "Não foi possível criar seu perfil. Tente novamente.",
    saving: "Salvando…",
    start: "Começar",
  },
  installBanner: {
    text: "Instale o LinguaPersona no seu dispositivo para uma experiência mais rápida e pronta para offline.",
    install: "Instalar",
    notNow: "Agora não",
  },
  offline: {
    title: "Você está offline",
    text: "O LinguaPersona precisa de conexão com a internet para esta página. Algum conteúdo ainda pode estar disponível no cache.",
    tryAgain: "Tentar novamente",
  },
  common: {
    redirecting: "Redirecionando…",
  },
};
