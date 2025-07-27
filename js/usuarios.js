document.addEventListener("DOMContentLoaded", () => {
  const tablaBody = document.getElementById("tabla-usuarios");

  fetch("http://localhost:8080/pruebaApi/api/usuarios")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener usuarios");
      }
      return response.json();
    })
    .then((usuarios) => {
      if (usuarios.length === 0) {
        tablaBody.innerHTML = "<tr><td colspan='6'>No hay usuarios registrados.</td></tr>";
        return;
      }

      usuarios.forEach((usuario) => {
        // Convertir la fecha desde timestamp (si existe)
        let fechaFormateada = "-";
        if (usuario.fecha_registro) {
          const fecha = new Date(usuario.fecha_registro);
          const dia = String(fecha.getDate()).padStart(2, "0");
          const mes = String(fecha.getMonth() + 1).padStart(2, "0");
          const anio = fecha.getFullYear();
          fechaFormateada = `${dia}/${mes}/${anio}`;
        }

        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${usuario.nombre_usuario}</td>
          <td>${usuario.correo}</td>
          <td>${usuario.telefono || '-'}</td>
          <td>${usuario.estado || 'ACTIVO'}</td>
          <td>${usuario.fk_id_rol}</td>
          <td>${fechaFormateada}</td>
        `;
        tablaBody.appendChild(fila);
      });
    })
    .catch((error) => {
      console.error("Error al cargar usuarios:", error);
      tablaBody.innerHTML = "<tr><td colspan='6'>Error al cargar usuarios.</td></tr>";
    });
});
