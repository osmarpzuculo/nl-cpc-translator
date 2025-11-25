import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface LogicSymbol {
  symbol: string;
  name: string;
  description: string;
}

const LOGIC_SYMBOLS: LogicSymbol[] = [
  { symbol: "∧", name: "E (Conjunção)", description: "P ∧ Q" },
  { symbol: "∨", name: "OU (Disjunção)", description: "P ∨ Q" },
  { symbol: "¬", name: "NÃO (Negação)", description: "¬P" },
  { symbol: "→", name: "IMPLICA", description: "P → Q" },
  { symbol: "↔", name: "SE E SOMENTE SE", description: "P ↔ Q" },
  { symbol: "(", name: "Parêntese Esquerdo", description: "(" },
  { symbol: ")", name: "Parêntese Direito", description: ")" },
];

interface TranslatorCardProps {
  mode: "nl_to_cpc" | "cpc_to_nl";
  onTranslate: (input: string, propositions?: Record<string, string>) => Promise<void>;
  isLoading: boolean;
  result: {
    formula?: string;
    text?: string;
    propositions?: Record<string, string>;
  } | null;
}

export function TranslatorCard({ mode, onTranslate, isLoading, result }: TranslatorCardProps) {
  const [input, setInput] = useState("");
  const [propositions, setPropositions] = useState<Record<string, string>>({});

  const isNlToCpc = mode === "nl_to_cpc";

  const handleSubmit = async () => {
    if (!input.trim()) return;
    await onTranslate(input, isNlToCpc ? undefined : propositions);
  };

  const insertSymbol = (symbol: string) => {
    setInput(prev => prev + symbol);
  };

  const handlePropositionChange = (key: string, value: string) => {
    setPropositions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {isNlToCpc ? "🔤 Linguagem Natural → 🔣 CPC" : "🔣 CPC → 🔤 Linguagem Natural"}
        </CardTitle>
        <CardDescription>
          {isNlToCpc
            ? "Digite uma frase em português e converta para lógica proposicional"
            : "Digite uma fórmula lógica e converta para português"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Area */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {isNlToCpc ? "Frase em Português" : "Fórmula Lógica"}
          </label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isNlToCpc
                ? "Ex: Se chover, então a grama ficará molhada."
                : "Ex: (P ∧ Q) → R"
            }
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Logic Symbols Buttons (only for CPC to NL mode) */}
        {!isNlToCpc && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Conectivos Lógicos</label>
            <div className="flex flex-wrap gap-2">
              {LOGIC_SYMBOLS.map((sym) => (
                <Button
                  key={sym.symbol}
                  variant="outline"
                  size="sm"
                  onClick={() => insertSymbol(sym.symbol)}
                  className="font-mono text-lg"
                  title={sym.description}
                >
                  {sym.symbol}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Propositions Input (only for CPC to NL mode) */}
        {!isNlToCpc && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Definir Proposições (Opcional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {["P", "Q", "R", "S"].map((letter) => (
                <div key={letter} className="flex items-center gap-2">
                  <span className="font-mono font-bold w-6">{letter}:</span>
                  <input
                    type="text"
                    value={propositions[letter] || ""}
                    onChange={(e) => handlePropositionChange(letter, e.target.value)}
                    placeholder={`Significado de ${letter}`}
                    className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Translate Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !input.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traduzindo...
            </>
          ) : (
            "Traduzir"
          )}
        </Button>

        {/* Result Display */}
        {result && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
            <div className="font-semibold text-primary">Resultado:</div>
            
            {isNlToCpc ? (
              <>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Fórmula Lógica:</div>
                  <div className="font-mono text-xl font-bold">{result.formula}</div>
                </div>
                
                {result.propositions && Object.keys(result.propositions).length > 0 && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Proposições:</div>
                    <div className="space-y-1">
                      {Object.entries(result.propositions).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-mono font-bold">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Frase em Português:</div>
                  <div className="text-lg">{result.text}</div>
                </div>
                
                {result.propositions && Object.keys(result.propositions).length > 0 && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Proposições Utilizadas:</div>
                    <div className="space-y-1">
                      {Object.entries(result.propositions).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-mono font-bold">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
