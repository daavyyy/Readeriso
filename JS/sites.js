// sites.js — lista de sites por categoria (accordion do Bootstrap) com busca

// Para adicionar um site, coloque um item na categoria certa.
// "dominio" é usado para buscar o ícone do site.
const categorias = [
  {
    id: "livros",
    nome: "📚 Livros e ebooks",
    sites: [
      { nome: "MEC Livros", descricao: "Biblioteca digital pública do Ministério da Educação, com acesso a livros gratuitos de diferentes áreas e opções para descobrir novas leituras sem custo.", link: "https://meclivros.mec.gov.br/", dominio: "meclivros.mec.gov.br" },
      { nome: "Amazon Kindle", descricao: "Loja e plataforma de leitura digital da Amazon, com ebooks pagos, títulos gratuitos e opções para ler em dispositivos compatíveis ou no aplicativo Kindle.", link: "https://www.amazon.com.br/kindle-dbs/hub", dominio: "amazon.com.br" },
      { nome: "Google Play Livros", descricao: "Loja digital do Google para comprar, organizar e ler ebooks e audiolivros em dispositivos compatíveis, com amostras disponíveis para conhecer algumas obras.", link: "https://play.google.com/store/books", dominio: "play.google.com" },
      { nome: "Kobo", descricao: "Plataforma de livros digitais com catálogo de ebooks para comprar e títulos gratuitos, além de ferramentas de leitura em dispositivos e aplicativos compatíveis.", link: "https://www.kobo.com", dominio: "kobo.com" },
      { nome: "SciELO Livros — Fiocruz", descricao: "Catálogo de livros acadêmicos e científicos ligado à rede SciELO e à Fiocruz, útil para encontrar publicações de pesquisa e materiais de estudo.", link: "https://books.scielo.org/fiocruz/", dominio: "books.scielo.org" },
      { nome: "Biblion", descricao: "Biblioteca digital gratuita do Estado de São Paulo, com catálogo de livros digitais e recursos para leitores que desejam acessar obras pela internet.", link: "https://biblion.org.br/", dominio: "biblion.org.br" },
      { nome: "Project Gutenberg", descricao: "Acervo digital com milhares de ebooks gratuitos, especialmente obras em domínio público, disponíveis em diferentes formatos para leitura e download.", link: "https://www.gutenberg.org", dominio: "gutenberg.org" },
      { nome: "Domínio Público", descricao: "Biblioteca digital pública brasileira que reúne obras literárias, artísticas e acadêmicas em domínio público para consulta e acesso gratuito.", link: "https://www.dominiopublico.gov.br", dominio: "dominiopublico.gov.br" },
      { nome: "Open Library", descricao: "Catálogo colaborativo de livros que ajuda a pesquisar edições, autores e informações bibliográficas, além de oferecer empréstimo digital de títulos elegíveis.", link: "https://openlibrary.org", dominio: "openlibrary.org" },
      { nome: "Biblioteca Brasiliana USP", descricao: "Acervo digital da Universidade de São Paulo com livros, documentos e outras obras históricas, disponível para pesquisa e consulta online.", link: "https://www.brasiliana.usp.br", dominio: "brasiliana.usp.br" },
      { nome: "InfoLivros", descricao: "Plataforma que reúne livros digitais gratuitos em várias áreas, com opções para ler online ou baixar arquivos em PDF quando disponíveis.", link: "https://infolivros.org/", dominio: "infolivros.org" },
      { nome: "Livraria Pública", descricao: "Site dedicado à descoberta e ao compartilhamento de livros e conteúdos de leitura, reunindo materiais digitais em um catálogo acessível pela internet.", link: "https://livrariapublica.com.br/", dominio: "livrariapublica.com.br" },
      { nome: "BaixeLivros", descricao: "Catálogo online de livros digitais que permite explorar títulos de diferentes temas e consultar as opções de acesso disponibilizadas no próprio site.", link: "https://www.baixelivros.com.br/", dominio: "baixelivros.com.br" },
      { nome: "Biblioclube", descricao: "Site relacionado ao universo dos livros e às experiências de leitura, voltado a quem deseja conhecer conteúdos e iniciativas literárias.", link: "https://biblioclube.com.br/", dominio: "biblioclube.com.br" },
      { nome: "eLivros", descricao: "Plataforma de livros digitais para explorar títulos e encontrar conteúdos de leitura organizados em um catálogo online.", link: "https://elivros.info/", dominio: "elivros.info" },
      { nome: "LiteraMundo", descricao: "Site voltado à literatura e à descoberta de livros, que pode ajudar leitores a explorar títulos e conteúdos relacionados ao mundo literário.", link: "https://literamundo.com.br/", dominio: "literamundo.com.br" },
      { nome: "Amazon — Ebooks", descricao: "Seção da Amazon dedicada a ebooks, com catálogo de livros digitais de diferentes gêneros e opções de compra para leitura em dispositivos compatíveis.", link: "https://www.amazon.com.br/s?bbn=6311441011&rh=n%3A5308307011%2Cn%3A6311441011%2Cn%3A5475882011%2Cn%3A5559904011&dc&linkCode=sl2&linkId=befc25db19b7908996cc4910d4751c6e&qid=1776986763&rnid=18726358011&tag=livrariapubli-20&ref=as_li_ss_tl", dominio: "amazon.com.br" },
      { nome: "Dlivros", descricao: "Catálogo online de livros digitais com páginas de títulos específicos, permitindo explorar obras e consultar as informações e opções de acesso disponíveis.", link: "https://dlivros.com/livro/mais-obrigado-pelos-peixes-guia-mochileiro-galaxias-4-douglas-adams", dominio: "dlivros.com" }
    ]
  },
  {
    id: "mangas",
    nome: "📖 Mangás, quadrinhos e webtoons",
    sites: [
      { nome: "Manga Plus", descricao: "Serviço oficial de leitura de mangás da Shueisha, com capítulos de diversas séries e publicação de conteúdos selecionados em vários idiomas.", link: "https://mangaplus.shueisha.co.jp", dominio: "mangaplus.shueisha.co.jp" },
      { nome: "LINE Webtoon", descricao: "Plataforma de webtoons e quadrinhos digitais com séries de diferentes gêneros, episódios em formato vertical e obras de criadores independentes.", link: "https://www.webtoons.com", dominio: "webtoons.com" },
      { nome: "Tapas", descricao: "Plataforma de quadrinhos digitais e novels que reúne séries independentes e histórias seriadas, com opções para descobrir novos criadores e acompanhar capítulos.", link: "https://tapas.io", dominio: "tapas.io" },
      { nome: "Marvel Comics", descricao: "Portal oficial da Marvel para explorar quadrinhos, personagens e edições, incluindo um guia de entrada com informações sobre algumas edições gratuitas.", link: "https://www.marvel.com/comics/guides/2421/get_started_with_free_issues", dominio: "marvel.com" },
      { nome: "Crunchyroll Manga", descricao: "Área de quadrinhos e mangás associada à Crunchyroll, voltada à descoberta de publicações digitais; a disponibilidade pode variar conforme região e serviço.", link: "https://www.crunchyroll.com/comics/manga", dominio: "crunchyroll.com" },
      { nome: "Comixology", descricao: "Plataforma de quadrinhos digitais associada à Amazon, com catálogo de HQs e edições para leitura digital em dispositivos compatíveis.", link: "https://www.amazon.com/comixology", dominio: "amazon.com" },
      { nome: "WebComics", descricao: "Aplicativo e plataforma de quadrinhos digitais com histórias seriadas de diferentes gêneros, incluindo romances, fantasia e aventuras.", link: "https://www.webcomicsapp.com/pt/", dominio: "webcomicsapp.com" },
      { nome: "MangaDex", descricao: "Catálogo comunitário de mangás com obras em diversos idiomas, páginas de séries e capítulos organizados para facilitar a descoberta de títulos.", link: "https://mangadex.org", dominio: "mangadex.org" },
      { nome: "Novel Mania", descricao: "Plataforma brasileira voltada a novels e histórias seriadas, onde leitores podem explorar obras e acompanhar capítulos publicados online.", link: "https://novelmania.com.br/", dominio: "novelmania.com.br" },
      { nome: "Central Novel", descricao: "Site dedicado à leitura de novels e histórias em capítulos, com um catálogo para descobrir narrativas seriadas de diferentes estilos.", link: "https://centralnovel.com/", dominio: "centralnovel.com" },
      { nome: "Webnovel", descricao: "Plataforma de novels e histórias seriadas com catálogo amplo, incluindo fantasia, ação, romance e obras publicadas em capítulos.", link: "https://www.webnovel.com/pt/", dominio: "webnovel.com" },
      { nome: "Mahou Reader", descricao: "Site voltado à leitura de novels, com páginas de obras e capítulos para quem acompanha histórias seriadas online.", link: "https://mahoureader.com/novel", dominio: "mahoureader.com" },
      { nome: "MangaZona", descricao: "Site dedicado à leitura de mangás, com páginas de séries e capítulos organizados para navegar pelo catálogo disponível.", link: "https://www.mangazona.com/pt/", dominio: "mangazona.com" },
      { nome: "GoMangas", descricao: "Plataforma dedicada a mangás, com títulos e capítulos para leitores que desejam explorar quadrinhos japoneses online.", link: "https://gomangas.com/", dominio: "gomangas.com" },
      { nome: "AuraToons", descricao: "Site de histórias em quadrinhos digitais, voltado à descoberta e leitura de obras em formato online.", link: "https://auratoons.com/", dominio: "auratoons.com" },
      { nome: "ManHQ", descricao: "Plataforma de quadrinhos e HQs que reúne conteúdos para leitores interessados em explorar histórias ilustradas pela internet.", link: "https://manhq.com.br/home", dominio: "manhq.com.br" },
      { nome: "MangaStop", descricao: "Site dedicado a mangás e leitura online, com páginas de títulos e capítulos para explorar o catálogo disponível.", link: "https://mangastop.net/", dominio: "mangastop.net" },
      { nome: "BlitzToons", descricao: "Plataforma de quadrinhos e webtoons com histórias digitais em capítulos, voltada a quem gosta de acompanhar narrativas ilustradas.", link: "https://blitztoons.com/", dominio: "blitztoons.com" },
      { nome: "Leitor de Mangás", descricao: "Site voltado à leitura de mangás, com páginas de séries e capítulos para encontrar e acompanhar títulos online.", link: "https://leitordemangas.com/", dominio: "leitordemangas.com" },
      { nome: "RebManga", descricao: "Plataforma de mangás com conteúdo em português, organizada para leitores que procuram séries e capítulos disponíveis na internet.", link: "https://www.rebmanga.com/pt/", dominio: "rebmanga.com" },
      { nome: "NexusToons", descricao: "Site dedicado a webtoons e quadrinhos digitais, com histórias ilustradas e capítulos para explorar online.", link: "https://nexustoons.com/", dominio: "nexustoons.com" },
      { nome: "HQ Zone", descricao: "Plataforma de histórias em quadrinhos que reúne conteúdos de HQs para leitores interessados em diferentes séries e personagens.", link: "https://hqzone.com.br/", dominio: "hqzone.com.br" },
      { nome: "Taverna de Quadrinhos", descricao: "Site dedicado ao universo das histórias em quadrinhos, reunindo conteúdo relacionado a HQs e à cultura dos quadrinhos.", link: "https://tavernadequadrinhos.com.br/", dominio: "tavernadequadrinhos.com.br" },
      { nome: "HQ-Now", descricao: "Site dedicado a histórias em quadrinhos, com páginas de obras e conteúdos para quem deseja explorar HQs online.", link: "https://www.hq-now.com/", dominio: "hq-now.com" },
      { nome: "Zona Fantasma", descricao: "Site com conteúdos relacionados a quadrinhos, voltado a leitores que buscam publicações e materiais do universo das HQs.", link: "https://zonafantasmanet.wordpress.com/", dominio: "zonafantasmanet.wordpress.com" },
      { nome: "HQ Isso", descricao: "Site de quadrinhos e conteúdos relacionados a HQs, para explorar materiais e assuntos ligados às histórias ilustradas.", link: "https://hqqisso.com.br/", dominio: "hqqisso.com.br" },
      { nome: "Mikan HQ", descricao: "Site dedicado a histórias em quadrinhos, com conteúdos para leitores que desejam descobrir e acompanhar HQs online.", link: "https://www.mikanhq.com.br/", dominio: "mikanhq.com.br" },
      { nome: "SukiMangas", descricao: "Site voltado à leitura online de mangás, com páginas de séries e capítulos para explorar o catálogo disponível.", link: "https://www.sukimangas.com/", dominio: "sukimangas.com" },
      { nome: "Lezhin Comics (BL)", descricao: "Plataforma de quadrinhos digitais com séries de diferentes gêneros, incluindo títulos BL (Boys’ Love), romances e histórias para públicos variados.", link: "https://www.lezhinus.com/", dominio: "lezhinus.com" },
      { nome: "Tappytoon (BL)", descricao: "Plataforma de quadrinhos e novels digitais com histórias seriadas, incluindo romances e títulos BL (Boys’ Love), conforme o catálogo disponível.", link: "https://www.tappytoon.com/", dominio: "tappytoon.com" },
      { nome: "Comikey Brasil (BL)", descricao: "Plataforma de mangás e quadrinhos digitais licenciados, com séries de vários gêneros e títulos BL (Boys’ Love) quando disponíveis no catálogo.", link: "https://comikey.com/", dominio: "comikey.com" },
      { nome: "INKR Comics (BL)", descricao: "Serviço de quadrinhos digitais com mangás, manhwas e outras séries, incluindo títulos BL (Boys’ Love) conforme a disponibilidade do catálogo.", link: "https://inkr.com/", dominio: "inkr.com" },
      { nome: "Comic Walker (BL)", descricao: "Plataforma digital da Kadokawa para ler mangás, consultar séries e acompanhar capítulos oficiais; a disponibilidade de títulos varia.", link: "https://comic-walker.com/", dominio: "comic-walker.com" },
      { nome: "Kodansha (BL)", descricao: "Editora japonesa com catálogo de mangás e quadrinhos; o site permite explorar séries e publicações oficiais, incluindo títulos de diferentes gêneros.", link: "https://kodansha.us/", dominio: "kodansha.us" } 
    ]
  },
  {
    id: "noticias",
    nome: "📰 Notícias e artigos",
    sites: [
      { nome: "BBC Brasil", descricao: "Portal de notícias da BBC em português, com reportagens, análises e cobertura de acontecimentos do Brasil e do mundo.", link: "https://www.bbc.com/portuguese", dominio: "bbc.com" },
      { nome: "G1", descricao: "Portal brasileiro de notícias com cobertura de acontecimentos nacionais e internacionais, além de reportagens, vídeos e conteúdos por editoria.", link: "https://g1.globo.com", dominio: "g1.globo.com" },
      { nome: "CNN Brasil", descricao: "Portal de notícias com cobertura de política, economia, mundo, Brasil e outros temas, reunindo reportagens e análises jornalísticas.", link: "https://www.cnnbrasil.com.br/", dominio: "cnnbrasil.com.br" },
      { nome: "Google Notícias", descricao: "Agregador que reúne notícias de diferentes veículos e organiza matérias por assunto e relevância, facilitando acompanhar vários pontos de vista.", link: "https://news.google.com", dominio: "news.google.com" },
      { nome: "Folha de S.Paulo", descricao: "Jornal digital com notícias, reportagens, análises e artigos sobre política, economia, cultura e acontecimentos do Brasil e do exterior.", link: "https://www.folha.uol.com.br", dominio: "folha.uol.com.br" },
      { nome: "UOL", descricao: "Portal brasileiro com notícias, informações e conteúdos de diferentes áreas, incluindo atualidades, entretenimento e serviços.", link: "https://www.uol.com.br", dominio: "uol.com.br" },
      { nome: "PressReader", descricao: "Plataforma de acesso digital a jornais e revistas de diferentes países e idiomas, com publicações disponíveis conforme o acesso de cada título.", link: "https://www.pressreader.com/pt-br/newspapers?free=true", dominio: "pressreader.com" },
      { nome: "Flipboard", descricao: "Plataforma que organiza notícias e artigos de várias fontes em revistas digitais personalizadas de acordo com os interesses do leitor.", link: "https://flipboard.com", dominio: "flipboard.com" },
      { nome: "ICL Notícias", descricao: "Portal brasileiro de notícias e análises que aborda temas atuais, política, economia e acontecimentos nacionais e internacionais.", link: "https://iclnoticias.com.br/", dominio: "iclnoticias.com.br" },
      { nome: "The News", descricao: "Newsletter de notícias que resume acontecimentos e informações em uma leitura rápida, pensada para acompanhar atualidades em poucos minutos.", link: "https://thenewscc.beehiiv.com/", dominio: "thenewscc.beehiiv.com" },
      { nome: "Hube Jornais", descricao: "Plataforma relacionada a jornais e publicações, voltada à consulta de conteúdos jornalísticos disponíveis no site.", link: "https://www.hubejornais.com.br/", dominio: "hubejornais.com.br" }
    ]
  },
  {
    id: "fanfics",
    nome: "✍️ Fanfics",
    sites: [
      { nome: "Archive of Our Own", descricao: "Arquivo de obras de fãs mantido por uma organização sem fins lucrativos, com grande variedade de fanfics e filtros para pesquisar histórias.", link: "https://archiveofourown.org", dominio: "archiveofourown.org" },
      { nome: "FanFiction.net", descricao: "Comunidade de leitura e publicação de fanfics baseada em livros, séries, filmes, jogos e outras obras, com histórias organizadas por fandom.", link: "https://www.fanfiction.net", dominio: "fanfiction.net" },
      { nome: "Wattpad", descricao: "Plataforma para ler e publicar histórias originais e fanfics, acompanhar autores e descobrir narrativas de diversos gêneros.", link: "https://www.wattpad.com", dominio: "wattpad.com" },
      { nome: "Spirit Fanfics", descricao: "Plataforma brasileira para leitura e publicação de fanfics e histórias originais, com categorias e comunidades de leitores e escritores.", link: "https://spiritfanfiction.com", dominio: "spiritfanfiction.com" },
      { nome: "Fanficando", descricao: "Site dedicado à leitura e publicação de fanfics, oferecendo um espaço para encontrar histórias criadas por fãs e explorar diferentes temas.", link: "https://www.fanficando.com/", dominio: "fanficando.com" },
      { nome: "Fanficia", descricao: "Plataforma para explorar e ler fanfics, com navegação por histórias e categorias disponíveis no catálogo.", link: "https://fanficia.com/pt/browse", dominio: "fanficia.com" },
      { nome: "Fanfy", descricao: "Plataforma para descobrir e ler fanfics, com histórias organizadas para acompanhar narrativas de diferentes universos e estilos.", link: "https://fanfy.studio/pt/read", dominio: "fanfy.studio" }
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
