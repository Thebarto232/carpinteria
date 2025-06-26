document.addEventListener("DOMContentLoaded", fetchProductos);

const btn = document.querySelector(".productos__btn");

btn.addEventListener('click', () => {

  const nombre = document.querySelector("#nombre");
  const valor = document.querySelector("#valor");
  const stock = document.querySelector("#stock");
  const categoria = document.querySelector("#categoria");

  fetch("http://localhost:8080/pruebaApi/api/productos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nombre_producto: nombre.value,
      valor_producto: valor.value,
      stock: stock.value,
      fk_id_categoria_producto: categoria.value,
      fecha_creacion: new Date()
    })
  })
})

// document.getElementById("formularioProducto").addEventListener("submit", function (e) {
//   e.preventDefault();

//   const form = e.target; // Apunta al formulario actual

//   const producto = {
//     nombre_producto: document.getElementById("nombre_producto").value,
//     valor_producto: parseFloat(document.getElementById("valor_producto").value),
//     stock: parseInt(document.getElementById("stock").value),
//     fk_id_categoria_producto: parseInt(document.getElementById("categoria").value),
//     fecha_creacion: new Date().toISOString().slice(0, 10)
//   };

//   fetch("http://localhost:8080/pruebaApi/api/productos", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify(producto)
//   })
//     .then(res => {
//       if (!res.ok) throw new Error("Error al guardar el producto.");
//       return res.text(); // o res.json() si el backend responde con JSON
//     })
//     .then(mensaje => {
//       alert("✅ Producto registrado correctamente.");
//       form.reset();
//       fetchProductos();
//     })
//     .catch(err => {
//       console.error("Error al registrar producto:", err);
//       alert("❌ Error al guardar el producto.");
//     });
// });

function fetchProductos() {
  fetch("http://localhost:8080/pruebaApi/api/productos")
    .then(res => {
      if (!res.ok) throw new Error("No se pudieron obtener productos.");
      return res.json();
    })
    .then(productos => {
      const tabla = document.getElementById("tablaProductos");
      tabla.innerHTML = "";

      productos.forEach(p => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${p.id_producto}</td>
          <td>${p.nombre_producto}</td>
          <td>$${p.valor_producto.toFixed(2)}</td>
          <td>${p.stock}</td>
          <td>${p.fk_id_categoria_producto}</td>
        `;
        tabla.appendChild(fila);
      });
    })
    .catch(error => {
      console.error("Error al cargar productos:", error);
    });
}
