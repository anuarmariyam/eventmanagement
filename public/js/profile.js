const API = "/api";

function getToken(){ return localStorage.getItem("token"); }
function logout(){ localStorage.removeItem("token"); window.location.href="/index.html"; }

if (!getToken()) window.location.href = "/auth.html";

document.getElementById("btnLogout")?.addEventListener("click", logout);
document.getElementById("burgerBtn")?.addEventListener("click", () => {
  document.getElementById("navUser")?.classList.toggle("open");
});

async function safeJson(res){ try { return await res.json(); } catch { return {}; } }

const msg = document.getElementById("profileMsg");
const list = document.getElementById("myEventsPreview");

function imgSrc(ev){
  return ev.imageData || ev.imageUrl || "";
}

async function loadProfile(){
  msg.textContent = "";
  const res = await fetch(`${API}/users/profile`, { headers:{ Authorization:`Bearer ${getToken()}` }});
  const data = await safeJson(res);

  if (!res.ok){ msg.textContent = data.message || "Profile error"; return; }

  document.getElementById("userName").textContent = data.username;
  document.getElementById("userEmail").textContent = data.email;
  document.getElementById("eventsCount").textContent = data.eventsCreated ?? 0;
}

async function loadMyPreview(){
  list.innerHTML = `<div class="muted">Loading...</div>`;
  const res = await fetch(`${API}/events/my`, { headers:{ Authorization:`Bearer ${getToken()}` }});
  const data = await safeJson(res);

  if (!res.ok){ list.innerHTML=""; return; }

  list.innerHTML = "";
  data.slice(0, 6).forEach(ev => {
    const card = document.createElement("div");
    card.className = "card mini";
    const src = imgSrc(ev);
    const priceText = (Number(ev.price || 0) <= 0) ? "Free" : `${ev.price} ₸`;

    card.innerHTML = `
      <div class="tag">${ev.type}</div>
      <h3>${ev.title}</h3>
      <div class="muted small">${new Date(ev.date).toLocaleString()} • ${ev.location} • <b>${priceText}</b></div>
      ${src ? `<img class="event-img" src="${src}" alt="event image">` : ""}
      <p class="muted">${ev.description || ""}</p>
    `;
    list.appendChild(card);
  });
}

/*Update profile (PUT /api/users/profile) */
const updUsername = document.getElementById("updUsername");
const updEmail = document.getElementById("updEmail");
const updPassword = document.getElementById("updPassword");
const updOk = document.getElementById("updOk");
const updErr = document.getElementById("updErr");

function clearUpdateMsgs(){
  updOk.textContent = "";
  updErr.textContent = "";
}

function clearUpdateInputs(){
  updUsername.value = "";
  updEmail.value = "";
  updPassword.value = "";
}

document.getElementById("btnClearUpdate")?.addEventListener("click", () => {
  clearUpdateMsgs();
  clearUpdateInputs();
});

document.getElementById("btnUpdateProfile")?.addEventListener("click", async () => {
  clearUpdateMsgs();

  const username = (updUsername.value || "").trim();
  const email = (updEmail.value || "").trim();
  const password = (updPassword.value || "");

  // send only fields that user filled
  const body = {};
  if (username) body.username = username;
  if (email) body.email = email;
  if (password) body.password = password;

  if (Object.keys(body).length === 0){
    updErr.textContent = "Fill at least one field to update.";
    return;
  }

  const res = await fetch(`${API}/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(body)
  });

  const data = await safeJson(res);

  if (!res.ok){
    updErr.textContent = data.message || "Update failed";
    return;
  }

  updOk.textContent = "Profile updated ✅";

  // If user changed email/password, they still stay logged in (token unchanged),
  // but to show fresh info we reload profile.
  clearUpdateInputs();
  await loadProfile();
});

loadProfile();
loadMyPreview();
