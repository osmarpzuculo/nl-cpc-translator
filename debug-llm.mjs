import { invokeLLM } from "./server/_core/llm.ts";

const systemPrompt = `Você é um especialista em lógica proposicional clássica. Sua tarefa é traduzir fórmulas do Cálculo Proposicional Clássico (CPC) para frases em português natural e fluente.

Conectivos lógicos:
- ∧ (conjunção) → "e"
- ∨ (disjunção) → "ou"
- ¬ (negação) → "não"
- → (implicação) → "se... então", "implica que"
- ↔ (bicondicional) → "se e somente se"

Regras:
1. Se o usuário fornecer significados para as proposições, use-os
2. Se não fornecer, crie significados coerentes e naturais
3. Traduza a estrutura lógica para uma frase fluente em português
4. A frase deve ser gramaticalmente correta e natural
5. Retorne APENAS um JSON válido com a estrutura especificada

Exemplos:
Input: P → Q (P: chover, Q: a grama ficará molhada)
Output: {"text": "Se chover, então a grama ficará molhada.", "propositions": {"P": "chover", "Q": "a grama ficará molhada"}}

Input: (P ∧ Q) → R
Output: {"text": "Se chover e fizer frio, então a aula será cancelada.", "propositions": {"P": "chover", "Q": "fizer frio", "R": "a aula será cancelada"}}

Input: ¬P ∨ Q
Output: {"text": "Ou não está chovendo, ou a grama está molhada.", "propositions": {"P": "está chovendo", "Q": "a grama está molhada"}}`;

const userMessage = `Fórmula: P → Q

Significado das proposições:
P: chover
Q: a grama ficará molhada`;

const response = await invokeLLM({
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "nl_translation",
      strict: true,
      schema: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "A frase em português natural"
          },
          propositions: {
            type: "object",
            description: "Mapeamento de cada letra proposicional para seu significado",
            additionalProperties: {
              type: "string"
            }
          }
        },
        required: ["text", "propositions"],
        additionalProperties: false,
      },
    },
  },
});

const content = response.choices[0]?.message?.content;
console.log("Raw content:", content);
console.log("Type:", typeof content);

const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
const result = JSON.parse(contentStr);

console.log("\nParsed result:", JSON.stringify(result, null, 2));
