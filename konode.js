/* Konode site — the only script on the page.
   Swaps the install CTA to the visitor's browser. Everything else is CSS.
   Kept external (no inline handlers) so vercel.json can keep script-src 'self'. */

(function () {
  "use strict";

  var STORES = {
    chrome: {
      label: "Chrome",
      family: "Chromium based",
      logo: "assets/chrome.svg",
      url: "https://chromewebstore.google.com/detail/konode/mmlfiiimnpnjcjhhbldenpcmnibedkfa"
    },
    firefox: {
      label: "Firefox",
      family: "Firefox based",
      logo: "assets/firefox.svg",
      url: "https://addons.mozilla.org/firefox/addon/konode/"
    }
  };

  function detect() {
    var ua = navigator.userAgent;

    // Gecko is the reliable Firefox tell; forks (LibreWolf, Waterfox, Zen) match too.
    if (/\bGecko\/\d+/.test(ua) && /Firefox\/\d+/.test(ua)) return "firefox";

    // Everything else that can install a Chrome Web Store item: Chrome, Edge,
    // Brave, Opera, Vivaldi, Arc. Safari gets Chrome as the neutral default,
    // since neither store applies there.
    return "chrome";
  }

  var store = STORES[detect()];

  document.querySelectorAll(".js-install").forEach(function (el) {
    el.href = store.url;
  });
  document.querySelectorAll(".js-browser").forEach(function (el) {
    el.textContent = store.label;
  });
  document.querySelectorAll(".js-browser-logo").forEach(function (el) {
    el.src = store.logo;
  });
  document.querySelectorAll(".js-browser-family").forEach(function (el) {
    el.textContent = store.family;
  });
})();

/* The permission toggles in the Privacy section. Bails out on any page that
   does not contain them, so the doc pages pay nothing for it. */
(function () {
  "use strict";

  /* Bookmarks is the baseline the extension installs with. The other three
     are the sensitive ones the browser prompts for on enable, per
     privacy.html. Keep this list in step with that page. */
  var STREAMS = [
    { id: "bookmarks",  optional: false, can: "Your bookmark tree: folders, titles and URLs" },
    { id: "tabs",       optional: true,  can: "The URLs and titles of your open tabs" },
    { id: "history",    optional: true,  can: "The pages you have visited, and their titles" },
    { id: "extensions", optional: true,  can: "Which extensions you have installed" }
  ];

  var form = document.querySelector("[data-perm-demo]");
  if (!form) return;

  var canList = form.querySelector("[data-can]");
  var cannotList = form.querySelector("[data-cannot]");

  function render() {
    var can = [];
    var cannot = [];

    STREAMS.forEach(function (s) {
      var input = form.querySelector('input[value="' + s.id + '"]');
      (input && input.checked ? can : cannot).push(s.can);
    });

    fill(canList, can, "Nothing at all.");
    fill(cannotList, cannot, "Nothing left. Every stream is on.");
  }

  function fill(list, items, emptyText) {
    list.textContent = "";
    if (!items.length) {
      var p = document.createElement("li");
      p.className = "pd-empty";
      p.textContent = emptyText;
      list.appendChild(p);
      return;
    }
    items.forEach(function (text) {
      var li = document.createElement("li");
      li.textContent = text;
      list.appendChild(li);
    });
  }

  /* No inline handlers anywhere, so the strict CSP in vercel.json still holds
     if this section ever ships. */
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  form.addEventListener("change", render);
  render();
})();
