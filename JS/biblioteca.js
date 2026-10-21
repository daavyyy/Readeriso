// biblioteca.js — mostra rascunhos e publicadas, e abre a leitura das histórias
(() => {
  "use strict";

  function iniciar() {
    const R = window.Readeriso;
    const escapar = R.escaparHTML;

    const abas = document.querySelectorAll("#abas .filtro");
    const listaLivros = document.getElementById("listaLivros");
    const mensagemVazia = document.getElementById("mensagemVazia");
    const contadorLivros = document.getElementById("contadorLivros");
    const tituloLista = document.getElementById("tituloLista");
    const secaoLivros = document.getElementById("secaoLivros");
    const painelLeitura = document.getElementById("painelLeitura");

    let tipoAtual = "publicados";

    // Card de uma história com botões Ler / Editar
    function criarCard(livro) {
      const id = encodeURIComponent(livro.id);
      const capitulos = livro.capitulos.length;
      const botaoLer = livro.publicada
        ? `<button type="button" class="btn-principal" data-ler="${escapar(livro.id)}">Ler</button>`
        : "";

      return `
        <article class="card-historia">
          <div class="capa-historia sem-capa" aria-hidden="true">▧</div>
          <p class="genero">${escapar(livro.genero.toUpperCase())}</p>
          <h3>${escapar(livro.titulo || "História sem título")}</h3>
          <p class="descricao-historia">${escapar(livro.descricao || "Sem descrição.")}</p>
          <p class="info-livro">${livro.publicada ? "Publicada" : "Rascunho"} · ${capitulos} ${capitulos === 1 ? "capítulo" : "capítulos"}</p>
          <div class="card-acoes">
            ${botaoLer}
            <a href="editor.html?id=${id}" class="btn-secundario">
              ${livro.publicada ? "Editar" : "Continuar escrevendo"}
            </a>
          </div>
        </article>
      `;
    }

    // Lista as histórias da aba atual
    function carregarBiblioteca() {
      const filtrados = R.listar()
        .filter(livro => tipoAtual === "publicados" ? livro.publicada : !livro.publicada)
        .sort((a, b) => b.atualizadoEm - a.atualizadoEm);

      tituloLista.innerHTML = `${tipoAtual === "publicados" ? "Publicadas" : "Rascunhos"}<span>.</span>`;
      contadorLivros.textContent = `${filtrados.length} ${filtrados.length === 1 ? "história" : "histórias"}`;
      listaLivros.innerHTML = filtrados.map(criarCard).join("");
      mensagemVazia.hidden = filtrados.length > 0;
    }

    // Abre a leitura de uma história publicada
    function abrirLeitura(id) {
      const livro = R.obter(id);
      if (!livro || !livro.publicada) return;

      document.getElementById("leituraGenero").textContent = livro.genero.toUpperCase();
      document.getElementById("leituraTitulo").innerHTML = `${escapar(livro.titulo || "História sem título")}<span>.</span>`;
      document.getElementById("leituraDescricao").textContent = livro.descricao;

      document.getElementById("leituraCapitulos").innerHTML = livro.capitulos.map((capitulo, indice) => `
        <section class="capitulo-leitura">
          <p class="sobretitulo">CAPÍTULO ${indice + 1}</p>
          <h3>${escapar(capitulo.titulo || `Capítulo ${indice + 1}`)}</h3>
          <div class="texto-capitulo" style="text-align: ${capitulo.alinhamento}">
            ${capitulo.conteudo.trim() ? R.formatarTexto(capitulo.conteudo) : "<p>Este capítulo ainda não tem texto.</p>"}
          </div>
        </section>
      `).join("");

      painelLeitura.hidden = false;
      secaoLivros.hidden = true;
      painelLeitura.scrollIntoView();
    }

    function fecharLeitura() {
      painelLeitura.hidden = true;
      secaoLivros.hidden = false;
      // Tira o ?ler= da URL para não reabrir ao recarregar
      window.history.replaceState(null, "", window.location.pathname);
    }

    // Troca de aba
    abas.forEach(aba => {
      aba.addEventListener("click", () => {
        tipoAtual = aba.dataset.tipo;
        abas.forEach(item => item.classList.toggle("ativo", item === aba));
        fecharLeitura();
        carregarBiblioteca();
      });
    });

    // Botão "Ler" dos cards
    listaLivros.addEventListener("click", evento => {
      const botao = evento.target.closest("[data-ler]");
      if (botao) abrirLeitura(botao.dataset.ler);
    });

    document.getElementById("btnFecharLeitura").addEventListener("click", fecharLeitura);

    carregarBiblioteca();

    // Abre direto a leitura quando vem de outra página (biblioteca.html?ler=ID)
    const idLeitura = new URLSearchParams(window.location.search).get("ler");
    if (idLeitura) abrirLeitura(idLeitura);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
