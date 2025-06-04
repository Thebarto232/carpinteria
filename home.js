function redirigirRegistro() {
  let tipo = document.getElementById("tipoUsuario").value;
  let url = tipo === "cliente" ? "registro_clientes.html" : "registro_provedores.html";
  window.location.href = url;
}
