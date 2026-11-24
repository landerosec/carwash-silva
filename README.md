# Car Wash Silva — Sistema de Cotización y Reserva de Citas

Aplicación web responsive desarrollada para gestionar las cotizaciones y reservaciones de citas de **Car Wash Silva**. Permite a los clientes calcular el costo total de su servicio en tiempo real, verificar la disponibilidad por fecha y confirmar su reserva directamente por WhatsApp mientras se registra automáticamente en una base de datos en la nube.

🔗 **Demo en vivo:** [(https://landerosec.github.io/carwash-silva/)](https://landerosec.github.io/carwash-silva/)

---

## Características principales

* **Cotizador dinámico en tiempo real:** Cálculo automático del total según el tipo de vehículo, paquete seleccionado y servicios adicionales.
* **Control de disponibilidad y cupo diario:** Validación de fechas operativas (fines de semana por defecto, con bandera configurable `modoVacaciones` para habilitar atención de lunes a domingo) y límite máximo de **5 citas por día**.
* **Persistencia sin servidor dedicado (Serverless):** Integración mediante `Fetch API` con **Google Apps Script** y **Google Sheets** para consultar cupos ocupados y almacenar nuevas reservaciones sin costos de hosting ni base de datos.
* **Confirmación inmediata vía WhatsApp:** Generación dinámica de enlace `wa.me` con el resumen estructurado de la cita (cliente, fecha, vehículo, servicios y total estimado).
* **Interfaz accesible y feedback personalizado:** Reemplazo de alertas nativas del navegador por un sistema de modales personalizados con diseño acorde a la identidad visual del negocio.

---

## 🛠️ Tecnologías utilizadas

* **Frontend:** HTML5 semántico, CSS3 (diseño responsivo, variables CSS y modales personalizados), JavaScript (ES6+ modular).
* **Backend / Base de datos:** Google Apps Script + Google Sheets API.
* **Despliegue y control de versiones:** Git, GitHub y GitHub Pages.

---

## Estructura del proyecto

```text
carwash-silva/
├── assets/          # Recursos gráficos e imágenes optimizadas
├── index.html       # Estructura principal y formulario de reservación
├── styles.css       # Estilos visuales, responsividad y modal personalizado
├── script.js        # Lógica de cotización, validación de fechas, API y WhatsApp
└── README.md        # Documentación del proyecto
