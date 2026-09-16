(function () {
  const { el, $, $$, fmt } = CH.ui;

  function render() {
    const node = $("#screen-manage");
    node.innerHTML = "";
    CH.ui.showScreen("manage");

    const state = CH.db.state;

    node.append(
      el("div", { class: "topbar" }, [
        el("button", { class: "back", id: "manage-back" }, [CH.ui.icon("back", { size: 18 })]),
        el("div", { class: "logo", text: "Manage" })
      ])
    );

    state.shops.forEach((shop, i) => {
      node.append(
        el("div", { class: "card" }, [
          el("div", { class: "form-field" }, [
            el("label", { text: "Shop " + (i + 1) + " name" }),
            el("input", { type: "text", value: shop.name, id: "shop-name-" + shop.id, dataset: { rename: shop.id } })
          ]),
          el("div", { class: "location-line" }, [
            el("span", { class: "loc-dot" + (shop.lat != null ? " on" : "") }),
            el("span", { class: "text-muted", text: shop.lat != null ? "Location saved" : "No location" }),
            el("button", { class: "btn btn-ghost", text: shop.lat != null ? "Re-capture" : "Set location", dataset: { recapture: shop.id }, style: "margin-left:auto" }),
            shop.lat != null ? el("button", { class: "btn btn-danger", dataset: { clearGeo: shop.id }, style: "margin-left:6px" }, [CH.ui.icon("x")]) : null
          ])
        ])
      );
    });

    node.append(el("div", { class: "section-title", text: "Frequent items" }));

    const itemCard = el("div", { class: "card" });
    const itemList = el("div", { id: "m-items" });
    itemCard.append(itemList);
    state.items.forEach((name) => {
      itemList.append(
        el("div", { class: "manage-row" }, [
          el("span", { text: name, style: "font-weight:700" }),
          el("button", { class: "btn btn-ghost", text: "Remove", dataset: { mDelItem: name } })
        ])
      );
    });
    itemCard.append(
      el("div", { style: "display:flex;gap:10px;margin-top:12px" }, [
        el("input", { type: "text", id: "m-new-item", placeholder: "New item", style: "flex:1" }),
        el("button", { class: "btn btn-ghost", text: "Add", id: "m-add-item" })
      ])
    );
    node.append(itemCard);

    node.append(el("div", { class: "section-title", text: "Proximity alerts" }));
    node.append(
      el("div", { class: "notif-toggle" }, [
        el("div", {}, [
          el("div", { style: "font-weight:700", text: "Remind me when I pass a shop" }),
          el("div", { class: "text-muted", text: "Needs notifications + location permission" })
        ]),
        el("label", { class: "switch" }, [
          el("input", { type: "checkbox", id: "alerts-toggle", checked: !!state.alerts.enabled }),
          el("span", { class: "track" })
        ])
      ]),
      el("p", { class: "text-muted", id: "alerts-status", style: "margin-top:8px" })
    );
    updateAlertsStatus();

    node.append(el("div", { class: "section-title", text: "Danger zone" }));
    node.append(
      el("button", { class: "btn btn-danger", text: "Erase everything & start over", id: "m-reset" })
    );
    node.append(
      el("p", { class: "text-muted", style: "margin:20px 0 8px", text: "ChangeHold v1 · all data stored on this device only" })
    );

    $("#manage-back").addEventListener("click", () => CH.dashboard.render());
    $$("[data-rename]", node).forEach((input) =>
      input.addEventListener("change", (e) => {
        const shop = state.shops.find((s) => s.id === input.dataset.rename);
        if (shop) {
          shop.name = e.target.value.trim() || shop.name;
          CH.db.save();
        }
      })
    );
    $$("[data-recapture]", node).forEach((btn) =>
      btn.addEventListener("click", () => capture(btn.dataset.recapture))
    );
    $$("[data-clear-geo]", node).forEach((btn) =>
      btn.addEventListener("click", () => {
        const shop = state.shops.find((s) => s.id === btn.dataset.clearGeo);
        if (shop) {
          shop.lat = null;
          shop.lng = null;
          shop.geoLockedAt = null;
          CH.db.save();
          render();
        }
      })
    );
    $$("[data-m-del-item]", node).forEach((btn) =>
      btn.addEventListener("click", () => {
        state.items = state.items.filter((i) => i !== btn.dataset.mDelItem);
        CH.db.save();
        render();
      })
    );
    $("#m-add-item").addEventListener("click", () => {
      const input = $("#m-new-item");
      const name = input.value.trim();
      if (!name) return;
      if (CH.state.itemExists(name)) {
        CH.ui.toast("Already in your list");
        return;
      }
      state.items.push(name);
      CH.db.save();
      render();
    });
    $("#alerts-toggle").addEventListener("change", (e) => toggleAlerts(e.target.checked));
    $("#m-reset").addEventListener("click", () => {
      if (!window.confirm("Erase ALL shops, logs and balances? This cannot be undone.")) return;
      CH.db.reset();
      CH.geo.stop();
      CH.geo.init();
      CH.setup.render();
    });
  }

  function capture(shopId) {
    const shop = CH.db.state.shops.find((s) => s.id === shopId);
    if (!navigator.geolocation) {
      CH.ui.toast("Location not supported");
      return;
    }
    CH.ui.toast("Locating…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        shop.lat = pos.coords.latitude;
        shop.lng = pos.coords.longitude;
        shop.geoLockedAt = Date.now();
        CH.db.save();
        CH.geo.init();
        render();
      },
      () => CH.ui.toast("Couldn't get location"),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  function updateAlertsStatus() {
    const out = $("#alerts-status");
    if (!out) return;
    const enabled = !!CH.db.state.alerts.enabled;
    const supported = "Notification" in window && navigator.geolocation;
    if (!supported) {
      out.textContent = "Not supported on this browser/device.";
    } else if (enabled) {
      out.textContent = "On — you'll get a ping when you're within ~300m of a shop that owes you.";
    } else {
      out.textContent = "Off. Shops with saved locations still show their tag on the home page.";
    }
  }

  function toggleAlerts(on) {
    const state = CH.db.state;
    state.alerts.enabled = on;
    if (on) {
      const askPerm = (typeof Notification !== "undefined" && Notification.permission !== "granted")
        ? Notification.requestPermission()
        : Promise.resolve("granted");
      askPerm
        .then((perm) => {
          if (perm !== "granted") {
            state.alerts.enabled = false;
            CH.ui.toast("Notifications blocked — alerts stay off");
          } else {
            CH.geo.startWatcher();
            CH.ui.toast("Alerts on — pass a shop and get reminded");
          }
          CH.db.save();
          updateAlertsStatus();
          $("#alerts-toggle").checked = !!state.alerts.enabled;
        });
    } else {
      CH.geo.stop();
      CH.db.save();
      updateAlertsStatus();
    }
  }

  window.CH = window.CH || {};
  CH.manage = { render };
})();