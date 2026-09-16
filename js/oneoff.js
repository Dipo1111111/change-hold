(function () {
  const { el, $, $$, fmt } = CH.ui;

  let sheetBuild = null;

  function open() {
    sheetBuild = {
      amount: "",
      note: "",
      memoBlob: null,
      memoDuration: 0,
      record: null,
      chunks: [],
      timer: null
    };
    const sheet = $("#oneoff-sheet");
    sheet.innerHTML = "";
    sheet.append(buildContent());
    wire(sheet);
    CH.ui.openSheet(sheet);
  }

  function buildContent() {
    const b = sheetBuild;
    return el("div", {}, [
      el("div", { class: "grab" }),
      el("div", { class: "sheet-title", text: "One-off shop" }),
      el("p", { class: "step-sub text-muted", text: "A random vendor, a park, a kiosk. Capture it fast and move." }),
      el("div", {
        class: "amount-display" + (b.amount ? "" : " empty"),
        id: "oo-amount-display",
        text: b.amount ? fmt(Number(b.amount)) : "₦0"
      }),
      el("div", { class: "numpad" }, [
        ...[7, 8, 9, 4, 5, 6, 1, 2, 3].map((d) =>
          el("button", { text: String(d), dataset: { ooDigit: String(d) } })
        ),
        el("button", { dataset: { ooDigit: "back" } }, [CH.ui.icon("backspace", { size: 17 })]),
        el("button", { text: "0", dataset: { ooDigit: "0" } })
      ]),
      el("div", { class: "form-field", style: "margin-top:16px" }, [
        el("label", { text: "Where / what? (optional)" }),
        el("input", { type: "text", id: "oo-note", placeholder: "e.g. Bike park attendant, Mr's kiosk", value: b.note })
      ]),
      el("div", { style: "display:flex;gap:10px;margin-top:14px" }, [
        el("button", { class: "btn btn-ghost", id: "oo-memo-btn", style: "flex:1" }, [CH.ui.icon("mic", { size: 15 }), " Record memo"]),
        el("button", { class: "btn btn-ghost", id: "oo-memo-play", style: "flex:none;width:56px", hidden: true }, [CH.ui.icon("play", { size: 16 })])
      ]),
      el("p", { class: "text-muted", id: "oo-memo-status", style: "margin-top:8px", text: "" }),
      el("div", { class: "wizard-actions" }, [
        el("button", { class: "btn btn-primary", id: "oo-save", text: "Save — they owe me" })
      ])
    ]);
  }

  function wire(sheet) {
    const b = sheetBuild;
    $("#oo-note").addEventListener("input", (e) => (b.note = e.target.value));
    $$("[data-oo-digit]", sheet).forEach((btn) =>
      btn.addEventListener("click", () => {
        const d = btn.dataset.ooDigit;
        if (d === "back") b.amount = b.amount.slice(0, -1);
        else if (b.amount.length < 7) b.amount += d;
        $("#oo-amount-display").textContent = Number(b.amount || 0) ? fmt(Number(b.amount)) : "₦0";
        $("#oo-amount-display").classList.toggle("empty", !b.amount);
      })
    );
    $("#oo-memo-btn").addEventListener("click", () => toggleMemo());
    $("#oo-memo-play").addEventListener("click", () => playMemo());
    $("#oo-save").addEventListener("click", () => save());
    sheet.append(backdrop(sheet));
  }

  function backdrop(sheet) {
    const bd = el("div", { class: "sheet-backdrop" });
    bd.addEventListener("click", () => CH.ui.closeSheet(sheet));
    return bd;
  }

  function toggleMemo() {
    const btn = $("#oo-memo-btn");
    if (sheetBuild.record && sheetBuild.record.state === "recording") {
      sheetBuild.record.stop();
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      CH.ui.toast("Recording not supported here");
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const opts = MediaRecorder.isTypeSupported("audio/webm")
        ? { mimeType: "audio/webm" }
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? { mimeType: "audio/mp4" }
          : undefined;
      const rec = new MediaRecorder(stream, opts);
      sheetBuild.chunks = [];
      let seconds = 0;
      rec.ondataavailable = (e) => e.data.size && sheetBuild.chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        sheetBuild.memoBlob = new Blob(sheetBuild.chunks, { type: rec.mimeType || "audio/webm" });
        sheetBuild.memoDuration = seconds;
        clearInterval(sheetBuild.timer);
        setMemoUi("ready");
      };
      rec.start(250);
      sheetBuild.record = rec;
      sheetBuild.timer = setInterval(() => {
        seconds += 1;
        const status = $("#oo-memo-status");
        if (status) status.textContent = "Recording… " + seconds + "s (tap again to stop)";
      }, 1000);
      setMemoUi("recording");
    }).catch(() => {
      CH.ui.toast("Microphone not allowed");
    });
  }

  function setMemoLabel(btn, label) {
    btn.innerHTML = "";
    btn.append(CH.ui.icon("mic", { size: 15 }), document.createTextNode(" " + label));
  }

  function setMemoUi(state) {
    const btn = $("#oo-memo-btn");
    const play = $("#oo-memo-play");
    const status = $("#oo-memo-status");
    if (!btn) return;
    if (state === "recording") {
      btn.textContent = "Stop recording";
      btn.className = "btn btn-danger";
      btn.style.flex = "1";
    } else if (state === "ready") {
      setMemoLabel(btn, "Re-record");
      btn.className = "btn btn-ghost";
      btn.style.flex = "1";
      play.hidden = false;
      status.textContent = "Memo saved · " + Math.max(1, sheetBuild.memoDuration) + "s";
    } else {
      setMemoLabel(btn, "Record memo");
      btn.className = "btn btn-ghost";
      btn.style.flex = "1";
      play.hidden = true;
      status.textContent = "";
    }
  }

  function playMemo() {
    if (!sheetBuild.memoBlob) return;
    const url = URL.createObjectURL(sheetBuild.memoBlob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    audio.play().catch(() => CH.ui.toast("Can't play here"));
  }

  function save() {
    const amount = Number(sheetBuild.amount || 0);
    if (amount <= 0) {
      CH.ui.toast("Tap an amount they owe you first");
      return;
    }
    const id = CH.db.uid();
    const oneOff = {
      id,
      ts: Date.now(),
      amount,
      note: sheetBuild.note,
      memo: sheetBuild.memoBlob ? id + ".memo" : null,
      settled: false,
      settledAt: null
    };
    CH.db.state.oneOffs.push(oneOff);
    if (sheetBuild.memoBlob) {
      CH.db.idb.put(id + ".memo", sheetBuild.memoBlob);
    }
    CH.db.save();
    CH.ui.closeSheet($("#oneoff-sheet"));
    CH.ui.toast("Log — they owe you " + fmt(amount));
    CH.dashboard.render();
  }

  function listCard() {
    const open = CH.state.openOneOffs();
    if (!open.length) return null;
    const card = el("div", { class: "card" }, [
      el("div", { class: "section-title", text: "One-off balances", style: "margin-top:0" }),
      el("div", { id: "oneoff-list" })
    ]);
    const list = card.querySelector("#oneoff-list");
    open.sort((a, b) => b.ts - a.ts).forEach((o) => {
      list.append(row(o));
    });
    return card;
  }

  function row(o) {
    const r = el("div", { class: "debrief card", style: "border:none;box-shadow:none;padding:0;margin-bottom:12px" }, [
      el("div", { class: "d-head" }, [
        el("div", {}, [
          el("div", { class: "d-item", text: o.note || "One-off shop" }),
          el("div", { class: "d-date", text: CH.ui.dayLabel(o.ts) })
        ]),
        el("div", { class: "d-owed", text: fmt(o.amount) })
      ]),
      el("div", { class: "d-actions" }, [
        o.memo ? el("button", { class: "btn btn-ghost", dataset: { plmemo: o.id } }, [CH.ui.icon("play", { size: 14 }), " Memo"]) : null,
        el("button", { class: "btn btn-primary", dataset: { settleOne: o.id }, style: "flex:1" }, [CH.ui.icon("check", { size: 14 }), " Settled"]),
        el("button", { class: "btn btn-danger", dataset: { delOne: o.id }, style: "width:56px;flex:none" }, [CH.ui.icon("x")])
      ])
    ]);
    const memoBtn = r.querySelector("[data-plmemo]");
    if (memoBtn) memoBtn.addEventListener("click", () => playOneOffMemo(o));
    r.querySelector("[data-settle-one]").addEventListener("click", () => settle(o.id));
    r.querySelector("[data-del-one]").addEventListener("click", () => remove(o.id));
    return r;
  }

  function playOneOffMemo(o) {
    CH.db.idb.get(o.memo).then((blob) => {
      if (!blob) return CH.ui.toast("Memo not found");
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      audio.play();
    });
  }

  function settle(id) {
    const o = CH.db.state.oneOffs.find((x) => x.id === id);
    if (o) {
      o.settled = true;
      o.settledAt = Date.now();
      CH.db.save();
      CH.dashboard.render();
      CH.ui.toast("Settled — sha you collect am o");
    }
  }

  function remove(id) {
    if (!window.confirm("Delete this one-off record?")) return;
    const o = CH.db.state.oneOffs.find((x) => x.id === id);
    CH.db.state.oneOffs = CH.db.state.oneOffs.filter((x) => x.id !== id);
    if (o && o.memo) CH.db.idb.del(o.memo);
    CH.db.save();
    CH.dashboard.render();
  }

  window.CH = window.CH || {};
  CH.oneoff = { open, listCard };
})();