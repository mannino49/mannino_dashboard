// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadSavedData();
    setupNavigation();
    initializeDatePicker();
    loadHistoricalData();
    setupStatistics();
});

// Initialize all dashboard components
function initializeDashboard() {
    updateCurrentDate();
    setupMoodSelector();
    setupEnergySlider();
    setupMorningRoutineTracker();
    setupPriorities();
    setupResetTimer();
    setupEveningWindDown();
    updateWeeklyStats();
}

// Update the current date display
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

// Setup mood selector with emoji options
function setupMoodSelector() {
    const emojis = document.querySelectorAll('.emoji');
    
    emojis.forEach(emoji => {
        emoji.addEventListener('click', function() {
            // Remove selected class from all emojis
            emojis.forEach(e => e.classList.remove('selected'));
            
            // Add selected class to clicked emoji
            this.classList.add('selected');
            
            // Save selected mood
            saveDashboardData();
        });
    });
}

// Setup energy level slider
function setupEnergySlider() {
    const slider = document.getElementById('energy-slider');
    const valueDisplay = document.getElementById('energy-value');
    
    slider.addEventListener('input', function() {
        valueDisplay.textContent = this.value;
        saveDashboardData();
    });
}

// Setup morning routine tracker with progress bar
function setupMorningRoutineTracker() {
    const routineItems = document.querySelectorAll('.routine-item');
    const progressBar = document.getElementById('routine-progress');
    
    routineItems.forEach(item => {
        item.addEventListener('change', function() {
            updateRoutineProgress();
            saveDashboardData();
        });
    });
    
    function updateRoutineProgress() {
        const totalItems = routineItems.length;
        let checkedItems = 0;
        
        routineItems.forEach(item => {
            if (item.checked) {
                checkedItems++;
            }
        });
        
        const progressPercentage = (checkedItems / totalItems) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }
}

// Setup priorities with mark as done functionality
function setupPriorities() {
    const doneButtons = document.querySelectorAll('.mark-done');
    
    doneButtons.forEach(button => {
        button.addEventListener('click', function() {
            const priorityNum = this.getAttribute('data-priority');
            const priorityItem = this.parentElement;
            const priorityInput = document.getElementById(`priority-${priorityNum}`);
            
            priorityItem.classList.toggle('completed');
            
            if (priorityItem.classList.contains('completed')) {
                this.textContent = 'Undo';
                priorityInput.style.fontWeight = 'bold';
            } else {
                this.textContent = 'Done';
                priorityInput.style.fontWeight = 'normal';
            }
            
            saveDashboardData();
            updateWeeklyStats();
        });
    });
}

// Setup reset timer and button
function setupResetTimer() {
    let minutes = 25;
    const countdownElement = document.getElementById('reset-countdown');
    const resetButton = document.getElementById('reset-button');
    let timerInterval;
    
    // Initialize countdown
    countdownElement.textContent = minutes;
    
    // Start countdown
    startCountdown();
    
    function startCountdown() {
        clearInterval(timerInterval);
        
        timerInterval = setInterval(function() {
            minutes--;
            
            if (minutes < 0) {
                minutes = 25;
                alert('Time for a reset! Take a minute to breathe and refocus.');
            }
            
            countdownElement.textContent = minutes;
        }, 60000); // Update every minute (60000ms)
    }
    
    // Reset button functionality
    resetButton.addEventListener('click', function() {
        minutes = 25;
        countdownElement.textContent = minutes;
        startCountdown();
        
        // Show reset confirmation
        alert('Reset timer started! Take a minute to breathe and refocus.');
    });
}

// Setup evening wind-down section
function setupEveningWindDown() {
    const eveningItems = document.querySelectorAll('.evening-item');
    
    eveningItems.forEach(item => {
        item.addEventListener('change', function() {
            saveDashboardData();
        });
    });
    
    const brainDump = document.getElementById('brain-dump');
    brainDump.addEventListener('input', debounce(function() {
        saveDashboardData();
    }, 500));
}

