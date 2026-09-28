# SSH signing for commits

All LinguaPersona commits must be signed with an SSH key. The signature proves that the commit came from you and that the code has not been changed after it was sent.

## Requirements

- Git 2.34 or newer (SSH signing support was added in that version).
- An `ed25519` SSH key. If you do not have one yet, generate it with the command below.

## 1. Generate an SSH key

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

Accept the default path (`~/.ssh/id_ed25519`) and, if you want, set a passphrase. This creates two files:

- `~/.ssh/id_ed25519` — private key (never share it).
- `~/.ssh/id_ed25519.pub` — public key (can be registered on GitHub).

## 2. Register the public key on GitHub

1. Open `~/.ssh/id_ed25519.pub` and copy its entire contents.
2. Go to GitHub > Settings > SSH and GPG keys.
3. Click **New SSH key**.
4. Under **Key type**, choose **Signing key**.
5. Paste the contents and save.

## 3. Configure Git to sign with SSH

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

With this, all new commits will be signed automatically.

## 4. Make a signed commit

Now just use `git commit` normally:

```bash
git commit -m "add ssh signing documentation"
```

To sign a specific commit without enabling auto-signing:

```bash
git commit -S -m "add ssh signing documentation"
```

## 5. Verify the signature

In your local repository:

```bash
git log --show-signature
```

To verify a specific commit:

```bash
git verify-commit <commit-hash>
```

## 6. Configure signer verification (optional)

To let Git confirm the signature, create a list of trusted signers:

```bash
mkdir -p ~/.config/git
echo "your-email@example.com $(cat ~/.ssh/id_ed25519.pub)" >> ~/.config/git/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers
```

## See also

- [How to contribute](../../CONTRIBUTING.en.md)
