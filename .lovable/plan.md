# Entrar só com o número + passkey

Hoje o membro cria conta com número e senha. A proposta: o número passa a ser a única coisa digitada, e a confirmação de identidade é feita pelo passkey do aparelho (digital, Face ID ou PIN do celular/computador).

## Como fica para o membro

1. **Primeiro acesso**: digita o número (ex.: 07) e toca em "Criar meu acesso". O celular pede a digital/Face ID e guarda o passkey.
2. **Próximos acessos**: digita o número, toca em "Entrar", confirma com a digital — e cai direto no tesouro daquele número.
3. **Novo aparelho**: pode registrar um passkey adicional para o mesmo número, desde que já esteja logado em um aparelho antigo. Se perder todos os aparelhos, o responsável libera um novo cadastro (ver abaixo).

Nenhuma senha é digitada em nenhum momento.

## O que muda na área do responsável

- Na tabela, além de "Excluir", um botão **"Liberar novo passkey"**: apaga os passkeys daquele número para que a pessoa possa registrar o aparelho novo sem perder os registros já feitos.
- A entrada do responsável continua com a senha atual (não mexo nela agora).

## Pontos importantes antes de aprovar

- Passkey exige site em HTTPS — a versão publicada funciona; no preview do editor funciona no mesmo domínio.
- Aparelhos muito antigos podem não suportar. Nesse caso a tela mostra um aviso claro em vez de quebrar.
- Se alguém perder o aparelho e não tiver outro, só o responsável consegue liberar de novo. Isso é intencional: sem e-mail não existe recuperação automática.
- As contas com senha que já existem continuam válidas: na primeira entrada com senha o app oferece "cadastrar passkey neste aparelho". A tela de senha fica escondida atrás de um link "Entrar com senha (contas antigas)".

## Detalhes técnicos

- Biblioteca `@simplewebauthn/server` + `@simplewebauthn/browser` (compatíveis com o runtime de borda).
- Nova tabela `passkeys` (`numero`, `credential_id`, `public_key`, `counter`, `transports`, `user_id`) com RLS restrita — leitura/escrita só pelo servidor; e tabela curta `passkey_desafios` para os challenges (expiração de 5 min).
- Rotas de servidor em `src/routes/api/public/passkey/*`: `registro-opcoes`, `registro-verificar`, `login-opcoes`, `login-verificar`. Cada uma valida entrada com Zod e o challenge é sempre conferido no servidor.
- Após verificação bem-sucedida no login, o servidor gera um link de acesso pelo Auth Admin para o e-mail sintético `numero@tesouro.local` e devolve o `token_hash`; o cliente chama `verifyOtp` para abrir a sessão Supabase. O resto do app (RLS por `user_id`) continua igual, sem mudança nos registros.
- No cadastro, se o número ainda não tem conta, o servidor cria o usuário via Auth Admin (confirmado, com senha aleatória inacessível) e vincula o passkey.
- `src/lib/tesouro.ts` ganha `criarPasskey`, `entrarComPasskey`, mantendo `entrarComNumero` para as contas antigas.
- `AutenticacaoMembro.tsx` reescrita: campo de número + botões "Entrar" / "Criar meu acesso", detecção de suporte a WebAuthn e mensagens de erro em português.
- Nova função de servidor `resetarPasskeys` em `moderador.functions.ts`, protegida pela senha do responsável.