// Update weekly stats panel
function updateWeeklyStats() {
    // For demo purposes, we'll use some placeholder calculations
    // In a real app, this would pull from historical data
    
    // Morning routine percentage
    const routineItems = document.querySelectorAll('.routine-item');
    let routineCompleted = 0;
    
    routineItems.forEach(item => {
        if (item.checked) {
            routineCompleted++;
        }
    });
    
    const routinePercentage = Math.round((routineCompleted / routineItems.length) * 100);
    document.getElementById('routine-percentage').textContent = `${routinePercentage}%`;
    
    // Priorities hit
    const priorityItems = document.querySelectorAll('.priority-item');
    let prioritiesCompleted = 0;
    
    priorityItems.forEach(item => {
        if (item.classList.contains('completed')) {
            prioritiesCompleted++;
        }
    });
    
    document.getElementById('priorities-hit').textContent = `${prioritiesCompleted}/${priorityItems.length}`;
    
    // Focus rating (using energy value as proxy for demo)
    const energyValue = document.getElementById('energy-value').textContent;
    document.getElementById('focus-rating').textContent = `${energyValue}/5`;
}

// Save all dashboard data to localStorage
function saveDashboardData() {
    const data = {
        date: new Date().toISOString(),
        mood: getSelectedMood(),
        energy: document.getElementById('energy-slider').value,
        morningRoutine: getMorningRoutineStatus(),
        priorities: getPrioritiesData(),
        calendar: getCalendarData(),
        inbox: getInboxData(),
        evening: getEveningData()
    };
    
    // Save today's data
    localStorage.setItem('dashboardData', JSON.stringify(data));
    
    // Save to historical data
    saveToHistory(data);
    
    // Update statistics
    updateStatistics();
}

// Save data to history
function saveToHistory(data) {
    // Get existing history or initialize new one
    let history = JSON.parse(localStorage.getItem('dashboardHistory')) || {};
    
    // Use date as key (YYYY-MM-DD format)
    const dateKey = new Date(data.date).toISOString().split('T')[0];
    
    // Save data for this date
    history[dateKey] = data;
    
    // Save back to localStorage
    localStorage.setItem('dashboardHistory', JSON.stringify(history));
}

// Load saved data from localStorage
function loadSavedData(specificDate = null) {
    let data;
    
    if (specificDate) {
        // Load data for a specific date from history
        const history = JSON.parse(localStorage.getItem('dashboardHistory')) || {};
        data = history[specificDate];
    } else {
        // Load today's data
        const savedData = localStorage.getItem('dashboardData');
        if (savedData) {
            data = JSON.parse(savedData);
        }
    }
    
    if (data) {
        // Only load data from today or the specified date
        const savedDate = new Date(data.date);
        const today = new Date();
        
        if (specificDate || savedDate.toDateString() === today.toDateString()) {
            // Load mood
            if (data.mood) {
                const emojis = document.querySelectorAll('.emoji');
                emojis.forEach(emoji => {
                    if (emoji.getAttribute('data-mood') === data.mood) {
                        emoji.classList.add('selected');
                    }
                });
            }
            
            // Load energy
            if (data.energy) {
                document.getElementById('energy-slider').value = data.energy;
                document.getElementById('energy-value').textContent = data.energy;
            }
            
            // Load morning routine
            if (data.morningRoutine) {
                const routineItems = document.querySelectorAll('.routine-item');
                routineItems.forEach((item, index) => {
                    if (data.morningRoutine[index]) {
                        item.checked = true;
                    }
                });
                updateRoutineProgress();
            }
            
            // Load priorities
            if (data.priorities) {
                data.priorities.forEach((priority, index) => {
                    const priorityNum = index + 1;
                    document.getElementById(`priority-${priorityNum}`).value = priority.text;
                    
                    if (priority.completed) {
                        const priorityItem = document.querySelector(`.priority-item:nth-child(${priorityNum})`);
                        priorityItem.classList.add('completed');
                        priorityItem.querySelector('button').textContent = 'Undo';
                    }
                });
            }
            
            // Load calendar data
            if (data.calendar) {
                document.getElementById('morning-block').value = data.calendar.morning || '';
                document.getElementById('midday-block').value = data.calendar.midday || '';
                document.getElementById('afternoon-block').value = data.calendar.afternoon || '';
                document.getElementById('midday-email').checked = data.calendar.middayEmail || false;
                document.getElementById('eod-email').checked = data.calendar.eodEmail || false;
            }
            
            // Load inbox data
            if (data.inbox) {
                document.getElementById('flagged-emails').value = data.inbox.flagged || 0;
                document.getElementById('handled-emails').value = data.inbox.handled || 0;
                document.getElementById('total-critical-emails').value = data.inbox.total || 0;
            }
            
            // Load evening data
            if (data.evening) {
                document.getElementById('reading').checked = data.evening.reading || false;
                document.getElementById('brain-dump').value = data.evening.brainDump || '';
                document.getElementById('plan-tomorrow').checked = data.evening.planTomorrow || false;
            }
            
            // Update stats
            updateWeeklyStats();
        }
    }
}

