// Sarwam & Yashna - invitation interactions

function isTouchLikePointer(e) {
  return !e.pointerType || e.pointerType === "touch" || e.pointerType === "pen";
}

function blockTouchScroll(e) {
  if (e.cancelable) e.preventDefault();
}

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
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const now = Date.now();
  let distance = weddingDate - now;
  if (distance < 0) distance = 0;

  const d = Math.floor(distance / 86400000);
  const h = Math.floor((distance % 86400000) / 3600000);
  const m = Math.floor((distance % 3600000) / 60000);
  const s = Math.floor((distance % 60000) / 1000);

  daysEl.textContent = String(d).padStart(2, "0");
  hoursEl.textContent = String(h).padStart(2, "0");
  minutesEl.textContent = String(m).padStart(2, "0");
  secondsEl.textContent = String(s).padStart(2, "0");
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
}, { threshold: 0.08, rootMargin: "0px 0px 10% 0px" });

document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
  revealObserver.observe(el);
});

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
    el.classList.add("is-visible");
  });
}

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
      group.classList.toggle("is-active", group.dataset.day === day);
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => showDay(btn.dataset.day));
  });

  const initial = dayNav.querySelector(".event-day-btn.is-active");
  showDay(initial ? initial.dataset.day : "15");
})();

(function () {
  const openBtn = document.getElementById("mapLightboxOpen");
  const lightbox = document.getElementById("mapLightbox");
  const closeBtn = lightbox?.querySelector(".map-lightbox-close");
  if (!openBtn || !lightbox) return;

  let scrollLockY = 0;
  let lightboxTouchBlocker = null;

  function lockScroll() {
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    document.documentElement.classList.add("map-lightbox-open");
    document.body.style.top = `-${scrollLockY}px`;
    document.body.classList.add("map-lightbox-open");
    lightboxTouchBlocker = (e) => {
      if (!lightbox.hidden) blockTouchScroll(e);
    };
    document.addEventListener("touchmove", lightboxTouchBlocker, { passive: false });
  }

  function unlockScroll() {
    document.documentElement.classList.remove("map-lightbox-open");
    document.body.classList.remove("map-lightbox-open");
    document.body.style.top = "";
    if (lightboxTouchBlocker) {
      document.removeEventListener("touchmove", lightboxTouchBlocker);
      lightboxTouchBlocker = null;
    }
    window.scrollTo(0, scrollLockY);
  }

  function openMap() {
    lightbox.hidden = false;
    lockScroll();
    closeBtn?.focus({ preventScroll: true });
  }

  function closeMap() {
    lightbox.hidden = true;
    unlockScroll();
    openBtn.focus({ preventScroll: true });
  }

  openBtn.addEventListener("click", openMap);
  closeBtn?.addEventListener("click", closeMap);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeMap();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.hidden) closeMap();
  });
})();

