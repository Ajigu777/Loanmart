// ==============================
// Chart.js Initialization
// ==============================

// Loan Chart
const loanChartCtx = document.getElementById('loanChart').getContext('2d');
const loanChart = new Chart(loanChartCtx, {
    type: 'bar',
    data: {
        labels: ['Monthly', 'Weekly', 'Yearly'],
        datasets: [{
            label: 'Loan Repayment',
            data: [0, 0, 0],
            backgroundColor: ['#3b82f6', '#2563eb', '#1e40af']
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
    }
});

// Savings Chart
const savingsChartCtx = document.getElementById('savingsChart').getContext('2d');
const savingsChart = new Chart(savingsChartCtx, {
    type: 'line',
    data: {
        labels: [], // will be years
        datasets: [{
            label: 'Savings Growth',
            data: [],
            borderColor: '#10b981',
            fill: false,
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true } }
    }
});

// ==============================
// Loan Form Submission
// ==============================
const loanForm = document.getElementById('loan-form');
loanForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(loanForm);

    try {
        const response = await fetch('/add_loan', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Loan calculation failed.');

        const data = await response.json();

        // Update Loan Chart
        loanChart.data.datasets[0].data = [data.monthly, data.weekly, data.yearly];
        loanChart.update();

        // Optionally clear inputs
        loanForm.reset();
    } catch (err) {
        alert(err.message);
    }
});

// ==============================
// Savings Form Submission
// ==============================
const savingsForm = document.getElementById('savings-form');
savingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(savingsForm);

    try {
        const response = await fetch('/add_savings', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Savings calculation failed.');

        const data = await response.json();

        // Update Savings Chart
        savingsChart.data.labels = data.labels; // usually years 1..n
        savingsChart.data.datasets[0].data = data.values; // yearly savings
        savingsChart.update();

        // Optionally clear inputs
        savingsForm.reset();
    } catch (err) {
        alert(err.message);
    }
});

// ==============================
// CTA Login/Register Form
// ==============================
const ctaForm = document.querySelector('#cta form');
if (ctaForm) {
    ctaForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(ctaForm);

        try {
            const response = await fetch('/register_or_login', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Registration/Login failed.');

            const data = await response.json();

            if (data.success) {
                alert('Welcome, ' + data.username + '!');
                window.location.href = '/'; // redirect to index after login
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert(err.message);
        }
    });
}

// ==============================
// Optional: Mobile Menu Toggle
// ==============================
const menuBtn = document.querySelector('nav button');
const navMenu = document.querySelector('nav .md\\:flex');

if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('hidden');
    });
}
