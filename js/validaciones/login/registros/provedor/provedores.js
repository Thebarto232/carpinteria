document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.querySelector(".form--proveedor");
  const nombre = document.getElementById("nombre");
  const correo = document.getElementById("correo");
  const telefono = document.getElementById("telefono");
  const contrasena = document.getElementById("contrasena");

  // Función para mostrar error debajo del campo
  const agregarError = (input, mensaje) => {
    limpiarError(input);
    const span = document.createElement("span");
    span.textContent = mensaje;
    span.classList.add("form__error");
    input.classList.add("color-rojo");

    const grupo = input.closest(".form__grupo");
    if (grupo) {
      grupo.appendChild(span);
    } else {
      input.insertAdjacentElement("afterend", span);
    }
    input.focus();
  };

  // Función para limpiar error de un campo
  const limpiarError = (input) => {
    input.classList.remove("color-rojo");
    const grupo = input.closest(".form__grupo");
    if (grupo) {
      const spanError = grupo.querySelector(".form__error");
      if (spanError) spanError.remove();
    }
  };

  // Validación al enviar
  formulario.addEventListener("submit", async (e) => {
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

    [nombre, correo, telefono, contrasena].forEach(input => limpiarError(input));

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

    if (!valido) return;

    try {
      const res = await fetch("http://localhost:8080/pruebaApi/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_usuario: nombreVal,
          correo: correoVal,
          telefono: telefonoVal,
          contrasena: contrasenaVal,
          estado: "activo",
          fk_id_rol: 1
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.mensaje || "Proveedor registrado con éxito.");
        formulario.reset();
      } else {
        alert(data.error || "Error al registrar el proveedor.");
      }
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
      alert("No se pudo conectar con el servidor.");
    }
  });

  // Restricciones
  nombre.addEventListener("keypress", (event) => {
    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(event.key)) {
      event.preventDefault();
    }
  });

  telefono.addEventListener("keypress", (event) => {
    if (!/\d/.test(event.key) || telefono.value.length >= 10) {
      event.preventDefault();
    }
  });

  // Validación en tiempo real
  [nombre, correo, telefono, contrasena].forEach(input =>
    input.addEventListener("input", () => limpiarError(input))
  );
});
