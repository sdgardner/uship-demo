// uShip demo prototype — shared navigation helpers.
// Each screen is its own HTML page; `data-next` marks the primary CTA
// that advances to the next screen in the demo flow.

const FLOW = {
  "signin.html": "shipments.html",
  "index.html": "new-shipment.html",       // Get Shipping Quotes (no category selected)
  "new-shipment.html": "list-shipment.html",   // Start an IHD Shipment
  "household-items.html": "list-shipment.html", // IHD Private Network card
  "list-shipment.html": "confirm-shipment.html",  // Continue (estimate complete)
};

document.querySelectorAll("[data-next]").forEach((el) => {
  el.addEventListener("click", (e) => {
    const page = location.pathname.split("/").pop() || "index.html";
    const next = FLOW[page];
    if (next) {
      e.preventDefault();
      location.href = next;
    }
  });
});

// Mobile testimonial carousel
const dots = document.querySelectorAll("#quote-dots span");
const cards = document.querySelectorAll("#quotes .quote-card");
dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    dots.forEach((d, j) => d.classList.toggle("active", i === j));
    cards.forEach((c, j) => c.classList.toggle("active", i === j));
  });
});

// Password show/hide (sign-in page)
const pwToggle = document.getElementById("pw-toggle");
if (pwToggle) {
  pwToggle.addEventListener("click", () => {
    const pw = document.getElementById("password");
    pw.type = pw.type === "password" ? "text" : "password";
  });
}

// Signing in sets the demo session flag
if ((location.pathname.split("/").pop() || "index.html") === "signin.html") {
  document.querySelector(".auth-submit")?.addEventListener("click", () => {
    try { localStorage.setItem("uship_demo_user", "Bryan L."); } catch (e) {}
  });
}

// Logged-in header (Figma 254:328): swap header content when a session exists
(function () {
  let user = null;
  try { user = localStorage.getItem("uship_demo_user"); } catch (e) {}
  const header = document.querySelector(".site-header");
  if (!user || !header || document.body.classList.contains("auth-page") || document.body.classList.contains("ls-page")) return;
  header.classList.add("signed-in");
  header.querySelector(".container").innerHTML = `
    <div class="auth-left">
      <a class="logo" href="index.html"><img src="assets/uship-logo.svg" alt="uShip"></a>
      <nav class="auth-tabs">
        <a class="auth-tab" href="shipments.html"><img src="assets/figma/icon-shipments.svg" alt=""> My Shipments</a>
        <a class="auth-tab" href="new-shipment.html"><img src="assets/figma/icon-ship.svg" alt=""> Ship</a>
      </nav>
    </div>
    <div class="auth-right">
      <span class="badge-ihd"><img src="assets/figma/gem.svg" alt=""> IHD Member</span>
      <button class="auth-user" id="user-btn">
        <img class="avatar" src="assets/figma/avatar.svg" alt="">
        <span class="user-name">${user}</span>
        <img class="chev" src="assets/figma/chevron-down.svg" alt="">
        <div class="user-menu" id="user-menu">
          <a href="#">Profile</a>
          <a href="#">Settings</a>
          <a href="#" id="sign-out">Sign Out</a>
        </div>
      </button>
      <button class="auth-help" id="help-btn" aria-label="Help"><img src="assets/figma/help.svg" alt="Help">
        <div class="help-pop" id="help-pop" hidden>
          <h4>Need a hand?</h4>
          <p>Replay the guided walkthrough of the In-Home Delivery experience from the beginning.</p>
          <a href="#" class="help-restart" id="help-restart">Restart the Walkthrough</a>
          <a href="#" class="help-reset" id="help-reset">Reset demo &amp; start from the home page</a>
        </div>
      </button>
      <button class="menu-btn" aria-label="Menu">&#9776;</button>
    </div>`;
  document.getElementById("user-btn").addEventListener("click", (e) => {
    document.getElementById("user-menu").classList.toggle("open");
  });
  document.getElementById("sign-out").addEventListener("click", (e) => {
    e.preventDefault();
    try { localStorage.removeItem("uship_demo_user"); } catch (err) {}
    location.href = "index.html";
  });
  // Help popover: restart or fully reset the walkthrough
  const helpBtn = document.getElementById("help-btn");
  const helpPop = document.getElementById("help-pop");
  helpBtn.addEventListener("click", (e) => {
    if (e.target.closest(".help-pop")) return;
    helpPop.hidden = !helpPop.hidden;
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#help-btn")) helpPop.hidden = true;
  });
  document.getElementById("help-restart").addEventListener("click", (e) => {
    e.preventDefault();
    try {
      sessionStorage.clear();
      sessionStorage.setItem("uship_tour", "on"); // skip the welcome modal, start stepping right away
      localStorage.removeItem("uship_demo_user"); // walkthrough includes signing in
    } catch (err) {}
    location.href = "index.html";
  });
  document.getElementById("help-reset").addEventListener("click", (e) => {
    e.preventDefault();
    try {
      sessionStorage.clear();
      localStorage.removeItem("uship_demo_user");
    } catch (err) {}
    location.href = "index.html";
  });
})();

// IHD content is members-only: hide it for logged-out visitors
(function () {
  let user = null;
  try { user = localStorage.getItem("uship_demo_user"); } catch (e) {}
  if (user) return;
  const ihdSection = document.querySelector(".ihd-card");
  if (ihdSection) ihdSection.closest(".ns-section")?.remove();
  // Household page: the IHD tile becomes a plain Furniture card when logged out
  let hh = document.querySelector(".hh-ihd-card");
  if (hh) {
    const clone = hh.cloneNode(true); // drop the shipping-flow click handler
    clone.removeAttribute("data-next");
    clone.removeAttribute("href");
    hh.replaceWith(clone);
    hh = clone;
    hh.classList.remove("hh-ihd-card");
    hh.querySelector(".hh-gem-circle")?.remove();
    hh.querySelector(".hh-tags")?.remove();
    const h3 = hh.querySelector("h3");
    h3.textContent = "Furniture";
    hh.insertBefore(hh.querySelector(".ns-card-img"), h3); // image above the title like the other cards
    // Clicking it invites the visitor to sign in for the IHD experience
    hh.addEventListener("click", (e) => {
      e.preventDefault();
      if (document.querySelector(".ihd-gate-overlay")) return;
      const ov = document.createElement("div");
      ov.className = "tour-welcome-overlay ihd-gate-overlay";
      ov.innerHTML = `
        <div class="tour-welcome ihd-gate">
          <span class="hh-gem-circle" style="margin:0 auto 14px"><img src="assets/figma/gem-purple.svg" alt=""></span>
          <h2>Shipping furniture? Meet In-Home Delivery</h2>
          <p>IHD members ship with a private network of approved carriers — white-glove service, room-of-choice placement, and blanket-wrap protection on every job.</p>
          <p>Sign in to see the members-only experience.</p>
          <a class="tour-start" href="signin.html" style="text-decoration:none">Sign In to uShip</a>
          <button class="tour-later">Continue without signing in</button>
        </div>`;
      document.body.appendChild(ov);
      ov.querySelector(".tour-later").addEventListener("click", () => ov.remove());
      ov.addEventListener("click", (ev) => { if (ev.target === ov) ov.remove(); });
    });
  }
  document.querySelectorAll(".ptb-member, .ns-card-flag").forEach((el) => el.remove());
})();

