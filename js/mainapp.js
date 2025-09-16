document.addEventListener('DOMContentLoaded', () => {
    // Определяем, на какой мы странице
    if (document.getElementById('catalog-container')) {
        loadCatalog();
    } else if (document.getElementById('lesson-content')) {
        loadLesson();
    }
});

let dictionary = {}; // Здесь будет храниться загруженный словарь
let phoneticRules = {};
// 1. Загрузка каталога на главную страницу
async function loadCatalog() {

    const dictResponse = await fetch('data/dictionary.json');
    dictionary = await dictResponse.json();
    
    // ЗАВАНТАЖУЄМО ПРАВИЛА
    const rulesResponse = await fetch('data/rules.json');
    phoneticRules = (await rulesResponse.json()).rules;

    const response = await fetch('data/catalog.json');
    const catalog = await response.json();
    
    const container = document.getElementById('catalog-container');
    container.innerHTML = ''; // Очищаем контейнер

    catalog.categories.forEach(category => {
        // Додаємо заголовок для кожної категорії
        let categoryHtml = `
            <section class="category-section">
                <h2>${category.title}</h2>
                <p class="category-description">${category.description}</p>
                <div class="lessons-grid">
        `;
        // Генеруємо картки уроків
        category.lessons.forEach(lesson => {
            categoryHtml += `
                <a href="lesson.html?id=${lesson.id}" class="lesson-card" data-type="${lesson.type}">
                    <div class="card-content">
                        <h4>${lesson.title}</h4>
                        <p>${lesson.description}</p>
                        <div class="card-footer">
                            <div class="card-labels">
                                <span class="label level-${lesson.level.toLowerCase()}">${lesson.level}</span>
                                <span class="label type-${lesson.type}">${lesson.type}</span>
                            </div>
                            <i class="fas fa-arrow-right arrow-icon"></i>
                        </div>
                    </div>
                    <div class="card-decoration"></div>
                </a>
            `;
        });
        categoryHtml += `</div></section>`;
        container.innerHTML += categoryHtml;
    });
}

// 2. Загрузка конкретного урока
async function loadLesson() {
    // Загружаем словарь один раз
    const dictResponse = await fetch('data/dictionary.json');
    dictionary = await dictResponse.json();

    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get('id');

    if (!lessonId) return;

    // Находим путь к файлу урока в каталоге
    const catalogResponse = await fetch('data/catalog.json');
    const catalog = await catalogResponse.json();
    const lessonInfo = findLessonInCatalog(catalog, lessonId);

    if (!lessonInfo) return;

    // Загружаем данные урока
    const lessonResponse = await fetch(`data/${lessonInfo.dataFile}`);
    const lessonData = await lessonResponse.json();
    
    renderLesson(lessonData);
}

function findLessonInCatalog(catalog, lessonId) {
    for (const category of catalog.categories) {
        const found = category.lessons.find(lesson => lesson.id === lessonId);
        if (found) return found;
    }
    return null;
}

