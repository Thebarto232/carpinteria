document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.querySelector(".form--login");
  const correo = document.querySelector('[placeholder="Correo electrónico"]');
  const contrasena = document.querySelector('[placeholder="Contraseña"]');

  const agregarError = (input, mensaje) => {
    limpiarError(input);
    const span = document.createElement("span");
    span.textContent = mensaje;
    span.classList.add("form__error");
    input.classList.add("color-rojo");
    input.insertAdjacentElement("afterend", span);
    input.focus();
  };

  const limpiarError = (input) => {
    input.classList.remove("color-rojo");
    if (input.nextElementSibling && input.nextElementSibling.tagName === "SPAN") {
      input.nextElementSibling.remove();
    }
  };

  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    let valido = true;

    const correoVal = correo.value.trim();
    const contrasenaVal = contrasena.value.trim();

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexContrasena = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,}$/;

    [correo, contrasena].forEach(input => limpiarError(input));

    if (!regexCorreo.test(correoVal)) { 
      agregarError(correo, "Correo electrónico inválido.");
      valido = false;
    }

    if (!regexContrasena.test(contrasenaVal)) {
      agregarError(contrasena, "Contraseña inválida. Mínimo 6 caracteres, con al menos una letra y un número.");
      valido = false;
    }

    if (!valido) return;

    try {
      const res = await fetch("http://localhost:8080/pruebaApi/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          correo: correoVal,
          contrasena: contrasenaVal
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Bienvenido, " + data.nombre_usuario);
        formulario.reset();

        // 🔀 Redirección según rol
        switch (data.fk_id_rol) {
          case 1:
            window.location.href = "/interfaz/provedor.html";
            break;
          case 2:
            window.location.href = "/interfaz../../index.html";
            break;
          default:
            alert("Rol no reconocido. Consulta con el administrador.");
        }
      } else {
        alert(data.mensaje || "Credenciales incorrectas.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Ocurrió un error al conectar con el servidor.");
    }
  });

  [correo, contrasena].forEach(input =>
    input.addEventListener("input", () => limpiarError(input))
  );
});
