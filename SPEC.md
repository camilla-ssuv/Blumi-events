# Blūmi Events — Especificação Completa do Produto

> Este arquivo contém toda a especificação técnica e de produto da plataforma Blūmi Events.
> Leia integralmente antes de iniciar qualquer sprint ou história.

---

## 1. Visão do Produto — Plataforma Modular

A Blūmi não está construindo uma plataforma de eventos isolada. Está construindo um ecossistema modular onde cada cliente corporativo contrata os módulos que precisa. Eventos é o primeiro módulo, mas a arquitetura já deve suportar os próximos.

| Módulo | Status | Descrição |
|--------|--------|-----------|
| Eventos | Construindo agora | Catálogo, feiras, palestras, check-in, certificados, subeventos |
| Pesquisas | Em breve | Surveys proprietários, análise de dados, relatórios |
| Vagas | Em breve | Publicação de vagas, triagem, pipeline de candidatos |
| Talentos | Futuro | Banco de talentos, matching, shortlist |
| Analytics | Futuro | Dashboard executivo, benchmarks de mercado |

---

## 2. Auth Compartilhada — Dois Supabase

Empresas clientes (Nubank, BTG) e participantes já têm conta na Blūmi. A plataforma de eventos usa o mesmo login — sem criar novas contas ou senhas.

|  | Supabase Principal (já existe) | Supabase Events (novo) |
|--|-------------------------------|------------------------|
| Responsável | Identidade: empresas e participantes | Dados de eventos: inscrições, check-ins |
| Tabelas novas | modulos, company_modulos | 13 tabelas do modelo Events |
| Auth | Gera o JWT. Fonte da verdade. | Confia no JWT do Principal. |
| Regra de ouro | NÃO mexer nas tabelas existentes. | Nunca escrever no Supabase Principal. |

**Configuração JWT compartilhado:**
Supabase Events → Settings → API → JWT Secret → colar o mesmo secret do projeto Principal.
A partir daí, `auth.uid()` retorna o mesmo UUID em ambos os projetos. Nenhum login duplo para o usuário.

### 2.1 Fluxos de Auth

**Empresa já cliente:**
Logada no portal Blūmi principal → clica 'Gerenciar eventos' → JWT aceito automaticamente → company_id resolvido → painel admin isolado.

**Participante com conta Blūmi:**
Acessa landing page do evento → clica inscrever → já logado: inscrição direta, só preenche triagem.

**Participante SEM conta:**
Verifica e-mail no Supabase Principal → não existe → cria conta no Principal (não no Events) → vira lead Blūmi completo.

> **Benefício comercial:** todo participante que se inscreve e não tem conta Blūmi cria uma no processo. Entra no ecossistema completo — vagas, eventos, outros produtos. Aquisição de usuário embutida no fluxo de inscrição.

---

## 3. Feature Flags — Módulos por Cliente

A Blūmi super-admin ativa ou desativa módulos por cliente. O cliente nunca ativa sozinho. Toda navegação e proteção de rotas é baseada nesse sistema.

### 3.1 Tabela: modulos (Supabase Principal)

| Campo | Tipo | Flags | Descrição |
|-------|------|-------|-----------|
| id | uuid | PK | gen_random_uuid() |
| slug | text | NN, UQ | 'eventos' \| 'pesquisas' \| 'vagas' — chave usada no código |
| nome | text | NN | Nome exibido no painel |
| url_base | text | — | URL do módulo para montar o menu (ex: /eventos) |
| ativo | boolean | NN | Default true. False oculta globalmente. |

### 3.2 Tabela: company_modulos (Supabase Principal)

| Campo | Tipo | Flags | Descrição |
|-------|------|-------|-----------|
| id | uuid | PK | gen_random_uuid() |
| company_id | uuid | FK, NN, IDX | → companies.id |
| modulo_id | uuid | FK, NN | → modulos.id |
| ativo | boolean | NN | Default false. True = acesso liberado. |
| config | jsonb | — | Config por cliente: {"max_eventos": 10, "beta": true} |
| expira_em | timestamptz | — | null = sem expiração. Data = trial automático. |
| ativado_por | uuid | FK | → users.id do super-admin. Para auditoria comercial. |

### 3.3 JWT Hook — modulos_ativos no token

