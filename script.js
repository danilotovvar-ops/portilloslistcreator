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
      listaFinalHTML += `<li><span class="ing-name">${ing}</span><span class="ing-badge">${conteo[ing]}</span></li>`;
    } else {
      listaFinalHTML += `<li><span class="ing-name">${ing}</span></li>`;
    }
  }
  listaFinalHTML += `</ul>`;

  resultado.innerHTML = detalleHTML + listaFinalHTML;
}

cargarRecetas();
