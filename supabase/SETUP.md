# Supabase — Guia de Setup (Sprint 1)

## Ordem de execução

### 1. Supabase Principal (projeto existente)

Execute nesta ordem no SQL Editor:

```
supabase/principal/migrations/001_modulos.sql
supabase/principal/migrations/002_jwt_hook.sql
```

Depois de rodar o 002:
- Vá em **Authentication → Hooks → Custom Access Token**
- Selecione a função `public.custom_access_token_hook`
- Salve

### 2. Supabase Events (projeto novo)

Criar novo projeto na mesma organização Supabase.

**CRÍTICO:** Copiar o JWT Secret do Principal para o Events:
- Principal: Settings → API → JWT Secret → copiar
- Events: Settings → API → JWT Secret → colar o mesmo valor

Execute as migrations em ordem:

```
001_tenants.sql
...
011_dispositivos.sql
012_eventos_slug.sql
013_perguntas_condicao.sql
```

(lista completa abaixo)
```
001_tenants.sql
002_usuarios.sql
003_participantes.sql
004_eventos.sql
005_subeventos.sql
006_tipos_ingresso.sql
007_perguntas_triagem.sql
008_inscricoes.sql
009_respostas_triagem.sql
010_checkins.sql
011_dispositivos.sql
```

### 3. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` em `artifacts/blumi-events-next/` e preencha:

