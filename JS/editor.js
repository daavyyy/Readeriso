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
    const textoCapitulo = $("textoCapitulo");
    const listaCapitulos = $("listaCapitulos");
    const numeroCapitulo = $("numeroCapitulo");
    const contadorPalavras = $("contadorPalavras");
    const statusSalvamento = $("statusSalvamento");
    const statusHistoria = $("statusHistoria");
    const btnExcluirCapitulo = $("btnExcluirCapitulo");
    const btnExcluirHistoria = $("btnExcluirHistoria");
    const botoesAlinhamento = document.querySelectorAll('[data-format="left"], [data-format="center"], [data-format="right"]');

    let historiaId = new URLSearchParams(window.location.search).get("id");
    let capitulos = [];
    let indiceAtual = 0;
    let publicada = false;
    let alteracoesSalvas = true;
    let temporizador = null;

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
      const conteudo = textoCapitulo.value.trim();
      const quantidade = conteudo ? conteudo.split(/\s+/).length : 0;
      contadorPalavras.textContent = `${quantidade} ${quantidade === 1 ? "palavra" : "palavras"}`;
    }

    // Destaca o botão de alinhamento ativo
    function marcarAlinhamento(alinhamento) {
      textoCapitulo.style.textAlign = alinhamento;
      botoesAlinhamento.forEach(botao => {
        botao.setAttribute("aria-pressed", String(botao.dataset.format === alinhamento));
      });
    }

    // ===== Capítulos =====

    // Copia o que está na tela para o capítulo atual
    function guardarCapituloAtual() {
      const capitulo = capitulos[indiceAtual];
      if (!capitulo) return;
      capitulo.titulo = tituloCapitulo.value.trim() || `Capítulo ${indiceAtual + 1}`;
      capitulo.conteudo = textoCapitulo.value;
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
      textoCapitulo.value = capitulos[indice].conteudo || "";
      numeroCapitulo.textContent = `CAPÍTULO ${indice + 1}`;
      marcarAlinhamento(capitulos[indice].alinhamento || "left");
      contarPalavras();
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

    // Substitui um trecho do texto mantendo o Ctrl+Z funcionando
    function substituirTrecho(inicio, fim, texto) {
      textoCapitulo.focus();
      textoCapitulo.setSelectionRange(inicio, fim);
      if (!document.execCommand("insertText", false, texto)) {
        textoCapitulo.setRangeText(texto, inicio, fim, "end");
      }
    }

    // Negrito, itálico e sublinhado: envolve a seleção (ou remove se já tiver)
    function alternarEnvolvimento(marcador) {
      const valor = textoCapitulo.value;
      const inicio = textoCapitulo.selectionStart;
      const fim = textoCapitulo.selectionEnd;
      const selecionado = valor.slice(inicio, fim);
      const tam = marcador.length;

      const antes = valor.slice(inicio - tam, inicio);
      const depois = valor.slice(fim, fim + tam);
      // No itálico (*), ignora quando o asterisco faz parte de um negrito (**)
      const vizinhosLivres = marcador !== "*" || (valor[inicio - tam - 1] !== "*" && valor[fim + tam] !== "*");

      // Marcação ao redor da seleção: **[texto]**
      if (antes === marcador && depois === marcador && vizinhosLivres) {
        substituirTrecho(inicio - tam, fim + tam, selecionado);
        textoCapitulo.setSelectionRange(inicio - tam, fim - tam);
        return;
      }

      // Marcação dentro da seleção: [**texto**]
      if (selecionado.length > tam * 2 && selecionado.startsWith(marcador) && selecionado.endsWith(marcador)) {
        const limpo = selecionado.slice(tam, -tam);
        substituirTrecho(inicio, fim, limpo);
        textoCapitulo.setSelectionRange(inicio, inicio + limpo.length);
        return;
      }

      // Aplica a marcação; sem seleção, deixa o cursor no meio para digitar
      substituirTrecho(inicio, fim, marcador + selecionado + marcador);
      textoCapitulo.setSelectionRange(inicio + tam, fim + tam);
    }

    // Subtítulo, lista e citação: prefixo no começo de cada linha selecionada
    function alternarPrefixo(prefixo) {
      const valor = textoCapitulo.value;
      const inicioLinha = valor.lastIndexOf("\n", textoCapitulo.selectionStart - 1) + 1;
      let fimLinha = valor.indexOf("\n", textoCapitulo.selectionEnd);
      if (fimLinha === -1) fimLinha = valor.length;

      const linhas = valor.slice(inicioLinha, fimLinha).split("\n");
      const todasTem = linhas.every(linha => linha.startsWith(prefixo));
      const outrosPrefixos = /^(## |- |> )/;

      // Se todas já têm o prefixo, remove; senão troca qualquer outro prefixo por este
      const novas = linhas.map(linha => todasTem
        ? linha.slice(prefixo.length)
        : prefixo + linha.replace(outrosPrefixos, ""));

      const novoTexto = novas.join("\n");
      substituirTrecho(inicioLinha, fimLinha, novoTexto);
      textoCapitulo.setSelectionRange(inicioLinha, inicioLinha + novoTexto.length);
    }

    function aplicarFormato(formato) {
      if (["left", "center", "right"].includes(formato)) {
        marcarAlinhamento(formato);
        textoCapitulo.focus();
      } else {
        const envolver = { bold: "**", italic: "*", underline: "__" }[formato];
        const prefixo = { heading: "## ", list: "- ", quote: "> " }[formato];

        if (envolver) alternarEnvolvimento(envolver);
        else if (prefixo) alternarPrefixo(prefixo);
        else return;

        contarPalavras();
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

    carregarHistoria();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
