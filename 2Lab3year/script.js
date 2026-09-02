const singleCatUrl = "https://api.thecatapi.com/v1/images/search";
const galleryCatUrl = "https://api.thecatapi.com/v1/images/search?limit=5";

                                   // обробник подій          запит
document.getElementById("btnFetch").addEventListener("click", async () => {
  try {
    const response = await fetch(singleCatUrl);
    const data = await response.json();
    showCats(data, "Fetch");
  } catch (error) {
    console.error("Помилка fetch:", error);
    document.getElementById("result").innerHTML = "<p>Сталася помилка при завантаженні фото.</p>";
  }
});

document.getElementById("btnAxios").addEventListener("click", () => {
  axios.get(galleryCatUrl)
    .then(response => showCats(response.data, "Axios"))
    .catch(error => {
      console.error("Помилка axios:", error);
      document.getElementById("result").innerHTML = "<p>Сталася помилка при завантаженні фото.</p>";
    });
});

function showCats(data, method) {
  let html = `<h2>Дані отримані через ${method}</h2>`;
  html += '<div class="gallery">';  //оформлення фото до надпису
  for (let i = 0; i < data.length; i++) {
    html += `<img src="${data[i].url}" alt="Кіт">`;
  }
  html += "</div>";

  document.getElementById("result").innerHTML = html; 
}
