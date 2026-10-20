# 🍔 Chaves Burguer · Sistema Integral de Menú Digital, POS & Caja

DEMO FUNCIONAL COMPLETA (100% Frontend, Mobile-First, PWA Instalable, Modo Offline y Sincronización en Tiempo Real entre pestañas y dispositivos).

> **Tagline:** *Fast Food · Restaurant · Drink*  
> **Ubicación de Referencia:** Colombia · Moneda COP (`$28.000`) sin decimales · Zona Horaria `America/Bogota`.

---

## 🚀 1. Cómo Ejecutar el Proyecto

```bash
# 1. Instalar dependencias (si no se han instalado)
npm install

# 2. Modo desarrollo con recarga en vivo
npm run dev

# 3. Compilación para producción (TypeScript estricto y PWA)
npm run build

# 4. Servidor de vista previa de producción
npm run preview
```

* **URL del Menú Digital Público:** [http://localhost:5173/](http://localhost:5173/)
* **URL del Panel de Administración y POS:** [http://localhost:5173/admin](http://localhost:5173/admin)
* **Acceso en Red Local (Celular / Tablet):** Abre en el navegador de tu celular la IP que muestra la consola (ej. `http://192.168.x.x:5173/`).

---

## 👥 2. Usuarios Demo & Códigos PIN

En la pantalla de acceso administrativo (`/admin/login`) puedes hacer clic en cualquier tarjeta para autocompletar o ingresar manualmente con los siguientes PIN:

| Rol | Empleado Demo | PIN | Permisos en la UI |
| :--- | :--- | :---: | :--- |
| **Dueño** | **Albeiro Chaves** | `1234` | **Acceso total**: Dashboard, POS, Pedidos, Cocina, Caja, Mesas, Domicilios, Productos, Clientes, Inventario, Gastos, Reportes y Configuración. |
| **Cajera** | **Laura Restrepo** | `2024` | POS mostrador, Tablero de Pedidos, Arqueo de Caja, Cuentas de Mesas, Fiados y Clientes. |
| **Cocinero** | **Don Javier Gómez** | `3030` | **Pantalla KDS Cocina exclusiva**: Comandas en tiempo real, semáforo de tiempo y tachado de platos. |
| **Domiciliario**| **Brayan Sneider** | `4040` | **Módulo de Domicilios exclusivo**: Pedidos asignados en camino, direcciones y confirmación de entrega. |

---

## ⏱️ 3. Guion de Demostración de 5 Minutos (Para mostrarle al Dueño)

> **Consejo:** Abre una pestaña con el **Menú Digital** (`/`) simulando la vista del cliente en su celular, y otra pestaña en pantalla completa con el **Admin** (`/admin`) simulando la tablet o computador del local.

### **Minuto 1: La Experiencia del Cliente en el Menú Digital (`/`)**
1. Muestra el encabezado con el **Logo oficial de Chaves Burguer**, el badge de *"Abierto ahora"* y el botón directo a WhatsApp.
2. Navega por las categorías con los chips superiores (**Salchipapas Grandes, Hamburguesas Caseras, Pizzas, Asados**).
3. Selecciona una salchipapa especial (ej. *La Caprichosa*): muestra cómo el cliente escoge si la quiere con **Papa Francesa o Criolla sin costo extra**, agrega queso gratinado y escribe *"sin cebolla"*.
4. Abre el carrito deslizable: muestra la sugerencia automática de agregar una bebida fría.
5. Finaliza en **Checkout**: elige *Domicilio*, selecciona la zona (*Sector Norte* con costo automático), selecciona método de pago *Efectivo* con billete de $50.000 para que vea el cálculo de vueltas en vivo.
6. Pulsa **Confirmar**: celebra con confetti, muestra el código generado (`CH-XXXX`), el botón que abre WhatsApp con el pedido perfectamente maquetado con emojis y el enlace de **Seguimiento en Vivo** (`/pedido/CH-XXXX`).

---

### **Minuto 2: Entrada Inmediata al POS y Tablero Kanban (`/admin/pedidos`)**
1. Pasa a la pestaña del local: suena la alerta acústica y el pedido web aparece instantáneamente en la columna **"Recibidos"** sin recargar la página.
2. Abre el detalle del pedido: muestra la comanda térmica lista para imprimir en **impresora de 80mm**.
3. Avanza el pedido con un toque a **"En Cocina"**.

---

### **Minuto 3: Pantalla de Cocina KDS (`/admin/cocina`)**
1. Entra al módulo de cocina: muestra las tarjetas grandes de alta legibilidad para el parrillero o pizzero.
2. Destaca el **semáforo de antigüedad**:
   * 🟢 Verde: menos de 15 minutos.
   * 🟡 Amarillo: 15 a 25 minutos.
   * 🔴 Rojo intermitente: más de 25 minutos (alerta de retraso).
3. Toca los ingredientes para tacharlos conforme van saliendo de la plancha.
4. Presiona **"MARCAR COMANDA LISTA"**: regresa a la pestaña del cliente (`/pedido/CH-XXXX`) para que el dueño vea cómo la barra de progreso del cliente cambió en tiempo real a *"Listo para entrega"*.

---

### **Minuto 4: POS de Mostrador para Tablet y Cuentas de Mesas (`/admin/pos` y `/admin/mesas`)**
1. Ve al POS: muestra la velocidad para tablet (categorías a la izquierda, cuadrícula táctil al centro, ticket a la derecha).
2. Agrega una hamburguesa y guárdala directamente en la **Mesa #3**.
3. Pasa a **Mesas & Cuentas**: muestra el mapa de mesas coloreadas (verde = libre, naranja = ocupada, roja = cuenta pedida).
4. Cambia a la pestaña **Fiados**: muéstrale la lista de clientes con crédito pendiente (ej. *Don Carlos Mario* con $48.000), presiona *"Registrar Abono"*, abona $20.000 en efectivo y demuestra cómo el saldo se actualiza y el dinero entra a la caja registradora.

---

### **Minuto 5: Cuadre de Caja, Reportes y Rentabilidad (`/admin/caja` y `/admin/reportes`)**
1. En **Control de Caja**: muestra la base inicial, todos los ingresos y egresos del día y abre el modal de **Arqueo y Cierre**:
   * Desglosa billetes de $50k, $20k, $10k y observa el cálculo automático de sobrante/faltante frente a lo registrado por el sistema.
2. En **Reportes & Utilidad**:
   * Filtra los últimos 30 días con los **~60 días de historial precargado**.
   * Muéstrale la **Utilidad Neta Estimada (Ventas − Gastos Operativos)**, las gráficas de picos de venta por hora (almuerzo y noche), el top 10 de platos más vendidos y el botón de exportar a **Excel/CSV**.
3. En **Configuración**: muéstrale el **Código QR imprimible** generado para poner en los acrílicos de las mesas.

---

## 🔌 4. Qué Reemplazar para Conectar un Backend Real

La aplicación fue construida con una **capa de abstracción limpia en `src/services/`** para que la transición a un backend en Node.js, NestJS, Supabase, Laravel o Firebase requiera **cero cambios en los componentes de la interfaz de usuario**.

Para conectar tu API real, solo debes reemplazar las implementaciones en:

1. **`src/services/productService.ts`**: Reemplazar las lecturas del store local por llamadas `fetch('/api/products')`, `axios.post('/api/products')`, etc.
2. **`src/services/orderService.ts`**: Reemplazar por llamadas `fetch('/api/orders')` y conectar un WebSocket o Server-Sent Events (SSE) para recibir nuevos pedidos en tiempo real.
3. **`src/services/cashService.ts`**: Conectar a los endpoints de apertura, arqueo y cierre de turnos (`/api/cash/sessions`).
4. **`src/services/customerService.ts`**: Conectar al CRM y tabla de clientes / saldos fiados (`/api/customers`).
5. **`src/services/inventoryService.ts`**: Conectar con la base de datos de kardex y stock de materias primas.
6. **`src/services/reportService.ts`**: Conectar a consultas SQL agregadas o vistas de métricas del servidor (`/api/reports/analytics`).

Los componentes React consumen únicamente las interfaces TypeScript tipadas (`IProductService`, `IOrderService`, etc.), garantizando una integración fluida e instantánea.
