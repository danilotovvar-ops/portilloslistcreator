const URL_JSON = "./recetas.json";

let recetas = {};
let seleccionadas = [];

async function cargarRecetas() {
  try {
    const res = await fetch(URL_JSON);
    recetas = await res.json();
    renderizarRecetas(recetas);
  } catch (error) {
    console.error("Error cargando JSON:", error);
  }
}

function renderizarRecetas(recetasFiltradas) {
  const contenedor = document.getElementById("recetas");
  contenedor.innerHTML = "";

  for (let receta in recetasFiltradas) {
    const div = document.createElement("div");
    div.className = "card" + (seleccionadas.includes(receta) ? " active" : "");
    div.dataset.receta = receta;

    div.innerHTML = `
      <input type="checkbox" value="${receta}" ${seleccionadas.includes(receta) ? "checked" : ""}>
      <span>${receta}</span>
    `;

    const checkbox = div.querySelector("input");

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        seleccionadas.push(receta);
        div.classList.add("active");
      } else {
        seleccionadas = seleccionadas.filter(r => r !== receta);
        div.classList.remove("active");
      }
      actualizarContador();
    });

    contenedor.appendChild(div);
  }
}

function filtrarRecetas(query) {
  const clearBtn = document.getElementById("clear-search");
  const noResultados = document.getElementById("no-resultados");

  clearBtn.style.display = query.length > 0 ? "flex" : "none";

  const q = query.toLowerCase().trim();
  const filtradas = {};

  for (let receta in recetas) {
    if (receta.toLowerCase().includes(q)) {
      filtradas[receta] = recetas[receta];
    }
  }

  renderizarRecetas(filtradas);

  noResultados.style.display = Object.keys(filtradas).length === 0 ? "block" : "none";
}

function clearSearch() {
  const buscador = document.getElementById("buscador");
  buscador.value = "";
  filtrarRecetas("");
  buscador.focus();
}

function actualizarContador() {
  const el = document.getElementById("contador");
  const n = seleccionadas.length;
  el.textContent = n === 0
    ? "0 recetas seleccionadas"
    : `${n} receta${n > 1 ? "s" : ""} seleccionada${n > 1 ? "s" : ""}`;
}

function limpiarSeleccion() {
  seleccionadas = [];
  document.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
  document.querySelectorAll(".card").forEach(c => c.classList.remove("active"));
  actualizarContador();
  document.getElementById("resultado").innerHTML = `
    <div class="resultado-empty">
      <div class="empty-icon">📋</div>
      <p>Selecciona recetas y genera<br>tu lista de ingredientes</p>
    </div>
  `;
}

function generarLista() {
  const resultado = document.getElementById("resultado");

  if (seleccionadas.length === 0) {
    resultado.innerHTML = `
      <div class="resultado-empty">
        <div class="empty-icon">⚠️</div>
        <p>Selecciona al menos una receta</p>
      </div>
    `;
    return;
  }

  let conteo = {};
  let detalleHTML = `<h2 class="resultado-title">Por plato</h2>`;

  seleccionadas.forEach(receta => {
    detalleHTML += `<h3 class="resultado-dish">${receta}</h3><ul>`;
    recetas[receta].forEach(ing => {
      detalleHTML += `<li>${ing}</li>`;
      conteo[ing] = (conteo[ing] || 0) + 1;
    });
    detalleHTML += `</ul>`;
  });

  let listaFinalHTML = `<h2 class="resultado-title">Lista total</h2><ul class="lista-total">`;
  for (let ing in conteo) {
    if (conteo[ing] > 1) {
      listaFinalHTML += `<li><label class="ing-label"><input type="checkbox" class="ing-checkbox"><span class="ing-name">${ing}</span></label><span class="ing-badge">${conteo[ing]}</span></li>`;
    } else {
      listaFinalHTML += `<li><label class="ing-label"><input type="checkbox" class="ing-checkbox"><span class="ing-name">${ing}</span></label></li>`;
    }
  }
  listaFinalHTML += `</ul>`;

  listaFinalHTML += `
    <button class="btn btn-whatsapp" onclick="compartirWhatsApp()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.528 5.855L.057 23.743a.5.5 0 0 0 .612.612l5.888-1.471A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.659-.523-5.168-1.432l-.362-.216-3.747.936.955-3.747-.229-.373A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
      Enviar por WhatsApp
    </button>
  `;

  resultado.innerHTML = detalleHTML + listaFinalHTML;
}

function compartirWhatsApp() {
  let texto = "*LISTA DE COMPRAS*\n\n";

  texto += "*Recetas seleccionadas:*\n";
  seleccionadas.forEach(receta => {
    texto += `• ${receta}\n`;
  });

  texto += "\n*Ingredientes necesarios:*\n";
  let conteo = {};
  seleccionadas.forEach(receta => {
    recetas[receta].forEach(ing => {
      conteo[ing] = (conteo[ing] || 0) + 1;
    });
  });

  for (let ing in conteo) {
    if (conteo[ing] > 1) {
      texto += `• ${ing} (x${conteo[ing]})\n`;
    } else {
      texto += `• ${ing}\n`;
    }
  }

  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank");
}

cargarRecetas();