Criar Database Function no Supabase Principal e registrar em Authentication → Hooks → Custom Access Token:

```sql
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE company_id uuid; modulos text[];
BEGIN
  SELECT c.id INTO company_id FROM companies c
  JOIN company_users cu ON cu.company_id = c.id
  WHERE cu.user_id = (event->>'user_id')::uuid;

  SELECT array_agg(m.slug) INTO modulos
  FROM company_modulos cm JOIN modulos m ON m.id = cm.modulo_id
  WHERE cm.company_id = company_id AND cm.ativo = true
  AND (cm.expira_em IS NULL OR cm.expira_em > now());

  event := jsonb_set(event, '{claims,modulos_ativos}',
           to_jsonb(COALESCE(modulos, ARRAY[]::text[])));
  event := jsonb_set(event, '{claims,company_id}',
           to_jsonb(company_id::text));
  RETURN event;
END; $$;
```

### 3.4 Hook useModules (frontend)

```typescript
export function useModules() {
  const { session } = useSupabase();
  const claims = session?.access_token
    ? JSON.parse(atob(session.access_token.split('.')[1])) : {};
  const hasModule = (slug: string) =>
    (claims.modulos_ativos ?? []).includes(slug);
  return { hasModule };
}
```

### 3.5 Middleware de proteção de rotas

```typescript
const MODULE_ROUTES = {
  '/eventos': 'eventos', '/pesquisas': 'pesquisas', '/vagas': 'vagas'
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const required = Object.entries(MODULE_ROUTES)
    .find(([r]) => pathname.startsWith(r))?.[1];
  if (required) {
    const token = request.cookies.get('sb-access-token')?.value;
    const claims = token ? JSON.parse(atob(token.split('.')[1])) : {};
    if (!(claims.modulos_ativos ?? []).includes(required))
      return NextResponse.redirect(new URL('/sem-acesso', request.url));
  }
}
```

---

## 4. Catálogo Público de Eventos (/eventos)

Marketplace de todos os eventos da Blūmi. O participante descobre, filtra e escolhe onde se inscrever. É diferente de /minha-area (só os já inscritos).

### 4.1 Estrutura da tela
- Navbar #314C5D com logo, busca e botão entrar/avatar
- Hero section: título 'Encontre seu próximo evento' + barra de busca
- Barra de filtros: Tipo | Data | Cidade | Empresa — resultados em tempo real
- Grid 3 colunas desktop / 2 tablet / 1 mobile
- Estado vazio: skeleton cards durante loading, mensagem se sem resultados

