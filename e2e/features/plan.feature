# language: pt
Funcionalidade: Plano de estudos
  Como um aluno autenticado
  Quero gerar um plano de estudos semanal
  Para ter um cronograma com lições, leituras e tópicos de conversa

  Cenário: Visitante sem perfil vê chamada para onboarding
    Dado que eu não tenho um perfil salvo
    Quando eu abro a página de plano
    Então deve aparecer o link para ir ao chat criar o perfil

  Cenário: Gerar plano semanal
    Dado que eu tenho um perfil salvo
    Quando eu abro a página de plano
    E eu seleciono 4 semanas
    E eu clico em "Generate plan"
    Então deve aparecer um plano com 4 cards semanais
    E cada card deve exibir tema, tópicos e objetivos

  Cenário: Foco em speaking remove referências de estudo
    Dado que eu tenho um perfil salvo
    Quando eu gero um plano com foco "Speaking"
    Então os cards não devem conter itens "Study:"
