const routes = {
  "#/login": renderLogin,
  "#/onboarding": renderOnboarding,
  "#/dashboard": renderDashboard,
  "#/calendar": renderCalendar,
  "#/services": renderServices,
  "#/availability": renderAvailability,
  "#/clients": renderClients,
  "#/payments": renderPayments,
  "#/settings": renderSettings
};

const state = {
  business: {
    name: "Booklingio Studio",
    slug: "booklingio-demo",
    timezone: "America/New_York",
    currency: "USD",
    connectStatus: "Not connected",
    connectRequirements: "",
    balance: { available: 0, pending: 0 },
    payoutReady: false
  },
  services: [
    {
      id: "svc-1",
      name: "Signature cut",
      duration: 45,
      price: 6500,
      depositRequired: true,
      depositAmount: 2000,
      buffer: 10,
      active: true
    },
    {
      id: "svc-2",
      name: "Deluxe color",
      duration: 90,
      price: 14500,
      depositRequired: true,
      depositAmount: 5000,
      buffer: 15,
      active: true
    }
  ],
  bookings: [
    {
      id: "bk-1",
      client: "Jordan Lee",
      service: "Signature cut",
      start: "2024-05-18T10:00:00",
      status: "confirmed"
    },
    {
      id: "bk-2",
      client: "Maya Park",
      service: "Deluxe color",
      start: "2024-05-18T13:30:00",
      status: "pending"
    }
  ],
  payouts: [
    { id: "po-1", amount: 34000, date: "2024-05-12", status: "paid" },
    { id: "po-2", amount: 21000, date: "2024-05-05", status: "in_transit" }
  ]
};

const outlet = document.getElementById("route-outlet");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const modalTitle = document.getElementById("modal-title");
const drawer = document.getElementById("drawer");
const drawerBody = document.getElementById("drawer-body");
const drawerTitle = document.getElementById("drawer-title");
const toastStack = document.getElementById("toast-stack");
const themeToggle = document.getElementById("theme-toggle");

const api = {
  async get(url) {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
      throw new Error("Request failed");
    }
    return res.json();
  },
  async post(url, payload) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error("Request failed");
    }
    return res.json();
  }
};

function router() {
  const hash = window.location.hash || "#/dashboard";
  const matched = Object.keys(routes).find((route) => hash.startsWith(route));
  const render = routes[matched] || renderDashboard;
  render(hash);
  setActiveNav(hash);
}

function setActiveNav(hash) {
  document.querySelectorAll(".top-nav a, .sidebar-link").forEach((link) => {
    const href = link.getAttribute("href") || "";
    link.classList.toggle("active", hash.startsWith(href));
  });
}

function renderLogin() {
  outlet.innerHTML = `
    <section class="grid two">
      <div class="card">
        <p class="eyebrow">Welcome back</p>
        <h2>Log in to Booklingio</h2>
        <p class="muted">Manage bookings, payouts, and client requests.</p>
        <form class="grid" id="login-form">
          <label>Email <input type="email" required placeholder="you@studio.com" /></label>
          <label>Password <input type="password" required /></label>
          <button class="primary" type="submit">Continue</button>
          <button class="ghost" type="button" data-action="magic-link">Send magic link</button>
        </form>
      </div>
      <div class="card">
        <h3>Launch in minutes</h3>
        <ul class="grid">
          <li>Set up services + availability</li>
          <li>Share a booking link</li>
          <li>Collect deposits automatically</li>
        </ul>
      </div>
    </section>
  `;
}

function renderOnboarding() {
  outlet.innerHTML = `
    <section class="grid">
      <div class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Onboarding wizard</p>
            <h2>Launch Booklingio in 7 minutes</h2>
            <p class="muted">Set your business details, services, availability, and payouts.</p>
          </div>
          <span class="badge warning">Step 2 of 4</span>
        </div>
        <div class="grid two">
          <label>Business name<input id="business-name" value="${state.business.name}" /></label>
          <label>Timezone<select><option>${state.business.timezone}</option></select></label>
          <label>Currency<select><option>${state.business.currency}</option></select></label>
          <label>Booking link slug<input id="business-slug" value="${state.business.slug}" /></label>
        </div>
        <div class="grid two">
          <button class="primary" data-action="save-onboarding">Save & continue</button>
          <button class="ghost" data-action="preview-link">Preview booking page</button>
        </div>
      </div>
      <div class="card">
        <h3>Connect payouts</h3>
        <p class="muted">Stripe Connect Express enables automatic deposits and payouts.</p>
        <button class="primary" data-action="connect-stripe">Start Express onboarding</button>
        <p class="muted">Status: ${state.business.connectStatus}</p>
      </div>
    </section>
  `;
}

