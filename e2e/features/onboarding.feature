# language: pt
Funcionalidade: Onboarding do usuário
  Como um novo aluno
  Quero criar meu perfil de aprendizado
  Para que o professor adapte o ensino ao meu nível

  Cenário: Diálogo de onboarding aparece para visitante novo
    Dado que eu não tenho um perfil salvo
    Quando eu abro a página de chat
    Então o diálogo de onboarding deve estar visível

  Cenário: Criar perfil com dados válidos
    Dado que eu não tenho um perfil salvo
    Quando eu abro a página de chat
    E eu preencho o email "ana-e2e@example.com"
    E o email não está cadastrado
    E eu preencho o nome "Ana"
    E eu envio o formulário de onboarding
    Então o diálogo de onboarding deve fechar
    E o perfil deve ficar salvo no armazenamento local

  Cenário: Recuperar perfil com email já cadastrado
    Dado que já existe um usuário com email "ana-e2e@example.com"
    Quando eu informo o mesmo email no acesso ao perfil
    Então o perfil existente deve ser carregado
    E o nível e dialeto salvos devem ser restaurados
    E o campo de nome não deve ser solicitado
