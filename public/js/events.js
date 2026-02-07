const API = "/api";

function getToken(){ return localStorage.getItem("token"); }
function logout(){ localStorage.removeItem("token"); window.location.href="/index.html"; }

if (!getToken()) window.location.href = "/auth.html";

document.getElementById("btnLogout")?.addEventListener("click", logout);
document.getElementById("burgerBtn")?.addEventListener("click", () => {
  document.getElementById("navUser")?.classList.toggle("open");
});

async function safeJson(res){ try { return await res.json(); } catch { return {}; } }

const myList = document.getElementById("myEventsList");
const searchInput = document.getElementById("searchMy");

const editIdEl = document.getElementById("editId");
const formHeader = document.getElementById("formHeader");
const btnSave = document.getElementById("btnSave");
const btnCancel = document.getElementById("btnCancelEdit");

const okMsg = document.getElementById("okMsg");
const errMsg = document.getElementById("errMsg");

let myCache = [];

function clearMsgs(){
  okMsg.textContent = "";
  errMsg.textContent = "";
}

function imgSrc(ev){
  return ev.imageData || ev.imageUrl || "";
}

function fileToBase64(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setEditMode(on){
  if (on){
    formHeader.textContent = "Update event";
    btnSave.textContent = "Save";
    btnCancel.style.display = "inline-block";
  } else {
    formHeader.textContent = "Create event";
    btnSave.textContent = "Create";
    btnCancel.style.display = "none";
    editIdEl.value = "";
  }
}

function fillForm(ev){
  document.getElementById("evTitle").value = ev.title || "";
  document.getElementById("evType").value = ev.type || "concert";

  // datetime-local needs "YYYY-MM-DDTHH:mm"
  const dt = new Date(ev.date);
  const pad = (n) => String(n).padStart(2, "0");
  const local = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  document.getElementById("evDate").value = local;

  document.getElementById("evCity").value = ev.location || "";
  document.getElementById("evCapacity").value = ev.capacity ?? "";
  document.getElementById("evPrice").value = ev.price ?? 0;
  document.getElementById("evDesc").value = ev.description || "";
  document.getElementById("evImageUrl").value = ev.imageUrl || "";
  document.getElementById("evImageFile").value = "";
}

function resetForm(){
  document.getElementById("evTitle").value = "";
  document.getElementById("evType").value = "concert";
  document.getElementById("evDate").value = "";
  document.getElementById("evCity").value = "";
  document.getElementById("evCapacity").value = "";
  document.getElementById("evPrice").value = "0";
  document.getElementById("evDesc").value = "";
  document.getElementById("evImageUrl").value = "";
  document.getElementById("evImageFile").value = "";
}

function renderMy(list){
  myList.innerHTML = "";
  list.forEach(ev => {
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

      <div class="row actions">
        <button class="secondary" data-edit="${ev._id}">Update</button>
        <button class="secondary" data-weather="${ev._id}">Check weather</button>
        <button class="secondary" data-delete="${ev._id}">Delete</button>
      </div>

      <p class="muted small" id="w-${ev._id}"></p>
      <p class="msg" id="m-${ev._id}"></p>
    `;
    myList.appendChild(card);
  });
}

function applySearch(){
  const q = (searchInput.value || "").toLowerCase().trim();
  const filtered = q ? myCache.filter(e => (e.title || "").toLowerCase().includes(q)) : myCache;
  renderMy(filtered);
}
searchInput?.addEventListener("input", applySearch);

async function loadMy(){
  myList.innerHTML = `<div class="muted">Loading...</div>`;
  const res = await fetch(`${API}/events/my`, { headers: { Authorization: `Bearer ${getToken()}` }});
  const data = await safeJson(res);

  if (!res.ok){
    myList.innerHTML = "";
    return;
  }
  myCache = data;
  applySearch();
}

document.getElementById("btnReloadMy")?.addEventListener("click", loadMy);

btnCancel.addEventListener("click", () => {
  clearMsgs();
  setEditMode(false);
  resetForm();
});

btnSave.addEventListener("click", async () => {
  clearMsgs();

  const editId = editIdEl.value;

  const title = document.getElementById("evTitle").value;
  const type = document.getElementById("evType").value;
  const date = document.getElementById("evDate").value;
  const location = document.getElementById("evCity").value;
  const capacity = document.getElementById("evCapacity").value;
  const price = document.getElementById("evPrice").value;
  const description = document.getElementById("evDesc").value;

  const imageUrl = document.getElementById("evImageUrl").value.trim();
  const file = document.getElementById("evImageFile").files?.[0];

  let imageData = "";
  if (file) imageData = await fileToBase64(file);

  const body = { title, type, date, location, capacity, price, description, imageUrl, imageData };

  const url = editId ? `${API}/events/${editId}` : `${API}/events`;
  const method = editId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
    body: JSON.stringify(body)
  });
  const data = await safeJson(res);

  if (!res.ok){
    errMsg.textContent = data.message || "Save failed";
    return;
  }

  okMsg.textContent = editId ? "Event updated ✅" : "Event created ✅";

  setEditMode(false);
  resetForm();
  await loadMy();
});

myList.addEventListener("click", async (e) => {
  const edit = e.target.getAttribute("data-edit");
  const wid = e.target.getAttribute("data-weather");
  const did = e.target.getAttribute("data-delete");

  if (edit){
    clearMsgs();
    const ev = myCache.find(x => x._id === edit);
    if (!ev) return;
    editIdEl.value = edit;
    fillForm(ev);
    setEditMode(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (wid){
    const out = document.getElementById(`w-${wid}`);
    out.textContent = "Loading weather...";
    const res = await fetch(`${API}/events/${wid}/weather`, { headers: { Authorization:`Bearer ${getToken()}` }});
    const data = await safeJson(res);

    out.textContent = res.ok
      ? `Weather in ${data.location} (${data.forecastTime}): ${data.temperature}°C, ${data.description}`
      : (data.message || "Weather error");
    return;
  }

  if (did){
    const msg = document.getElementById(`m-${did}`);
    msg.textContent = "";

    const res = await fetch(`${API}/events/${did}`, { method:"DELETE", headers:{ Authorization:`Bearer ${getToken()}` }});
    const data = await safeJson(res);

    if (!res.ok){
      msg.textContent = data.message || "Delete failed";
      return;
    }
    await loadMy();
  }
});

setEditMode(false);
loadMy();

