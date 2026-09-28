# Configuração do `.npmrc`

O arquivo `.npmrc` na raiz define políticas de segurança para instalação de dependências. Ele restringe o comportamento padrão do `npm install` para reduzir a superfície de ataque.

## Conteúdo atual

```ini
# Mitiga janela em que uma versão comprometida ainda não foi detectada/removida.
# Trade-off: patches de segurança legítimos também ficam bloqueados por esse período.
min-release-age=7

# Não executa scripts de lifecycle (preinstall, install, postinstall, prepare…)
# de dependências transitivas durante `npm install`.
# Mitiga o vetor mais usado em ataques: código arbitrário na instalação.
ignore-scripts=true

# Impede instalação de pacotes via URL git (github:, git+ssh:, etc.).
# Mitiga dependências não imutáveis e fora do controle do registry npm.
allow-git=none
```

## O que cada regra faz

### `min-release-age=7`

- **Objetivo**: evitar instalar versões muito recentes que ainda não foram auditadas pela comunidade.
- **Comportamento**: o npm bloqueia pacotes publicados nos últimos 7 dias.
- **Trade-off**: patches de segurança legítimos também ficam bloqueados temporariamente.
- **Como contornar**: em casos pontuais, use `npm install <pacote>@<versão> --min-release-age=0`.

### `ignore-scripts=true`

- **Objetivo**: impedir que scripts de lifecycle (`preinstall`, `install`, `postinstall`, `prepare`) de dependências rodem durante `npm install`.
- **Comportamento**: o código dos scripts não é executado automaticamente, reduzindo o risco de códigos arbitrários.
- **Trade-off**: pacotes que precisam compilar binários nativos podem falhar.
- **Como contornar**: rode `node node_modules/<pacote>/script.js` manualmente se o script for confiável, ou use `npm_config_ignore_scripts=false` para uma instalação específica.

### `allow-git=none`

- **Objetivo**: bloquear dependências instaladas por URL git (`github:`, `git+ssh:`, `git+https:`).
- **Comportamento**: o npm aceita apenas pacotes do registry npm.
- **Trade-off**: dependências em forks privados ou repositórios git não podem ser instaladas diretamente.
- **Como contornar**: publique o pacote no registry interno ou use tarball específico.

## Por que isso importa

Ataques à cadeia de suprimento de software (supply chain) frequentemente exploram:

- Versões recém-publicadas com código malicioso.
- Scripts de instalação que executam código no ambiente do desenvolvedor.
- Dependências apontadas para repositórios git comprometidos.

Essas regras criam uma camada extra de defesa sem precisar de ferramentas adicionais.

## Veja também

- [Como contribuir](../../../CONTRIBUTING.md)
- [README](../../../README.md)
