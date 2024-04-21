// Declare myChart variable outside the renderChart function scope
let myChart;

// Function to fetch user's name and update HTML content
function fetchAndDisplayUserName() {
    // Make an AJAX request to fetch user's name from the server
    fetch('/usersbase/user')
        .then(response => response.json())
        .then(data => {
            // Update HTML content with user's name
            document.getElementById('userName').textContent = data.name;
            // Now that the user's name is displayed, render the chart
            renderChart(data.userId); // Pass userId to renderChart function
        })
        .catch(error => console.error('Error fetching user name:', error));
}

// Function to render the chart
function renderChart(userId) {
    document.getElementById('expenseForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        // Get income value from form
        const income = parseFloat(document.getElementById('income').value);

        // Get expense values from form
        const expenses = [];
        for (let i = 1; i <= 12; i++) {
            expenses.push(parseFloat(document.getElementById(`expense${i}`).value));
        }

        // Calculate savings
        const savings = [];
        const accumulatedSavings = []; // Array to store accumulated savings
        let totalSavings = 0; // Variable to store total savings
        for (let i = 0; i < 12; i++) {
            const saving = income - expenses[i];
            totalSavings += saving;
            savings.push(saving);
            accumulatedSavings.push(totalSavings);
        }

        // Filter out null values from the expenses array
        const filteredExpenses = expenses.filter(expense => expense !== null);

        // Send expense data to the server
        fetch('/usersbase/saveExpenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId, // Pass userId to the server
                expenses: filteredExpenses // Assuming expenses is an array containing monthly expenses
            })
        })
        .then(response => {
            if (response.ok) {
                console.log('Expenses saved successfully');
            } else {
                throw new Error('Failed to save expenses');
            }
        })
        .catch(error => console.error('Error saving expenses:', error));

        // If myChart exists, update the chart data
        if (myChart) {
            myChart.data.datasets[0].data = expenses; // Update expense data
            myChart.data.datasets[1].data = savings; // Update savings data
            myChart.update(); // Update the chart
        } else {
            // Create a new chart instance if myChart does not exist
            const ctx = document.getElementById('myChart').getContext('2d');
            myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                    datasets: [{
                        label: 'Monthly Expenses',
                        data: expenses,
                        borderColor: 'red',
                        fill: false
                    }, {
                        label: 'Monthly Savings',
                        data: savings,
                        borderColor: 'blue',
                        fill: false
                    }, {
                        label: 'Accumulated Savings',
                        data: accumulatedSavings,
                        borderColor: 'green',
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        x: {
                            type: 'category', // Ensure x-axis is treated as a category scale
                            max: 'December', // Set the maximum value for the x-axis
                            beginAtZero: true // Optionally, begin the scale at zero
                        },
                        y: {
                            beginAtZero: true // Begin y-axis scale at zero
                        }
                    }
                }
            });
        }
    });
}

// Call the function to fetch and display user's name when the page loads
fetchAndDisplayUserName();
