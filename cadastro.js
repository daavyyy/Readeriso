const SUPABASE_URL = "https://pcsjhrayvxxyhphdzjlv.supabase.co";
const SUPABASE_KEY = "sb_publishable_oirhV7wk9tB9JNBuLuzCCQ_SomAepLe";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.getElementById('formCadastro').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const usuario = document.getElementById('usuario').value;
  const senha = document.getElementById('senha').value;

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: senha
  });

  if (error) {
    alert("Erro no cadastro: " + error.message);
    return;
  }

  const { error: erroPerfil } = await supabase.from('perfis').insert({
    id: data.user.id,
    usuario: usuario
  });

  if (erroPerfil) {
    alert("Erro ao salvar perfil: " + erroPerfil.message);
    return;
  }

  alert("Cadastro feito! Verifique seu email para confirmar a conta.");
  window.location.href = "login.html";
});