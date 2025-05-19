document.getElementById("registroBtn").addEventListener("click", function () {
  let tipoUsuario = document.getElementById("tipoUsuario").value;
  if (tipoUsuario === "registro_clientes") {
    window.location.href = "registro_clientes.html";
  } else if (tipoUsuario === "registro_provedores") {
    window.location.href = "registro_provedores.html";
  } else {
    alert("Seleccione un tipo de usuario válido.");
  }
});