/**
 * TechManager - Express + MySQL backend
 * Usage:
 *  - copy .env.example to .env and set DB credentials
 *  - npm install
 *  - npm start
 */

const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

/* ---------- FUNCIONARIOS ---------- */
app.get('/api/funcionarios', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM funcionarios ORDER BY id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/funcionarios/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM funcionarios WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Funcionário não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/funcionarios', async (req, res) => {
  try {
    const { nome, cargo, email, data_contratacao, salario } = req.body;
    const [result] = await db.query(
      'INSERT INTO funcionarios (nome,cargo,email,data_contratacao,salario) VALUES (?,?,?,?,?)',
      [nome, cargo, email, data_contratacao, salario]
    );
    const [rows] = await db.query('SELECT * FROM funcionarios WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/funcionarios/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { nome, cargo, email, data_contratacao, salario } = req.body;
    await db.query(
      'UPDATE funcionarios SET nome=?, cargo=?, email=?, data_contratacao=?, salario=? WHERE id=?',
      [nome, cargo, email, data_contratacao, salario, id]
    );
    const [rows] = await db.query('SELECT * FROM funcionarios WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/funcionarios/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM funcionarios WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ---------- PROJETOS ---------- */
app.get('/api/projetos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM projetos ORDER BY id');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/projetos/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM projetos WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Projeto não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/projetos', async (req, res) => {
  try {
    const { nome, descricao, data_inicio, data_prevista_termino, status } = req.body;
    const [result] = await db.query(
      'INSERT INTO projetos (nome,descricao,data_inicio,data_prevista_termino,status) VALUES (?,?,?,?,?)',
      [nome, descricao, data_inicio, data_prevista_termino, status]
    );
    const [rows] = await db.query('SELECT * FROM projetos WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/projetos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { nome, descricao, data_inicio, data_prevista_termino, status } = req.body;
    await db.query(
      'UPDATE projetos SET nome=?, descricao=?, data_inicio=?, data_prevista_termino=?, status=? WHERE id=?',
      [nome, descricao, data_inicio, data_prevista_termino, status, id]
    );
    const [rows] = await db.query('SELECT * FROM projetos WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/projetos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM projetos WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ---------- ALOCAÇÕES ---------- */
app.post('/api/alocacoes', async (req, res) => {
  try {
    const { funcionario_id, projeto_id, data_alocacao, horas_trabalhadas } = req.body;
    await db.query(
      'INSERT INTO alocacoes (funcionario_id, projeto_id, data_alocacao, horas_trabalhadas) VALUES (?,?,?,?)',
      [funcionario_id, projeto_id, data_alocacao, horas_trabalhadas]
    );
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update alocacao (only horas_trabalhadas supported)
app.put('/api/alocacoes', async (req, res) => {
  try {
    const { funcionario_id, projeto_id, horas_trabalhadas } = req.body;
    await db.query(
      'UPDATE alocacoes SET horas_trabalhadas = ? WHERE funcionario_id = ? AND projeto_id = ?',
      [horas_trabalhadas, funcionario_id, projeto_id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/alocacoes', async (req, res) => {
  try {
    const { funcionario_id, projeto_id } = req.query;
    await db.query('DELETE FROM alocacoes WHERE funcionario_id = ? AND projeto_id = ?', [funcionario_id, projeto_id]);
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// list alocacoes by projeto (with funcionario info)
app.get('/api/projetos/:id/alocacoes', async (req, res) => {
  try {
    const projeto_id = req.params.id;
    const [rows] = await db.query(
      `SELECT a.funcionario_id, a.projeto_id, a.data_alocacao, a.horas_trabalhadas,
              f.nome as funcionario_nome, f.cargo as funcionario_cargo, f.email as funcionario_email
       FROM alocacoes a
       JOIN funcionarios f ON f.id = a.funcionario_id
       WHERE a.projeto_id = ?`,
      [projeto_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server running on port', PORT));
