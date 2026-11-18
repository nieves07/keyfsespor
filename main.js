/* =========================================================
   KADRO — isimleri ve rolleri buradan değiştir.
   img: assets klasöründeki dosya adı.
   ========================================================= */
// Kurucu (kadro-1.jpg) kadrodan ayrı, index.html içindeki "Kurucu" bölümünde duruyor.
const PLAYERS = [
  { name: "Oyuncu 01", role: "Oyuncu", img: "kadro-2.jpg" },
  { name: "Oyuncu 02", role: "Oyuncu", img: "kadro-3.jpg" },
  { name: "Oyuncu 03", role: "Oyuncu", img: "kadro-4.jpg" },
  { name: "Oyuncu 04", role: "Oyuncu", img: "kadro-5.jpg" },
  // Eksik oyuncu gelince buraya ekle: { name: "...", role: "Oyuncu", img: "kadro-6.jpg" },
];

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- Kadro kartlarını üret ---------- */
const track = $(".roster-track");
PLAYERS.forEach((p, i) => {
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <img src="assets/${p.img}" alt="${p.name} portresi" decoding="sync">
    <span class="card-num">${String(i + 1).padStart(2, "0")}</span>
    <div class="card-meta">
      <h3 class="card-name">${p.name}</h3>
      <span class="card-role">${p.role}</span>
    </div>`;
  track.appendChild(card);
});

// Portreleri önceden çöz ki kaydırırken takılmasın
$$(".card img, .hero-bg img").forEach((im) => im.decode && im.decode().catch(() => {}));

/* ---------- Forma rengi: siyah / beyaz ---------- */
const kit = $(".kit");
$$(".kit-toggle button").forEach((b) => {
  b.addEventListener("click", () => {
    const renk = b.dataset.renk;
    kit.classList.toggle("is-beyaz", renk === "beyaz");
    $$(".kit-toggle button").forEach((x) => {
      const on = x.dataset.renk === renk;
      x.classList.toggle("is-on", on);
      x.setAttribute("aria-pressed", on);
    });
  });
});

// Oyuncu sayısı kadro listesinden gelsin
// Kadro + kurucu
const TEAM_SIZE = PLAYERS.length + 1;
$$("[data-player-count]").forEach((el) => { el.dataset.count = TEAM_SIZE; el.textContent = TEAM_SIZE; });

$("#year").textContent = new Date().getFullYear();

/* ---------- Manifesto kelimelerini böl ---------- */
$$("[data-words]").forEach((el) => {
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
});

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

if (!hasGsap || reduced) {
  // Animasyon yoksa her şey görünür kalsın
  $$(".manifesto-text .w").forEach((w) => (w.style.opacity = 1));
  $(".loader").remove();
} else {
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Yumuşak scroll (Lenis) ---------- */
  let lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(target, { duration: 1.4 }) : target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- İlerleme çubuğu ---------- */
  gsap.to(".progress", {
    scaleX: 1, ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
  });

  /* ---------- Hero: giriş + scroll ---------- */
  const num = $(".loader-num"), lo = { v: 0 };
  if (lenis) lenis.stop();
  gsap.timeline({ defaults: { ease: "power4.out" } })
    .to(lo, { v: 100, duration: 1.2, ease: "power2.inOut", onUpdate: () => (num.textContent = Math.round(lo.v)) })
    .to(".loader-bar i", { scaleX: 1, duration: 1.2, ease: "power2.inOut" }, 0)
    .to(".loader-inner", { y: -40, opacity: 0, duration: 0.4, ease: "power2.in" })
    .to(".loader", { yPercent: -100, duration: 0.9, ease: "power4.inOut", onComplete: () => { $(".loader").remove(); if (lenis) lenis.start(); } })
    .addLabel("in", "-=0.55")
    .from(".hero-bg", { scale: 1.12, opacity: 0, duration: 1.8, ease: "expo.out" }, "in")
    .from(".hero-title .line > span", { yPercent: 115, duration: 1.1, stagger: 0.09 }, "in+=0.35")
    .from(".hero .eyebrow, .hero-sub, .hero-actions, .scroll-hint", { y: 24, opacity: 0, duration: 0.9, stagger: 0.08 }, "in+=0.8")
    .from(".nav", { y: -80, opacity: 0, duration: 1 }, "in+=0.6")
    .from(".dots", { x: 40, opacity: 0, duration: 1 }, "in+=0.8");

  /* ---------- Yan bölüm göstergesi ---------- */
  const dots = $$(".dots a"), secs = dots.map((d) => $(d.getAttribute("href")));
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: () => {
      let on = 0;
      secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= innerHeight / 2) on = i; });
      dots.forEach((d, i) => d.classList.toggle("is-on", i === on));
    },
  });
  dots[0].classList.add("is-on");

  /* ---------- Manyetik butonlar ---------- */
  if (matchMedia("(hover: hover)").matches) {
    $$(".btn").forEach((b) => {
      const bx = gsap.quickTo(b, "x", { duration: 0.4, ease: "power3" });
      const by = gsap.quickTo(b, "y", { duration: 0.4, ease: "power3" });
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        bx((e.clientX - r.left - r.width / 2) * 0.3); by((e.clientY - r.top - r.height / 2) * 0.4);
      });
      b.addEventListener("pointerleave", () => { bx(0); by(0); });
    });
  }

  gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } })
    .fromTo(".hero-bg", { y: 0 }, { y: () => innerHeight * 0.25, ease: "none" }, 0)
    .to(".hero-content", { yPercent: -35, opacity: 0, ease: "none" }, 0)
    .to(".scroll-hint", { opacity: 0, ease: "none", duration: 0.2 }, 0);

  /* ---------- Manifesto: kelime kelime aydınlan ---------- */
  gsap.to(".manifesto-text .w", {
    opacity: 1, stagger: 0.1, ease: "none",
    scrollTrigger: { trigger: ".manifesto-text", start: "top 78%", end: "bottom 45%", scrub: 0.4 },
  });

  /* ---------- Genel reveal ---------- */
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%", once: true,
    onEnter: (els) => gsap.fromTo(els, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: "power3.out" }),
  });
  gsap.set("[data-reveal]", { opacity: 0 });

  $$("[data-count]").forEach((el) => {
    const end = +el.dataset.count, o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 1.4, ease: "power2.out",
      onUpdate: () => (el.textContent = Math.round(o.v)),
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  /* ---------- Marquee: scroll hızına tepki ---------- */
  const mq = gsap.to(".marquee-track", { xPercent: -50, ease: "none", duration: 22, repeat: -1 });
  ScrollTrigger.create({
    trigger: ".marquee", start: "top bottom", end: "bottom top",
    onToggle: (self) => (self.isActive ? mq.play() : mq.pause()),
    onUpdate: (self) => {
      const v = gsap.utils.clamp(-6, 6, self.getVelocity() / 250);
      mq.timeScale((v < 0 ? -1 : 1) * (1 + Math.abs(v)));
    },
  });
  mq.pause();

  /* ---------- Videolar yalnızca ekrandayken oynasın ---------- */
  const vio = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())), { threshold: 0.15 });
  $$("video").forEach((v) => { v.removeAttribute("autoplay"); v.pause(); vio.observe(v); });

  /* ---------- Tarzımız: üst üste binen kartlar ---------- */
  gsap.from(".values-head > *", {
    y: 60, opacity: 0, stagger: 0.1, duration: 1, ease: "power3.out",
    scrollTrigger: { trigger: ".values-head", start: "top 80%", once: true },
  });
  const vcards = $$(".vcard");
  vcards.forEach((c, i) => {
    gsap.fromTo(c.querySelector(".vcard-ico"), { rotate: -24, yPercent: 20 }, {
      rotate: 6, yPercent: -10, ease: "none",
      scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true },
    });
    if (i === vcards.length - 1) return;
    const shade = document.createElement("div");
    shade.className = "vcard-shade";
    c.querySelector(".vcard-in").appendChild(shade);
    const st = { trigger: vcards[i + 1], start: "top 60%", end: "top 15%", scrub: true };
    gsap.to(c.querySelector(".vcard-in"), { scale: 0.9 + i * 0.03, ease: "none", scrollTrigger: st });
    gsap.to(shade, { opacity: 0.5, ease: "none", scrollTrigger: st });
  });

  const mm = gsap.matchMedia();

  /* ---------- Kadro: yatay kaydırma (masaüstü) ---------- */
  mm.add("(min-width: 900px)", () => {
    const dist = () => track.scrollWidth - window.innerWidth;
    const horiz = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: ".roster", start: "center center", end: () => "+=" + dist(),
        pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
      },
    });
    $$(".card", track).forEach((card) => {
      gsap.fromTo(card.querySelector("img"), { xPercent: -6, scale: 1.14 }, {
        xPercent: 6, ease: "none",
        scrollTrigger: { trigger: card, containerAnimation: horiz, start: "left right", end: "right left", scrub: true },
      });
    });

    /* ---------- Kart: 3B eğim + ışık ---------- */
    const offs = $$(".card", track).map((card) => {
      gsap.set(card, { transformPerspective: 900 });
      const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3" });
      const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3" });
      const ty = gsap.quickTo(card, "y", { duration: 0.5, ease: "power3" });
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", px * 100 + "%");
        card.style.setProperty("--my", py * 100 + "%");
        ry((px - 0.5) * 16); rx((0.5 - py) * 12); ty(-12);
      };
      const onLeave = () => { rx(0); ry(0); ty(0); };
      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);
      return () => { card.removeEventListener("pointermove", onMove); card.removeEventListener("pointerleave", onLeave); };
    });

    /* ---------- Forma: sabit görsel, değişen adımlar ---------- */
    const imgs = $$(".kit-frame > *"), idx = $(".kit-index b");
    const show = (i) => {
      imgs.forEach((im, n) => im.classList.toggle("is-active", n === i));
      idx.textContent = String(i + 1).padStart(2, "0");
    };
    $$(".kit-step").forEach((step, i) => {
      ScrollTrigger.create({ trigger: step, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && show(i) });
      gsap.from(step.children, {
        y: 60, opacity: 0, stagger: 0.1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: step, start: "top 62%", toggleActions: "play none none reverse" },
      });
    });
    gsap.to(".kit-frame", {
      yPercent: -4, ease: "none",
      scrollTrigger: { trigger: ".kit", start: "top bottom", end: "bottom top", scrub: true },
    });

    /* ---------- İmleç parıltısı ---------- */
    const glow = $(".cursor-glow");
    const gx = gsap.quickTo(glow, "x", { duration: 0.6, ease: "power3" });
    const gy = gsap.quickTo(glow, "y", { duration: 0.6, ease: "power3" });
    const move = (e) => { glow.style.opacity = 1; gx(e.clientX); gy(e.clientY); };
    window.addEventListener("pointermove", move);
    return () => { window.removeEventListener("pointermove", move); offs.forEach((f) => f()); };
  });

  /* ---------- Mobil: kartlar ve formalar sırayla gelsin ---------- */
  mm.add("(max-width: 899px)", () => {
    $$(".kit-step").forEach((step) => {
      gsap.from(step.children, {
        y: 50, opacity: 0, stagger: 0.1, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: step, start: "top 80%", once: true },
      });
    });
  });

  /* ---------- Dev yazı şeritleri + footer yazısı ---------- */
  gsap.fromTo(".bigrow.r1", { xPercent: 0 }, { xPercent: -30, ease: "none", scrollTrigger: { trigger: ".bigrows", start: "top bottom", end: "bottom top", scrub: 0.5 } });
  gsap.fromTo(".bigrow.r2", { xPercent: -25 }, { xPercent: 5, ease: "none", scrollTrigger: { trigger: ".bigrows", start: "top bottom", end: "bottom top", scrub: 0.5 } });
  gsap.from(".wordmark span", { yPercent: 60, ease: "none", scrollTrigger: { trigger: ".wordmark", start: "top bottom", end: "bottom bottom", scrub: 0.4 } });

  /* ---------- CTA ---------- */
  gsap.from(".cta-title", {
    scale: 0.6, opacity: 0, ease: "none",
    scrollTrigger: { trigger: ".cta", start: "top 85%", end: "top 25%", scrub: 0.5 },
  });
  gsap.fromTo(".cta-glow", { scale: 0.5 }, {
    scale: 1.2, ease: "none",
    scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom bottom", scrub: true },
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