// List a Shipment: multi-item form + computed estimate
(function () {
  const cont = document.getElementById("ls-continue");
  if (!cont) return;
  const wrap = document.getElementById("ls-items");
  const addBtn = document.getElementById("ls-add");
  const firstItem = wrap.querySelector(".ls-item");

  // ZIP prefix (first 3 digits) -> city + coordinates, for display and distance
  const ZIPS = {
    787: ["Austin, TX", 30.27, -97.74],      786: ["Austin, TX", 30.27, -97.74],
    871: ["Albuquerque, NM", 35.08, -106.65],
    752: ["Dallas, TX", 32.78, -96.8],       770: ["Houston, TX", 29.76, -95.37],
    100: ["New York, NY", 40.71, -74.01],    112: ["Brooklyn, NY", 40.68, -73.94],
    606: ["Chicago, IL", 41.88, -87.63],     021: ["Boston, MA", 42.36, -71.06],
    331: ["Miami, FL", 25.76, -80.19],       303: ["Atlanta, GA", 33.75, -84.39],
    900: ["Los Angeles, CA", 34.05, -118.24],941: ["San Francisco, CA", 37.77, -122.42],
    802: ["Denver, CO", 39.74, -104.99],     850: ["Phoenix, AZ", 33.45, -112.07],
    980: ["Seattle, WA", 47.61, -122.33],    972: ["Portland, OR", 45.52, -122.68],
    191: ["Philadelphia, PA", 39.95, -75.17],372: ["Nashville, TN", 36.16, -86.78],
    641: ["Kansas City, MO", 39.1, -94.58],  891: ["Las Vegas, NV", 36.17, -115.14],
  };

  function zipInfo(raw) {
    const m = (raw || "").match(/\b(\d{5})\b/);
    if (!m) return null;
    const zip = m[1];
    const hit = ZIPS[parseInt(zip.slice(0, 3), 10)];
    return { zip, city: hit ? hit[0] : null, lat: hit ? hit[1] : null, lon: hit ? hit[2] : null };
  }

  function distanceMiles(a, b) {
    if (a.lat != null && b.lat != null) {
      const r = Math.PI / 180, R = 3958.8;
      const s = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 +
        Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lon - a.lon) * r) / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(s));
    }
    return Math.min(Math.abs(parseInt(a.zip, 10) - parseInt(b.zip, 10)) / 13, 2800); // rough fallback
  }

  // Rate card (calibrated): $35 base + $0.80/lb + $8/ft3 + $0.2845/mi; uShip fee 10.8%
  function computePrice() {
    const from = zipInfo(document.getElementById("zip-from").value);
    const to = zipInfo(document.getElementById("zip-to").value);
    if (!from || !to) return null;
    let goods = 0;
    for (const it of items()) {
      const v = (s) => parseFloat(it.querySelector(s).value) || 0;
      const unit = it.querySelectorAll("select")[1].value;
      const dimDiv = unit === "ft" ? 1 : unit === "cm" ? 28316.8 : 1728; // -> cubic feet
      const volume = (v(".ls-len") * v(".ls-wid") * v(".ls-hgt")) / dimDiv;
      const wUnit = it.querySelectorAll("select")[2].value;
      const weight = v(".ls-wgt") * (wUnit === "kg" ? 2.20462 : 1);
      const qty = parseInt(it.querySelector(".ls-qty").value, 10) || 1;
      goods += qty * (0.8 * weight + 8 * volume);
    }
    const price = 34.97 + goods + 0.2845 * distanceMiles(from, to);
    const fee = price * 0.108;
    return { price, fee, total: price + fee };
  }

  function money(n) { return '<sup>$</sup>' + n.toFixed(2); }

  function items() { return [...wrap.querySelectorAll(".ls-item")]; }

  function renumber() {
    const list = items();
    wrap.classList.toggle("multi", list.length > 1);
    list.forEach((it, i) => (it.querySelector(".ls-item-num").textContent = i + 1));
  }

  function itemComplete(it) {
    return [".ls-ftype", ".ls-len", ".ls-wid", ".ls-hgt", ".ls-wgt", ".ls-qty"]
      .every((s) => it.querySelector(s).value.trim() !== "");
  }

  function update() {
    const list = items();
    list.forEach((it) => {
      const sel = it.querySelector(".ls-ftype");
      sel.classList.toggle("filled", sel.value.trim() !== "");
      it.classList.toggle("invalid", sel.value.trim() === "" && list.length > 1);
    });
    const est = computePrice();
    const done = est && list.every(itemComplete);
    if (done) {
      document.getElementById("est-price").innerHTML = money(est.price);
      document.getElementById("est-fee").innerHTML = money(est.fee);
      document.getElementById("est-total").innerHTML = money(est.total);
      document.getElementById("est-hint").style.display = "none";
      cont.classList.add("enabled");
      cont.removeAttribute("aria-disabled");
    } else {
      document.getElementById("est-hint").style.display = "";
      document.getElementById("est-price").textContent = "$--.--";
      document.getElementById("est-fee").textContent = "$--.--";
      document.getElementById("est-total").textContent = "$--.--";
      cont.classList.remove("enabled");
      cont.setAttribute("aria-disabled", "true");
    }
  }

  // ZIP fields resolve to "City, ST 78728 US" like the live flow
  ["zip-from", "zip-to"].forEach((id) => {
    const el = document.getElementById(id);
    el.removeAttribute("maxlength");
    el.addEventListener("input", update);
    el.addEventListener("blur", () => {
      const info = zipInfo(el.value);
      if (info && info.city) el.value = `${info.city} ${info.zip} US`;
      update();
    });
  });

  wrap.addEventListener("input", update);
  wrap.addEventListener("change", update);

  wrap.addEventListener("click", (e) => {
    const rm = e.target.closest(".ls-remove");
    if (!rm) return;
    e.preventDefault();
    if (items().length > 1) rm.closest(".ls-item").remove();
    renumber();
    update();
  });

  addBtn.addEventListener("click", () => {
    const clone = firstItem.cloneNode(true);
    clone.classList.remove("invalid");
    clone.querySelectorAll("input").forEach((i) => (i.value = i.classList.contains("ls-qty") ? "1" : ""));
    clone.querySelectorAll("select").forEach((s) => (s.selectedIndex = 0));
    clone.querySelector(".ls-ftype").classList.remove("filled");
    wrap.insertBefore(clone, addBtn);
    renumber();
    update();
  });

  renumber();
  update();
})();

