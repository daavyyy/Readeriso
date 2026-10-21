// Carrossel simples usado na home e no Explorar (setas ← → e contador "01 / 03")
document.addEventListener("DOMContentLoaded", () => {
  const conteudo = document.getElementById("carrosselConteudo");
  const contador = document.getElementById("carrosselContador");
  const anterior = document.getElementById("slideAnterior");
  const proximo = document.getElementById("proximoSlide");

  if (!conteudo || !anterior || !proximo) return;

  const total = conteudo.children.length;
  const doisDigitos = numero => String(numero).padStart(2, "0");
  let atual = 0;

  // Move a faixa de slides e atualiza o contador
  function irPara(indice) {
    atual = (indice + total) % total;
    conteudo.style.transform = `translateX(-${atual * 100}%)`;

    if (contador) {
      contador.innerHTML = `${doisDigitos(atual + 1)} <span>/ ${doisDigitos(total)}</span>`;
    }
  }

  anterior.addEventListener("click", () => irPara(atual - 1));
  proximo.addEventListener("click", () => irPara(atual + 1));
});
