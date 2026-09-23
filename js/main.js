/* ============================================================
   PERSONA 3 - FANPAGE
   main.js
   ------------------------------------------------------------
   ============================================================ */
 
document.addEventListener("DOMContentLoaded", function () {
  inicializarMenuMobile();
  inicializarDropdownVersiones();
  inicializarCarruselPersonajes();
  inicializarGaleriaVisor();
  marcarPaginaActiva();
  inicializarFormularioContacto(); 
});
 
/* ------------------------------------------------------------
   1. MENÚ MOBILE 
   ------------------------------------------------------------ */
function inicializarMenuMobile() {
  const botonMenu = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-nav");
 
  if (!botonMenu || !nav) return;
 
  botonMenu.addEventListener("click", function () {
    const abierto = nav.classList.toggle("abierto");
    botonMenu.classList.toggle("abierto", abierto);
    botonMenu.setAttribute("aria-expanded", abierto ? "true" : "false");
  });
}
 
/* ------------------------------------------------------------
   2. DROPDOWN "VERSIONES"
   ------------------------------------------------------------ */
function inicializarDropdownVersiones() {
  const itemDropdown = document.querySelector(".nav-item--dropdown");
  if (!itemDropdown) return;
 
  const boton = itemDropdown.querySelector(".dropdown-toggle");
 
  function cerrarDropdown() {
    itemDropdown.classList.remove("abierto");
    boton.setAttribute("aria-expanded", "false");
  }
 
  function toggleDropdown(evento) {
    evento.stopPropagation();
    const yaEstaAbierto = itemDropdown.classList.contains("abierto");
    itemDropdown.classList.toggle("abierto", !yaEstaAbierto);
    boton.setAttribute("aria-expanded", (!yaEstaAbierto).toString());
  }
 
  boton.addEventListener("click", toggleDropdown);
 
  // Cerrar si se hace click en cualquier otro lugar de la página
  document.addEventListener("click", function (evento) {
    if (!itemDropdown.contains(evento.target)) {
      cerrarDropdown();
    }
  });
 
  // Cerrar con la tecla Escape
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") {
      cerrarDropdown();
    }
  });
}
 
/* ------------------------------------------------------------
   3. CARRUSEL DE PERSONAJES
   ------------------------------------------------------------ */
