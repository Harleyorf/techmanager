// app.js - Frontend Vanilla JS for TechManager
const API_BASE = 'http://localhost:3000'; // ajusta se necessário

/* ---------- Helpers ---------- */
const $ = sel => document.querySelector(sel);
const qs = sel => Array.from(document.querySelectorAll(sel));
const toast = msg => {
  const t = $('#toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(()=> t.style.display='none', 2500);
};

async function apiFetch(path, opts = {}) {
  const url = API_BASE + path;
  if (!opts.headers) opts.headers = {'Content-Type':'application/json'};
  if (opts.body && typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.status === 204 ? null : res.json();
}

/* ---------- UI/Tab logic ---------- */
function setActiveTab(id){
  qs('.view').forEach(v => v.classList.remove('visible'));
  $('#view-'+id).classList.add('visible');
  qs('nav button').forEach(b => b.classList.remove('active'));
  $('#tab-'+id).classList.add('active');
}
$('#tab-func').onclick = () => setActiveTab('func');
$('#tab-proj').onclick = () => setActiveTab('proj');
$('#tab-aloc').onclick = () => setActiveTab('aloc');

/* ---------- FUNCIONÁRIOS ---------- */
async function loadFuncionarios(){
  const tbody = $('#func-table tbody'); tbody.innerHTML = '<tr><td colspan="6">Carregando...</td></tr>';
  try {
    const list = await apiFetch('/api/funcionarios');
    if (!list.length) { tbody.innerHTML = '<tr><td colspan="6">Nenhum funcionário cadastrado.</td></tr>'; return; }
    tbody.innerHTML = '';
    list.forEach(f => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${f.id}</td>
        <td>${escapeHtml(f.nome)}</td>
        <td>${escapeHtml(f.cargo||'')}</td>
        <td>${escapeHtml(f.email||'')}</td>
        <td>${f.salario!=null?Number(f.salario).toFixed(2):''}</td>
        <td>
          <button data-id="${f.id}" class="edit-func">Editar</button>
          <button data-id="${f.id}" class="del-func">Excluir</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch(err){ tbody.innerHTML = `<tr><td colspan="6">Erro: ${err.message}</td></tr>`; }
}

function escapeHtml(s){ if (s==null) return ''; return String(s).replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }

$('#func-form').addEventListener('submit', async (e)=>{
  e.preventDefault();
  try {
    const id = $('#func-id').value;
    const payload = {
      nome: $('#func-nome').value.trim(),
      cargo: $('#func-cargo').value.trim(),
      email: $('#func-email').value.trim(),
      data_contratacao: $('#func-data').value || null,
      salario: $('#func-salario').value ? Number($('#func-salario').value) : null
    };
    if (!payload.nome) return toast('Nome é obrigatório');
    if (id) {
      await apiFetch(`/api/funcionarios/${id}`, { method: 'PUT', body: payload });
      toast('Funcionário atualizado');
    } else {
      await apiFetch('/api/funcionarios', { method: 'POST', body: payload });
      toast('Funcionário criado');
    }
    resetFuncForm();
    await initAll();
  } catch(err){ toast('Erro: ' + err.message); }
});

async function handleFuncTableClick(e){
  const t = e.target;
  if (t.classList.contains('edit-func')) {
    const id = t.dataset.id;
    try {
      const f = await apiFetch(`/api/funcionarios/${id}`);
      $('#func-id').value = f.id;
      $('#func-nome').value = f.nome;
      $('#func-cargo').value = f.cargo || '';
      $('#func-email').value = f.email || '';
      $('#func-data').value = f.data_contratacao || '';
      $('#func-salario').value = f.salario != null ? Number(f.salario) : '';
      $('#func-form-title').textContent = 'Editar Funcionário';
      setActiveTab('func');
    } catch(err){ toast(err.message); }
  } else if (t.classList.contains('del-func')) {
    const id = t.dataset.id;
    if (!confirm('Confirma exclusão do funcionário?')) return;
    try {
      await apiFetch(`/api/funcionarios/${id}`, { method: 'DELETE' });
      toast('Funcionário removido');
      await initAll();
    } catch(err){ toast('Erro: ' + err.message); }
  }
}
$('#func-table').addEventListener('click', handleFuncTableClick);
$('#func-cancel').onclick = resetFuncForm;
function resetFuncForm(){
  $('#func-id').value=''; $('#func-nome').value=''; $('#func-cargo').value=''; $('#func-email').value=''; $('#func-data').value=''; $('#func-salario').value='';
  $('#func-form-title').textContent = 'Cadastrar Funcionário';
}

/* ---------- PROJETOS ---------- */
async function loadProjetos(){
  const tbody = $('#proj-table tbody'); tbody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';
  try {
    const list = await apiFetch('/api/projetos');
    if (!list.length) { tbody.innerHTML = '<tr><td colspan="5">Nenhum projeto.</td></tr>'; return; }
    tbody.innerHTML = '';
    list.forEach(p => {
      const periodo = `${p.data_inicio||''} → ${p.data_prevista_termino||''}`;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${escapeHtml(p.nome)}</td>
        <td>${escapeHtml(p.status||'')}</td>
        <td>${periodo}</td>
        <td>
          <button data-id="${p.id}" class="view-aloc">Alocações</button>
          <button data-id="${p.id}" class="edit-proj">Editar</button>
          <button data-id="${p.id}" class="del-proj">Excluir</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch(err){ tbody.innerHTML = `<tr><td colspan="5">Erro: ${err.message}</td></tr>`; }
}

$('#proj-form').addEventListener('submit', async e=>{
  e.preventDefault();
  try {
    const id = $('#proj-id').value;
    const payload = {
      nome: $('#proj-nome').value.trim(),
      descricao: $('#proj-desc').value.trim(),
      data_inicio: $('#proj-data-inicio').value || null,
      data_prevista_termino: $('#proj-data-fim').value || null,
      status: $('#proj-status').value || 'Planejamento'
    };
    if (!payload.nome) return toast('Nome do projeto obrigatório');
    if (id) {
      await apiFetch(`/api/projetos/${id}`, { method: 'PUT', body: payload });
      toast('Projeto atualizado');
    } else {
      await apiFetch('/api/projetos', { method: 'POST', body: payload });
      toast('Projeto criado');
    }
    resetProjForm();
    await initAll();
  } catch(err){ toast('Erro: ' + err.message); }
});

$('#proj-table').addEventListener('click', async (e)=>{
  const t = e.target;
  if (t.classList.contains('edit-proj')) {
    const id = t.dataset.id;
    const p = await apiFetch(`/api/projetos/${id}`);
    $('#proj-id').value = p.id;
    $('#proj-nome').value = p.nome;
    $('#proj-desc').value = p.descricao || '';
    $('#proj-data-inicio').value = p.data_inicio || '';
    $('#proj-data-fim').value = p.data_prevista_termino || '';
    $('#proj-status').value = p.status || 'Planejamento';
    $('#proj-form-title').textContent = 'Editar Projeto';
    setActiveTab('proj');
  } else if (t.classList.contains('del-proj')) {
    const id = t.dataset.id;
    if (!confirm('Confirma exclusão do projeto?')) return;
    try {
      await apiFetch(`/api/projetos/${id}`, { method: 'DELETE' });
      toast('Projeto removido');
      await initAll();
    } catch(err){ toast('Erro: '+err.message); }
  } else if (t.classList.contains('view-aloc')) {
    const id = t.dataset.id;
    $('#aloc-filter-proj').value = id;
    await loadAlocacoesByProjeto(id);
    setActiveTab('aloc');
  }
});
$('#proj-cancel').onclick = resetProjForm;
function resetProjForm(){
  $('#proj-id').value=''; $('#proj-nome').value=''; $('#proj-desc').value=''; $('#proj-data-inicio').value=''; $('#proj-data-fim').value=''; $('#proj-status').value='Planejamento';
  $('#proj-form-title').textContent = 'Criar Projeto';
}

/* ---------- ALOCAÇÕES ---------- */
async function populateSelects(){
  // funcionarios
  const funcs = await apiFetch('/api/funcionarios');
  const funcSelect = $('#aloc-func'); funcSelect.innerHTML = '<option value="">-- selecione --</option>';
  const alocFilterProj = $('#aloc-filter-proj'); alocFilterProj.innerHTML = '<option value="">-- selecione --</option>';
  $('#aloc-proj').innerHTML = '<option value="">-- selecione --</option>';
  funcs.forEach(f => {
    const opt = document.createElement('option'); opt.value = f.id; opt.textContent = `${f.nome} (${f.cargo||''})`; funcSelect.appendChild(opt);
  });

  // projetos
  const projs = await apiFetch('/api/projetos');
  projs.forEach(p=>{
    const opt = document.createElement('option'); opt.value = p.id; opt.textContent = `${p.nome}`;
    $('#aloc-proj').appendChild(opt);
    const opt2 = opt.cloneNode(true);
    alocFilterProj.appendChild(opt2);
  });
}

$('#aloc-form').addEventListener('submit', async e=>{
  e.preventDefault();
  try {
    const funcionario_id = $('#aloc-func').value;
    const projeto_id = $('#aloc-proj').value;
    const data_alocacao = $('#aloc-data').value || null;
    const horas_trabalhadas = $('#aloc-horas').value ? Number($('#aloc-horas').value) : null;
    if (!funcionario_id || !projeto_id || !horas_trabalhadas) return toast('Preencha funcionário, projeto e horas.');
    const payload = { funcionario_id: Number(funcionario_id), projeto_id: Number(projeto_id), data_alocacao, horas_trabalhadas };
    await apiFetch('/api/alocacoes', { method: 'POST', body: payload });
    toast('Alocado com sucesso');
    $('#aloc-form').reset();
    await loadAlocacoesByProjeto(projeto_id);
    await initAll(); // refresh lists
  } catch(err){ toast('Erro: '+err.message); }
});

$('#aloc-filter-proj').addEventListener('change', async ()=>{
  const id = $('#aloc-filter-proj').value;
  if (!id) { $('#aloc-table tbody').innerHTML = ''; return; }
  await loadAlocacoesByProjeto(id);
});

async function loadAlocacoesByProjeto(projeto_id){
  const tbody = $('#aloc-table tbody'); tbody.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';
  try {
    const list = await apiFetch(`/api/projetos/${projeto_id}/alocacoes`);
    if (!list.length) { tbody.innerHTML = '<tr><td colspan="4">Nenhuma alocação.</td></tr>'; return; }
    tbody.innerHTML = '';
    list.forEach(a=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(a.funcionario_nome||a.funcionario?.nome||'')}</td>
        <td>${a.data_alocacao||''}</td>
        <td>${a.horas_trabalhadas}</td>
        <td>
          <button data-fid="${a.funcionario_id}" data-pid="${a.projeto_id}" class="edit-aloc">Editar</button>
          <button data-fid="${a.funcionario_id}" data-pid="${a.projeto_id}" class="del-aloc">Desalocar</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch(err){ tbody.innerHTML = `<tr><td colspan="4">Erro: ${err.message}</td></tr>`; }
}

$('#aloc-table').addEventListener('click', async (e)=>{
  const t = e.target;
  if (t.classList.contains('del-aloc')) {
    const funcionario_id = t.dataset.fid;
    const projeto_id = t.dataset.pid;
    if (!confirm('Deseja desalocar esse funcionário do projeto?')) return;
    try {
      await apiFetch(`/api/alocacoes?funcionario_id=${funcionario_id}&projeto_id=${projeto_id}`, { method: 'DELETE' });
      toast('Desalocado');
      const filter = $('#aloc-filter-proj').value || projeto_id;
      await loadAlocacoesByProjeto(filter);
      await initAll();
    } catch(err){ toast('Erro: '+err.message); }
  } else if (t.classList.contains('edit-aloc')) {
    // Simples edição inline de horas (prompt)
    const funcionario_id = t.dataset.fid;
    const projeto_id = t.dataset.pid;
    const novo = prompt('Digite novas horas semanais:');
    if (novo===null) return;
    const horas = Number(novo);
    if (!horas || horas<=0) return toast('Horas inválidas');
    try {
      await apiFetch('/api/alocacoes', { method: 'PUT', body: { funcionario_id: Number(funcionario_id), projeto_id: Number(projeto_id), horas_trabalhadas: horas }});
      toast('Alocação atualizada');
      const filter = $('#aloc-filter-proj').value || projeto_id;
      await loadAlocacoesByProjeto(filter);
      await initAll();
    } catch(err){ toast('Erro: '+err.message); }
  }
});

/* ---------- Init ---------- */
async function initAll(){
  try {
    await Promise.all([loadFuncionarios(), loadProjetos(), populateSelects()]);
  } catch(e){
    console.error(e);
  }
}

document.addEventListener('DOMContentLoaded', async ()=>{
  setActiveTab('func');
  await initAll();
});
