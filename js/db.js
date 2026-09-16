(function () {
  const KEY = "changehold.v1";
  const AUDIO_DB = "changehold.audio";

  function empty() {
    return {
      version: 1,
      setupComplete: false,
      shops: [],
      items: [],
      transactions: [],
      oneOffs: [],
      alerts: { enabled: false, lastNotified: {} }
    };
  }

  let state;
  try {
    state = JSON.parse(localStorage.getItem(KEY));
  } catch (e) {
    state = null;
  }
  if (!state || state.version !== 1) {
    state = Object.assign(empty(), state || {});
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function uid() {
    return "id-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  const idb = {
    _open() {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open(AUDIO_DB, 1);
        req.onupgradeneeded = () => req.result.createObjectStore("audio", { keyPath: "id" });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    },
    async put(id, blob) {
      const db = await this._open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction("audio", "readwrite");
        tx.objectStore("audio").put({ id, blob });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    },
    async get(id) {
      const db = await this._open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction("audio");
        const req = tx.objectStore("audio").get(id);
        req.onsuccess = () => resolve(req.result ? req.result.blob : null);
        req.onerror = () => reject(req.error);
      });
    },
    async del(id) {
      const db = await this._open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction("audio", "readwrite");
        tx.objectStore("audio").delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  };

  window.CH = window.CH || {};
  CH.db = {
    state,
    save,
    uid,
    idb,
    reset() {
      state = Object.assign(empty(), { version: 1 });
      save();
    }
  };
})();