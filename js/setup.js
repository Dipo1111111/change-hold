(function () {
  const { el, $, $$, fmt } = CH.ui;
  const SUGGESTIONS = ["Bread", "Milk", "Soda", "Indomie", "Eggs", "Cooking Oil"];

  let shopInputs = [
    { name: "", lat: null, lng: null, geoLocked: null },
    { name: "", lat: null, lng: null, geoLocked: null },
    { name: "", lat: null, lng: null, geoLocked: null }
  ];

  function render() {
    const node = $("#screen-setup");
    CH.ui.showScreen("setup");
    node.innerHTML = "";
    const root = el("div", {}, [
      el("div", { class: "topbar" }, [el("div", { class: "logo" }, ["Change", el("span", {}, ["Hold"])])]),
      el("h1", { class: "step-title", text: "Set up your 3 shops" }),
      el("p", { class: "step-sub text-muted", text: "The shops where your change keeps disappearing. Add their details once — everything else is taps." }),
      el("div", { id: "setup-body" })
    ]);
    node.append(root);
    renderStep(root, 0);
  }

  function renderStep(root, step, error) {
    const body = $("#setup-body");
    body.innerHTML = "";

    if (step === 0) {
      body.append(
        el("div", {}, [
          el("div", { class: "steps-dots" }, [el("div", { class: "dot on" }), el("div", { class: "dot" }), el("div", { class: "dot", html: "&nbsp;" })])
        ])
      );
      shopInputs.forEach((shop, i) => {
        body.append(
          el("div", { class: "card", html: "" }, [
            el("div", { class: "form-field" }, [
              el("label", { text: "Shop " + (i + 1) }),
              el("input", {
                type: "text",
                placeholder: "e.g. Mama Adunni's, Bodega, Oga Store",
                value: shop.name || "",
                dataset: { shopInput: String(i) }
              })
            ]),
            el("div", { class: "location-line", dataset: { locLine: String(i) } }, [
              el("span", { class: "loc-dot", dataset: { locDot: String(i) } }),
              el("span", {
                class: "text-muted",
                dataset: { locText: String(i) },
                text: shop.lat != null ? "Location saved — gets alerts when you pass by" : "No location yet (optional)"
              }),
              el("button", { class: "btn btn-ghost", text: shop.lat != null ? "Re-capture" : "Set", dataset: { locBtn: String(i) } })
            ])
          ])
        );
      });
      body.append(
        el("div", { class: "wizard-actions" }, [
          el("button", { class: "btn btn-primary", text: "Next", id: "setup-next", disabled: false })
        ])
      );
      if (error) body.append(el("p", { class: "text-muted", style: "color:var(--red)", text: error }));
      $("#setup-next").addEventListener("click", () => next(root));
      $$("[data-loc-btn]", body).forEach((btn) =>
        btn.addEventListener("click", () => captureLocation(Number(btn.dataset.locBtn)))
      );
    } else {
      body.append(
        el("div", {}, [
          el("div", { class: "steps-dots" }, [el("div", { class: "dot on" }), el("div", { class: "dot" }), el("div", { class: "dot on" })])
        ]),
        el("h2", { class: "step-title", text: "Your frequent buys" }),
        el("p", { class: "step-sub text-muted", text: "The items you grab constantly. No prices yet — you tap those at each transaction." }),
        el("div", { id: "items-area", class: "card" }, [
          el("div", { class: "tag-group", id: "items-list" })
        ]),
        el("div", { class: "form-field", style: "margin-top:14px" }, [
          el("label", { text: "Add another item" }),
          el("div", { style: "display:flex;gap:10px" }, [
            el("input", { type: "text", id: "new-item", placeholder: "Item name", style: "flex:1" }),
            el("button", { class: "btn btn-ghost", text: "Add", id: "add-item" })
          ]),
          el("p", { class: "text-muted", style: "margin-top:8px", text: "" , id: "items-hint"})
        ]),
        el("div", { class: "wizard-actions" }, [
          el("button", { class: "btn btn-primary", text: "Start using ChangeHold", id: "setup-finish" })
        ])
      );
      renderItems();
      $("#add-item").addEventListener("click", () => addItem());
      $("#new-item").addEventListener("keydown", (e) => {
        if (e.key === "Enter") addItem();
      });
      $("#setup-finish").addEventListener("click", () => finish(root));
    }
  }

  function renderItems() {
    const list = $("#items-list");
    list.innerHTML = "";
    const items = CH.db.state.items;
    if (!items.length) {
      SUGGESTIONS.forEach((name) => {
        list.append(
          el("button", { class: "tag-option", text: name, dataset: { sug: name } })
        );
      });
      $$("[data-sug]", list).forEach((b) =>
        b.addEventListener("click", () => {
          if (!CH.state.itemExists(b.dataset.sug)) {
            CH.db.state.items.push(b.dataset.sug);
            CH.db.save();
          }
          renderItems();
        })
      );
      $("#items-hint").textContent = "Tap the ones you buy constantly, or add your own below.";
    } else {
      CH.db.state.items.forEach((name) => {
        list.append(
          el("div", { class: "manage-row" }, [
            el("span", { text: name, style: "font-weight:700" }),
            el("button", { class: "btn btn-ghost", text: "Remove", dataset: { removeItem: name } })
          ])
        );
      });
      $$("[data-remove-item]", list).forEach((b) =>
        b.addEventListener("click", () => {
          CH.db.state.items = CH.db.state.items.filter((i) => i !== b.dataset.removeItem);
          CH.db.save();
          renderItems();
        })
      );
      $("#items-hint").textContent = "Tap items to finalize your list." ;
    }
  }

  function addItem() {
    const input = $("#new-item");
    const name = input.value.trim();
    if (!name) return;
    if (CH.state.itemExists(name)) {
      CH.ui.toast("Already in your list");
      return;
    }
    CH.db.state.items.push(name);
    CH.db.save();
    input.value = "";
    renderItems();
  }

  function captureLocation(index) {
    if (!navigator.geolocation) {
      CH.ui.toast("Location not supported on this device");
      return;
    }
    const btn = $('[data-loc-btn="' + index + '"]');
    btn.textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        shopInputs[index].lat = pos.coords.latitude;
        shopInputs[index].lng = pos.coords.longitude;
        shopInputs[index].geoLocked = Date.now();
        refreshLocationLine(index);
      },
      () => {
        btn.textContent = "Set";
        CH.ui.toast("Couldn't get location — tap Set to try again");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  function refreshLocationLine(index) {
    const dot = $('[data-loc-dot="' + index + '"]');
    const text = $('[data-loc-text="' + index + '"]');
    const btn = $('[data-loc-btn="' + index + '"]');
    dot.classList.add("on");
    text.textContent = "Location saved — you'll get alerts when you pass by";
    btn.textContent = "Re-capture";
  }

  function next(root) {
    $$("[data-shop-input]").forEach((input, i) => {
      shopInputs[i].name = input.value.trim();
    });
    if (shopInputs.some((s) => !s.name)) {
      renderStep(root, 0, "Give every shop a name so the log stays quick.");
      return;
    }
    renderStep(root, 1);
  }

  function finish(root) {
    if (!CH.db.state.items.length) {
      CH.ui.toast("Add at least one frequent buy first");
      return;
    }
    CH.db.state.shops = shopInputs.map((s, i) => ({
      id: CH.db.uid(),
      name: s.name,
      lat: s.lat,
      lng: s.lng,
      geoLockedAt: s.geoLocked
    }));
    CH.db.state.setupComplete = true;
    CH.db.save();
    CH.geo.init();
    CH.dashboard.render();
    CH.ui.toast("You're set — go grab some change.");
  }

  window.CH = window.CH || {};
  CH.setup = { render };
})();