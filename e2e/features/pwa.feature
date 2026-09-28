# language: pt
Funcionalidade: PWA e offline
  Como um usuário do app
  Quero que o app funcione como PWA instalável
  Para usar offline quando não houver rede

  Cenário: Manifest da aplicação está disponível
    Quando eu acesso "/manifest.webmanifest"
    Então o manifest deve ser retornado com nome e ícones

  Cenário: Página offline existe
    Quando eu acesso "/en-US/~offline"
    Então deve aparecer uma mensagem de modo offline

  @skip
  Cenário: Banner de instalação aparece quando o evento é disparado
    # beforeinstallprompt não é disparável em headless — cenário manual
    Dado que o navegador suporta instalação
    Quando o evento beforeinstallprompt ocorre
    Então o banner de instalação deve aparecer
