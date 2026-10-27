// sites.js — lista de sites por categoria (accordion do Bootstrap) com busca

// Para adicionar um site, coloque um item na categoria certa.
// "dominio" é usado para buscar o ícone do site.
const categorias = [
  {
    id: "livros",
    nome: "📚 Livros e ebooks",
    sites: [
      { nome: "MEC Livros", descricao: "Biblioteca digital pública com livros gratuitos.", link: "https://meclivros.mec.gov.br/", dominio: "meclivros.mec.gov.br" },
      { nome: "Amazon Kindle", descricao: "Livros digitais e ebooks da Amazon.", link: "https://www.amazon.com.br/kindle-dbs/hub", dominio: "amazon.com.br" },
      { nome: "Google Play Livros", descricao: "Compre e leia livros digitais pelo Google.", link: "https://play.google.com/store/books", dominio: "play.google.com" },
      { nome: "Kobo", descricao: "Livros digitais e ebooks para leitura.", link: "https://www.kobo.com", dominio: "kobo.com" },
      { nome: "SciELO Livros — Fiocruz", descricao: "Livros acadêmicos e científicos.", link: "https://books.scielo.org/fiocruz/", dominio: "books.scielo.org" },
      { nome: "Biblion", descricao: "Plataforma digital de leitura e acesso a livros.", link: "https://biblion.org.br/", dominio: "biblion.org.br" },
      { nome: "Project Gutenberg", descricao: "Grande acervo de ebooks gratuitos.", link: "https://www.gutenberg.org", dominio: "gutenberg.org" },
      { nome: "Domínio Público", descricao: "Biblioteca digital pública brasileira.", link: "https://www.dominiopublico.gov.br", dominio: "dominiopublico.gov.br" },
      { nome: "Open Library", descricao: "Catálogo digital com milhões de livros.", link: "https://openlibrary.org", dominio: "openlibrary.org" },
      { nome: "Biblioteca Brasiliana USP", descricao: "Acervo digital da Universidade de São Paulo.", link: "https://www.brasiliana.usp.br", dominio: "brasiliana.usp.br" },
      { nome: "InfoLivros", descricao: "Plataforma com livros digitais e ebooks gratuitos.", link: "https://infolivros.org/", dominio: "infolivros.org" },
      { nome: "Livraria Pública", descricao: "Site dedicado a livros e conteúdos para leitura.", link: "https://livrariapublica.com.br/", dominio: "livrariapublica.com.br" },
      { nome: "BaixeLivros", descricao: "Catálogo de livros digitais.", link: "https://www.baixelivros.com.br/", dominio: "baixelivros.com.br" },
      { nome: "Biblioclube", descricao: "Site relacionado a livros e experiências de leitura.", link: "https://biblioclube.com.br/", dominio: "biblioclube.com.br" },
      { nome: "eLivros", descricao: "Plataforma de livros digitais.", link: "https://elivros.info/", dominio: "elivros.info" },
      { nome: "LiteraMundo", descricao: "Site voltado à literatura e à descoberta de livros.", link: "https://literamundo.com.br/", dominio: "literamundo.com.br" },
      { nome: "Amazon — Ebooks", descricao: "Catálogo de ebooks da loja Kindle.", link: "https://www.amazon.com.br/s?bbn=6311441011&rh=n%3A5308307011%2Cn%3A6311441011%2Cn%3A5475882011%2Cn%3A5559904011&dc&linkCode=sl2&linkId=befc25db19b7908996cc4910d4751c6e&qid=1776986763&rnid=18726358011&tag=livrariapubli-20&ref=as_li_ss_tl", dominio: "amazon.com.br" },
      { nome: "Dlivros", descricao: "Catálogo online de livros digitais.", link: "https://dlivros.com/livro/mais-obrigado-pelos-peixes-guia-mochileiro-galaxias-4-douglas-adams", dominio: "dlivros.com" }
    ]
  },
  {
    id: "mangas",
    nome: "📖 Mangás, quadrinhos e webtoons",
    sites: [
      { nome: "Manga Plus", descricao: "Leia mangás oficiais publicados pela Shueisha.", link: "https://mangaplus.shueisha.co.jp", dominio: "mangaplus.shueisha.co.jp" },
      { nome: "LINE Webtoon", descricao: "Grande plataforma de webtoons e quadrinhos.", link: "https://www.webtoons.com", dominio: "webtoons.com" },
      { nome: "Tapas", descricao: "Webcomics, novels e histórias independentes.", link: "https://tapas.io", dominio: "tapas.io" },
      { nome: "Marvel Comics", descricao: "HQs da Marvel e guia de edições gratuitas.", link: "https://www.marvel.com/comics/guides/2421/get_started_with_free_issues", dominio: "marvel.com" },
      { nome: "Crunchyroll Manga", descricao: "Página de quadrinhos e mangás da Crunchyroll.", link: "https://www.crunchyroll.com/comics/manga", dominio: "crunchyroll.com" },
      { nome: "Comixology", descricao: "Plataforma de quadrinhos digitais da Amazon.", link: "https://www.amazon.com/comixology", dominio: "amazon.com" },
      { nome: "WebComics", descricao: "Plataforma de quadrinhos digitais.", link: "https://www.webcomicsapp.com/pt/", dominio: "webcomicsapp.com" },
      { nome: "MangaDex", descricao: "Catálogo de mangás em diversos idiomas.", link: "https://mangadex.org", dominio: "mangadex.org" },
      { nome: "Novel Mania", descricao: "Plataforma voltada a novels e histórias seriadas.", link: "https://novelmania.com.br/", dominio: "novelmania.com.br" },
      { nome: "Central Novel", descricao: "Site dedicado a novels e histórias.", link: "https://centralnovel.com/", dominio: "centralnovel.com" },
      { nome: "Webnovel", descricao: "Plataforma de novels, fantasia e histórias seriadas.", link: "https://www.webnovel.com/pt/", dominio: "webnovel.com" },
      { nome: "Mahou Reader", descricao: "Site de leitura de novels.", link: "https://mahoureader.com/novel", dominio: "mahoureader.com" },
      { nome: "MangaZona", descricao: "Site dedicado à leitura de mangás.", link: "https://www.mangazona.com/pt/", dominio: "mangazona.com" },
      { nome: "GoMangas", descricao: "Plataforma dedicada a mangás.", link: "https://gomangas.com/", dominio: "gomangas.com" },
      { nome: "AuraToons", descricao: "Site de histórias em quadrinhos digitais.", link: "https://auratoons.com/", dominio: "auratoons.com" },
      { nome: "ManHQ", descricao: "Plataforma de quadrinhos e HQs.", link: "https://manhq.com.br/home", dominio: "manhq.com.br" },
      { nome: "MangaStop", descricao: "Site dedicado a mangás e leitura online.", link: "https://mangastop.net/", dominio: "mangastop.net" },
      { nome: "BlitzToons", descricao: "Plataforma de quadrinhos e webtoons.", link: "https://blitztoons.com/", dominio: "blitztoons.com" },
      { nome: "Leitor de Mangás", descricao: "Site voltado à leitura de mangás.", link: "https://leitordemangas.com/", dominio: "leitordemangas.com" },
      { nome: "RebManga", descricao: "Plataforma de mangás em português.", link: "https://www.rebmanga.com/pt/", dominio: "rebmanga.com" },
      { nome: "NexusToons", descricao: "Site dedicado a webtoons e quadrinhos.", link: "https://nexustoons.com/", dominio: "nexustoons.com" },
      { nome: "HQ Zone", descricao: "Plataforma de histórias em quadrinhos.", link: "https://hqzone.com.br/", dominio: "hqzone.com.br" },
      { nome: "Taverna de Quadrinhos", descricao: "Site dedicado ao universo das HQs.", link: "https://tavernadequadrinhos.com.br/", dominio: "tavernadequadrinhos.com.br" },
      { nome: "HQ-Now", descricao: "Site dedicado a histórias em quadrinhos.", link: "https://www.hq-now.com/", dominio: "hq-now.com" },
      { nome: "Zona Fantasma", descricao: "Site com conteúdos relacionados a quadrinhos.", link: "https://zonafantasmanet.wordpress.com/", dominio: "zonafantasmanet.wordpress.com" },
      { nome: "HQ Isso", descricao: "Site de quadrinhos e conteúdos relacionados a HQs.", link: "https://hqqisso.com.br/", dominio: "hqqisso.com.br" },
      { nome: "Mikan HQ", descricao: "Site dedicado a histórias em quadrinhos.", link: "https://www.mikanhq.com.br/", dominio: "mikanhq.com.br" }
    ]
  },
  {
    id: "noticias",
    nome: "📰 Notícias e artigos",
    sites: [
      { nome: "BBC Brasil", descricao: "Notícias e reportagens em português.", link: "https://www.bbc.com/portuguese", dominio: "bbc.com" },
      { nome: "G1", descricao: "Portal de notícias do Brasil e do mundo.", link: "https://g1.globo.com", dominio: "g1.globo.com" },
      { nome: "CNN Brasil", descricao: "Notícias nacionais e internacionais.", link: "https://www.cnnbrasil.com.br/", dominio: "cnnbrasil.com.br" },
      { nome: "Google Notícias", descricao: "Agregador de notícias de diferentes fontes.", link: "https://news.google.com", dominio: "news.google.com" },
      { nome: "Folha de S.Paulo", descricao: "Notícias, análises e artigos.", link: "https://www.folha.uol.com.br", dominio: "folha.uol.com.br" },
      { nome: "UOL", descricao: "Portal com notícias, informações e conteúdos.", link: "https://www.uol.com.br", dominio: "uol.com.br" },
      { nome: "PressReader", descricao: "Acesso a jornais e revistas de diferentes países.", link: "https://www.pressreader.com/pt-br/newspapers?free=true", dominio: "pressreader.com" },
      { nome: "Flipboard", descricao: "Descubra notícias e artigos personalizados.", link: "https://flipboard.com", dominio: "flipboard.com" },
      { nome: "ICL Notícias", descricao: "Portal brasileiro de notícias e análises.", link: "https://iclnoticias.com.br/", dominio: "iclnoticias.com.br" },
      { nome: "The News", descricao: "Newsletter com notícias e informações em poucos minutos.", link: "https://thenewscc.beehiiv.com/", dominio: "thenewscc.beehiiv.com" },
      { nome: "Hube Jornais", descricao: "Plataforma relacionada a jornais e publicações.", link: "https://www.hubejornais.com.br/", dominio: "hubejornais.com.br" }
    ]
  },
  {
    id: "fanfics",
    nome: "✍️ Fanfics",
    sites: [
      { nome: "Archive of Our Own", descricao: "Grande arquivo de fanfics e obras de fãs.", link: "https://archiveofourown.org", dominio: "archiveofourown.org" },
      { nome: "FanFiction.net", descricao: "Comunidade para publicação e leitura de fanfics.", link: "https://www.fanfiction.net", dominio: "fanfiction.net" },
      { nome: "Wattpad", descricao: "Plataforma para ler e publicar histórias.", link: "https://www.wattpad.com", dominio: "wattpad.com" },
      { nome: "Spirit Fanfics", descricao: "Plataforma brasileira de fanfics e histórias.", link: "https://spiritfanfiction.com", dominio: "spiritfanfiction.com" },
      { nome: "Fanficando", descricao: "Site dedicado à leitura e publicação de fanfics.", link: "https://www.fanficando.com/", dominio: "fanficando.com" },
      { nome: "Fanficia", descricao: "Plataforma para explorar histórias e fanfics.", link: "https://fanficia.com/pt/browse", dominio: "fanficia.com" },
      { nome: "Fanfy", descricao: "Plataforma para descobrir e ler fanfics.", link: "https://fanfy.studio/pt/read", dominio: "fanfy.studio" }
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
