# language: pt
Funcionalidade: Chat de conversação
  Como um aluno autenticado
  Quero conversar em inglês por texto
  Para praticar escrita e leitura com o professor

  Contexto:
    Dado que eu tenho um perfil salvo

  Cenário: Criar uma nova conversa vazia
    Quando eu clico em "New conversation"
    Então uma nova conversa deve aparecer na lista
    E a área de mensagens deve estar vazia

  Cenário: Enviar mensagem e receber resposta do professor
    Dado que eu tenho uma conversa aberta
    Quando eu envio a mensagem "Hello, teacher!"
    Então minha mensagem deve aparecer na lista
    E uma resposta do assistente deve aparecer

  Cenário: Iniciar conversa a partir de um tópico sugerido
    Dado que eu estou na tela de chat sem conversa selecionada
    Quando eu clico em um tópico sugerido
    Então uma conversa com o título "Talk about:" deve ser criada
    E a área de mensagens deve ficar disponível

  Cenário: Tópicos já conversados não reaparecem
    Dado que eu criei uma conversa a partir do tópico "Daily routines"
    Quando eu volto para a tela de chat sem conversa selecionada
    Então o tópico "Daily routines" não deve aparecer nas sugestões

  Cenário: Deletar uma conversa
    Dado que eu tenho uma conversa na lista
    Quando eu clico no botão de deletar da conversa
    Então a conversa deve sumir da lista

  @skip
  Cenário: Modelo LLM pré-carrega em background ao abrir o app
    # WebGPU/WebLLM não existem em headless — cenário manual
    Dado que o navegador suporta WebGPU e o engine está como "auto"
    Quando eu abro qualquer página do app
    Então os pesos do modelo devem começar a baixar em background
    E a primeira resposta do chat não espera o download

  @skip
  Cenário: Voz usa Whisper local quando SpeechRecognition não existe
    # SpeechRecognition/mic não existem em headless — cenário manual
    Dado que o navegador não suporta SpeechRecognition (ex.: Tauri)
    Quando eu pressiono o orbe de voz e falo
    Então a fala deve ser transcrita pelo Whisper on-device
    E a resposta deve ser falada normalmente
