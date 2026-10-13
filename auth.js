
function estaLogado() {
  return localStorage.getItem("readerisoLogado") === "true";
}

function protegerPagina() {
  if (!estaLogado()) {
    window.location.replace("../login.html");
  }
}

function sairDaConta() {
  localStorage.removeItem("readerisoLogado");
  window.location.replace("../login.html");
}


