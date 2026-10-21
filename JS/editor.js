/* editor.js - editor de histórias (usa window.Readeriso, de livros.js) */
(() => {
  "use strict";

  function iniciar() {
    /* Parte 1 - Sistema de dados e elementos */
    const R = window.Readeriso;

    if (!R || typeof R.obter !== "function" || typeof R.salvar !== "function") {
      console.error("Readeriso não encontrado. Carregue livros.js antes de editor.js.");
      alert("Não foi possível carregar o sistema de histórias.");
      return;
    }

    const campoTitulo = document.getElementById("tituloHistoria");
    const campoDescricao = document.getElementById("descricaoHistoria");
    const campoGenero = document.getElementById("generoHistoria");
    const campoTituloCapitulo = document.getElementById("tituloCapitulo");
    const campoTexto = document.getElementById("textoCapitulo");
    const listaCapitulos = document.getElementById("listaCapitulos");
    const numeroCapitulo = document.getElementById("numeroCapitulo");
    const contadorPalavras = document.getElementById("contadorPalavras");
    const statusSalvamento = document.getElementById("statusSalvamento");
    const statusHistoria = document.getElementById("statusHistoria");
    const painelVisualizacao = document.getElementById("painelVisualizacao");

    const parametros = new URLSearchParams(window.location.search);
    const idSolicitado = parametros.get("id");

    let historiaId = idSolicitado || R.gerarId();
    let capitulos = [];
    let capituloAtual = 0;
    let publicada = false;
    let alteracoesSalvas = true;

    /* Parte 2 - Gênero (garante que o valor salvo exista na lista) */
    function definirGenero(genero) {
      const valor = genero || "Fantasia";

      if (
        campoGenero.options &&
        ![...campoGenero.options].some(opcao => opcao.value === valor)
      ) {
        campoGenero.add(new Option(valor, valor));
      }

      campoGenero.value = valor;
    }

    /* Parte 3 - Carregar uma história existente */
    function carregarHistoria() {
      const historia = idSolicitado ? R.obter(idSolicitado) : null;

      if (!historia) {
        capitulos = [R.novoCapitulo("O começo", "")];
      } else {
        historiaId = historia.id;
        campoTitulo.value = historia.titulo;
        campoDescricao.value = historia.descricao;
        definirGenero(historia.genero);
        publicada = historia.publicada;
        capitulos = historia.capitulos.map(capitulo => ({ ...capitulo }));
      }

      atualizarListaCapitulos();
      /* guardar:false evita apagar o capítulo 1 com os campos ainda vazios */
      carregarCapitulo(0, { guardar: false });
      atualizarStatus();
    }

    /* Parte 4 - Guardar o capítulo atual na memória */
    function guardarCapituloAtual() {
      if (!capitulos[capituloAtual]) return;

      capitulos[capituloAtual].titulo = campoTituloCapitulo.value;
      capitulos[capituloAtual].conteudo = campoTexto.value;
      capitulos[capituloAtual].alinhamento = campoTexto.style.textAlign || "left";
    }

    /* Parte 5 - Alternar capítulos */
    function carregarCapitulo(indice, { guardar = true } = {}) {
      if (guardar) guardarCapituloAtual();

      if (!capitulos[indice]) return;

      capituloAtual = indice;
      campoTituloCapitulo.value = capitulos[indice].titulo;
      campoTexto.value = capitulos[indice].conteudo;
      campoTexto.style.textAlign = capitulos[indice].alinhamento || "left";

      numeroCapitulo.textContent = `Capítulo ${indice + 1}`;
      atualizarContagemPalavras();
      atualizarListaCapitulos();
    }

    function atualizarListaCapitulos() {
      listaCapitulos.replaceChildren();

      capitulos.forEach((capitulo, indice) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "capitulo";
        botao.classList.toggle("ativo", indice === capituloAtual);

        const titulo = document.createElement("span");
        titulo.textContent = `Capítulo ${indice + 1}`;

        const subtitulo = document.createElement("small");
        subtitulo.textContent = capitulo.titulo.trim() || "Sem título";

        botao.append(titulo, subtitulo);
        botao.addEventListener("click", () => carregarCapitulo(indice));
        listaCapitulos.appendChild(botao);
      });
    }

    function adicionarCapitulo() {
      guardarCapituloAtual();

      capitulos.push(R.novoCapitulo(`Capítulo ${capitulos.length + 1}`, ""));
      carregarCapitulo(capitulos.length - 1);
      marcarAlteracoes();
      campoTituloCapitulo.focus();
    }

    document
      .getElementById("btnAdicionarCapitulo")
      .addEventListener("click", adicionarCapitulo);
    document
      .getElementById("btnNovoCapitulo")
      .addEventListener("click", adicionarCapitulo);

    /* Parte 6 - Alterações e contagem de palavras */
    function marcarAlteracoes() {
      alteracoesSalvas = false;
      statusSalvamento.textContent = "● Alterações não salvas";
      statusSalvamento.classList.remove("salvo");
    }

    function atualizarStatus() {
      statusHistoria.textContent = publicada ? "Publicado" : "Rascunho";
      atualizarContagemPalavras();
    }

    function atualizarContagemPalavras() {
      const texto = campoTexto.value.trim();
      const quantidade = texto ? texto.split(/\s+/).length : 0;
      contadorPalavras.textContent =
        `${quantidade} ${quantidade === 1 ? "palavra" : "palavras"}`;
    }

    campoTitulo.addEventListener("input", marcarAlteracoes);
    campoDescricao.addEventListener("input", marcarAlteracoes);
    campoGenero.addEventListener("change", marcarAlteracoes);

    campoTituloCapitulo.addEventListener("input", () => {
      guardarCapituloAtual();
      atualizarListaCapitulos();
      marcarAlteracoes();
    });

    campoTexto.addEventListener("input", () => {
      guardarCapituloAtual();
      atualizarContagemPalavras();
      marcarAlteracoes();
    });

    /* Parte 7 - Salvar história */
    function salvarHistoria(publicar = false) {
      guardarCapituloAtual();

      const titulo = campoTitulo.value.trim();

      if (!titulo) {
        alert("Dê um título para sua história antes de salvar.");
        campoTitulo.focus();
        return false;
      }

      if (!capitulos.length) {
        alert("Adicione pelo menos um capítulo.");
        return false;
      }

      const existente = R.obter(historiaId) || {
        id: historiaId,
        criadoEm: Date.now()
      };

      const historia = {
        ...existente,
        titulo,
        descricao: campoDescricao.value.trim(),
        genero: campoGenero.value,
        capitulos: capitulos.map(capitulo => ({ ...capitulo })),
        publicada: publicar ? true : publicada
      };

      if (!R.salvar(historia)) {
        alert("Não foi possível salvar. Verifique o espaço disponível no navegador.");
        return false;
      }

      publicada = historia.publicada;
      alteracoesSalvas = true;
      statusSalvamento.textContent = "● Todas as alterações foram salvas";
      statusSalvamento.classList.add("salvo");
      atualizarStatus();

      return true;
    }

    document.getElementById("btnSalvar").addEventListener("click", () => {
      if (salvarHistoria(false)) {
        alert(publicada ? "Alterações salvas!" : "Rascunho salvo com sucesso!");
      }
    });

    /* Parte 8 - Publicar */
    document.getElementById("btnPublicar").addEventListener("click", () => {
      guardarCapituloAtual();

      const temConteudo = capitulos.some(capitulo => capitulo.conteudo.trim());

      if (!temConteudo) {
        alert("Escreva o conteúdo de pelo menos um capítulo antes de publicar.");
        campoTexto.focus();
        return;
      }

      if (!confirm("Deseja publicar esta história na biblioteca?")) return;

      if (salvarHistoria(true)) {
        alert("História publicada! Ela já está marcada como publicada na biblioteca.");
        window.location.href = "biblioteca.html";
      }
    });

    /* Parte 9 - Ferramentas de formatação */
    function inserirMarcacao(antes, depois = antes) {
      const inicio = campoTexto.selectionStart;
      const fim = campoTexto.selectionEnd;
      const textoSelecionado = campoTexto.value.slice(inicio, fim);
      const substituto = antes + textoSelecionado + depois;

      campoTexto.setRangeText(substituto, inicio, fim, "select");
      campoTexto.focus();
      guardarCapituloAtual();
      atualizarContagemPalavras();
      marcarAlteracoes();
    }

    document.querySelectorAll("[data-format]").forEach(botao => {
      botao.addEventListener("click", () => {
        const formato = botao.dataset.format;

        if (formato === "bold") {
          inserirMarcacao("**");
        } else if (formato === "italic") {
          inserirMarcacao("*");
        } else if (formato === "underline") {
          inserirMarcacao("__");
        } else if (formato === "heading") {
          inserirMarcacao("## ", "");
        } else if (formato === "list") {
          inserirMarcacao("- ", "");
        } else if (formato === "quote") {
          inserirMarcacao("> ", "");
        } else if (["left", "center", "right"].includes(formato)) {
          campoTexto.style.textAlign = formato;
          guardarCapituloAtual();
          marcarAlteracoes();
          campoTexto.focus();
        }
      });
    });

    /* Parte 10 - Visualização */
    document.getElementById("btnVisualizar").addEventListener("click", () => {
      guardarCapituloAtual();

      document.getElementById("previaTitulo").textContent =
        campoTitulo.value.trim() || "História sem título";

      document.getElementById("previaDescricao").textContent =
        campoDescricao.value.trim();

      const areaPrevia = document.getElementById("previaCapitulos");
      areaPrevia.replaceChildren();

      capitulos.forEach((capitulo, indice) => {
        const artigo = document.createElement("article");
        artigo.className = "previa-capitulo";

        const titulo = document.createElement("h3");
        titulo.textContent = capitulo.titulo.trim() || `Capítulo ${indice + 1}`;

        const texto = document.createElement("p");
        texto.className = "previa-texto";
        texto.style.textAlign = capitulo.alinhamento || "left";
        texto.textContent = capitulo.conteudo;

        artigo.append(titulo, texto);
        areaPrevia.appendChild(artigo);
      });

      painelVisualizacao.hidden = false;
      painelVisualizacao.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    document
      .getElementById("btnFecharVisualizacao")
      .addEventListener("click", () => {
        painelVisualizacao.hidden = true;
      });

    /* Parte 11 - Configurações */
    document.getElementById("btnConfigurar").addEventListener("click", () => {
      campoTitulo.focus();
      campoTitulo.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    /* Parte 12 - Avisar sobre alterações não salvas */
    window.addEventListener("beforeunload", evento => {
      if (!alteracoesSalvas) {
        evento.preventDefault();
        evento.returnValue = "";
      }
    });

    /* Parte 13 - Inicialização */
    carregarHistoria();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();