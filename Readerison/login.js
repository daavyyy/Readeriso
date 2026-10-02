const SUPABASE_URL = "SUA_URL_AQUI";
const SUPABASE_KEY = "SUA_CHAVE_ANON_AQUI";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.getElementById('formLogin').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: senha
  });

  if (error) {
    alert("Erro no login: " + error.message);
    return;
  }

  alert("Login feito!");
  window.location.href = "index.html";
});