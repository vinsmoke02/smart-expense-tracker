document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const expenseForm = document.getElementById('expenseForm');
    const expenseModal = document.getElementById('expenseModal');
    const addExpenseBtn = document.querySelector('.add-expense');
    const closeModalBtn = document.querySelector('.close-modal');
    const expensesList = document.querySelector('.expenses-list');
    const allExpensesList = document.querySelector('.all-expenses-list');
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('.section');
    const themeToggle = document.querySelector('.theme-toggle');
    const totalSpendingElement = document.querySelector('.total-spending .amount');
    const remainingBudgetElement = document.querySelector('.remaining-budget .amount');
    const biggestExpenseElement = document.querySelector('.biggest-expense .amount');
    const biggestExpenseCategory = document.querySelector('.biggest-expense .category');
    const categoryFilter = document.getElementById('category-filter');
    const monthFilter = document.getElementById('month-filter');
    const insightsGrid = document.querySelector('.insights-grid');
    const budgetsList = document.querySelector('.budgets-list');
    const progressBars = document.querySelector('.progress-bars');
    const addBudgetBtn = document.querySelector('.add-budget');
    const reportType = document.getElementById('report-type');
    const reportMonth = document.getElementById('report-month');
    const generateReportBtn = document.querySelector('.generate-report');
    const reportResults = document.querySelector('.report-results');
    const comparisonChartCtx = document.getElementById('comparisonChart');
    const editBudgetBtn = document.querySelector('.edit-budget');
    const budgetForm = document.querySelector('.budget-form');
    const budgetInput = document.querySelector('.budget-input');
    const saveBudgetBtn = document.querySelector('.save-budget');
    const cancelBudgetBtn = document.querySelector('.cancel-budget');

    // Initialize data
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;
    let categoryBudgets = JSON.parse(localStorage.getItem('categoryBudgets')) || {};

    // Initialize charts
    let trendChart, categoryChart, comparisonChart;

    // Initialize the app
    initializeApp();

    // Event Listeners
    addExpenseBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    expenseForm.removeEventListener('submit', handleSubmit);
    expenseForm.addEventListener('submit', handleSubmit);
    categoryFilter.addEventListener('change', filterExpenses);
    monthFilter.addEventListener('change', filterExpenses);
    themeToggle.addEventListener('click', toggleTheme);
    addBudgetBtn.addEventListener('click', openBudgetModal);
    generateReportBtn.addEventListener('click', generateReport);
    editBudgetBtn.addEventListener('click', toggleBudgetForm);
    saveBudgetBtn.addEventListener('click', saveBudget);
    cancelBudgetBtn.addEventListener('click', cancelBudgetEdit);

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === expenseModal) {
            closeModal();
        }
    });

    // Functions
    function initializeApp() {
        initCharts();
        setupNavigation();
        renderExpenses();
        renderAllExpenses();
        updateAnalytics();
        updateBudgetProgress();
        initializeTheme();
    }

    function initializeTheme() {
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-theme');
            const icon = themeToggle.querySelector('i');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const icon = themeToggle.querySelector('i');
        
        if (document.body.classList.contains('dark-theme')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        }
    }

    function setupNavigation() {
        // Hide all sections initially
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show dashboard by default
        document.querySelector('#dashboard').classList.add('active');
        
        // Set dashboard as active in nav
        document.querySelector('nav ul li a[href="#dashboard"]').parentElement.classList.add('active');

        // Add click event to each nav link
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                
                // Remove active class from all nav items
                navLinks.forEach(navLink => {
                    navLink.parentElement.classList.remove('active');
                });
                
                // Add active class to clicked nav item
                this.parentElement.classList.add('active');
                
                // Hide all sections
                document.querySelectorAll('.section').forEach(section => {
                    section.classList.remove('active');
                });
                
                // Show target section
                document.querySelector(targetId).classList.add('active');
                
                // If expenses section, render all expenses
                if (targetId === '#expenses') {
                    renderAllExpenses();
                }
                // If analytics section, update charts
                else if (targetId === '#analytics') {
                    updateComparisonChart();
                    updateCategoryInsights();
                }
                // If budgets section, update progress
                else if (targetId === '#budgets') {
                    updateBudgetProgress();
                }
            });
        });
    }

    function openModal() {
    expenseModal.style.display = 'flex';
    document.getElementById('date').valueAsDate = new Date();

    // Reset form for new input
    expenseForm.reset();

    // Set submit button text
    expenseForm.querySelector('button[type="submit"]').textContent = 'Save Expense';

    // ✅ DO NOT add another submit handler here
    if (expenseForm.dataset.editId) {
        delete expenseForm.dataset.editId;
    }
}


    function closeModal() {
        expenseModal.style.display = 'none';
    }

    function handleSubmit(e) {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid positive amount');
            return;
        }
        
        if (!category) {
            alert('Please select a category');
            return;
        }
        
        // Check if we're editing an existing expense
        const isEdit = expenseForm.dataset.editId;
        
        if (isEdit) {
            // Update existing expense
            const id = parseInt(expenseForm.dataset.editId);
            const index = expenses.findIndex(exp => exp.id === id);
            
            expenses[index] = {
                id: id,
                amount: amount,
                category: category,
                description: description,
                date: date
            };
        } else {
            // Create new expense
            const newExpense = {
                id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
                amount: amount,
                category: category,
                description: description,
                date: date
            };
            expenses.push(newExpense);
        }
        
        // Save to localStorage
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        // Update UI
        renderExpenses();
        renderAllExpenses();
        updateAnalytics();
        updateCharts();
        updateComparisonChart();
        updateCategoryInsights();
        updateBudgetProgress();
        closeModal();
    }

    function renderExpenses() {
        expensesList.innerHTML = '';
        
        if (expenses.length === 0) {
            expensesList.innerHTML = '<p class="no-expenses">No expenses added yet</p>';
            return;
        }
        
        // Sort by date (newest first)
        const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Show only recent expenses (last 5)
        const recentExpenses = sortedExpenses.slice(0, 5);
        
        recentExpenses.forEach(expense => {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';
            
            const categoryInfo = getCategoryInfo(expense.category);
            
            expenseItem.innerHTML = `
                <div class="expense-info">
                    <div class="expense-icon" style="background-color: ${categoryInfo.bgColor}; color: ${categoryInfo.color}">
                        <i class="${categoryInfo.icon}"></i>
                    </div>
                    <div class="expense-details">
                        <h4>₹${expense.amount.toFixed(2)}</h4>
                        <p class="expense-category">${categoryInfo.name}</p>
                    </div>
                </div>
                <div class="expense-description">
                    <p>${expense.description || 'No description'}</p>
                    <small>${formatDate(expense.date)}</small>
                </div>
                <button class="delete-expense" data-id="${expense.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            expensesList.appendChild(expenseItem);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-expense').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteExpense(id);
            });
        });
    }

    function renderAllExpenses() {
        allExpensesList.innerHTML = '';
        
        if (expenses.length === 0) {
            allExpensesList.innerHTML = '<p class="no-expenses">No expenses found</p>';
            return;
        }
        
        // Sort by date (newest first)
        const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedExpenses.forEach(expense => {
            const expenseRow = document.createElement('div');
            expenseRow.className = 'expense-row';
            
            const categoryInfo = getCategoryInfo(expense.category);
            
            expenseRow.innerHTML = `
                <div class="expense-date">${formatDate(expense.date)}</div>
                <div class="expense-description">${expense.description || 'No description'}</div>
                <div class="expense-category">
                    <span class="expense-category-badge" style="background-color: ${categoryInfo.bgColor}; color: ${categoryInfo.color}">
                        <i class="${categoryInfo.icon}"></i> ${categoryInfo.name}
                    </span>
                </div>
                <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
                <div class="expense-actions">
                    <button class="edit-btn" data-id="${expense.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" data-id="${expense.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            allExpensesList.appendChild(expenseRow);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteExpense(id);
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                editExpense(id);
            });
        });
    }

    function filterExpenses() {
        const category = categoryFilter.value;
        const month = monthFilter.value;
        
        let filteredExpenses = [...expenses];
        
        // Filter by category if selected
        if (category) {
            filteredExpenses = filteredExpenses.filter(expense => expense.category === category);
        }
        
        // Filter by month if selected
        if (month) {
            const [year, monthNum] = month.split('-');
            filteredExpenses = filteredExpenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getFullYear() === parseInt(year) && 
                       (expenseDate.getMonth() + 1) === parseInt(monthNum);
            });
        }
        
        // Display filtered expenses
        displayFilteredExpenses(filteredExpenses);
    }

    function displayFilteredExpenses(filteredExpenses) {
        allExpensesList.innerHTML = '';
        
        if (filteredExpenses.length === 0) {
            allExpensesList.innerHTML = '<p class="no-expenses">No expenses match your filters</p>';
            return;
        }
        
        filteredExpenses.forEach(expense => {
            const expenseRow = document.createElement('div');
            expenseRow.className = 'expense-row';
            
            const categoryInfo = getCategoryInfo(expense.category);
            
            expenseRow.innerHTML = `
                <div class="expense-date">${formatDate(expense.date)}</div>
                <div class="expense-description">${expense.description || 'No description'}</div>
                <div class="expense-category">
                    <span class="expense-category-badge" style="background-color: ${categoryInfo.bgColor}; color: ${categoryInfo.color}">
                        <i class="${categoryInfo.icon}"></i> ${categoryInfo.name}
                    </span>
                </div>
                <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
                <div class="expense-actions">
                    <button class="edit-btn" data-id="${expense.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" data-id="${expense.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            allExpensesList.appendChild(expenseRow);
        });
        
        // Reattach event listeners to action buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteExpense(id);
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                editExpense(id);
            });
        });
    }

    function editExpense(id) {
        const expense = expenses.find(exp => exp.id === id);
        if (!expense) return;
        
        // Fill the form with expense data
        document.getElementById('amount').value = expense.amount;
        document.getElementById('category').value = expense.category;
        document.getElementById('date').value = expense.date;
        document.getElementById('description').value = expense.description || '';
        
        // Set the form to edit mode
        expenseForm.dataset.editId = id;
        expenseForm.querySelector('button[type="submit"]').textContent = 'Update Expense';
        
        // Open the modal
        expenseModal.style.display = 'flex';
    }

    function deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            expenses = expenses.filter(expense => expense.id !== id);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            renderExpenses();
            renderAllExpenses();
            updateAnalytics();
            updateCharts();
            updateComparisonChart();
            updateCategoryInsights();
            updateBudgetProgress();
        }
    }

    function updateAnalytics() {
        // Calculate total spending
        const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        totalSpendingElement.textContent = `₹${totalSpending.toFixed(2)}`;
        
        // Update remaining budget
        if (monthlyBudget > 0) {
            const remaining = monthlyBudget - totalSpending;
            remainingBudgetElement.textContent = `₹${remaining.toFixed(2)}`;
            
            // Visual feedback for budget status
            if (remaining < 0) {
                remainingBudgetElement.parentElement.classList.add('over-budget');
            } else {
                remainingBudgetElement.parentElement.classList.remove('over-budget');
            }
        } else {
            remainingBudgetElement.textContent = 'Set budget';
            remainingBudgetElement.parentElement.classList.remove('over-budget');
        }
        
        // Update biggest expense
        if (expenses.length > 0) {
            const biggest = expenses.reduce((max, expense) => 
                expense.amount > max.amount ? expense : max, expenses[0]);
            biggestExpenseElement.textContent = `₹${biggest.amount.toFixed(2)}`;
            biggestExpenseCategory.textContent = getCategoryInfo(biggest.category).name;
        } else {
            biggestExpenseElement.textContent = '₹0';
            biggestExpenseCategory.textContent = 'None';
        }
    }

    function initCharts() {
        // Trend Chart (Line)
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        trendChart = new Chart(trendCtx, {
            type: 'line',
            data: getTrendChartData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
        
        // Category Chart (Doughnut)
        const categoryCtx = document.getElementById('categoryChart').getContext('2d');
        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: getCategoryChartData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } },
                cutout: '70%'
            }
        });

        // Comparison Chart (Bar)
        comparisonChart = new Chart(comparisonChartCtx, {
        type: 'bar',
        data: getComparisonChartData(),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount (₹)'
                    }
                },
                x: { 
                    title: {
                        display: true,
                        text: 'Month'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ₹${context.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
    }

    function updateCharts() {
        trendChart.data = getTrendChartData();
        trendChart.update();
        categoryChart.data = getCategoryChartData();
        categoryChart.update();
    }

    function updateComparisonChart() {
    comparisonChart.data.datasets = []; // Clear old datasets
    const newData = getComparisonChartData();
    comparisonChart.data.labels = newData.labels;
    comparisonChart.data.datasets = newData.datasets;
    comparisonChart.update();
}


    function getTrendChartData() {
        const monthlyData = {};
        
        // Group expenses by month
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
            
            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = 0;
            }
            
            monthlyData[monthYear] += expense.amount;
        });
        
        // Get last 6 months
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
            months.push({
                label: date.toLocaleDateString('en-US', { month: 'short' }),
                key: monthYear
            });
        }
        
        return {
            labels: months.map(m => m.label),
            datasets: [{
                label: 'Monthly Spending',
                data: months.map(m => monthlyData[m.key] || 0),
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        };
    }

    function getCategoryChartData() {
        const categoryData = {};
        const categoryNames = {
            food: 'Food',
            transport: 'Transport',
            shopping: 'Shopping',
            entertainment: 'Entertainment',
            bills: 'Bills',
            other: 'Other',
            education: 'Education'
        };
        
        // Calculate totals per category
        expenses.forEach(expense => {
            categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
        });
        
        const labels = [];
        const data = [];
        const backgroundColors = [
            '#4cc9f0',
            '#7209b7',
            '#f72585',
            '#4895ef',
            '#3a0ca3',
            '#4361ee',
            '#3a86ff'
        ];
        
        // Prepare data for chart
        Object.entries(categoryData).forEach(([category, amount], index) => {
            labels.push(categoryNames[category]);
            data.push(amount);
        });
        
        return {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderWidth: 0
            }]
        };
    }

    function getComparisonChartData() {
    // Initialize data structure for last 3 months
    const now = new Date();
    const months = [];
    const monthlyCategoryData = {};
    const categories = new Set();
    
    // Create array of last 3 months with empty data
    for (let i = 2; i >= 0; i--) {  // Changed from 5 to 2 for 3 months
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
        
        months.push({
            label: monthLabel,
            key: monthKey
        });
        
        monthlyCategoryData[monthKey] = {};
    }

    // Calculate spending per category per month
    expenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const category = expense.category;
        
        // Only process if this month is in our 3-month window
        if (monthlyCategoryData[monthKey]) {
            if (!monthlyCategoryData[monthKey][category]) {
                monthlyCategoryData[monthKey][category] = 0;
            }
            monthlyCategoryData[monthKey][category] += expense.amount;
            categories.add(category);
        }
    });

    // Prepare datasets for each category
    const categoryColors = {
        food: 'rgba(76, 201, 240, 0.7)',
        transport: 'rgba(114, 9, 183, 0.7)',
        shopping: 'rgba(247, 37, 133, 0.7)',
        entertainment: 'rgba(72, 149, 239, 0.7)',
        bills: 'rgba(58, 12, 163, 0.7)',
        other: 'rgba(67, 97, 238, 0.7)',
        education: 'rgba(58, 134, 255, 0.7)'
    };

    const datasets = Array.from(categories).map(category => {
        return {
            label: getCategoryInfo(category).name,
            data: months.map(m => monthlyCategoryData[m.key][category] || 0),
            backgroundColor: categoryColors[category] || 'rgba(67, 97, 238, 0.7)',
            borderColor: categoryColors[category] || 'rgba(67, 97, 238, 1)',
            borderWidth: 1
        };
    });

    return {
        labels: months.map(m => m.label),
        datasets: datasets
    };
}

    function updateCategoryInsights() {
        insightsGrid.innerHTML = '';
        
        // Calculate total spending per category
        const categoryTotals = {};
        expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });
        
        // Calculate percentage of total spending
        const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        // Create insight cards for each category
        Object.entries(categoryTotals).forEach(([category, amount]) => {
            const percentage = totalSpending > 0 ? (amount / totalSpending * 100).toFixed(1) : 0;
            const categoryInfo = getCategoryInfo(category);
            
            const insightCard = document.createElement('div');
            insightCard.className = 'insight-card';
            insightCard.innerHTML = `
                <div class="insight-value">₹${amount.toFixed(2)}</div>
                <div class="insight-category" style="color: ${categoryInfo.color}">
                    <i class="${categoryInfo.icon}"></i> ${categoryInfo.name}
                </div>
                <div class="insight-label">${percentage}% of total</div>
            `;
            
            insightsGrid.appendChild(insightCard);
        });
    }

    function updateBudgetProgress() {
        budgetsList.innerHTML = '';
        progressBars.innerHTML = '';
        
        // Calculate spending per category
        const categorySpending = {};
        expenses.forEach(expense => {
            categorySpending[expense.category] = (categorySpending[expense.category] || 0) + expense.amount;
        });
        
        // Create budget items and progress bars
        Object.entries(categoryBudgets).forEach(([category, budget]) => {
            const spending = categorySpending[category] || 0;
            const percentage = Math.min((spending / budget * 100), 100);
            const remaining = budget - spending;
            const categoryInfo = getCategoryInfo(category);
            
            // Budget item
            const budgetItem = document.createElement('div');
            budgetItem.className = 'budget-item';
            budgetItem.innerHTML = `
                <div class="budget-category">
                    <i class="${categoryInfo.icon}" style="color: ${categoryInfo.color}"></i>
                    <span>${categoryInfo.name}</span>
                </div>
                <div class="budget-amount">₹${budget.toFixed(2)}</div>
            `;
            budgetsList.appendChild(budgetItem);
            
            // Progress bar
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-bar-container';
            progressContainer.innerHTML = `
                <div class="progress-bar-label">
                    <span>${categoryInfo.name}</span>
                    <span>₹${spending.toFixed(2)} of ₹${budget.toFixed(2)} (${percentage.toFixed(1)}%)</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${percentage}%; background-color: ${categoryInfo.color}"></div>
                </div>
            `;
            progressBars.appendChild(progressContainer);
        });
    }

    function toggleBudgetForm() {
        budgetForm.style.display = budgetForm.style.display === 'none' ? 'flex' : 'none';
    }

    function saveBudget() {
        const budgetValue = parseFloat(budgetInput.value);
        
        if (isNaN(budgetValue)) {
            alert('Please enter a valid number');
            return;
        }
        
        monthlyBudget = budgetValue;
        localStorage.setItem('monthlyBudget', monthlyBudget);
        
        // Update UI
        updateAnalytics();
        toggleBudgetForm();
    }

    function cancelBudgetEdit() {
        budgetInput.value = '';
        toggleBudgetForm();
    }

    function openBudgetModal() {
        const budgetModal = document.getElementById('budgetModal');
        budgetModal.style.display = 'flex';
    }

    function generateReport() {
        const type = reportType.value;
        const month = reportMonth.value;
        
        let reportData = [];
        let reportTitle = '';
        
        switch (type) {
            case 'monthly':
                if (!month) {
                    alert('Please select a month');
                    return;
                }
                const [year, monthNum] = month.split('-');
                reportData = expenses.filter(expense => {
                    const expenseDate = new Date(expense.date);
                    return expenseDate.getFullYear() === parseInt(year) && 
                           (expenseDate.getMonth() + 1) === parseInt(monthNum);
                });
                reportTitle = `Monthly Report for ${new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
                break;
                
            case 'category':
                const categoryTotals = {};
                expenses.forEach(expense => {
                    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
                });
                reportData = Object.entries(categoryTotals).map(([category, amount]) => {
                    return { category, amount };
                });
                reportTitle = 'Category Breakdown Report';
                break;
                
            case 'yearly':
                const yearlyData = {};
                expenses.forEach(expense => {
                    const year = new Date(expense.date).getFullYear();
                    yearlyData[year] = (yearlyData[year] || 0) + expense.amount;
                });
                reportData = Object.entries(yearlyData).map(([year, amount]) => {
                    return { year, amount };
                });
                reportTitle = 'Yearly Overview Report';
                break;
        }
        
        displayReport(reportData, reportTitle);
    }

    function displayReport(data, title) {
        reportResults.innerHTML = `
            <h3>${title}</h3>
            <div class="report-summary">
                ${generateReportSummary(data)}
            </div>
            <table class="report-table">
                ${generateReportTable(data)}
            </table>
        `;
    }

    function generateReportSummary(data) {
        if (data.length === 0) return '<p>No data available for this report</p>';
        
        if (reportType.value === 'monthly') {
            const total = data.reduce((sum, expense) => sum + expense.amount, 0);
            return `<p>Total spending: ₹${total.toFixed(2)} across ${data.length} expenses</p>`;
        } else if (reportType.value === 'category') {
            const total = data.reduce((sum, item) => sum + item.amount, 0);
            return `<p>Total spending: ₹${total.toFixed(2)} across ${data.length} categories</p>`;
        } else {
            const total = data.reduce((sum, item) => sum + item.amount, 0);
            return `<p>Total spending: ₹${total.toFixed(2)} across ${data.length} years</p>`;
        }
    }

    function generateReportTable(data) {
        if (data.length === 0) return '';
        
        if (reportType.value === 'monthly') {
            return `
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(expense => `
                        <tr>
                            <td>${formatDate(expense.date)}</td>
                            <td>${getCategoryInfo(expense.category).name}</td>
                            <td>${expense.description || '-'}</td>
                            <td>₹${expense.amount.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
        } else if (reportType.value === 'category') {
            return `
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => {
                        const total = data.reduce((sum, i) => sum + i.amount, 0);
                        const percentage = total > 0 ? (item.amount / total * 100).toFixed(1) : 0;
                        return `
                            <tr>
                                <td>${getCategoryInfo(item.category).name}</td>
                                <td>₹${item.amount.toFixed(2)}</td>
                                <td>${percentage}%</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            `;
        } else {
            return `
                <thead>
                    <tr>
                        <th>Year</th>
                        <th>Amount</th>
                        <th># of Expenses</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => {
                        const count = expenses.filter(e => new Date(e.date).getFullYear() === parseInt(item.year)).length;
                        return `
                            <tr>
                                <td>${item.year}</td>
                                <td>₹${item.amount.toFixed(2)}</td>
                                <td>${count}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            `;
        }
    }

    function getCategoryInfo(category) {
        const categories = {
            food: { name: 'Food', icon: 'fas fa-utensils', color: '#4cc9f0', bgColor: 'rgba(76, 201, 240, 0.1)' },
            transport: { name: 'Transport', icon: 'fas fa-bus', color: '#7209b7', bgColor: 'rgba(114, 9, 183, 0.1)' },
            shopping: { name: 'Shopping', icon: 'fas fa-shopping-bag', color: '#f72585', bgColor: 'rgba(247, 37, 133, 0.1)' },
            entertainment: { name: 'Entertainment', icon: 'fas fa-film', color: '#4895ef', bgColor: 'rgba(72, 149, 239, 0.1)' },
            bills: { name: 'Bills', icon: 'fas fa-file-invoice-dollar', color: '#3a0ca3', bgColor: 'rgba(58, 12, 163, 0.1)' },
            other: { name: 'Other', icon: 'fas fa-wallet', color: '#4361ee', bgColor: 'rgba(67, 97, 238, 0.1)' },
            education: { name: 'Education', icon: 'fas fa-graduation-cap', color: '#3a86ff', bgColor: 'rgba(58, 134, 255, 0.1)' }
        };
        return categories[category] || categories.other;
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
});