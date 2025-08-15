    document.addEventListener("DOMContentLoaded", () => {
        // 🔐 Obtener el ID del cliente desde localStorage, sesión o hardcode temporal
        const idCliente = localStorage.getItem("idCliente") || 2; // ← usa 2 si no hay nada guardado
    
        cargarHistorialCompras(idCliente);
    });
    
    export function cargarHistorialCompras(idCliente) {
        fetch(`http://localhost:8080/pruebaApi/api/historial/cliente/${idCliente}`)
        .then(async res => {
            const contenedor = document.getElementById("contenedor-historial-compras");
            contenedor.innerHTML = "";
    
            if (!res.ok) {
            const error = await res.json();
            contenedor.innerHTML = `<p class="mensaje-vacio">${error.mensaje}</p>`;
            return;
            }
    
            const ventas = await res.json();
    
            if (ventas.length === 0) {
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
            div.className = `compra-item estado-${v.estado.toLowerCase()}`;
            div.innerHTML = `
                <p><strong>Fecha:</strong> ${fecha}</p>
                <p><strong>Método de pago:</strong> ${v.metod_pago}</p>
                <p><strong>Total:</strong> $${v.valor_venta.toLocaleString("es-CO")}</p>
                <p><strong>Estado:</strong> ${v.estado}</p>
            `;
            contenedor.appendChild(div);
            });
        })
        .catch(err => {
            console.error("Error al conectar con el servidor:", err);
            const contenedor = document.getElementById("contenedor-historial-compras");
            contenedor.innerHTML = `<p class="mensaje-error">Error al conectar con el servidor.</p>`;
        });
    }
    