# Assinatura SSH para commits

Todos os commits do LinguaPersona devem ser assinados com uma chave SSH. A assinatura comprova que o commit partiu de você e que o código não foi alterado após envio.

## Requisitos

- Git 2.34 ou superior (suporte a assinatura SSH foi adicionado nessa versão).
- Uma chave SSH `ed25519`. Se ainda não tiver uma, gere uma com o comando abaixo.

## 1. Gerar uma chave SSH

```bash
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"
```

Aceite o caminho padrão (`~/.ssh/id_ed25519`) e, se quiser, defina uma senha. Isso cria dois arquivos:

- `~/.ssh/id_ed25519` — chave privada (nunca compartilhe).
- `~/.ssh/id_ed25519.pub` — chave pública (pode ser registrada no GitHub).

## 2. Registrar a chave pública no GitHub

1. Abra `~/.ssh/id_ed25519.pub` e copie todo o conteúdo.
2. Acesse GitHub > Settings > SSH and GPG keys.
3. Clique em **New SSH key**.
4. Em **Key type**, escolha **Signing key**.
5. Cole o conteúdo e salve.

## 3. Configurar o Git para assinar com SSH

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

Com isso, todos os novos commits serão assinados automaticamente.

## 4. Fazer um commit assinado

Agora basta usar o `git commit` normalmente:

```bash
git commit -m "adiciona doc de assinatura SSH"
```

Para assinar um commit específico sem ativar a assinatura automática:

```bash
git commit -S -m "adiciona doc de assinatura SSH"
```

## 5. Verificar a assinatura

No seu repositório local:

```bash
git log --show-signature
```

Para verificar um commit específico:

```bash
git verify-commit <hash-do-commit>
```

## 6. Configurar verificação de signatários (opcional)

Para que o Git confirme a assinatura, crie uma lista de signatários confiáveis:

```bash
mkdir -p ~/.config/git
echo "seu-email@exemplo.com $(cat ~/.ssh/id_ed25519.pub)" >> ~/.config/git/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers
```

## Veja também

- [Como contribuir](../../CONTRIBUTING.md)
