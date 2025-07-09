document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.querySelector(".form--login");
  const correo = document.querySelector('[placeholder="Correo electrónico"]');
  const contrasena = document.querySelector('[placeholder="Contraseña"]');
  const tipoUsuario = document.getElementById("tipoUsuario");
  const boton = document.querySelector(".form__btn");

  // Agrega mensaje de error
  const agregarError = (input, mensaje) => {
    limpiarError(input);
    const span = document.createElement("span");
    span.textContent = mensaje;
    span.classList.add("form__error");
    input.classList.add("color-rojo");
    input.insertAdjacentElement("afterend", span);
    input.focus();
  };

  // Limpia errores visuales
  const limpiarError = (input) => {
    input.classList.remove("color-rojo");
    if (input.nextElementSibling && input.nextElementSibling.tagName === "SPAN") {
      input.nextElementSibling.remove();
    }
  };

  // Validación del formulario
  const validar = (e) => {
    e.preventDefault();
    let valido = true;

    const correoVal = correo.value.trim();
    const contrasenaVal = contrasena.value.trim();
    const tipoUsuarioVal = tipoUsuario.value;

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexContrasena = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

    if (!regexCorreo.test(correoVal)) {
      agregarError(correo, "Correo electrónico inválido.");
      valido = false;
    }

    if (!regexContrasena.test(contrasenaVal)) {
      agregarError(contrasena, "Contraseña inválida. Mínimo 6 caracteres, con al menos una letra y un número.");
      valido = false;
    }

    if (tipoUsuarioVal !== "cliente" && tipoUsuarioVal !== "proveedor") {
      agregarError(tipoUsuario, "Seleccione un tipo de usuario válido.");
      valido = false;
    }

    if (valido) {
      alert("Inicio de sesión exitoso.");
      formulario.reset();
      [correo, contrasena, tipoUsuario].forEach(input => limpiarError(input));
    }
  };

  // Eventos
  formulario.addEventListener("submit", validar);
  [correo, contrasena].forEach(input =>
    input.addEventListener("input", () => limpiarError(input))
  );
});
