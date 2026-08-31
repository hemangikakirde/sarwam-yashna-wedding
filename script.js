// Sarwam & Yashna - invitation interactions

function runWhenIdle(fn) {
  if ("requestIdleCallback" in window) requestIdleCallback(fn, { timeout: 2500 });
  else setTimeout(fn, 600);
}

function whenVisible(el, fn, rootMargin = "120px") {
  if (!el) return;
  if (!("IntersectionObserver" in window)) {
    fn();
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    fn();
  }, { rootMargin });
  observer.observe(el);
}

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

// Floating marigold petals - deferred so the first paint stays fast
runWhenIdle(function () {
  const layer = document.querySelector(".petal-layer");
  if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const colors = ["#e8913a", "#d4a017", "#c45c6a", "#e8b84a", "#f0d080"];
  const isMobile = window.matchMedia("(max-width: 800px)").matches;
  const count = isMobile ? 12 : 18;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${((i + Math.random() * 0.5) / count) * 100}%`;
    petal.style.setProperty("--petal-color", colors[Math.floor(Math.random() * colors.length)]);
    petal.style.setProperty("--petal-opacity", `${0.32 + Math.random() * 0.28}`);
    petal.style.setProperty("--petal-scale", `${0.75 + Math.random() * 0.4}`);
    petal.style.setProperty("--petal-drift", `${-20 + Math.random() * 60}px`);
    petal.style.setProperty("--fall-dur", `${14 + Math.random() * 16}s`);
    petal.style.setProperty("--fall-delay", `${Math.random() * 18}s`);
    petal.style.setProperty("--petal-rot", `${Math.random() * 360}deg`);
    layer.appendChild(petal);
  }
});

const rsvpForm = document.getElementById("rsvpForm");
if (rsvpForm) rsvpForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const note = document.getElementById("formNote");
  const submitBtn = document.getElementById("rsvpSubmit");
  const inbox = (window.RSVP_EMAIL || "").trim();

  if (data.get("website")) return;

  const name = String(data.get("name") || "").trim();
  const contact = String(data.get("contact") || "").trim();
  const attendance = String(data.get("attendance") || "").trim();
  const message = String(data.get("message") || "").trim();

  if (!inbox) {
    note.textContent = "RSVP is not set up yet. Add your email in rsvp-config.js (see rsvp/SETUP.md).";
    return;
  }

  if (submitBtn) submitBtn.disabled = true;
  note.textContent = "Sending your RSVP…";

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(inbox)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name,
        contact,
        attendance,
        message,
        submitted: new Date().toISOString(),
        _subject: "Wedding RSVP - Sarwam & Yashna",
        _template: "table",
        _captcha: "false"
      })
    });
    const result = await response.json();
    if (!result.success) throw new Error("Send failed");

    note.textContent = attendance === "Joyfully, yes!"
      ? `Thank you, ${name}! We can't wait to celebrate with you. ❤️`
      : `Thank you for letting us know, ${name}. You'll be missed! ❤️`;
    form.reset();
  } catch (err) {
    note.textContent = "We couldn't send your RSVP. Please try again in a moment.";
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});

// Fade-in reveal on scroll
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

