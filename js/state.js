(function () {
  const NOTES = [1000, 500, 200, 100, 50];

  function notesValue(counts) {
    let total = 0;
    for (const denom of NOTES) total += (counts[denom] || 0) * denom;
    return total;
  }

  function txnOwed(t) {
    return t.handedValue - t.price - t.returnedValue;
  }

  function openTxnCriteria(t) {
    return !t.settled;
  }

  function openTxns() {
    return CH.db.state.transactions.filter(openTxnCriteria);
  }

  function openTxnsForShop(shopId) {
    return CH.db.state.transactions.filter((t) => t.shopId === shopId && openTxnCriteria(t));
  }

  function settledTxnsForShop(shopId) {
    return CH.db.state.transactions.filter((t) => t.shopId === shopId && t.settled);
  }

  function shopBalance(shopId) {
    return openTxnsForShop(shopId).reduce((sum, t) => sum + txnOwed(t), 0);
  }

  function openOneOffs() {
    return CH.db.state.oneOffs.filter((o) => !o.settled);
  }

  function oneOffBalance() {
    return openOneOffs().reduce((sum, o) => sum + o.amount, 0);
  }

  function totalOwed() {
    const shopTotal = CH.db.state.shops.reduce((sum, s) => sum + shopBalance(s.id), 0);
    return shopTotal + oneOffBalance();
  }

  function shopById(id) {
    return CH.db.state.shops.find((s) => s.id === id) || null;
  }

  function itemExists(name) {
    return CH.db.state.items.some((i) => i.toLowerCase() === name.trim().toLowerCase());
  }

  window.CH = window.CH || {};
  CH.state = {
    NOTES,
    notesValue,
    txnOwed,
    openTxns,
    openTxnsForShop,
    settledTxnsForShop,
    shopBalance,
    openOneOffs,
    oneOffBalance,
    totalOwed,
    shopById,
    itemExists
  };
})();