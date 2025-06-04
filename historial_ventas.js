document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.querySelector(".ventas__form");
  const tabla = document.querySelector(".ventas__tabla tbody");

  formulario.addEventListener("submit", function (event) {
    event.preventDefault(); // Evita recargar la página

    const proveedor = document.querySelectorAll(".ventas__select")[0].value;
    const cliente = document.querySelectorAll(".ventas__select")[1].value;
    const fecha = document.querySelector(".ventas__input[type='date']").value;
    const valor = document.querySelector(".ventas__input[type='number']").value;
    const descuento = document.querySelectorAll(".ventas__input[type='number']")[1].value;

    // Validación: No permitir registros vacíos
    if (!proveedor || !cliente || !fecha || valor <= 0) {
      alert("Por favor, completa todos los campos correctamente.");
      return;
    }

    // Crear una nueva fila en la tabla
    const fila = document.createElement("tr");
    fila.innerHTML = `
          <td>${proveedor}</td>
          <td>${cliente}</td>
          <td>${fecha}</td>
          <td>${valor}</td>
          <td>${descuento}</td>
          <td><button class="eliminar-btn">Eliminar</button></td>
      `;

    tabla.appendChild(fila);

    // Botón para eliminar la venta de la lista
    fila.querySelector(".eliminar-btn").addEventListener("click", function () {
      fila.remove();
    });

    // Limpiar el formulario después de registrar la venta
    formulario.reset();
  });
});
