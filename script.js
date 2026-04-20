let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
// tradeData structure: { "2026-4-20": [ { pnl: 100, notes: "..." }, ... ] }
let tradeData = JSON.parse(localStorage.getItem('tradeData')) || {};
const calendar = document.getElementById('calendar');
const monthDisplay = document.getElementById('monthDisplay');
const modal = document.getElementById('modal');
let selectedDateKey = "";

function save() {
    localStorage.setItem('tradeData', JSON.stringify(tradeData));
}

function renderCalendar() {
    calendar.innerHTML = "";
    monthDisplay.innerText = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
        .format(new Date(currentYear, currentMonth));

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(d => {
        const label = document.createElement('div');
        label.style.cssText = 'text-align:center; font-size:0.75rem; color:#64748b; padding:5px 0;';
        label.innerText = d;
        calendar.appendChild(label);
    });

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        calendar.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
        const trades = tradeData[dateKey] || [];
        const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
        const tradeCount = trades.length;

        const daySquare = document.createElement('div');
        daySquare.className = 'day';

        if (tradeCount > 0) {
            daySquare.classList.add(totalPnl >= 0 ? 'profit' : 'loss');
            daySquare.innerHTML = `
                <span class="day-number">${day}</span>
                <span class="day-pnl">$${totalPnl.toFixed(2)}</span>
                <span class="day-trade-count">${tradeCount} trade${tradeCount !== 1 ? 's' : ''}</span>
            `;
        } else {
            daySquare.innerHTML = `<span class="day-number">${day}</span>`;
        }

        daySquare.onclick = () => openModal(dateKey);
        calendar.appendChild(daySquare);
    }
    updateStats();
}
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
        const trades = tradeData[dateKey] || [];
        const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
        const tradeCount = trades.length;

        const daySquare = document.createElement('div');
        daySquare.className = 'day';

        if (tradeCount > 0) {
            daySquare.classList.add(totalPnl >= 0 ? 'profit' : 'loss');
            daySquare.innerHTML = `
                <span class="day-number">${day}</span>
                <span class="day-pnl">$${totalPnl.toFixed(2)}</span>
                <span class="day-trade-count">${tradeCount} trade${tradeCount !== 1 ? 's' : ''}</span>
            `;
        } else {
            daySquare.innerHTML = `<span class="day-number">${day}</span>`;
        }

        daySquare.onclick = () => openModal(dateKey);
        calendar.appendChild(daySquare);
    }
    updateStats();
}

function openModal(dateKey) {
    selectedDateKey = dateKey;
    document.getElementById('modal-date-title').innerText = dateKey;
    document.getElementById('pnl-input').value = "";
    document.getElementById('notes-input').value = "";
    renderTradesList();
    modal.style.display = 'flex';
}

function renderTradesList() {
    const list = document.getElementById('trades-list');
    const trades = tradeData[selectedDateKey] || [];

    if (trades.length === 0) {
        list.innerHTML = `<p style="color:#64748b; font-size:0.85rem; margin:0 0 8px;">No trades yet.</p>`;
        return;
    }

    list.innerHTML = trades.map((t, i) => `
        <div class="trade-item">
            <div class="trade-item-info">
                <div class="trade-item-pnl ${t.pnl >= 0 ? 'pos' : 'neg'}">
                    ${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}
                </div>
                ${t.notes ? `<div class="trade-item-notes">${t.notes}</div>` : ''}
            </div>
            <button class="delete-trade-btn" onclick="deleteTrade(${i})">✕</button>
        </div>
    `).join('');
}

function deleteTrade(index) {
    tradeData[selectedDateKey].splice(index, 1);
    if (tradeData[selectedDateKey].length === 0) {
        delete tradeData[selectedDateKey];
    }
    save();
    renderTradesList();
    renderCalendar();
}

document.getElementById('add-trade-btn').onclick = () => {
    const pnl = parseFloat(document.getElementById('pnl-input').value);
    const notes = document.getElementById('notes-input').value.trim();
    if (isNaN(pnl)) return;

    if (!tradeData[selectedDateKey]) tradeData[selectedDateKey] = [];
    tradeData[selectedDateKey].push({ pnl, notes });
    save();

    document.getElementById('pnl-input').value = "";
    document.getElementById('notes-input').value = "";
    renderTradesList();
    renderCalendar();
};

function updateStats() {
    let totalPnl = 0;
    let totalTrades = 0;
    let winningDays = 0;
    let tradedDays = 0;

    for (const trades of Object.values(tradeData)) {
        if (!trades.length) continue;
        const dayPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
        totalPnl += dayPnl;
        totalTrades += trades.length;
        tradedDays++;
        if (dayPnl > 0) winningDays++;
    }

    const winRate = tradedDays > 0 ? (winningDays / tradedDays) * 100 : 0;
    document.getElementById('total-pnl').innerText = `$${totalPnl.toFixed(2)}`;
    document.getElementById('total-pnl').style.color = totalPnl >= 0 ? 'var(--green)' : 'var(--red)';
    document.getElementById('win-rate').innerText = `${winRate.toFixed(1)}%`;
}

document.getElementById('close-btn').onclick = () => modal.style.display = 'none';
document.getElementById('prevMonth').onclick = () => { if (currentMonth === 0) { currentMonth = 11; currentYear--; } else { currentMonth--; } renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { if (currentMonth === 11) { currentMonth = 0; currentYear++; } else { currentMonth++; } renderCalendar(); };

renderCalendar();