function inicializarCarruselPersonajes() {
  const pista = document.querySelector(".carrusel-pista");
  if (!pista) return;
 
  const tarjetas = pista.querySelectorAll(".tarjeta-personaje");
  const botonAnterior = document.querySelector("[data-carrusel='anterior']");
  const botonSiguiente = document.querySelector("[data-carrusel='siguiente']");
  const contenedorIndicadores = document.querySelector(".carrusel-indicadores");
 
  const DURACION_POR_TARJETA_MS = 140;
  const DURACION_MIN_MS = 250;
  const DURACION_MAX_MS = 450;
 
  let indiceActual = 0;
  let paradas = [];
 
  function tarjetasVisibles() {
    if (window.innerWidth >= 1400) return 4;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }
 
  function indiceMaximo() {
    return Math.max(0, tarjetas.length - tarjetasVisibles());
  }
 
  function calcularParadas() {
    const paso = tarjetasVisibles();
    const maximo = indiceMaximo();
    const lista = [];
 
    for (let objetivo = 0; objetivo < maximo; objetivo += paso) {
      lista.push(objetivo);
    }
    lista.push(maximo);
 
    return lista;
  }
 
  function actualizarFlechas() {
    if (botonAnterior) {
      botonAnterior.style.display = (indiceActual === 0) ? "none" : "";
    }
    if (botonSiguiente) {
      botonSiguiente.style.display = (indiceActual >= indiceMaximo()) ? "none" : "";
    }
  }
 
  function actualizarIndicadores() {
    if (!contenedorIndicadores) return;
    const puntos = contenedorIndicadores.querySelectorAll("button");
 
    let puntoActivo = 0;
    for (let i = 0; i < paradas.length; i++) {
      if (paradas[i] <= indiceActual) puntoActivo = i;
    }
 
    puntos.forEach(function (punto, i) {
      punto.classList.toggle("activo", i === puntoActivo);
    });
  }
 
  function actualizarCarrusel(indiceAnterior) {
    const porcentajePorTarjeta = 100 / tarjetasVisibles();
 
    const distancia = Math.abs(indiceActual - (indiceAnterior === undefined ? indiceActual : indiceAnterior));
    const duracion = distancia === 0
      ? 0
      : Math.min(DURACION_MAX_MS, Math.max(DURACION_MIN_MS, distancia * DURACION_POR_TARJETA_MS));
    pista.style.transitionDuration = duracion + "ms";
 
    pista.style.transform = `translateX(-${indiceActual * porcentajePorTarjeta}%)`;
 
    actualizarIndicadores();
    actualizarFlechas();
  }
 
  function irSiguiente() {
    const anterior = indiceActual;
    const paso = tarjetasVisibles();
    indiceActual = Math.min(indiceActual + paso, indiceMaximo());
    actualizarCarrusel(anterior);
  }
 
  function irAnterior() {
    const anterior = indiceActual;
    const paso = tarjetasVisibles();
    indiceActual = Math.max(indiceActual - paso, 0);
    actualizarCarrusel(anterior);
  }
 
  function crearIndicadores() {
    if (!contenedorIndicadores) return;
    contenedorIndicadores.innerHTML = "";
 
    paradas.forEach(function (objetivo, i) {
      const punto = document.createElement("button");
      punto.type = "button";
      punto.setAttribute("aria-label", "Ir al grupo " + (i + 1));
      punto.addEventListener("click", function () {
        const anterior = indiceActual;
        indiceActual = objetivo;
        actualizarCarrusel(anterior);
      });
      contenedorIndicadores.appendChild(punto);
    });
  }
 
  if (botonSiguiente) botonSiguiente.addEventListener("click", irSiguiente);
  if (botonAnterior) botonAnterior.addEventListener("click", irAnterior);
 
  // Swipe para moverse entre personajes en mobile
  const UMBRAL_SWIPE_PX = 40;
  let swipeInicioX = null;
  let swipeInicioY = null;
 
  pista.addEventListener(
    "touchstart",
    function (evento) {
      if (!evento.touches || !evento.touches.length) return;
      swipeInicioX = evento.touches[0].clientX;
      swipeInicioY = evento.touches[0].clientY;
    },
    { passive: true }
  );
 
  pista.addEventListener(
    "touchend",
    function (evento) {
      if (swipeInicioX === null) return;
      const toque = evento.changedTouches && evento.changedTouches[0];
      if (!toque) return;
 
      const deltaX = toque.clientX - swipeInicioX;
      const deltaY = toque.clientY - swipeInicioY;
      swipeInicioX = null;
      swipeInicioY = null;
 
      // Si el movimiento fue más vertical que horizontal, no es un
      // swipe de navegación
      if (Math.abs(deltaX) < UMBRAL_SWIPE_PX || Math.abs(deltaX) < Math.abs(deltaY)) {
        return;
      }
 
      deltaX < 0 ? irSiguiente() : irAnterior();
    },
    { passive: true }
  );
 
  window.addEventListener("resize", function () {
    paradas = calcularParadas();
    indiceActual = Math.min(indiceActual, indiceMaximo());
    crearIndicadores();
    actualizarCarrusel(indiceActual);
  });
 
  paradas = calcularParadas();
  crearIndicadores();
  actualizarCarrusel(indiceActual);
}
 

/* ------------------------------------------------------------
   4. VISOR DE GALERÍA 
   ------------------------------------------------------------ */