// Celebration day tabs
(function () {
  const dayNav = document.querySelector(".event-day-nav");
  if (!dayNav) return;

  const buttons = dayNav.querySelectorAll(".event-day-btn");
  const groups = document.querySelectorAll(".event-group");

  function showDay(day) {
    buttons.forEach((btn) => {
      const active = btn.dataset.day === day;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    groups.forEach((group) => {
      const active = group.dataset.day === day;
      group.classList.toggle("is-active", active);
      if (active) {
        group.querySelectorAll(".event-card").forEach((card) => card.classList.add("is-visible"));
      }
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => showDay(btn.dataset.day));
  });

  const initial = dayNav.querySelector(".event-day-btn.is-active");
  if (initial) showDay(initial.dataset.day);
})();

// ===== Envelope opening gate =====
(function () {
  const gate = document.getElementById("gate");
  const envelope = document.getElementById("envelope");
  const skipBtn = document.getElementById("gateSkip");
  const hero = document.getElementById("home");
  if (!gate || !envelope) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let opened = false;
  let dismissed = false;

  function scrollToHero() {
    window.scrollTo(0, 0);
  }

  function isGateLocked() {
    return document.documentElement.classList.contains("gate-lock");
  }

  function focusHero() {
    if (!hero) return;
    hero.setAttribute("tabindex", "-1");
    hero.focus({ preventScroll: true });
  }

  scrollToHero();

  window.addEventListener("scroll", () => {
    if (isGateLocked()) scrollToHero();
  }, { passive: true });

  document.addEventListener("click", (e) => {
    if (!isGateLocked()) return;
    const link = e.target.closest('a[href^="#"]');
    if (link && link.getAttribute("href") !== "#") e.preventDefault();
  }, true);

  function dismissGate() {
    if (dismissed) return;
    dismissed = true;
    gate.classList.add("closed");
    document.body.classList.remove("gate-lock");
    document.documentElement.classList.remove("gate-lock");

    scrollToHero();
    requestAnimationFrame(() => {
      scrollToHero();
      focusHero();
    });

    setTimeout(() => {
      gate.style.display = "none";
      gate.setAttribute("aria-hidden", "true");
      scrollToHero();
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
    e.preventDefault();
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

  gate.addEventListener("click", (e) => {
    if (!opened) return;
    if (e.target.closest("#envelope")) return;
    dismissGate();
  });

  if (skipBtn) {
    skipBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dismissGate();
    });
  }
})();

// ===== Scratch-to-reveal date card =====
whenVisible(document.getElementById("scratchCard"), function () {
  const card = document.getElementById("scratchCard");
  if (!card) return;

  const canvas = card.querySelector(".scratch-canvas");
  if (!canvas) return;

  const STROKES_TO_REVEAL = 2;
  const MIN_MOTION_RATIO = 0.035;
  let revealed = false;
  let scratchStrokes = 0;
  const calendarActions = document.getElementById("calendarActions");
  const addToCalendarBtn = document.getElementById("addToCalendar");
  const ctx = canvas.getContext("2d");
  let dpr = Math.max(window.devicePixelRatio || 1, 1);
  let cssW = 0, cssH = 0;
  let isDown = false;
  let lastX = 0, lastY = 0;
  let strokeDistance = 0;
  let gestureMoved = false;

  function showCalendarAction() {
    if (!calendarActions) return;
    calendarActions.hidden = false;
    requestAnimationFrame(() => calendarActions.classList.add("is-visible"));
  }

  function downloadWeddingIcs() {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Sarwam & Yashna//Wedding//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:sarwam-yashna-wedding-20261115@invitation",
      `DTSTAMP:${stamp}`,
      "DTSTART;VALUE=DATE:20261115",
      "DTEND;VALUE=DATE:20261116",
      "SUMMARY:Sarwam & Yashna - Wedding",
      "DESCRIPTION:Wedding & Reception in Pune. Celebrations 12-15 November 2026.",
      "LOCATION:Pune\\, Maharashtra\\, India",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sarwam-yashna-wedding.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function revealCard() {
    if (revealed) return;
    revealed = true;
    isDown = false;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.classList.add("is-revealed");
    setTimeout(showCalendarAction, prefersReduced ? 0 : 700);

    if (prefersReduced) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillRect(0, 0, cssW, cssH);
      canvas.classList.add("revealed");
      return;
    }

    canvas.classList.add("revealed");
    canvas.addEventListener("transitionend", function onFadeEnd(e) {
      if (e.propertyName !== "opacity") return;
      canvas.removeEventListener("transitionend", onFadeEnd);
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillRect(0, 0, cssW, cssH);
    });
  }

  function registerScratchMotion() {
    if (revealed) return;
    scratchStrokes++;
    if (scratchStrokes >= STROKES_TO_REVEAL) revealCard();
  }

  function paintFoil() {
    const w = canvas.width, h = canvas.height;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#6b1420";
    ctx.fillRect(0, 0, w, h);
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
    gestureMoved = false;
    canvas.setPointerCapture(e.pointerId);
    const p = pointerPos(e);
    lastX = p.x; lastY = p.y;
    scratchAt(p.x, p.y);
  }

  function onPointerMove(e) {
    if (!isDown || revealed) return;
    const p = pointerPos(e);
    const step = Math.hypot(p.x - lastX, p.y - lastY);
    if (step > 1) gestureMoved = true;
    strokeDistance += step;
    strokeTo(p.x, p.y);
    lastX = p.x; lastY = p.y;
  }

  function onPointerUp() {
    if (!isDown) return;
    isDown = false;
    if (gestureMoved || strokeDistance >= cssW * MIN_MOTION_RATIO) {
      registerScratchMotion();
    }
    strokeDistance = 0;
    gestureMoved = false;
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerUp);

  if (addToCalendarBtn) addToCalendarBtn.addEventListener("click", downloadWeddingIcs);

  sizeCanvas();
  let resizeTimer;
  window.addEventListener("resize", () => {
    if (revealed) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sizeCanvas, 200);
  });
});

// ===== Gallery flipbook =====
whenVisible(document.getElementById("galleryFlipbook"), function () {
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
});
