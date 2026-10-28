/* livros.js — armazenamento único do Readeriso (localStorage).
   TODA a leitura/escrita de dados passa por window.Readeriso.
   Quando o banco de dados for ligado, troque só o corpo das funções daqui
   (viram fetch/Supabase) e as páginas continuam iguais.

   Tabelas simuladas:
   - readeriso:livros          -> livros (agora com autorId / autorNome)
   - readeriso:favoritos       -> { idUsuario: [idLivro, ...] }
   - readeriso:visualizacoes   -> { idLivro: [idUsuario, ...] }  (1 por conta)
   - readerisoPerfil           -> { idUsuario: { nome, bio, foto } }
*/
(() => {
  "use strict";

  const CHAVE = "readeriso:livros";
  const CHAVE_FAVORITOS = "readeriso:favoritos";
  const CHAVE_VISUALIZACOES = "readeriso:visualizacoes";
  const CHAVE_PERFIL = "readerisoPerfil";
  const CHAVE_USUARIO = "readerisoUsuarioAtual";
  const CHAVES_ANTIGAS = ["readerisoLivros", "readeriso:livros", "readeriso:historia"];
  const ALINHAMENTOS = ["left", "center", "right"];
  const gerarId = () => `hist-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  // Livros de demonstração (aparecem para todas as contas)
  const livrosDemo = [
    { id: "fantasia", titulo: "Fantasia", genero: "Fantasia", autor: "Autor de exemplo", descricao: "Um reino à beira do fim guarda um segredo esquecido.", link: "livro.teste/fantasia.txt", capa: "livro.teste/1.png", demo: true },
    { id: "romance", titulo: "Romance", genero: "Romance", autor: "Autora de exemplo", descricao: "Duas pessoas descobrem o que nunca conseguiram dizer.", link: "livro.teste/romance.txt", capa: "livro.teste/2.png", demo: true },
    { id: "yaoi", titulo: "Yaoi", genero: "Yaoi", autor: "Autor de exemplo", descricao: "Um encontro inesperado muda tudo o que eles sabiam.", link: "livro.teste/yaoi.txt", capa: "livro.teste/3.png", demo: true }
  ];

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
      autorId: String(livro.autorId ?? ""),
      autorNome: String(livro.autorNome ?? ""),
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

  function lerObjeto(chave) {
    const dados = lerJSON(chave);
    return dados && typeof dados === "object" && !Array.isArray(dados) ? dados : {};
  }

  function gravarChave(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
      return true;
    } catch (erro) {
      console.error(`Falha ao salvar ${chave} no localStorage:`, erro);
      return false;
    }
  }

  function gravar(lista) {
    return gravarChave(CHAVE, lista);
  }

  // ===== Conta logada (gravada pelo login.js) =====
  function usuarioAtual() {
    const dados = lerJSON(CHAVE_USUARIO);
    return dados && typeof dados === "object" ? dados : { usuario: "Leitor", email: "" };
  }

  // Identificador da conta. No banco de dados vira o id do usuário.
  function idUsuario() {
    const dados = lerJSON(CHAVE_USUARIO);
    return dados && typeof dados === "object" ? String(dados.email || dados.usuario || "") : "";
  }

  function lerBrutoPrincipal() {
    const dados = lerJSON(CHAVE);
    return Array.isArray(dados) ? dados : [];
  }

  function migrarDadosAntigos() {
    const atuais = lerBrutoPrincipal();
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

    const todos = atuais.map(normalizar).filter(Boolean);

    // Livros antigos, criados antes de existir "autor", ficam com a conta que abrir primeiro
    const dono = idUsuario();
    if (dono) {
      const nome = usuarioAtual().usuario;
      for (const livro of todos) {
        if (!livro.autorId) {
          livro.autorId = dono;
          livro.autorNome = nome;
          alterou = true;
        }
      }
    }

    if (alterou || lerJSON(CHAVE) === null) gravar(todos);
  }

  // Favoritos antigos eram globais (uma lista só). Passam para a conta atual, uma única vez.
  function migrarFavoritosAntigos() {
    const dono = idUsuario();
    if (!dono) return;
    const antigos = lerJSON("readerisoFavoritos") ?? lerJSON("crimsonReaderFavorites");
    if (!Array.isArray(antigos)) return;

    const mapa = lerObjeto(CHAVE_FAVORITOS);
    mapa[dono] = [...new Set([...(Array.isArray(mapa[dono]) ? mapa[dono] : []), ...antigos.map(String)])];
    if (gravarChave(CHAVE_FAVORITOS, mapa)) {
      localStorage.removeItem("readerisoFavoritos");
      localStorage.removeItem("crimsonReaderFavorites");
    }
  }

  migrarDadosAntigos();
  migrarFavoritosAntigos();

  // ===== Livros =====

  // Todos os livros de todas as contas (uso interno)
  function listarTodos() {
    return lerBrutoPrincipal().map(normalizar).filter(Boolean);
  }

  // Só os livros da conta logada (escritor, biblioteca e estatísticas usam este)
  function listar() {
    const dono = idUsuario();
    return listarTodos().filter(livro => livro.autorId === dono);
  }

  // Livros publicados por qualquer conta (Explorar, leitura e favoritos)
  function listarPublicadas() {
    return listarTodos().filter(livro => livro.publicada);
  }

  function obter(id) {
    if (id === undefined || id === null) return null;
    return listarTodos().find(livro => livro.id === String(id)) || null;
  }

  function gerarCapitulo(titulo = "Capítulo 1", conteudo = "", alinhamento = "left") {
    return normalizarCapitulo({ titulo, conteudo, alinhamento }, 0);
  }

  // ===== Perfil (nome, bio e foto) =====
  function obterPerfil(id = idUsuario()) {
    const perfil = lerObjeto(CHAVE_PERFIL)[id];
    return perfil && typeof perfil === "object" ? perfil : {};
  }

  function salvarPerfil(dados, id = idUsuario()) {
    const mapa = lerObjeto(CHAVE_PERFIL);
    mapa[id] = { ...(mapa[id] || {}), ...dados };
    return gravarChave(CHAVE_PERFIL, mapa);
  }

  // Nome e foto atuais da conta que escreveu o livro
  function autorDe(livro) {
    const perfil = obterPerfil(livro.autorId);
    return {
      nome: perfil.nome || livro.autorNome || "Autor desconhecido",
      foto: perfil.foto || ""
    };
  }

  // ===== Favoritos =====
  function favoritosDe(usuario = idUsuario()) {
    const lista = lerObjeto(CHAVE_FAVORITOS)[usuario];
    return Array.isArray(lista) ? lista : [];
  }

  function ehFavorito(idLivro) {
    return favoritosDe().includes(String(idLivro));
  }

  // Adiciona ou remove. Devolve true se o livro ficou favoritado.
  function alternarFavorito(idLivro) {
    const dono = idUsuario();
    if (!dono) return false;

    const id = String(idLivro);
    const mapa = lerObjeto(CHAVE_FAVORITOS);
    const atuais = new Set(favoritosDe(dono));

    if (atuais.has(id)) atuais.delete(id);
    else atuais.add(id);

    mapa[dono] = [...atuais];
    gravarChave(CHAVE_FAVORITOS, mapa);
    return atuais.has(id);
  }

  function contarFavoritos(idLivro) {
    const id = String(idLivro);
    return Object.values(lerObjeto(CHAVE_FAVORITOS))
      .filter(lista => Array.isArray(lista) && lista.includes(id)).length;
  }

  // ===== Visualizações (1 por conta; o autor não conta) =====
  function registrarVisualizacao(idLivro) {
    const dono = idUsuario();
    const livro = obter(idLivro);
    if (!dono || !livro || livro.autorId === dono) return;

    const id = String(idLivro);
    const mapa = lerObjeto(CHAVE_VISUALIZACOES);
    const lista = Array.isArray(mapa[id]) ? mapa[id] : [];
    if (lista.includes(dono)) return;

    mapa[id] = [...lista, dono];
    gravarChave(CHAVE_VISUALIZACOES, mapa);
  }

  function contarVisualizacoes(idLivro) {
    const lista = lerObjeto(CHAVE_VISUALIZACOES)[String(idLivro)];
    return Array.isArray(lista) ? lista.length : 0;
  }

  // Texto de estatísticas mostrado ao autor
  function textoEstatisticas(idLivro) {
    const v = contarVisualizacoes(idLivro);
    const f = contarFavoritos(idLivro);
    return `👁 ${v} ${v === 1 ? "visualização" : "visualizações"} · ♥ ${f} ${f === 1 ? "favorito" : "favoritos"}`;
  }

  // Demonstração + publicadas de todas as contas, no mesmo formato de card
  function catalogo() {
    const dono = idUsuario();
    const publicadas = listarPublicadas()
      .filter(livro => livro.titulo)
      .map(livro => ({
        id: livro.id,
        titulo: livro.titulo,
        genero: livro.genero,
        descricao: livro.descricao || "Sem descrição.",
        autor: autorDe(livro).nome,
        capa: null,
        link: `biblioteca.html?ler=${encodeURIComponent(livro.id)}`,
        demo: false,
        propria: livro.autorId === dono
      }));

    return [...publicadas, ...livrosDemo.map(livro => ({ ...livro, propria: false }))];
  }

  // Evita que textos digitados pelo usuário virem HTML
  function escaparHTML(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, caractere => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[caractere]);
  }

  // Foto (se houver) ou inicial do nome, para os círculos de avatar
  function avatarHTML(nome, foto) {
    if (foto) return `<img src="${escaparHTML(foto)}" alt="">`;
    return escaparHTML((String(nome || "R").charAt(0) || "R").toUpperCase());
  }

  // Converte as marcações do editor (**negrito**, *itálico*, __sublinhado__,
  // ## título, - lista, > citação) em HTML para leitura
  function formatarTexto(texto) {
    const inline = linha => linha
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/__(.+?)__/g, "<u>$1</u>");

    const html = [];
    let lista = [];

    // Fecha a lista aberta antes de outro tipo de linha
    const fecharLista = () => {
      if (lista.length) html.push(`<ul>${lista.join("")}</ul>`);
      lista = [];
    };

    escaparHTML(texto).split("\n").forEach(linha => {
      if (/^- /.test(linha)) {
        lista.push(`<li>${inline(linha.slice(2))}</li>`);
        return;
      }

      fecharLista();

      if (/^## /.test(linha)) html.push(`<h4>${inline(linha.slice(3))}</h4>`);
      else if (/^&gt; /.test(linha)) html.push(`<blockquote>${inline(linha.slice(5))}</blockquote>`);
      else if (linha.trim()) html.push(`<p>${inline(linha)}</p>`);
      else html.push("<br>");
    });

    fecharLista();
    return html.join("");
  }

  window.Readeriso = {
    CHAVE,
    gerarId,
    novoCapitulo: gerarCapitulo,
    listar,
    listarPublicadas,
    catalogo,
    livrosDemo,
    escaparHTML,
    avatarHTML,
    formatarTexto,
    usuarioAtual,
    idUsuario,
    obter,
    obterPerfil,
    salvarPerfil,
    autorDe,
    ehFavorito,
    favoritosDe,
    alternarFavorito,
    contarFavoritos,
    registrarVisualizacao,
    contarVisualizacoes,
    textoEstatisticas,

    criar({ titulo = "", descricao = "", genero = "Outro" } = {}) {
      const dono = idUsuario();
      if (!dono) return null;

      const agora = Date.now();
      const livro = normalizar({
        id: gerarId(), titulo, descricao, genero, publicada: false,
        autorId: dono, autorNome: usuarioAtual().usuario,
        capitulos: [gerarCapitulo("Capítulo 1", "")],
        criadoEm: agora, atualizadoEm: agora
      });
      const lista = listarTodos();
      lista.push(livro);
      return gravar(lista) ? livro : null;
    },

    salvar(dados) {
      const livro = normalizar(dados);
      if (!livro) return false;

      const dono = idUsuario();
      const lista = listarTodos();
      const indice = lista.findIndex(item => item.id === livro.id);
      const existente = indice >= 0 ? lista[indice] : null;

      // Só o autor pode editar o próprio livro
      if (existente && existente.autorId && existente.autorId !== dono) return false;

      livro.autorId = existente?.autorId || dono;
      livro.autorNome = existente?.autorNome || usuarioAtual().usuario;
      livro.criadoEm = existente?.criadoEm || livro.criadoEm || Date.now();
      livro.atualizadoEm = Date.now();

      if (indice >= 0) lista[indice] = livro;
      else lista.push(livro);
      return gravar(lista);
    },

    excluir(id) {
      const livro = obter(id);
      if (!livro || livro.autorId !== idUsuario()) return false;

      // Apaga também favoritos e visualizações desse livro
      const favoritos = lerObjeto(CHAVE_FAVORITOS);
      for (const usuario of Object.keys(favoritos)) {
        if (Array.isArray(favoritos[usuario])) favoritos[usuario] = favoritos[usuario].filter(item => item !== livro.id);
      }
      gravarChave(CHAVE_FAVORITOS, favoritos);

      const visualizacoes = lerObjeto(CHAVE_VISUALIZACOES);
      delete visualizacoes[livro.id];
      gravarChave(CHAVE_VISUALIZACOES, visualizacoes);

      return gravar(listarTodos().filter(item => item.id !== livro.id));
    }
  };
})();