const API_URL = '';
let currentData = [];
let currentPage = 1;
const itemsPerPage = 10;
let sortColumn = 'id';
let sortDirection = 'asc'; // 'asc' or 'desc'

// DOM Elements
const tableBody = document.getElementById('tableBody');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const carsTable = document.getElementById('carsTable');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const toastContainer = document.getElementById('toast-container');

// Event Listeners
document.addEventListener('DOMContentLoaded', init);
document.getElementById('refreshBtn').addEventListener('click', () => loadCars());
document.getElementById('cleanBtn').addEventListener('click', cleanDataset);
document.getElementById('printBtn').addEventListener('click', () => window.print());
document.getElementById('searchInput').addEventListener('input', handleSearch);
document.getElementById('applyFilterBtn').addEventListener('click', handleFilter);
document.getElementById('resetBtn').addEventListener('click', resetFilters);
document.getElementById('exportCsv').addEventListener('click', (e) => { e.preventDefault(); exportCSV(); });
document.getElementById('exportJson').addEventListener('click', (e) => { e.preventDefault(); exportJSON(); });
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
prevPageBtn.addEventListener('click', () => changePage(-1));
nextPageBtn.addEventListener('click', () => changePage(1));

// Sort Listeners
document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
        const column = th.getAttribute('data-sort');
        if (sortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortDirection = 'asc';
        }
        updateSortIcons();
        renderTable();
    });
});

async function init() {
    populateYearFilter();
    await loadCars();
}

function populateYearFilter() {
    const yearSelect = document.getElementById('yearFilter');
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 2010; i--) {
        // Only append if it doesn't already exist to avoid duplicates with HTML
        if (!yearSelect.querySelector(`option[value="${i}"]`)) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            yearSelect.appendChild(option);
        }
    }
}

function populateBrandFilter() {
    const brandSelect = document.getElementById('brandFilter');
    const currentOptions = Array.from(brandSelect.options).map(opt => opt.value);
    
    // Get unique valid brands
    const uniqueBrands = [...new Set(currentData
        .map(c => typeof c.brand === 'string' ? c.brand.trim() : '')
        .filter(b => b !== ''))].sort();
        
    uniqueBrands.forEach(brand => {
        if (!currentOptions.includes(brand)) {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandSelect.appendChild(option);
        }
    });
}

// Fetch Data
async function loadCars() {
    showLoading(true);
    try {
        const response = await fetch(`${API_URL}/cars`);
        if (!response.ok) throw new Error('Failed to fetch data');
        currentData = await response.json();
        currentPage = 1;
        populateBrandFilter();
        updateStats();
        renderTable();
        showToast('Data loaded successfully', 'success');
    } catch (error) {
        console.error(error);
        showToast('Error loading data. Is the backend running?', 'error');
        showEmptyState(true);
    } finally {
        showLoading(false);
    }
}

// Fetch Stats dynamically (Alternatively, we compute from currentData to keep it fast and responsive to search)
async function updateStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const stats = await response.json();
        
        document.getElementById('totalCars').textContent = stats.total_cars;
        document.getElementById('avgPrice').textContent = formatCurrency(stats.average_price);
        document.getElementById('avgMileage').textContent = formatNumber(stats.average_mileage);
        document.getElementById('highestPrice').textContent = formatCurrency(stats.highest_price);
        document.getElementById('lowestPrice').textContent = formatCurrency(stats.lowest_price);
    } catch (error) {
        console.error("Error fetching stats", error);
    }
}

// Alternatively, compute stats locally based on filtered data (Better for live search/filter)
function computeLocalStats() {
    if (currentData.length === 0) {
        document.getElementById('totalCars').textContent = '0';
        document.getElementById('avgPrice').textContent = '$0';
        document.getElementById('avgMileage').textContent = '0';
        document.getElementById('highestPrice').textContent = '$0';
        document.getElementById('lowestPrice').textContent = '$0';
        return;
    }

    const validPrices = currentData.filter(c => typeof c.price === 'number' && c.price > 0).map(c => c.price);
    const validMileages = currentData.filter(c => typeof c.mileage === 'number' && c.mileage > 0).map(c => c.mileage);

    const totalCars = currentData.length;
    const avgPrice = validPrices.length ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length : 0;
    const highestPrice = validPrices.length ? Math.max(...validPrices) : 0;
    const lowestPrice = validPrices.length ? Math.min(...validPrices) : 0;
    const avgMileage = validMileages.length ? validMileages.reduce((a, b) => a + b, 0) / validMileages.length : 0;

    document.getElementById('totalCars').textContent = totalCars;
    document.getElementById('avgPrice').textContent = formatCurrency(avgPrice);
    document.getElementById('avgMileage').textContent = formatNumber(avgMileage);
    document.getElementById('highestPrice').textContent = formatCurrency(highestPrice);
    document.getElementById('lowestPrice').textContent = formatCurrency(lowestPrice);
}

