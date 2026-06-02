/*
╔══════════════════════════════════════════════════════════════════╗
║                  InfraCR — JavaScript                            ║
║  Archivo: main.js                                                ║
║  Descripción: Toda la interactividad de la landing page.         ║
║  No requiere librerías externas (Vanilla JS puro).               ║
╚══════════════════════════════════════════════════════════════════╝

MÓDULOS EN ESTE ARCHIVO:
─────────────────────────────────────────
1. DOMContentLoaded     → Espera a que la página cargue
2. Menú hamburguesa     → Abre/cierra el menú móvil
3. Navbar scroll        → Cambia el fondo del navbar al bajar
4. Scroll animations    → Anima elementos al entrar en pantalla
5. Accesibilidad teclado→ Tarjetas navegables con teclado
6. Contadores animados  → Números que suben al ser visibles
7. Chatbot FAB          → Acción del botón flotante
─────────────────────────────────────────
*/


/* ══════════════════════════════════════════
MÓDULO 1 — DOMContentLoaded
══════════════════════════════════════════
Todo el código se ejecuta DESPUÉS de que
el HTML esté completamente cargado en el DOM.
Esto evita errores de "elemento no encontrado".
*/
document.addEventListener('DOMContentLoaded', () => {

/* ──────────────────────────────────────
MÓDULO 2 — MENÚ HAMBURGUESA (móvil)
──────────────────────────────────────
Al hacer click en el botón de las 3 líneas:
· Alterna la clase "is-open" en el menú y el botón.
· "is-open" activa los estilos de menú abierto en styles.css.
· Actualiza aria-expanded para lectores de pantalla.
*/
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileMenu   = document.getElementById('mobile-menu');

if (hamburgerBtn && mobileMenu) {

    hamburgerBtn.addEventListener('click', () => {
      /* Toggle: si estaba abierto lo cierra, y viceversa */
    const isOpen = mobileMenu.classList.toggle('is-open');

      /* Actualiza el estado visual del botón (animación de X) */
    hamburgerBtn.classList.toggle('is-open', isOpen);

      /* Accesibilidad: informa a lectores de pantalla si el menú está abierto */
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    });

    /* Cierra el menú móvil automáticamente al tocar cualquier link dentro de él.
       Útil cuando el usuario navega a una sección con ancla (#). */
    mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        hamburgerBtn.classList.remove('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
    });
    });

    /* Cierra el menú si el usuario hace click fuera de él */
    document.addEventListener('click', (e) => {
    const clickFueraDelMenu    = !mobileMenu.contains(e.target);
    const clickFueraDelBoton   = !hamburgerBtn.contains(e.target);
    const menuEstaAbierto      = mobileMenu.classList.contains('is-open');

    if (menuEstaAbierto && clickFueraDelMenu && clickFueraDelBoton) {
        mobileMenu.classList.remove('is-open');
        hamburgerBtn.classList.remove('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
    });
}


/* ──────────────────────────────────────
    MÓDULO 3 — NAVBAR AL HACER SCROLL
    ──────────────────────────────────────
    Cuando el usuario baja más de 20px,
    agrega la clase "scrolled" al navbar.
    En styles.css, .navbar.scrolled pone
    el fondo completamente sólido.

    "passive: true" le dice al navegador que
    este listener nunca llamará preventDefault(),
    lo que mejora el rendimiento del scroll.
  */
const navbar = document.querySelector('.navbar');

if (navbar) {
    window.addEventListener('scroll', () => {
      /* scrollY: cuántos píxeles se ha desplazado hacia abajo */
    if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    }, { passive: true });
}


/* ──────────────────────────────────────
    MÓDULO 4 — ANIMACIONES AL HACER SCROLL
    ──────────────────────────────────────
    Usa la API IntersectionObserver para
    detectar cuándo un elemento entra en la
    pantalla y le agrega la clase "visible".

    En styles.css:
    · .reveal          → opacidad 0, desplazado hacia abajo
    · .reveal.visible  → opacidad 1, posición normal

    threshold: 0.12 → se activa cuando el 12% del
    elemento es visible en la pantalla.
  */
const scrollObserver = new IntersectionObserver(
    (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
          /* Agrega la clase que dispara la animación CSS */
        entry.target.classList.add('visible');

        /* Deja de observar el elemento una vez animado.
            Esto mejora el rendimiento: no sigue revisando
             elementos que ya terminaron de animarse. */
        scrollObserver.unobserve(entry.target);
        }
    });
    },
    {
    threshold: 0.12,
    /* rootMargin: activa la animación 30px antes del borde inferior
         de la pantalla, para que se vea más natural. */
    rootMargin: '0px 0px -30px 0px'
    }
);

  /* Selecciona todos los elementos marcados para animar */
