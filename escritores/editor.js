(() => {
  const CHAVE = 'readeriso:historia';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- Estado ----------
  const padrao = {
    titulo: 'Minha grande aventura',
    descricao: 'Uma aventura cheia de mistérios e descobertas.',
    genero: 'Fantasia',
    publicada: false,
    ativo: 0,
    capitulos: [
      { titulo: 'O começo', texto: '' },
      { titulo: 'A descoberta', texto: '' },
      { titulo: 'O caminho', texto: '' },
    ],
  };

  let estado;
  try { estado = JSON.parse(localStorage.getItem(CHAVE)) || padrao; } catch { estado = padrao; }

  // ---------- Elementos ----------
  const editor = $('#textoCapitulo');
  const inputTitulo = $('#tituloCapitulo');
  const listaCaps = $('.lista-capitulos');
  const rotuloCap = $('.cabecalho-capitulo span');
  const contador = $('.informacoes-editor span:first-child');
  const statusSalv = $('.status-salvamento');

  // Se o HTML ainda tiver <textarea>, troca por uma div editável (necessário para negrito, itálico etc.)
  if (editor.tagName === 'TEXTAREA') {
    const div = document.createElement('div');
    div.id = editor.id;
    div.className = 'texto-editavel';
    div.contentEditable = 'true';
    div.dataset.placeholder = editor.placeholder;
    editor.replaceWith(div);
  }
  const texto = $('#textoCapitulo');

  // CSS mínimo para a barra de ferramentas e a área editável funcionarem mesmo sem mexer no editor.css
  const estiloEditor = document.createElement('style');
  estiloEditor.textContent = `
    #textoCapitulo { display:block; width:100%; min-height:320px; padding:1rem; outline:none; overflow-y:auto; white-space:pre-wrap; word-break:break-word; cursor:text; }
    #textoCapitulo:empty::before { content:attr(data-placeholder); color:#999; pointer-events:none; }
    #textoCapitulo h2 { font-size:1.5rem; margin:1rem 0 .5rem; }
    #textoCapitulo blockquote { border-left:4px solid #bbb; margin:1rem 0; padding:.25rem 1rem; color:#555; font-style:italic; }
    #textoCapitulo ul { padding-left:1.5rem; }
    .barra-ferramentas button { cursor:pointer; user-select:none; }
    .barra-ferramentas button.active { background:#d0d7ff !important; border-color:#6c7bff !important; }
  `;
  document.head.appendChild(estiloEditor);
  document.execCommand('defaultParagraphSeparator', false, 'p');

  // ---------- Status / contador ----------
  const marcarNaoSalvo = () => {
    statusSalv.textContent = '● Alterações não salvas';
    statusSalv.style.color = '';
  };
  const marcarSalvo = () => {
    statusSalv.textContent = '✓ Rascunho salvo';
    statusSalv.style.color = 'green';
  };
  const atualizarContador = () => {
    const t = texto.innerText.trim();
    const n = t ? t.split(/\s+/).length : 0;
    contador.textContent = `${n} ${n === 1 ? 'palavra' : 'palavras'}`;
  };

  // ---------- Capítulos ----------
  const capAtual = () => estado.capitulos[estado.ativo];

  function guardarCapituloAtual() {
    capAtual().titulo = inputTitulo.value.trim() || 'Sem título';
    capAtual().texto = texto.innerHTML;
  }

  function renderLista() {
    listaCaps.innerHTML = estado.capitulos.map((c, i) => `
      <button type="button" class="capitulo ${i === estado.ativo ? 'ativo' : ''}" data-i="${i}">
        <span>Capítulo ${i + 1}</span>
        <small>${esc(c.titulo)}</small>
      </button>`).join('');
  }

  function carregarCapitulo() {
    const c = capAtual();
    rotuloCap.textContent = `Capítulo ${estado.ativo + 1}`;
    inputTitulo.value = c.titulo;
    texto.innerHTML = c.texto;
    renderLista();
    atualizarContador();
    atualizarBotoesFormato();
  }

  function selecionarCapitulo(i) {
    if (i === estado.ativo) return;
    guardarCapituloAtual();
    estado.ativo = i;
    carregarCapitulo();
  }

  function novoCapitulo() {
    guardarCapituloAtual();
    estado.capitulos.push({ titulo: 'Novo capítulo', texto: '' });
    estado.ativo = estado.capitulos.length - 1;
    carregarCapitulo();
    marcarNaoSalvo();
    inputTitulo.focus();
    inputTitulo.select();
    listaCaps.lastElementChild.scrollIntoView({ block: 'nearest' });
  }

  listaCaps.addEventListener('click', (e) => {
    const b = e.target.closest('.capitulo');
    if (b) selecionarCapitulo(Number(b.dataset.i));
  });
  $('.btn-adicionar').addEventListener('click', novoCapitulo);
  $('.btn-novo-capitulo').addEventListener('click', novoCapitulo);

  inputTitulo.addEventListener('input', () => {
    const small = $('.capitulo.ativo small');
    if (small) small.textContent = inputTitulo.value || 'Sem título';
    marcarNaoSalvo();
  });

  // ---------- Barra de ferramentas ----------
  const comandos = {
    'Negrito': () => document.execCommand('bold'),
    'Itálico': () => document.execCommand('italic'),
    'Sublinhado': () => document.execCommand('underline'),
    'Título': () => alternarBloco('h2'),
    'Lista': () => document.execCommand('insertUnorderedList'),
    'Citação': () => alternarBloco('blockquote'),
    'Alinhar à esquerda': () => document.execCommand('justifyLeft'),
    'Centralizar': () => document.execCommand('justifyCenter'),
    'Alinhar à direita': () => document.execCommand('justifyRight'),
  };
  const estados = {
    'Negrito': 'bold', 'Itálico': 'italic', 'Sublinhado': 'underline',
    'Lista': 'insertUnorderedList', 'Alinhar à esquerda': 'justifyLeft',
    'Centralizar': 'justifyCenter', 'Alinhar à direita': 'justifyRight',
  };

  function alternarBloco(tag) {
    const atual = (document.queryCommandValue('formatBlock') || '').toLowerCase();
    document.execCommand('formatBlock', false, atual === tag ? 'p' : tag);
  }

  function atualizarBotoesFormato() {
    $$('.barra-ferramentas button').forEach((b) => {
      const t = b.title;
      let ativo = false;
      try {
        if (estados[t]) ativo = document.queryCommandState(estados[t]);
        else if (t === 'Título') ativo = document.queryCommandValue('formatBlock').toLowerCase() === 'h2';
        else if (t === 'Citação') ativo = document.queryCommandValue('formatBlock').toLowerCase() === 'blockquote';
      } catch { /* ignora */ }
      b.classList.toggle('active', !!ativo);
    });
  }

  // Atualiza os botões sempre que o cursor/seleção mudar dentro do editor
  document.addEventListener('selectionchange', () => {
    const sel = window.getSelection();
    if (sel.rangeCount && texto.contains(sel.anchorNode)) atualizarBotoesFormato();
  });

  $$('.barra-ferramentas button').forEach((b) => {
    // mousedown + preventDefault mantém a seleção do texto
    b.addEventListener('mousedown', (e) => e.preventDefault());
    b.addEventListener('click', () => {
      texto.focus();
      comandos[b.title]?.();
      atualizarBotoesFormato();
      atualizarContador();
      marcarNaoSalvo();
    });
  });

  texto.addEventListener('input', () => {
    if (!texto.innerText.trim() && !texto.querySelector('li')) texto.innerHTML = '';
    atualizarContador();
    marcarNaoSalvo();
  });
  ['keyup', 'mouseup', 'focus'].forEach((ev) => texto.addEventListener(ev, atualizarBotoesFormato));

  // Atalhos: Ctrl+S salva
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      salvar();
    }
  });

  // ---------- Salvar ----------
  function salvar() {
    guardarCapituloAtual();
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
      marcarSalvo();
      return true;
    } catch {
      statusSalv.textContent = '⚠ Não foi possível salvar';
      statusSalv.style.color = 'red';
      return false;
    }
  }
  $('.btn-salvar').addEventListener('click', salvar);

  // ---------- Modal (Bootstrap) ----------
  function abrirModal({ titulo, corpo, botoes = [], grande = false }) {
    const el = document.createElement('div');
    el.className = 'modal fade';
    el.tabIndex = -1;
    el.innerHTML = `
      <div class="modal-dialog ${grande ? 'modal-lg modal-dialog-scrollable' : ''}">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${esc(titulo)}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">${corpo}</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
            ${botoes.map((b, i) => `<button type="button" class="btn ${b.classe || 'btn-primary'}" data-acao="${i}">${esc(b.texto)}</button>`).join('')}
          </div>
        </div>
      </div>`;
    document.body.appendChild(el);
    const modal = new bootstrap.Modal(el);
    el.addEventListener('hidden.bs.modal', () => { modal.dispose(); el.remove(); });
    el.addEventListener('click', (e) => {
      const a = e.target.closest('[data-acao]');
      if (a) botoes[a.dataset.acao].acao(el, modal);
    });
    modal.show();
    return el;
  }

  // ---------- Visualizar ----------
  $('.btn-visualizar').addEventListener('click', () => {
    guardarCapituloAtual();
    const c = capAtual();
    const html = c.texto.trim()
      ? c.texto
      : '<p class="text-muted">Este capítulo ainda está vazio.</p>';
    abrirModal({
      titulo: `${estado.titulo} — Capítulo ${estado.ativo + 1}`,
      grande: true,
      corpo: `<h2 class="mb-4">${esc(c.titulo)}</h2><article>${html}</article>`,
    });
  });

  // ---------- Publicar ----------
  const etiquetaStatus = () => $('.etiquetas span:nth-child(2)');

  function atualizarEtiquetas() {
    $('.dados-historia h1').textContent = estado.titulo;
    $('.dados-historia > p').textContent = estado.descricao;
    $('.etiquetas span:nth-child(1)').textContent = estado.genero;
    etiquetaStatus().textContent = estado.publicada ? 'Publicada' : 'Rascunho';
    $('.btn-publicar').textContent = estado.publicada ? 'Despublicar' : 'Publicar';
  }

  $('.btn-publicar').addEventListener('click', () => {
    guardarCapituloAtual();
    if (estado.publicada) {
      abrirModal({
        titulo: 'Despublicar história',
        corpo: '<p>A história voltará a ser um rascunho e deixará de ficar visível para os leitores.</p>',
        botoes: [{ texto: 'Despublicar', classe: 'btn-danger', acao: (el, m) => { estado.publicada = false; salvar(); atualizarEtiquetas(); m.hide(); } }],
      });
      return;
    }
    const vazios = estado.capitulos.filter((c) => !c.texto.replace(/<[^>]*>/g, '').trim()).length;
    if (vazios === estado.capitulos.length) {
      abrirModal({ titulo: 'Não é possível publicar', corpo: '<p>Escreva pelo menos um capítulo antes de publicar.</p>' });
      return;
    }
    abrirModal({
      titulo: 'Publicar história',
      corpo: `<p>Publicar <strong>${esc(estado.titulo)}</strong> com ${estado.capitulos.length} capítulo(s)?</p>
              ${vazios ? `<p class="text-warning mb-0">Atenção: ${vazios} capítulo(s) estão vazios.</p>` : ''}`,
      botoes: [{ texto: 'Publicar', classe: 'btn-success', acao: (el, m) => { estado.publicada = true; salvar(); atualizarEtiquetas(); m.hide(); } }],
    });
  });

  // ---------- Configurações ----------
  $('.btn-configuracoes').addEventListener('click', () => {
    const generos = ['Fantasia', 'Romance', 'Ficção científica', 'Terror', 'Mistério', 'Aventura', 'Drama', 'Outro'];
    if (!generos.includes(estado.genero)) generos.push(estado.genero);
    abrirModal({
      titulo: 'Configurações da história',
      corpo: `
        <div class="mb-3">
          <label class="form-label" for="cfgTitulo">Título</label>
          <input class="form-control" id="cfgTitulo" value="${esc(estado.titulo)}">
        </div>
        <div class="mb-3">
          <label class="form-label" for="cfgDescricao">Descrição</label>
          <textarea class="form-control" id="cfgDescricao" rows="3">${esc(estado.descricao)}</textarea>
        </div>
        <div class="mb-3">
          <label class="form-label" for="cfgGenero">Gênero</label>
          <select class="form-select" id="cfgGenero">
            ${generos.map((g) => `<option ${g === estado.genero ? 'selected' : ''}>${esc(g)}</option>`).join('')}
          </select>
        </div>
        <button type="button" class="btn btn-outline-danger btn-sm" data-acao="1">Apagar capítulo atual</button>`,
      botoes: [
        {
          texto: 'Salvar',
          acao: (el, m) => {
            estado.titulo = $('#cfgTitulo', el).value.trim() || 'Sem título';
            estado.descricao = $('#cfgDescricao', el).value.trim();
            estado.genero = $('#cfgGenero', el).value;
            atualizarEtiquetas();
            salvar();
            m.hide();
          },
        },
        {
          texto: 'Apagar capítulo',
          classe: 'd-none',
          acao: (el, m) => {
            if (estado.capitulos.length === 1) { alert('A história precisa ter pelo menos um capítulo.'); return; }
            if (!confirm('Apagar o capítulo atual? Esta ação não pode ser desfeita.')) return;
            estado.capitulos.splice(estado.ativo, 1);
            estado.ativo = Math.max(0, estado.ativo - 1);
            carregarCapitulo();
            salvar();
            m.hide();
          },
        },
      ],
    });
  });

  // ---------- Início ----------
  atualizarEtiquetas();
  carregarCapitulo();
  if (localStorage.getItem(CHAVE)) marcarSalvo();
  window.addEventListener('beforeunload', (e) => {
    if (statusSalv.textContent.includes('não salvas')) { e.preventDefault(); e.returnValue = ''; }
  });
})();