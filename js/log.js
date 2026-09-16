(function () {
  const { el, $, $$, fmt } = CH.ui;
  const STEPS = 6;

  let flow = null;

  function freshFlow() {
    return {
      step: 0,
      shopId: null,
      item: null,
      price: 0,
      handed: CH.ui.countsFromObject({}),
      returnedMode: null,
      returned: CH.ui.countsFromObject({})
    };
  }

  function start() {
    flow = freshFlow();
    CH.ui.showScreen("log");
    const node = $("#screen-log");
    node.innerHTML = "";
    node.append(
      el("div", { class: "topbar" }, [
        el("button", { class: "back", id: "log-back" }, [CH.ui.icon("x", { size: 16 })]),
        el("div", { class: "logo" }, ["Log change"]),
        el("span", { class: "text-muted", id: "log-step-label", style: "margin-left:auto" })
      ])
    );
    $("#log-back").addEventListener("click", () => cancel());
    const body = el("div", { id: "log-body" });
    node.append(body);
    render();
  }

  function cancel() {
    if (flow && flow.step > 0 && window.confirm("Discard this log?")) {
      flow = null;
      CH.dashboard.render();
    } else if (flow && flow.step === 0) {
      flow = null;
      CH.dashboard.render();
    }
  }

  function expectedChange() {
    return Math.max(0, CH.state.notesValue(flow.handed) - flow.price);
  }

  function returnedValue() {
    if (flow.returnedMode === "full") return expectedChange();
    return CH.state.notesValue(flow.returned);
  }

  function owed() {
    return Math.max(0, CH.state.notesValue(flow.handed) - flow.price - returnedValue());
  }

  function render() {
    const body = $("#log-body");
    body.innerHTML = "";
    $("#log-step-label").textContent = (flow.step + 1) + " / " + STEPS;

    body.append(
      el("div", { class: "steps-dots" },
        Array.from({ length: STEPS }, (_, i) => el("div", { class: "dot" + (i <= flow.step ? " on" : "") }))
      )
    );

    const steps = [renderShop, renderItem, renderPrice, renderHanded, renderReturned, renderReview];
    steps[flow.step](body);
  }

  function renderShop(body) {
    body.append(
      el("h2", { class: "step-title", text: "Where did you leave your change?" }),
      el("p", { class: "step-sub text-muted", text: "Tap the shop — one tap, that's it." })
    );
    const state = CH.db.state;
    if (!state.shops.length) {
      body.append(el("p", { class: "text-muted", text: "No shops set up yet." }));
      return;
    }
    state.shops.forEach((shop) => {
      const owed = CH.state.shopBalance(shop.id);
      body.append(
        el("button", {
          class: "big-card" + (flow.shopId === shop.id ? " active" : ""),
          dataset: { pickShop: shop.id }
        }, [
          shop.name,
          el("span", { class: "card-sub", text: owed > 0 ? "currently owed " + fmt(owed) : "all settled" })
        ])
      );
    });
    body.append(actions("Continue", () => flow.shopId && next(), !flow.shopId));
    $$("[data-pick-shop]", body).forEach((b) =>
      b.addEventListener("click", () => {
        flow.shopId = b.dataset.pickShop;
        next();
      })
    );
  }

  function renderItem(body) {
    body.append(
      el("h2", { class: "step-title", text: "What did you buy?" }),
      el("p", { class: "step-sub text-muted", text: "Tap the item. No prices attached — prices move." })
    );
    const items = CH.db.state.items;
    if (!items.length) {
      body.append(el("p", { class: "text-muted", text: "No items yet — set them in Manage." }));
      return;
    }
    const group = el("div", { class: "tag-group" });
    items.forEach((item) => {
      group.append(
        el("button", { class: "tag-option" + (flow.item === item ? " selected" : ""), text: item, dataset: { pickItem: item } })
      );
    });
    body.append(group);
    body.append(actions("Continue", () => flow.item && next(), !flow.item));
    $$("[data-pick-item]", body).forEach((b) =>
      b.addEventListener("click", () => {
        flow.item = b.dataset.pickItem;
        next();
      })
    );
  }

  function renderPrice(body) {
    body.append(
      el("h2", { class: "step-title", text: "How much today?" }),
      el("p", { class: "step-sub text-muted", text: "Tap the digits. No keyboard, no typos waiting to happen." }),
      el("div", {
        class: "amount-display" + (flow.price ? "" : " empty"),
        id: "price-display",
        text: flow.price ? fmt(flow.price) : "₦0"
      }),
      el("div", { class: "numpad" }, [
        ...[7, 8, 9, 4, 5, 6, 1, 2, 3].map((d) =>
          el("button", { text: String(d), dataset: { digit: String(d) } })
        ),
        el("button", { dataset: { digit: "back" } }, [CH.ui.icon("backspace", { size: 17 })]),
        el("button", { text: "0", dataset: { digit: "0" } }),
        el("button", { text: "OK", dataset: { digit: "ok" }, style: "background:var(--red);color:var(--paper);border-color:var(--red);" })
      ])
    );
    $$("[data-digit]", body).forEach((b) =>
      b.addEventListener("click", () => {
        const d = b.dataset.digit;
        if (d === "ok") {
          if (flow.price > 0) next();
          return;
        }
        if (d === "back") {
          flow.price = Math.floor(flow.price / 10);
        } else if (String(flow.price).length < 7) {
          flow.price = Number(String(flow.price) + d);
        }
        $("#price-display").textContent = flow.price ? fmt(flow.price) : "₦0";
        $("#price-display").classList.toggle("empty", !flow.price);
      })
    );
  }

  function noteGrid(counts, onTap) {
    const grid = el("div", { class: "note-grid" });
    CH.state.NOTES.forEach((denom) => {
      const note = el("button", { class: "note", dataset: { note: String(denom) } }, [
        fmt(denom),
        el("small", { text: denom === 1000 ? "thousand" : denom === 50 ? "fifty" : "naira" }),
        el("span", { class: "count", text: "" })
      ]);
      updateNote(note, counts[denom]);
      note.addEventListener("click", () => {
        counts[denom] += 1;
        updateNote(note, counts[denom]);
        onTap && onTap();
      });
      grid.append(note);
    });
    return grid;
  }

  function updateNote(note, count) {
    const label = note.querySelector("span.count");
    label.textContent = count > 0 ? "×" + count : "";
    note.classList.toggle("tapped", count > 0);
  }

  function renderHanded(body) {
    body.append(
      el("h2", { class: "step-title", text: "What did you hand over?" }),
      el("p", { class: "step-sub text-muted", text: "Stack the actual notes you handed. Two ₦1,000? Tap it twice." }),
      noteGrid(flow.handed, updateHandedTotal),
      el("div", { class: "running-total", id: "handed-total", text: fmt(CH.state.notesValue(flow.handed)) }),
      actions("Continue", next, !CH.state.notesValue(flow.handed))
    );
  }

  function updateHandedTotal() {
    const node = $("#handed-total");
    if (node) node.textContent = fmt(CH.state.notesValue(flow.handed));
  }

  function renderReturned(body) {
    const expected = expectedChange();
    body.append(
      el("h2", { class: "step-title", text: "What came back to you?" }),
      el("p", { class: "step-sub text-muted", text: "Your change should have been " + fmt(expected) + "." }),
      el("div", { class: "seg" }, [
        el("button", { text: "Nothing", dataset: { mode: "nothing" } }),
        el("button", { text: "Some notes", dataset: { mode: "partial" } }),
        el("button", { text: "All of it", dataset: { mode: "full" } })
      ])
    );
    const area = el("div", { id: "returned-area" });
    body.append(area);

    function updateSeg(active) {
      $$("[data-mode]", body).forEach((b) => b.classList.toggle("active", b.dataset.mode === active));
    }

    function draw() {
      area.innerHTML = "";
      if (flow.returnedMode === "nothing") {
        area.append(
          el("div", { class: "review-sum" }, [
            el("div", { class: "big", text: fmt(expected) }),
            el("p", { class: "text-muted", text: "left at the shop — they owe you this" })
          ])
        );
      } else if (flow.returnedMode === "full") {
        area.append(
          el("div", { class: "review-sum settled" }, [
            el("div", { class: "big", text: fmt(expected) }),
            el("p", { class: "text-muted", text: "fully handed back — all settled" })
          ])
        );
      } else if (flow.returnedMode === "partial") {
        area.append(
          el("p", { class: "step-sub text-muted", style: "margin-bottom:12px", text: "Tap the notes you actually got back." }),
          noteGrid(flow.returned, updateReturnedTotal),
          el("div", { class: "running-total", id: "returned-total", text: fmt(CH.state.notesValue(flow.returned)) }),
          el("p", { class: "text-muted", id: "returned-note", style: "text-align:center" })
        );
        updateReturnedTotal();
      }
    }

    function updateReturnedTotal() {
      const node = $("#returned-total");
      if (node) node.textContent = fmt(CH.state.notesValue(flow.returned));
      const note = $("#returned-note");
      if (note && CH.state.notesValue(flow.returned) >= expected) {
        note.textContent = "That's everything — they're clear.";
      }
    }

    $$("[data-mode]", body).forEach((b) =>
      b.addEventListener("click", () => {
        flow.returnedMode = b.dataset.mode;
        if (flow.returnedMode !== "partial") flow.returned = CH.ui.countsFromObject({});
        updateSeg(flow.returnedMode);
        draw();
      })
    );

    body.append(actions("Review the story", next, !flow.returnedMode));
  }

  function renderReview(body) {
    const expected = expectedChange();
    const retVal = returnedValue();
    const owedAmt = owed();
    const shop = CH.state.shopById(flow.shopId);

    body.append(
      el("h2", { class: "step-title", text: "The story" }),
      el("p", { class: "step-sub text-muted", text: "Yes yorá. Add the log and it's locked in." })
    );

    const rows = [
      ["Shop", shop && shop.name],
      ["Item", flow.item],
      ["Price", fmt(flow.price)],
      ["Handed over", fmt(CH.state.notesValue(flow.handed))],
      ["Came back", flow.returnedMode === "full" ? "full change" : fmt(retVal)],
      ["Expected change", fmt(expected)]
    ];
    rows.forEach(([k, v]) => {
      body.append(el("div", { class: "review-row" }, [el("span", { class: "k", text: k }), el("span", { class: "v", text: v })]));
    });

    body.append(
      el("div", { class: "review-sum" + (owedAmt <= 0 ? " settled" : "") }, owedAmt > 0
        ? [el("div", { class: "big", text: fmt(owedAmt) }), el("p", { class: "text-muted", text: shop.name + " is holding your balance" })]
        : [el("div", { class: "big" }, [CH.ui.icon("check", { size: 24 }), " Settled"]), el("p", { class: "text-muted", text: "Your change came back — nothing owed." })]
      ),
      el("div", { class: "story" }, [
        el("div", { class: "story-label", text: "Read this to the vendor" }),
        el("p", { text: storyText(shop, flow) })
      ])
    );

    body.append(actions(owedAmt > 0 ? "Log it — they owe me" : "Log it", save, false));
  }

  function storyText(shop, f) {
    const handedStr = CH.ui.notesString(f.handed);
    const expected = expectedChange();
    const retVal = returnedValue();
    const owedAmt = owed();

    let parts = [];
    parts.push("I bought " + f.item + " for " + fmt(f.price) + " on " + CH.ui.dayLabel(Date.now()) + ".");
    let returnPart;
    if (f.returnedMode === "nothing") {
      returnPart = "You had no change to give me back at all.";
    } else if (f.returnedMode === "full") {
      returnPart = "You gave me back all " + fmt(expected) + " in change.";
    } else {
      returnPart = "You only had " + fmt(retVal) + " to give me back.";
    }
    parts.push("I handed you " + handedStr + ".");
    parts.push(returnPart);
    if (owedAmt > 0) {
      parts.push("You are holding " + fmt(owedAmt) + " for me.");
    } else {
      parts.push("We are square.");
    }
    return parts.join(" ");
  }

  function actions(label, handler, disabled) {
    const wrapper = el("div", { class: "wizard-actions" }, [
      el("button", { class: "btn btn-primary", text: label, dataset: { go: "" }, disabled: !!disabled })
    ]);
    const btn = wrapper.querySelector("button");
    btn.addEventListener("click", (e) => handler && handler(e));
    return btn;
  }

  function next() {
    if (flow.step === 3 && CH.state.notesValue(flow.handed) < flow.price) {
      CH.ui.toast("Handed cash can't be less than the price");
      return;
    }
    if (flow.step >= STEPS - 1) return;
    flow.step += 1;
    render();
  }

  function save() {
    const specificShop = flow.shopId;
    const expected = expectedChange();
    const retVal = returnedValue();
    const owedAmt = owed();
    const ts = Date.now();
    const countsHanded = { ...flow.handed }, countsReturned = { ...flow.returned };

    CH.db.state.transactions.push({
      id: CH.db.uid(),
      ts,
      shopId: specificShop,
      item: flow.item,
      price: flow.price,
      handedValue: CH.state.notesValue(flow.handed),
      returnedValue: retVal,
      handed: countsHanded,
      returned: flow.returnedMode === "full" ? null : countsReturned,
      returnedMode: flow.returnedMode,
      owed: owedAmt,
      settled: owedAmt <= 0,
      settledAt: owedAmt <= 0 ? ts : null
    });
    CH.db.save();
    flow = null;
    CH.ui.toast(owedAmt > 0 ? "Logged — Go collect " + fmt(owedAmt) : "Logged — nothing owed");
    if (owedAmt > 0) {
      CH.shop.render(specificShop);
    } else {
      CH.dashboard.render();
    }
  }

  window.CH = window.CH || {};
  CH.log = { start };
})();