// ===== Background music (Until I Found You) =====
(function initSiteMusic() {
  const audio = document.getElementById("siteMusic");
  const toggle = document.getElementById("musicToggle");
  if (!audio) return;

  const MUSIC_VOLUME = 0.22;
  const STORAGE_KEY = "sarwam-yashna-music-muted";
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let unlocked = false;
  let userMuted = prefersReduced;

  try {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") userMuted = true;
  } catch (_) {}

  function updateToggleUi() {
    if (!toggle) return;
    toggle.setAttribute("aria-pressed", userMuted ? "true" : "false");
    toggle.setAttribute("aria-label", userMuted ? "Turn music on" : "Turn music off");
    toggle.classList.toggle("is-muted", userMuted);
    const onIcon = toggle.querySelector(".music-toggle-icon--on");
    const offIcon = toggle.querySelector(".music-toggle-icon--off");
    if (onIcon) onIcon.hidden = userMuted;
    if (offIcon) offIcon.hidden = !userMuted;
  }

  function persistMute() {
    try {
      sessionStorage.setItem(STORAGE_KEY, userMuted ? "1" : "0");
    } catch (_) {}
  }

  function playMusic() {
    if (!unlocked || userMuted) return;
    audio.volume = MUSIC_VOLUME;
    audio.muted = false;
    const attempt = audio.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {});
    }
  }

  function pauseMusic() {
    audio.pause();
  }

  function unlockFromGesture() {
    if (unlocked) return Promise.resolve();
    audio.load();
    audio.volume = 0;
    audio.muted = true;
    const attempt = audio.play();
    if (!attempt || typeof attempt.then !== "function") {
      unlocked = true;
      return Promise.resolve();
    }
    return attempt.then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
      audio.volume = MUSIC_VOLUME;
      unlocked = true;
    }).catch(() => {
      unlocked = true;
    });
  }

  function onGateDismissed() {
    if (toggle) toggle.hidden = false;
    updateToggleUi();
    playMusic();
  }

  function setMuted(muted) {
    userMuted = muted;
    persistMute();
    updateToggleUi();
    if (muted) pauseMusic();
    else playMusic();
  }

  toggle?.addEventListener("click", () => {
    if (!unlocked) {
      unlockFromGesture().then(() => setMuted(false));
      return;
    }
    setMuted(!userMuted);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseMusic();
    else playMusic();
  });

  window.SiteMusic = {
    unlockFromGesture,
    onGateDismissed,
    playMusic,
    pauseMusic,
  };

  updateToggleUi();
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

  function preventScrollWhileLocked() {
    if (isGateLocked()) scrollToHero();
  }

  function focusHero() {
    if (!hero) return;
    hero.setAttribute("tabindex", "-1");
    hero.focus({ preventScroll: true });
  }

  scrollToHero();
  window.addEventListener("scroll", preventScrollWhileLocked, { passive: true });

  const gateTouchBlocker = (e) => {
    if (isGateLocked()) blockTouchScroll(e);
  };
  document.addEventListener("touchmove", gateTouchBlocker, { passive: false });

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
    window.removeEventListener("scroll", preventScrollWhileLocked);
    document.removeEventListener("touchmove", gateTouchBlocker);

    if (window.scrollY > 0) scrollToHero();
    requestAnimationFrame(focusHero);

    setTimeout(() => {
      gate.style.display = "none";
      gate.setAttribute("aria-hidden", "true");
    }, prefersReduced ? 150 : 500);

    window.SiteMusic?.onGateDismissed();
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
    window.SiteMusic?.unlockFromGesture();
    openEnvelope();
  });
  envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      window.SiteMusic?.unlockFromGesture();
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
      const unlock = window.SiteMusic?.unlockFromGesture?.();
      if (unlock && typeof unlock.then === "function") {
        unlock.then(() => dismissGate());
      } else {
        dismissGate();
      }
    });
  }
})();

