(function () {
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function el(tag, attrs, children) {
    attrs = attrs || {};
    const kids = children == null ? [] : (Array.isArray(children) ? children : [children]);
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value == null) continue;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "html") node.innerHTML = value;
      else if (key === "dataset") Object.assign(node.dataset, value);
      else if (key === "value") node.value = value;
      else node.setAttribute(key, value);
    }
    appendChildren(node, kids);
    return node;
  }

  function appendChildren(node, list) {
    for (const child of list) {
      if (child == null) continue;
      if (Array.isArray(child)) {
        appendChildren(node, child);
        continue;
      }
      node.append(child.nodeType ? child : document.createTextNode(String(child)));
    }
  }

  function fmt(n) {
    n = Math.round(Number(n) || 0);
    return "₦" + n.toLocaleString("en-NG");
  }

  const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

  function numberWord(n) {
    return WORDS[n] || String(n);
  }

  function dayLabel(ts) {
    const d = new Date(ts);
    const when = d.toLocaleDateString("en-NG", { weekday: "long", month: "short", day: "numeric" });
    const time = d.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });
    return when + " at " + time;
  }

  function notesString(counts) {
    const parts = [];
    for (const denom of CH.state.NOTES) {
      const c = counts[denom] || 0;
      if (c > 0) {
        parts.push((c === 1 ? "a " : numberWord(c) + " ") + "₦" + denom.toLocaleString("en-NG") + (c === 1 ? " note" : " notes"));
      }
    }
    return parts.length ? parts.join(", ") : "nothing";
  }

  function countsFromObject(obj) {
    const counts = {};
    for (const denom of CH.state.NOTES) counts[denom] = 0;
    for (const [k, v] of Object.entries(obj || {})) {
      counts[Number(k)] = Number(v) || 0;
    }
    return counts;
  }

  let toastTimer = null;
  function toast(msg) {
    const node = $("#toast");
    node.textContent = msg;
    node.hidden = false;
    requestAnimationFrame(() => node.classList.add("show"));
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      node.classList.remove("show");
      setTimeout(() => (node.hidden = true), 250);
    }, 2200);
  }

  function showScreen(name) {
    $$(".screen").forEach((s) => (s.hidden = true));
    const screen = $("#screen-" + name);
    if (screen) {
      screen.hidden = false;
      screen.scrollTop = 0;
      window.scrollTo(0, 0);
    }
  }

  function openSheet(node) {
    node.hidden = false;
    const backdrop = node.querySelector(".sheet-backdrop");
    if (backdrop) backdrop.classList.add("show");
    requestAnimationFrame(() => node.classList.add("show"));
  }

  function closeSheet(node) {
    node.classList.remove("show");
    const backdrop = node.querySelector(".sheet-backdrop");
    function done() {
      node.hidden = true;
      if (backdrop) backdrop.classList.remove("show");
      node.removeEventListener("transitionend", done);
    }
    node.addEventListener("transitionend", done);
  }

  const ICONS = {
    store: '<path d="M4 10.5 12 4l8 6.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M9.5 20v-5.5h5V20"/><path d="M9 4v3M15 4v3"/>',
    pin: '<path d="M12 21c-4.2-4-6.8-7.2-6.8-10.7a6.8 6.8 0 1 1 13.6 0C18.8 13.8 16.2 17 12 21Z"/><circle cx="12" cy="10.2" r="2.4"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.4 11a6.6 6.6 0 0 0 13.2 0"/><path d="M12 17.6V21"/>',
    receipt: '<path d="M5 3h14v18l-2.2-1.4L14.6 21l-2.2-1.4L10.2 21 8 19.6 5.8 21Z"/><path d="M9.2 8.2h5.6M9.2 11.2h5.6M9.2 14.2h3.4"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    backspace: '<path d="M8.5 7H21v10H8.5L3.5 12Z"/><path d="M11 10l4 4M15 10l-4 4"/>',
    play: '<path d="M8 5.5v13l11-6.5Z"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>'
  };

  function icon(name, opts) {
    opts = opts || {};
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const size = opts.size || 22;
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", String(opts.weight || 1.8));
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("class", "icon");
    svg.innerHTML = ICONS[name] || "";
    return svg;
  }

  window.CH = window.CH || {};
  CH.ui = {
    $,
    $$,
    el,
    fmt,
    numberWord,
    dayLabel,
    notesString,
    countsFromObject,
    toast,
    showScreen,
    openSheet,
    closeSheet,
    icon
  };
})();