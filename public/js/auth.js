function getToken(){ return localStorage.getItem("token"); }
function setToken(t){ localStorage.setItem("token", t); }

if (getToken()) window.location.href = "/index.html";

let mode = "login"; // login | register

function $(id){ return document.getElementById(id); }
function setMsg(t){ $("msg").textContent = t || ""; }

function renderMode(){
  if (mode === "login"){
    $("formTitle").textContent = "Login";
    $("formSubtitle").textContent = "Sign in to create events and check weather.";
    $("cardTitle").textContent = "Sign In To Your Account";
    $("usernameWrap").style.display = "none";
    $("submitBtn").textContent = "Login";
    $("switchText").innerHTML = `No account? <b><a href="#" id="switchBtn">Create one</a></b>`;
  } else {
    $("formTitle").textContent = "Register";
    $("formSubtitle").textContent = "Create an account to manage your events.";
    $("cardTitle").textContent = "Create account";
    $("usernameWrap").style.display = "block";
    $("submitBtn").textContent = "Register";
    $("switchText").innerHTML = `Already have an account? <b><a href="#" id="switchBtn">Login</a></b>`;
  }

  document.getElementById("switchBtn").onclick = (e) => {
    e.preventDefault();
    setMsg("");
    mode = (mode === "login") ? "register" : "login";
    renderMode();
  };
}

async function safeJson(res){ try { return await res.json(); } catch { return {}; } }

async function postJSON(url, body){
  const res = await fetch(url, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(body)
  });
  const data = await safeJson(res);
  return { ok: res.ok, data };
}

$("submitBtn").onclick = async () => {
  setMsg("");
  const email = $("email").value.trim();
  const password = $("password").value;

  if (mode === "login"){
    const r = await postJSON("/api/auth/login", { email, password });
    if (!r.ok) return setMsg(r.data.message || "Login failed");
    setToken(r.data.token);
    window.location.href = "/index.html";
  } else {
    const username = $("username").value.trim();
    const r = await postJSON("/api/auth/register", { username, email, password });
    if (!r.ok) return setMsg(r.data.message || "Register failed");
    setToken(r.data.token);
    window.location.href = "/index.html";
  }
};

renderMode();

