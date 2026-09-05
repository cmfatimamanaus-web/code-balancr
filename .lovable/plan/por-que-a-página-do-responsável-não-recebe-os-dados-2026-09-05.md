# Por que a página do responsável não recebe os dados

## O que eu verifiquei

- **Os dados existem e estão íntegros.** A tabela de registros tem 14 lançamentos (agosto e setembro de 2026), com número, mês/ano e devoções — inclusive registros recentes de 1, 2 e 3 de setembro.
- **A leitura do consolidado está correta.** A função que o painel do responsável usa consulta exatamente o formato de mês/ano que os membros gravam.
- **O problema não é de senha, nem de banco, nem de permissão.**

## A causa real

A página do app **não fica interativa** no preview. Abri o app num navegador de teste: o conteúdo aparece (ele vem pronto do servidor), mas nenhum botão funciona — cliquei em "Sou responsável — ver consolidado" e nada acontece, a tela de senha nunca abre. Ou seja, o responsável nem chega ao consolidado; não é que os dados não cheguem, é que a tela nunca é aberta.

A razão: o servidor de desenvolvimento não terminou de preparar os arquivos de bibliotecas que o navegador precisa baixar. Mais de 20 desses pedidos ficam pendentes para sempre (a pasta de cache dessas bibliotecas está vazia), então o app trava antes de "acordar" no navegador. Nenhum erro é exibido — por isso parece simplesmente que "parou de funcionar".

## O que fazer

1. Limpar o cache de bibliotecas do ambiente e reiniciar o servidor de preview, forçando a preparação completa.
2. Reabrir o app num navegador de teste e confirmar que os botões respondem (a tela de senha do responsável abre).
3. Entrar como responsável e confirmar que o consolidado lista os membros de setembro/2026 com os totais, e que as abas de gráficos carregam.
4. Entrar como membro em um número existente e confirmar que o registro dele aparece e salva.
5. Se depois da limpeza algum módulo continuar travando, identificar a biblioteca específica que trava a preparação (candidatas: gráficos e passkey) e declará-la explicitamente na configuração de build para que seja pré-preparada.

## Detalhes técnicos

- `node_modules/.vite/deps` está vazio; dezenas de requisições a `/node_modules/.vite/deps/*` ficam em pending, com hashes `?v=` divergentes entre si, sinal de optimizeDeps interrompido/incoerente.
- Nenhum `pageerror`, `unhandledrejection` ou resposta 4xx/5xx no carregamento; `$_TSR.hydrated` permanece indefinido enquanto `streamEnded` é true — confirma falha de hidratação por módulos não entregues, não erro de runtime da aplicação.
- Correção: remover `node_modules/.vite`, reiniciar o daemon vite e revalidar; se necessário, `optimizeDeps.include` para `recharts` e `@simplewebauthn/browser`.
- Nenhuma alteração de esquema, dados ou lógica de negócio está prevista.
