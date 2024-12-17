document.getElementById('processButton').addEventListener('click', fetchAndProcess);
document.getElementById('copyButton').addEventListener('click', copyToClipboard);

function convertToCsvUrl(sheetUrl) {
    // Конвертація URL у формат CSV
    const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)\//);
    if (!match) {
        throw new Error("Неправильне посилання на Google Таблицю.");
    }
    const sheetId = match[1];
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
}

async function fetchAndProcess() {
    const sheetUrl = document.getElementById('sheetUrl').value;
    const output = document.getElementById('output');
    const status = document.getElementById('status');

    if (!sheetUrl) {
        alert("Будь ласка, введіть посилання на Google Таблицю.");
        return;
    }

    status.textContent = "Отримання даних...";

    try {
        // Конвертація Google URL у CSV
        const csvUrl = convertToCsvUrl(sheetUrl);
        
        // Отримуємо дані у форматі CSV
        const response = await fetch(csvUrl);
        const csvText = await response.text();

        // Розбираємо CSV у масив рядків та стовпців
        const rows = csvText.trim().split("\n").map(row => row.split(","));

        // Фільтруємо стовпчики від D до K (індекси від 3 до 10)
        const filteredColumns = rows.map(row => row.slice(3, 11));

        // Підрахунок значень (0–4) та сум
        const counts = [];
        const columnSums = [];

        for (let col = 0; col < 8; col++) {
            const columnCounts = [0, 0, 0, 0, 0]; // Лічильники для 0, 1, 2, 3, 4
            let columnSum = 0;

            for (let row = 1; row < filteredColumns.length; row++) { // Пропускаємо заголовок
                const value = parseInt(filteredColumns[row][col], 10);
                if (value >= 0 && value <= 4) {
                    columnCounts[value]++;
                    columnSum++;
                }
            }

            counts.push(...columnCounts);
            columnSums.push(columnSum);
        }

        // Формуємо вихідний результат
        const result = counts.join("\t") + "\t" + columnSums.join("\t");
        output.value = result;

        status.textContent = "Обробка завершена!";
    } catch (error) {
        console.error(error);
        status.textContent = "Помилка при отриманні або обробці даних!";
    }
}

function copyToClipboard() {
    const output = document.getElementById('output');
    output.select();
    document.execCommand("copy");
    alert("Результат скопійовано в буфер обміну!");
}
