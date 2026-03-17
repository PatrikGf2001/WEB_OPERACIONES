const form = document.getElementById("ticketForm");
const btnLimpiar = document.getElementById("btnLimpiar");
const mensaje = document.getElementById("mensaje");
const popupExito = document.getElementById("popupExito");
const popupTexto = document.getElementById("popupTexto");
const cerrarPopup = document.getElementById("cerrarPopup");
const ticketIdInput = document.getElementById("ticketId");
const btnEnviar = document.getElementById("btnEnviar");

const API_URL = "https://script.google.com/macros/s/AKfycbxnQ0aZtbZ6Rx54YJQvrOg4vf6mqn02DoGur_MxETD5KXY5ANlx1r5NSx180_ZbhKtYJA/exec";


form.addEventListener("submit", async function (e) {
  e.preventDefault();

  mensaje.textContent = "";
  btnEnviar.disabled = true;
  btnEnviar.textContent = "Enviando...";

  try {
    const archivosInput = document.getElementById("evidencias");
    const archivos = archivosInput.files;
    const evidencias = await convertirArchivosBase64(archivos);

    const data = {
      asunto: document.getElementById("asunto").value.trim(),
      reportadoPor: document.getElementById("reportadoPor").value.trim(),
      empresa: document.getElementById("empresa").value.trim(),
      areaTdp: document.getElementById("areaTdp").value.trim(),
      site: document.getElementById("site").value.trim(),
      codigoUnico: document.getElementById("codigoUnico").value.trim(),
      sitioCoubicado: getRadioValue("sitioCoubicado"),
      torrero: document.getElementById("torrero").value.trim(),
      impedimientoTrabajos: getRadioValue("impedimientoTrabajos"),
      tipoIncidencia: document.getElementById("tipoIncidencia").value,
      descripcionIncidencia: document.getElementById("descripcionIncidencia").value.trim(),
      sitioIncidencia: getCheckboxValues("sitioIncidencia"),
      tipoMantenimiento: document.getElementById("tipoMantenimiento").value,
      tipoAfectacion: document.getElementById("tipoAfectacion").value,
      ticketAtencion: document.getElementById("ticketAtencion").value.trim(),
      paraTorrera: document.getElementById("paraTorrera").value.trim(),
      evidencias: evidencias
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.status === "success") {
      const idGenerado = result.ticketId || "SIN_ID";
      ticketIdInput.value = idGenerado;
      popupTexto.textContent = `${idGenerado} registrado y notificado.`;
      popupExito.classList.add("active");

      form.reset();
    } else {
      mensaje.textContent = result.message || "Ocurrió un error al guardar.";
      mensaje.style.color = "red";
    }
  } catch (error) {
    console.error(error);
    mensaje.textContent = "Error de conexión al guardar el registro.";
    mensaje.style.color = "red";
  } finally {
    btnEnviar.disabled = false;
    btnEnviar.textContent = "Enviar";
  }
});

btnLimpiar.addEventListener("click", function () {
  form.reset();
  mensaje.textContent = "";
  ticketIdInput.value = "Generado automáticamente";
});

cerrarPopup.addEventListener("click", function () {
  popupExito.classList.remove("active");
  ticketIdInput.value = "Generado automáticamente";
});

function getRadioValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : "";
}

function getCheckboxValues(name) {
  const checked = document.querySelectorAll(`input[name="${name}"]:checked`);
  return Array.from(checked).map(el => el.value).join(", ");
}

async function convertirArchivosBase64(fileList) {
  const archivos = Array.from(fileList);
  const resultado = [];

  for (const file of archivos) {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error(`El archivo ${file.name} supera los 5 MB.`);
    }

    const base64 = await leerArchivoComoBase64(file);
    resultado.push({
      nombre: file.name,
      tipo: file.type,
      contenido: base64.split(",")[1]
    });
  }

  return resultado;
}

function leerArchivoComoBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
