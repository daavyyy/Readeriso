/* livros.js - camada de dados do Readeriso (localStorage)
   Única fonte de verdade para escritor.html, editor.html e biblioteca.html.
   Quando o banco de dados for ligado, basta trocar o conteúdo de ler() e gravar().

   Formato de cada livro:
   {
     id, titulo, descricao, genero,
     publicada: boolean,
     capitulos: [{ id, titulo, conteudo, alinhamento }],
     criadoEm: número (ms), atualizadoEm: número (ms)
   }
*/
(() => {
  "use strict";

  const CHAVE = "readeriso:livros";
  const CHAVE_ANTIGA = "readerisoLivros"; // usada por versões antigas do editor/biblioteca
  const ALINHAMENTOS = ["left", "center", "right"];

  const GENEROS = {
    fantasia: "Fantasia",
    aventura: "Aventura",
    romance: "Romance",
    ficcao: "Ficção científica",
    terror: "Terror",
    drama: "Drama",
    comedia: "Comédia",
    misterio: "Mistério",
    outro: "Outro"
  };

  const gerarId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const gerarIdCapitulo = () => `cap-${gerarId()}`;

  function paraTimestamp(valor, padrao) {
    if (typeof valor === "number" && Number.isFinite(valor)) return valor;

    if (typeof valor === "string" && valor.trim() !== "") {
      const numero = Number(valor);
      if (Number.isFinite(numero)) return numero;

      const data = Date.parse(valor);
      if (!Number.isNaN(data)) return data;
    }

    return padrao;
  }

  /* Aceita tanto o formato novo quanto os antigos (texto/conteudo) */
  function normalizarCapitulo(capitulo) {
    const c = capitulo && typeof capitulo === "object" ? capitulo : {};

    return {
      id: c.id || gerarIdCapitulo(),
      titulo: String(c.titulo ?? ""),
      conteudo: String(c.conteudo ?? c.texto ?? ""),
      alinhamento: ALINHAMENTOS.includes(c.alinhamento) ? c.alinhamento : "left"
    };
  }

  /* Aceita tanto o formato novo quanto os antigos (publicada/publicado) */
  function normalizar(livro) {
    if (!livro || typeof livro !== "object") return null;
    if (livro.id === undefined || livro.id === null) return null;

    const agora = Date.now();
    const atualizadoEm = paraTimestamp(livro.atualizadoEm, agora);
    const criadoEm = paraTimestamp(livro.criadoEm, atualizadoEm);
    const genero = String(livro.genero ?? "").trim();

    const capitulos = Array.isArray(livro.capitulos)
      ? livro.capitulos.map(normalizarCapitulo)
      : [];

    return {
      id: String(livro.id),
      titulo: String(livro.titulo ?? ""),
      descricao: String(livro.descricao ?? ""),
      genero: GENEROS[genero] || genero || "Outro",
      publicada: livro.publicada === true || livro.publicado === true,
      capitulos: capitulos.length
        ? capitulos
        : [normalizarCapitulo({ titulo: "Capítulo 1" })],
      criadoEm,
      atualizadoEm
    };
  }

  function lerBruto(chave) {
    try {
      const dados = JSON.parse(localStorage.getItem(chave));
      return Array.isArray(dados) ? dados : null;
    } catch {
      return null;
    }
  }

  function gravar(lista) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(lista));
      return true;
    } catch {
      return false;
    }
  }

  /* Traz para a chave nova qualquer história salva no formato antigo */
  function migrar() {
    const antigos = lerBruto(CHAVE_ANTIGA);
    if (!antigos) return;

    const atuais = lerBruto(CHAVE) || [];
    const idsExistentes = new Set(
      atuais.map(livro => String(livro && livro.id))
    );

    antigos.forEach(livro => {
      if (livro && !idsExistentes.has(String(livro.id))) {
        atuais.push(livro);
      }
    });

    try {
      const convertidos = atuais.map(normalizar).filter(Boolean);
      localStorage.setItem(CHAVE, JSON.stringify(convertidos));
      localStorage.removeItem(CHAVE_ANTIGA);
    } catch {
      /* se falhar, mantém os dados antigos intactos */
    }
  }

  function ler() {
    return (lerBruto(CHAVE) || []).map(normalizar).filter(Boolean);
  }

  migrar();

  window.Readeriso = {
    GENEROS,
    gerarId,

    novoCapitulo(titulo = "", conteudo = "", alinhamento = "left") {
      return normalizarCapitulo({ titulo, conteudo, alinhamento });
    },

    listar: ler,

    obter(id) {
      return ler().find(livro => livro.id === String(id)) || null;
    },

    criar({ titulo, descricao, genero } = {}) {
      const livro = normalizar({
        id: gerarId(),
        titulo: String(titulo ?? "").trim() || "Sem título",
        descricao,
        genero,
        publicada: false,
        capitulos: [{ titulo: "Capítulo 1" }]
      });

      const lista = ler();
      lista.push(livro);

      return gravar(lista) ? livro : null;
    },

    salvar(livro) {
      const novo = normalizar(livro);
      if (!novo) return false;

      novo.atualizadoEm = Date.now();

      const lista = ler();
      const indice = lista.findIndex(item => item.id === novo.id);

      if (indice >= 0) {
        novo.criadoEm = lista[indice].criadoEm;
        lista[indice] = novo;
      } else {
        lista.push(novo);
      }

      return gravar(lista);
    },

    excluir(id) {
      return gravar(ler().filter(livro => livro.id !== String(id)));
    }
  };
})();