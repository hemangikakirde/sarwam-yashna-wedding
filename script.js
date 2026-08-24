// Sarwam & Yashna — invitation interactions

const weddingDate = new Date("2026-11-15T09:00:00+05:30").getTime();

function updateCountdown() {
  const now = Date.now();
  let distance = weddingDate - now;
  if (distance < 0) distance = 0;

  const d = Math.floor(distance / 86400000);
  const h = Math.floor((distance % 86400000) / 3600000);
  const m = Math.floor((distance % 3600000) / 60000);
  const s = Math.floor((distance % 60000) / 1000);

  document.getElementById("days").textContent = String(d).padStart(2, "0");
  document.getElementById("hours").textContent = String(h).padStart(2, "0");
  document.getElementById("minutes").textContent = String(m).padStart(2, "0");
  document.getElementById("seconds").textContent = String(s).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Floating marigold petals
(function () {
  const layer = document.querySelector(".petal-layer");
  if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const colors = ["#e8913a", "#d4a017", "#c45c6a", "#e8b84a", "#f0d080"];
  for (let i = 0; i < 14; i++) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty("--petal-color", colors[i % colors.length]);
    petal.style.setProperty("--fall-dur", `${10 + Math.random() * 14}s`);
    petal.style.setProperty("--fall-delay", `${Math.random() * 12}s`);
    petal.style.setProperty("--petal-rot", `${Math.random() * 360}deg`);
    layer.appendChild(petal);
  }
})();

document.getElementById("rsvpForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const name = data.get("name");
  const attendance = data.get("attendance");
  const note = document.getElementById("formNote");

  note.textContent = attendance === "Joyfully, yes!"
    ? `Thank you, ${name}! We can't wait to celebrate with you. ❤️`
    : `Thank you for letting us know, ${name}. You'll be missed! ❤️`;

  event.currentTarget.reset();
  event.currentTarget.querySelector('[name="guests"]').value = 1;
});

// Scroll-based parallax — decorative layers only (never text/content blocks)
(function initParallax() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const decorSelector = [
    ".hero-parallax-bg",
    ".hero-mandala-wrap",
    ".section-parallax-bg",
    ".section-watermark",
    ".toran",
    ".petal-layer",
  ].join(",");

  document.querySelectorAll(".section").forEach((section, i) => {
    if (section.querySelector(".section-parallax-bg")) return;
    const bg = document.createElement("div");
    bg.className = "section-parallax-bg parallax-layer";
    bg.setAttribute("aria-hidden", "true");
    bg.dataset.parallax = String(0.05 + (i % 4) * 0.02);
    section.prepend(bg);
  });

  document.querySelectorAll(".parallax-layer").forEach((el) => {
    if (el.matches(decorSelector)) return;
    el.classList.remove("parallax-layer");
    delete el.dataset.parallax;
    delete el.dataset.parallaxCenter;
    el.style.removeProperty("--parallax-y");
  });

  const petalLayer = document.querySelector(".petal-layer");
  if (petalLayer) {
    petalLayer.classList.add("parallax-layer");
    petalLayer.dataset.parallax = "0.06";
  }

  let layers = [];
  let ticking = false;

  function collectLayers() {
    layers = [...document.querySelectorAll(decorSelector + "[data-parallax]")];
  }

  function parseParallaxY(el) {
    return parseFloat(el.style.getPropertyValue("--parallax-y")) || 0;
  }

  function getReferenceCenter(el) {
    const sectionAnchor = el.closest(".hero, .section, .marquee");
    if (sectionAnchor && sectionAnchor !== el) {
      const rect = sectionAnchor.getBoundingClientRect();
      return rect.top + rect.height * 0.5;
    }

    const footer = el.closest("footer");
    if (footer) {
      const applied = parseParallaxY(footer);
      const rect = footer.getBoundingClientRect();
      return rect.top - applied + rect.height * 0.5;
    }

    const applied = parseParallaxY(el);
    const rect = el.getBoundingClientRect();
    return rect.top - applied + rect.height * 0.5;
  }

  function updateParallax() {
    if (reduced.matches) return;
    const vCenter = window.innerHeight * 0.5;
    layers.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.12;
      const raw = (getReferenceCenter(el) - vCenter) * speed;
      const offset = Math.max(-90, Math.min(90, raw));
      el.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
    });
    ticking = false;
  }

  function onScroll() {
    if (reduced.matches || ticking) return;
    ticking = true;
    requestAnimationFrame(updateParallax);
  }

  function resetParallax() {
    layers.forEach((el) => el.style.removeProperty("--parallax-y"));
  }

  function refreshParallax() {
    collectLayers();
    if (!reduced.matches) updateParallax();
  }

  refreshParallax();
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", refreshParallax, { passive: true });
  window.addEventListener("load", refreshParallax);
  window.addEventListener("layout-unlock", refreshParallax);
  reduced.addEventListener("change", (e) => {
    if (e.matches) resetParallax();
    else refreshParallax();
  });
})();

