fetch("http://localhost:7000/usuarios") // cambia si usas otro puerto
  .then(response => response.text())     // porque tu Java devuelve texto plano
  .then(data => {
    const contenedor = document.getElementById("lista-usuarios");

    if (!contenedor) {
      console.error("Elemento con id 'lista-usuarios' no encontrado.");
      return;
    }

    const usuarios = data.split("\n"); // divide el texto por saltos de línea

    usuarios.forEach(nombre => {
      if (nombre.trim() !== "") {
        const li = document.createElement("li");
        li.textContent = nombre;
        contenedor.appendChild(li);
      }
    });
  })
  .catch(error => {
    console.error("Error al obtener usuarios:", error);
  });
