(() => {
  const aircraftSelect = document.getElementById('aircraft');
  const headingEl = document.getElementById('heading');
  const courseEl = document.getElementById('course');
  let input = '';

  const fmt = n => String(((n % 360) + 360) % 360).padStart(3,'0') + '°';

  for (const [id, ac] of Object.entries(window.AIRCRAFT_DATA)) {
    const option = document.createElement('option'); option.value=id; option.textContent=ac.name; aircraftSelect.appendChild(option);
  }
  aircraftSelect.value = localStorage.getItem('aircraft') || Object.keys(window.AIRCRAFT_DATA)[0];

  function calculate() {
    if (!input.length) { courseEl.textContent='---'; headingEl.textContent='---'; return; }
    const trueCourse = Number(input);
    courseEl.textContent = fmt(trueCourse === 360 ? 0 : trueCourse);
    const ac = window.AIRCRAFT_DATA[aircraftSelect.value];
    const magnetic = ((trueCourse === 360 ? 0 : trueCourse) + ac.variation) % 360;
    const lookup = Math.round(magnetic) % 360;
    const row = ac.table[lookup];
    headingEl.textContent = row ? fmt(row.mc === 360 ? 0 : row.mc) : '---';
  }

  function addDigit(d) {
    // If three digits are already present, a new digit starts a fresh course.
    let candidate = input.length >= 3 ? d : input + d;
    let value = Number(candidate);
    if (value > 360) { candidate = d; value = Number(candidate); }
    input = candidate;
    calculate();
  }

  document.querySelector('.keypad').addEventListener('click', e => {
    const b=e.target.closest('button'); if(!b) return;
    if (b.dataset.key !== undefined) addDigit(b.dataset.key);
    if (b.dataset.action === 'back') { input=input.slice(0,-1); calculate(); }
    if (b.dataset.action === 'clear') { input=''; calculate(); }
  });

  aircraftSelect.addEventListener('change', () => { localStorage.setItem('aircraft',aircraftSelect.value); calculate(); });
  if ('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }));
  calculate();
})();