// Section-by-section presentation — instant jump to each section in the natural page layout
(function initSectionPresentation() {
  const main = document.querySelector("main");
  const footer = document.querySelector("footer");
  if (!main) return;

  const steps = [
    ...main.querySelectorAll(":scope > .hero, :scope > .section, :scope > .marquee"),
    ...(footer ? [footer] : []),
  ];
  if (steps.length < 2) return;

  steps.forEach((step) => step.classList.add("stage-section"));

  const START_DELAY = 3500;
  const RESUME_DELAY = 6000;
  const HOLD_BY_ID = { home: 4500, events: 7500, rsvp: 6500 };
  const DEFAULT_HOLD = 5200;

  let current = 0;
  let presenting = false;
  let paused = false;
  let holdTimer = null;
  let resumeTimer = null;

  function holdDuration(step) {
    return HOLD_BY_ID[step.id] || DEFAULT_HOLD;
  }

  function revealStepContent(step) {
    step.querySelectorAll(".reveal-on-scroll:not(.is-visible), .event-card:not(.is-visible)").forEach((el) => {
      el.classList.add("is-visible");
    });
  }

  function stepTop(step) {
    return step.getBoundingClientRect().top + window.scrollY;
  }

  function setActive(index) {
    steps.forEach((step, i) => step.classList.toggle("is-stage-active", i === index));
    revealStepContent(steps[index]);
    window.dispatchEvent(new Event("scroll"));
  }

  function showStep(index) {
    const step = steps[index];
    setActive(index);
    window.scrollTo(0, stepTop(step));
    window.dispatchEvent(new Event("scroll"));
  }

  function finishPresentation() {
    presenting = false;
    document.documentElement.classList.remove("stage-mode");
    steps.forEach((step) => step.classList.remove("is-stage-active"));
  }

  function scheduleNext() {
    clearTimeout(holdTimer);
    if (!presenting || paused) return;
    if (current >= steps.length - 1) {
      holdTimer = setTimeout(finishPresentation, holdDuration(steps[current]));
      return;
    }
    holdTimer = setTimeout(() => goTo(current + 1), holdDuration(steps[current]));
  }

  function goTo(index) {
    if (index < 0 || index >= steps.length || index === current) return;
    clearTimeout(holdTimer);
    current = index;
    showStep(index);
    scheduleNext();
  }

  function startPresentation() {
    if (presenting) return;
    presenting = true;
    paused = false;
    current = 0;
    document.documentElement.classList.add("stage-mode");
    showStep(0);
    scheduleNext();
  }

  function pausePresentation() {
    if (!presenting) return;
    paused = true;
    clearTimeout(holdTimer);
    clearTimeout(resumeTimer);
  }

  function resumeLater() {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      if (!presenting || current >= steps.length - 1) return;
      paused = false;
      scheduleNext();
    }, RESUME_DELAY);
  }

  function stopPresentation() {
    if (!presenting) return;
    clearTimeout(holdTimer);
    clearTimeout(resumeTimer);
    finishPresentation();
    paused = true;
  }

  let touchStartY = 0;

  window.addEventListener("touchstart", (e) => {
    if (!presenting || paused) return;
    if (e.touches.length !== 1) return;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    if (!presenting || paused) return;
    const delta = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(delta) < 40) return;
    pausePresentation();
    resumeLater();
  }, { passive: true });

  window.addEventListener("wheel", (e) => {
    if (!presenting || paused) return;
    if (Math.abs(e.deltaY) < 8) return;
    pausePresentation();
    resumeLater();
  }, { passive: true });

  window.addEventListener("keydown", (e) => {
    if (!presenting) return;
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) {
      pausePresentation();
      resumeLater();
    }
  });

  document.querySelectorAll("form, .scratch-canvas, .flipbook, .flipbook-btn, .flipbook-dot, .event-directions").forEach((el) => {
    el.addEventListener("pointerdown", stopPresentation);
    el.addEventListener("focusin", stopPresentation);
  });

  document.querySelectorAll('a[href^="#"]').forEach((el) => {
    el.addEventListener("click", stopPresentation);
  });

  window.addEventListener("layout-unlock", () => {
    setTimeout(startPresentation, START_DELAY);
  });
})();

