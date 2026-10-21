/* livros.js — armazenamento único das histórias do Readeriso. */
(() => {
  "use strict";

  const CHAVE = "readeriso:livros";
  const CHAVES_ANTIGAS = ["readerisoLivros", "readeriso:livros", "readeriso:historia"];
  const ALINHAMENTOS = ["left", "center", "right"];
  const gerarId = () => `hist-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  function timestamp(valor, padrao) {
    if (typeof valor === "number" && Number.isFinite(valor)) return valor;
    if (typeof valor === "string" && valor.trim()) {
      const numero = Number(valor);
      if (Number.isFinite(numero)) return numero;
      const data = Date.parse(valor);
      if (Number.isFinite(data)) return data;
    }
    return padrao;
  }

  function normalizarCapitulo(capitulo, indice = 0) {
    const c = capitulo && typeof capitulo === "object" ? capitulo : {};
    return {
      id: String(c.id || `cap-${Date.now().toString(36)}-${indice}-${Math.random().toString(36).slice(2, 5)}`),
      titulo: String(c.titulo ?? `Capítulo ${indice + 1}`),
      conteudo: String(c.conteudo ?? c.texto ?? ""),
      alinhamento: ALINHAMENTOS.includes(c.alinhamento) ? c.alinhamento : "left"
    };
  }

  function normalizar(livro) {
    if (!livro || typeof livro !== "object") return null;
    const id = livro.id ?? livro.ID;
    if (id === undefined || id === null || String(id).trim() === "") return null;

    const agora = Date.now();
    const capitulosOriginais = Array.isArray(livro.capitulos) ? livro.capitulos : [];
    const capitulos = capitulosOriginais.map((capitulo, indice) => normalizarCapitulo(capitulo, indice));

    return {
      id: String(id),
      titulo: String(livro.titulo ?? livro.title ?? "").trim(),
      descricao: String(livro.descricao ?? livro.description ?? ""),
      genero: String(livro.genero ?? livro.gênero ?? "Outro").trim() || "Outro",
      publicada: livro.publicada === true || livro.publicado === true || livro.published === true,
      capitulos: capitulos.length ? capitulos : [normalizarCapitulo({ titulo: "Capítulo 1" }, 0)],
      criadoEm: timestamp(livro.criadoEm ?? livro.criado_em, agora),
      atualizadoEm: timestamp(livro.atualizadoEm ?? livro.atualizado_em, agora)
    };
  }

  function lerJSON(chave) {
    try {
      const valor = localStorage.getItem(chave);
      return valor === null ? null : JSON.parse(valor);
    } catch (erro) {
      console.warn(`Não foi possível ler ${chave} do localStorage.`, erro);
      return null;
    }
  }

  function gravar(lista) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(lista));
      return true;
    } catch (erro) {
      console.error("Falha ao salvar histórias no localStorage:", erro);
      return false;
    }
  }

  function lerBrutoPrincipal() {
    const dados = lerJSON(CHAVE);
    if (Array.isArray(dados)) return dados;
    return [];
  }

  function migrarDadosAntigos() {
    let atuais = lerBrutoPrincipal();
    const ids = new Set(atuais.map(item => String(item?.id ?? "")));
    let alterou = false;

    for (const chave of CHAVES_ANTIGAS) {
      if (chave === CHAVE) continue;
      const antigos = lerJSON(chave);
      if (Array.isArray(antigos)) {
        for (const item of antigos) {
          const livro = normalizar(item);
          if (livro && !ids.has(livro.id)) {
            atuais.push(livro);
            ids.add(livro.id);
            alterou = true;
          }
        }
      } else if (chave === "readeriso:historia" && antigos && typeof antigos === "object") {
        // Versões antigas guardavam um único editor em vez de uma lista de histórias.
        const capitulos = Array.isArray(antigos.capitulos)
          ? antigos.capitulos.map(c => ({ ...c, conteudo: c.conteudo ?? c.texto ?? "" }))
          : [];
        const legado = normalizar({
          id: antigos.id || gerarId(),
          titulo: antigos.titulo || "História recuperada",
          descricao: antigos.descricao || "",
          genero: antigos.genero || "Outro",
          publicada: antigos.publicada === true || antigos.publicado === true,
          capitulos,
          criadoEm: antigos.criadoEm || Date.now(),
          atualizadoEm: antigos.atualizadoEm || Date.now()
        });
        if (legado && !ids.has(legado.id)) {
          atuais.push(legado);
          ids.add(legado.id);
          alterou = true;
        }
      }
    }

    if (alterou || lerJSON(CHAVE) === null) gravar(atuais.map(normalizar).filter(Boolean));
  }

  migrarDadosAntigos();

  function listar() {
    return lerBrutoPrincipal().map(normalizar).filter(Boolean);
  }

  function gerarCapitulo(titulo = "Capítulo 1", conteudo = "", alinhamento = "left") {
    return normalizarCapitulo({ titulo, conteudo, alinhamento }, 0);
  }

  window.Readeriso = {
    CHAVE,
    gerarId,
    novoCapitulo: gerarCapitulo,
    listar,

    obter(id) {
      if (id === undefined || id === null) return null;
      return listar().find(livro => livro.id === String(id)) || null;
    },

    criar({ titulo = "", descricao = "", genero = "Outro" } = {}) {
      const agora = Date.now();
      const livro = normalizar({
        id: gerarId(), titulo, descricao, genero, publicada: false,
        capitulos: [gerarCapitulo("Capítulo 1", "")],
        criadoEm: agora, atualizadoEm: agora
      });
      const lista = listar();
      lista.push(livro);
      return gravar(lista) ? livro : null;
    },

    salvar(dados) {
      const livro = normalizar(dados);
      if (!livro) return false;

      const lista = listar();
      const indice = lista.findIndex(item => item.id === livro.id);
      const existente = indice >= 0 ? lista[indice] : null;
      livro.criadoEm = existente?.criadoEm || livro.criadoEm || Date.now();
      livro.atualizadoEm = Date.now();

      if (indice >= 0) lista[indice] = livro;
      else lista.push(livro);
      return gravar(lista);
    },

    excluir(id) {
      return gravar(listar().filter(livro => livro.id !== String(id)));
    }
  };
})();
