// auth.js — controle simples de sessão com localStorage (usado pelas páginas da pasta HTML/)

function estaLogado() {
  return localStorage.getItem("readerisoLogado") === "true";
}

// Manda para o login quem não estiver logado
function protegerPagina() {
  if (!estaLogado()) {
    window.location.replace("../login.html");
  }
}

// Encerra a sessão e volta para o login
function sairDaConta() {
  localStorage.removeItem("readerisoLogado");
  localStorage.removeItem("readerisoUsuarioAtual");
  window.location.replace("../login.html");
}
