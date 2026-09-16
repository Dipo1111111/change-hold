(function () {
  const { el, $, $$, fmt } = CH.ui;

  function render(shopId) {
    const node = $("#screen-shop");
    node.innerHTML = "";
    CH.ui.showScreen("shop");

    const shop = CH.state.shopById(shopId);
    if (!shop) {
      CH.dashboard.render();
      return;
    }

    const owed = CH.state.shopBalance(shopId);
    const open = CH.state.openTxnsForShop(shopId);
    const settled = CH.state.settledTxnsForShop(shopId);

    node.append(
      el("div", { class: "topbar" }, [
        el("button", { class: "back", id: "shop-back" }, [CH.ui.icon("back", { size: 18 })]),
        el("div", { class: "logo", text: shop.name })
      ]),
      el("div", { class: "hero" }, [
        el("div", { class: "label", text: owed > 0 ? "they are holding" : "all clear" }),
        el("div", { class: "amount", text: fmt(owed) }),
        el("div", { class: "sub text-muted", text: open.length + " uncollected change" + (open.length === 1 ? "" : "s") })
      ]),
      el("button", { class: "btn btn-primary", id: "shop-log", text: "+ Log a change here" })
    );

    if (!open.length && !settled.length) {
      node.append(
        el("div", { class: "empty-state card" }, [
          el("div", { class: "big" }, [CH.ui.icon("receipt", { size: 28 })]),
          el("p", { style: "font-weight:700", text: "No transactions yet" }),
          el("p", { class: "text-muted", text: "Log your first change and it'll show up here." })
        ])
      );
    } else {
      if (open.length) {
        node.append(el("div", { class: "section-title", text: "Still owed (" + open.length + ")" }));
        open.forEach((t) => node.append(debrief(t, shop)));
      }
      if (settled.length) {
        node.append(el("div", { class: "section-title", text: "Settled history" }));
        settled.slice().sort((a, b) => b.ts - a.ts).forEach((t) =>
          node.append(debrief(t, shop, true))
        );
      }
    }

    $("#shop-back").addEventListener("click", () => CH.dashboard.render());
    $("#shop-log").addEventListener("click", () => CH.log.start());
    $$("[data-settle]", node).forEach((b) =>
      b.addEventListener("click", () => settle(b.dataset.settle, shop))
    );
    $$("[data-delete]", node).forEach((b) =>
      b.addEventListener("click", () => remove(b.dataset.delete, shop))
    );
  }

  function debrief(t, shop, settledCard) {
    const owedAmt = CH.state.txnOwed(t);
    const card = el("div", { class: "card debrief" + (settledCard ? " settled-card" : " open") }, [
      el("div", { class: "d-head" }, [
        el("div", {}, [
          el("div", { class: "d-item", text: t.item }),
          el("div", { class: "d-date", text: CH.ui.dayLabel(t.ts) })
        ]),
        el("div", { class: "d-owed", text: fmt(Math.max(0, owedAmt)) })
      ]),
      el("div", { class: "story" }, [
        el("div", { class: "story-label", text: "Debrief — read to the vendor" }),
        el("p", { text: debriefStory(t) })
      ]),
      el("div", { class: "d-actions" }, [
        settledCard
          ? el("button", { class: "btn btn-ghost", text: "Delete record", dataset: { delete: t.id } })
          : [
              el("button", { class: "btn btn-primary", dataset: { settle: t.id }, style: "flex:1" }, [CH.ui.icon("check", { size: 14 }), " Mark settled"]),
              el("button", { class: "btn btn-danger", dataset: { delete: t.id }, style: "width:56px;flex:none" }, [CH.ui.icon("x")])
            ]
      ])
    ]);
    return card;
  }

  function debriefStory(t) {
    const handedStr = CH.ui.notesString(t.handed);
    const parts = [];
    parts.push("I bought " + t.item + " for " + fmt(t.price) + " on " + CH.ui.dayLabel(t.ts) + ".");
    parts.push("I handed over " + (handedStr === "nothing" ? fmt(t.handedValue) : handedStr) + ".");
    if (t.returnedMode === "nothing") {
      parts.push("You gave me nothing back in change.");
    } else if (t.returnedMode === "full") {
      parts.push("You gave me back my full change.");
    } else {
      parts.push("You only managed " + fmt(t.returnedValue) + " back at the time.");
    }
    const owedAmt = CH.state.txnOwed(t);
    if (owedAmt > 0) {
      parts.push("You are holding " + fmt(owedAmt) + " for me.");
    } else {
      parts.push("We are square.");
    }
    return parts.join(" ");
  }

  function settle(txnId, shop) {
    const t = CH.db.state.transactions.find((x) => x.id === txnId);
    if (t) {
      t.settled = true;
      t.settledAt = Date.now();
      CH.db.save();
      CH.ui.toast("Settled. Money back where it belongs.");
      render(shop.id);
    }
  }

  function remove(txnId, shop) {
    if (!window.confirm("Delete this log permanently?")) return;
    CH.db.state.transactions = CH.db.state.transactions.filter((x) => x.id !== txnId);
    CH.db.save();
    render(shop.id);
  }

  window.CH = window.CH || {};
  CH.shop = { render };
})();