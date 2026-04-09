function _nlPost(email, name, onSuccess, onError) {
  fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, name: name })
  }).then(function(r) {
    return r.json().then(function(d) {
      if (r.ok) { onSuccess(); }
      else { onError(d.error || 'Error al procesar la solicitud'); }
    });
  }).catch(function() { onError('Error de conexión. Comprueba tu conexión a internet.'); });
}

function nlArtSubscribe() {
  var name = document.getElementById('nlArtName').value.trim();
  var email = document.getElementById('nlArtEmail').value.trim();
  var c1 = document.getElementById('nlArtC1').checked;
  var c2 = document.getElementById('nlArtC2').checked;
  if (!name) { alert('Por favor, introduce tu nombre.'); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Por favor, introduce un email válido.'); return; }
  if (!c1) { alert('Debes aceptar la política de privacidad.'); return; }
  if (!c2) { alert('Debes aceptar recibir la newsletter para suscribirte.'); return; }
  var btn = document.querySelector('#nl-art-form .nl-art-btn');
  btn.disabled = true; btn.textContent = 'Enviando…';
  _nlPost(email, name, function() {
    document.getElementById('nl-art-form').style.display = 'none';
    document.getElementById('nl-art-ok').style.display = 'block';
  }, function(msg) {
    btn.disabled = false; btn.textContent = 'Quiero saberlo antes que nadie →';
    alert(msg);
  });
}

function nlHubSubscribe() {
  var name = document.getElementById('nlhName').value.trim();
  var email = document.getElementById('nlhEmail').value.trim();
  var c1 = document.getElementById('nlhC1').checked;
  var c2 = document.getElementById('nlhC2').checked;
  if (!name) { alert('Por favor, introduce tu nombre.'); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Por favor, introduce un email válido.'); return; }
  if (!c1) { alert('Debes aceptar la política de privacidad.'); return; }
  if (!c2) { alert('Debes aceptar recibir la newsletter para suscribirte.'); return; }
  var btn = document.querySelector('#nl-hub-form .nl-art-btn');
  btn.disabled = true; btn.textContent = 'Enviando…';
  _nlPost(email, name, function() {
    document.getElementById('nl-hub-form').style.display = 'none';
    document.getElementById('nl-hub-ok').style.display = 'block';
  }, function(msg) {
    btn.disabled = false; btn.textContent = 'Quiero saberlo antes que nadie →';
    alert(msg);
  });
}

function nlSubscribe() {
  var name = document.getElementById('nlName').value.trim();
  var email = document.getElementById('nlEmail').value.trim();
  var c1 = document.getElementById('nlConsent1').checked;
  var c2 = document.getElementById('nlConsent2').checked;
  if (!name) { alert('Por favor, introduce tu nombre.'); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Por favor, introduce un email válido.'); return; }
  if (!c1) { alert('Debes aceptar la política de privacidad.'); return; }
  if (!c2) { alert('Debes aceptar recibir la newsletter para suscribirte.'); return; }
  var btn = document.querySelector('#nl-form-area .nl-art-btn');
  btn.disabled = true; btn.textContent = 'Enviando…';
  _nlPost(email, name, function() {
    document.getElementById('nl-form-area').style.display = 'none';
    document.getElementById('nl-success').style.display = 'block';
  }, function(msg) {
    btn.disabled = false; btn.textContent = 'Quiero saberlo antes que nadie →';
    alert(msg);
  });
}

function nlIdxSubscribe() {
  var name = document.getElementById('nlIdxName').value.trim();
  var email = document.getElementById('nlIdxEmail').value.trim();
  var c1 = document.getElementById('nlIdxC1').checked;
  var c2 = document.getElementById('nlIdxC2').checked;
  if (!name) { alert('Por favor, introduce tu nombre.'); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Por favor, introduce un email válido.'); return; }
  if (!c1) { alert('Debes aceptar la política de privacidad.'); return; }
  if (!c2) { alert('Debes aceptar recibir la newsletter para suscribirte.'); return; }
  var btn = document.querySelector('#nl-idx-form .nl-art-btn');
  btn.disabled = true; btn.textContent = 'Enviando…';
  _nlPost(email, name, function() {
    document.getElementById('nl-idx-form').style.display = 'none';
    document.getElementById('nl-idx-ok').style.display = 'block';
  }, function(msg) {
    btn.disabled = false; btn.textContent = 'Quiero saberlo antes que nadie →';
    alert(msg);
  });
}
