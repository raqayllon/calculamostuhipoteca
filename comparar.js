'use strict';

function filter(type, btn) {
  document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const cards = document.querySelectorAll('.bcard');
  let count = 0;
  cards.forEach(c => {
    if (type === 'all' || c.dataset.type === type) {
      c.style.display = '';
      count++;
    } else {
      c.style.display = 'none';
    }
  });

  const countEl = document.getElementById('count');
  countEl.textContent = count + ' hipoteca' + (count !== 1 ? 's' : '');
}
window.filter = filter;