// Helper function to get selected mood
function getSelectedMood() {
    const selectedEmoji = document.querySelector('.emoji.selected');
    return selectedEmoji ? selectedEmoji.getAttribute('data-mood') : null;
}

// Helper function to get morning routine status
function getMorningRoutineStatus() {
    const routineItems = document.querySelectorAll('.routine-item');
    const status = [];
    
    routineItems.forEach(item => {
        status.push(item.checked);
    });
    
    return status;
}

// Helper function to get priorities data
function getPrioritiesData() {
    const priorities = [];
    
    for (let i = 1; i <= 3; i++) {
        const text = document.getElementById(`priority-${i}`).value;
        const completed = document.querySelector(`.priority-item:nth-child(${i})`).classList.contains('completed');
        
        priorities.push({
            text: text,
            completed: completed
        });
    }
    
    return priorities;
}

// Helper function to get calendar data
function getCalendarData() {
    return {
        morning: document.getElementById('morning-block').value,
        midday: document.getElementById('midday-block').value,
        afternoon: document.getElementById('afternoon-block').value,
        middayEmail: document.getElementById('midday-email').checked,
        eodEmail: document.getElementById('eod-email').checked
    };
}

// Helper function to get inbox data
function getInboxData() {
    return {
        flagged: document.getElementById('flagged-emails').value,
        handled: document.getElementById('handled-emails').value,
        total: document.getElementById('total-critical-emails').value
    };
}

// Helper function to get evening data
function getEveningData() {
    return {
        reading: document.getElementById('reading').checked,
        brainDump: document.getElementById('brain-dump').value,
        planTomorrow: document.getElementById('plan-tomorrow').checked
    };
}