// Carry the estimate over to the confirm page
(function () {
  const cont = document.getElementById("ls-continue");
  if (!cont) return;
  cont.addEventListener("click", () => {
    if (!cont.classList.contains("enabled")) return;
    const item = document.querySelector(".ls-item");
    let weight = 0;
    document.querySelectorAll(".ls-item").forEach((it) => {
      const q = parseInt(it.querySelector(".ls-qty").value, 10) || 1;
      weight += q * (parseFloat(it.querySelector(".ls-wgt").value) || 0);
    });
    const strip = (v) => (v || "").replace(/\s*US$/, "");
    const data = {
      title: item.querySelector(".ls-ftype").value || "Shipment",
      weight: weight,
      from: strip(document.getElementById("zip-from").value),
      to: strip(document.getElementById("zip-to").value),
      price: (document.getElementById("est-price").textContent || "").replace(/[^0-9.]/g, ""),
      fee: (document.getElementById("est-fee").textContent || "").replace(/[^0-9.]/g, ""),
      total: (document.getElementById("est-total").textContent || "").replace(/[^0-9.]/g, ""),
      items: [...document.querySelectorAll(".ls-item")].map((it) => ({
        name: it.querySelector(".ls-ftype").value,
        l: it.querySelector(".ls-len").value, w: it.querySelector(".ls-wid").value,
        h: it.querySelector(".ls-hgt").value, unit: it.querySelectorAll("select")[1].value,
        wgt: it.querySelector(".ls-wgt").value, wunit: it.querySelectorAll("select")[2].value,
        qty: it.querySelector(".ls-qty").value,
      })),
    };
    try { sessionStorage.setItem("uship_demo_shipment", JSON.stringify(data)); } catch (e) {}
  });
})();

// Confirm page: populate summary bar + fields from the estimate
(function () {
  if (!document.body.classList.contains("cs-page")) return;
  let d = null;
  try { d = JSON.parse(sessionStorage.getItem("uship_demo_shipment")); } catch (e) {}
  if (d) {
    document.getElementById("sum-title").textContent = d.title;
    document.getElementById("cs-title").value = d.title;
    document.getElementById("sum-weight").textContent = "Total Weight: " + Number(d.weight).toFixed(1) + " lbs";
    document.getElementById("sum-from").textContent = d.from;
    document.getElementById("sum-to").textContent = d.to;
    if (d.price) document.getElementById("sum-price").textContent = Math.round(parseFloat(d.price));
    const parse = (s) => { const m = (s || "").match(/^(.*?),\s*([A-Z]{2})\s+(\d{5})/); return m ? { city: m[1], st: m[2], zip: m[3] } : null; };
    const f = parse(d.from), t = parse(d.to);
    if (f) { document.getElementById("from-city").value = f.city; document.getElementById("from-state").value = f.st; document.getElementById("from-zip").value = f.zip; }
    if (t) { document.getElementById("to-city").value = t.city; document.getElementById("to-state").value = t.st; document.getElementById("to-zip").value = t.zip; }
  }
  const notes = document.getElementById("cs-notes");
  notes.addEventListener("input", () => (document.getElementById("cs-count").textContent = notes.value.length));

  // Best-practice prefills: ~1-week pickup window, up to 2 weeks for delivery
  const fmt = (days) => {
    const dt = new Date(); dt.setDate(dt.getDate() + days);
    const p = (n) => String(n).padStart(2, "0");
    return dt.getFullYear() + "-" + p(dt.getMonth() + 1) + "-" + p(dt.getDate());
  };
  const dates = document.querySelectorAll(".cs-dates input");
  if (dates.length === 4) {
    dates[0].value = fmt(3);  dates[1].value = fmt(10); // pickup: one-week window
    dates[2].value = fmt(5);  dates[3].value = fmt(19); // delivery: two-week window
  }
  if (!notes.value) {
    notes.value = "Blanket wrap all pieces. Call 30 minutes before arrival. Delivery is room-of-choice — second-floor bedroom.";
    document.getElementById("cs-count").textContent = notes.value.length;
  }
})();

// Create a Listing: loading overlay, then the live listing page
(function () {
  const btn = document.getElementById("create-listing");
  if (!btn) return;
  btn.removeAttribute("data-next");
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const ov = document.createElement("div");
    ov.className = "load-overlay";
    ov.innerHTML = '<div class="load-spinner"></div><p>Create a Listing</p>';
    document.body.appendChild(ov);
    setTimeout(() => (location.href = "listing.html"), 1800);
  });
})();

// Listing page: populate from the stored shipment
(function () {
  if (!document.body.classList.contains("lp-page")) return;
  if (!document.getElementById("lp-pickup-dates")) return; // not the listing page itself
  let d = null;
  try { d = JSON.parse(sessionStorage.getItem("uship_demo_shipment")); } catch (e) {}
  const fmt = (dt) => (dt.getMonth() + 1) + "/" + dt.getDate();
  const today = new Date();
  const plus = (n) => { const x = new Date(today); x.setDate(x.getDate() + n); return x; };
  document.getElementById("lp-pickup-dates").textContent = fmt(today) + " - " + fmt(plus(1));
  document.getElementById("lp-delivery-dates").textContent = fmt(plus(12)) + " - " + fmt(plus(13));
  document.getElementById("lp-listed").textContent =
    today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (!d) return;
  document.title = d.title + " — uShip";
  document.getElementById("lp-title").textContent = d.title;
  document.getElementById("lp-desc").textContent = d.title;
  const price = parseFloat(d.price || "312.8");
  document.getElementById("lp-offer").textContent = Math.round(price);
  document.getElementById("lp-offer-short").textContent = String(Math.round(price * 10) / 10);
  document.getElementById("lp-weight").textContent = Math.round(d.weight) + " lbs";
  document.getElementById("lp-from-addr").innerHTML = "34<br>" + d.from + " US<br>Residence / Home Business";
  document.getElementById("lp-to-addr").innerHTML = "234<br>" + d.to + " US<br>Residence / Home Business";
  if (d.items && d.items.length) {
    document.getElementById("lp-qty").textContent =
      d.items.reduce((n, it) => n + (parseInt(it.qty, 10) || 1), 0);
    document.getElementById("lp-items").innerHTML = d.items.map((it, i) =>
      '<p class="lp-detail-title"' + (i ? ' style="margin-top:20px"' : "") + ">Item " + (i + 1) + ": " + it.name + "</p>" +
      '<div class="lp-kv-grid">' +
      "<div><h5>Weight</h5><p>" + Math.round(parseFloat(it.wgt) || 0) + " " + it.wunit + "</p></div>" +
      "<div><h5>Quantity</h5><p>" + it.qty + "</p></div>" +
      "<div><h5>Dimensions</h5><p>" + parseFloat(it.l) + " x " + parseFloat(it.w) + " x " + parseFloat(it.h) + " " + it.unit + "</p></div>" +
      "</div>").join("");
  }
  // Driving-distance estimate: straight line x 1.127 road factor
  const Z = { 787: [30.27, -97.74], 786: [30.27, -97.74], 871: [35.08, -106.65], 752: [32.78, -96.8],
    770: [29.76, -95.37], 100: [40.71, -74.01], 606: [41.88, -87.63], "021": [42.36, -71.06],
    331: [25.76, -80.19], 303: [33.75, -84.39], 900: [34.05, -118.24], 941: [37.77, -122.42],
    802: [39.74, -104.99], 850: [33.45, -112.07], 980: [47.61, -122.33] };
  const pz = (s) => { const m = (s || "").match(/(\d{5})/); return m ? Z[m[1].slice(0, 3)] : null; };
  const a = pz(d.from), b = pz(d.to);
  if (a && b) {
    const r = Math.PI / 180, R = 3958.8;
    const s = Math.sin(((b[0] - a[0]) * r) / 2) ** 2 +
      Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(((b[1] - a[1]) * r) / 2) ** 2;
    const mi = 2 * R * Math.asin(Math.sqrt(s)) * 1.127;
    document.getElementById("lp-miles").textContent = Math.round(mi) + " mi.";
  }
})();

