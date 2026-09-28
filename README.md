# LinguaPersona

Sistema completo de aprendizado e conversação em inglês, alimentado por IA local e RAG vetorial.

## O que é

O **LinguaPersona** é uma aplicação PWA/Next.js que permite conversar com um professor de inglês virtual ("Alex" ou "Alexia"), escolher o sotaque (American English ou British English) e treinar inglês com feedback em tempo real. O diferencial é a arquitetura híbrida de inferência: modelos de linguagem rodam **diretamente no navegador** via WebLLM/WebGPU, com fallback para Ollama local ou APIs externas quando necessário.

## Principais recursos

- **Professor AI bilingue personalizável**: nome, gênero e sotaque ajustáveis pelo usuário.
- **Execução local no navegador**: WebLLM/WebGPU para privacidade e latência baixa.
- **Fallback inteligente**: Ollama local ou API externa quando o dispositivo não suporta WebGPU.
- **Memória e RAG vetorial**: SQLite vetorial armazena erros, vocabulário e regras gramaticais para respostas contextualizadas.
- **Entrada e saída de voz**: Web Speech API para prática de pronúncia e escuta.
- **Distribuição multiplataforma**: PWA, Android/iOS (Capacitor) e desktop (Tauri).

## Arquitetura de alto nível

```
┌─────────────────────────────────────────────┐
│  Next.js PWA / Capacitor / Tauri            │
│  - UI de chat, configuração e voz           │
├─────────────────────────────────────────────┤
│  Engine de Inferência                       │
│  - WebLLM (principal)                       │
│  - Fallback Ollama / OpenAI / Groq          │
├─────────────────────────────────────────────┤
│  RAG e Memória                              │
│  - SQLite vetorial                          │
│  - Embeddings no navegador (Transformers.js)│
├─────────────────────────────────────────────┤
│  Pedagogia                                  │
│  - System Prompts, US/UK, feedback sandwich │
└─────────────────────────────────────────────┘
```

## Documentação

- [Visão geral da arquitetura](docs/pt/arquitetura.md)
- [Motor de inferência](docs/pt/motor-de-inferencia.md)
- [RAG e memória](docs/pt/rag-e-memoria.md)
- [Pedagogia e prompts](docs/pt/pedagogia-e-prompts.md)
- [Voz e áudio](docs/pt/voz-e-audio.md)
- [Gênero do agente](docs/pt/genero-do-agente.md)
- [PWA e distribuição](docs/pt/pwa-e-distribuicao.md)
- [Modelos locais](docs/pt/modelos-locais.md)
- [Professor virtual](docs/pt/professor-virtual.md)
- [Pesquisa vetorial local](docs/pt/pesquisa-vetorial-local.md)
- [Configuração do `.npmrc`](docs/pt/npmrc.md)
- [Assinatura SSH para commits](docs/pt/assinatura-ssh.md)
- [Como contribuir](CONTRIBUTING.md)

Para a versão em inglês, veja [README.en.md](README.en.md) e [docs/en/](docs/en/).

## Stack tecnológico

- **Framework**: [Next.js 16](https://nextjs.org) com App Router e TypeScript
- **Estilização**: Tailwind CSS v4
- **Testes**: Jest + React Testing Library
- **LLM local**: [@mlc-ai/web-llm](https://github.com/mlc-ai/web-llm)
- **Banco de dados**: SQLite com extensão vetorial (sqlite-vec)
- **Embeddings**: Transformers.js (Xenova/all-MiniLM-L6-v2)
- **Voz**: Web Speech API
- **Distribuição mobile**: Capacitor
- **Distribuição desktop**: Tauri

## Scripts disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Gera build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Roda ESLint
npm run test         # Roda testes com Jest
npm run format       # Formata o projeto com Prettier
npm run format:check # Verifica formatação
```

## Licença

Ainda a ser definida.
