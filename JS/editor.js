// editor.js — carrega, edita, formata, salva e publica uma história
(() => {
  "use strict";

  function iniciar() {
    const R = window.Readeriso;
    const $ = id => document.getElementById(id);

    const titulo = $("tituloHistoria");
    const descricao = $("descricaoHistoria");
    const genero = $("generoHistoria");
    const tituloCapitulo = $("tituloCapitulo");
    const textoCapitulo = $("textoCapitulo"); // agora é uma <div contenteditable>
    const listaCapitulos = $("listaCapitulos");
    const numeroCapitulo = $("numeroCapitulo");
    const contadorPalavras = $("contadorPalavras");
    const statusSalvamento = $("statusSalvamento");
    const statusHistoria = $("statusHistoria");
    const btnExcluirCapitulo = $("btnExcluirCapitulo");
    const btnExcluirHistoria = $("btnExcluirHistoria");
    const botoesAlinhamento = document.querySelectorAll('[data-format="left"], [data-format="center"], [data-format="right"]');
    const capaPrevia = $("capaPrevia");
    const campoCapa = $("campoCapa");
    const btnRemoverCapa = $("btnRemoverCapa");
    const erroCapa = $("erroCapa");
    const campoImagem = $("campoImagem");
    const REGEX_IMAGEM = /!\[img\]\((data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+\/=]+)\)/g;
    let historiaId = new URLSearchParams(window.location.search).get("id");
    let capitulos = [];
    let indiceAtual = 0;
    let publicada = false;
    let alteracoesSalvas = true;
    let temporizador = null;
    let capa = "";
    let faixaSalva = null; // posição do cursor ao clicar em "Inserir imagem"
    // Enter cria parágrafos <p> (e não <div>), o que simplifica a conversão
    document.execCommand("defaultParagraphSeparator", false, "p");

    // ===== Estado na tela =====

    function atualizarStatusSalvamento(salvo, mensagem) {
      alteracoesSalvas = salvo;
      statusSalvamento.textContent = mensagem;
      statusSalvamento.classList.toggle("salvo", salvo);
    }

    // Selo Rascunho/Publicada e textos que dependem disso
    function atualizarStatusHistoria() {
      statusHistoria.textContent = publicada ? "Publicada" : "Rascunho";
      statusHistoria.classList.toggle("publicada", publicada);
      $("btnSalvar").textContent = publicada ? "Salvar alterações" : "Salvar rascunho";
      $("btnPublicar").hidden = publicada;
      $("btnDespublicar").disabled = !publicada;
      $("textoPublicacao").textContent = publicada
        ? "Esta história está publicada e aparece no Explorar."
        : "Esta história ainda é um rascunho.";
    }

    function contarPalavras() {
      const conteudo = textoCapitulo.innerText.trim();
      const quantidade = conteudo ? conteudo.split(/\s+/).length : 0;
      contadorPalavras.textContent = `${quantidade} ${quantidade === 1 ? "palavra" : "palavras"}`;
    }

    // Mostra o placeholder só quando não há texto nem lista/citação
    function atualizarPlaceholder() {
      const vazio = !textoCapitulo.innerText.trim() && !textoCapitulo.querySelector("ul, blockquote, h2, img");
      textoCapitulo.classList.toggle("vazio", vazio);
    }

    // Destaca o botão de alinhamento ativo
    function marcarAlinhamento(alinhamento) {
      textoCapitulo.style.textAlign = alinhamento;
      botoesAlinhamento.forEach(botao => {
        botao.setAttribute("aria-pressed", String(botao.dataset.format === alinhamento));
      });
    }

    // Deixa os botões B / I / U marcados conforme o trecho onde está o cursor
    function atualizarBotoesAtivos() {
      ["bold", "italic", "underline"].forEach(formato => {
        const botao = document.querySelector(`[data-format="${formato}"]`);
        if (botao) botao.setAttribute("aria-pressed", String(document.queryCommandState(formato)));
      });
    }

    // ===== Conversão: texto salvo <-> editor =====
    // O formato salvo continua o mesmo de antes: **negrito**, *itálico*,
    // __sublinhado__, "## " subtítulo, "- " lista, "> " citação.

    // Texto salvo -> HTML mostrado no editor
    function textoParaHtml(texto) {
      const inline = t => R.escaparHTML(t)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/__(.+?)__/g, "<u>$1</u>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(REGEX_IMAGEM, '<img src="$1" alt="Imagem do capítulo">');

      let html = "";
      let emLista = false;

      String(texto).split("\n").forEach(linha => {
        const item = linha.startsWith("- ");
        if (item && !emLista) html += "<ul>";
        if (!item && emLista) html += "</ul>";
        emLista = item;

        if (item) html += `<li>${inline(linha.slice(2))}</li>`;
        else if (linha.startsWith("## ")) html += `<h2>${inline(linha.slice(3))}</h2>`;
        else if (linha.startsWith("> ")) html += `<blockquote>${inline(linha.slice(2))}</blockquote>`;
        else html += `<p>${linha ? inline(linha) : "<br>"}</p>`;
      });

      return html + (emLista ? "</ul>" : "");
    }

    // HTML do editor -> texto salvo
    function htmlParaTexto(raiz) {
      const BLOCOS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "BLOCKQUOTE"]);
      const linhas = [];
      const comPrefixo = (prefixo, texto) => (texto ? prefixo + texto : "");

      const inline = no => {
        if (no.nodeType === 3) return no.nodeValue.replace(/\u00a0/g, " ");
        if (no.nodeType === 1 && no.tagName === "IMG") {
          const src = no.getAttribute("src") || "";
          return src.startsWith("data:image/") ? `![img](${src})` : "";
        }
        if (no.nodeType !== 1 || no.tagName === "BR") return "";

        const dentro = [...no.childNodes].map(inline).join("");
        if (!dentro) return "";

        switch (no.tagName) {
          case "STRONG": case "B": return `**${dentro}**`;
          case "EM": case "I": return `*${dentro}*`;
          case "U": return `__${dentro}__`;
          default: return dentro;
        }
      };

      const bloco = no => {
        const tag = no.tagName;

        if (tag === "UL" || tag === "OL") {
          no.querySelectorAll(":scope > li").forEach(li => linhas.push(comPrefixo("- ", inline(li))));
        } else if (/^H[1-6]$/.test(tag)) {
          linhas.push(comPrefixo("## ", inline(no)));
        } else if (tag === "BLOCKQUOTE") {
          linhas.push(comPrefixo("> ", inline(no)));
        } else if ([...no.children].some(filho => BLOCOS.has(filho.tagName))) {
          percorrer(no);
        } else {
          linhas.push(inline(no));
        }
      };

      const percorrer = pai => {
        let atual = null;
        const fechar = () => {
          if (atual !== null) linhas.push(atual);
          atual = null;
        };

        pai.childNodes.forEach(no => {
          if (no.nodeType === 1 && BLOCOS.has(no.tagName)) {
            fechar();
            bloco(no);
          } else if (no.nodeType === 1 && no.tagName === "BR") {
            if (atual === null) atual = "";
            fechar();
          } else {
            atual = (atual ?? "") + inline(no);
          }
        });
        fechar();
      };

      percorrer(raiz);
      return linhas.join("\n");
    }

    // ===== Capítulos =====

    // Copia o que está na tela para o capítulo atual
    function guardarCapituloAtual() {
      const capitulo = capitulos[indiceAtual];
      if (!capitulo) return;
      capitulo.titulo = tituloCapitulo.value.trim() || `Capítulo ${indiceAtual + 1}`;
      capitulo.conteudo = htmlParaTexto(textoCapitulo);
      capitulo.alinhamento = textoCapitulo.style.textAlign || "left";
    }

    function atualizarListaCapitulos() {
      listaCapitulos.replaceChildren();

      capitulos.forEach((capitulo, indice) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "capitulo";
        botao.classList.toggle("ativo", indice === indiceAtual);

        const nome = document.createElement("span");
        nome.textContent = `CAPÍTULO ${indice + 1}`;
        const subtitulo = document.createElement("small");
        subtitulo.textContent = capitulo.titulo || `Capítulo ${indice + 1}`;

        botao.append(nome, subtitulo);
        botao.addEventListener("click", () => carregarCapitulo(indice));
        listaCapitulos.appendChild(botao);
      });

      // Sempre precisa sobrar pelo menos um capítulo
      btnExcluirCapitulo.disabled = capitulos.length <= 1;
    }

    // Mostra um capítulo na área de escrita
    function carregarCapitulo(indice, guardarAtual = true) {
      if (guardarAtual) guardarCapituloAtual();
      if (!capitulos[indice]) return;

      indiceAtual = indice;
      tituloCapitulo.value = capitulos[indice].titulo || `Capítulo ${indice + 1}`;
      textoCapitulo.innerHTML = textoParaHtml(capitulos[indice].conteudo || "");
      numeroCapitulo.textContent = `CAPÍTULO ${indice + 1}`;
      marcarAlinhamento(capitulos[indice].alinhamento || "left");
      contarPalavras();
      atualizarPlaceholder();
      atualizarListaCapitulos();
    }

    function adicionarCapitulo() {
      guardarCapituloAtual();
      capitulos.push(R.novoCapitulo(`Capítulo ${capitulos.length + 1}`, ""));
      carregarCapitulo(capitulos.length - 1, false);
      marcarAlteracoes();
      tituloCapitulo.select();
    }

    function excluirCapitulo() {
      if (capitulos.length <= 1) return;

      const nome = capitulos[indiceAtual].titulo || `Capítulo ${indiceAtual + 1}`;
      if (!confirm(`Excluir "${nome}"? O texto deste capítulo será perdido.`)) return;

      capitulos.splice(indiceAtual, 1);
      carregarCapitulo(Math.min(indiceAtual, capitulos.length - 1), false);
      marcarAlteracoes();
    }

    // ===== Salvar =====

    function salvarHistoria({ publicar = publicada, silencioso = false } = {}) {
      clearTimeout(temporizador);
      guardarCapituloAtual();

      const existente = R.obter(historiaId);
      const salvou = R.salvar({
        ...(existente || {}),
        id: historiaId,
        titulo: titulo.value.trim(),
        descricao: descricao.value.trim(),
        genero: genero.value || "Outro",
        capa,
        publicada: publicar,
        capitulos: capitulos.map(capitulo => ({ ...capitulo }))
      });

      if (!salvou) {
        atualizarStatusSalvamento(false, "⚠ Falha ao salvar");
        if (!silencioso) alert("O navegador não conseguiu gravar os dados. Abra o projeto pelo Live Server e tente novamente.");
        return false;
      }

      publicada = publicar;
      atualizarStatusHistoria();
      atualizarStatusSalvamento(true, `✓ Salvo às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`);
      return true;
    }

    // Salvamento automático meio segundo depois da última alteração
    function marcarAlteracoes() {
      atualizarStatusSalvamento(false, "● Alterações não salvas");
      clearTimeout(temporizador);
      temporizador = setTimeout(() => salvarHistoria({ silencioso: true }), 500);
    }

    // ===== Carregar =====

    function carregarHistoria() {
      let historia = historiaId ? R.obter(historiaId) : null;

      // ID inválido: volta para a lista de histórias
      if (historiaId && !historia) {
        alert("Não encontrei esta história. Volte para Escrever e abra-a novamente.");
        window.location.replace("escritor.html");
        return;
      }

      // Sem ID: começa uma história nova
      if (!historia) {
        historia = R.criar({ genero: genero.value });
        if (!historia) {
          alert("Não foi possível criar uma história. Abra o projeto pelo Live Server.");
          return;
        }
        window.history.replaceState(null, "", `?id=${encodeURIComponent(historia.id)}`);
      }

      historiaId = historia.id;
      titulo.value = historia.titulo;
      descricao.value = historia.descricao;
      capa = historia.capa || "";
      mostrarCapa();    

      // Mantém gêneros antigos que não estão na lista
      if (![...genero.options].some(opcao => opcao.value === historia.genero)) {
        genero.add(new Option(historia.genero, historia.genero));
      }
      genero.value = historia.genero;

      publicada = historia.publicada;
      capitulos = historia.capitulos.map(capitulo => ({ ...capitulo }));
      carregarCapitulo(0, false);
      atualizarStatusHistoria();
      atualizarStatusSalvamento(true, "✓ História carregada");
      document.title = `Readeriso | ${historia.titulo || "Editor"}`;
    }

    // ===== Formatação =====

    // Subtítulo e citação: liga e desliga o bloco
    function alternarBloco(tag) {
      const atual = (document.queryCommandValue("formatBlock") || "").toLowerCase();
      document.execCommand("formatBlock", false, atual === tag ? "p" : tag);
    }

    function aplicarFormato(formato) {
      if (["left", "center", "right"].includes(formato)) {
        marcarAlinhamento(formato);
        textoCapitulo.focus();
      } else {
        textoCapitulo.focus();

        const comando = {
          bold: "bold",
          italic: "italic",
          underline: "underline",
          list: "insertUnorderedList"
        }[formato];

        if (comando) document.execCommand(comando);
        else if (formato === "heading") alternarBloco("h2");
        else if (formato === "quote") alternarBloco("blockquote");
        else return;

        contarPalavras();
        atualizarPlaceholder();
        atualizarBotoesAtivos();
      }

      guardarCapituloAtual();
      marcarAlteracoes();
    }

    document.querySelectorAll("[data-format]").forEach(botao => {
      // Impede que o clique tire a seleção do texto
      botao.addEventListener("mousedown", evento => evento.preventDefault());
      botao.addEventListener("click", () => aplicarFormato(botao.dataset.format));
    });

    // Atalhos Ctrl+B / Ctrl+I / Ctrl+U dentro do texto
    textoCapitulo.addEventListener("keydown", evento => {
      if (!(evento.ctrlKey || evento.metaKey)) return;
      const formato = { b: "bold", i: "italic", u: "underline" }[evento.key.toLowerCase()];
      if (formato) {
        evento.preventDefault();
        aplicarFormato(formato);
      }
    });

    // Colar sempre como texto puro (evita trazer estilos de outros sites)
    textoCapitulo.addEventListener("paste", evento => {
      evento.preventDefault();
      const texto = evento.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, texto);
    });

    // Atualiza B / I / U conforme o cursor se move
    document.addEventListener("selectionchange", () => {
      if (document.activeElement === textoCapitulo) atualizarBotoesAtivos();
    });

    // ===== Prévia =====

    function montarPrevia() {
      guardarCapituloAtual();
      $("previaGenero").textContent = genero.value.toUpperCase();
      $("previaTitulo").textContent = titulo.value.trim() || "História sem título";
      $("previaDescricao").textContent = descricao.value.trim();

      $("previaCapitulos").innerHTML = capitulos.map((capitulo, indice) => `
        <section class="capitulo-leitura">
          <p class="sobretitulo">CAPÍTULO ${indice + 1}</p>
          <h3>${R.escaparHTML(capitulo.titulo)}</h3>
          <div class="texto-capitulo" style="text-align: ${capitulo.alinhamento}">
            ${capitulo.conteudo.trim() ? R.formatarTexto(capitulo.conteudo) : "<p>Este capítulo ainda não tem texto.</p>"}
          </div>
        </section>
      `).join("");

      bootstrap.Modal.getOrCreateInstance($("modalPrevia")).show();
    }

    // ===== Eventos =====

    $("btnAdicionarCapitulo").addEventListener("click", adicionarCapitulo);
    btnExcluirCapitulo.addEventListener("click", excluirCapitulo);
    $("btnVisualizar").addEventListener("click", montarPrevia);

    [titulo, descricao].forEach(campo => campo.addEventListener("input", marcarAlteracoes));
    genero.addEventListener("change", marcarAlteracoes);

    tituloCapitulo.addEventListener("input", () => {
      guardarCapituloAtual();
      atualizarListaCapitulos();
      marcarAlteracoes();
    });

    textoCapitulo.addEventListener("input", () => {
      contarPalavras();
      atualizarPlaceholder();
      marcarAlteracoes();
    });

    // Salvar mantém o status atual e continua no editor
    $("btnSalvar").addEventListener("click", () => salvarHistoria());

    // Publicar exige título e algum texto; depois abre a leitura na Biblioteca
    $("btnPublicar").addEventListener("click", () => {
      guardarCapituloAtual();

      if (!titulo.value.trim()) {
        alert("Dê um título para sua história antes de publicar.");
        titulo.focus();
        return;
      }

      if (!capitulos.some(capitulo => capitulo.conteudo.trim())) {
        alert("Escreva pelo menos um capítulo antes de publicar.");
        textoCapitulo.focus();
        return;
      }

      if (salvarHistoria({ publicar: true })) {
        window.location.href = `biblioteca.html?ler=${encodeURIComponent(historiaId)}`;
      }
    });

    // Configurações: voltar para rascunho
    $("btnDespublicar").addEventListener("click", () => {
      salvarHistoria({ publicar: false });
      bootstrap.Modal.getInstance($("modalConfiguracoes"))?.hide();
    });

    // Configurações: excluir (pede um segundo clique para confirmar)
    btnExcluirHistoria.addEventListener("click", () => {
      if (btnExcluirHistoria.dataset.confirmar !== "sim") {
        btnExcluirHistoria.dataset.confirmar = "sim";
        btnExcluirHistoria.textContent = "Clique de novo para excluir";
        return;
      }

      clearTimeout(temporizador);
      alteracoesSalvas = true;
      R.excluir(historiaId);
      window.location.href = "escritor.html";
    });

    // Ao fechar o modal, o botão de excluir volta ao normal
    $("modalConfiguracoes").addEventListener("hidden.bs.modal", () => {
      delete btnExcluirHistoria.dataset.confirmar;
      btnExcluirHistoria.textContent = "Excluir";
    });

    // Ctrl+S salva
    document.addEventListener("keydown", evento => {
      if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "s") {
        evento.preventDefault();
        salvarHistoria();
      }
    });

    // Salva o que faltar antes de sair da página
    window.addEventListener("beforeunload", () => {
      if (!alteracoesSalvas) salvarHistoria({ silencioso: true });
    });
    // ===== Capa e imagens =====

    function mostrarCapa() {
      capaPrevia.innerHTML = capa ? `<img src="${R.escaparHTML(capa)}" alt="Capa da história">` : "▧";
      btnRemoverCapa.hidden = !capa;
    }

    campoCapa.addEventListener("change", async () => {
      const arquivo = campoCapa.files[0];
      campoCapa.value = "";
      erroCapa.textContent = "";
      if (!arquivo) return;

      try {
        capa = await R.prepararImagem(arquivo, { larguraMax: 1200 });
        mostrarCapa();
        marcarAlteracoes();
      } catch {
        erroCapa.textContent = "Não foi possível ler essa imagem.";
      }
    });

    btnRemoverCapa.addEventListener("click", () => {
      capa = "";
      mostrarCapa();
      marcarAlteracoes();
    });

    // Imagem dentro do capítulo: sempre em um parágrafo próprio, logo após o cursor
    function inserirImagem(src) {
      const imagem = document.createElement("img");
      imagem.src = src;
      imagem.alt = "Imagem do capítulo";

      const paragrafo = document.createElement("p");
      paragrafo.appendChild(imagem);

      let bloco = faixaSalva ? faixaSalva.startContainer : null;
      while (bloco && bloco.parentNode !== textoCapitulo) bloco = bloco.parentNode;

      if (bloco) bloco.after(paragrafo);
      else textoCapitulo.appendChild(paragrafo);

      // Deixa uma linha vazia depois para continuar escrevendo
      if (!paragrafo.nextSibling) {
        const proximo = document.createElement("p");
        proximo.appendChild(document.createElement("br"));
        textoCapitulo.appendChild(proximo);
      }

      contarPalavras();
      atualizarPlaceholder();
      guardarCapituloAtual();
      marcarAlteracoes();
    }

    $("btnImagem").addEventListener("mousedown", evento => evento.preventDefault());
    $("btnImagem").addEventListener("click", () => {
      const selecao = window.getSelection();
      faixaSalva = selecao.rangeCount && textoCapitulo.contains(selecao.anchorNode)
        ? selecao.getRangeAt(0).cloneRange()
        : null;
      campoImagem.click();
    });

    campoImagem.addEventListener("change", async () => {
      const arquivo = campoImagem.files[0];
      campoImagem.value = "";
      if (!arquivo) return;

      try {
        inserirImagem(await R.prepararImagem(arquivo, { larguraMax: 800 }));
      } catch {
        alert("Não foi possível ler essa imagem.");
      }
    });
    carregarHistoria();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();