# Login com número + senha OU passkey

Manter o login atual (número + senha) e adicionar o passkey como forma alternativa de entrar, opcional para cada membro.

## Como fica para o membro

1. Tela de entrada: campo do número e senha, com o botão "Entrar com passkey" logo abaixo.
2. Quem já tem conta continua entrando normalmente com a senha.
3. Depois de entrar, aparece na grade um botão "Ativar passkey neste aparelho" (biometria/PIN do celular). A partir daí, nas próximas vezes basta digitar o número e tocar em "Entrar com passkey".
4. A senha continua valendo sempre como reserva — se o membro trocar de celular e perder o passkey, entra com a senha e ativa o passkey de novo.

## Área do responsável

- Sem mudança de fluxo; a exclusão de um número passa a remover também os passkeys daquele número.

## Detalhes técnicos

- Biblioteca `@simplewebauthn/browser` (cliente) e `@simplewebauthn/server` (servidor).
- Novas tabelas no banco:
  - `passkeys`: `user_id`, `numero`, `credential_id`, `public_key`, `counter`, `transports`; leitura/escrita apenas do próprio usuário.
  - `passkey_desafios`: desafio temporário por número, com expiração curta; acesso só pelo servidor.
- Rotas de servidor em `src/routes/api/public/passkey/*`: gerar desafio de cadastro, verificar cadastro, gerar desafio de login, verificar login. A verificação de login emite uma sessão para o usuário correspondente (via Auth Admin), então o app continua usando a mesma sessão de hoje e as mesmas regras de acesso aos registros.
- `src/lib/tesouro.ts`: novas funções `ativarPasskey()` e `entrarComPasskey(numero)`, mantendo `criarConta` e `entrarComNumero` intactas.
- `AutenticacaoMembro.tsx`: acrescenta o botão de passkey (escondido quando o aparelho não suporta WebAuthn).
- `GradeRegistro.tsx`: botão para ativar passkey no aparelho atual.
- `moderador.functions.ts`: `excluirMembro` também apaga os passkeys do número.
