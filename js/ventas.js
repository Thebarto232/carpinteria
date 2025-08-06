document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:8080/pruebaApi/api";
  const selectProveedor = document.getElementById("select-proveedor");
  const selectCliente = document.getElementById("select-cliente");
  const form = document.getElementById("form-venta");
  const tablaBody = document.getElementById("tabla-ventas");

  async function cargarUsuarios() {
    try {
      const resProveedor = await fetch(`${API_URL}/usuarios?fk_id_rol=1`);
      if (!resProveedor.ok) throw new Error("No se pudo cargar proveedores");

      const textProveedor = await resProveedor.text();
      console.log("Respuesta proveedores:", textProveedor);

      const proveedores = textProveedor ? JSON.parse(textProveedor) : [];
      proveedores.forEach(usuario => {
        const option = document.createElement("option");
        option.value = usuario.cod_usuario;
        option.textContent = usuario.nombre_usuario;
        selectProveedor.appendChild(option);
      });

      const resCliente = await fetch(`${API_URL}/usuarios?rol=Cliente`);
      if (!resCliente.ok) throw new Error("No se pudo cargar clientes");

      const textCliente = await resCliente.text();
      console.log("Respuesta clientes:", textCliente);

      const clientes = textCliente ? JSON.parse(textCliente) : [];
      clientes.forEach(usuario => {
        const option = document.createElement("option");
        option.value = usuario.cod_usuario;
        option.textContent = usuario.nombre_usuario;
        selectCliente.appendChild(option);
      });

    } catch (error) {
      console.error("Error al cargar usuarios por rol:", error.message);
    }
  }


  form.addEventListener("submit", async (e) => {
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

    const ventaData = {
      fk_id_vendedor: parseInt(proveedorId),
      fk_id_comprador: parseInt(clienteId),
      fecha_venta: fecha,
      metod_pago: "Efectivo", // puedes ajustar esto si tienes un campo en el formulario
      valor_venta: valor,
      descuento_venta: descuento,
      estado: "PENDIENTE"
    };

    try {
      const response = await fetch(`${API_URL}/ventas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(ventaData)
      });

      if (!response.ok) throw new Error("Error al registrar venta");

      alert("Venta registrada correctamente.");
      form.reset();
      cargarVentas();
    } catch (error) {
      console.error("Error al enviar la venta:", error.message);
      alert("Error al registrar la venta.");
    }
  });

  async function cargarVentas() {
    try {
      const response = await fetch(`${API_URL}/ventas`);
      if (!response.ok) throw new Error("No se pudo cargar ventas");
      const ventas = await response.json();

      tablaBody.innerHTML = "";
      ventas.forEach(venta => {
        const fila = document.createElement("tr");
        fila.classList.add("ventas__fila");

        fila.innerHTML = `
          <td class="ventas__columna">${venta.nombre_vendedor || venta.fk_id_vendedor}</td>
          <td class="ventas__columna">${venta.nombre_cliente || venta.fk_id_comprador}</td>
          <td class="ventas__columna">${venta.fecha_venta}</td>
          <td class="ventas__columna">${venta.valor_venta.toFixed(2)}</td>
          <td class="ventas__columna">${venta.descuento_venta.toFixed(2)}</td>
          <td class="ventas__columna">
            <button class="ventas__btn--eliminar" data-id="${venta.id_venta}">Eliminar</button>
          </td>
        `;
        tablaBody.appendChild(fila);
      });
    } catch (error) {
      console.error("Error al cargar ventas:", error.message);
    }
  }

  tablaBody.addEventListener("click", async (e) => {
    if (e.target.classList.contains("ventas__btn--eliminar")) {
      const id = e.target.getAttribute("data-id");

      if (confirm("¿Estás seguro de eliminar esta venta?")) {
        try {
          const response = await fetch(`${API_URL}/ventas/${id}`, {
            method: "DELETE"
          });

          if (!response.ok) throw new Error("Error al eliminar");

          alert("Venta eliminada.");
          cargarVentas();
        } catch (error) {
          console.error("Error al eliminar:", error.message);
        }
      }
    }
  });

  cargarUsuarios();
  cargarVentas();
});
