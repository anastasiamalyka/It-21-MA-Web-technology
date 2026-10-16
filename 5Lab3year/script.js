const button = document.getElementById('showTime');
const result = document.getElementById('result');

button.addEventListener('click', () => {
  fetch('/time/json')
    .then((response) => response.json())
    .then((data) => {
      result.textContent = `Поточний час: ${data.date}, ${data.time}`;
    });
});
