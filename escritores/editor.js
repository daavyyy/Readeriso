/* editor.js - página "Editor"
   Abre o livro indicado em editor.html?id=..., edita capítulos,
   salva, visualiza e publica/despublica (muda de "Rascunhos" para "Publicados" no escritor). */
(() => {
  const R = window.Readeriso;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (t) =>
    String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
 
  // ---------- Carrega o livro ----------
  const id = new URLSearchParams(window.location.search).get('id');
  const estado = id ? R.obter(id) : null;
 
  if (!estado) {
    window.location.replace('escritor.html');
    return;
  }
  if (!Array.isArray(estado.capitulos) || !estado.capitulos.length) {
    estado.capitulos = [{ titulo: 'Capítulo 1', texto: '' }];
  }
  estado.ativo = Math.min(Math.max(0, estado.ativo || 0), estado.capitulos.length - 1);
 
  // ---------- Elementos ----------
  const texto = $('#textoCapitulo');
  const inputTitulo = $('#tituloCapitulo');
  const listaCaps = $('.lista-capitulos');
  const rotuloCap = $('.cabecalho-capitulo > span');
  const contador = $('.informacoes-editor span:first-child');
  const statusSalv = $('.status-salvamento');
 
  document.execCommand('defaultParagraphSeparator', false, 'p');
 
  // ---------- Status / contador ----------
  let sujo = false;
  let timerAuto = null;
 
  const marcarNaoSalvo = () => {
    sujo = true;
    statusSalv.textContent = '● Alterações não salvas';
    statusSalv.className = 'status-salvamento';
    clearTimeout(timerAuto);
    timerAuto = setTimeout(salvar, 3000); // salva sozinho após 3s sem digitar
  };
 
  const marcarSalvo = () => {
    sujo = false;
    statusSalv.textContent = '✓ Rascunho salvo';
    statusSalv.className = 'status-salvamento salvo';
  };
 
  const atualizarContador = () => {
    const t = texto.innerText.trim();
    const n = t ? t.split(/\s+/).length : 0;
    contador.textContent = `${n} ${n === 1 ? 'palavra' : 'palavras'}`;
  };
 
  // ---------- Informações do topo ----------
  function atualizarEtiquetas() {
    $('.dados-historia h1').textContent = estado.titulo;
    $('.dados-historia > p').textContent = estado.descricao || 'Sem descrição.';
    $('.etiquetas span:nth-child(1)').textContent = estado.genero;
    $('.etiquetas span:nth-child(2)').textContent = estado.publicada ? 'Publicada' : 'Rascunho';
    $('.btn-publicar').textContent = estado.publicada ? 'Despublicar' : 'Publicar';
    document.title = `${estado.titulo} - Editor - Readeriso`;
  }
 
  // ---------- Capítulos ----------
  const capAtual = () => estado.capitulos[estado.ativo];
 
  function guardarCapituloAtual() {
    capAtual().titulo = inputTitulo.value.trim() || 'Sem título';
    capAtual().texto = texto.innerHTML;
  }
 
  function renderLista() {
    listaCaps.innerHTML = estado.capitulos
      .map(
        (c, i) => `
      <button type="button" class="capitulo ${i === estado.ativo ? 'ativo' : ''}" data-i="${i}">
        <span>Capítulo ${i + 1}</span>
        <small>${esc(c.titulo)}</small>
      </button>`
      )
      .join('');
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
  function alternarBloco(tag) {
    const atual = (document.queryCommandValue('formatBlock') || '').toLowerCase();
    document.execCommand('formatBlock', false, atual === tag ? 'p' : tag);
  }
 
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
    'Negrito': 'bold',
    'Itálico': 'italic',
    'Sublinhado': 'underline',
    'Lista': 'insertUnorderedList',
    'Alinhar à esquerda': 'justifyLeft',
    'Centralizar': 'justifyCenter',
    'Alinhar à direita': 'justifyRight',
  };
 
  function atualizarBotoesFormato() {
    $$('.barra-ferramentas button').forEach((b) => {
      const t = b.title;
      let ativo = false;
      try {
        if (estados[t]) ativo = document.queryCommandState(estados[t]);
        else if (t === 'Título') ativo = document.queryCommandValue('formatBlock').toLowerCase() === 'h2';
        else if (t === 'Citação') ativo = document.queryCommandValue('formatBlock').toLowerCase() === 'blockquote';
      } catch {
        /* ignora */
      }
      b.classList.toggle('active', !!ativo);
    });
  }
 
  document.addEventListener('selectionchange', () => {
    const sel = window.getSelection();
    if (sel.rangeCount && texto.contains(sel.anchorNode)) atualizarBotoesFormato();
  });
 
  $$('.barra-ferramentas button').forEach((b) => {
    b.addEventListener('mousedown', (e) => e.preventDefault()); // mantém a seleção do texto
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
 
  // Colar sempre como texto puro (evita trazer estilos de outros sites)
  texto.addEventListener('paste', (e) => {
    e.preventDefault();
    const puro = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, puro);
  });
 
  ['keyup', 'mouseup', 'focus'].forEach((ev) => texto.addEventListener(ev, atualizarBotoesFormato));
 
  // Ctrl+S salva
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      salvar();
    }
  });
 
  // ---------- Salvar ----------
  function salvar() {
    clearTimeout(timerAuto);
    guardarCapituloAtual();
    if (R.salvar(estado)) {
      marcarSalvo();
      return true;
    }
    statusSalv.textContent = '⚠ Não foi possível salvar';
    statusSalv.className = 'status-salvamento erro';
    return false;
  }
  $('.btn-salvar').addEventListener('click', salvar);
 
  window.addEventListener('beforeunload', () => {
    if (sujo) salvar();
  });
 
  // ---------- Modal (Bootstrap) ----------
  function abrirModal({ titulo, corpo, botoes = [], grande = false }) {
    const el = document.createElement('div');
    el.className = 'modal fade';
    el.tabIndex = -1;
    el.innerHTML = `
      <div class="modal-dialog modal-dialog-centered ${grande ? 'modal-lg modal-dialog-scrollable' : ''}">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${esc(titulo)}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">${corpo}</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
            ${botoes
              .map((b, i) => `<button type="button" class="btn ${b.classe || 'btn-primary'}" data-acao="${i}">${esc(b.texto)}</button>`)
              .join('')}
          </div>
        </div>
      </div>`;
    document.body.appendChild(el);
    const modal = new bootstrap.Modal(el);
    el.addEventListener('hidden.bs.modal', () => {
      modal.dispose();
      el.remove();
    });
    el.addEventListener('click', (e) => {
      const a = e.target.closest('[data-acao]');
      if (a) botoes[a.dataset.acao].acao(el, modal);
    });
    modal.show();
    return { el, modal };
  }
 
  // ---------- Visualizar ----------
  $('.btn-visualizar').addEventListener('click', () => {
    guardarCapituloAtual();
    const c = capAtual();
    const html = c.texto.trim() ? c.texto : '<p class="text-secondary">Este capítulo ainda está vazio.</p>';
    abrirModal({
      titulo: `${estado.titulo} — Capítulo ${estado.ativo + 1}`,
      grande: true,
      corpo: `<h2 class="mb-4">${esc(c.titulo)}</h2><article>${html}</article>`,
    });
  });
 
  // ---------- Publicar / Despublicar ----------
  $('.btn-publicar').addEventListener('click', () => {
    guardarCapituloAtual();
 
    if (estado.publicada) {
      abrirModal({
        titulo: 'Despublicar história',
        corpo: '<p>A história voltará a ser um rascunho e deixará de ficar visível para os leitores.</p>',
        botoes: [
          {
            texto: 'Despublicar',
            classe: 'btn-danger',
            acao: (el, m) => {
              estado.publicada = false;
              salvar();
              atualizarEtiquetas();
              m.hide();
            },
          },
        ],
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
      botoes: [
        {
          texto: 'Publicar',
          classe: 'btn-success',
          acao: (el, m) => {
            estado.publicada = true;
            salvar();
            atualizarEtiquetas();
            m.hide();
          },
        },
      ],
    });
  });
 
  // ---------- Configurações ----------
  $('.btn-configuracoes').addEventListener('click', () => {
    const generos = Object.values(R.GENEROS);
    if (!generos.includes(estado.genero)) generos.push(estado.genero);
 
    const { el, modal } = abrirModal({
      titulo: 'Configurações da história',
      corpo: `
        <div class="mb-3">
          <label class="form-label" for="cfgTitulo">Título</label>
          <input class="form-control" id="cfgTitulo" maxlength="80" value="${esc(estado.titulo)}">
        </div>
        <div class="mb-3">
          <label class="form-label" for="cfgDescricao">Descrição</label>
          <textarea class="form-control" id="cfgDescricao" rows="3" maxlength="500">${esc(estado.descricao)}</textarea>
        </div>
        <div class="mb-4">
          <label class="form-label" for="cfgGenero">Gênero</label>
          <select class="form-select" id="cfgGenero">
            ${generos.map((g) => `<option ${g === estado.genero ? 'selected' : ''}>${esc(g)}</option>`).join('')}
          </select>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <button type="button" class="btn btn-outline-danger btn-sm" id="btnApagarCap">Apagar capítulo atual</button>
          <button type="button" class="btn btn-outline-danger btn-sm" id="btnApagarHistoria">Apagar história</button>
        </div>`,
      botoes: [
        {
          texto: 'Salvar',
          acao: (elm, m) => {
            estado.titulo = $('#cfgTitulo', elm).value.trim() || 'Sem título';
            estado.descricao = $('#cfgDescricao', elm).value.trim();
            estado.genero = $('#cfgGenero', elm).value;
            atualizarEtiquetas();
            salvar();
            m.hide();
          },
        },
      ],
    });
 
    $('#btnApagarCap', el).addEventListener('click', () => {
      if (estado.capitulos.length === 1) {
        alert('A história precisa ter pelo menos um capítulo.');
        return;
      }
      if (!confirm('Apagar o capítulo atual? Esta ação não pode ser desfeita.')) return;
      estado.capitulos.splice(estado.ativo, 1);
      estado.ativo = Math.max(0, estado.ativo - 1);
      carregarCapitulo();
      salvar();
      modal.hide();
    });
 
    $('#btnApagarHistoria', el).addEventListener('click', () => {
      if (!confirm('Apagar a história inteira? Esta ação não pode ser desfeita.')) return;
      sujo = false;
      clearTimeout(timerAuto);
      R.excluir(estado.id);
      window.location.href = 'escritor.html';
    });
  });
 
  // ---------- Início ----------
  atualizarEtiquetas();
  carregarCapitulo();
  marcarSalvo();
})();
 