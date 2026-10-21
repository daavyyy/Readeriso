// sites.js — lista de sites por categoria (accordion do Bootstrap) com busca

// Para adicionar um site, coloque um item na categoria certa.
// "dominio" é usado para buscar o ícone do site.
const categorias = [
  {
    id: "livros",
    nome: "📚 Livros e ebooks",
    sites: [
      { nome: "Amazon Kindle", descricao: "Livros digitais e ebooks da Amazon.", link: "https://www.amazon.com.br/kindle-dbs/hub", dominio: "amazon.com.br" },
      { nome: "Google Play Livros", descricao: "Compre e leia livros digitais pelo Google.", link: "https://play.google.com/store/books", dominio: "play.google.com" },
      { nome: "Kobo", descricao: "Livros digitais e ebooks para leitura.", link: "https://www.kobo.com", dominio: "kobo.com" },
      { nome: "MEC Livros", descricao: "Acervo de livros e conteúdos educacionais.", link: "https://meclivros.mec.gov.br/", dominio: "meclivros.mec.gov.br" },
      { nome: "Fliptru", descricao: "Plataforma brasileira para ler e publicar histórias.", link: "https://fliptru.com.br/", dominio: "fliptru.com.br" },
      { nome: "Domínio Público", descricao: "Biblioteca digital pública do Brasil.", link: "https://www.dominiopublico.gov.br", dominio: "dominiopublico.gov.br" },
      { nome: "Project Gutenberg", descricao: "Grande acervo de ebooks gratuitos.", link: "https://www.gutenberg.org", dominio: "gutenberg.org" },
      { nome: "Open Library", descricao: "Catálogo digital com milhões de livros.", link: "https://openlibrary.org", dominio: "openlibrary.org" },
      { nome: "LibriVox", descricao: "Audiolivros gratuitos em domínio público.", link: "https://librivox.org", dominio: "librivox.org" },
      { nome: "Standard Ebooks", descricao: "Ebooks gratuitos com formatação de qualidade.", link: "https://standardebooks.org", dominio: "standardebooks.org" },
      { nome: "ManyBooks", descricao: "Catálogo de livros digitais gratuitos e pagos.", link: "https://manybooks.net", dominio: "manybooks.net" },
      { nome: "Biblioteca Brasiliana USP", descricao: "Acervo digital da Universidade de São Paulo.", link: "https://www.brasiliana.usp.br", dominio: "brasiliana.usp.br" },
      { nome: "Bibvirt", descricao: "Biblioteca virtual com conteúdos digitais.", link: "http://www.bibvirt.futuro.usp.br", dominio: "bibvirt.futuro.usp.br" },
      { nome: "Skoob", descricao: "Rede social para leitores e amantes de livros.", link: "https://www.skoob.com.br", dominio: "skoob.com.br" }
    ]
  },
  {
    id: "mangas",
    nome: "📖 Mangás, quadrinhos e webtoons",
    sites: [
      { nome: "Manga Plus", descricao: "Leia mangás publicados pela Shueisha.", link: "https://mangaplus.shueisha.co.jp", dominio: "mangaplus.shueisha.co.jp" },
      { nome: "MangaDex", descricao: "Mangás de diversos idiomas e obras.", link: "https://mangadex.org", dominio: "mangadex.org" },
      { nome: "LINE Webtoon", descricao: "Grande plataforma de webtoons e quadrinhos.", link: "https://www.webtoons.com", dominio: "webtoons.com" },
      { nome: "Tapas", descricao: "Webcomics, novels e histórias independentes.", link: "https://tapas.io", dominio: "tapas.io" },
      { nome: "Crunchyroll Manga", descricao: "Catálogo de mangás da Crunchyroll.", link: "https://www.crunchyroll.com/comics/manga", dominio: "crunchyroll.com" },
      { nome: "Viz Manga", descricao: "Biblioteca digital de mangás da VIZ.", link: "https://www.viz.com/read", dominio: "viz.com" },
      { nome: "Comixology", descricao: "Plataforma de quadrinhos da Amazon.", link: "https://www.amazon.com/comixology", dominio: "amazon.com" }
    ]
  },
  {
    id: "noticias",
    nome: "📰 Notícias e artigos",
    sites: [
      { nome: "Google Notícias", descricao: "Agregador de notícias de diferentes fontes.", link: "https://news.google.com", dominio: "news.google.com" },
      { nome: "Feedly", descricao: "Organize notícias e conteúdos em um só lugar.", link: "https://feedly.com", dominio: "feedly.com" },
      { nome: "Flipboard", descricao: "Descubra notícias e artigos personalizados.", link: "https://flipboard.com", dominio: "flipboard.com" },
      { nome: "Pocket", descricao: "Salve artigos e conteúdos para ler depois.", link: "https://getpocket.com", dominio: "getpocket.com" },
      { nome: "G1", descricao: "Portal de notícias do Brasil e do mundo.", link: "https://g1.globo.com", dominio: "g1.globo.com" },
      { nome: "Folha de S.Paulo", descricao: "Notícias, análises e artigos.", link: "https://www.folha.uol.com.br", dominio: "folha.uol.com.br" },
      { nome: "UOL", descricao: "Portal com notícias, informações e conteúdos.", link: "https://www.uol.com.br", dominio: "uol.com.br" },
      { nome: "BBC Brasil", descricao: "Notícias e reportagens em português.", link: "https://www.bbc.com/portuguese", dominio: "bbc.com" },
      { nome: "Medium", descricao: "Artigos, histórias e textos de diversos autores.", link: "https://medium.com", dominio: "medium.com" }
    ]
  },
  {
    id: "fanfics",
    nome: "✍️ Fanfics",
    sites: [
      { nome: "Archive of Our Own", descricao: "Grande arquivo de fanfics e obras de fãs.", link: "https://archiveofourown.org", dominio: "archiveofourown.org" },
      { nome: "Wattpad", descricao: "Plataforma para ler e publicar histórias.", link: "https://www.wattpad.com", dominio: "wattpad.com" },
      { nome: "Spirit Fanfics", descricao: "Plataforma brasileira de fanfics e histórias.", link: "https://spiritfanfiction.com", dominio: "spiritfanfiction.com" },
      { nome: "FanFiction.net", descricao: "Comunidade para publicação e leitura de fanfics.", link: "https://www.fanfiction.net", dominio: "fanfiction.net" },
      { nome: "Social Spirit", descricao: "Plataforma brasileira de histórias e fanfics.", link: "https://socialspirit.com.br", dominio: "socialspirit.com.br" }
    ]
  }
];

