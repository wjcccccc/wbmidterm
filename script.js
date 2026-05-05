(function () {
  "use strict";

  const isPortfolio = document.body.classList.contains("page-portfolio");
  const isConfess   = document.body.classList.contains("page-confess");

  /* ----------------------------------------------------------
   * Portfolio page: button → fade overlay → navigate
   * ---------------------------------------------------------- */
  if (isPortfolio) {
    const links   = document.querySelectorAll(".form-cta, .project-link");
    const overlay = document.getElementById("transition-overlay");

    if (links.length && overlay) {
      links.forEach(function (link) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          const href = link.getAttribute("href") || "confess.html";
          overlay.classList.add("active");
          window.setTimeout(function () {
            window.location.href = href;
          }, 900);
        });
      });
    }
  }

  /* ----------------------------------------------------------
   * Confession page: petals + slideshow
   * ---------------------------------------------------------- */
  if (isConfess) {
    spawnPetals();
    runSlideshow();
    setupAudio();
  }

  /* ---------------- helpers ---------------- */

  function spawnPetals() {
    const layer = document.getElementById("petals");
    if (!layer) return;

    const count = 28;
    const rand  = (min, max) => Math.random() * (max - min) + min;

    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "petal";

      const size       = rand(10, 22);                  // px
      const startLeft  = rand(-5, 100);                 // vw
      const drift      = rand(-25, 25);                 // vw sideways
      const duration   = rand(9, 18);                   // s
      const delay      = rand(-18, 0);                  // s (negative = pre-started)
      const tilt       = rand(-30, 30);                 // deg initial rotation
      const opacity    = rand(0.55, 0.95);

      p.style.left            = startLeft + "vw";
      p.style.width           = size + "px";
      p.style.height          = (size * 1.25) + "px";
      p.style.opacity         = String(opacity);
      p.style.animationDuration = duration + "s";
      p.style.animationDelay    = delay + "s";
      p.style.setProperty("--drift", drift + "vw");
      p.style.transform       = "rotate(" + tilt + "deg)";

      layer.appendChild(p);
    }
  }

  function runSlideshow() {
    const slides  = Array.from(document.querySelectorAll(".slide"));
    const skipBtn = document.getElementById("skip-btn");
    const backBtn = document.getElementById("back-btn");

    if (!slides.length) return;

    const DEFAULT_DURATION = 4500;
    const FIRST_DELAY      = 800;
    let currentIndex       = -1;
    let advanceTimer       = null;

    function showSlide(index) {
      if (index >= slides.length) return;

      if (currentIndex >= 0) {
        const prev = slides[currentIndex];
        prev.classList.remove("is-active");
        prev.classList.add("is-leaving");
        window.setTimeout(function () {
          prev.classList.remove("is-leaving");
        }, 1000);
      }

      currentIndex = index;
      const next   = slides[index];
      next.classList.add("is-active");

      const isLast = index === slides.length - 1;
      if (isLast) {
        if (skipBtn) skipBtn.classList.remove("is-visible");
        if (backBtn) backBtn.classList.add("is-visible");
        return;
      }

      const duration = parseInt(next.getAttribute("data-duration"), 10) || DEFAULT_DURATION;
      advanceTimer   = window.setTimeout(function () {
        showSlide(index + 1);
      }, duration);
    }

    function skip() {
      if (advanceTimer) {
        window.clearTimeout(advanceTimer);
        advanceTimer = null;
      }
      showSlide(currentIndex + 1);
    }

    if (skipBtn) {
      skipBtn.addEventListener("click", skip);
      window.setTimeout(function () {
        skipBtn.classList.add("is-visible");
      }, FIRST_DELAY + 1500);
    }

    if (backBtn) {
      backBtn.addEventListener("click", function () {
        window.location.href = "index.html";
      });
    }

    document.addEventListener("click", function (e) {
      if (e.target.closest("button")) return;
      if (currentIndex < 0 || currentIndex >= slides.length - 1) return;
      skip();
    });

    window.setTimeout(function () {
      showSlide(0);
    }, FIRST_DELAY);
  }

  function setupAudio() {
    const bgm    = document.getElementById("bgm");
    const toggle = document.getElementById("audio-toggle");
    if (!bgm || !toggle) return;

    const iconEl = toggle.querySelector(".audio-icon");
    bgm.volume   = 0.55;

    function setIcon(playing) {
      if (iconEl) iconEl.textContent = playing ? "🔊" : "🔇";
    }

    // Try to autoplay. Browsers often allow this when navigation came from a
    // user click, but Safari can still block — fall back to muted state and
    // wait for the user to tap the toggle.
    const tryPlay = bgm.play();
    if (tryPlay && typeof tryPlay.then === "function") {
      tryPlay.then(function () {
        setIcon(true);
      }).catch(function () {
        setIcon(false);
        toggle.classList.add("muted");
      });
    } else {
      setIcon(true);
    }

    toggle.addEventListener("click", function () {
      if (bgm.paused) {
        bgm.play().then(function () {
          setIcon(true);
          toggle.classList.remove("muted");
        }).catch(function () {});
      } else {
        bgm.pause();
        setIcon(false);
        toggle.classList.add("muted");
      }
    });
  }
})();