// Table Rendering
function renderTable() {
    if (currentData.length === 0) {
        showEmptyState(true);
        tableBody.innerHTML = '';
        pageInfo.textContent = 'Showing 0 to 0 of 0 entries';
        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;
        computeLocalStats();
        return;
    }

    showEmptyState(false);
    
    // Sort
    let sortedData = [...currentData].sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];
        
        // Handle string comparisons gracefully
        if (typeof valA === 'string') valA = valA.toLowerCase().trim();
        if (typeof valB === 'string') valB = valB.toLowerCase().trim();
        
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Paginate
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = sortedData.slice(start, end);

    // Update DOM
    tableBody.innerHTML = paginatedData.map(car => {
        // Highlight bad data for demo purposes
        const isBadBrand = !car.brand || car.brand.trim() === '';
        const isBadPrice = !car.price || car.price <= 0;
        const isBadMileage = !car.mileage || car.mileage <= 0;
        const isBadFuel = !car.fuel || car.fuel.trim() === '';

        return `
            <tr>
                <td>${car.id}</td>
                <td class="${isBadBrand ? 'bad-data' : ''}">${car.brand || 'N/A'}</td>
                <td>${car.model || 'N/A'}</td>
                <td>${car.year}</td>
                <td class="${isBadPrice ? 'bad-data' : ''}">${formatCurrency(car.price)}</td>
                <td class="${isBadMileage ? 'bad-data' : ''}">${formatNumber(car.mileage)}</td>
                <td class="${isBadFuel ? 'bad-data' : ''}"><span class="badge">${car.fuel || 'Unknown'}</span></td>
                <td>${car.transmission}</td>
                <td>${car.location}</td>
            </tr>
        `;
    }).join('');

    // Update Pagination Info
    pageInfo.textContent = `Showing ${start + 1} to ${Math.min(end, sortedData.length)} of ${sortedData.length} entries`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    computeLocalStats(); // Update stats based on current visible dataset
}

function changePage(delta) {
    currentPage += delta;
    renderTable();
}

function updateSortIcons() {
    document.querySelectorAll('th[data-sort] i').forEach(icon => {
        icon.className = 'fa-solid fa-sort'; // Reset all
    });
    
    const activeTh = document.querySelector(`th[data-sort="${sortColumn}"] i`);
    if (activeTh) {
        activeTh.className = sortDirection === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
    }
}

// Search
let searchTimeout;
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    clearTimeout(searchTimeout);
    
    showLoading(true);
    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error();
            currentData = await response.json();
            currentPage = 1;
            renderTable();
        } catch (error) {
            console.error(error);
            showToast('Search failed', 'error');
        } finally {
            showLoading(false);
        }
    }, 300); // debounce
}

// Filter
async function handleFilter() {
    const brand = document.getElementById('brandFilter').value;
    const fuel = document.getElementById('fuelFilter').value;
    const transmission = document.getElementById('transmissionFilter').value;
    const year = document.getElementById('yearFilter').value;

    let params = new URLSearchParams();
    if (brand) params.append('brand', brand);
    if (fuel) params.append('fuel', fuel);
    if (transmission) params.append('transmission', transmission);
    if (year) params.append('year', year);

    showLoading(true);
    try {
        const response = await fetch(`${API_URL}/filter?${params.toString()}`);
        if (!response.ok) throw new Error();
        currentData = await response.json();
        currentPage = 1;
        renderTable();
        showToast('Filters applied', 'success');
    } catch (error) {
        console.error(error);
        showToast('Filter failed', 'error');
    } finally {
        showLoading(false);
    }
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('fuelFilter').value = '';
    document.getElementById('transmissionFilter').value = '';
    document.getElementById('yearFilter').value = '';
    loadCars(); // Reloads all
}

// Clean Dataset
async function cleanDataset() {
    showLoading(true);
    try {
        const response = await fetch(`${API_URL}/clean`, { method: 'POST' });
        if (!response.ok) throw new Error();
        currentData = await response.json();
        currentPage = 1;
        renderTable();
        showToast('Dataset cleaned successfully! Bad data removed.', 'success');
    } catch (error) {
        console.error(error);
        showToast('Failed to clean dataset', 'error');
    } finally {
        showLoading(false);
    }
}

// Export CSV
function exportCSV() {
    if (currentData.length === 0) return showToast('No data to export', 'error');
    
    const headers = Object.keys(currentData[0]).join(',');
    const rows = currentData.map(obj => {
        return Object.values(obj).map(val => {
            // Escape commas and quotes for CSV
            if (typeof val === 'string') {
                return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        }).join(',');
    });
    
    const csvContent = [headers, ...rows].join('\n');
    downloadFile(csvContent, 'cars_data.csv', 'text/csv');
}

// Export JSON
function exportJSON() {
    if (currentData.length === 0) return showToast('No data to export', 'error');
    
    const jsonContent = JSON.stringify(currentData, null, 2);
    downloadFile(jsonContent, 'cars_data.json', 'application/json');
}

function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${fileName}`, 'success');
}

// Utilities
function showLoading(show) {
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

function showEmptyState(show) {
    if (show) {
        emptyState.classList.remove('hidden');
        carsTable.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        carsTable.classList.remove('hidden');
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse forwards';
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function formatCurrency(value) {
    if (!value || isNaN(value) || value <= 0) return 'Invalid';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatNumber(value) {
    if (!value || isNaN(value) || value <= 0) return 'Invalid';
    return new Intl.NumberFormat('en-US').format(Math.round(value));
}

function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.body.removeAttribute('data-theme');
        document.getElementById('themeToggle').innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
}
