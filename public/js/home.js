const API = "/api";

function getToken() { return localStorage.getItem("token"); }
function logout() { localStorage.removeItem("token"); window.location.href = "/index.html"; }

document.getElementById("btnLogout")?.addEventListener("click", logout);

document.getElementById("burgerBtn")?.addEventListener("click", () => {
  const menu = getToken() ? document.getElementById("navUser") : document.getElementById("navGuest");
  menu.classList.toggle("open");
});

function renderNav() {
  const token = getToken();
  document.getElementById("navGuest").style.display = token ? "none" : "flex";
  document.getElementById("navUser").style.display = token ? "flex" : "none";

  const btn = document.getElementById("btnCreateHome");
  btn.onclick = () => {
    if (!getToken()) window.location.href = "/auth.html";
    else window.location.href = "/events.html";
  };
}

function demoEvents() {
  const d = (days) => new Date(Date.now() + days * 86400000).toISOString();
  return [
    {
      title: "Shakira Live Night",
      type: "concert",
      date: d(2),
      location: "Astana",
      description: "A bright night with world hits and a big stage show.",
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=60"
    },
    {
      title: "AI & Backend Conference",
      type: "conference",
      date: d(3),
      location: "Almaty",
      description: "APIs, Node.js, databases and modern backend architecture.",
      imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=60"
    },
    {
      title: "City Sports Weekend",
      type: "sports",
      date: d(4),
      location: "Shymkent",
      description: "Friendly matches + fan zone + music.",
      imageUrl: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=60"
    },
    {
      title: "Jazz & Lights Evening",
      type: "concert",
      date: d(5),
      location: "Astana",
      description: "Live jazz, cozy atmosphere and evening lights.",
      imageUrl: "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=1200&q=60"
    }
  ];
}

async function safeJson(res){ try { return await res.json(); } catch { return {}; } }

const box = document.getElementById("homeEvents");

function imgSrc(ev){
  return ev.imageData || ev.imageUrl || "";
}

function renderEvents(list){
  box.innerHTML = "";
  list.slice(0, 12).forEach(ev => {
    const card = document.createElement("div");
    card.className = "card mini";
    const src = imgSrc(ev);

    card.innerHTML = `
      <div class="tag">${ev.type}</div>
      <h3>${ev.title}</h3>
      <div class="muted small">${new Date(ev.date).toLocaleString()} • ${ev.location}</div>
      ${src ? `<img class="event-img" src="${src}" alt="event image">` : ""}
      <p class="muted">${ev.description || ""}</p>
    `;
    box.appendChild(card);
  });
}

async function loadHomeEvents(){
  const token = getToken();
  if (!token) return renderEvents(demoEvents());

  box.innerHTML = `<div class="muted">Loading...</div>`;
  const res = await fetch(`${API}/events`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await safeJson(res);

  if (!res.ok) return renderEvents(demoEvents());
  renderEvents(data.length ? data : demoEvents());
}

document.getElementById("btnRefresh")?.addEventListener("click", loadHomeEvents);

renderNav();
loadHomeEvents();
