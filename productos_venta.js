const productos = {
  muebles: ["Mesa de madera", "Silla de roble"],
  puertas: ["Puerta corrediza", "Puerta clásica"],
  armarios: ["Armario rústico", "Armario moderno"]
};

// Función para mostrar los productos de una categoría
function mostrarCategoria(categoria) {
  let contenedor = document.getElementById("productosVenta");
  contenedor.innerHTML = "";

  if (productos[categoria]) {
    productos[categoria].forEach(producto => {
      let card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `<h3>${producto}</h3><p>Descripción breve...</p><button onclick="comprar('${producto}')">Comprar</button>`;
      contenedor.appendChild(card);
    });
  } else {
    contenedor.innerHTML = "<p>No hay productos en esta categoría.</p>";
  }
}