document.querySelectorAll('.reveal').forEach(el => {
    scrollObserver.observe(el);
});


/* ──────────────────────────────────────
    MÓDULO 5 — ACCESIBILIDAD DE TARJETAS
    ──────────────────────────────────────
    Las tarjetas (.cat-card) son <div> con role="button",
    por lo que el navegador no les agrega soporte de
    teclado automáticamente. Este código lo hace manualmente:
    · Enter y Espacio activan el click (igual que un <button>).
  */
document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();   /* evita que el Espacio haga scroll */
        card.click();

        /* ── PARA CONECTAR CON EL BACKEND ──
        Cuando el usuario haga click en una tarjeta,
        puedes redirigirlo a la página de reporte así:

        const categoria = card.querySelector('.cat-name').textContent;
        window.location.href = `/reportar?categoria=${encodeURIComponent(categoria)}`;
        */
    }
    });
});


/* ──────────────────────────────────────
    MÓDULO 6 — CONTADORES ANIMADOS
    ──────────────────────────────────────
    Cuando las estadísticas (.stat-value) entran
    en pantalla, los números "suben" desde 0
    hasta su valor final en 1.5 segundos.

    Cómo funciona:
    · Lee el número del atributo data-target del HTML.
    · Usa requestAnimationFrame para animar suavemente.
    · Soporta el símbolo "+" al final (ej: "12,430+").
  */

  /* Función que anima un número de 0 hasta "target" en "duration" ms */
function animarContador(elemento, target, duration = 1500) {
    const tieneSignoMas = elemento.textContent.includes('+');
    let startTime = null;

    function paso(timestamp) {
      /* Primera vez: guarda el tiempo de inicio */
    if (!startTime) startTime = timestamp;

      /* Progreso: de 0.0 a 1.0 según el tiempo transcurrido */
    const progreso = Math.min((timestamp - startTime) / duration, 1);

      /* Función de easing: acelera al inicio y frena al final */
    const easedProgress = 1 - Math.pow(1 - progreso, 3);

      /* Calcula el número actual */
      const valorActual = Math.floor(easedProgress * target);

      /* Formatea con comas (ej: 12430 → "12,430") */
    elemento.textContent = valorActual.toLocaleString('es-CR') + (tieneSignoMas ? '+' : '');

      /* Continúa la animación si no llegó al final */
    if (progreso < 1) {
        requestAnimationFrame(paso);
    }
    }

    requestAnimationFrame(paso);
}

  /* Observer para los contadores: se activan al entrar en pantalla */
const contadorObserver = new IntersectionObserver(
    (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
        const el = entry.target;

          /* Lee el número objetivo desde el atributo data-target */
        const target = parseInt(el.getAttribute('data-target'), 10);

        if (!isNaN(target)) {
            animarContador(el, target);
        }

          /* Solo se anima una vez */
        contadorObserver.unobserve(el);
        }
    });
    },
    { threshold: 0.5 }   /* se activa cuando el 50% es visible */
);

  /* Observa todos los elementos con data-target */
document.querySelectorAll('.stat-value[data-target]').forEach(el => {
    contadorObserver.observe(el);
});


/* ──────────────────────────────────────
    MÓDULO 7 — CHATBOT FAB
    ──────────────────────────────────────
    El botón flotante del chatbot (🤖).
    Aquí puedes conectarlo a tu chatbot real,
    como Dialogflow, Tidio, Intercom, etc.
  */
const chatbotFab = document.querySelector('.chatbot-fab');

if (chatbotFab) {
    chatbotFab.addEventListener('click', () => {
    /* ── PARA CONECTAR CON UN CHATBOT REAL ──
        Ejemplo con Tidio:
        window.tidioChatApi.open();

        Ejemplo con Intercom:
        window.Intercom('show');

         Por ahora muestra un mensaje de prueba: */
alert('¡Hola! El soporte por chat estará disponible próximamente. 😊\n\nEscríbenos a: soporte@infranacion.com');
    });
}


/* ──────────────────────────────────────
MÓDULO EXTRA — SMOOTH SCROLL para links internos
    ──────────────────────────────────────
    Aunque styles.css ya tiene scroll-behavior: smooth,
    este código asegura compatibilidad en navegadores
    que no lo soporten (Safari antiguo, etc).
  */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
    const destino = document.querySelector(link.getAttribute('href'));
    if (destino) {
e.preventDefault();
destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
});
});

}); /* ── Fin de DOMContentLoaded ── */s