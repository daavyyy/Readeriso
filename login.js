const SUPABASE_URL = "https://pcsjhrayvxxyhphdzjlv.supabase.co";
const SUPABASE_KEY = "sb_publishable_oirhV7wk9tB9JNBuLuzCCQ_SomAepLe";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// LOGIN DEFINIDO
const LOGIN_EMAIL = "admin@teste.com";
const LOGIN_SENHA = "Admin@123456";

document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  // Verifica o login definido
  if (email !== LOGIN_EMAIL || senha !== LOGIN_SENHA) {
    alert("E-mail ou senha incorretos!");
    return;
  }

  // Faz o login no Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: senha
  });

  if (error) {
    alert("Erro no login: " + error.message);
    return;
  }

  alert("Login feito com sucesso!");

  window.location.href = "explorar.html";
});