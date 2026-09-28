# Gênero do agente

O módulo de gênero gerencia a identidade do professor. A alteração entre "professor" e "professora" impacta o **System Prompt**, a concordância gramatical e as saudações.

## Tipos

```ts
type AgentGender = "male" | "female";

interface AgentConfig {
  gender: AgentGender;
  name: string; // ex.: "Alex" ou "Alexia"
  targetLanguage: string; // idioma lecionado
}
```

## PromptBuilder

O `PromptBuilder` recebe `AgentConfig` e gera o System Prompt ajustado ao gênero:

- Identidade: "You are Alex, a friendly professor..." ou "You are Alexia, a friendly teacher..."
- Concordância: adjetivos e pronomes auto-referenciais no feminino quando aplicável.
- Tom: amigável, paciente e encorajador, respeitando a persona escolhida.

## Estado e persistência

O estado é mantido em um hook/store no cliente:

- Lê a preferência salva em `localStorage` na inicialização.
- Atualiza o state global quando o usuário muda o gênero.
- Persista a escolha imediatamente.
- Propaga a nova configuração para o engine de inferência na próxima interação.

## Interface

A UI deve conter:

- Botões de alternância: "Professor" | "Professora".
- Nome do agente ativo.
- Feedback visual da seleção atual.

## Fluxo

1. Carrega a configuração salva ou usa o padrão (`male`, nome "Alex").
2. Usuário seleciona o gênero desejado.
3. State é atualizado e persistido em `localStorage`.
4. `PromptBuilder` gera o novo System Prompt.
5. A próxima chamada ao motor de LLM usa o prompt atualizado.

## Veja também

- [Pedagogia e prompts](pedagogia-e-prompts.md)
- [Motor de inferência](motor-de-inferencia.md)
