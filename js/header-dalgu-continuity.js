(function () {
  var dalgu = document.querySelector(".header-dalgu");
  var source = document.querySelector(".header-dalgu-source");
  var image = document.querySelector(".header-dalgu-image");
  var modeToggle = document.querySelector(".dalgu-mode-toggle");

  if (!dalgu || !source || !image) {
    return;
  }

  var patrolStorageKey = "rasl-dalgu-patrol-origin-v3";
  var modeStorageKey = "rasl-dalgu-mode-v3";
  var patrolDuration = 17000;
  var modes = [
    {
      key: "walk",
      label: "Walk",
      animated: "/assets/site/dalgu-walk.webp?v=restored",
      fallback: "/assets/site/dalgu-walk-fallback.png?v=restored"
    },
    {
      key: "bubble",
      label: "Bubble",
      animated: "/assets/site/dalgu-car-bubble.webp?v=restored",
      fallback: "/assets/site/dalgu-car-bubble-fallback.png?v=restored"
    },
    {
      key: "rover",
      label: "Rover",
      animated: "/assets/site/dalgu-car-rover.webp?v=restored",
      fallback: "/assets/site/dalgu-car-rover-fallback.png?v=restored"
    },
    {
      key: "pod",
      label: "Pod",
      animated: "/assets/site/dalgu-car-pod.webp?v=restored",
      fallback: "/assets/site/dalgu-car-pod-fallback.png?v=restored"
    },
    {
      key: "platform",
      label: "Platform",
      animated: "/assets/site/dalgu-car-platform.webp?v=restored",
      fallback: "/assets/site/dalgu-car-platform-fallback.png?v=restored"
    }
  ];
  var modeIndex = 0;
  var now = Date.now();
  var origin = now;

  try {
    var storedMode = window.sessionStorage.getItem(modeStorageKey);
    var storedModeIndex = modes.findIndex(function (mode) {
      return mode.key === storedMode;
    });
    var navigationEntry = window.performance &&
      window.performance.getEntriesByType &&
      window.performance.getEntriesByType("navigation")[0];
    var isReload = navigationEntry && navigationEntry.type === "reload";

    if (!isReload && storedModeIndex >= 0) {
      modeIndex = storedModeIndex;
    }

    window.sessionStorage.setItem(modeStorageKey, modes[modeIndex].key);
  } catch (error) {
    // Fallback if sessionStorage is disabled
  }

  function applyMode() {
    var mode = modes[modeIndex];

    source.srcset = mode.animated;
    image.src = mode.fallback;
    dalgu.dataset.dalguMode = mode.key;
    dalgu.classList.toggle("is-vehicle-mode", mode.key !== "walk");

    if (modeToggle) {
      modeToggle.setAttribute(
        "aria-label",
        "Mascot mode: " + mode.label + ". Switch to next mode"
      );
      modeToggle.title =
        "Mascot: " + mode.label + " (" + (modeIndex + 1) + "/" + modes.length + ")";
    }
  }

  if (modeToggle) {
    modeToggle.addEventListener("click", function () {
      modeIndex = (modeIndex + 1) % modes.length;

      try {
        window.sessionStorage.setItem(modeStorageKey, modes[modeIndex].key);
      } catch (error) {}

      applyMode();
    });
  }

  modes.slice(1).forEach(function (mode) {
    var preload = new Image();
    preload.src = mode.animated;
  });

  applyMode();

  try {
    var storedOrigin = Number(window.sessionStorage.getItem(patrolStorageKey));

    if (Number.isFinite(storedOrigin) && storedOrigin > 0 && storedOrigin <= now) {
      origin = storedOrigin;
    } else {
      window.sessionStorage.setItem(patrolStorageKey, String(origin));
    }
  } catch (error) {
    origin = now;
  }

  var elapsedInCycle = (now - origin) % patrolDuration;
  dalgu.style.animationDelay = "-" + elapsedInCycle + "ms";
})();
