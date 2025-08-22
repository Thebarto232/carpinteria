document.addEventListener("DOMContentLoaded", () => {
  cargarHistorialCompras(); // ✅ Ya no se pasa idCliente manualmente
});

export function cargarHistorialCompras() {
  fetch("http://localhost:8080/pruebaApi/api/historial/mis-compras", {
    method: "GET",
    credentials: "include" // 🔐 Enviar cookie de sesión
  })
    .then(async res => {
      const contenedor = document.getElementById("contenedor-historial-compras");
      contenedor.innerHTML = "";

      if (!res.ok) {
        let mensaje = "Error desconocido.";
        try {
          const error = await res.json();
          mensaje = error.mensaje || error.error || mensaje;
        } catch (e) {
          console.warn("⚠️ No se pudo parsear el error JSON:", e);
        }
        contenedor.innerHTML = `<p class="mensaje-vacio">${mensaje}</p>`;
        return;
      }

      const ventas = await res.json();

      if (!Array.isArray(ventas) || ventas.length === 0) {
        contenedor.innerHTML = `<p class="mensaje-vacio">No hay compras registradas.</p>`;
        return;
      }

      ventas.forEach(v => {
        const fecha = new Date(v.fecha_venta).toLocaleDateString("es-CO", {
          year: "numeric",
          month: "long",
          day: "numeric"
        });

        const div = document.createElement("div");
        div.className = `compra-item estado-${(v.estado || "desconocido").toLowerCase()}`;

        // 🧩 Renderizar productos comprados
        let productosHTML = "";
        try {
          // Si guardaste productos como texto plano separado por comas, no JSON
          let productos = [];
          if (v.productos_comprados) {
            try {
              productos = JSON.parse(v.productos_comprados);
            } catch {
              // Si no es JSON, convertir en array de strings
              productos = v.productos_comprados.split(",").map(p => ({ producto: p.trim(), cantidad: 1, precio_unitario: 0 }));
            }
          }

          if (productos.length > 0) {
            productosHTML = `
              <details class="productos-comprados">
                <summary>🛒 Productos comprados (${productos.length})</summary>
                <ul>
                  ${productos.map(p => `
                    <li>
                      <strong>${p.producto}</strong> — 
                      ${p.cantidad} unidad(es) × $${Number(p.precio_unitario).toLocaleString("es-CO")}
                    </li>
                  `).join("")}
                </ul>
              </details>
            `;
          }
        } catch (e) {
          console.warn(`⚠️ Error al parsear productos_comprados para venta ${v.id_venta}:`, e);
        }

        div.innerHTML = `
          <p><strong>Fecha:</strong> ${fecha}</p>
          <p><strong>Método de pago:</strong> ${v.metod_pago || v.metodo_pago || "No definido"}</p>
          <p><strong>Total:</strong> $${Number(v.total_a_pagar || v.valor_venta || 0).toLocaleString("es-CO")}</p>
          <p><strong>Estado:</strong> ${v.estado}</p>
          ${productosHTML}
        `;

        contenedor.appendChild(div);
      });
    })
    .catch(err => {
      console.error("❌ Error al conectar con el servidor:", err);
      const contenedor = document.getElementById("contenedor-historial-compras");
      contenedor.innerHTML = `<p class="mensaje-error">Error al conectar con el servidor.</p>`;
    });
}
