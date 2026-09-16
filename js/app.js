(function () {
  function boot() {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
    CH.geo.init();

    if (!CH.db.state.setupComplete) {
      CH.setup.render();
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    if (action === "log") {
      CH.log.start();
    } else {
      CH.dashboard.render();
    }
    history.replaceState(null, "", ".");

    if ("Notification" in window && Notification.permission === "default") {
      setTimeout(() => Notification.requestPermission().then(() => {}), 3000);
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();