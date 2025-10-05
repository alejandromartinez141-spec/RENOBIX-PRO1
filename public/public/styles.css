const status = document.getElementById('status');

function setStatus(m, ok=true) {
  status.textContent = m;
  status.style.color = ok ? 'green' : 'crimson';
  setTimeout(()=> status.textContent = '', 4000);
}

document.getElementById('btnReg').addEventListener('click', async () => {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPass').value;
  if (!email || !password) return setStatus('Completa correo y contraseña', false);
  try {
    const r = await fetch('/api/register', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name,email,password})});
    const j = await r.json();
    if (!r.ok) return setStatus(j.message || 'Error', false);
    localStorage.setItem('rb_token', j.token);
    setStatus('Registrado y logeado');
    window.location = '/panel.html';
  } catch (e) { setStatus('Error de red', false); }
});

document.getElementById('btnLogin').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPass').value;
  if (!email || !password) return setStatus('Completa correo y contraseña', false);
  try {
    const r = await fetch('/api/login', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password})});
    const j = await r.json();
    if (!r.ok) return setStatus(j.message || 'Credenciales inválidas', false);
    localStorage.setItem('rb_token', j.token);
    setStatus('Login correcto');
    window.location = '/panel.html';
  } catch (e) { setStatus('Error de red', false); }
});