// Listing tabs + quote card values
(function () {
  if (!document.body.classList.contains("lp-page")) return;
  if (!document.querySelector(".lp-tabs")) return; // not the listing page itself
  const tabs = document.querySelectorAll(".lp-tabs a[data-tab]");
  function show(name) {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    document.querySelectorAll(".lp-pane").forEach((p) => (p.hidden = p.id !== "tab-" + name));
  }
  tabs.forEach((t) => t.addEventListener("click", (e) => { e.preventDefault(); show(t.dataset.tab); }));
  if (location.hash === "#quotes") show("quotes");
  document.querySelectorAll("[data-tab-link]").forEach((a) =>
    a.addEventListener("click", (e) => { e.preventDefault(); show(a.dataset.tabLink); window.scrollTo({ top: 0 }); }));

  let d = null;
  try { d = JSON.parse(sessionStorage.getItem("uship_demo_shipment")); } catch (e) {}
  const quote = Math.round(parseFloat((d && d.price) || "454"));
  const feeExact = parseFloat((d && d.fee) || "34.05");
  const fee = Math.round(feeExact);
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set("lp-offer", quote); set("lp-fee", feeExact.toFixed(2)); set("lp-total", (quote + feeExact).toFixed(2));
  set("lp-offer-short", quote);
  set("q-amount", quote); set("q-b-quote", quote); set("q-b-fee", feeExact.toFixed(2)); set("q-b-total", (quote + feeExact).toFixed(2));
  const today = new Date();
  const plus = (n) => { const x = new Date(today); x.setDate(x.getDate() + n); return x; };
  const md = (dt) => dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const mdy = (dt) => dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  set("q-pickup", md(today) + " - " + md(plus(1)));
  set("q-tf-pickup", "Estimated " + mdy(today));
  set("q-tf-delivery", "Estimated " + mdy(plus(12)));
  set("q-placed", today.toLocaleDateString("en-US") + " 9:07 AM CST");
  set("qq-date", today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + ", 10:42 AM");
})();

// Quote tab: additional carrier quotes + show/hide toggles
(function () {
  if (!document.body.classList.contains("lp-page")) return;
  const pane = document.getElementById("tab-quotes");
  if (!pane) return;
  // Always mirror the price breakdown already rendered on the page
  const base = parseInt(document.getElementById("lp-offer").textContent, 10) || 454;
  const feeStr = document.getElementById("lp-fee").textContent || "34.05";
  const totalStr = document.getElementById("lp-total").textContent || "488.05";
  const today = new Date();
  const plus = (n) => { const x = new Date(today); x.setDate(x.getDate() + n); return x; };
  const md = (dt) => dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const mdy = (dt) => dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const CARRIERS = [
    { name: "Lone Star Logistics", initials: "LL", stars: 4,   reviews: 312,  bump: 0,
      fb: 640, pos: "93%", cancel: "12%", qs: 0, vehicle: "Box Truck", pickupOffset: 1, delOffset: 13,
      note: "Howdy! Family-owned carrier running weekly routes between Texas and the Southwest. Quote includes blanket-wrap protection and room-of-choice placement. We send photo updates at pickup and delivery. - Dale, Lone Star Logistics" },
    { name: "White Glove Express", initials: "WG", stars: 5,   reviews: 1204, bump: 0,
      fb: 980, pos: "99%", cancel: "2%",  qs: 0, vehicle: "Sprinter Van", pickupOffset: 0, delOffset: 11,
      note: "Hello! We specialize exclusively in white-glove furniture delivery with a two-person crew on every job. Full blanket wrap, floor protection, and placement in your room of choice are always included. Fully equipped for stairs and tight corners. - Maria, White Glove Express" },
    { name: "Rocky Mountain Movers", initials: "RM", stars: 4, reviews: 96,   bump: 0,
      fb: 410, pos: "91%", cancel: "8%",  qs: 0, vehicle: "26' Box Truck", pickupOffset: 2, delOffset: 14,
      note: "Hi there - we have a truck heading through your corridor this week with space available. Price includes residential pickup and delivery with liftgate. Happy to answer any questions about our equipment or insurance. - Pete, Rocky Mountain Movers" },
  ];

  const star = (n) => {
    let s = "";
    for (let i = 0; i < 5; i++) {
      if (i < n) s += '<img src="assets/figma/star-whole.svg" alt="">';
      else if (i < n + 0.75 && n % 1) s += '<img src="assets/figma/star-half.svg" alt="">';
      else s += '<img src="assets/figma/star-whole.svg" alt="" style="opacity:.25">';
    }
    return s;
  };

  CARRIERS.forEach((c) => {
    const price = base + c.bump;
    const card = document.createElement("div");
    card.className = "lp-card q-card";
    card.style.marginTop = "20px";
    card.innerHTML = `
      <div class="q-head">
        <div class="q-carrier">
          <span class="q-avatar">${c.initials}</span>
          <div>
            <p class="q-name">${c.name}</p>
            <p class="q-stars">${star(c.stars)}<a href="#">(${c.reviews.toLocaleString()})</a></p>
          </div>
        </div>
        <div class="q-service">
          <p class="q-service-type">Blanket Wrap</p>
          <p><strong>Estimated Pickup</strong><br>${md(plus(c.pickupOffset))} - ${md(plus(c.pickupOffset + 1))}</p>
        </div>
        <div class="q-price-box">
          <p class="q-amount"><sup>$</sup><span>${price}</span></p>
          <div class="q-btns">
            <a class="q-accept" href="#">Accept</a>
            <a class="q-decline" href="#">Decline</a>
          </div>
        </div>
      </div>
      <div class="q-stats">
        <span><img src="assets/figma/m-star.svg" alt=""> ${c.fb}<small>Feedback Score</small></span>
        <span><img src="assets/figma/m-check.svg" alt=""> ${c.pos}<small>Positive Feedback</small></span>
        <span><img src="assets/figma/m-xsquare.svg" alt=""> ${c.cancel}<small>Cancel Rate</small></span>
        <span class="q-stats-div"></span>
        <span><img src="assets/figma/m-message.svg" alt=""> ${c.qs}<small>Questions</small></span>
        <a class="q-hide" href="#">Show Quote Details</a>
      </div>
      <div class="q-detail" hidden>
        <nav class="q-tabs">
          <a href="#" class="active" data-qtab="details">Quote Details</a>
          <a href="#" data-qtab="questions">Quote Questions</a>
        </nav>
        <div class="q-pane" data-qpane="details">
        <div class="q-detail-grid">
          <div>
            <h5 class="lp-label">Time Frame</h5>
            <p class="q-tf">Pickup: <strong>Estimated ${mdy(plus(c.pickupOffset))}</strong></p>
            <p class="q-tf">Delivery: <strong>Estimated ${mdy(plus(c.delOffset))}</strong></p>
            <div class="q-breakdown">
              <h5 class="lp-label">Breakdown</h5>
              <div class="q-row"><span class="lp-label">Quote</span><strong>$${price}</strong></div>
              <div class="q-row"><span class="lp-label">uShip Fee</span><strong>$${feeStr}</strong></div>
              <div class="q-row q-row-total"><span class="lp-label">Total</span><strong>$${totalStr}</strong></div>
            </div>
            <h5 class="lp-label q-sp">Additional Payment Terms</h5>
            <p class="q-val">At Delivery</p>
            <h5 class="lp-label q-sp">Payment Accepted</h5>
            <p class="q-val">uShip Payments</p>
            <h5 class="lp-label q-sp">Vehicle Type</h5>
            <p class="q-val">${c.vehicle}</p>
            <h5 class="lp-label q-sp">Service Type</h5>
            <p class="q-val">Blanket Wrap</p>
          </div>
          <div>
            <p class="q-meta">Quote Placed ${today.toLocaleDateString("en-US")} ${9 + c.pickupOffset}:${15 + (c.fb % 40)} AM CST<br>Quote ID: ${1234568 + c.fb}</p>
            <h5 class="lp-label q-sp">Note to Shipping Customer</h5>
            <p class="q-note">${c.note}</p>
            <a class="q-terms" href="#">View ${c.name}' Terms &amp; Conditions</a>
          </div>
        </div>
        </div>
        <div class="q-pane" data-qpane="questions" hidden>
          <p class="qq-empty">No questions from this carrier yet.</p>
        </div>
      </div>`;
    pane.appendChild(card);
  });

  // Show/Hide quote details toggles + inner Quote Details/Questions tabs
  pane.addEventListener("click", (e) => {
    const qt = e.target.closest(".q-tabs a");
    if (qt) {
      e.preventDefault();
      const detail = qt.closest(".q-detail");
      detail.querySelectorAll(".q-tabs a").forEach((a) => a.classList.toggle("active", a === qt));
      detail.querySelectorAll(".q-pane").forEach((p) => (p.hidden = p.dataset.qpane !== qt.dataset.qtab));
      return;
    }
    const t = e.target.closest(".q-hide");
    if (!t) return;
    e.preventDefault();
    const detail = t.closest(".q-card").querySelector(".q-detail");
    detail.hidden = !detail.hidden;
    t.textContent = detail.hidden ? "Show Quote Details" : "Hide Quote Details";
  });

  // Counts: 4 quotes now
  document.querySelector('[data-tab="quotes"] .lp-badge').textContent = "4";
  const watchQuote = document.querySelector(".lp-watch div:last-child strong");
  if (watchQuote) watchQuote.textContent = "4";
})();

