<h1 align="center">🚀 TechManager</h1>

<p align="center">
  Sistema completo de gerenciamento de Funcionários, Projetos e Alocações,<br>
  desenvolvido em Node.js, MySQL e JavaScript puro.<br><br>
  <i>Projeto acadêmico transformado em aplicação real para portfólio profissional.</i>
</p>

---

## 🛠️ Tecnologias Utilizadas

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white&style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white&style=for-the-badge"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white&style=for-the-badge"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black&style=for-the-badge"/>
  <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white&style=for-the-badge"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white&style=for-the-badge"/>
</p>

---

## 📌 Sobre o Projeto

O **TechManager** é um sistema completo para gestão interna de equipes, permitindo controlar:

- Funcionários  
- Projetos  
- Alocações entre funcionários e projetos  
- Horas trabalhadas  
- Status automático do projeto  

Este projeto integra **banco de dados relacional**, **API REST**, **frontend funcional** e **lógica de negócios real**, incluindo uma **trigger SQL** que automatiza mudanças de status.

---

## 🏗️ Arquitetura da Aplicação

techmanager/
├── backend/
│ ├── server.js
│ ├── db.js
│ ├── routes/
│ ├── controllers/
│ └── package.json
│
├── frontend/
│ ├── index.html
│ ├── funcionarios.html
│ ├── projetos.html
│ ├── alocacoes.html
│ ├── styles.css
│ └── app.js
│
└── sql/
├── schema.sql
└── inserts.sql

yaml
Copiar código

---

## 🗄️ Banco de Dados

Modelagem baseada no relacionamento:

### 👤 **Funcionários (1) ↔ (N) Alocações (N) ↔ (1) Projetos**

### Tabelas

#### 📌 funcionarios  
- id (PK)  
- nome  
- cargo  
- email (único)  
- data_contratacao  
- salario  

#### 📌 projetos  
- id (PK)  
- nome  
- descricao  
- data_inicio  
- data_prevista_termino  
- status  

#### 📌 alocacoes  
- funcionario_id (FK)  
- projeto_id (FK)  
- data_alocacao  
- horas_trabalhadas  
> PK composta (funcionario_id, projeto_id)

---

## 🔥 Trigger de Negócio

Quando um funcionário é alocado pela **primeira vez** a um projeto:

➡️ O status muda automaticamente de **"Planejamento"** para **"Em Andamento"**.

```sql
CREATE TRIGGER trg_atualizar_status_projeto_auto
AFTER INSERT ON alocacoes
FOR EACH ROW
BEGIN
    IF (SELECT COUNT(*) FROM alocacoes WHERE projeto_id = NEW.projeto_id) = 1
    THEN
        UPDATE projetos
        SET status = 'Em Andamento'
        WHERE id = NEW.projeto_id AND status = 'Planejamento';
    END IF;
END;
⚙️ Backend (Node.js + Express)
A API REST inclui:

Funcionários
bash
Copiar código
GET    /api/funcionarios
POST   /api/funcionarios
PUT    /api/funcionarios/:id
DELETE /api/funcionarios/:id
Projetos
bash
Copiar código
GET    /api/projetos
POST   /api/projetos
PUT    /api/projetos/:id
DELETE /api/projetos/:id
Alocações
ruby
Copiar código
GET    /api/alocacoes
POST   /api/alocacoes
PUT    /api/alocacoes/:funcionario_id/:projeto_id
DELETE /api/alocacoes/:funcionario_id/:projeto_id
Conexão MySQL:

js
Copiar código
import mysql from "mysql2/promise";

export const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});
🎨 Frontend (HTML + CSS + JavaScript)
Recursos:

Formulários funcionais

CRUD completo

Atualizações dinâmicas via fetch()

Interface limpa e objetiva

📸 Screenshots do Sistema
Coloque suas imagens reais na pasta /screenshots do GitHub.
Aqui estão os prints que você me enviou.

👥 Funcionários

📁 Projetos

🔗 Alocações

▶️ Como Rodar o Projeto
1️⃣ Instalar dependências
bash
Copiar código
npm install
2️⃣ Arquivo .env
ini
Copiar código
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=techmanager
PORT=3000
3️⃣ Importar banco
pgsql
Copiar código
sql/schema.sql
4️⃣ Iniciar backend
bash
Copiar código
npm start
5️⃣ Abrir frontend
bash
Copiar código
frontend/funcionarios.html
frontend/projetos.html
frontend/alocacoes.html
📚 Aprendizados
Neste projeto, desenvolvi:

Modelagem de banco de dados

Relacionamentos N:N

Trigger SQL

Criação de API REST

Programação assíncrona

Manipulação de DOM

Integração frontend-backend

Organização de projeto full stack
