/* escritor.js - página "Escritor"
   Lista os livros (rascunhos / publicados), cria novas histórias
   e abre o editor com o livro escolhido (editor.html?id=...). */
(() => {
  const R = window.Readeriso;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (t) =>
    String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
 
  const listaRascunhos = $('#listaRascunhos');
  const listaPublicados = $('#listaPublicados');
 
  // ---------- Cards dos livros ----------
  function cartao(livro) {
    const n = livro.capitulos ? livro.capitulos.length : 0;
    const status = livro.publicada ? 'Publicado' : 'Rascunho';
    return `
      <a class="livro" href="editor.html?id=${encodeURIComponent(livro.id)}" title="Abrir no editor">
        <div class="capa"><span>CAPA</span></div>
        <h4>${esc(livro.titulo)}</h4>
        <p>${status} · ${n} ${n === 1 ? 'capítulo' : 'capítulos'}</p>
      </a>`;
  }
 
  function preencher(el, livros, vazio) {
    el.innerHTML = livros.length
      ? livros.map(cartao).join('')
      : `<p class="lista-vazia">${vazio}</p>`;
  }
 
  function renderizar() {
    const livros = R.listar().sort((a, b) => (b.atualizadoEm || 0) - (a.atualizadoEm || 0));
    preencher(listaRascunhos, livros.filter((l) => !l.publicada), 'Você ainda não tem rascunhos.');
    preencher(listaPublicados, livros.filter((l) => l.publicada), 'Nenhuma história publicada ainda.');
  }
 
  // ---------- Modal "Criar nova história" ----------
  const elModal = $('#modalNovaHistoria');
  const modal = bootstrap.Modal.getOrCreateInstance(elModal);
  const campoTitulo = $('#titulo');
  const campoDescricao = $('#descricao');
  const campoGenero = $('#genero');
  const erro = $('#erroForm');
 
  const mostrarErro = (msg) => {
    erro.textContent = msg;
    erro.hidden = false;
  };
 
  function criarHistoria() {
    const titulo = campoTitulo.value.trim();
    if (!titulo) {
      mostrarErro('Digite um título para a história.');
      campoTitulo.focus();
      return;
    }
    if (!campoGenero.value) {
      mostrarErro('Selecione um gênero.');
      campoGenero.focus();
      return;
    }
 
    const livro = R.criar({
      titulo,
      descricao: campoDescricao.value.trim(),
      genero: campoGenero.value,
    });
 
    if (!livro) {
      mostrarErro('Não foi possível salvar a história neste navegador.');
      return;
    }
 
    modal.hide();
    window.location.href = `editor.html?id=${encodeURIComponent(livro.id)}`;
  }
 
  $('#btnCriar').addEventListener('click', criarHistoria);
  campoTitulo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      criarHistoria();
    }
  });
  elModal.addEventListener('shown.bs.modal', () => campoTitulo.focus());
  elModal.addEventListener('hidden.bs.modal', () => {
    campoTitulo.value = '';
    campoDescricao.value = '';
    campoGenero.value = '';
    erro.hidden = true;
  });
 
  // Atualiza a lista se o usuário voltar do editor pelo botão "voltar" do navegador
  window.addEventListener('pageshow', renderizar);
  renderizar();
})();
 