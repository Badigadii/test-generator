/**
 * 
 * Отправляет часть текста в Qwen и возвращает вопросы
 * @param {string} text - Текст для обработки
 * @param {number} partNumber - Номер части (для логов)
 * @returns {Promise<Array>} - Массив вопросов
 */
async function generateTestFromText(text, partNumber = 1) {
    console.log(`🚀 [Часть ${partNumber}] Запрос отправляется...`);

    const API_KEY = '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';
    const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions ';

    const QUESTIONS_PER_CHUNK = 5;

const prompt = `
Ты — учитель. Создай ${QUESTIONS_PER_CHUNK} вопроса(ов) в строго заданном формате.
ВАЖНО: Ответ должен быть только в формате JSON. Никакого лишнего текста.

Типы вопросов: single_choice, free_text, multiple_choice, match, true_false,
Для match-вопросов обязательно включай поля:
- "left": [...]
- "right": [...]
- "correct_pairs": [...]


Формат:
{
  "questions": [
    {
      "type": "single_choice",
      "question": "...",
      "options": [...],
      "correct_answer": "..."
    }
  ]
}

Пример:
{
  "questions": [
    {
      "type": "single_choice",
      "question": "Какой цвет светофора означает 'стоп'?",
      "options": ["Зелёный", "Жёлтый", "Красный"],
      "correct_answer": "Красный"
    }
  ]
}

Текст:
${text.slice(0, 10000)}
`.trim();
    const body = {
        model: "qwen/qwen3-235b-a22b", // используем рабочую модель
        messages: [
            { role: "system", content: "Ты — учитель, который возвращает только JSON без лишнего текста" },
            { role: "user", content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 8000
    };

    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ [Часть ${partNumber}] Сервер вернул ошибку:`, errorText);
            throw new Error("Ошибка сети");
        }

        const data = await response.json();

        const content = data.choices?.[0]?.message?.content?.trim();
        if (!content) {
            console.warn(`⚠️ [Часть ${partNumber}] Пустой ответ от модели`);
            return [];
        }

        console.log(`💬 [Часть ${partNumber}] Необработанный ответ от модели:\n`, content);

        // Пытаемся исправить JSON
        const parsed = fixJSON(content);

        console.log(`✅ [Часть ${partNumber}] JSON после исправления:`, parsed);

        return parsed.questions || [];
    } catch (error) {
        console.error(`🚨 [Часть ${partNumber}] Ошибка при генерации теста:`, error.message);
        return [];
    }
}

function fixJSON(jsonString) {
    try {
        // Попробуем сначала обычный парсинг
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn("⚠️ Ошибка парсинга JSON. Пытаемся исправить...");

        // Убираем всё до начала JSON
        let fixed = jsonString;

        // Убираем всё до { или [
        const jsonStartIndex = fixed.indexOf('{');
        const jsonStartIndexArray = fixed.indexOf('[');
        const startIndex = Math.min(
            jsonStartIndex !== -1 ? jsonStartIndex : Infinity,
            jsonStartIndexArray !== -1 ? jsonStartIndexArray : Infinity
        );
        if (startIndex !== Infinity) {
            fixed = fixed.slice(startIndex);
        }

        // Убираем всё после последнего }
        let lastBraceIndex = fixed.lastIndexOf('}');
        if (lastBraceIndex !== -1) {
            fixed = fixed.slice(0, lastBraceIndex + 1);
        }

        // Если это просто массив — оборачиваем в объект
        if (fixed.trim().startsWith('[') && fixed.trim().endsWith(']')) {
            fixed = `{ "questions": ${fixed} }`;
        }

        // Пытаемся распарсить снова
        try {
            return JSON.parse(fixed);
        } catch (e2) {
            console.error("❌ Не удалось исправить JSON", e2);
            return { questions: [] };
        }
    }
}
console.log("апи")