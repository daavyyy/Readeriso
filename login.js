(() => {
  "use strict";

  const CHAVE_USUARIOS = "readerisoUsuarios";

  const form = document.getElementById("formLogin");

  if (!form) {
    console.error("Formulário formLogin não encontrado.");
    return;
  }

  function obterUsuarios() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
    } catch {
      return [];
    }
  }

  async function criarHash(senha) {
    const dados = new TextEncoder().encode(senha);
    const hash = await crypto.subtle.digest("SHA-256", dados);

    return Array.from(new Uint8Array(hash))
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  form.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const email = document
      .getElementById("email").value.trim().toLowerCase();

    const senha = document
      .getElementById("senha").value;

    if (!email || !senha) {
      alert("Informe seu e-mail e sua senha.");
      return;
    }

    // Login predefinido do Readeriso.
    if (
      email === "readeriso@gmail.com" &&
      senha === "123456"
    ) {
      localStorage.setItem("readerisoLogado", "true");

      localStorage.setItem(
        "readerisoUsuarioAtual",
        JSON.stringify({
          id: "admin",
          usuario: "Readeriso",
          email: "readeriso@gmail.com"
        })
      );

      window.location.href = "HTML/explorar.html";
      return;
    }

    // Login das contas cadastradas.
    try {
      const usuarios = obterUsuarios();
      const senhaHash = await criarHash(senha);

      const pessoa = usuarios.find(
        usuario =>
          usuario.email.toLowerCase() === email &&
          usuario.senhaHash === senhaHash
      );

      if (!pessoa) {
        alert("E-mail ou senha incorretos!");
        return;
      }

      localStorage.setItem("readerisoLogado", "true");

      localStorage.setItem(
        "readerisoUsuarioAtual",
        JSON.stringify({
          id: pessoa.id,
          usuario: pessoa.usuario,
          email: pessoa.email
        })
      );

      window.location.href = "HTML/explorar.html";
    } catch (erro) {
      console.error("Erro ao entrar:", erro);
      alert("Não foi possível realizar o login.");
    }
  });
})();