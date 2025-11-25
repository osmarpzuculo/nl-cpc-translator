import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getUserTranslations, saveTranslation } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  translation: router({
    /**
     * Translate Natural Language to Classical Propositional Calculus
     */
    nlToCpc: protectedProcedure
      .input(z.object({
        text: z.string().min(1, "Texto não pode estar vazio"),
      }))
      .mutation(async ({ ctx, input }) => {
        const systemPrompt = `Você é um especialista em lógica proposicional clássica. Sua tarefa é traduzir frases em português para fórmulas do Cálculo Proposicional Clássico (CPC).

Conectivos lógicos disponíveis:
- ∧ (conjunção - "e")
- ∨ (disjunção - "ou")
- ¬ (negação - "não")
- → (implicação - "se... então", "implica")
- ↔ (bicondicional - "se e somente se")

Regras OBRIGATÓRIAS:
1. Identifique as proposições atômicas na frase
2. Atribua letras maiúsculas (P, Q, R, S, etc.) para cada proposição
3. Traduza a estrutura lógica usando os conectivos apropriados
4. SEMPRE inclua o objeto 'propositions' com TODAS as letras usadas na fórmula
5. Retorne APENAS um JSON válido com a estrutura especificada

Exemplos:
Input: "Se chover, então a grama ficará molhada."
Output: {"formula": "P → Q", "propositions": {"P": "chover", "Q": "a grama ficará molhada"}}

Input: "João vai ao cinema e Maria vai ao teatro."
Output: {"formula": "P ∧ Q", "propositions": {"P": "João vai ao cinema", "Q": "Maria vai ao teatro"}}

Input: "Se chover e fizer frio, então a aula será cancelada."
Output: {"formula": "(P ∧ Q) → R", "propositions": {"P": "chover", "Q": "fizer frio", "R": "a aula será cancelada"}}

Input: "Não está chovendo."
Output: {"formula": "¬P", "propositions": {"P": "está chovendo"}}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.text },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "cpc_translation",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  formula: {
                    type: "string",
                    description: "A fórmula lógica em CPC usando conectivos ∧, ∨, ¬, →, ↔"
                  },
                  propositions: {
                    type: "object",
                    description: "Mapeamento de cada letra proposicional para seu significado",
                    additionalProperties: {
                      type: "string"
                    }
                  }
                },
                required: ["formula", "propositions"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("Falha ao obter resposta do LLM");
        }

        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        const result = JSON.parse(contentStr);

        // Ensure propositions is not empty - extract from formula if needed
        if (!result.propositions || Object.keys(result.propositions).length === 0) {
          // Extract proposition letters from formula
          const letters = result.formula.match(/[A-Z]/g) || [];
          const uniqueLetters = Array.from(new Set(letters));
          result.propositions = Object.fromEntries(
            uniqueLetters.map(letter => [letter, `proposição ${letter}`])
          );
        }

        // Save to database
        await saveTranslation({
          userId: ctx.user.id,
          mode: "nl_to_cpc",
          input: input.text,
          output: result.formula,
          propositions: JSON.stringify(result.propositions),
        });

        return result;
      }),

    /**
     * Translate Classical Propositional Calculus to Natural Language
     */
    cpcToNl: protectedProcedure
      .input(z.object({
        formula: z.string().min(1, "Fórmula não pode estar vazia"),
        propositions: z.record(z.string(), z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const propositionsText = input.propositions
          ? `\n\nSignificado das proposições:\n${Object.entries(input.propositions)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n')}`
          : "";

        const systemPrompt = `Você é um especialista em lógica proposicional clássica. Sua tarefa é traduzir fórmulas do Cálculo Proposicional Clássico (CPC) para frases em português natural e fluente.

Conectivos lógicos:
- ∧ (conjunção) → "e"
- ∨ (disjunção) → "ou"
- ¬ (negação) → "não"
- → (implicação) → "se... então", "implica que"
- ↔ (bicondicional) → "se e somente se"

Regras OBRIGATÓRIAS:
1. Se o usuário fornecer significados para as proposições, use-os EXATAMENTE como fornecidos
2. Se não fornecer, crie significados coerentes e naturais
3. Traduza a estrutura lógica para uma frase fluente em português
4. A frase deve ser gramaticalmente correta e natural
5. SEMPRE inclua o objeto 'propositions' com TODAS as letras usadas na fórmula
6. Retorne APENAS um JSON válido com a estrutura especificada

Exemplos:
Input: P → Q (P: chover, Q: a grama ficará molhada)
Output: {"text": "Se chover, então a grama ficará molhada.", "propositions": {"P": "chover", "Q": "a grama ficará molhada"}}

Input: (P ∧ Q) → R
Output: {"text": "Se chover e fizer frio, então a aula será cancelada.", "propositions": {"P": "chover", "Q": "fizer frio", "R": "a aula será cancelada"}}

Input: ¬P ∨ Q
Output: {"text": "Ou não está chovendo, ou a grama está molhada.", "propositions": {"P": "está chovendo", "Q": "a grama está molhada"}}`;

        const userMessage = `Fórmula: ${input.formula}${propositionsText}`;

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
        if (!content) {
          throw new Error("Falha ao obter resposta do LLM");
        }

        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        const result = JSON.parse(contentStr);

        // Ensure propositions is not empty - use provided ones or extract from formula
        if (!result.propositions || Object.keys(result.propositions).length === 0) {
          if (input.propositions && Object.keys(input.propositions).length > 0) {
            result.propositions = input.propositions;
          } else {
            // Extract proposition letters from formula
            const letters = input.formula.match(/[A-Z]/g) || [];
            const uniqueLetters = Array.from(new Set(letters));
            result.propositions = Object.fromEntries(
              uniqueLetters.map(letter => [letter, `proposição ${letter}`])
            );
          }
        }

        // Save to database
        await saveTranslation({
          userId: ctx.user.id,
          mode: "cpc_to_nl",
          input: input.formula,
          output: result.text,
          propositions: JSON.stringify(result.propositions),
        });

        return result;
      }),

    /**
     * Get user's translation history
     */
    history: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
      }).optional())
      .query(async ({ ctx, input }) => {
        const limit = input?.limit ?? 50;
        const history = await getUserTranslations(ctx.user.id, limit);
        
        return history.map(item => ({
          ...item,
          propositions: item.propositions ? JSON.parse(item.propositions) : null,
        }));
      }),
  }),
});

export type AppRouter = typeof appRouter;
