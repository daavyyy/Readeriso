// perfil.js — dados do usuário, foto, estatísticas e favoritos
(() => {
  "use strict";

  const TAMANHO_FOTO = 256; // a foto é reduzida para 256x256 para caber no localStorage

  // Corta a imagem em quadrado, reduz e devolve um texto (data URL) para guardar
  function prepararFoto(arquivo) {
    return new Promise((resolver, rejeitar) => {
      const leitor = new FileReader();
      leitor.onerror = () => rejeitar(new Error("leitura"));
      leitor.onload = () => {
        const imagem = new Image();
        imagem.onerror = () => rejeitar(new Error("imagem"));
        imagem.onload = () => {
          const lado = Math.min(imagem.width, imagem.height);
          const canvas = document.createElement("canvas");
          canvas.width = TAMANHO_FOTO;
          canvas.height = TAMANHO_FOTO;
          canvas.getContext("2d").drawImage(
            imagem,
            (imagem.width - lado) / 2, (imagem.height - lado) / 2, lado, lado,
            0, 0, TAMANHO_FOTO, TAMANHO_FOTO
          );
          resolver(canvas.toDataURL("image/jpeg", 0.85));
        };
        imagem.src = leitor.result;
      };
      leitor.readAsDataURL(arquivo);
    });
  }

  function iniciar() {
    const R = window.Readeriso;
    const escapar = R.escaparHTML;
    const doisDigitos = numero => String(numero).padStart(2, "0");

    // ===== Dados do usuário (guardados por conta) =====
    const usuario = R.usuarioAtual();
    const perfil = {
      nome: usuario.usuario,
      bio: "Apaixonado por livros, histórias e novos mundos.",
      foto: "",
      ...R.obterPerfil()
    };

    function mostrarPerfil() {
      document.getElementById("nomeUsuario").textContent = perfil.nome;
      document.getElementById("avatar").innerHTML = R.avatarHTML(perfil.nome, perfil.foto);
      document.getElementById("emailUsuario").textContent = usuario.email;
      document.getElementById("bioUsuario").textContent = perfil.bio;
    }

    // ===== Estatísticas =====
    function mostrarEstatisticas(totalFavoritos) {
      const historias = R.listar(); // só as desta conta
      const publicadas = historias.filter(livro => livro.publicada);
      const palavras = historias
        .flatMap(livro => livro.capitulos)
        .reduce((soma, capitulo) => soma + (capitulo.conteudo.trim() ? capitulo.conteudo.trim().split(/\s+/).length : 0), 0);

      const visualizacoes = publicadas.reduce((soma, livro) => soma + R.contarVisualizacoes(livro.id), 0);
      const favoritosRecebidos = publicadas.reduce((soma, livro) => soma + R.contarFavoritos(livro.id), 0);

      document.getElementById("totalHistorias").textContent = doisDigitos(historias.length);
      document.getElementById("totalPublicadas").textContent = doisDigitos(publicadas.length);
      document.getElementById("totalPalavras").textContent = palavras.toLocaleString("pt-BR");
      document.getElementById("totalVisualizacoes").textContent = visualizacoes.toLocaleString("pt-BR");
      document.getElementById("totalFavoritosRecebidos").textContent = favoritosRecebidos.toLocaleString("pt-BR");
      document.getElementById("totalFavoritos").textContent = doisDigitos(totalFavoritos);
    }

    // ===== Cards e favoritos =====
    function criarCard(livro) {
      const favorito = R.ehFavorito(livro.id);

      return `
        <article class="card-historia">
          <div class="capa-historia${livro.capa ? "" : " sem-capa"}">
            ${livro.capa
              ? `<img src="${escapar(livro.capa)}" alt="Capa de ${escapar(livro.titulo)}" loading="lazy">`
              : `<span aria-hidden="true">▧</span>`}
            <button type="button" class="btn-favorito" data-favorito="${escapar(livro.id)}"
              aria-pressed="${favorito}" aria-label="${favorito ? "Remover dos" : "Adicionar aos"} favoritos">
              ${favorito ? "♥" : "♡"}
            </button>
          </div>
          <p class="genero">${escapar(livro.genero.toUpperCase())}</p>
          <h3>${escapar(livro.titulo)}</h3>
          <p class="descricao-historia">${escapar(livro.descricao)}</p>
          <p class="autor-historia">${escapar(livro.autor)}</p>
          <a href="${escapar(livro.link)}" class="link-ver-todas">Ler ↗</a>
        </article>
      `;
    }

    function mostrarLivros() {
      const catalogo = R.catalogo();
      const sugestoes = catalogo.filter(livro => !livro.propria); // não favorita o próprio livro
      const escolhidos = catalogo.filter(livro => R.ehFavorito(livro.id));

      document.getElementById("gradeLivros").innerHTML = sugestoes.map(criarCard).join("");
      document.getElementById("gradeFavoritos").innerHTML = escolhidos.map(criarCard).join("");
      document.getElementById("semFavoritos").hidden = escolhidos.length > 0;
      mostrarEstatisticas(escolhidos.length);
    }

    // Coração: adiciona/remove dos favoritos desta conta
    document.addEventListener("click", evento => {
      const botao = evento.target.closest("[data-favorito]");
      if (!botao) return;

      R.alternarFavorito(botao.dataset.favorito);
      mostrarLivros();
    });

    // ===== Editar perfil =====
    const modal = document.getElementById("modalPerfil");
    const campoNome = document.getElementById("campoNome");
    const campoBio = document.getElementById("campoBio");
    const campoFoto = document.getElementById("campoFoto");
    const previaFoto = document.getElementById("previaFoto");
    const btnRemoverFoto = document.getElementById("btnRemoverFoto");
    const erroFoto = document.getElementById("erroFoto");

    let fotoTemporaria = ""; // só vira definitiva ao clicar em Salvar

    function mostrarPrevia() {
      previaFoto.innerHTML = R.avatarHTML(campoNome.value || perfil.nome, fotoTemporaria);
      btnRemoverFoto.hidden = !fotoTemporaria;
    }

    // Preenche o formulário ao abrir o modal
    modal.addEventListener("show.bs.modal", () => {
      campoNome.value = perfil.nome;
      campoBio.value = perfil.bio;
      fotoTemporaria = perfil.foto;
      erroFoto.textContent = "";
      mostrarPrevia();
    });

    campoNome.addEventListener("input", mostrarPrevia);

    campoFoto.addEventListener("change", async () => {
      const arquivo = campoFoto.files[0];
      if (!arquivo) return;

      erroFoto.textContent = "";
      if (!arquivo.type.startsWith("image/")) {
        erroFoto.textContent = "Escolha um arquivo de imagem.";
      } else {
        try {
          fotoTemporaria = await prepararFoto(arquivo);
          mostrarPrevia();
        } catch {
          erroFoto.textContent = "Não foi possível ler essa imagem.";
        }
      }
      campoFoto.value = "";
    });

    btnRemoverFoto.addEventListener("click", () => {
      fotoTemporaria = "";
      mostrarPrevia();
    });

    document.getElementById("formPerfil").addEventListener("submit", evento => {
      evento.preventDefault();

      const novo = {
        nome: campoNome.value.trim() || usuario.usuario,
        bio: campoBio.value.trim(),
        foto: fotoTemporaria
      };

      if (!R.salvarPerfil(novo)) {
        erroFoto.textContent = "Não foi possível salvar. Tente uma foto menor.";
        return;
      }

      Object.assign(perfil, novo);
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