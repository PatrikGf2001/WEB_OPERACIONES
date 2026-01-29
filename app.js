const detalleBody = document.getElementById("detalleBody");
const output = document.getElementById("output");

const btnAddRow = document.getElementById("btnAddRow");
const btnRemoveSelected = document.getElementById("btnRemoveSelected");
const btnSave = document.getElementById("btnSave");
const btnLoad = document.getElementById("btnLoad");
const btnExport = document.getElementById("btnExport");
const btnClear = document.getElementById("btnClear");
const btnExportCSV = document.getElementById("btnExportCSV");

function createRow(data = {}) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td class="center"><input type="checkbox" class="rowSelect"></td>

    <td><input type="text" class="banco" placeholder="Ej: tandem" value="${escapeHtml(data.banco ?? "")}"></td>
    <td><input type="number" class="celda" min="1" step="1" placeholder="1" value="${escapeHtml(data.celda ?? "")}"></td>
    <td><input type="number" class="vReposo" step="0.001" placeholder="Ej: 2.150" value="${escapeHtml(data.vReposo ?? "")}"></td>
    <td><input type="text" class="ri" placeholder="Ej: 0.35 mΩ" value="${escapeHtml(data.ri ?? "")}"></td>

    <td>
      <select class="resultado">
        <option value="">Seleccione</option>
        <option value="OK" ${data.resultado === "OK" ? "selected" : ""}>OK</option>
        <option value="NOK" ${data.resultado === "NOK" ? "selected" : ""}>NOK</option>
      </select>
    </td>

    <td><input type="text" class="obs" placeholder="Observaciones" value="${escapeHtml(data.obs ?? "")}"></td>
    <td><input type="date" class="fecFabric" value="${escapeHtml(data.fecFabric ?? "")}"></td>
    <td><input type="text" class="riOrigen" placeholder="RI Origen" value="${escapeHtml(data.riOrigen ?? "")}"></td>
  `;

  detalleBody.appendChild(tr);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getHeaderData() {
  const form = document.getElementById("mainForm");
  const fd = new FormData(form);

  return {
    fecha: fd.get("fecha") || "",
    cu: fd.get("cu") || "",
    local: fd.get("local") || "",
    rectificador: fd.get("rectificador") || "",
    tipoBateria: fd.get("tipoBateria") || "",
    nBancos: fd.get("nBancos") ? Number(fd.get("nBancos")) : null,
    celdasPorBanco: fd.get("celdasPorBanco") ? Number(fd.get("celdasPorBanco")) : null,
    modeloEquipo: fd.get("modeloEquipo") || "",
    estado: fd.get("estado") || "",
    temp: fd.get("temp") ? Number(fd.get("temp")) : null
  };
}

function getDetalleData() {
  const rows = [...detalleBody.querySelectorAll("tr")];

  return rows.map((tr) => ({
    banco: tr.querySelector(".banco").value.trim(),
    celda: tr.querySelector(".celda").value ? Number(tr.querySelector(".celda").value) : null,
    vReposo: tr.querySelector(".vReposo").value ? Number(tr.querySelector(".vReposo").value) : null,
    ri: tr.querySelector(".ri").value.trim(),
    resultado: tr.querySelector(".resultado").value,
    obs: tr.querySelector(".obs").value.trim(),
    fecFabric: tr.querySelector(".fecFabric").value,
    riOrigen: tr.querySelector(".riOrigen").value.trim()
  }));
}

function validate() {
  const form = document.getElementById("mainForm");
  if (!form.reportValidity()) return false;

  const rows = detalleBody.querySelectorAll("tr");
  if (rows.length === 0) {
    alert("Agrega al menos una fila en el detalle.");
    return false;
  }
  return true;
}

function buildPayload() {
  return {
    header: getHeaderData(),
    detalle: getDetalleData(),
    createdAt: new Date().toISOString()
  };
}

function showOutput(obj) {
  output.textContent = JSON.stringify(obj, null, 2);
}

function downloadJSON(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

btnAddRow.addEventListener("click", () => createRow());

btnRemoveSelected.addEventListener("click", () => {
  const rows = [...detalleBody.querySelectorAll("tr")];
  const selected = rows.filter(tr => tr.querySelector(".rowSelect").checked);

  if (selected.length === 0) {
    alert("Selecciona al menos una fila para eliminar.");
    return;
  }
  selected.forEach(tr => tr.remove());
});

btnSave.addEventListener("click", () => {
  if (!validate()) return;

  const payload = buildPayload();
  localStorage.setItem("pruebaImpedancia", JSON.stringify(payload));
  showOutput({ ok: true, mensaje: "Guardado en localStorage", payload });
});

btnLoad.addEventListener("click", () => {
  const raw = localStorage.getItem("pruebaImpedancia");
  if (!raw) {
    alert("No hay datos guardados.");
    return;
  }

  const payload = JSON.parse(raw);

  document.getElementById("fecha").value = payload.header.fecha || "";
  document.getElementById("cu").value = payload.header.cu || "";
  document.getElementById("local").value = payload.header.local || "";
  document.getElementById("rectificador").value = payload.header.rectificador || "";
  document.getElementById("tipoBateria").value = payload.header.tipoBateria || "";
  document.getElementById("nBancos").value = payload.header.nBancos ?? "";
  document.getElementById("celdasPorBanco").value = payload.header.celdasPorBanco ?? "";
  document.getElementById("modeloEquipo").value = payload.header.modeloEquipo || "";
  document.getElementById("estado").value = payload.header.estado || "";
  document.getElementById("temp").value = payload.header.temp ?? "";

  detalleBody.innerHTML = "";
  (payload.detalle || []).forEach(row => createRow(row));

  showOutput({ ok: true, mensaje: "Cargado desde localStorage", payload });
});

btnExport.addEventListener("click", () => {
  if (!validate()) return;

  const payload = buildPayload();
  showOutput(payload);
  downloadJSON("prueba-impedancia.json", payload);
});

btnClear.addEventListener("click", () => {
  if (confirm("¿Limpiar formulario y tabla?")) {
    document.getElementById("mainForm").reset();
    detalleBody.innerHTML = "";
    output.textContent = "";
  }
});

function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  function escapeCSV(value) {
    const s = String(value ?? "");
    // Si tiene ; o saltos o comillas, se encierra en comillas y se duplican comillas internas
    if (/[;"\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
    return s;
  }
  
  function exportToCSV(payload) {
    const h = payload.header;
    const rows = payload.detalle;
  
    // IMPORTANTE (Perú/ES): Excel suele usar ; como separador
    const sep = ";";
  
    const columns = [
      "fecha","cu","local","rectificador","tipoBateria","nBancos","celdasPorBanco","modeloEquipo","estado","temp",
      "banco","celda","vReposo","ri","resultado","obs","fecFabric","riOrigen"
    ];
  
    const lines = [];
    lines.push(columns.join(sep));
  
    for (const d of rows) {
      const line = [
        h.fecha, h.cu, h.local, h.rectificador, h.tipoBateria, h.nBancos, h.celdasPorBanco, h.modeloEquipo, h.estado, h.temp,
        d.banco, d.celda, d.vReposo, d.ri, d.resultado, d.obs, d.fecFabric, d.riOrigen
      ].map(escapeCSV).join(sep);
  
      lines.push(line);
    }
  
    const csv = lines.join("\n");
    downloadFile("prueba-impedancia.csv", csv, "text/csv;charset=utf-8");
  }
  
  btnExportCSV.addEventListener("click", () => {
    if (!validate()) return;
    const payload = buildPayload();
    exportToCSV(payload);
  });
// Inicial: 3 filas de ejemplo
createRow({ banco: "tandem", celda: 1 });