function inicializarGaleriaVisor() {

  const seccionesGaleria = document.querySelectorAll(".seccion");
 
  seccionesGaleria.forEach((seccion) => {
    const items = seccion.querySelectorAll(".galeria-grid [data-galeria-img]");
    const visor = seccion.querySelector(".galeria-visor");
 

    if (!items.length || !visor) return;
 
    const imgVisor = visor.querySelector(".galeria-visor-img");
    const listaItems = Array.from(items);
    let indiceActual = -1;
 
    const mediaMobil = window.matchMedia("(max-width: 767px)");
 
    function elementoFullscreenActual() {
      return document.fullscreenElement || document.webkitFullscreenElement || null;
    }
 
async function entrarPantallaCompleta() {
      if (!mediaMobil.matches) return;
      try {
        if (visor.requestFullscreen) await visor.requestFullscreen();
        else if (visor.webkitRequestFullscreen) visor.webkitRequestFullscreen();
      } catch (err) {}
    }
 
    function salirPantallaCompleta() {
      if (elementoFullscreenActual() === visor) {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    }
 
    async function alternarPantallaCompleta() {
      if (elementoFullscreenActual() === visor) {
        salirPantallaCompleta();
        return;
      }
      try {
        if (visor.requestFullscreen) await visor.requestFullscreen();
        else if (visor.webkitRequestFullscreen) visor.webkitRequestFullscreen();
      } catch (err) {

      }
    }
 
    function mostrarPorIndice(indice) {
      const total = listaItems.length;
      indiceActual = ((indice % total) + total) % total;
 
      const item = listaItems[indiceActual];
      imgVisor.src = item.getAttribute("data-galeria-img") || "";
      imgVisor.alt = item.getAttribute("data-galeria-alt") || "";
 
      listaItems.forEach((el) => el.classList.remove("activo"));
      item.classList.add("activo");
    }
 
    function abrir(item) {
      const yaEstabaAbierto = !visor.hidden;
      mostrarPorIndice(listaItems.indexOf(item));
      visor.hidden = false;
 
      if (!yaEstabaAbierto) {
        visor.classList.remove("mostrando");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => visor.classList.add("mostrando"));
        });
 
        requestAnimationFrame(() => {
          visor.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
 
        entrarPantallaCompleta();
      }
    }
 
    function cerrar() {
      salirPantallaCompleta();
      visor.hidden = true;
      visor.classList.remove("mostrando");
      imgVisor.src = "";
      imgVisor.alt = "";
      listaItems.forEach((el) => el.classList.remove("activo"));
      indiceActual = -1;
    }
 
    function siguiente() {
      if (indiceActual === -1) return;
      mostrarPorIndice(indiceActual + 1);
    }
 
    function anterior() {
      if (indiceActual === -1) return;
      mostrarPorIndice(indiceActual - 1);
    }
 

    seccion.addEventListener("click", function (evento) {
      const miniatura = evento.target.closest(".galeria-grid [data-galeria-img]");
      if (miniatura) {
        evento.preventDefault();
        const yaEstaActiva = miniatura.classList.contains("activo");
        yaEstaActiva ? cerrar() : abrir(miniatura);
        return;
      }
 
      if (evento.target.closest(".galeria-visor-cerrar")) {
        evento.preventDefault();
        cerrar();
        return;
      }
 
      if (evento.target.closest(".galeria-visor-pantalla-completa")) {
        evento.preventDefault();
        alternarPantallaCompleta();
        return;
      }
 
      const flecha = evento.target.closest("[data-galeria-visor]");
      if (flecha) {
        evento.preventDefault();
        evento.stopPropagation();
        flecha.getAttribute("data-galeria-visor") === "siguiente" ? siguiente() : anterior();
      }
    });
 
    // reemplaza a las flechas en mobile, están ocultas por CSS. 
    const UMBRAL_SWIPE_PX = 40;
    let swipeInicioX = null;
    let swipeInicioY = null;
 
    const zonaSwipe = visor.querySelector(".galeria-visor-marco") || visor;
 
    zonaSwipe.addEventListener(
      "touchstart",
      function (evento) {
        if (!evento.touches || !evento.touches.length) return;
        swipeInicioX = evento.touches[0].clientX;
        swipeInicioY = evento.touches[0].clientY;
      },
      { passive: true }
    );
 
    zonaSwipe.addEventListener(
      "touchend",
      function (evento) {
        if (swipeInicioX === null) return;
        const toque = evento.changedTouches && evento.changedTouches[0];
        if (!toque) return;
 
        const deltaX = toque.clientX - swipeInicioX;
        const deltaY = toque.clientY - swipeInicioY;
        swipeInicioX = null;
        swipeInicioY = null;
 
        // Si el movimiento fue más vertical que horizontal, no es un
        // swipe de navegación
        if (Math.abs(deltaX) < UMBRAL_SWIPE_PX || Math.abs(deltaX) < Math.abs(deltaY)) {
          return;
        }
 
        deltaX < 0 ? siguiente() : anterior();
      },
      { passive: true }
    );
 
    // teclado solo cuando el visor está abierto
    document.addEventListener("keydown", function (evento) {
      if (visor.hidden) return;
      if (evento.key === "ArrowRight") siguiente();
      else if (evento.key === "ArrowLeft") anterior();
      else if (evento.key === "Escape") cerrar();
    });
  });
}
/* ------------------------------------------------------------
   5. MARCAR PÁGINA ACTIVA EN EL HEADER
   ------------------------------------------------------------ */
function marcarPaginaActiva() {
  let paginaActual = window.location.pathname.split("/").pop();
 

  if (paginaActual === "") {
    paginaActual = "index.html";
  }
 
  const enlaces = document.querySelectorAll("#main-nav a");
 
  enlaces.forEach((enlace) => {
    enlace.classList.remove("activo");
 
    const href = enlace.getAttribute("href");
    if (!href) return;
 
    const paginaEnlace = href.split("/").pop();
 
    if (paginaActual === paginaEnlace) {
      enlace.classList.add("activo");
 

      const dropdownPadre = enlace.closest(".nav-item--dropdown");
      if (dropdownPadre) {
        const botonDropdown = dropdownPadre.querySelector(".dropdown-toggle");
        if (botonDropdown) {
          botonDropdown.classList.add("activo");
        }
      }
    }
  });
}
 
/* ------------------------------------------------------------
   6. FORMULARIO DE CONTACTO
   ------------------------------------------------------------ */
function inicializarFormularioContacto() {
  const formulario = document.querySelector(".formulario-contacto");
  if (!formulario) return;
 
  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault(); 
 

    alert("¡Gracias por tu mensaje! Nos pondremos en contacto pronto.");
 

    formulario.reset();
  });
}