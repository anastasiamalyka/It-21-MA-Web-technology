const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, { //створення нового об'єкту
    type: 'pie',
    data: {
        labels: ['Робота', 'Навчання', 'Ігри', 'Інше'],
        datasets: [{  //набір масивів
            label: 'Час за комп\'ютером (год/день)',
            data: [0.5, 3, 3, 1],
            borderWidth: 1,
            backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(75, 192, 192, 0.6)'
            ]
        }]
    },
    options: {
        responsive: true  //автоматична зміна розміру
    }
});
