console.log("Script executed");
let myChart; // Declare myChart variable outside the event listener scope

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
    for (let i = 0; i < 12; i++) {
        savings.push(income - expenses[i]);
    }

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
                    label: 'Expenses',
                    data: expenses,
                    borderColor: 'red',
                    fill: false
                }, {
                    label: 'Savings',
                    data: savings,
                    borderColor: 'blue',
                    fill: false
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});