### 4.2 Card de evento
- Capa colorida 180px com cor_primaria do tenant, logo da empresa centralizada
- Badge 'Por convite' se visibilidade = 'convite'
- Badge de tipo: FEIRA | PALESTRA | WORKSHOP
- Nome, empresa, data, cidade, contagem de subeventos se houver
- Vagas: verde > 50%, laranja < 20%, vermelho 'Últimas vagas!' < 10%
- Botão: 'Inscrever-se' (#DEFF66) se aberto / 'Ver evento' (outline) se convite / 'Inscrito ✓' se já inscrito

### 4.3 Visibilidade dos eventos

| Visibilidade | Comportamento no catálogo | Comportamento na landing |
|-------------|--------------------------|--------------------------|
| aberto | Card normal, botão Inscrever-se | Formulário de inscrição direto |
| convite | Card com badge, botão Ver evento | Pede código de convite antes do formulário |

### 4.4 Campos na tabela eventos
- **visibilidade:** text, NN — 'aberto' \| 'convite'. Default 'aberto'
- **codigo_convite:** text — código que o participante digita para acessar evento por convite

---

## 5. Modelo de Dados — Tabelas Completas

### 5.1 Supabase Principal — tabelas novas

| Tabela | Descrição |
|--------|-----------|
| modulos | Catálogo de módulos. Seeds: eventos, pesquisas, vagas. |
| company_modulos | Feature flags por cliente. Quem tem acesso a quê. |

### 5.2 Supabase Events — 13 tabelas (ordem de migration)

| # | Tabela | Observação crítica |
|---|--------|--------------------|
| 1 | tenants | external_company_id vincula ao companies.id do Principal |
| 2 | usuarios | Admins e operadores. NÃO participantes. |
| 3 | participantes | SEM tenant_id. Global. participante_id = auth.uid() do Principal. |
| 4 | eventos | Campo tipo: 'simples'\|'feira'. visibilidade: 'aberto'\|'convite'. status: 'rascunho'\|'publicado'\|'encerrado'. |
| 5 | subeventos | modo_inscricao: 'inscricao'\|'checkin_livre'. inscricao_automatica: boolean. |
| 6 | tipos_ingresso | Categorias de acesso por evento. |
| 7 | perguntas_triagem | Enunciado vira cabeçalho no CSV. |
| 8 | inscricoes | subevento_id nullable. qr_token UNIQUE. UNIQUE(participante_id, evento_id, subevento_id). |
| 9 | respostas_triagem | ON DELETE CASCADE de inscricoes. |
| 10 | checkins | UNIQUE em inscricao_id. Campo cancelado (nunca deletar). origem: camera\|usb\|manual\|correcao_admin. |
| 11 | dispositivos | codigo_sessao 6 dígitos. Válido 24h. subevento_id nullable. |

---

## 6. Subeventos — Resumo Executivo

Hierarquia: Tenant → Evento pai (feira) → Subevento (stand/palestra/workshop) → Inscrição

|  | Modo A: inscricao | Modo B: checkin_livre |
|--|-------------------|-----------------------|
| Exemplo | Workshop com vagas limitadas | Stand de expositor |
| QR usado | QR do subevento (diferente do pai) | QR do evento pai |
| Beep valida | Inscrição NESTE subevento | Inscrição no evento pai |
| Expositor | NÃO acessa a plataforma | NÃO acessa a plataforma |
| Dado gerado | Lista de presentes no subevento | Quem visitou o stand e quando |

- **inscricao_automatica:** se true, inscrever no pai inscreve automaticamente neste subevento. Para palestras obrigatórias.
- Expositor recebe relatório por e-mail ou CSV após o evento — nunca acessa o sistema.

---

## 7. Check-in e Dispositivos

### 7.1 Ativação por código de sessão
- Admin cria dispositivo: nome, tipo (fixo/móvel), subevento vinculado
- Sistema gera código 6 dígitos válido 24h
- Operador digita código no app → vincula ao subevento automaticamente
- Leitor quebrado: admin invalida, gera novo código, operador ativa substituto sem perda

### 7.2 Modo offline
- Ao abrir: baixa lista de inscrições + check-ins já feitos
- Internet cai: banner laranja. Check-ins em fila local (IndexedDB).
- Reconectou: sync automático. Conflito → banco mantém o primeiro por timestamp.

### 7.3 Regras de ouro
- NUNCA deletar check-in — campo cancelado = true com log de quem e quando
- Duplo check-in bloqueado pelo banco via UNIQUE em inscricao_id
- Correção: novo registro com origem = 'correcao_admin', original marcado cancelado

---

## 8. CSV — Regras Técnicas

Ordem obrigatória: Data/hora inscrição → Nome → E-mail → Tipo de ingresso → Hora check-in → [Triagem 1] → [Triagem N] → Compareceu

- **Encoding:** UTF-8 com BOM (\uFEFF). Sem BOM, Excel do Windows quebra acentos.
- **Hora check-in:** VAZIA para ausentes (não zero, não traço).
- **'Compareceu':** LEFT JOIN checkins — não armazenado no banco.
- **Múltipla escolha:** separada por ponto e vírgula na mesma célula.
- **Para feiras:** botão 'Baixar CSV por stand' gera arquivo separado por subevento.

---

## 9. Backlog — 55 Histórias em 10 Sprints

| Sprint | Foco | Pts | Destaques |
|--------|------|-----|-----------|
| S1 | Fundação + Feature Flags | 18 | Modulos, JWT Hook, middleware de rotas |
| S2 | Multi-tenant + Painel de Módulos | 15 | Super-admin de módulos + upsell |
| S3 | Eventos + Triagem + Subeventos (base) | 16 | Criar subeventos com modo A/B |
| S4 | Catálogo + Inscrição + Área do Participante | 19 | Marketplace de eventos + auth compartilhada |
| S5 | Gestão de Participantes + CSV + Massa | 16 | Inscrição em massa assíncrona |
| S6 | Check-in: câmera + USB + dispositivos | 17 | Códigos de sessão por dispositivo |
| S7 | Offline + Painel ao vivo + Triagem avançada | 15 | Correção de check-in com log de auditoria |
| S8 | Pós-evento: certificado + relatórios + CSV + Histórico admin | 19 | Clone de triagem + histórico admin |
| S9 | Estabilização e go-live | 8 | ZERO features novas — só stress test |
| S10 | Subeventos completos (feiras) + Dashboard expositor | 23 | Stands, modo A/B, CSV por stand, dashboard expositor via link |
| **Total** | | **166** | |

> **Sprint 9 é sagrado:** nenhuma feature nova entra nessa semana. Só testes, ajustes e stress test de 30 check-ins/min por 40 minutos.

---

## 9.1 História Detalhada — Sprint 8 (Histórico Admin)

**História:** Como admin, quero visualizar eventos encerrados, exportar seus dados e cloná-los como base para um novo evento.

**Sprint:** S8 — Pós-evento
**Pontos:** 3

**Critérios de aceite:**
1. Aba ou filtro 'Encerrados' no painel de eventos com acesso somente leitura
2. Visualização completa de inscrições, presença e respostas de triagem do evento encerrado
3. Download do CSV com todos os dados do evento encerrado
4. Botão 'Clonar evento' que gera rascunho com mesmas configurações (subeventos, triagem, tipo de ingresso), mas com datas, inscrições e check-ins zerados
5. Admin é redirecionado automaticamente para a tela de edição do rascunho após clonar
6. Evento original permanece imutável após clonagem

**Regra de integridade:** eventos encerrados são READ-ONLY. Nenhuma edição direta é permitida — apenas leitura, exportação e clonagem.

**Fluxo de clonagem:**
- Admin clica "Clonar evento" num evento encerrado
- Sistema cria rascunho copiando: nome, subeventos, perguntas de triagem, tipos de ingresso
- NÃO copia: inscrições, check-ins, respostas de triagem, datas
- Admin cai direto na tela de edição do rascunho para ajustar datas e publicar quando pronto

---

## 9.2 História Detalhada — Sprint 10 (Dashboard Expositor)

**História:** Como admin, quero gerar um link único por stand para que o expositor acesse seu dashboard sem login, com dados de inscritos, views, consolidado de triagem, filtro por dia e por tag.

**Sprint:** S10 — Subeventos completos (feiras)
**Pontos:** 5

**Critérios de aceite:**
1. Admin gera link único e seguro por stand (token de acesso sem login)
2. Link abre dashboard somente leitura com: total de inscritos, total de visualizações do stand, consolidado das respostas de triagem em gráficos simples
3. Filtro por dia do evento
4. Filtro por tag
5. Dados disponíveis desde a abertura das inscrições
6. Atualização em tempo real durante o evento
7. Dados finais acessíveis após encerramento do evento
8. Link pode ser revogado e regenerado pelo admin

**Decisão de MVP:** acesso via link compartilhado sem login. Login próprio para expositores é v2.

**Dependências:** infraestrutura de tempo real do Sprint 7. Subeventos/stands do Sprint 10 (construir na mesma semana).

---

## 10. Primeiros Passos — Antes do Sprint 1

> **Sessão técnica obrigatória:** o dev precisa de pelo menos 2 horas com quem conhece o Supabase Principal para mapear o schema de companies e users existente.

1. Receber acesso de leitura ao Supabase Principal — mapear companies e users
2. Criar projeto Supabase Events na mesma organização
3. Copiar JWT Secret do Principal para Events: Settings → API → JWT Secret
4. Criar tabelas modulos e company_modulos no Principal com seeds
5. Criar JWT Hook que injeta modulos_ativos no token
6. Criar as 11 migrations no Supabase Events na ordem da Seção 5
7. Criar repo blumi-events no GitHub e migrar código do Replit
8. Implementar middleware.ts de proteção de rotas por módulo
9. Corrigir identidade visual: #314C5D, #FBF7EB, Inter + Plus Jakarta Sans
10. Validar fluxo completo: catálogo → inscrição → QR → check-in → relatório

---

*Dúvidas sobre produto ou priorização: Projeto Blūmi Events no Claude (claude.ai)*
