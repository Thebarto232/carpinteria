document.addEventListener("DOMContentLoaded", () => {
    const selectProveedor = document.getElementById("select-proveedor");
    const selectCliente = document.getElementById("select-cliente");
    const form = document.getElementById("form-venta");
    const tablaBody = document.getElementById("tabla-ventas");
  
    // Simulación: usuarios con roles
    const usuarios = [
      { id: 1, nombre: "Juan Admin", rol: 1 },   // proveedor
      { id: 2, nombre: "Pedro Cliente", rol: 2 },
      { id: 3, nombre: "Maria Cliente", rol: 2 },
      { id: 4, nombre: "Laura Admin", rol: 1 }   // proveedor
    ];
  
    const ventas = [];
  
    // Llenar los selects
    usuarios.forEach(usuario => {
      const option = document.createElement("option");
      option.value = usuario.id;
      option.textContent = usuario.nombre;
  
      if (usuario.rol === 1) {
        selectProveedor.appendChild(option);
      } else if (usuario.rol === 2) {
        selectCliente.appendChild(option);
      }
    });
  
    // Registrar nueva venta
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const proveedorId = selectProveedor.value;
      const clienteId = selectCliente.value;
      const fecha = document.getElementById("fecha-venta").value;
      const valor = parseFloat(document.getElementById("valor-venta").value);
      const descuento = parseFloat(document.getElementById("descuento-venta").value) || 0;
  
      if (!proveedorId || !clienteId || !fecha || isNaN(valor)) {
        alert("Por favor completa todos los campos correctamente.");
        return;
      }
  
      const proveedor = usuarios.find(u => u.id == proveedorId)?.nombre || "Desconocido";
      const cliente = usuarios.find(u => u.id == clienteId)?.nombre || "Desconocido";
  
      const nuevaVenta = {
        proveedor,
        cliente,
        fecha,
        valor: valor.toFixed(2),
        descuento: descuento.toFixed(2)
      };
  
      ventas.push(nuevaVenta);
      mostrarVentas();
      form.reset();
    });
  
    // Mostrar ventas
    function mostrarVentas() {
      tablaBody.innerHTML = "";
      ventas.forEach((venta, index) => {
        const fila = document.createElement("tr");
        fila.classList.add("ventas__fila");
  
        fila.innerHTML = `
          <td class="ventas__columna">${venta.proveedor}</td>
          <td class="ventas__columna">${venta.cliente}</td>
          <td class="ventas__columna">${venta.fecha}</td>
          <td class="ventas__columna">${venta.valor}</td>
          <td class="ventas__columna">${venta.descuento}</td>
          <td class="ventas__columna">
            <button class="ventas__btn--eliminar" data-index="${index}">Eliminar</button>
          </td>
        `;
        tablaBody.appendChild(fila);
      });
    }
  
    // Eliminar venta
    tablaBody.addEventListener("click", (e) => {
      if (e.target.classList.contains("ventas__btn--eliminar")) {
        const index = e.target.getAttribute("data-index");
        ventas.splice(index, 1);
        mostrarVentas();
      }
    });
  });
  