// Helper function to update routine progress
function updateRoutineProgress() {
    const routineItems = document.querySelectorAll('.routine-item');
    const progressBar = document.getElementById('routine-progress');
    
    let checkedItems = 0;
    routineItems.forEach(item => {
        if (item.checked) {
            checkedItems++;
        }
    });
    
    const progressPercentage = (checkedItems / routineItems.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

// Setup navigation between dashboard views
function setupNavigation() {
    const todayBtn = document.getElementById('today-btn');
    const historyBtn = document.getElementById('history-btn');
    const statsBtn = document.getElementById('stats-btn');
    
    const dashboardContent = document.querySelector('.dashboard-content');
    const historyView = document.getElementById('history-view');
    const statsView = document.getElementById('stats-view');
    
    todayBtn.addEventListener('click', function() {
        setActiveNavButton(this);
        dashboardContent.style.display = 'grid';
        historyView.style.display = 'none';
        statsView.style.display = 'none';
    });
    
    historyBtn.addEventListener('click', function() {
        setActiveNavButton(this);
        dashboardContent.style.display = 'none';
        historyView.style.display = 'block';
        statsView.style.display = 'none';
        loadHistoricalData(); // Refresh history data
    });
    
    statsBtn.addEventListener('click', function() {
        setActiveNavButton(this);
        dashboardContent.style.display = 'none';
        historyView.style.display = 'none';
        statsView.style.display = 'block';
        updateStatistics(); // Refresh statistics
    });
    
    function setActiveNavButton(button) {
        todayBtn.classList.remove('active');
        historyBtn.classList.remove('active');
        statsBtn.classList.remove('active');
        button.classList.add('active');
    }
}

// Initialize date picker for selecting historical data
function initializeDatePicker() {
    const datePicker = document.getElementById('date-picker');
    
    flatpickr(datePicker, {
        dateFormat: 'Y-m-d',
        maxDate: 'today',
        onChange: function(selectedDates, dateStr) {
            if (dateStr) {
                const todayStr = new Date().toISOString().split('T')[0];
                
                if (dateStr === todayStr) {
                    // If today is selected, show today's dashboard
                    document.getElementById('today-btn').click();
                } else {
                    // Otherwise load historical data for the selected date
                    document.getElementById('history-btn').click();
                    showHistoricalData(dateStr);
                }
            }
        }
    });
}

// Load and display list of dates with saved data
function loadHistoricalData() {
    const historyList = document.getElementById('history-dates-list');
    const history = JSON.parse(localStorage.getItem('dashboardHistory')) || {};
    
    // Clear existing list
    historyList.innerHTML = '';
    
    // Get dates and sort them in descending order (newest first)
    const dates = Object.keys(history).sort().reverse();
    
    if (dates.length === 0) {
        historyList.innerHTML = '<p>No historical data available yet.</p>';
        return;
    }
    
    // Create date items
    dates.forEach(date => {
        const dateItem = document.createElement('div');
        dateItem.className = 'history-date-item';
        dateItem.textContent = formatDate(date);
        dateItem.dataset.date = date;
        
        dateItem.addEventListener('click', function() {
            // Remove active class from all date items
            document.querySelectorAll('.history-date-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked date item
            this.classList.add('active');
            
            // Show data for selected date
            showHistoricalData(date);
        });
        
        historyList.appendChild(dateItem);
    });
    
    // Show the most recent date by default
    if (dates.length > 0) {
        historyList.firstChild.classList.add('active');
        showHistoricalData(dates[0]);
    }
}

// Show historical data for a specific date
function showHistoricalData(date) {
    const historyDetails = document.getElementById('history-details');
    const history = JSON.parse(localStorage.getItem('dashboardHistory')) || {};
    const data = history[date];
    
    if (!data) {
        historyDetails.innerHTML = '<p>No data available for this date.</p>';
        return;
    }
    
    // Format the date
    const formattedDate = formatDate(date);
    
    // Create HTML for historical data
    let html = `<h3>${formattedDate}</h3>`;
    
    // Mood and Energy
    html += `
        <div class="history-section">
            <h3>Mood & Energy</h3>
            <p>Mood: ${getMoodEmoji(data.mood)}</p>
            <p>Energy Level: ${data.energy}/5</p>
        </div>
    `;
    
    // Morning Routine
    const routineItems = ['Hydrate', 'Breathe + center', 'Light movement', '3x3 clarity', 'Spiritual check-in'];
    const routineCompleted = data.morningRoutine.filter(item => item).length;
    const routinePercentage = Math.round((routineCompleted / data.morningRoutine.length) * 100);
    
    html += `
        <div class="history-section">
            <h3>Morning Routine</h3>
            <p>Completion: ${routinePercentage}%</p>
            <ul>
    `;
    
    data.morningRoutine.forEach((completed, index) => {
        html += `<li>${completed ? '✅' : '❌'} ${routineItems[index]}</li>`;
    });
    
    html += `
            </ul>
        </div>
    `;
    
    // Priorities
    html += `
        <div class="history-section">
            <h3>Top 3 Priorities</h3>
            <ul>
    `;
    
    data.priorities.forEach((priority, index) => {
        html += `<li>${priority.completed ? '✅' : '❌'} ${priority.text || 'Not set'}</li>`;
    });
    
    html += `
            </ul>
        </div>
    `;
    
    // Calendar
    html += `
        <div class="history-section">
            <h3>Calendar</h3>
            <p>Morning Focus: ${data.calendar.morning || 'Not set'}</p>
            <p>Midday Admin: ${data.calendar.midday || 'Not set'}</p>
            <p>Afternoon Action: ${data.calendar.afternoon || 'Not set'}</p>
            <p>Email Sweeps: ${data.calendar.middayEmail ? '✅ Midday' : '❌ Midday'} / ${data.calendar.eodEmail ? '✅ End-of-day' : '❌ End-of-day'}</p>
        </div>
    `;
    
    // Inbox
    html += `
        <div class="history-section">
            <h3>Inbox</h3>
            <p>Emails flagged: ${data.inbox.flagged || 0}</p>
            <p>Critical emails handled: ${data.inbox.handled || 0}/${data.inbox.total || 0}</p>
        </div>
    `;
    
    // Evening
    html += `
        <div class="history-section">
            <h3>Evening Wind-Down</h3>
            <p>${data.evening.reading ? '✅' : '❌'} 10 min reading</p>
            <p>${data.evening.planTomorrow ? '✅' : '❌'} Plan for tomorrow</p>
    `;
    
    if (data.evening.brainDump) {
        html += `
            <div>
                <h4>Brain Dump:</h4>
                <p class="brain-dump-content">${data.evening.brainDump}</p>
            </div>
        `;
    }
    
    html += `
        </div>
    `;
    
    historyDetails.innerHTML = html;
}

// Setup statistics functionality
function setupStatistics() {
    // Set up period selector buttons
    const periodButtons = document.querySelectorAll('.period-btn');
    
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            periodButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update statistics for selected period
            updateStatistics(this.dataset.period);
        });
    });
    
    // Initial statistics update
    updateStatistics('week');
}

