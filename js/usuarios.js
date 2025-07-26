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
          const fila = document.createElement("tr");
          fila.innerHTML = `
            <td>${usuario.nombre_usuario}</td>
            <td>${usuario.correo}</td>
            <td>${usuario.telefono || '-'}</td>
            <td>${usuario.estado || 'ACTIVO'}</td>
            <td>${usuario.fk_id_rol}</td>
            <td>${usuario.fecha_registro || '-'}</td>
          `;
          tablaBody.appendChild(fila);
        });
      })
      .catch((error) => {
        console.error("Error al cargar usuarios:", error);
        tablaBody.innerHTML = "<tr><td colspan='6'>Error al cargar usuarios.</td></tr>";
      });
  });
  