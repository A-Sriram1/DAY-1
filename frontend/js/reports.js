const API_URL = 'http://127.0.0.1:5000';

document.addEventListener('DOMContentLoaded', loadReportData);

async function loadReportData() {
    try {
        const response = await fetch(`${API_URL}/cars`);
        const data = await response.json();
        
        analyzeData(data);
    } catch (error) {
        console.error('Failed to load data for reports', error);
    }
}

function analyzeData(data) {
    let dirtyCount = 0;
    const brands = {};
    const fuels = {};
    const years = {};

    data.forEach(car => {
        // Simple dirty check logic
        let isDirty = false;
        if (!car.brand || car.brand.trim() === '') isDirty = true;
        if (!car.price || car.price <= 0) isDirty = true;
        if (!car.mileage || car.mileage <= 0) isDirty = true;
        
        if (isDirty) {
            dirtyCount++;
        }

        // Aggregate Brands
        const brand = (car.brand && car.brand.trim() !== '') ? car.brand.trim().toUpperCase() : 'UNKNOWN';
        brands[brand] = (brands[brand] || 0) + 1;

        // Aggregate Fuels
        const fuel = (car.fuel && car.fuel.trim() !== '') ? car.fuel.trim().toUpperCase() : 'UNKNOWN';
        fuels[fuel] = (fuels[fuel] || 0) + 1;

        // Aggregate Years for Avg Price
        if (car.year && car.price > 0) {
            if (!years[car.year]) years[car.year] = { sum: 0, count: 0 };
            years[car.year].sum += car.price;
            years[car.year].count += 1;
        }
    });

    // Update Top Stats
    document.getElementById('cleanRecords').textContent = data.length - dirtyCount;
    document.getElementById('dirtyRecords').textContent = dirtyCount;

    // Render Charts
    renderBrandChart(brands);
    renderFuelChart(fuels);
    renderYearChart(years);
}

function renderBrandChart(brandsData) {
    const ctx = document.getElementById('brandChart').getContext('2d');
    
    // Sort and get top 5
    const sorted = Object.entries(brandsData).sort((a,b) => b[1] - a[1]).slice(0, 5);
    const labels = sorted.map(i => i[0]);
    const values = sorted.map(i => i[1]);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function renderFuelChart(fuelsData) {
    const ctx = document.getElementById('fuelChart').getContext('2d');
    
    const labels = Object.keys(fuelsData);
    const values = Object.values(fuelsData);

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function renderYearChart(yearsData) {
    const ctx = document.getElementById('yearChart').getContext('2d');
    
    const labels = Object.keys(yearsData).sort();
    const values = labels.map(year => Math.round(yearsData[year].sum / yearsData[year].count));

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Price ($)',
                data: values,
                borderColor: '#2563EB',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