function renderDashboard() {
  outlet.innerHTML = `
    <section class="grid">
      <div class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Revenue</p>
            <h2>Today’s performance</h2>
            <p class="muted">Deposits and bookings synced with Stripe.</p>
          </div>
          <div>
            <select id="range-select">
              <option>Today</option>
              <option>This week</option>
              <option>This month</option>
            </select>
          </div>
        </div>
        <div class="grid two">
          <div class="kpi">
            <p class="eyebrow">Gross revenue</p>
            <h3>$3,240</h3>
            <p class="muted">+14% from last week</p>
          </div>
          <div class="kpi">
            <p class="eyebrow">Deposits collected</p>
            <h3>$840</h3>
            <p class="muted">2 pending payouts</p>
          </div>
          <div class="kpi">
            <p class="eyebrow">Outstanding</p>
            <h3>$420</h3>
            <p class="muted">Awaiting confirmation</p>
          </div>
          <div class="kpi">
            <p class="eyebrow">Avg booking value</p>
            <h3>$162</h3>
            <p class="muted">No-show rate 2%</p>
          </div>
        </div>
      </div>

      <div class="grid two">
        <div class="card">
          <div class="card-header">
            <div>
              <p class="eyebrow">Payout readiness</p>
              <h3>Stripe Connect status</h3>
            </div>
            <span class="badge ${state.business.payoutReady ? "success" : "warning"}">${state.business.connectStatus}</span>
          </div>
          <p class="muted">${state.business.connectRequirements || "Connect your bank account to receive payouts."}</p>
          <div class="grid two">
            <button class="primary" data-action="connect-stripe">Connect payouts</button>
            <button class="ghost" data-action="stripe-login">Manage payouts</button>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <div>
              <p class="eyebrow">Available balance</p>
              <h3>$${(state.business.balance.available / 100).toFixed(2)}</h3>
            </div>
            <div>
              <p class="eyebrow">Pending</p>
              <h3>$${(state.business.balance.pending / 100).toFixed(2)}</h3>
            </div>
          </div>
          <div class="grid">
            ${state.payouts
              .map(
                (payout) => `
                  <div class="badge">
                    ${payout.date} · $${(payout.amount / 100).toFixed(2)} · ${payout.status}
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Upcoming bookings</p>
            <h3>Next 48 hours</h3>
          </div>
          <button class="ghost" data-action="open-drawer">View all</button>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Service</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${state.bookings
              .map(
                (booking) => `
                  <tr>
                    <td>${booking.client}</td>
                    <td>${booking.service}</td>
                    <td>${new Date(booking.start).toLocaleString()}</td>
                    <td><span class="badge">${booking.status}</span></td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderCalendar() {
  outlet.innerHTML = `
    <section class="grid">
      <div class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Smart calendar</p>
            <h2>Week view</h2>
            <p class="muted">Prevent double-booking with slot-aware scheduling.</p>
          </div>
          <div class="grid two">
            <button class="ghost" data-action="calendar-week">Week</button>
            <button class="ghost" data-action="calendar-month">Month</button>
          </div>
        </div>
        <div class="calendar">
          <div class="calendar-grid">
            ${Array.from({ length: 7 })
              .map(
                (_, index) => `
                  <div class="calendar-day">
                    <p class="eyebrow">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</p>
                    <span class="slot">10:00 AM · Jordan Lee</span>
                    <span class="slot">1:30 PM · Maya Park</span>
                    <button class="outline" data-action="suggest-slot">Suggest slot</button>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderServices() {
  outlet.innerHTML = `
    <section class="grid">
      <div class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Services</p>
            <h2>Offerings & pricing</h2>
            <p class="muted">Toggle deposits and buffer time to protect your schedule.</p>
          </div>
          <button class="primary" data-action="add-service">New service</button>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Deposit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${state.services
              .map(
                (service) => `
                  <tr>
                    <td>${service.name}</td>
                    <td>${service.duration} min</td>
                    <td>$${(service.price / 100).toFixed(2)}</td>
                    <td>${service.depositRequired ? `$${(service.depositAmount / 100).toFixed(2)}` : "None"}</td>
                    <td><span class="badge">${service.active ? "Active" : "Paused"}</span></td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAvailability() {
  outlet.innerHTML = `
    <section class="grid two">
      <div class="card">
        <p class="eyebrow">Weekly availability</p>
        <h2>Set your hours</h2>
        <p class="muted">Apply lead time, buffer, and slot rounding rules.</p>
        <div class="grid two">
          <label>Lead time<select><option>2 hours</option></select></label>
          <label>Max days ahead<select><option>60 days</option></select></label>
          <label>Slot rounding<select><option>10 min</option></select></label>
          <label>Buffer time<select><option>10 min</option></select></label>
        </div>
        <button class="primary" data-action="save-availability">Save availability</button>
      </div>
      <div class="card">
        <p class="eyebrow">Date exceptions</p>
        <h3>Days off</h3>
        <div class="grid">
          <label>Date<input type="date" /></label>
          <label>Hours<select><option>Closed</option></select></label>
        </div>
        <button class="ghost" data-action="add-exception">Add exception</button>
      </div>
    </section>
  `;
}

function renderClients() {
  outlet.innerHTML = `
    <section class="grid">
      <div class="card">
        <div class="card-header">
          <div>
            <p class="eyebrow">Clients</p>
            <h2>Client profiles</h2>
            <p class="muted">Track spend, notes, and no-show count.</p>
          </div>
          <input type="search" placeholder="Search clients" />
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Bookings</th>
              <th>Spend</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Jordan Lee</td>
              <td>12</td>
              <td>$1,280</td>
              <td><span class="badge success">Active</span></td>
            </tr>
            <tr>
              <td>Maya Park</td>
              <td>4</td>
              <td>$520</td>
              <td><span class="badge warning">Review</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderPayments() {
  outlet.innerHTML = `
    <section class="grid two">
      <div class="card">
        <p class="eyebrow">Stripe Connect</p>
        <h2>Payouts & deposits</h2>
        <p class="muted">Connect your bank to receive payouts automatically.</p>
        <div class="badge ${state.business.payoutReady ? "success" : "warning"}">
          ${state.business.connectStatus}
        </div>
        <div class="grid">
          <button class="primary" data-action="connect-stripe">Connect payouts</button>
          <button class="ghost" data-action="stripe-login">Open Stripe Express</button>
        </div>
        <p class="muted">Never expose Stripe secret keys in the frontend.</p>
      </div>
      <div class="card">
        <p class="eyebrow">Recent payouts</p>
        <h3>$${(state.business.balance.available / 100).toFixed(2)} available</h3>
        <div class="grid">
          ${state.payouts
            .map(
              (payout) => `
                <div class="badge">
                  ${payout.date} · $${(payout.amount / 100).toFixed(2)} · ${payout.status}
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderSettings() {
  outlet.innerHTML = `
    <section class="grid two">
      <div class="card">
        <p class="eyebrow">Business profile</p>
        <h2>Booklingio Studio</h2>
        <div class="grid">
          <label>Business name<input value="${state.business.name}" /></label>
          <label>Custom booking link<input value="https://booklingio.app/#/book/${state.business.slug}" /></label>
          <label>Custom domain<input placeholder="studio.com" /></label>
        </div>
        <button class="primary" data-action="save-settings">Save changes</button>
      </div>
      <div class="card">
        <p class="eyebrow">Share</p>
        <h3>Client booking link</h3>
        <p class="muted">Copy or generate a QR code for your link.</p>
        <div class="grid two">
          <button class="ghost" data-action="copy-link">Copy link</button>
          <button class="ghost" data-action="show-qr">Generate QR</button>
        </div>
      </div>
    </section>
  `;
}

function renderAvailabilitySlots() {
  return ["10:00 AM", "10:30 AM", "11:00 AM", "1:00 PM"].map((slot) => `<span class="slot">${slot}</span>`).join("");
}

function renderPublicBooking(slug) {
  outlet.innerHTML = `
    <section class="grid two">
      <div class="card">
        <p class="eyebrow">Book ${slug}</p>
        <h2>Choose your service</h2>
        <div class="grid">
          ${state.services
            .map(
              (service) => `
                <button class="outline" data-action="select-service" data-service="${service.id}">
                  ${service.name} · $${(service.price / 100).toFixed(2)}
                </button>
              `
            )
            .join("")}
        </div>
      </div>
      <div class="card">
        <p class="eyebrow">Next available</p>
        <h3>Tuesday, May 21</h3>
        <div class="grid">${renderAvailabilitySlots()}</div>
        <button class="primary" data-action="start-booking">Continue to details</button>
      </div>
    </section>
  `;
}

function renderConfirm() {
  outlet.innerHTML = `
    <section class="card">
      <p class="eyebrow">Booking confirmed</p>
      <h2>You’re all set!</h2>
      <p class="muted">We’ve emailed your confirmation and deposit receipt.</p>
      <button class="ghost" data-action="download-ics">Add to calendar</button>
    </section>
  `;
}

function handleRoute(hash) {
  if (hash.startsWith("#/book/")) {
    const slug = hash.split("#/book/")[1];
    renderPublicBooking(slug || "your-booklingio-link");
    return;
  }

  if (hash.startsWith("#/confirm")) {
    renderConfirm();
    return;
  }

  router();
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastStack.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function openModal(title, content) {
  modalTitle.textContent = title;
  modalBody.innerHTML = content;
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
}

function openDrawer(title, content) {
  drawerTitle.textContent = title;
  drawerBody.innerHTML = content;
  drawer.classList.add("active");
  drawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  drawer.classList.remove("active");
  drawer.setAttribute("aria-hidden", "true");
}

function bindGlobalActions() {
  document.body.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.matches("[data-modal-close]")) {
      closeModal();
    }

    if (target.matches("[data-drawer-close]")) {
      closeDrawer();
    }

    if (target.dataset.action === "connect-stripe") {
      openModal(
        "Connect payouts",
        `<p class="muted">Redirecting to Stripe Connect Express onboarding...</p><button class="primary" id="connect-now">Create account link</button>`
      );
    }

    if (target.dataset.action === "stripe-login") {
      showToast("Stripe Express login link generated.");
    }

    if (target.dataset.action === "copy-link" || target.id === "quick-copy") {
      const link = `https://booklingio.app/#/book/${state.business.slug}`;
      navigator.clipboard?.writeText(link);
      showToast("Booking link copied.");
    }

    if (target.dataset.action === "show-qr") {
      openModal("QR code", `<div class="card"><p class="muted">QR code generator placeholder.</p></div>`);
    }

    if (target.dataset.action === "open-drawer") {
      openDrawer(
        "Upcoming bookings",
        `<div class="grid">${state.bookings
          .map(
            (booking) => `
              <div class="card">
                <p class="eyebrow">${booking.status}</p>
                <h3>${booking.client}</h3>
                <p class="muted">${booking.service} · ${new Date(booking.start).toLocaleString()}</p>
                <textarea placeholder="Private notes"></textarea>
                <button class="ghost">Reschedule</button>
              </div>
            `
          )
          .join("")}</div>`
      );
    }

    if (target.dataset.action === "preview-link") {
      window.location.hash = `#/book/${state.business.slug}`;
    }
  });

  themeToggle.addEventListener("click", () => {
    const root = document.documentElement;
    const isDark = root.getAttribute("data-theme") === "dark";
    if (isDark) {
      root.removeAttribute("data-theme");
      themeToggle.textContent = "Dark";
    } else {
      root.setAttribute("data-theme", "dark");
      themeToggle.textContent = "Light";
    }
  });
}

window.addEventListener("hashchange", () => handleRoute(window.location.hash));
window.addEventListener("load", () => handleRoute(window.location.hash));

bindGlobalActions();
