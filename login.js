document.getElementById("formLogin").addEventListener("submit", function(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (email === "readeriso@gmail.com" && senha === "123456") {
    localStorage.setItem("logado", "true");

    window.location.href = "exploracao/explorar.html";
  } else {
    alert("Email ou senha incorretos!");
  }
});