// ===== Scratch-to-reveal date card =====
(function initScratchCard() {
  const card = document.getElementById("scratchCard");
  if (!card) return;

  const canvas = card.querySelector(".scratch-canvas");
  if (!canvas) return;

  const STROKES_TO_REVEAL = 2;
  const MIN_STROKE_DISTANCE_RATIO = 0.08;
  const STROKE_PAUSE_MS = 180;
  let revealed = false;
  let scratchStrokes = 0;
  const calendarActions = document.getElementById("calendarActions");
  const addToCalendarBtn = document.getElementById("addToCalendar");
  const scratchHint = document.getElementById("scratchHint");
  const ctx = canvas.getContext("2d", { willReadFrequently: false });
  let dpr = Math.max(window.devicePixelRatio || 1, 1);
  let cssW = 0, cssH = 0;
  let isDown = false;
  let activePointerId = null;
  let lastX = 0, lastY = 0;
  let strokeDistance = 0;
  let strokePauseTimer = null;
  let lastCanvasW = 0;
  let lastCanvasH = 0;
  let hasScratchMarks = false;
  let gestureEnded = false;

  function minStrokeDistance() {
    return cssW * MIN_STROKE_DISTANCE_RATIO;
  }

  function clearStrokePauseTimer() {
    if (!strokePauseTimer) return;
    clearTimeout(strokePauseTimer);
    strokePauseTimer = null;
  }

  function registerStrokeFromDistance(distance) {
    if (revealed || distance < minStrokeDistance()) return false;
    registerScratchMotion();
    return true;
  }

  function tryCompleteStrokeWhileDown() {
    if (!isDown || revealed || strokeDistance < minStrokeDistance()) return false;
    registerScratchMotion();
    strokeDistance = 0;
    return true;
  }

  function scheduleStrokePauseCheck() {
    clearStrokePauseTimer();
    strokePauseTimer = setTimeout(() => {
      strokePauseTimer = null;
      tryCompleteStrokeWhileDown();
    }, STROKE_PAUSE_MS);
  }

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
      "DESCRIPTION:Haldi & Sangeet on 14 Nov. Wedding muhurta 12:05 PM & Reception on 15 Nov at Samarambh Lawns\\, Thane.",
      "LOCATION:Samarambh Lawns\\, Thane\\, Maharashtra",
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
    clearStrokePauseTimer();

    if (scratchHint) {
      scratchHint.textContent = "";
      scratchHint.classList.remove("scratch-hint-line--once-more");
      scratchHint.classList.add("scratch-hint-line--hidden");
    }

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

  function updateScratchHint() {
    if (!scratchHint || revealed) return;
    if (scratchStrokes >= STROKES_TO_REVEAL - 1) {
      scratchHint.textContent = "Once more - scratch again to reveal.";
      scratchHint.classList.add("scratch-hint-line--once-more");
    }
  }

  function registerScratchMotion() {
    if (revealed) return;
    scratchStrokes++;
    if (scratchStrokes === 1) card.classList.add("scratch-card--one-stroke");
    updateScratchHint();
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
    const nextW = rect.width;
    const nextH = rect.height;
    if (nextW < 1 || nextH < 1) return;
    if (Math.abs(nextW - lastCanvasW) < 1 && Math.abs(nextH - lastCanvasH) < 1) return;
    lastCanvasW = nextW;
    lastCanvasH = nextH;
    cssW = nextW;
    cssH = nextH;
    dpr = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!hasScratchMarks) paintFoil();
  }

  function markScratch() {
    hasScratchMarks = true;
  }

  function scratchAt(x, y) {
    markScratch();
    const r = cssW * 0.09;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function strokeTo(x, y) {
    markScratch();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = cssW * 0.14;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function pointerPosFromClient(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width ? cssW / rect.width : 1;
    const scaleY = rect.height ? cssH / rect.height : 1;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function pointerPos(e) {
    return pointerPosFromClient(e.clientX, e.clientY);
  }

  function beginStroke(clientX, clientY, pointerId) {
    if (revealed) return;
    isDown = true;
    gestureEnded = false;
    activePointerId = pointerId;
    strokeDistance = 0;
    clearStrokePauseTimer();
    const p = pointerPosFromClient(clientX, clientY);
    lastX = p.x; lastY = p.y;
    scratchAt(p.x, p.y);
  }

  function moveStroke(clientX, clientY, pointerId) {
    if (!isDown || revealed || pointerId !== activePointerId) return;
    const p = pointerPosFromClient(clientX, clientY);
    const step = Math.hypot(p.x - lastX, p.y - lastY);
    if (step < 0.35) return;
    strokeDistance += step;
    strokeTo(p.x, p.y);
    lastX = p.x; lastY = p.y;

    if (scratchStrokes === 1 && strokeDistance >= minStrokeDistance()) {
      clearStrokePauseTimer();
      tryCompleteStrokeWhileDown();
      return;
    }

    scheduleStrokePauseCheck();
  }

  function finishStroke(pointerId) {
    if (!isDown || pointerId !== activePointerId || gestureEnded) return;
    gestureEnded = true;
    clearStrokePauseTimer();
    const distance = strokeDistance;
    isDown = false;
    activePointerId = null;
    strokeDistance = 0;
    registerStrokeFromDistance(distance);
  }

  function onPointerDown(e) {
    if (revealed) return;
    if (isDown && e.pointerId !== activePointerId) return;
    if (isTouchLikePointer(e)) blockTouchScroll(e);
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    beginStroke(e.clientX, e.clientY, e.pointerId);
  }

  function onPointerMove(e) {
    if (!isDown || revealed || e.pointerId !== activePointerId) return;
    if (isTouchLikePointer(e)) blockTouchScroll(e);
    moveStroke(e.clientX, e.clientY, e.pointerId);
  }

  function endPointer(e) {
    if (!isDown || e.pointerId !== activePointerId || gestureEnded) return;
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
    finishStroke(e.pointerId);
  }

  if (window.PointerEvent) {
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", endPointer);
  } else {
    const mouseId = 1;
    const touchId = 2;

    canvas.addEventListener("mousedown", (e) => {
      if (revealed || e.button !== 0) return;
      e.preventDefault();
      beginStroke(e.clientX, e.clientY, mouseId);
    });
    canvas.addEventListener("mousemove", (e) => {
      if (!isDown || activePointerId !== mouseId) return;
      e.preventDefault();
      moveStroke(e.clientX, e.clientY, mouseId);
    });
    window.addEventListener("mouseup", (e) => {
      if (!isDown || activePointerId !== mouseId) return;
      finishStroke(mouseId);
    });

    canvas.addEventListener("touchstart", (e) => {
      if (revealed || isDown) return;
      const t = e.changedTouches[0];
      if (!t) return;
      blockTouchScroll(e);
      beginStroke(t.clientX, t.clientY, touchId);
    }, { passive: false });
    canvas.addEventListener("touchmove", (e) => {
      if (!isDown || activePointerId !== touchId) return;
      blockTouchScroll(e);
      const t = e.changedTouches[0];
      if (!t) return;
      moveStroke(t.clientX, t.clientY, touchId);
    }, { passive: false });
    canvas.addEventListener("touchend", (e) => {
      if (!isDown || activePointerId !== touchId) return;
      finishStroke(touchId);
    });
    canvas.addEventListener("touchcancel", (e) => {
      if (!isDown || activePointerId !== touchId) return;
      finishStroke(touchId);
    });
  }

  canvas.addEventListener("touchmove", (e) => {
    if (isDown) blockTouchScroll(e);
  }, { passive: false });

  if (addToCalendarBtn) addToCalendarBtn.addEventListener("click", downloadWeddingIcs);

  function bootScratchCanvas() {
    sizeCanvas();
    requestAnimationFrame(sizeCanvas);
  }

  bootScratchCanvas();
  window.addEventListener("load", bootScratchCanvas, { once: true });
  window.addEventListener("orientationchange", () => {
    setTimeout(bootScratchCanvas, 250);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", bootScratchCanvas);
  }

  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => {
      if (revealed) return;
      sizeCanvas();
    });
    ro.observe(card);
  } else {
    let resizeTimer;
    window.addEventListener("resize", () => {
      if (revealed) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(sizeCanvas, 200);
    });
  }
})();

// ===== Gallery flipbook =====
(function initFlipbook() {
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
  let dragStartX = 0;
  let dragActive = false;
  let suppressClick = false;
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
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    flip("next");
  });

  stage.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragActive = true;
    dragStartX = e.clientX;
  });

  stage.addEventListener("pointerup", (e) => {
    if (!dragActive) return;
    dragActive = false;
    const delta = e.clientX - dragStartX;
    if (Math.abs(delta) < 40) return;
    suppressClick = true;
    flip(delta < 0 ? "next" : "prev");
  });

  stage.addEventListener("pointercancel", () => {
    dragActive = false;
  });

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
