
var currentMonth = new Date().getMonth();
var currentYear = new Date().getFullYear();
var tradeData = JSON.parse(localStorage.getItem('tradeData')) || {};
var calendar = document.getElementById('calendar');
var monthDisplay = document.getElementById('monthDisplay');
var modal = document.getElementById('modal');
var selectedDateKey = "";

function save() {
    localStorage.setItem('tradeData', JSON.stringify(tradeData));
}

function renderCalendar() {
    calendar.innerHTML = "";
    // Create a date for the first of the month to avoid overflow errors
    var date = new Date(currentYear, currentMonth, 1);
    monthDisplay.innerText = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    var firstDay = new Date(currentYear, currentMonth, 1).getDay();
    var daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Empty spaces for previous month days
    for (var i = 0; i < firstDay; i++) {
        calendar.appendChild(document.createElement('div'));
    }

    for (var day = 1; day <= daysInMonth; day++) {
        var dateKey = currentYear + '-' + (currentMonth + 1) + '-' + day;
        var trades = tradeData[dateKey] || [];
        var totalPnl = 0;
        for (var j = 0; j < trades.length; j++) {
            totalPnl += trades[j].pnl;
        }
        var tradeCount = trades.length;

        var daySquare = document.createElement('div');
        daySquare.className = 'day';

        if (tradeCount > 0) {
            daySquare.classList.add(totalPnl >= 0 ? 'profit' : 'loss');
            var countLabel = tradeCount === 1 ? '1 trade' : tradeCount + ' trades';
            daySquare.innerHTML = '<span class="day-number">' + day + '</span><span class="day-pnl">$' + totalPnl.toFixed(2) + '</span><span class="day-trade-count">' + countLabel + '</span>';
        } else {
            daySquare.innerHTML = '<span class="day-number">' + day + '</span>';
        }

        // Using closure to capture the correct dateKey
        daySquare.onclick = (function(dk) {
            return function() { openModal(dk); };
        })(dateKey);

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
    var list = document.getElementById('trades-list');
    var trades = tradeData[selectedDateKey] || [];

    if (trades.length === 0) {
        list.innerHTML = '<p style="color:#64748b; font-size:0.85rem; margin:0 0 8px;">No trades yet.</p>';
        return;
    }

    var html = '';
    for (var i = 0; i < trades.length; i++) {
        var t = trades[i];
        var pnlClass = t.pnl >= 0 ? 'pos' : 'neg';
        var pnlSign = t.pnl >= 0 ? '+' : '';
        var notesHtml = t.notes ? '<div class="trade-item-notes">' + t.notes + '</div>' : '';
        html += '<div class="trade-item">';
        html += '<div class="trade-item-info">';
        html += '<div class="trade-item-pnl ' + pnlClass + '">' + pnlSign + '$' + t.pnl.toFixed(2) + '</div>';
        html += notesHtml;
        html += '</div>';
        // Note: Using onclick inside strings is simple but needs global access or specific logic. 
        // Here we attach the index directly.
        html += '<button class="delete-trade-btn" onclick="window.deleteTrade(' + i + ')">×</button>';
        html += '</div>';
    }
    list.innerHTML = html;
}

// Make deleteTrade globally accessible for the button onclick strings
window.deleteTrade = function(index) {
    tradeData[selectedDateKey].splice(index, 1);
    if (tradeData[selectedDateKey].length === 0) {
        delete tradeData[selectedDateKey];
    }
    save();
    renderTradesList();
    renderCalendar();
};

document.getElementById('save-btn').onclick = function() {
    var pnl = parseFloat(document.getElementById('pnl-input').value);
    var notes = document.getElementById('notes-input').value.trim();
    if (isNaN(pnl)) return;
    if (!tradeData[selectedDateKey]) tradeData[selectedDateKey] = [];
    tradeData[selectedDateKey].push({ pnl: pnl, notes: notes });
    save();
    document.getElementById('pnl-input').value = "";
    document.getElementById('notes-input').value = "";
    renderTradesList();
    renderCalendar();
};

function updateStats() {
    var totalPnl = 0;
    var winningDays = 0;
    var tradedDays = 0;
    var keys = Object.keys(tradeData);
    for (var i = 0; i < keys.length; i++) {
        var trades = tradeData[keys[i]];
        if (!trades || trades.length === 0) continue;
        var dayPnl = 0;
        for (var j = 0; j < trades.length; j++) {
            dayPnl += trades[j].pnl;
        }
        totalPnl += dayPnl;
        tradedDays++;
        if (dayPnl > 0) winningDays++;
    }
    var winRate = tradedDays > 0 ? (winningDays / tradedDays) * 100 : 0;
    document.getElementById('total-pnl').innerText = '$' + totalPnl.toFixed(2);
    document.getElementById('total-pnl').style.color = totalPnl >= 0 ? 'var(--green)' : 'var(--red)';
    document.getElementById('win-rate').innerText = winRate.toFixed(1) + '%';
}

document.getElementById('close-btn').onclick = function() { modal.style.display = 'none'; };

document.getElementById('prevMonth').onclick = function() {
    if (currentMonth === 0) {
        currentMonth = 11;
        currentYear--;
    } else {
        currentMonth--;
    }
    renderCalendar();
};

document.getElementById('nextMonth').onclick = function() {
    if (currentMonth === 11) {
        currentMonth = 0;
        currentYear++;
    } else {
        currentMonth++;
    }
    renderCalendar();
};

// Initial Render
renderCalendar();
