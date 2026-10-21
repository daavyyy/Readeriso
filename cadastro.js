(() => {
  "use strict";

  const CHAVE_USUARIOS = "readerisoUsuarios";

  const form = document.getElementById("formCadastro");

  if (!form) {
    console.error("Formulário formCadastro não encontrado.");
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

    const usuario = document
      .getElementById("usuario").value.trim();

    const senha = document
      .getElementById("senha").value;

    if (!email || !usuario || !senha) {
      alert("Preencha todos os campos.");
      return;
    }

    if (senha.length < 6) {
      alert("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (email === "readeriso@gmail.com") {
      alert("Este e-mail está reservado para a conta predefinida.");
      return;
    }

    const usuarios = obterUsuarios();

    const emailExiste = usuarios.some(
      pessoa => pessoa.email.toLowerCase() === email
    );

    if (emailExiste) {
      alert("Este e-mail já está cadastrado.");
      return;
    }

    try {
      const senhaHash = await criarHash(senha);

      usuarios.push({
        id: crypto.randomUUID(),
        usuario,
        email,
        senhaHash,
        criadoEm: Date.now()
      });

      localStorage.setItem(
        CHAVE_USUARIOS,
        JSON.stringify(usuarios)
      );

      alert("Cadastro realizado com sucesso!");

      window.location.href = "login.html";
    } catch (erro) {
      console.error("Erro ao cadastrar:", erro);
      alert(
        "Não foi possível concluir o cadastro. " +
        "Abra o projeto pelo Live Server e tente novamente."
      );
    }
  });
})();