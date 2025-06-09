/**redirecion de de cliente o provedores  */
function redirigirRegistro() {

  const link = document.querySelector(".form__link");

  link.addEventListener("click", () => {
    const tipoUsuario = document.querySelector("#tipoUsuario"); 

    if (tipoUsuario.value === "Cliente") {
      window.location.href = "registro_clientes.html";
    } else if (tipoUsuario.value === "Proveedor") {
      window.location.href = "registro_provedores.html";
    }
  })
}
redirigirRegistro();