// login.js — confere e-mail e senha com as contas salvas no localStorage
(() => {
  "use strict";

  const CHAVE_USUARIOS = "readerisoUsuarios";
  const form = document.getElementById("formLogin");
  const campoEmail = document.getElementById("email");
  const campoSenha = document.getElementById("senha");
  const mensagem = document.getElementById("mensagem");
  const botao = form.querySelector("button[type=submit]");

  // Mostra um aviso dentro do cartão (no lugar de alert)
  function avisar(texto, sucesso = false) {
    mensagem.textContent = texto;
    mensagem.classList.toggle("sucesso", sucesso);
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

  // A senha é comparada pelo hash SHA-256, nunca em texto puro
  async function criarHash(senha) {
    const dados = new TextEncoder().encode(senha);
    const hash = await crypto.subtle.digest("SHA-256", dados);

    return Array.from(new Uint8Array(hash))
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  // Grava a sessão e abre o Explorar
  function entrar(usuario) {
    localStorage.setItem("readerisoLogado", "true");
    localStorage.setItem("readerisoUsuarioAtual", JSON.stringify(usuario));
    window.location.href = "HTML/explorar.html";
  }

  // Mostra o aviso vindo do cadastro (login.html?cadastro=ok)
  if (new URLSearchParams(window.location.search).get("cadastro") === "ok") {
    avisar("Conta criada! Agora é só entrar.", true);
  }

  form.addEventListener("submit", async evento => {
    evento.preventDefault();

    const email = campoEmail.value.trim().toLowerCase();
    const senha = campoSenha.value;

    if (!email || !senha) {
      avisar("Informe seu e-mail e sua senha.");
      return;
    }

    // Conta predefinida do Readeriso
    if (email === "readeriso@gmail.com" && senha === "123456") {
      entrar({ id: "admin", usuario: "Readeriso", email });
      return;
    }

    // Contas cadastradas
    botao.disabled = true;

    try {
      const senhaHash = await criarHash(senha);
      const pessoa = obterUsuarios().find(
        usuario => usuario.email.toLowerCase() === email && usuario.senhaHash === senhaHash
      );

      if (!pessoa) {
        avisar("E-mail ou senha incorretos.");
        return;
      }

      entrar({ id: pessoa.id, usuario: pessoa.usuario, email: pessoa.email });
    } catch (erro) {
      console.error("Erro ao entrar:", erro);
      avisar("Não foi possível entrar. Abra o projeto pelo Live Server e tente novamente.");
    } finally {
      botao.disabled = false;
    }
  });
})();
