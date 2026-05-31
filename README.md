# Do Zero ao Império

Jogo web de simulação de vida que mistura mecânicas de Cookie Clicker, The Sims e BitLife. Comece com pouco dinheiro aos 18 anos e construa seu império através de ações, eventos e upgrades.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Zustand (estado global)
- Framer Motion (animações)
- Lucide React (ícones)
- localStorage (salvamento automático)
- Supabase (auth e saves na nuvem — opcional)

## Como rodar

```bash
npm install
cp .env.example .env   # preencher credenciais Supabase (opcional)
npm run dev
```

Abra o endereço exibido no terminal (geralmente `http://localhost:5173`).

## Autenticação Supabase (produção)

Para confirmação de email e login funcionarem corretamente, configure no painel do Supabase:

**Authentication → URL Configuration**

| Campo | Valor |
|---|---|
| **Site URL** | `https://do-zero-ao-imperio.vercel.app` |
| **Redirect URLs** | `https://do-zero-ao-imperio.vercel.app/**` |
| | `http://localhost:5173/**` |
| | `http://localhost:5174/**` |

O código envia `emailRedirectTo` com `window.location.origin` no cadastro, então o link de confirmação aponta para o domínio de onde a conta foi criada (localhost em dev, Vercel em produção). Mesmo assim, a **Site URL** e as **Redirect URLs** precisam estar corretas no Supabase — caso contrário, links antigos ou fallback do painel podem redirecionar para `localhost`.

Variáveis de ambiente (`.env`):

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

Na Vercel, configure as mesmas variáveis em **Settings → Environment Variables**.

## Build para produção

```bash
npm run build
npm run preview
```

## Estrutura do projeto

```
src/
  components/     # UI (Header, painéis, modais)
  data/         # Ações, eventos e upgrades (fácil de expandir)
  store/        # Zustand store
  types/        # Tipos TypeScript
  utils/        # Lógica do jogo e persistência
```

## Como expandir

- **Novas ações:** `src/data/actions.ts`
- **Novos eventos:** `src/data/events.ts`
- **Novos upgrades:** `src/data/upgrades.ts`
- **Carreiras:** `src/data/careers.ts`
- **Moradias:** `src/data/housing.ts`
- **Negócios:** `src/data/businesses.ts`
- **Regras mensais:** `src/utils/monthlyLogic.ts`

## Mecânicas principais (v3)

- **Carreira:** 8 níveis, de Desempregado a Empresário, com requisitos e salários distintos
- **Moradia:** aluguel ou compra, bônus ao descansar, custos mensais
- **Despesas mensais:** alimentação, contas, aluguel/manutenção, saúde e lazer
- **Negócios:** renda passiva mensal com risco de problemas aleatórios
- **Patrimônio:** dinheiro + upgrades + imóveis comprados + negócios
- Eventos, consequências, burnout e salvamento automático