function renderLesson(data) {
    document.title = data.title;

    // 1. Рендеринг хедера уроку
    const headerContainer = document.getElementById('lesson-header');
    let tagsHtml = data.tags.map(tag => `<span class="tag">#${tag}</span>`).join('');
    headerContainer.innerHTML = `
        <h1>${data.title}</h1>
        <p>${data.description}</p>
        <div class="lesson-tags">${tagsHtml}</div>
    `;

    // 2. Рендеринг контенту для кожної вкладки
    // Вкладка "Главная" (Діалог)
    const mainTab = document.getElementById('tab-main');
    let dialogHtml = '<h3>Диалог</h3>';
     data.characters.forEach(char => {
        dialogHtml += `<p><b>${char.name}</b> - ${char.translation}</p>`
    });
    dialogHtml += "<hr>"
    data.content.forEach(line => {
        dialogHtml += `
            <div class="dialog-line">
                <div class="speaker">${line.speaker}:</div>
                <div class="dialog-text clickable-sentence" data-translation="${line.translation}">
                    ${line.words.map(w => `<span class="clickable-word" data-word-key="${w.wordKey}">${w.text}</span>`).join(' ')}
                </div>
            </div>`;
    });
    mainTab.innerHTML = dialogHtml;

    // Вкладка "Грамматика"
    const grammarTab = document.getElementById('tab-grammar');
    let grammarHtml = data.grammar.map(topic => `
        <div class="grammar-topic section">
            <h4>${topic.title}</h4>
            ${topic.content}
        </div>
    `).join('');
    grammarTab.innerHTML = grammarHtml;

    // Вкладка "Упражнения"
    const exercisesTab = document.getElementById('tab-exercises');
    let exercisesHtml = data.exercises.map(ex => `
        <div class="exercise section">
            <h4>${ex.title}</h4>
            ${ex.questions.map(q => `
                <div class="fill-blank">
                    <p>${q.sentence.map(s => typeof s === 'string' ? s : `<input type="text" class="blank-input" data-answer="${s.blank}">`).join('')}</p>
                </div>
            `).join('')}
            <button class="check-btn">Sprawdź odpowiedzi</button>
        </div>
    `).join('');
    exercisesTab.innerHTML = exercisesHtml;

    // 3. Налаштування логіки вкладок та інших слухачів
    setupTabListeners();
    setupEventListeners();
}

function setupTabListeners() {
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Знімаємо активність з усіх
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Додаємо активність поточній
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });
}

// 4. Обработчики событий (как в вашем script.js, но адаптированные)
function setupEventListeners() {
    document.querySelectorAll('.clickable-word').forEach(word => {
        word.addEventListener('click', (e) => {
            e.stopPropagation();
            const wordKey = e.target.getAttribute('data-word-key');
            showWordModal(wordKey);
        });
    });
    // ... и для предложений
}

// 5. Модальное окно
function showWordModal(wordKey) {
    const wordInfo = dictionary[wordKey.toLowerCase()];
    if (!wordInfo) {
        console.error("Word not found in dictionary:", wordKey);
        return;
    }

    const modal = document.getElementById('wordModal');
    const modalContent = document.getElementById('modalContent'); // Припустимо, у вас є контейнер для контенту

    let contentHtml = `<div class="word-header">
                         <h2 class="word-title">${wordInfo.lemma}</h2>
                         <span class="word-type-badge">${wordInfo.part_of_speech}</span>
                       </div>`;
    
    // Додаємо переклад
    contentHtml += `<div class="translation-section">
                      <div class="translation-text">${wordInfo.translations.ru}</div>
                    </div>`;

    // Додаємо приклади
    if(wordInfo.examples && wordInfo.examples.length > 0) {
        contentHtml += `<h4>Примеры:</h4>`;
        contentHtml += "<ul>";
        wordInfo.examples.forEach(ex => {
            contentHtml += `<li><b>${ex.pl}</b> - ${ex.ru}</li>`;
        });
        contentHtml += "</ul>";
    }

    // Додаємо таблицю відмінювання/дієвідміни
    if(wordInfo.inflection) {
        contentHtml += `<h4>Спряжение/Склонение:</h4>`;
        contentHtml += `<table class="conjugation-table">`;
        for (const [tense, forms] of Object.entries(wordInfo.inflection)) {
            contentHtml += `<tr><td colspan="2"><b>${tense}</b></td></tr>`;
            for (const [form, value] of Object.entries(forms)) {
                 contentHtml += `<tr><td>${form}</td><td>${value}</td></tr>`;
            }
        }
        contentHtml += `</table>`;
    }
    
    // Додаємо правила читання, що застосовуються
    if (wordInfo.applied_rules && wordInfo.applied_rules.length > 0) {
        contentHtml += `<h4>Правила чтения:</h4>`;
        contentHtml += `<ul>`;
        wordInfo.applied_rules.forEach(ruleKey => {
            const rule = phoneticRules[ruleKey];
            if (rule) {
                contentHtml += `<li><b>${ruleKey}</b> → ${rule.ru} (${rule.desc_ru})</li>`;
            }
        });
        contentHtml += `</ul>`;
    }

    modalContent.innerHTML = contentHtml;
    modal.style.display = 'block';
}