// Accepting a quote -> checkout
(function () {
  const pane = document.getElementById("tab-quotes");
  if (!pane) return;
  pane.addEventListener("click", (e) => {
    const btn = e.target.closest(".q-accept");
    if (!btn) return;
    e.preventDefault();
    const card = btn.closest(".q-card");
    const price = parseInt(card.querySelector(".q-amount span").textContent, 10);
    const carrier = card.querySelector(".q-name").textContent;
    try {
      sessionStorage.setItem("uship_demo_quote", JSON.stringify({ carrier, price, fee: Math.round(price * 0.108) }));
    } catch (err) {}
    location.href = "checkout.html";
  });
})();

// Checkout page (Figma 958:4213)
(function () {
  if (!document.body.classList.contains("co-page")) return;
  if (!document.getElementById("co-agree")) return; // not the checkout page itself
  let d = null, q = null;
  try {
    d = JSON.parse(sessionStorage.getItem("uship_demo_shipment"));
    q = JSON.parse(sessionStorage.getItem("uship_demo_quote"));
  } catch (e) {}
  const price = q ? q.price : 313;
  const fee = q ? q.fee : 34;
  if (d) document.getElementById("co-shipment").textContent = `${d.title}, ${d.from} to ${d.to}`;

  const protOn = () => document.querySelector("#opt-protect input").checked;
  function protCost() {
    const v = parseInt(document.getElementById("co-value").value, 10) || 0;
    return Math.max(50, Math.round(v * 0.5));
  }
  function update() {
    const on = protOn();
    document.getElementById("co-prot-row").style.display = on ? "" : "none";
    document.getElementById("co-value-wrap").style.opacity = on ? "1" : ".45";
    document.getElementById("co-value").disabled = !on;
    const prot = on ? protCost() : 0;
    document.getElementById("co-price").textContent = price;
    document.getElementById("co-fee").textContent = fee;
    document.getElementById("co-prot").textContent = prot;
    document.getElementById("co-total").textContent = price + fee + prot;
    const refundEl = document.getElementById("co-refund");
    if (refundEl) refundEl.textContent = (price + prot).toFixed(2);
    document.querySelectorAll(".co-radio-card").forEach((c) =>
      c.classList.toggle("selected", c.querySelector("input").checked));
    const agreed = document.getElementById("co-agree").checked;
    const book = document.getElementById("co-book");
    book.classList.toggle("enabled", agreed);
    if (agreed) book.removeAttribute("aria-disabled");
    else book.setAttribute("aria-disabled", "true");
  }
  document.querySelectorAll(".co-radio-card input, #co-agree").forEach((el) => el.addEventListener("change", update));
  document.getElementById("co-value").addEventListener("input", update);
  update();
  document.getElementById("co-book").addEventListener("click", (e) => {
    e.preventDefault();
    if (!document.getElementById("co-agree").checked) return;
    const prot = protOn() ? protCost() : 0;
    try {
      sessionStorage.setItem("uship_demo_booking", JSON.stringify({ price, fee, prot, total: price + fee + prot }));
    } catch (err) {}
    location.href = "booked.html";
  });
})();

