import { useAuth } from "@/_core/hooks/useAuth";
import { TranslatorCard } from "@/components/TranslatorCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, Brain, History, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [nlToCpcResult, setNlToCpcResult] = useState<any>(null);
  const [cpcToNlResult, setCpcToNlResult] = useState<any>(null);

  const nlToCpcMutation = trpc.translation.nlToCpc.useMutation({
    onSuccess: (data) => {
      setNlToCpcResult(data);
      toast.success("Tradução concluída!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const cpcToNlMutation = trpc.translation.cpcToNl.useMutation({
    onSuccess: (data) => {
      setCpcToNlResult(data);
      toast.success("Tradução concluída!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleNlToCpc = async (text: string) => {
    setNlToCpcResult(null);
    await nlToCpcMutation.mutateAsync({ text });
  };

  const handleCpcToNl = async (formula: string, propositions?: Record<string, string>) => {
    setCpcToNlResult(null);
    const filteredPropositions = propositions
      ? Object.fromEntries(
          Object.entries(propositions).filter(([_, value]) => value.trim() !== "")
        )
      : undefined;
    
    await cpcToNlMutation.mutateAsync({
      formula,
      propositions: Object.keys(filteredPropositions || {}).length > 0 ? filteredPropositions : undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
              <Brain className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {APP_TITLE}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Agente de IA para tradução bidirecional entre Linguagem Natural (português) e
              Cálculo Proposicional Clássico
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔤</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Modo 1: NL → CPC</h3>
                  <p className="text-muted-foreground text-sm">
                    Converta frases em português para fórmulas lógicas do Cálculo Proposicional
                    Clássico com identificação automática de proposições.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔣</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Modo 2: CPC → NL</h3>
                  <p className="text-muted-foreground text-sm">
                    Traduza fórmulas lógicas para frases coerentes em português, com suporte a
                    definição personalizada de proposições.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Conectivos */}
          <div className="max-w-3xl mx-auto mb-12 bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Conectivos Lógicos Suportados
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { symbol: "∧", name: "Conjunção (E)" },
                { symbol: "∨", name: "Disjunção (OU)" },
                { symbol: "¬", name: "Negação (NÃO)" },
                { symbol: "→", name: "Implicação" },
                { symbol: "↔", name: "Bicondicional" },
              ].map((item) => (
                <div key={item.symbol} className="flex items-center gap-3">
                  <span className="font-mono text-2xl font-bold text-primary">{item.symbol}</span>
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button size="lg" asChild className="text-lg px-8">
              <a href={getLoginUrl()}>
                Começar a Traduzir
              </a>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Faça login para acessar o tradutor e salvar seu histórico
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
              <p className="text-sm text-muted-foreground">Olá, {user?.name || "Usuário"}!</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => logout()} size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="nl-to-cpc" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="nl-to-cpc">NL → CPC</TabsTrigger>
            <TabsTrigger value="cpc-to-nl">CPC → NL</TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nl-to-cpc" className="max-w-3xl mx-auto">
            <TranslatorCard
              mode="nl_to_cpc"
              onTranslate={handleNlToCpc}
              isLoading={nlToCpcMutation.isPending}
              result={nlToCpcResult}
            />
          </TabsContent>

          <TabsContent value="cpc-to-nl" className="max-w-3xl mx-auto">
            <TranslatorCard
              mode="cpc_to_nl"
              onTranslate={handleCpcToNl}
              isLoading={cpcToNlMutation.isPending}
              result={cpcToNlResult}
            />
          </TabsContent>

          <TabsContent value="history" className="max-w-4xl mx-auto">
            <HistoryTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function HistoryTab() {
  const { data: history, isLoading } = trpc.translation.history.useQuery();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Carregando histórico...</p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-xl">
        <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhuma tradução realizada ainda.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Suas traduções aparecerão aqui automaticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div key={item.id} className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {item.mode === "nl_to_cpc" ? "🔤 → 🔣" : "🔣 → 🔤"}
              </span>
              <span className="text-sm font-medium">
                {item.mode === "nl_to_cpc" ? "NL → CPC" : "CPC → NL"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleString("pt-BR")}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Entrada:</div>
              <div className="font-mono text-sm bg-muted p-3 rounded">{item.input}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Saída:</div>
              <div className="font-mono text-sm bg-muted p-3 rounded">{item.output}</div>
            </div>

            {item.propositions && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Proposições:</div>
                <div className="bg-muted p-3 rounded space-y-1">
                  {Object.entries(item.propositions).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-mono font-bold">{key}:</span> {value as string}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