// Update statistics based on historical data
function updateStatistics(period = 'week') {
    const history = JSON.parse(localStorage.getItem('dashboardHistory')) || {};
    const dates = Object.keys(history).sort();
    
    if (dates.length === 0) {
        updateEmptyStats();
        return;
    }
    
    // Filter dates based on selected period
    const filteredDates = filterDatesByPeriod(dates, period);
    
    if (filteredDates.length === 0) {
        updateEmptyStats();
        return;
    }
    
    // Get data for filtered dates
    const filteredData = filteredDates.map(date => history[date]);
    
    // Calculate statistics
    updateMoodChart(filteredData);
    updateEnergyChart(filteredData);
    updateRoutineChart(filteredData);
    updatePriorityChart(filteredData);
    updateAverages(filteredData);
}

// Filter dates based on selected period
function filterDatesByPeriod(dates, period) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dates.filter(date => {
        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0);
        
        const diffTime = Math.abs(today - dateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (period === 'week') {
            return diffDays <= 7;
        } else if (period === 'month') {
            return diffDays <= 30;
        } else {
            return true; // 'all' period
        }
    });
}

// Update mood chart
function updateMoodChart(data) {
    const ctx = document.getElementById('mood-chart').getContext('2d');
    
    // Count occurrences of each mood
    const moodCounts = {
        'happy': 0,
        'neutral': 0,
        'stressed': 0
    };
    
    data.forEach(day => {
        if (day.mood) {
            moodCounts[day.mood]++;
        }
    });
    
    // Clear previous chart if it exists
    if (window.moodChart) {
        window.moodChart.destroy();
    }
    
    // Create new chart
    window.moodChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Happy 😌', 'Neutral 😐', 'Stressed 😫'],
            datasets: [{
                data: [moodCounts.happy, moodCounts.neutral, moodCounts.stressed],
                backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update energy chart
function updateEnergyChart(data) {
    const ctx = document.getElementById('energy-chart').getContext('2d');
    
    // Prepare data for chart
    const labels = data.map(day => formatDate(day.date.split('T')[0]));
    const energyLevels = data.map(day => day.energy);
    
    // Clear previous chart if it exists
    if (window.energyChart) {
        window.energyChart.destroy();
    }
    
    // Create new chart
    window.energyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Energy Level',
                data: energyLevels,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 1,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Update routine chart
function updateRoutineChart(data) {
    const ctx = document.getElementById('routine-chart').getContext('2d');
    
    // Prepare data for chart
    const labels = data.map(day => formatDate(day.date.split('T')[0]));
    const routineCompletions = data.map(day => {
        const completed = day.morningRoutine.filter(item => item).length;
        return Math.round((completed / day.morningRoutine.length) * 100);
    });
    
    // Clear previous chart if it exists
    if (window.routineChart) {
        window.routineChart.destroy();
    }
    
    // Create new chart
    window.routineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Completion %',
                data: routineCompletions,
                backgroundColor: '#4CAF50',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Update priority chart
function updatePriorityChart(data) {
    const ctx = document.getElementById('priority-chart').getContext('2d');
    
    // Prepare data for chart
    const labels = data.map(day => formatDate(day.date.split('T')[0]));
    const priorityCompletions = data.map(day => {
        const completed = day.priorities.filter(priority => priority.completed).length;
        return Math.round((completed / day.priorities.length) * 100);
    });
    
    // Clear previous chart if it exists
    if (window.priorityChart) {
        window.priorityChart.destroy();
    }
    
    // Create new chart
    window.priorityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Completion %',
                data: priorityCompletions,
                backgroundColor: '#FF9800',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Update averages section
function updateAverages(data) {
    // Average energy level
    const avgEnergy = data.reduce((sum, day) => sum + Number(day.energy), 0) / data.length;
    document.getElementById('avg-energy').textContent = avgEnergy.toFixed(1);
    
    // Average morning routine completion
    const avgRoutine = data.reduce((sum, day) => {
        const completed = day.morningRoutine.filter(item => item).length;
        return sum + (completed / day.morningRoutine.length);
    }, 0) / data.length * 100;
    document.getElementById('avg-routine').textContent = Math.round(avgRoutine) + '%';
    
    // Average priority completion
    const avgPriorities = data.reduce((sum, day) => {
        const completed = day.priorities.filter(priority => priority.completed).length;
        return sum + (completed / day.priorities.length);
    }, 0) / data.length * 100;
    document.getElementById('avg-priorities').textContent = Math.round(avgPriorities) + '%';
    
    // Most common mood
    const moodCounts = {
        'happy': 0,
        'neutral': 0,
        'stressed': 0
    };
    
    data.forEach(day => {
        if (day.mood) {
            moodCounts[day.mood]++;
        }
    });
    
    let commonMood = 'none';
    let maxCount = 0;
    
    for (const mood in moodCounts) {
        if (moodCounts[mood] > maxCount) {
            maxCount = moodCounts[mood];
            commonMood = mood;
        }
    }
    
    document.getElementById('common-mood').textContent = getMoodEmoji(commonMood);
}

// Update stats with empty data
function updateEmptyStats() {
    document.getElementById('avg-energy').textContent = '0';
    document.getElementById('avg-routine').textContent = '0%';
    document.getElementById('avg-priorities').textContent = '0%';
    document.getElementById('common-mood').textContent = '-';
    
    // Clear charts
    const chartIds = ['mood-chart', 'energy-chart', 'routine-chart', 'priority-chart'];
    
    chartIds.forEach(id => {
        const ctx = document.getElementById(id).getContext('2d');
        
        // Clear previous chart if it exists
        if (window[id.replace('-', '')]) {
            window[id.replace('-', '')].destroy();
        }
        
        // Create empty chart
        window[id.replace('-', '')] = new Chart(ctx, {
            type: id === 'mood-chart' ? 'pie' : (id === 'energy-chart' ? 'line' : 'bar'),
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: '#ccc',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    });
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Helper function to get mood emoji
function getMoodEmoji(mood) {
    switch (mood) {
        case 'happy': return '😌';
        case 'neutral': return '😐';
        case 'stressed': return '😫';
        default: return '-';
    }
}

// Debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    
    return function() {
        const context = this;
        const args = arguments;
        
        clearTimeout(timeout);
        
        timeout = setTimeout(function() {
            func.apply(context, args);
        }, wait);
    };
}
