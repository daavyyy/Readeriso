/* livros.js - ponte entre escritor.html e editor.html
   Guarda todas as histórias no localStorage e oferece funções simples às duas páginas. */
(() => {
  const CHAVE = 'readeriso:livros';
 
  const GENEROS = {
    fantasia: 'Fantasia',
    romance: 'Romance',
    aventura: 'Aventura',
    terror: 'Terror',
    ficcao: 'Ficção',
    outro: 'Outro',
  };
 
  const ler = () => {
    try {
      const dados = JSON.parse(localStorage.getItem(CHAVE));
      return Array.isArray(dados) ? dados : [];
    } catch {
      return [];
    }
  };
 
  const gravar = (lista) => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(lista));
      return true;
    } catch {
      return false;
    }
  };
 
  const gerarId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
 
  window.Readeriso = {
    GENEROS,
 
    listar: ler,
 
    obter(id) {
      return ler().find((l) => l.id === id) || null;
    },
 
    criar({ titulo, descricao, genero }) {
      const agora = Date.now();
      const livro = {
        id: gerarId(),
        titulo: titulo || 'Sem título',
        descricao: descricao || '',
        genero: GENEROS[genero] || genero || 'Outro',
        publicada: false,
        ativo: 0,
        capitulos: [{ titulo: 'Capítulo 1', texto: '' }],
        criadoEm: agora,
        atualizadoEm: agora,
      };
      const lista = ler();
      lista.push(livro);
      return gravar(lista) ? livro : null;
    },
 
    salvar(livro) {
      livro.atualizadoEm = Date.now();
      const lista = ler();
      const i = lista.findIndex((l) => l.id === livro.id);
      if (i >= 0) lista[i] = livro;
      else lista.push(livro);
      return gravar(lista);
    },
 
    excluir(id) {
      return gravar(ler().filter((l) => l.id !== id));
    },
  };
})();
 