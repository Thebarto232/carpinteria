// Botón de cerrar sesión
const cerrarSesionBtn = document.getElementById("cerrarSesionBtn");

cerrarSesionBtn.addEventListener("click", () => {
  // Aquí puedes limpiar almacenamiento local o cookies si usas
  localStorage.clear();
  sessionStorage.clear();

  // Redireccionar al login
  window.location.href = "/js/validaciones/login/login.html"; // Ajusta la ruta si es necesario
});

