document.addEventListener("DOMContentLoaded", () => {
  // variable para cambiar el modo a vacaciones para habilitar todos los dias
  const modoVacaciones = false;

  const packageInputs = document.querySelectorAll('input[name="package"]');
  const serviceCheckboxes = document.querySelectorAll('input[name="service"]');
  const totalPriceElement = document.getElementById("total-price");
  const appointmentForm = document.getElementById("appointment-form");
  const fechaInput = document.getElementById("fecha");

  // Referencias del modal personalizado
  const customModal = document.getElementById("custom-modal");
  const modalIcon = document.getElementById("modal-icon");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const modalCloseBtn = document.getElementById("modal-close-btn");

  function mostrarModal(titulo, mensaje, icono = "⚠️") {
    modalIcon.textContent = icono;
    modalTitle.textContent = titulo;
    modalMessage.textContent = mensaje;
    customModal.classList.add("is-open");
    customModal.setAttribute("aria-hidden", "false");
    modalCloseBtn.focus();
  }

  function cerrarModal() {
    customModal.classList.remove("is-open");
    customModal.setAttribute("aria-hidden", "true");
  }

  modalCloseBtn.addEventListener("click", cerrarModal);

  customModal.addEventListener("click", (e) => {
    if (e.target === customModal) {
      cerrarModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && customModal.classList.contains("is-open")) {
      cerrarModal();
    }
  });

  // URL Google Sheets
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbwgaUZdsoKZvzJdCM2raNdHFEFv5XRjgWjWGpfpDoFzEJ43CJMRgCv_Wn8pt0I750SS_w/exec";

  // Restricción del calendario (solo sábados y domingos)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const localToday = `${year}-${month}-${day}`;

  fechaInput.setAttribute("min", localToday);

  function validarFecha() {
    const fechaSeleccionada = fechaInput.value;
    if (!fechaSeleccionada) return false;

    if (fechaSeleccionada < localToday) {
      mostrarModal(
        "Fecha no válida",
        "No puedes agendar citas en fechas pasadas.",
        "📅",
      );
      fechaInput.value = "";
      return false;
    }

    // Solo restringe a fines de semana cuando modoVacaciones es false
    if (!modoVacaciones) {
      const [selYear, selMonth, selDay] = fechaSeleccionada
        .split("-")
        .map(Number);
      const selectedDate = new Date(selYear, selMonth - 1, selDay);
      const dayOfWeek = selectedDate.getDay(); // 0 = Domingo, 6 = Sábado

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        mostrarModal(
          "Solo fines de semana",
          "Por disponibilidad de escuela y agenda, solo atendemos Sábados y Domingos.",
          "🗓️",
        );
        fechaInput.value = "";
        return false;
      }
    }

    return true;
  }

  fechaInput.addEventListener("change", validarFecha);
  fechaInput.addEventListener("blur", validarFecha);

  // Actualizar etiquetas y total al cambiar de paquete (con radio ya es excluyente)
  packageInputs.forEach((pkgInput) => {
    pkgInput.addEventListener("change", () => {
      updatePackageLabels();
      calculateTotal();
    });
  });

  function updatePackageLabels() {
    packageInputs.forEach((pkgInput) => {
      const badge = pkgInput
        .closest(".package-card")
        .querySelector(".package-select-badge");
      if (badge) {
        badge.textContent = pkgInput.checked
          ? "✓ Paquete Seleccionado"
          : "Seleccionar Paquete";
      }
    });
  }

  // Calcular total en tiempo real (Paquetes + Servicios individuales)
  function calculateTotal() {
    let total = 0;
    let hasQuoteService = false;

    packageInputs.forEach((pkg) => {
      if (pkg.checked) {
        total += parseFloat(pkg.dataset.price || 0);
      }
    });

    serviceCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        total += parseFloat(checkbox.dataset.price || 0);
        if (checkbox.dataset.custom === "true") {
          hasQuoteService = true;
        }
      }
    });

    if (hasQuoteService) {
      totalPriceElement.textContent = `$${total} MXN + Cotización`;
    } else {
      totalPriceElement.textContent = `$${total} MXN`;
    }
  }

  serviceCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", calculateTotal);
  });

  // Envío por WhatsApp con validación en Google Sheets
  appointmentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validarFecha()) return;

    // Recopila paquete seleccionado
    let selectedPackage = null;
    packageInputs.forEach((pkg) => {
      if (pkg.checked) {
        selectedPackage = `${pkg.dataset.name} ($${pkg.dataset.price})`;
      }
    });

    // Recopila servicios individuales seleccionados (marca los de cotización)
    const selectedServices = [];
    serviceCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const esCotizacion = checkbox.dataset.custom === "true";
        selectedServices.push(
          esCotizacion
            ? `${checkbox.dataset.name} (A cotizar)`
            : checkbox.dataset.name,
        );
      }
    });

    if (!selectedPackage && selectedServices.length === 0) {
      mostrarModal(
        "Selección incompleta",
        "Por favor selecciona un paquete o al menos un servicio para tu vehículo.",
        "🚗",
      );
      return;
    }

    const nombre = document.getElementById("nombre").value.trim();
    // Limpiar caracteres no numéricos del teléfono
    const telefonoCliente = document
      .getElementById("telefono")
      .value.replace(/[^0-9+]/g, "")
      .trim();
    const vehiculo = document.getElementById("vehiculo").value.trim();
    const fecha = fechaInput.value;
    const totalEstimado = totalPriceElement.textContent;

    const submitBtn = appointmentForm.querySelector(".btn-submit");
    const textoOriginalBtn = submitBtn.textContent;
    submitBtn.textContent = "VERIFICANDO DISPONIBILIDAD...";
    submitBtn.disabled = true;

    try {
      // Consulta y registra en Google Sheets (límite de 5 citas por día)
      const response = await fetch(scriptURL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          fecha: fecha,
          nombre: nombre,
          telefono: telefonoCliente,
          vehiculo: vehiculo,
        }),
      });

      const resultado = await response.json();

      // Si alcanzó las 5 citas del dia
      if (resultado.status === "lleno") {
        mostrarModal(
          "Cupo agotado",
          "Lo sentimos, este día ya alcanzó el límite máximo de 5 citas. Por favor, selecciona otra fecha de fin de semana.",
          "❌",
        );
        return;
      }

      // Construir el mensaje estructurado para WhatsApp
      const telefonoNegocio = "+524571059374";

      let mensaje = `🛻 *NUEVA CITA - CAR WASH SILVA* 🛻\n\n`;
      mensaje += `👤 *Cliente:* ${nombre}\n`;
      mensaje += `📱 *Teléfono:* ${telefonoCliente}\n`;
      mensaje += `🚗 *Vehículo:* ${vehiculo}\n`;
      mensaje += `🗓️ *Fecha:* ${fecha}\n\n`;

      if (selectedPackage) {
        mensaje += `📦 *Paquete elegido:*\n - ${selectedPackage}\n\n`;
      }

      if (selectedServices.length > 0) {
        mensaje += `🪣 *Servicios ${selectedPackage ? "adicionales" : "seleccionados"}:*\n`;
        selectedServices.forEach((s) => {
          mensaje += ` - ${s}\n`;
        });
        mensaje += `\n`;
      }

      mensaje += `💰 *Total Estimado:* ${totalEstimado}`;

      const mensajeCodificado = encodeURIComponent(mensaje);
      const urlWhatsApp = `https://wa.me/${telefonoNegocio}?text=${mensajeCodificado}`;

      // Abrir WhatsApp evitando bloqueo de pop-up tras petición asíncrona
      const waWindow = window.open(urlWhatsApp, "_blank");
      if (!waWindow) {
        window.location.href = urlWhatsApp;
      }

      // Limpiar formulario y reiniciar etiquetas de paquetes
      appointmentForm.reset();
      updatePackageLabels();
      totalPriceElement.textContent = "$0 MXN";
    } catch (error) {
      console.error("Error al verificar disponibilidad:", error);
      mostrarModal(
        "Error de conexión",
        "Hubo un problema de conexión al verificar la agenda. Intenta de nuevo.",
        "📡",
      );
    } finally {
      submitBtn.textContent = textoOriginalBtn;
      submitBtn.disabled = false;
    }
  });
});
