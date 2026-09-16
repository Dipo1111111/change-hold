(function () {
  const RADIUS = 300;
  const COOLDOWN = 30 * 60 * 1000;

  let watchId = null;

  function init() {
    const alerts = CH.db.state.alerts;
    if (alerts.enabled) startWatcher();
  }

  function startWatcher() {
    const hasGeoShops = CH.db.state.shops.some((s) => s.lat != null);
    if (!hasGeoShops || !navigator.geolocation) return;
    stop();
    watchId = navigator.geolocation.watchPosition(
      handlePosition,
      () => {},
      { enableHighAccuracy: true, maximumAge: 30000 }
    );
  }

  function stop() {
    if (watchId != null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  }

  function handlePosition(pos) {
    const alerts = CH.db.state.alerts;
    if (!alerts.enabled) return;
    const now = Date.now();
    CH.db.state.shops.forEach((shop) => {
      if (shop.lat == null) return;
      const dist = distance(pos.coords.latitude, pos.coords.longitude, shop.lat, shop.lng);
      const owed = CH.state.shopBalance(shop.id);
      if (dist <= RADIUS && owed > 0) {
        const last = alerts.lastNotified[shop.id] || 0;
        if (now - last < COOLDOWN) return;
        alerts.lastNotified[shop.id] = now;
        CH.db.save();
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("ChangeHold", {
            body: "You're near " + shop.name + " — they still owe you " + CH.ui.fmt(owed) + ". Collect it before you walk in.",
            tag: shop.id
          });
        } else {
          CH.ui.toast(shop.name + " owes you " + CH.ui.fmt(owed));
        }
      }
    });
  }

  function distance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLng = (lng2 - lng1) * rad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  window.CH = window.CH || {};
  CH.geo = { init, startWatcher, stop };
})();