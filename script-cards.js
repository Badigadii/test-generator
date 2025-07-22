// script-cards.js

function createMultipleChoiceCard(data) {
    const card = document.createElement('div');
    card.className = 'question-card';

    // Проверка, что correct_answers существует
    const correctAnswers = data.correct_answers || data.correct_answer || [];

    card.dataset.correctAnswers = JSON.stringify(correctAnswers);
    card.dataset.explanation = data.explanation || '';

    let optionsHTML = data.options.map(option => `
        <label>
            <input type="checkbox" name="q${Date.now()}" value="${option}">
            ${option}
        </label>
    `).join('');

    card.innerHTML += `
        <h3>${data.question}</h3>
        ${optionsHTML}
        <div class="correct-answer">Правильные ответы: ${Array.isArray(correctAnswers) ? correctAnswers.join(', ') : 'Нет данных'}</div>
        <div class="explanation"></div>
    `;

    const checkboxes = card.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (!card.dataset.answered && Array.from(checkboxes).some(cb => cb.checked)) {
                answeredQuestions++;
                card.dataset.answered = true;
                updateProgressBar();
            }
        });
    });

    return card;
}



function createMatchCard(data) {
    const card = document.createElement('div');
    card.className = 'question-card';

    // Проверка наличия correct_pairs
    card.dataset.correctPairs = JSON.stringify(data.correct_pairs || []);
    card.dataset.explanation = data.explanation || '';

    // Защита от undefined
    const leftItems = Array.isArray(data.left) ? data.left : [];
    const rightItems = Array.isArray(data.right) ? data.right : [];

    if (leftItems.length === 0 || rightItems.length === 0) {
        console.warn("⚠️ В match-вопросе отсутствуют left или right:", data);
        card.innerHTML = `<h3>${data.question}</h3><p>Ошибка: не хватает данных для сопоставления.</p>`;
        return card;
    }

    let pairsHTML = leftItems.map((left, i) => `
        <div class="match-row">
            <span>${left}</span> → 
            <select class="match-select">
                <option value="">Выберите</option>
                ${rightItems.map(right => `<option value="${right}">${right}</option>`).join('')}
            </select>
        </div>
    `).join('');

    card.innerHTML += `
        <h3>${data.question}</h3>
        <div class="match-pairs">
            ${pairsHTML}
        </div>
        <div class="correct-answer">Правильные пары: ${data.correct_pairs?.map(pair => `${pair[0]} → ${pair[1]}`).join(', ') || 'не указаны'}</div>
        <div class="explanation"></div>
    `;

    const selects = card.querySelectorAll('.match-select');
    selects.forEach(select => {
        select.addEventListener('change', () => {
            if (!card.dataset.answered && Array.from(selects).every(s => s.value !== "")) {
                answeredQuestions++;
                card.dataset.answered = true;
                updateProgressBar();
            }
        });
    });

    return card;
}

function createTrueFalseCard(data) {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.dataset.correctAnswer = data.correct_answer;
    card.dataset.explanation = data.explanation || '';

    card.innerHTML += `
        <h3>${data.question}</h3>
        <label><input type="radio" name="q${Date.now()}" value="true"> Верно</label><br>
        <label><input type="radio" name="q${Date.now()}" value="false"> Неверно</label>
        <div class="correct-answer">Правильный ответ: ${data.correct_answer ? 'Верно' : 'Неверно'}</div>
        <div class="explanation"></div>
    `;

    const radios = card.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (!card.dataset.answered && Array.from(radios).some(r => r.checked)) {
                answeredQuestions++;
                card.dataset.answered = true;
                updateProgressBar();
            }
        });
    });

    return card;
}

function createSingleChoiceCard(data) {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.dataset.correctAnswer = data.correct_answer;
    card.dataset.explanation = data.explanation || '';

    let optionsHTML = data.options.map(option => `
        <label>
            <input type="radio" name="q${Date.now()}" value="${option}">
            ${option}
        </label>
    `).join('');

    if(data.correct_answer)
    card.innerHTML += `
        <h3>${data.question}</h3>
        ${optionsHTML}
         <!-- <div class="correct-answer">Правильный ответ: ${data.correct_answer}</div> -->
        
        <div class="explanation"></div>
    `;
const isSelected = document.querySelector('input[type="radio"][name="groupName"]:checked') !== null;  

    // Отмечаем как пройденный при выборе
    card.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', () => {
            const selectedInput = document.querySelector(`input[name="${input.name}"]:checked`); console.log("Значение:", selectedInput.value);
            if(selectedInput.value == data.correct_answer){
              }
                if (!card.dataset.answered) {

                answeredQuestions++;
                card.dataset.answered = true;
                updateProgressBar();
            }
        });
    });

    return card;
}
function createFreeTextCard(data) {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.dataset.correctAnswer = data.correct_answer;
    card.dataset.explanation = data.explanation || '';

    card.innerHTML += `
        <h3>${data.question}</h3>
        <input type="text" placeholder="Введите ваш ответ">
        <div class="correct-answer">Правильный ответ: ${data.correct_answer}</div>
        <div class="explanation"></div>
    `;

    const input = card.querySelector('input');
    input.addEventListener('input', () => {
        if (!card.dataset.answered && input.value.trim()) {
            answeredQuestions++;
            card.dataset.answered = true;
            updateProgressBar();
        }
    });

    return card;
}

console.log("✅ script-cards.js загружен");