// Fade-in reveal (opacity only — parallax handles movement)
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll(".reveal-on-scroll, .event-card").forEach((el) => {
  el.classList.add("reveal-on-scroll");
  revealObserver.observe(el);
});

// ===== Envelope opening gate =====
(function () {
  const gate = document.getElementById("gate");
  const envelope = document.getElementById("envelope");
  const skipBtn = document.getElementById("gateSkip");
  if (!gate || !envelope) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let opened = false;
  let dismissed = false;

  function dismissGate() {
    if (dismissed) return;
    dismissed = true;
    gate.classList.add("closed");
    document.body.classList.remove("gate-lock");
    document.documentElement.classList.remove("gate-lock");
    window.dispatchEvent(new Event("layout-unlock"));
    setTimeout(() => {
      gate.style.display = "none";
      gate.setAttribute("aria-hidden", "true");
    }, prefersReduced ? 150 : 500);
  }

  function openEnvelope() {
    if (opened) return;
    opened = true;
    gate.classList.add("opening");
    envelope.setAttribute("aria-expanded", "true");
    setTimeout(dismissGate, prefersReduced ? 250 : 2400);
  }

  envelope.addEventListener("click", (e) => {
    e.stopPropagation();
    openEnvelope();
  });
  envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      openEnvelope();
    }
  });

  // Clicking anywhere once it's opening skips the remaining wait.
  gate.addEventListener("click", () => {
    if (opened) dismissGate();
  });

  if (skipBtn) {
    skipBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dismissGate();
    });
  }
})();

