document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.querySelector(".form--proveedor");
  const nombre = document.querySelector('[placeholder="Nombre del proveedor"]');
  const correo = document.querySelector('[placeholder="Correo electrónico"]');
  const telefono = document.querySelector('[placeholder="Teléfono"]');
  const contrasena = document.querySelector('[placeholder="Contraseña"]');
  const boton = document.querySelector(".form__btn");
  const politica = document.querySelector("#politica");
  // Agregar mensaje de error
  const agregarError = (input, mensaje) => {
    limpiarError(input);
    const span = document.createElement("span");
    span.textContent = mensaje;
    span.classList.add("form__error");
    input.classList.add("color-rojo");
    input.insertAdjacentElement("afterend", span);
    input.focus();
  };
  // Limpiar error visual
  const limpiarError = (input) => {
    input.classList.remove("color-rojo");
    if (input.nextElementSibling && input.nextElementSibling.tagName === "SPAN") {
      input.nextElementSibling.remove();
    }
  };
  // Validar campos
  const validar = (e) => {
    e.preventDefault();
    let valido = true;

    const nombreVal = nombre.value.trim();
    const correoVal = correo.value.trim();
    const telefonoVal = telefono.value.trim();
    const contrasenaVal = contrasena.value.trim();

    const regexNombre = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{2,}$/;
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexTelefono = /^\d{7,10}$/;
    const regexContrasena = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

    if (!regexNombre.test(nombreVal)) {
      agregarError(nombre, "Nombre inválido. Solo letras y mínimo 2 caracteres.");
      valido = false;
    }

    if (!regexCorreo.test(correoVal)) {
      agregarError(correo, "Correo electrónico inválido.");
      valido = false;
    }

    if (!regexTelefono.test(telefonoVal)) {
      agregarError(telefono, "Teléfono inválido. Solo dígitos (7 a 10).");
      valido = false;
    }

    if (!regexContrasena.test(contrasenaVal)) {
      agregarError(contrasena, "Contraseña inválida. Mínimo 6 caracteres, una letra y un número.");
      valido = false;
    }

    if (valido) {
      alert("Proveedor registrado correctamente.");
      formulario.reset();
      [nombre, correo, telefono, contrasena].forEach(input => limpiarError(input));
      boton.setAttribute("disabled", "true");
    }
  };

  // Letras únicamente
  const soloLetras = (event) => {
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(event.key)) {
      event.preventDefault();
    }
  };

  // Solo números y máximo 10 dígitos
  const soloNumeros = (event) => {
    if (!/^\d$/.test(event.key) || telefono.value.length >= 10) {
      event.preventDefault();
    }
  };

  // Activar o desactivar botón según política
  if (politica) {
    if (!politica.checked) {
      boton.setAttribute("disabled", "true");
    }

    politica.addEventListener("change", () => {
      if (politica.checked) {
        boton.removeAttribute("disabled");
      } else {
        boton.setAttribute("disabled", "true");
      }
    });
  }

  // Eventos
  formulario.addEventListener("submit", validar);
  nombre.addEventListener("keydown", soloLetras);
  telefono.addEventListener("keydown", soloNumeros);
  [nombre, correo, telefono, contrasena].forEach(input =>
    input.addEventListener("input", () => limpiarError(input))
  );
});