| Variável | Onde pegar |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Events → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Events → Settings → API → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Events → Settings → API → service_role |
| `NEXT_PUBLIC_SUPABASE_PRINCIPAL_URL` | Principal → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PRINCIPAL_ANON_KEY` | Principal → Settings → API → anon/public |
| `SUPABASE_PRINCIPAL_SERVICE_ROLE_KEY` | Principal → Settings → API → service_role |

### 4. Rodar o app

```bash
cd artifacts/blumi-events-next
npm install
npm run dev
```

## O que o Sprint 10 entregou

### Migration adicional (Supabase Events)
```
supabase/events/migrations/016_sprint10.sql
```

- [x] **Tabela `visitas_subevento`** — registra cada visita a um subevento Modo B (checkin_livre); sem UNIQUE (permite múltiplas visitas); campos: subevento_id, inscricao_id, dispositivo_id, created_at; RLS por tenant
- [x] **Tabela `links_expositor`** — token único hex 40 chars, gerado via `gen_random_bytes`; campo `views` para contador; `ativo` para revogação; RLS por tenant
- [x] **`realizarCheckinModoB`** — server action para terminais Modo B; valida QR da inscrição pai; registra `visita_subevento`; sempre retorna `ok: true` (entrada livre, sem bloqueio de duplicata)
- [x] **Terminal atualizado** — recebe `modoInscricaoSubevento`; usa `realizarCheckinModoB` quando `checkin_livre`
- [x] **Painel de participantes por subevento** — botão chevron expande cada card de subevento; Modo A: lista inscricoes com status check-in + export CSV; Modo B: log de visitas com horário
- [x] **Link expositor no admin** — em cada subevento expandido: gerar link, copiar URL, ver views, regenerar, revogar
- [x] **Dashboard expositor** (`/expositor/[token]`) — página pública sem auth; Modo A: tabela de inscritos + presença + consolidado de triagem; Modo B: log de visitas com métricas únicas; incrementa views a cada acesso; design consistente com cor do tenant
- [x] **`buscarLinkAtivo`** — retornado na página de detalhe do evento; subeventos já recebem `link_ativo`, `inscricoes`, `visitas` enriquecidos pelo server

---

## O que o Sprint 8 entregou

### Migrations adicionais (Supabase Events)
```
supabase/events/migrations/014_certificados.sql
```

- [x] **Clone de evento** — botão "Clonar evento" em eventos encerrados; `lib/actions/clone.ts` copia nome, subeventos, perguntas (com mapeamento de condicionais), tipos de ingresso para novo rascunho; datas/inscrições/check-ins NÃO copiados; admin redirecionado para edição do rascunho
- [x] **Relatório pós-evento** — nova tab "Relatório" em todos os eventos; taxa de comparecimento com barra animada; breakdown por tipo de ingresso; distribuição de respostas de triagem (escolha única e múltipla) com barras CSS puras sem biblioteca externa
- [x] **Certificados digitais** — nova tab "Certificados" para admin configurar título + carga horária + toggle de emissão; página pública `/certificado/[qr_token]` sem auth; verifica `emitir_certificados=true` + check-in válido; design com fundo navy, nome do participante em brand-lime, botão imprimir/PDF; link "Ver certificado" aparece em Minha Área para participantes com check-in em eventos com certificado ativo
- [x] **Migration 014** — 3 colunas em `eventos`: `emitir_certificados`, `certificado_titulo`, `certificado_carga_horaria`

---

## O que o Sprint 7 entregou

### Migration adicional (Supabase Events)
```
supabase/events/migrations/013_perguntas_condicao.sql
```

- [x] **Modo offline** no terminal — baixa inscrições para IndexedDB ao iniciar; banner laranja quando offline; check-ins enfileirados localmente; sync automático ao reconectar; contador "N na fila" no header
- [x] **`lib/checkin-offline.ts`** — wrapper IndexedDB: stores `inscricoes` e `fila`, funções `salvarInscricoesOffline`, `buscarInscricaoLocal`, `marcarCheckinLocal`, `enfileirarCheckin`, `obterFilaPendente`, `marcarSincronizado`
- [x] **Server action `buscarInscricoesParaOffline`** — baixa lista de inscrições + status de check-in para o cliente
- [x] **Painel ao Vivo** `/admin/eventos/[id]/ao-vivo` — Supabase Realtime; feed em tempo real, métricas (presentes/inscritos/%), barra de progresso animada, breakdown por canal (USB/câmera/manual/admin); botão "Ao Vivo" com pulse no header (aparece quando evento publicado)
- [x] **Cancelar check-in (admin)** — botão ✕ em participantes presentes; modal com motivo obrigatório; `cancelarCheckin` atualizado (pega operador da sessão automaticamente, salva `cancelado_por/em/motivo`); estado local atualizado imediatamente sem reload
- [x] **Perguntas condicionais** — nova seção "Lógica condicional" no editor; pergunta pode depender da resposta de outra (escolha única ou múltipla); `ModalInscricao` avalia condições em tempo real; validação ignora perguntas não visíveis; badge visual "Condicional" na lista de perguntas

---

## O que o Sprint 6 entregou

- [x] Tab **Dispositivos** no detalhe do evento — criar dispositivo (fixo/móvel), vincular a subevento opcional, código de sessão 6 dígitos válido 24h, botão copiar, link direto para o terminal, renovar código, desativar
- [x] `/checkin` — tela de ativação: operador digita código → valida → entra no terminal
- [x] `/checkin/[codigo]` — terminal dark mode standalone:
  - **Modo USB** — input sempre focado, detecta código UUID (36 chars) enviado pelo leitor, processa instantaneamente
  - **Modo Câmera** — usa `BarcodeDetector` API nativa (Chrome 88+) com overlay de mira, pausa 2s após scan para evitar duplo
  - **Modo Manual** — busca por nome ou e-mail, botão de check-in direto
  - **Web Audio API** — beep diferente para sucesso (880Hz), duplo (440Hz) e erro (220Hz sawtooth)
  - **Contador em tempo real** de check-ins na sessão
  - **Monitor online/offline** via eventos do navegador
  - **Histórico** dos últimos 10 check-ins com status colorido
- [x] Server Action `realizarCheckin` — bloqueia duplo check-in (UNIQUE no banco), retorna tipo de resultado granular
- [x] Server Action `cancelarCheckin` — marca cancelado + insere correcao_admin (nunca deleta)
- [x] `buscarPorNomeOuEmail` — busca server-side para o modo manual

---

## O que o Sprint 5 entregou

- [x] Tab **Participantes** no detalhe do evento — métricas (inscritos/presentes/ausentes), tabela com busca + filtro por status check-in, responsiva
- [x] Tab **Ingressos** — CRUD de tipos de ingresso (VIP, Geral, Expositor…) com vagas opcionais
- [x] Badges de contagem em todas as tabs do detalhe
- [x] **Exportação CSV** com todas as regras técnicas da SPEC:
  - UTF-8 com BOM (`\uFEFF`) para Excel do Windows
  - Ordem: Data inscrição → Nome → E-mail → Tipo ingresso → Hora check-in → [Triagem...] → Compareceu
  - Hora check-in **vazia** para ausentes (não zero, não traço)
  - Múltipla escolha separada por `;` na mesma célula
- [x] `gerarCsvSubevento` — CSV separado por stand para feiras (Sprint 10 ready)
- [x] **Inscrição em massa** — modal com cola/importa lista de e-mails ou CSV, processa assincronamente:
  - Verifica se já tem conta no Principal
  - Se não tem: cria conta Blūmi (lead) + inscreve
  - Resultado detalhado: inscrito / já inscrito / conta criada / erro

---

## O que o Sprint 4 entregou

### Migration adicional (Supabase Events)
```
supabase/events/migrations/012_eventos_slug.sql
```

- [x] Campo `slug` em `eventos` — gerado automaticamente no `criarEvento` (nome + timestamp base36)
- [x] `/eventos` — catálogo completo: hero, busca full-text, filtros (tipo/cidade/empresa) com sync de URL via query params
- [x] `EventoCard` — capa com cor do tenant, badge tipo, badge "Por convite", botão contextual (Inscrever-se vs Ver evento vs Inscrito ✓)
- [x] `/eventos/[slug]` — página pública com hero colorido, info completa, cards de subeventos (modo A e B separados), sidebar de detalhes
- [x] `ModalInscricao` — 2 etapas: (1) validação de código de convite; (2) triagem com texto/escolha única/múltipla escolha
- [x] Inscrição automática em subeventos com `inscricao_automatica = true`
- [x] `/minha-area` — área do participante protegida, separada em próximos eventos e histórico
- [x] `InscricaoCard` — QR Code expansível (toggle) com canvas colorido em navy, status de check-in inline
- [x] `QrCode` — renderização canvas com `qrcode` (import dinâmico, não bloqueia SSR)

---

## O que o Sprint 3 entregou

- [x] Tenant provisioning automático no primeiro login (`ensureTenant`)
- [x] `/admin/eventos` — lista com agrupamento por status (publicado / rascunho / encerrado)
- [x] `/admin/eventos/novo` — formulário de criação (tipo, visibilidade, datas, vagas, convite)
- [x] `/admin/eventos/[id]` — detalhe com 3 tabs: Configurações | Triagem | Subeventos
- [x] Tab Configurações — edição inline; READ-ONLY se encerrado
- [x] Tab Triagem — CRUD inline de perguntas (texto, escolha única, múltipla escolha) com preview de opções
- [x] Tab Subeventos — só visível para feiras; CRUD com modo A (inscrição) e modo B (checkin_livre); tags visuais
- [x] Botões Publicar / Encerrar com confirmação; encerrado bloqueia todas as edições
- [x] Server Actions: `criarEvento`, `atualizarEvento`, `publicarEvento`, `encerrarEvento`, `criarPergunta`, `atualizarPergunta`, `deletarPergunta`, `criarSubevento`, `atualizarSubevento`, `deletarSubevento`

---

## O que o Sprint 2 entregou

### Migrations adicionais (Supabase Principal)

```
supabase/principal/migrations/003_super_admins.sql
supabase/principal/migrations/004_jwt_hook_v2.sql
```

Adicionar super-admins manualmente no SQL Editor:
```sql
INSERT INTO public.super_admins (user_id, nome)
VALUES ('uuid-do-usuario', 'Nome da Pessoa');
```

- [x] Tabela `super_admins` com RLS
- [x] JWT Hook v2 injeta `is_super_admin` no token
- [x] Middleware protege `/super-admin/*` por claim JWT
- [x] Painel `/super-admin` — lista empresas, toggle de módulos com atualização otimista
- [x] Server Action `toggleModulo` com validação de super-admin via service role
- [x] Layout admin com sidebar dinâmica (módulos visíveis = módulos ativos no JWT)
- [x] Painel `/admin/modulos` — empresa vê módulos ativos + cards de upsell

---

## O que o Sprint 1 entregou

- [x] Tabelas `modulos` + `company_modulos` com seeds (eventos, pesquisas, vagas)
- [x] JWT Hook que injeta `modulos_ativos` e `company_id` no token
- [x] 11 migrations do Supabase Events na ordem correta de FK
- [x] RLS configurado em todas as tabelas
- [x] Next.js 14 App Router scaffolado
- [x] Tailwind com identidade visual Blūmi (#314C5D, #DEFF66, Inter + Plus Jakarta Sans)
- [x] Clientes Supabase (browser + server + middleware)
- [x] `useModules()` hook — lê `modulos_ativos` do JWT
- [x] `middleware.ts` — protege rotas por módulo, redireciona para /sem-acesso
- [x] `ModuleGuard` — proteção client-side por componente
- [x] Navbar com identidade visual
- [x] Página /sem-acesso com visual correto
