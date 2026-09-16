(function () {
  const { el, $, $$, fmt } = CH.ui;

  function render() {
    const node = $("#screen-dashboard");
    node.innerHTML = "";
    CH.ui.showScreen("dashboard");
    node.scrollTop = 0;

    const state = CH.db.state;
    const total = CH.state.totalOwed();
    const openTxCount = CH.state.openTxns().length;

    node.append(
      el("div", { class: "topbar" }, [
        el("div", { class: "logo" }, ["Change", el("span", {}, ["Hold"])]),
        el("button", { class: "btn btn-ghost", text: "Manage", id: "manage-btn", style: "margin-left:auto;padding:8px 14px;font-size:14px" })
      ]),
      el("div", { class: "hero" }, [
        el("div", { class: "label", text: total > 0 ? "owed to you right now" : "all caught up" }),
        el("div", { class: "amount" + (total <= 0 ? " cleared" : ""), text: fmt(total) }),
        el("div", { class: "sub text-muted", text: total > 0 ? openTxCount + " uncollected change" + (total > 0 ? " across the shops" : "") : "Remember to grab it before it becomes a bad scene." })
      ])
    );

    const cards = el("div", { id: "shop-cards" });
    if (!state.shops.length) {
      cards.append(
        el("div", { class: "empty-state card" }, [
          el("div", { class: "big" }, [CH.ui.icon("store", { size: 28 })]),
          el("p", { style: "font-weight:700", text: "No shops yet" }),
          el("p", { class: "text-muted", text: "Tap Manage to add your top 3 shops." })
        ])
      );
    } else {
      state.shops.forEach((shop) => {
        const owed = CH.state.shopBalance(shop.id);
        const open = CH.state.openTxnsForShop(shop.id).length;
        cards.append(
          el("button", { class: "shop-card " + (owed > 0 ? "open" : ""), dataset: { shopId: shop.id }, id: "shop-" + shop.id }, [
            el("div", { class: "row1" }, [
              el("span", { class: "name", text: shop.name }),
              el("span", { class: "owed" + (owed <= 0 ? " zero" : ""), text: fmt(owed) })
            ]),
            el("div", { class: "meta" }, [
              el("span", { text: open ? open + " open change" + (open === 1 ? "" : "s") : "all settled" }),
              shop.lat != null ? el("span", { class: "pin-tag" }, [CH.ui.icon("pin", { size: 13, weight: 2.2 }), "nearby alerts on"]) : null
            ])
          ])
        );
      });
    }

    node.append(cards);

    const oneOffTotal = CH.state.oneOffBalance();
    const oneOffOpen = CH.state.openOneOffs().length;
    node.append(
      el("button", { class: "oneoff-trigger", id: "oneoff-trigger" }, [
        el("div", { class: "io-icon" }, [CH.ui.icon("mic")]),
        el("div", {}, [
          el("div", { class: "io-label", text: "One-off shop / random vendor" }),
          el("div", {
            class: "io-sub",
            text: oneOffTotal > 0 ? fmt(oneOffTotal) + " owed · " + oneOffOpen + " open" : "Quick-capture any other vendor you walk away from"
          })
        ])
      ])
    );

    const oneOffCard = CH.oneoff.listCard();
    if (oneOffCard) node.append(oneOffCard);

    node.append(
      el("button", { class: "fab", id: "log-fab", text: "+", title: "Log change" })
    );

    $("#log-fab").addEventListener("click", () => CH.log.start());
    $("#oneoff-trigger").addEventListener("click", () => CH.oneoff.open());
    $("#manage-btn").addEventListener("click", () => CH.manage.render());
    $$("#shop-cards .shop-card").forEach((c) =>
      c.addEventListener("click", () => CH.shop.render(c.dataset.shopId))
    );
  }

  function refresh() {
    if ($("#screen-dashboard").hidden) return;
    render();
  }

  window.CH = window.CH || {};
  CH.dashboard = { render, refresh };
})();