// cadastro.js — cria contas e salva no localStorage
(() => {
  "use strict";

  const CHAVE_USUARIOS = "readerisoUsuarios";
  const form = document.getElementById("formCadastro");
  const campoUsuario = document.getElementById("usuario");
  const campoEmail = document.getElementById("email");
  const campoSenha = document.getElementById("senha");
  const mensagem = document.getElementById("mensagem");
  const botao = form.querySelector("button[type=submit]");

  // Mostra um aviso dentro do cartão (no lugar de alert)
  function avisar(texto) {
    mensagem.textContent = texto;
    mensagem.hidden = false;
  }

  function obterUsuarios() {
    try {
      const usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS));
      return Array.isArray(usuarios) ? usuarios : [];
    } catch {
      return [];
    }
  }

  // A senha é guardada como hash SHA-256, nunca em texto puro
  async function criarHash(senha) {
    const dados = new TextEncoder().encode(senha);
    const hash = await crypto.subtle.digest("SHA-256", dados);

    return Array.from(new Uint8Array(hash))
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  form.addEventListener("submit", async evento => {
    evento.preventDefault();

    const usuario = campoUsuario.value.trim();
    const email = campoEmail.value.trim().toLowerCase();
    const senha = campoSenha.value;

    // Validações básicas
    if (!usuario || !email || !senha) {
      avisar("Preencha todos os campos.");
      return;
    }

    if (!campoEmail.checkValidity()) {
      avisar("Digite um e-mail válido.");
      return;
    }

    if (senha.length < 6) {
      avisar("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (email === "readeriso@gmail.com") {
      avisar("Este e-mail está reservado para a conta predefinida.");
      return;
    }

    const usuarios = obterUsuarios();

    if (usuarios.some(pessoa => pessoa.email.toLowerCase() === email)) {
      avisar("Este e-mail já está cadastrado. Tente entrar.");
      return;
    }

    botao.disabled = true;

    try {
      usuarios.push({
        id: crypto.randomUUID(),
        usuario,
        email,
        senhaHash: await criarHash(senha),
        criadoEm: Date.now()
      });

      localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));

      // Volta para o login com aviso de sucesso
      window.location.href = "login.html?cadastro=ok";
    } catch (erro) {
      console.error("Erro ao cadastrar:", erro);
      avisar("Não foi possível concluir o cadastro. Abra o projeto pelo Live Server e tente novamente.");
      botao.disabled = false;
    }
  });
})();
