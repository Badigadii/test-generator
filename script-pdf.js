document.getElementById('file-input')?.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
        console.log("📄 Загружаем PDF...");

        const fileReader = new FileReader();
        fileReader.onload = async function () {
            const typedArray = new Uint8Array(fileReader.result);

            // Читаем PDF
            const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

            let fullText = '';

            // Собираем текст из всех страниц
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + ' ';
            }

            console.log("📄 Полный текст из PDF:", fullText.slice(0, 500));

            // Разбиваем на части
            const chunkSize = 40000; // ~10,000 токенов
            const chunks = [];

            for (let i = 0; i < fullText.length; i += chunkSize) {
                chunks.push(fullText.slice(i, i + chunkSize));
            }

            console.log(`📄 Текст разделён на ${chunks.length} частей`);

            // === Сюда будем собирать все вопросы ===
           let allQuestions = [];

for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    console.log(`📤 Отправляем часть ${i + 1} из ${chunks.length}`);
    console.log(`📄 Текст части ${i + 1}:`, chunk.slice(0, 200));

    try {
        const questions = await generateTestFromText(chunk, i + 1);
        console.log(`🎯 Полученные вопросы (часть ${i + 1}):`, questions);

        if(createSingleChoiceCard )console.log('gbltweokrtmkhrtkih!!!!!!!!!!!!!');
        allQuestions = [...allQuestions, ...questions];
            // ✅ Выводим вопросы сразу
                    renderQuestionCards(allQuestions);

    } catch (error) {
        console.error(`❌ Ошибка при обработке части ${i + 1}:`, error);
    }

       // Задержка между запросами
    await new Promise(r => setTimeout(r, 1000)); // 2 секунды
}

// ✅ Выводим все вопросы на страницу
if (allQuestions.length > 0) {
    renderQuestionCards(allQuestions);
} else {
    console.warn("⚠️ Нет вопросов для отображения");
}

        };

        fileReader.readAsArrayBuffer(file);

    } else {
        alert("Неподдерживаемый формат файла");
    }
});
console.log("пдф")