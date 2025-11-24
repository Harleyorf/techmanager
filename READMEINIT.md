# TechManager - Backend + Frontend (Node.js + MySQL)

## O que tem aqui
- Backend em Node.js (Express) com rotas REST para `funcionarios`, `projetos` e `alocacoes`.
- Frontend em Vanilla JS.
- Script SQL para criar o banco (`sql/schema.sql`).
- Arquivos para facilitar execução local.

## Como rodar
1. Instale Node.js (v16+).
2. Importe o script `sql/schema.sql` no seu MySQL (por exemplo via Workbench ou `mysql < sql/schema.sql`).
3. Copie `.env.example` para `.env` e ajuste as credenciais do MySQL.
4. No diretório do projeto:
   ```bash
   npm install
   npm start
   ```
5. Abra o frontend `frontend/index.html` no navegador. Se o frontend não se conectar, ajuste `API_BASE` em `frontend/app.js` para `http://localhost:3000`.

## Notas
- A trigger `trg_atualizar_status_projeto_auto` está no script SQL.
- Se precisar que eu gere um arquivo .zip com tudo (este mesmo), já está pronto neste pacote.
