(function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setOpen(false);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setOpen(false);
  });
})();

(function () {
  var button = document.querySelector("[data-map-button]");
  if (!button) return;

  button.addEventListener("click", function () {
    var frame = document.createElement("iframe");
    frame.title = "Mapa da localidade de Chafé, Viana do Castelo";
    frame.src = button.getAttribute("data-map-src");
    frame.loading = "lazy";
    frame.referrerPolicy = "no-referrer-when-downgrade";
    button.replaceWith(frame);
  });
})();