// Booking confirmation page (Figma 1542:4134)
(function () {
  if (!document.body.classList.contains("bk-page")) return;
  let d = null, q = null, b = null;
  try {
    d = JSON.parse(sessionStorage.getItem("uship_demo_shipment"));
    q = JSON.parse(sessionStorage.getItem("uship_demo_quote"));
    b = JSON.parse(sessionStorage.getItem("uship_demo_booking"));
  } catch (e) {}
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  if (d) {
    set("bk-title", d.title);
    document.title = "Shipment Booked — uShip";
    const pc = (s) => { const m = (s || "").match(/^(.*?),\s*([A-Z]{2})\s+(\d{5})/); return m ? `${m[1]}, ${m[2]}, ${m[3]}` : s; };
    document.getElementById("bk-pickup").innerHTML = "9907 Denali RD NE<br>" + pc(d.from);
    document.getElementById("bk-delivery").innerHTML = "2114 Juniper Hill RD<br>" + pc(d.to);
  }
  const today = new Date();
  const plus = (n) => { const x = new Date(today); x.setDate(x.getDate() + n); return x; };
  const mdy = (dt) => (dt.getMonth() + 1 + "").padStart(2, "0") + "/" + (dt.getDate() + "").padStart(2, "0") + "/" + dt.getFullYear();
  set("bk-timeframe", `Between ${mdy(today)} and ${mdy(plus(3))}`);
  if (q) {
    set("bk-carrier", q.carrier);
    const initials = q.carrier.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    set("bk-carrier-avatar", q.carrier.startsWith("A+") ? "A+" : initials);
    set("bk-email", q.carrier.toLowerCase().replace(/[^a-z]/g, "") + "@xyz.com");
  }
  if (b) {
    set("bk-price", b.price); set("bk-fee", b.fee);
    set("bk-prot", b.prot); set("bk-total", b.total);
    document.getElementById("bk-prot-row").style.display = b.prot ? "" : "none";
  }
})();

// Contact Information drawer
(function () {
  const drawer = document.getElementById("contact-drawer");
  if (!drawer) return;
  const overlay = document.getElementById("drawer-overlay");
  function open(e) {
    if (e) e.preventDefault();
    drawer.hidden = false; overlay.hidden = false;
    requestAnimationFrame(() => drawer.classList.add("open"));
    document.body.style.overflow = "hidden";
  }
  function close() {
    drawer.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => { drawer.hidden = true; overlay.hidden = true; }, 250);
  }
  document.querySelectorAll(".open-contact").forEach((a) => a.addEventListener("click", open));
  overlay.addEventListener("click", close);
  document.getElementById("drawer-close").addEventListener("click", close);
  document.getElementById("drawer-cancel").addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !drawer.hidden) close(); });
  document.getElementById("drawer-save").addEventListener("click", () => {
    const v = [...drawer.querySelectorAll(".drawer-input")].map((i) => i.value.trim());
    const from = document.getElementById("lp-from-addr");
    const to = document.getElementById("lp-to-addr");
    const keep = (el) => el.innerHTML.split("<br>").slice(-2).join("<br>");
    const nameFrom = v[0], nameTo = v[4];
    from.innerHTML = (nameFrom ? `<strong>${nameFrom}</strong><br>` : "") + `${v[2]} ${v[3]}<br>` + keep(from);
    to.innerHTML = (nameTo ? `<strong>${nameTo}</strong><br>` : "") + `${v[6]} ${v[7]}<br>` + keep(to);
    if (nameFrom && nameTo) {
      const b = document.getElementById("step-contact");
      b.classList.add("done");
      b.innerHTML = "&#10003;";
    }
    close();
  });
})();

// Carrier name / review links on quote cards -> carrier profile
(function () {
  const pane = document.getElementById("tab-quotes");
  if (!pane) return;
  pane.addEventListener("click", (e) => {
    const link = e.target.closest(".q-name, .q-stars a");
    if (!link) return;
    e.preventDefault();
    const name = link.closest(".q-card").querySelector(".q-name").textContent;
    location.href = "carrier-profile.html?carrier=" + encodeURIComponent(name);
  });
  document.querySelectorAll(".q-name").forEach((n) => (n.style.cursor = "pointer"));
})();

// Carrier profile page
(function () {
  if (!document.body.classList.contains("cp-page")) return;
  const PROFILES = {
    "A+ Movers": { initials: "A+", rating: "4.7", reviews: "728", trucks: 4, drivers: 4, years: 15,
      completed: 91, total: "1,409", since: 2011, cancel: "3%",
      about: "A+ Movers is a family-owned transport company specializing in white-glove furniture delivery for the past 15 years. Our fleet consists of fully equipped sprinter vans and box trucks with blanket-wrap, straps, and liftgates. Every shipment is handled by a trained two-person crew, and we send photo updates at pickup and delivery." },
    "Lone Star Logistics": { initials: "LL", rating: "4.1", reviews: "312", trucks: 6, drivers: 8, years: 9,
      completed: 64, total: "890", since: 2017, cancel: "12%",
      about: "Lone Star Logistics runs weekly routes between Texas and the Southwest. We are a family-owned carrier focused on reliable, friendly household goods transport with blanket-wrap protection on every job." },
    "White Glove Express": { initials: "WG", rating: "5.0", reviews: "1,204", trucks: 12, drivers: 18, years: 11,
      completed: 212, total: "3,340", since: 2015, cancel: "2%",
      about: "White Glove Express specializes exclusively in premium white-glove furniture delivery. A two-person crew on every job, full blanket wrap, floor protection, and room-of-choice placement are always included." },
    "Rocky Mountain Movers": { initials: "RM", rating: "4.2", reviews: "96", trucks: 3, drivers: 3, years: 5,
      completed: 38, total: "214", since: 2021, cancel: "8%",
      about: "Rocky Mountain Movers covers the mountain west corridor with weekly capacity. Residential pickup and delivery with liftgate service on every shipment, fully insured." },
  };
  const name = new URLSearchParams(location.search).get("carrier") || "A+ Movers";
  const p = PROFILES[name] || PROFILES["A+ Movers"];
  document.title = name + " — uShip";
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set("cp-name", name); set("cp-name-side", name);
  set("cp-avatar", p.initials); set("cp-rating", p.rating);
  set("cp-reviews", p.reviews); set("cp-reviews2", p.reviews);
  set("cp-reviews3", String(Math.max(1, parseInt(p.reviews.replace(/,/g, ""), 10) - 100)));
  set("cp-trucks", p.trucks); set("cp-drivers", p.drivers); set("cp-years", p.years);
  set("cp-completed", p.completed); set("cp-total-ships", p.total);
  set("cp-since", p.since); set("cp-cancel", p.cancel);
  document.getElementById("cp-about").firstChild.textContent = p.about + " ";
  document.getElementById("cp-terms-link").textContent = `View ${name}'s Terms and Conditions`;

  const REVIEWS = [
    ["Sanford R.", "7 items for transport", "Friendly, flexible, professional. Definitely use again!", 5],
    ["Kara W.", "5 items for transport", "Quick and professional pick up and delivery!", 5],
    ["Tom M.", "Public Sale Auction House", "Good communication, very nice guy, pleasure to work with. Thank you!", 5],
    ["Hue H.", "Large painting", "I couldn't be happier with this seamless delivery process. There was a mix up with the dates and it was resolved without issue. My client worked with this gentleman in the past and also had a great experience. I will definitely be looking to work with them again in the future.", 4],
    ["Rod S.", "Leather chair", "Great company. True professional from start to finish. Even sent me photos to confirm item. 5 star dude.", 5],
    ["Christine D.", "Chair", "Excellent service! Timely delivery, great communication. Thank you!", 5],
    ["Kristin A.", "3 items for transport", "Positive experience all around! Will 100% book again.", 5],
    ["Diane K.", "Wine Rack", "GREAT SERVICE AND COMMUNICATION!", 5],
  ];
  const today = new Date();
  const list = document.getElementById("cp-review-list");
  list.innerHTML = REVIEWS.map((r, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (i * 11 + 3));
    const date = (d.getMonth() + 1) + "/" + d.getDate() + "/" + String(d.getFullYear()).slice(2);
    return `<div class="cp-review">
      <span class="r-date">${date}</span>
      <p class="r-name">${r[0]}</p>
      <p class="r-stars">${"\u2605".repeat(r[3])}${"\u2606".repeat(5 - r[3])}</p>
      <h4>${r[1]}</h4>
      <p class="r-text">${r[2]}</p>
      <div class="r-foot">
        <span><a href="#">Response (0)</a> &nbsp;|&nbsp; <a href="#">Share</a></span>
        <span class="r-helpful">Was This Review Helpful?
          <a href="#"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#757575" stroke-width="2"><path d="M7 10v11H3V10h4zm0 1l5-8c1.5 0 2.5 1 2.5 2.5L13.5 10H20a2 2 0 0 1 2 2.3l-1.2 6.2A3 3 0 0 1 17.8 21H7"/></svg> 0</a>
          <a href="#"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#757575" stroke-width="2" style="transform:rotate(180deg)"><path d="M7 10v11H3V10h4zm0 1l5-8c1.5 0 2.5 1 2.5 2.5L13.5 10H20a2 2 0 0 1 2 2.3l-1.2 6.2A3 3 0 0 1 17.8 21H7"/></svg> 0</a>
        </span>
      </div>
    </div>`;
  }).join("");
})();

