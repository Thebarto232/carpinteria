document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.querySelector(".form--cliente");
  const nombre = document.querySelector('[placeholder="Nombre completo"]');
  const correo = document.querySelector('[placeholder="Correo electrónico"]');
  const telefono = document.querySelector('[placeholder="Teléfono"]');
  const contrasena = document.querySelector('[placeholder="Contraseña"]');
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
  const validar = async (e) => {
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
  
    if (!valido) return;
  
    // Enviar al backend
    try {
      const res = await fetch("http://localhost:8080/pruebaApi/api/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre_usuario: nombreVal,
          correo: correoVal,
          telefono: telefonoVal,
          contrasena: contrasenaVal,
          fk_id_rol: 2 // 2 = cliente (si es proveedor usarás 3 o lo que corresponda)
        })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert(data.mensaje || "Cliente registrado con éxito.");
        formulario.reset();
      } else {
        alert(data.error || "Error al registrar el cliente.");
      }
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };
  
  // Solo letras
  const soloLetras = (event) => {
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(event.key)) {
      event.preventDefault();
    }
  };
  

  // Solo números (máximo 10 dígitos)
  const soloNumeros = (event) => {
    if (!/^\d$/.test(event.key) || telefono.value.length >= 10) {
      event.preventDefault();
    }
  };

  // Eventos
  formulario.addEventListener("submit", validar);
  nombre.addEventListener("keydown", soloLetras);
  telefono.addEventListener("keydown", soloNumeros);
  [nombre, correo, telefono, contrasena].forEach(input =>
    input.addEventListener("input", () => limpiarError(input))
  );
});
