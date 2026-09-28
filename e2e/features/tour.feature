# language: pt
Funcionalidade: Tour do produto
  Como um visitante novo
  Quero ver um tour guiado da navegação
  Para conhecer as seções do app

  Cenário: Tour aparece na primeira visita e persiste a conclusão
    Dado que eu nunca concluí o tour
    Quando eu abro a página inicial
    Então o primeiro passo do tour deve estar visível
    Quando eu avanço até o último passo e concluo
    E eu recarrego a página
    Então o tour não deve aparecer novamente

  Cenário: Tour aguarda o onboarding na página de chat
    Dado que eu não tenho um perfil salvo
    E que eu nunca concluí o tour
    Quando eu abro a página de chat
    Então o diálogo de onboarding deve estar visível
    E o tour não deve estar visível
    Quando eu envio o formulário de onboarding
    Então o tour deve aparecer

  Cenário: Reexecutar o tour pelas configurações
    Dado que eu já concluí o tour
    Quando eu abro a página de configurações
    E eu clico em "Replay"
    Então o tour deve aparecer novamente
