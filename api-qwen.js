/**
 * Отправляет текст на наш сервер
 */
async function generateTestFromText(text) {
    const SERVER_URL = 'https://test-generator-api.onrender.com/generate-test';

    try {
        const response = await fetch(SERVER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) throw new Error('Ошибка сети');

        const data = await response.json();
        return Array.isArray(data.questions) ? data.questions : [];
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось сгенерировать тест. Проверь консоль.');
        return [];
    }
}