// DOM Elements
const productionForm = document.getElementById('productionForm');
const productionData = document.getElementById('productionData');
const weekSelect = document.getElementById('weekSelect');
const unitTypeSelect = document.getElementById('unitType');
const ratePerUnitInput = document.getElementById('ratePerUnit');
const weeksList = document.getElementById('weeksList');
const weekSearch = document.getElementById('weekSearch');
const saveWeekBtn = document.getElementById('saveWeekBtn');
const fileInput = document.getElementById('fileInput');
const importBtn = document.getElementById('importBtn');

// State Management
let currentWeekData = [];
let savedWeeks = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set default week to current week
    const today = new Date();
    const weekString = getWeekString(today);
    weekSelect.value = weekString;
    
    // Load saved data from localStorage
    loadSavedData();
    
    // Display current week's data
    displayWeekData(weekString);
    
    // Update pay period information
    updatePayPeriodInfo();
});

// Event Listeners
productionForm.addEventListener('submit', handleFormSubmit);
weekSelect.addEventListener('change', handleWeekChange);
unitTypeSelect.addEventListener('change', handleUnitTypeChange);
saveWeekBtn.addEventListener('click', handleSaveWeek);
weekSearch.addEventListener('input', handleWeekSearch);
importBtn.addEventListener('click', handleImport);

// Form Submission Handler
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        date: document.getElementById('entryDate').value,
        unitType: unitTypeSelect.value,
        units: parseFloat(document.getElementById('unitsCompleted').value),
        rate: parseFloat(ratePerUnitInput.value),
        earnings: parseFloat(ratePerUnitInput.value) * parseFloat(document.getElementById('unitsCompleted').value),
        notes: document.getElementById('notes').value
    };
    
    addEntry(formData);
    productionForm.reset();
    updatePayPeriodInfo();
}

// Add Entry to Table
function addEntry(entry) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.unitType}</td>
        <td>${entry.units}</td>
        <td>$${entry.rate.toFixed(2)}</td>
        <td>$${entry.earnings.toFixed(2)}</td>
        <td>${entry.notes}</td>
        <td>
            <button onclick="deleteEntry(this)">Delete</button>
        </td>
    `;
    
    productionData.appendChild(row);
    currentWeekData.push(entry);
    saveCurrentWeek();
}

// Delete Entry
function deleteEntry(button) {
    const row = button.parentElement.parentElement;
    const rowIndex = Array.from(row.parentElement.children).indexOf(row);
    currentWeekData.splice(rowIndex, 1);
    row.remove();
    saveCurrentWeek();
    updatePayPeriodInfo();
}

// Unit Type Change Handler
function handleUnitTypeChange() {
    const selectedOption = unitTypeSelect.options[unitTypeSelect.selectedIndex];
    const rate = selectedOption.getAttribute('data-rate');
    ratePerUnitInput.value = rate || '';
}

// Week Management
function getWeekString(date) {
    const year = date.getFullYear();
    const weekNum = getWeekNumber(date);
    return `${year}-W${weekNum.toString().padStart(2, '0')}`;
}

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

// Save/Load Data
function saveCurrentWeek() {
    const weekString = weekSelect.value;
    savedWeeks[weekString] = currentWeekData;
    localStorage.setItem('savedWeeks', JSON.stringify(savedWeeks));
}

function loadSavedData() {
    const saved = localStorage.getItem('savedWeeks');
    if (saved) {
        savedWeeks = JSON.parse(saved);
        updateWeeksList();
    }
}

// Update Displays
function displayWeekData(weekString) {
    productionData.innerHTML = '';
    currentWeekData = savedWeeks[weekString] || [];
    currentWeekData.forEach(entry => addEntry(entry));
}

function updateWeeksList() {
    weeksList.innerHTML = '';
    Object.keys(savedWeeks).sort().reverse().forEach(week => {
        const div = document.createElement('div');
        div.textContent = `Week ${week}`;
        div.onclick = () => {
            weekSelect.value = week;
            displayWeekData(week);
        };
        weeksList.appendChild(div);
    });
}

// Pay Period Calculations
function updatePayPeriodInfo() {
    // Calculate and display current pay period info
    const currentTotal = calculatePayPeriodTotal(getCurrentPayPeriod());
    document.getElementById('currentPayPeriod').textContent = `Current Pay Period: ${getCurrentPayPeriod().join(' to ')}`;
    document.getElementById('payPeriodTotal').textContent = `Total: $${currentTotal.toFixed(2)}`;
    
    // Calculate and display upcoming pay period info
    const upcomingTotal = calculatePayPeriodTotal(getUpcomingPayPeriod());
    document.getElementById('upcomingPayPeriod').textContent = `Next Pay Period: ${getUpcomingPayPeriod().join(' to ')}`;
    document.getElementById('upcomingPayPeriodTotal').textContent = `Total: $${upcomingTotal.toFixed(2)}`;
}

function getCurrentPayPeriod() {
    // Implement your pay period logic here
    // This is a placeholder that returns the current week
    const today = new Date();
    return [today.toISOString().split('T')[0], today.toISOString().split('T')[0]];
}

function getUpcomingPayPeriod() {
    // Implement your upcoming pay period logic here
    // This is a placeholder that returns next week
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return [nextWeek.toISOString().split('T')[0], nextWeek.toISOString().split('T')[0]];
}

function calculatePayPeriodTotal(period) {
    // Implement your total calculation logic here
    // This is a placeholder that returns the sum of all entries
    return currentWeekData.reduce((total, entry) => total + entry.earnings, 0);
}

// Excel Import Handler
function handleImport() {
    if (!fileInput.files.length) {
        alert('Please select a file first!');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            // Process the imported data
            jsonData.forEach(row => {
                // Adjust this according to your Excel structure
                const entry = {
                    date: row.Date,
                    unitType: row['Unit Type'],
                    units: row.Units,
                    rate: row.Rate,
                    earnings: row.Earnings,
                    notes: row.Notes || ''
                };
                addEntry(entry);
            });
            
            alert('Import successful!');
        } catch (error) {
            alert('Error importing file: ' + error.message);
        }
    };
    
    reader.readAsArrayBuffer(file);
}