// Remove acentos e deixa minúsculo, para a busca ignorar maiúsculas/acentos
function normalizar(texto) {
  return String(texto).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// Card de um site (abre em nova aba)
function criarCardSite(site) {
  return `
    <a class="site-card" href="${site.link}" target="_blank" rel="noopener noreferrer">
      <img src="https://www.google.com/s2/favicons?domain=${site.dominio}&sz=128" alt="" loading="lazy">
      <h3>${site.nome}</h3>
      <p>${site.descricao}</p>
      <span class="acessar">Acessar ↗</span>
    </a>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const accordion = document.getElementById("accordionSites");
  const resultados = document.getElementById("resultadosBusca");
  const semResultado = document.getElementById("semResultado");
  const campo = document.getElementById("campoBusca");
  const titulo = document.getElementById("tituloSites");
  const descricao = document.getElementById("descricaoSites");
  const total = categorias.reduce((soma, categoria) => soma + categoria.sites.length, 0);

  // Monta o accordion (a primeira categoria começa aberta)
  accordion.innerHTML = categorias.map((categoria, indice) => `
    <div class="accordion-item">
      <h3 class="accordion-header">
        <button class="accordion-button${indice ? " collapsed" : ""}" type="button"
          data-bs-toggle="collapse" data-bs-target="#${categoria.id}"
          aria-expanded="${indice === 0}" aria-controls="${categoria.id}">
          ${categoria.nome}
          <span class="quantidade">${categoria.sites.length} sites</span>
        </button>
      </h3>
      <div id="${categoria.id}" class="accordion-collapse collapse${indice ? "" : " show"}" data-bs-parent="#accordionSites">
        <div class="accordion-body">
          <div class="sites-grid">${categoria.sites.map(criarCardSite).join("")}</div>
        </div>
      </div>
    </div>
  `).join("");

  descricao.textContent = `${total} sites em ${categorias.length} categorias.`;

  // Busca: troca o accordion por uma grade só com os resultados
  function buscar() {
    const termo = normalizar(campo.value);

    if (!termo) {
      accordion.hidden = false;
      resultados.hidden = true;
      semResultado.hidden = true;
      titulo.innerHTML = "Todos os sites<span>.</span>";
      descricao.textContent = `${total} sites em ${categorias.length} categorias.`;
      return;
    }

    const encontrados = categorias
      .flatMap(categoria => categoria.sites)
      .filter(site => normalizar(`${site.nome} ${site.descricao}`).includes(termo));

    accordion.hidden = true;
    resultados.innerHTML = encontrados.map(criarCardSite).join("");
    resultados.hidden = encontrados.length === 0;
    semResultado.hidden = encontrados.length > 0;
    titulo.innerHTML = "Resultados<span>.</span>";
    descricao.textContent = `${encontrados.length} site(s) encontrado(s).`;
  }

  campo.addEventListener("input", buscar);
  document.getElementById("formBusca").addEventListener("submit", evento => evento.preventDefault());
});