// ============================================
// Guided tour (for prospect demos)
// ============================================
(function () {
  const PAGE = location.pathname.split("/").pop() || "index.html";
  const signedIn = (() => { try { return !!localStorage.getItem("uship_demo_user"); } catch (e) { return false; } })();
  const T = {
    get: () => { try { return sessionStorage.getItem("uship_tour"); } catch (e) { return null; } },
    set: (v) => { try { sessionStorage.setItem("uship_tour", v); } catch (e) {} },
  };

  // sel: element to highlight; text: tooltip copy; click: advance when the user
  // clicks the target (vs a Next button); ihd: purple accent
  const TOURS = {
    "index.html:out": [
      { sel: ".header-auth a[href='signin.html']", text: "Everything starts at uShip.com. Click Sign In — the demo account is already filled in for you.", click: true },
    ],
    "signin.html": [
      { sel: ".auth-submit", text: "Credentials are pre-filled for this demo. Just click Sign in.", click: true },
    ],
    "shipments.html": [
      { sel: ".badge-ihd", text: "You're signed in as an In-Home Delivery member \u2014 this badge follows you through the experience.", ihd: true },
      { sel: ".ms-empty", text: "This is My Shipments \u2014 every listing you create lives here with live status tracking. It's empty for now, so let's fix that." },
      { sel: ".ms-ship-btn", text: "Click Start a New Shipment to get going.", click: true },
    ],
    "index.html:in": [
      { sel: ".badge-ihd", text: "You're signed in as an In-Home Delivery member — this badge follows you through the experience.", ihd: true },
      { sel: ".hero-cta .btn-primary", text: "Let's ship something. Click Get Shipping Quotes.", click: true },
    ],
    "new-shipment.html": [
      { sel: ".ns-section:last-of-type .ns-section-head", text: "This is the General Marketplace — every category of big-and-bulky shipping, open to all shippers." },
      { sel: ".ihd-card", text: "As an IHD member, you also get a private network of approved white-glove carriers.", ihd: true },
      { sel: ".btn-ihd", text: "Click Start an IHD Shipment to begin.", click: true },
    ],
    "household-items.html": [
      { sel: ".hh-ihd-card", text: "Household items can also route into the IHD network from here — this purple tile is the members-only path.", ihd: true, click: true },
    ],
    "list-shipment.html": [
      { sel: ".ls-item", text: "We've prefilled a 5-drawer dresser \u2014 change the size, weight, or quantity and the price updates instantly." },
      { sel: ".ls-locations", text: "Add pickup and delivery ZIP codes — try 78728 to 87111. We'll resolve the cities for you." },
      { sel: ".ls-est-box", text: "The estimate computes instantly from size, weight, and real distance — no waiting on rates." },
      { sel: "#ls-continue", text: "Everything's filled in, so Continue is ready \u2014 click it.", click: true },
    ],
    "confirm-shipment.html": [
      { sel: ".cs-summary", text: "Your shipment and price carry over automatically." },
      { sel: ".cs-section:nth-of-type(1)", text: "Best practice: give carriers a window — about one week for pickup and two for delivery. We've prefilled ideal dates. Flexible dates help carriers fit you into their routes." },
      { sel: ".cs-section:nth-of-type(2)", text: "No exact address yet? No problem — you can continue with just city and ZIP and add the street address once the listing is live." },
      { sel: ".cs-section:nth-of-type(4)", text: "Blanket Wrap comes pre-selected — it's the standard for In-Home Delivery.", ihd: true },
      { sel: ".cs-section:nth-of-type(5)", text: "Pro tip: listings with photos get booked faster, and special instructions — stairs, call-ahead, fragile pieces — help carriers quote accurately. We've added an example." },
      { sel: "#create-listing", text: "Click Create a Listing to put this shipment in front of carriers.", click: true },
    ],
    "listing.html": [
      { sel: ".lp-success", text: "Your listing is live. These next steps track what's left to do." },
      { sel: ".lp-offer", text: "Your price breakdown, time left on the listing, and activity stats live here." },
      { sel: ".lp-details", text: "Everything carriers see about your shipment — items, dimensions, weight, and requested service types — lives in this recap." },
      { sel: "[data-tab='questions']", text: "Carriers can message you before you book. Open the Questions tab.", click: true },
      { sel: ".qa-card", text: "Threaded Q&A keeps the conversation on uShip — reply to carriers right from your listing." },
      { sel: "[data-tab='quotes']", text: "Carriers have already quoted. Open the Quote tab.", click: true },
      { sel: ".q-card .q-name", text: "Compare carriers \u2014 click a carrier's name to see their full profile and reviews.", click: true, resumeAt: 7 },
      { sel: ".q-accept", text: "Ready to book? Click Accept on a quote.", click: true },
    ],
    "carrier-profile.html": [
      { sel: ".cp-side", text: "Every carrier has a public profile \u2014 rating, verified business info, and how many shippers would use them again." },
      { sel: ".cp-stats", text: "Completed shipments and cancellation rate help you vet a carrier before you book." },
      { sel: ".cp-reviews-title", text: "Real reviews from shippers who have used this carrier." },
      { sel: ".cp-back", text: "Done looking? Head back to your quotes and accept one.", click: true },
    ],
    "checkout.html": [
      { sel: ".co-plan-card", text: "Shippers can add the uShip Protection Plan for covered items — recommended, and priced off the declared value." },
      { sel: "#co-agree", text: "Check the agreement box\u2026", click: true },
      { sel: "#co-book", text: "\u2026and click Complete Booking.", click: true },
    ],
    "booked.html": [
      { sel: ".bk-alert", text: "Booked! The shipper gets carrier contact info, a receipt, and post-booking tips." },
      { sel: ".bk-provider", text: "Direct line to the carrier from the moment of booking." },
      { modal: true, last: true },
    ],
  };

  const key = PAGE === "index.html" ? (signedIn ? "index.html:in" : "index.html:out") : PAGE;
  const steps = TOURS[key];

  function clearTip() {
    document.querySelectorAll(".tour-tip").forEach((t) => t.remove());
    document.querySelectorAll(".tour-ring").forEach((t) => t.classList.remove("tour-ring"));
  }

  function endTour() { clearTip(); T.set("done"); }

  function showStep(i) {
    clearTip();
    if (!steps || i >= steps.length) return;
    const s = steps[i];
    if (s.modal) {
      const ov = document.createElement("div");
      ov.className = "tour-welcome-overlay";
      ov.innerHTML = `
        <div class="tour-welcome">
          <img class="tour-rings" src="assets/figma/ihd-icon.svg" alt="">
          <h2>That's the full In-Home Delivery experience</h2>
          <p>From instant quote to booked with a white-glove carrier \u2014 in minutes.</p>
          <p>Thanks for exploring! Feel free to click around, or start over from the home page any time.</p>
          <button class="tour-start">Done</button>
        </div>`;
      document.body.appendChild(ov);
      ov.querySelector(".tour-start").addEventListener("click", () => { ov.remove(); endTour(); });
      return;
    }
    const el = document.querySelector(s.sel);
    if (!el) { showStep(i + 1); return; }
    el.classList.add("tour-ring");
    // Don't center-scroll targets taller than the viewport — pin their top instead
    const block = el.offsetHeight > window.innerHeight * 0.6 ? "start" : "center";
    el.scrollIntoView({ block, behavior: "smooth" });

    const tip = document.createElement("div");
    tip.className = "tour-tip" + (s.ihd ? " tour-tip-ihd" : "");
    tip.innerHTML =
      "<h4>" + (s.ihd ? "IHD Member Perk" : "uShip Demo Tour") + "</h4>" +
      "<p>" + s.text + "</p>" +
      '<div class="tour-tip-foot">' +
      '<span class="tour-tip-count">' + (i + 1) + " of " + steps.length + "</span>" +
      (s.click ? '<span class="tour-tip-action"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00902c" stroke-width="2" style="vertical-align:-2px;margin-right:4px"><path d="M4 4l7 16 2.5-6.5L20 11z" stroke-linejoin="round"/></svg>Click it to continue</span>'
        : s.last ? '<button class="tour-tip-next">Done</button>'
        : '<button class="tour-tip-next">Next</button>') +
      "</div>" +
      '<button class="tour-tip-skip">End tour</button>';
    document.body.appendChild(tip);

    // Position below (or above) the target
    requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      let top = r.bottom + window.scrollY + 14;
      let arrowTop = -7;
      if (r.bottom + th + 20 > window.scrollY + window.innerHeight && r.top - th - 14 > 0) {
        top = r.top + window.scrollY - th - 14;
        arrowTop = th - 7;
      }
      let left = r.left + window.scrollX + r.width / 2 - tw / 2;
      left = Math.max(12, Math.min(left, window.scrollX + document.documentElement.clientWidth - tw - 12));
      tip.style.top = top + "px";
      tip.style.left = left + "px";
      const arrow = document.createElement("div");
      arrow.className = "tour-tip-arrow";
      arrow.style.top = arrowTop + "px";
      arrow.style.left = Math.max(14, Math.min(r.left + r.width / 2 - left - 7, tw - 28)) + "px";
      tip.appendChild(arrow);
    });

    tip.querySelector(".tour-tip-skip").addEventListener("click", endTour);
    const next = tip.querySelector(".tour-tip-next");
    if (next) next.addEventListener("click", () => (s.last ? endTour() : showStep(i + 1)));
    if (s.click) el.addEventListener("click", () => {
      if (s.resumeAt != null) { try { sessionStorage.setItem("uship_tour_resume", PAGE + ":" + s.resumeAt); } catch (e) {} }
      setTimeout(() => showStep(i + 1), 150);
    }, { once: true });
  }

  function startTour() { T.set("on"); showStep(0); }

  // Welcome modal on the homepage (once per session)
  if (PAGE === "index.html" && !signedIn && !T.get()) {
    const ov = document.createElement("div");
    ov.className = "tour-welcome-overlay";
    ov.innerHTML = `
      <div class="tour-welcome">
        <img class="tour-rings" src="assets/figma/ihd-icon.svg" alt="">
        <h2>Thanks for taking a look at uShip In-Home Delivery</h2>
        <p>This is a clickable demo of the full shipper experience — from getting an instant quote to booking a white-glove carrier.</p>
        <p>We'll guide you through each step with quick tips along the way.</p>
        <button class="tour-start">Start the Tour</button>
        <button class="tour-later">Explore on my own</button>
      </div>`;
    document.body.appendChild(ov);
    ov.querySelector(".tour-start").addEventListener("click", () => { ov.remove(); startTour(); });
    ov.querySelector(".tour-later").addEventListener("click", () => { ov.remove(); T.set("done"); });
  } else if (T.get() === "on" && steps) {
    // Returning from a side trip (e.g. carrier profile): pick up where the tour left off
    let at = 0;
    try {
      const r = (sessionStorage.getItem("uship_tour_resume") || "").split(":");
      if (r[0] === PAGE) { at = parseInt(r[1], 10) || 0; sessionStorage.removeItem("uship_tour_resume"); }
    } catch (e) {}
    showStep(at);
  }
})();

// My Shipments: mobile status dropdown
document.getElementById("ms-cur-toggle")?.addEventListener("click", () => {
  document.getElementById("ms-tabs").classList.toggle("open");
});