// ===== Scratch-to-reveal date card =====
(function () {
  const card = document.getElementById("scratchCard");
  if (!card) return;

  const canvas = card.querySelector(".scratch-canvas");
  if (!canvas) return;

  const STROKES_TO_REVEAL = 3;
  let revealed = false;
  let scratchStrokes = 0;
  const ctx = canvas.getContext("2d");
  let dpr = Math.max(window.devicePixelRatio || 1, 1);
  let cssW = 0, cssH = 0;
  let isDown = false;
  let lastX = 0, lastY = 0;
  let strokeDistance = 0;

  function revealCard() {
    if (revealed) return;
    revealed = true;
    canvas.classList.add("revealed");
    card.classList.add("is-revealed");
  }

  function registerScratchStroke(distance, minDistance) {
    if (revealed || distance < minDistance) return;
    scratchStrokes++;
    if (scratchStrokes >= STROKES_TO_REVEAL) revealCard();
  }

  function paintFoil() {
    const w = canvas.width, h = canvas.height;
    ctx.globalCompositeOperation = "source-over";

    ctx.fillStyle = "#ebe7df";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(160,150,138,0.28)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `italic ${Math.round(w * 0.038)}px Georgia, "Times New Roman", serif`;
    ctx.fillText("scratch to reveal", w / 2, h / 2);

    ctx.globalCompositeOperation = "destination-out";
  }

  function sizeCanvas() {
    const rect = card.getBoundingClientRect();
    cssW = rect.width;
    cssH = rect.height;
    dpr = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintFoil();
  }

  function scratchAt(x, y) {
    const r = cssW * 0.09;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function strokeTo(x, y) {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = cssW * 0.14;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function pointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerDown(e) {
    if (revealed) return;
    isDown = true;
    strokeDistance = 0;
    canvas.setPointerCapture(e.pointerId);
    const p = pointerPos(e);
    lastX = p.x; lastY = p.y;
    scratchAt(p.x, p.y);
  }

  function onPointerMove(e) {
    if (!isDown || revealed) return;
    const p = pointerPos(e);
    strokeDistance += Math.hypot(p.x - lastX, p.y - lastY);
    strokeTo(p.x, p.y);
    lastX = p.x; lastY = p.y;
  }

  function onPointerUp() {
    if (!isDown) return;
    isDown = false;
    registerScratchStroke(strokeDistance, cssW * 0.12);
    strokeDistance = 0;
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerUp);

  sizeCanvas();
  let resizeTimer;
  window.addEventListener("resize", () => {
    if (revealed) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sizeCanvas, 200);
  });
})();

// ===== Gallery flipbook =====
(function () {
  const flipbook = document.getElementById("galleryFlipbook");
  if (!flipbook) return;

  const stage = flipbook.querySelector(".flipbook-stage");
  const cards = Array.from(flipbook.querySelectorAll(".flipbook-card"));
  const prevBtn = flipbook.querySelector(".flipbook-prev");
  const nextBtn = flipbook.querySelector(".flipbook-next");
  const captionEl = flipbook.querySelector(".flipbook-caption");
  const currentEl = flipbook.querySelector(".flipbook-current");
  const totalEl = flipbook.querySelector(".flipbook-total");
  const dotsEl = flipbook.querySelector(".flipbook-dots");

  const total = cards.length;
  let current = 0;
  let animating = false;
  let touchStartX = 0;
  let touched = false;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  totalEl.textContent = String(total);

  cards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "flipbook-dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Go to photo ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsEl.appendChild(dot);
  });

  const dots = Array.from(dotsEl.querySelectorAll(".flipbook-dot"));

  function stackOffset(index) {
    return (index - current + total) % total;
  }

  function applyStack(skipAnimatingCard) {
    cards.forEach((card, index) => {
      if (card === skipAnimatingCard) return;
      card.classList.remove("stack-0", "stack-1", "stack-2", "stack-3", "stack-hidden", "is-flipping-in");
      const offset = stackOffset(index);
      if (offset === 0) card.classList.add("stack-0");
      else if (offset === 1) card.classList.add("stack-1");
      else if (offset === 2) card.classList.add("stack-2");
      else if (offset === 3) card.classList.add("stack-3");
      else card.classList.add("stack-hidden");
    });

    captionEl.textContent = cards[current].dataset.caption || "";
    currentEl.textContent = String(current + 1);
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current));
    prevBtn.disabled = animating;
    nextBtn.disabled = animating;
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function flip(direction) {
    if (animating || total < 2) return;
    animating = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;

    const nextIndex = direction === "next"
      ? (current + 1) % total
      : (current - 1 + total) % total;

    if (prefersReduced) {
      current = nextIndex;
      applyStack();
      animating = false;
      prevBtn.disabled = false;
      nextBtn.disabled = false;
      return;
    }

    const outgoing = cards[current];
    const incoming = cards[nextIndex];

    if (direction === "next") {
      outgoing.classList.remove("stack-0", "stack-1", "stack-2", "stack-3", "stack-hidden");
      outgoing.classList.add("is-flipping-out");
      applyStack(outgoing);
      await wait(650);
      outgoing.classList.remove("is-flipping-out");
      current = nextIndex;
      applyStack();
    } else {
      incoming.classList.remove("stack-0", "stack-1", "stack-2", "stack-3", "stack-hidden");
      incoming.classList.add("is-flipping-in", "stack-0");
      applyStack(incoming);
      await wait(650);
      incoming.classList.remove("is-flipping-in");
      current = nextIndex;
      applyStack();
    }

    animating = false;
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  }

  function goTo(index) {
    if (animating || index === current) return;
    const forwardSteps = (index - current + total) % total;
    const backwardSteps = (current - index + total) % total;
    const direction = forwardSteps <= backwardSteps ? "next" : "prev";
    const steps = direction === "next" ? forwardSteps : backwardSteps;

    (async () => {
      for (let i = 0; i < steps; i++) {
        await flip(direction);
      }
    })();
  }

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    flip("prev");
  });
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    flip("next");
  });

  stage.addEventListener("click", () => {
    if (touched) {
      touched = false;
      return;
    }
    flip("next");
  });

  stage.addEventListener("touchstart", (e) => {
    touched = true;
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  stage.addEventListener("touchend", (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < 40) return;
    flip(delta < 0 ? "next" : "prev");
  }, { passive: true });

  flipbook.setAttribute("tabindex", "0");
  flipbook.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      flip("next");
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      flip("prev");
    }
  });

  applyStack();
})();
