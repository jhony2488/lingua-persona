# language: pt
Funcionalidade: Configurações do professor
  Como um aluno autenticado
  Quero personalizar meu professor virtual
  Para ajustar persona, gênero, dialeto e nível

  Contexto:
    Dado que eu tenho um perfil salvo

  Cenário: Alterar nome e gênero do agente
    Quando eu abro a página de configurações
    E eu altero o nome do agente para "Maya"
    E eu seleciono o gênero "female"
    Então as preferências devem ser persistidas
    E ao recarregar a página o nome "Maya" deve permanecer

  Cenário: Alterar nível e dialeto
    Quando eu abro a página de configurações
    E eu seleciono o nível "B2"
    E eu seleciono o dialeto "UK"
    Então ao recarregar, nível e dialeto devem permanecer salvos
