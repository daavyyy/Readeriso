// perfil.js — dados do usuário, estatísticas e favoritos
(() => {
  "use strict";

  const CHAVE_FAVORITOS = "readerisoFavoritos";
  const CHAVE_PERFIL = "readerisoPerfil";

  // Livros que podem ser favoritados (mesmos do Explorar)
  const livros = [
    { id: "fantasia", titulo: "Fantasia", genero: "Fantasia", descricao: "Um reino à beira do fim guarda um segredo esquecido.", capa: "livro.teste/1.png", link: "livro.teste/fantasia.txt" },
    { id: "romance", titulo: "Romance", genero: "Romance", descricao: "Duas pessoas descobrem o que nunca conseguiram dizer.", capa: "livro.teste/2.png", link: "livro.teste/romance.txt" },
    { id: "yaoi", titulo: "Yaoi", genero: "Yaoi", descricao: "Um encontro inesperado muda tudo o que eles sabiam.", capa: "livro.teste/3.png", link: "livro.teste/yaoi.txt" }
  ];

  function lerJSON(chave, padrao) {
    try {
      return JSON.parse(localStorage.getItem(chave)) ?? padrao;
    } catch {
      return padrao;
    }
  }

  function iniciar() {
    const R = window.Readeriso;
    const escapar = R.escaparHTML;
    const doisDigitos = numero => String(numero).padStart(2, "0");

    // Favoritos (aproveita a chave antiga, se existir)
    const favoritos = new Set(lerJSON(CHAVE_FAVORITOS, null) ?? lerJSON("crimsonReaderFavorites", []));

    // ===== Dados do usuário =====
    const usuario = R.usuarioAtual();
    // Nome e bio editados ficam guardados por e-mail
    const perfis = lerJSON(CHAVE_PERFIL, {});
    const perfil = {
      nome: usuario.usuario,
      bio: "Apaixonado por livros, histórias e novos mundos.",
      ...(perfis[usuario.email] || {})
    };

    function mostrarPerfil() {
      document.getElementById("nomeUsuario").textContent = perfil.nome;
      document.getElementById("avatar").textContent = perfil.nome.charAt(0).toUpperCase() || "R";
      document.getElementById("emailUsuario").textContent = usuario.email;
      document.getElementById("bioUsuario").textContent = perfil.bio;
    }

    // ===== Estatísticas das histórias escritas =====
    function mostrarEstatisticas() {
      const historias = R.listar();
      const palavras = historias
        .flatMap(livro => livro.capitulos)
        .reduce((soma, capitulo) => soma + (capitulo.conteudo.trim() ? capitulo.conteudo.trim().split(/\s+/).length : 0), 0);

      document.getElementById("totalHistorias").textContent = doisDigitos(historias.length);
      document.getElementById("totalPublicadas").textContent = doisDigitos(historias.filter(livro => livro.publicada).length);
      document.getElementById("totalPalavras").textContent = palavras.toLocaleString("pt-BR");
      document.getElementById("totalFavoritos").textContent = doisDigitos(favoritos.size);
    }

    // ===== Cards e favoritos =====
    function criarCard(livro) {
      const favorito = favoritos.has(livro.id);

      return `
        <article class="card-historia">
          <div class="capa-historia">
            <img src="${escapar(livro.capa)}" alt="Capa de ${escapar(livro.titulo)}" loading="lazy">
            <button type="button" class="btn-favorito" data-favorito="${livro.id}"
              aria-pressed="${favorito}" aria-label="${favorito ? "Remover dos" : "Adicionar aos"} favoritos">
              ${favorito ? "♥" : "♡"}
            </button>
          </div>
          <p class="genero">${escapar(livro.genero.toUpperCase())}</p>
          <h3>${escapar(livro.titulo)}</h3>
          <p class="descricao-historia">${escapar(livro.descricao)}</p>
          <a href="${escapar(livro.link)}" class="link-ver-todas">Ler ↗</a>
        </article>
      `;
    }

    function mostrarLivros() {
      const escolhidos = livros.filter(livro => favoritos.has(livro.id));

      document.getElementById("gradeLivros").innerHTML = livros.map(criarCard).join("");
      document.getElementById("gradeFavoritos").innerHTML = escolhidos.map(criarCard).join("");
      document.getElementById("semFavoritos").hidden = escolhidos.length > 0;
      mostrarEstatisticas();
    }

    // Coração: adiciona/remove dos favoritos
    document.addEventListener("click", evento => {
      const botao = evento.target.closest("[data-favorito]");
      if (!botao) return;

      const id = botao.dataset.favorito;
      if (favoritos.has(id)) favoritos.delete(id);
      else favoritos.add(id);

      localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify([...favoritos]));
      mostrarLivros();
    });

    // ===== Editar perfil =====
    const modal = document.getElementById("modalPerfil");
    const campoNome = document.getElementById("campoNome");
    const campoBio = document.getElementById("campoBio");

    // Preenche o formulário ao abrir o modal
    modal.addEventListener("show.bs.modal", () => {
      campoNome.value = perfil.nome;
      campoBio.value = perfil.bio;
    });

    document.getElementById("formPerfil").addEventListener("submit", evento => {
      evento.preventDefault();

      perfil.nome = campoNome.value.trim() || usuario.usuario;
      perfil.bio = campoBio.value.trim();
      perfis[usuario.email] = { nome: perfil.nome, bio: perfil.bio };
      localStorage.setItem(CHAVE_PERFIL, JSON.stringify(perfis));

      mostrarPerfil();
      bootstrap.Modal.getInstance(modal).hide();
    });

    // Sair da conta (função do auth.js)
    document.getElementById("btnSair").addEventListener("click", sairDaConta);

    mostrarPerfil();
    mostrarLivros();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
