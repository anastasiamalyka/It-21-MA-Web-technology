const fs = require("fs");

const text = fs.readFileSync("notes.txt", "utf8");
console.log(text);

const header = "Парний варіант - виконано студентом Прізвище Ім'я";
const result = header + "\n" + text;

fs.writeFileSync("output_notes.txt", result, "utf8");
console.log("Файл output_notes.txt створено");
