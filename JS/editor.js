/* editor.js — carrega, salva, retoma, publica e envia para as páginas corretas. */
(() => {
  "use strict";

  function mostrarAvisoFileProtocol() {
    if (window.location.protocol !== "file:") return;
    const aviso = document.createElement("div");
    aviso.setAttribute("role", "alert");
    aviso.style.cssText = "margin:0;padding:14px 5%;background:#fff0cf;color:#4d3300;font:14px/1.5 Arial,sans-serif;border-bottom:1px solid #e5c16a";
    aviso.textContent = "Atenção: o site está aberto por file://. O navegador pode separar o localStorage entre as páginas. Abra a pasta do projeto pelo Live Server do VS Code e acesse Escritor, Editor e Biblioteca pela mesma URL.";
    document.body.prepend(aviso);
  }

  function iniciar() {
    mostrarAvisoFileProtocol();
    const R = window.Readeriso;
    const $ = id => document.getElementById(id);

    if (!R || typeof R.obter !== "function" || typeof R.salvar !== "function") {
      console.error("livros.js precisa ser carregado antes de editor.js.");
      alert("O sistema de histórias não carregou. Confira se livros.js está antes de editor.js no editor.html.");
      return;
    }

    const titulo = $("tituloHistoria");
    const descricao = $("descricaoHistoria");
    const genero = $("generoHistoria");
    const tituloCapitulo = $("tituloCapitulo");
    const textoCapitulo = $("textoCapitulo");
    const listaCapitulos = $("listaCapitulos");
    const numeroCapitulo = $("numeroCapitulo");
    const contadorPalavras = $("contadorPalavras");
    const statusSalvamento = $("statusSalvamento");
    const statusHistoria = $("statusHistoria");
    const painelVisualizacao = $("painelVisualizacao");
    const obrigatorios = [titulo, descricao, genero, tituloCapitulo, textoCapitulo, listaCapitulos, contadorPalavras, statusSalvamento, statusHistoria, painelVisualizacao];

    if (obrigatorios.some(elemento => !elemento)) {
      console.error("Algum ID obrigatório não existe em editor.html.");
      alert("O editor não encontrou um ou mais campos do HTML. Confira os IDs e tente novamente.");
      return;
    }

    const idURL = new URLSearchParams(window.location.search).get("id");
    let historiaId = idURL;
    let capitulos = [];
    let indiceAtual = 0;
    let publicada = false;
    let alteracoesSalvas = true;
    let temporizadorSalvamento = null;

    function atualizarStatusSalvamento(salvo, mensagem) {
      alteracoesSalvas = salvo;
      statusSalvamento.textContent = mensagem;
      statusSalvamento.classList.toggle("salvo", salvo);
    }

    function atualizarStatusHistoria() {
      statusHistoria.textContent = publicada ? "Publicado" : "Rascunho";
      const botaoPublicar = $("btnPublicar");
      if (botaoPublicar) botaoPublicar.textContent = publicada ? "Publicar novamente" : "Publicar";
    }

    function contarPalavras() {
      const conteudo = textoCapitulo.value.trim();
      const quantidade = conteudo ? conteudo.split(/\s+/).length : 0;
      contadorPalavras.textContent = `${quantidade} ${quantidade === 1 ? "palavra" : "palavras"}`;
    }

    function guardarCapituloAtual() {
      const capitulo = capitulos[indiceAtual];
      if (!capitulo) return;
      capitulo.titulo = tituloCapitulo.value.trim() || `Capítulo ${indiceAtual + 1}`;
      capitulo.conteudo = textoCapitulo.value;
      const alinhamento = textoCapitulo.style.textAlign;
      if (["left", "center", "right"].includes(alinhamento)) capitulo.alinhamento = alinhamento;
      else capitulo.alinhamento = capitulo.alinhamento || "left";
    }

    function atualizarListaCapitulos() {
      listaCapitulos.replaceChildren();
      capitulos.forEach((capitulo, indice) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "capitulo";
        botao.classList.toggle("ativo", indice === indiceAtual);
        const nome = document.createElement("span");
        nome.textContent = `Capítulo ${indice + 1}`;
        const subtitulo = document.createElement("small");
        subtitulo.textContent = capitulo.titulo || `Capítulo ${indice + 1}`;
        botao.append(nome, subtitulo);
        botao.addEventListener("click", () => carregarCapitulo(indice));
        listaCapitulos.appendChild(botao);
      });
    }

    function carregarCapitulo(indice, guardarAtual = true) {
      if (guardarAtual) guardarCapituloAtual();
      if (!capitulos[indice]) return;
      indiceAtual = indice;
      tituloCapitulo.value = capitulos[indice].titulo || `Capítulo ${indice + 1}`;
      textoCapitulo.value = capitulos[indice].conteudo || "";
      textoCapitulo.style.textAlign = capitulos[indice].alinhamento || "left";
      if (numeroCapitulo) numeroCapitulo.textContent = `Capítulo ${indice + 1}`;
      contarPalavras();
      atualizarListaCapitulos();
    }

    function salvarHistoria(opcoes = {}) {
      const publicar = typeof opcoes.publicar === "boolean" ? opcoes.publicar : publicada;
      const silencioso = opcoes.silencioso === true;
      clearTimeout(temporizadorSalvamento);
      guardarCapituloAtual();

      if (!historiaId) {
        atualizarStatusSalvamento(false, "⚠ História sem identificador");
        if (!silencioso) alert("Não foi possível identificar esta história. Volte para Escritor e abra-a novamente.");
        return false;
      }

      const existente = R.obter(historiaId);
      if (!existente && idURL) {
        atualizarStatusSalvamento(false, "⚠ História não encontrada");
        if (!silencioso) alert("Esta história não foi encontrada no localStorage. Abra o Readeriso pelo Live Server, volte para Escritor e tente novamente.");
        return false;
      }

      const historia = {
        ...(existente || {}),
        id: String(historiaId),
        titulo: titulo.value.trim(),
        descricao: descricao.value.trim(),
        genero: genero.value || "Outro",
        publicada: publicar,
        capitulos: capitulos.map(capitulo => ({ ...capitulo })),
        criadoEm: existente?.criadoEm || Date.now(),
        atualizadoEm: Date.now()
      };

      if (!R.salvar(historia)) {
        atualizarStatusSalvamento(false, "⚠ Falha ao salvar");
        if (!silencioso) alert("O navegador não conseguiu gravar os dados. Confira o armazenamento disponível e se está usando o Live Server.");
        return false;
      }

      // Confirma o conteúdo que acabou de ser salvo, em vez de confiar só no retorno do setItem.
      const conferida = R.obter(historiaId);
      if (!conferida || conferida.titulo !== historia.titulo || conferida.descricao !== historia.descricao || conferida.publicada !== publicar) {
        atualizarStatusSalvamento(false, "⚠ Não foi possível confirmar o salvamento");
        if (!silencioso) alert("O navegador não confirmou o salvamento. Abra o projeto pelo Live Server e tente novamente.");
        return false;
      }

      publicada = publicar;
      atualizarStatusHistoria();
      atualizarStatusSalvamento(true, publicar ? "✓ História publicada e salva" : "✓ Rascunho salvo");
      return true;
    }

    function marcarAlteracoes() {
      atualizarStatusSalvamento(false, "● Alterações não salvas");
      clearTimeout(temporizadorSalvamento);
      temporizadorSalvamento = setTimeout(() => salvarHistoria({ publicar: publicada, silencioso: true }), 500);
    }

    function adicionarCapitulo() {
      guardarCapituloAtual();
      capitulos.push(R.novoCapitulo(`Capítulo ${capitulos.length + 1}`, ""));
      carregarCapitulo(capitulos.length - 1, false);
      marcarAlteracoes();
      tituloCapitulo.focus();
    }

    function carregarHistoria() {
      let historia = idURL ? R.obter(idURL) : null;

      // Não cria silenciosamente uma história vazia quando um ID da página Escritor não é encontrado.
      if (idURL && !historia) {
        atualizarStatusSalvamento(false, "⚠ História não encontrada");
        alert("Não encontrei esta história no localStorage. Isso pode acontecer quando o site é aberto por file://. Abra-o pelo Live Server, volte para Escritor e abra a história de novo.");
        window.location.replace("escritor.html");
        return;
      }

      if (!historia) {
        historia = R.criar({ titulo: "", descricao: "", genero: genero.value || "Fantasia" });
        if (!historia) {
          alert("Não foi possível criar uma história no localStorage. Abra o projeto pelo Live Server.");
          return;
        }
        historiaId = historia.id;
        window.history.replaceState(null, "", `${window.location.pathname}?id=${encodeURIComponent(historiaId)}`);
      } else historiaId = historia.id;

      titulo.value = historia.titulo || "";
      descricao.value = historia.descricao || "";
      const generoSalvo = historia.genero || "Fantasia";
      if (![...genero.options].some(opcao => opcao.value === generoSalvo)) genero.add(new Option(generoSalvo, generoSalvo));
      genero.value = generoSalvo;
      publicada = historia.publicada === true;
      capitulos = Array.isArray(historia.capitulos) ? historia.capitulos.map(capitulo => ({ ...capitulo })) : [];
      if (!capitulos.length) capitulos = [R.novoCapitulo("Capítulo 1", "")];
      carregarCapitulo(0, false);
      atualizarStatusHistoria();
      atualizarStatusSalvamento(true, "✓ História carregada");
    }

    function escaparHTML(texto) {
      return String(texto ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      })[caractere]);
    }

    function formatarTexto(texto) {
      return escaparHTML(texto)
        .replace(/^## (.+)$/gm, "<h3>$1</h3>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/__(.+?)__/g, "<u>$1</u>")
        .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>")
        .replace(/^- (.+)$/gm, "• $1")
        .replace(/\n/g, "<br>");
    }

    $("btnAdicionarCapitulo")?.addEventListener("click", adicionarCapitulo);
    $("btnNovoCapitulo")?.addEventListener("click", adicionarCapitulo);
    [titulo, descricao].forEach(campo => campo.addEventListener("input", marcarAlteracoes));
    genero.addEventListener("change", marcarAlteracoes);

    tituloCapitulo.addEventListener("input", () => {
      guardarCapituloAtual();
      atualizarListaCapitulos();
      marcarAlteracoes();
    });
    textoCapitulo.addEventListener("input", () => {
      guardarCapituloAtual();
      contarPalavras();
      marcarAlteracoes();
    });

    document.querySelectorAll("[data-format]").forEach(botao => {
      botao.addEventListener("click", () => {
        const formato = botao.dataset.format;
        if (["left", "center", "right"].includes(formato)) {
          textoCapitulo.style.textAlign = formato;
          guardarCapituloAtual();
          marcarAlteracoes();
          textoCapitulo.focus();
          return;
        }
        const inicio = textoCapitulo.selectionStart;
        const fim = textoCapitulo.selectionEnd;
        const selecionado = textoCapitulo.value.slice(inicio, fim);
        const marcadores = {
          bold: ["**", "**"], italic: ["*", "*"], underline: ["__", "__"],
          heading: ["## ", ""], list: ["- ", ""], quote: ["> ", ""]
        }[formato];
        if (!marcadores) return;
        textoCapitulo.setRangeText(marcadores[0] + selecionado + marcadores[1], inicio, fim, "select");
        textoCapitulo.focus();
        guardarCapituloAtual();
        contarPalavras();
        marcarAlteracoes();
      });
    });

    $("btnVisualizar")?.addEventListener("click", () => {
      guardarCapituloAtual();
      $("previaTitulo").textContent = titulo.value.trim() || "História sem título";
      $("previaDescricao").textContent = descricao.value.trim();
      const area = $("previaCapitulos");
      area.replaceChildren();
      capitulos.forEach((capitulo, indice) => {
        const artigo = document.createElement("article");
        artigo.className = "previa-capitulo";
        const subtitulo = document.createElement("h3");
        subtitulo.textContent = capitulo.titulo || `Capítulo ${indice + 1}`;
        const conteudo = document.createElement("div");
        conteudo.className = "previa-texto";
        conteudo.style.textAlign = capitulo.alinhamento || "left";
        conteudo.innerHTML = formatarTexto(capitulo.conteudo || "");
        artigo.append(subtitulo, conteudo);
        area.appendChild(artigo);
      });
      painelVisualizacao.hidden = false;
      painelVisualizacao.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    $("btnFecharVisualizacao")?.addEventListener("click", () => { painelVisualizacao.hidden = true; });

    $("btnSalvar")?.addEventListener("click", () => {
      const salvou = salvarHistoria({ publicar: false });
      if (!salvou) return;
      // O rascunho deve aparecer em Escritor, então volta para lá após gravar.
      window.location.href = "escritor.html?status=rascunho#listaRascunhos";
    });

    $("btnPublicar")?.addEventListener("click", () => {
      guardarCapituloAtual();
      if (!titulo.value.trim()) {
        alert("Dê um título para sua história antes de publicar.");
        titulo.focus();
        return;
      }
      if (!capitulos.some(capitulo => String(capitulo.conteudo || "").trim())) {
        alert("Escreva pelo menos um capítulo antes de publicar.");
        textoCapitulo.focus();
        return;
      }
      if (!salvarHistoria({ publicar: true })) return;
      // Sem confirmação adicional: um clique publica, salva e abre a biblioteca.
      window.location.href = "biblioteca.html";
    });

    $("btnConfigurar")?.addEventListener("click", () => {
      titulo.focus();
      titulo.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    document.addEventListener("keydown", evento => {
      if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "s") {
        evento.preventDefault();
        salvarHistoria({ publicar: false });
      }
    });

    window.addEventListener("beforeunload", evento => {
      if (!alteracoesSalvas) {
        evento.preventDefault();
        evento.returnValue = "";
      }
    });

    carregarHistoria();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
