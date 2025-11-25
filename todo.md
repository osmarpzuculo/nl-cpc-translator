# TODO - Tradutor NL ↔ CPC

## Funcionalidades Principais

### Backend
- [x] Implementar endpoint tRPC para tradução NL → CPC
- [x] Implementar endpoint tRPC para tradução CPC → NL
- [x] Integrar LLM (invokeLLM) para processamento de linguagem natural
- [x] Criar sistema de mapeamento de proposições (P, Q, R, etc.)
- [x] Implementar validação de fórmulas lógicas
- [x] Criar schema de banco de dados para histórico de traduções

### Frontend
- [x] Criar interface para Modo 1 (NL → CPC)
- [x] Criar interface para Modo 2 (CPC → NL)
- [x] Implementar botões para inserir conectivos lógicos (∧, ∨, ¬, →, ↔)
- [x] Criar sistema de definição/sugestão de proposições
- [x] Implementar visualização de histórico de traduções
- [x] Adicionar exemplos e tutoriais interativos
- [x] Criar design responsivo e intuitivo

### Testes
- [x] Escrever testes unitários para tradução NL → CPC
- [x] Escrever testes unitários para tradução CPC → NL
- [x] Testar casos complexos com múltiplos conectivos
- [x] Testar casos com negação
- [x] Validar precisão das traduções

#### Documentação
- [x] Criar README.md com arquitetura do sistema
- [x] Documentar estratégia de tradução (regras, LLM, mapeamento)
- [x] Incluir exemplos de input/output com análise
- [x] Discutir limitações e possibilidades de melhoriaria
- [x] Criar diagramas de arquitetura
