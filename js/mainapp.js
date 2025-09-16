document.addEventListener('DOMContentLoaded', () => {
    // Определяем, на какой мы странице
    if (document.getElementById('catalog-container')) {
        loadCatalog();
    } else if (document.getElementById('lesson-content')) {
        loadLesson();
    }
});

let dictionary = {}; // Здесь будет храниться загруженный словарь

// 1. Загрузка каталога на главную страницу
async function loadCatalog() {
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

// 3. Рендеринг (отображение) урока на странице
function renderLesson(data) {
    // Устанавливаем заголовок
    document.title = data.title;
    document.querySelector('#lesson-header').innerHTML = `<h1>${data.title}</h1>`;

    const contentContainer = document.getElementById('lesson-content');
    
    // Рендеринг диалога
    let dialogHtml = '<h3>Диалог</h3>';
    data.content.forEach(line => {
        dialogHtml += `
            <div class="dialog-line">
                <div class="speaker">${line.speaker}:</div>
                <div class="dialog-text clickable-sentence" data-translation="${line.translation}" data-pronunciation="${line.pronunciation}">
                    ${line.words.map(w => `<span class="clickable-word" data-word-key="${w.wordKey}">${w.text}</span>`).join(' ')}
                </div>
            </div>
        `;
    });
    contentContainer.innerHTML = dialogHtml;
    
    // ... здесь же рендеринг грамматики и упражнений ...

    // Добавляем обработчики событий
    setupEventListeners();
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
    if (!wordInfo) return;

    // Генерация HTML для модального окна на основе wordInfo
    // ...
    const modal = document.getElementById('wordModal');
    // ...
    modal.style.display = 'block';
}