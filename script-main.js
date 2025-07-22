// script-main.js
console.log("✅ script-main.js загружается...");
// === Глобальные переменные ===
let totalQuestions = 0;
let answeredQuestions = 0;
let questionsData = []; // Для повторного прохождения

// === Рендер вопросов ===
function renderQuestionCards(questions) {
    const container = document.getElementById('questions-container');
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Фильтруем только валидные вопросы
    const validQuestions = questions.filter(isValidQuestion);
    
    // Сохраняем общее количество
    totalQuestions = validQuestions.length;
    answeredQuestions = 0;
    questionsData = [...validQuestions]; // Для повторного прохождения

    console.log(`🎯 Отрендерено ${validQuestions.length} валидных вопросов из ${questions.length}`);

    validQuestions.forEach(q => {
        let card;

        switch (q.type) {
            case 'single_choice':
                card = createSingleChoiceCard(q);
                break;
            case 'free_text':
                card = createFreeTextCard(q);
                break;
            case 'multiple_choice':
                card = createMultipleChoiceCard(q);
                break;
            case 'match':
                card = createMatchCard(q);
                break;
            case 'true_false':
                card = createTrueFalseCard(q);
                break;
            default:
                return; // Уже отфильтровано, но на всякий случай
        }

        container.appendChild(card);
    });

    updateProgressBar();

    // Добавляем кнопки
    if (!document.querySelector('.submit-test-btn')) {
        const btn = document.createElement('button');
        btn.textContent = 'Проверить тест';
        btn.className = 'submit-test-btn';
        btn.onclick = showAllCorrectAnswers;
        container.appendChild(btn);
    }

    if (!document.getElementById('restart-test-btn')) {
        const restartBtn = document.createElement('button');
        restartBtn.id = 'restart-test-btn';
        restartBtn.textContent = 'Пройти тест заново';
        restartBtn.className = 'submit-test-btn hidden';
        restartBtn.onclick = restartTest;
        container.appendChild(restartBtn);
    }
}

// === Обновление прогресс-бара ===
function updateProgressBar() {
    const percent = totalQuestions === 0 ? 0 : (answeredQuestions / totalQuestions) * 100;
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    progressBar.style.width = percent + '%';
    progressText.textContent = `${answeredQuestions} / ${totalQuestions}`;
}

// === Показать все правильные ответы и объяснения ===
function showAllCorrectAnswers() {
    const answers = document.querySelectorAll('.correct-answer');
    const explanations = document.querySelectorAll('.explanation');

    answers.forEach(el => el.style.display = 'block');
    explanations.forEach((el, index) => {
        const explanationText = questionsData[index]?.explanation || 'Нет объяснения.';
        el.textContent = '💡 Объяснение: ' + explanationText;
        el.style.marginTop = '0.75rem';
        el.style.color = '#555';
        el.style.fontSize = '0.95rem';
        el.style.fontStyle = 'italic';
    });

     // === Подсветка правильных и неправильных ответов ===
  document.querySelectorAll('.question-card').forEach((card, index) => {
        const question = questionsData[index];
        if (!question) return;

        const correctAnswer = card.dataset.correctAnswer || 
                             (Array.isArray(card.dataset.correctAnswers) ? JSON.parse(card.dataset.correctAnswers)[0] : null);

        // Для всех типов вопросов — ищем label по значению
        card.querySelectorAll('label').forEach(label => {
            const input = label.querySelector('input');
            if (!input) return;

            const value = input.value;

            // Убираем старые классы
            label.classList.remove('correct-answer', 'wrong-answer');

            if (value === correctAnswer) {
                // Это правильный ответ → зелёный
                label.classList.add('correct-answer');
            } else if (input.checked && value !== correctAnswer) {
                // Это неправильный, но выбранный → красный
                label.classList.add('wrong-answer');
            }
        });
    });
    // Показываем кнопку "Пройти заново"
    const restartBtn = document.getElementById('restart-test-btn');
    restartBtn.classList.remove('hidden');
}

// === Перезапуск теста ===
function restartTest() {
    const container = document.getElementById('questions-container');
    container.innerHTML = ''; // Очищаем старые вопросы

    answeredQuestions = 0;
    updateProgressBar();

    renderQuestionCards(questionsData); // Перерисовываем вопросы

    // Скрываем кнопки
    document.getElementById('restart-test-btn').classList.add('hidden');
    document.getElementById('progress-text').textContent = '0 / 0';
}

/**
 * Проверяет, является ли объект валидным вопросом
 * @param {Object} q - Вопрос
 * @returns {boolean} - true, если валиден
 */
function isValidQuestion(q) {
    if (!q || typeof q !== 'object') return false;
    if (!q.type || !q.question) return false;

    switch (q.type) {
        case 'single_choice':
            return Array.isArray(q.options) && 
                   q.options.length >= 2 &&
                   typeof q.correct_answer !== 'undefined' &&
                   q.options.includes(q.correct_answer);

        case 'multiple_choice':
            return Array.isArray(q.options) && 
                   q.options.length >= 2 &&
                   (Array.isArray(q.correct_answers) || Array.isArray(q.correct_answer));

        case 'free_text':
            return typeof q.correct_answer !== 'undefined';

        case 'match':
            return Array.isArray(q.left) && 
                   Array.isArray(q.right) && 
                   Array.isArray(q.correct_pairs) &&
                   q.left.length > 0 &&
                   q.right.length > 0 &&
                   q.correct_pairs.length > 0;

        case 'true_false':
            return typeof q.correct_answer === 'boolean';

        default:
            console.warn('Неизвестный тип вопроса:', q.type);
            return false;
    }
}

console.log("мэйн")