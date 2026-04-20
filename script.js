let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let tradeData = JSON.parse(localStorage.getItem('tradeData')) || {};
const calendar = document.getElementById('calendar');
const monthDisplay = document.getElementById('monthDisplay');
const modal = document.getElementById('modal');
let selectedDateKey = "";
function renderCalendar() {
    calendar.innerHTML = "";
    monthDisplay.innerText = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(currentYear, currentMonth));
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    // Fill empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        calendar.appendChild(emptyDiv);
    }
    // Create day squares
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
        const daySquare = document.createElement('div');
        daySquare.className = 'day';
        
        const data = tradeData[dateKey];
        if (data) {
            daySquare.classList.add(data.pnl >= 0 ? 'profit' : 'loss');
            daySquare.innerHTML = `<span class="day-number">${day}</span><span class="day-pnl">$${data.pnl}</span>`;
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
    document.getElementById('pnl-input').value = tradeData[dateKey]?.pnl || "";
    document.getElementById('notes-input').value = tradeData[dateKey]?.notes || "";
    modal.style.display = 'flex';
}
document.getElementById('save-btn').onclick = () => {
    const pnl = parseFloat(document.getElementById('pnl-input').value);
    const notes = document.getElementById('notes-input').value;
    if (!isNaN(pnl)) {
        tradeData[selectedDateKey] = { pnl, notes };
        localStorage.setItem('tradeData', JSON.stringify(tradeData));
        modal.style.display = 'none';
        renderCalendar();
    }
};
function updateStats() {
    const values = Object.values(tradeData);
    const totalPnl = values.reduce((sum, item) => sum + item.pnl, 0);
    const winningTrades = values.filter(item => item.pnl > 0).length;
    const winRate = values.length > 0 ? (winningTrades / values.length) * 100 : 0;
    document.getElementById('total-pnl').innerText = `$${totalPnl.toFixed(2)}`;
    document.getElementById('total-pnl').style.color = totalPnl >= 0 ? 'var(--green)' : 'var(--red)';
    document.getElementById('win-rate').innerText = `${winRate.toFixed(1)}%`;
}
document.getElementById('close-btn').onclick = () => modal.style.display = 'none';
document.getElementById('prevMonth').onclick = () => { currentMonth--; renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { currentMonth++; renderCalendar(); };
renderCalendar();
