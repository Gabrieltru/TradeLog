const current = new Date();
let currentMonth = current.getMonth();
let currentYear = current.getFullYear();
let tradeData = JSON.parse(localStorage.getItem('tradeData') || '{}');
const calendar = document.getElementById('calendar');
const monthDisplay = document.getElementById('monthDisplay');
const modal = document.getElementById('modal');
let selectedDateKey = null;

function saveData() {
  localStorage.setItem('tradeData', JSON.stringify(tradeData));
}

function renderCalendar() {
  calendar.innerHTML = '';
  const date = new Date(currentYear, currentMonth, 1);
  monthDisplay.innerText = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) calendar.appendChild(document.createElement('div'));
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
    const trades = tradeData[dateKey] || [];
    let totalPnl = 0;
    for (let j = 0; j < trades.length; j++) totalPnl += trades[j].pnl;
    const tradeCount = trades.length;
    const daySquare = document.createElement('div');
    daySquare.className = 'day';
    if (tradeCount > 0) daySquare.classList.add(totalPnl >= 0 ? 'profit' : 'loss');
    const countLabel = tradeCount === 1 ? '1 trade' : `${tradeCount} trades`;
    daySquare.innerHTML = `<span class="day-number">${day}</span><span class="day-pnl">${totalPnl.toFixed(2)}</span><span class="day-trade-count">${countLabel}</span>`;
    daySquare.onclick = () => openModal(dateKey);
    calendar.appendChild(daySquare);
  }
  updateStats();
}

function openModal(dateKey) {
  selectedDateKey = dateKey;
  document.getElementById('modal-date-title').innerText = dateKey;
  document.getElementById('pnl-input').value = '';
  document.getElementById('notes-input').value = '';
  renderTradesList();
  modal.style.display = 'flex';
}

function renderTradesList() {
  const list = document.getElementById('trades-list');
  const trades = tradeData[selectedDateKey] || [];
  if (trades.length === 0) {
    list.innerHTML = '<p style="color:#64748b;font-size:0.85rem;margin:0 0 8px;">No trades yet.</p>';
    return;
  }
  let html = '';
  for (let i = 0; i < trades.length; i++) {
    const t = trades[i];
    const pnlClass = t.pnl >= 0 ? 'pos' : 'neg';
    const pnlSign = t.pnl >= 0 ? '+' : '';
    const notesHtml = t.notes ? `<div class="trade-item-notes">${t.notes}</div>` : '';
    html += `<div class="trade-item"><div class="trade-item-info"><div class="trade-item-pnl ${pnlClass}">${pnlSign}${t.pnl.toFixed(2)}</div>${notesHtml}</div><button class="delete-trade-btn" onclick="window.deleteTrade(${i})">X</button></div>`;
  }
  list.innerHTML = html;
}

window.deleteTrade = function(index) {
  tradeData[selectedDateKey].splice(index, 1);
  if (tradeData[selectedDateKey].length === 0) delete tradeData[selectedDateKey];
  saveData();
  renderTradesList();
  renderCalendar();
};

document.getElementById('save-btn').onclick = function() {
  const pnl = parseFloat(document.getElementById('pnl-input').value);
  const notes = document.getElementById('notes-input').value.trim();
  if (isNaN(pnl)) return;
  if (!tradeData[selectedDateKey]) tradeData[selectedDateKey] = [];
  tradeData[selectedDateKey].push({ pnl, notes });
  saveData();
  document.getElementById('pnl-input').value = '';
  document.getElementById('notes-input').value = '';
  renderTradesList();
  renderCalendar();
};

function updateStats() {
  let totalPnl = 0;
  let winningDays = 0;
  let tradedDays = 0;
  const keys = Object.keys(tradeData);
  for (let i = 0; i < keys.length; i++) {
    const trades = tradeData[keys[i]];
    if (!trades || trades.length === 0) continue;
    let dayPnl = 0;
    for (let j = 0; j < trades.length; j++) dayPnl += trades[j].pnl;
    totalPnl += dayPnl;
    tradedDays++;
    if (dayPnl > 0) winningDays++;
  }
  const winRate = tradedDays > 0 ? (winningDays / tradedDays) * 100 : 0;
  document.getElementById('total-pnl').innerText = totalPnl.toFixed(2);
  document.getElementById('total-pnl').style.color = totalPnl >= 0 ? 'var(--green)' : 'var(--red)';
  document.getElementById('win-rate').innerText = winRate.toFixed(1) + '%';
}

document.getElementById('close-btn').onclick = function() {
  modal.style.display = 'none';
};

document.getElementById('prevMonth').onclick = function() {
  if (currentMonth === 0) { currentMonth = 11; currentYear--; } else { currentMonth--; }
  renderCalendar();
};

document.getElementById('nextMonth').onclick = function() {
  if (currentMonth === 11) { currentMonth = 0; currentYear++; } else { currentMonth++; }
  renderCalendar();
};

renderCalendar();
