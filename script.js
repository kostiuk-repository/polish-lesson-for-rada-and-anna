// Polish Lesson Interactive Script
// Main functionality for enhanced dictionary and modal system

class PolishLessonApp {
    constructor() {
        this.currentBookmarks = new Set();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateDictionary();
        this.loadBookmarks();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Word click events
            document.querySelectorAll('.clickable-word').forEach(word => {
                word.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const wordKey = word.getAttribute('data-word');
                    this.showWordModal(wordKey);
                });
            });

            // Sentence click events
            document.querySelectorAll('.clickable-sentence').forEach(sentence => {
                sentence.addEventListener('click', (e) => {
                    if (e.target.classList.contains('clickable-word')) return;
                    const translation = sentence.getAttribute('data-translation');
                    const pronunciation = sentence.getAttribute('data-pronunciation');
                    const text = sentence.innerText.trim();
                    this.showSentenceModal(text, translation, pronunciation);
                });
            });

            // Modal close events
            document.getElementById('wordModal').addEventListener('click', (e) => {
                if (e.target === e.currentTarget) this.closeModal();
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.closeModal();
            });

            // Search functionality
            const searchInput = document.getElementById('dictionarySearch');
            if (searchInput) {
                searchInput.addEventListener('input', () => this.searchDictionary());
            }
        });
    }

    showWordModal(wordKey) {
        const data = this.getWordData(wordKey);
        if (!data) {
            console.error("No data found for word:", wordKey);
            return;
        }

        const modalContent = this.generateWordModalContent(wordKey, data);
        document.getElementById('modalContent').innerHTML = modalContent;
        document.getElementById('wordModal').style.display = 'block';

        // Update bookmark button state
        this.updateBookmarkButton(wordKey);
        
        // Setup tab functionality
        this.setupModalTabs();
    }

    getWordData(wordKey) {
        // Direct lookup
        if (wordData[wordKey]) return { key: wordKey, ...wordData[wordKey] };
        
        // Case-insensitive lookup
        const lowerKey = wordKey.toLowerCase();
        if (wordData[lowerKey]) return { key: lowerKey, ...wordData[lowerKey] };
        
        // Look for verb forms
        for (const [key, value] of Object.entries(wordData)) {
            if (value.type === 'verb_form' && key.toLowerCase() === lowerKey) {
                const baseVerb = wordData[value.infinitive];
                if (baseVerb) {
                    return {
                        key: key,
                        type: 'verb_form',
                        ...value,
                        baseData: baseVerb
                    };
                }
            }
        }
        
        return null;
    }

    generateWordModalContent(wordKey, data) {
        let content = '';
        
        // Handle verb forms
        if (data.type === 'verb_form' && data.baseData) {
            content += this.generateVerbFormContent(wordKey, data);
        } 
        // Handle redirects (case forms)
        else if (data.redirect) {
            const baseWord = wordData[data.redirect];
            content += this.generateRedirectContent(wordKey, data, baseWord);
        }
        // Handle regular words
        else {
            content += this.generateRegularWordContent(wordKey, data);
        }

        return content;
    }

    generateVerbFormContent(wordKey, data) {
        const baseData = data.baseData;
        const typeLabel = this.getWordTypeLabel('verb');
        
        return `
            <div class="word-header">
                <h2 class="word-title">${wordKey}</h2>
                <span class="word-type-badge">${typeLabel}</span>
            </div>
            
            <div class="translation-section">
                <div class="translation-text">${baseData.translation}</div>
                <div class="form-info">
                    <strong>Форма:</strong> ${data.form || `${data.person || ''} ${data.tense || ''}`.trim()}
                    <br><strong>Инфинитив:</strong> 
                    <span class="related-word" onclick="app.showWordModal('${data.infinitive}')">${data.infinitive}</span>
                </div>
            </div>

            ${baseData.pronunciation ? `
                <div class="pronunciation">
                    <strong>Произношение:</strong> ${baseData.pronunciation}
                </div>
            ` : ''}

            ${baseData.pronunciation_rule ? `
                <div class="pronunciation-rule">
                    <strong>Правило чтения:</strong> ${baseData.pronunciation_rule}
                </div>
            ` : ''}

            <div class="modal-tabs">
                <button class="modal-tab-button active" onclick="app.switchModalTab(event, 'info')">Справка</button>
                ${baseData.conjugation_table ? '<button class="modal-tab-button" onclick="app.switchModalTab(event, \'forms\')">Спряжение</button>' : ''}
                ${baseData.examples ? '<button class="modal-tab-button" onclick="app.switchModalTab(event, \'examples\')">Примеры</button>' : ''}
            </div>

            <div id="info" class="modal-tab-content active">
                ${baseData.etymology ? `<p><strong>Этимология:</strong> ${baseData.etymology}</p>` : ''}
                ${baseData.aspect ? `<p><strong>Вид:</strong> ${baseData.aspect === 'dokonany' ? 'совершенный' : 'несовершенный'}</p>` : ''}
            </div>

            ${baseData.conjugation_table ? `
                <div id="forms" class="modal-tab-content">
                    <h4>Спряжение глагола "${data.infinitive}"</h4>
                    ${this.generateConjugationTable(baseData.conjugation_table)}
                </div>
            ` : ''}

            ${baseData.examples ? `
                <div id="examples" class="modal-tab-content">
                    ${this.generateExamplesSection(baseData.examples)}
                </div>
            ` : ''}

            ${baseData.related ? this.generateRelatedSection(baseData.related) : ''}
        `;
    }

    generateRedirectContent(wordKey, data, baseWord) {
        const typeLabel = this.getWordTypeLabel(baseWord.type);
        
        return `
            <div class="word-header">
                <h2 class="word-title">${wordKey}</h2>
                <span class="word-type-badge">${typeLabel}</span>
            </div>
            
            <div class="translation-section">
                <div class="translation-text">${baseWord.translation}</div>
                <div class="form-info">
                    <strong>Падеж:</strong> ${data.case_form || 'форма склонения'}
                    <br><strong>Начальная форма:</strong> 
                    <span class="related-word" onclick="app.showWordModal('${data.redirect}')">${baseWord.base_form || data.redirect}</span>
                </div>
            </div>

            ${baseWord.pronunciation ? `
                <div class="pronunciation">
                    <strong>Произношение:</strong> ${baseWord.pronunciation}
                </div>
            ` : ''}

            ${baseWord.cases ? `
                <div class="modal-tabs">
                    <button class="modal-tab-button active" onclick="app.switchModalTab(event, 'info')">Справка</button>
                    <button class="modal-tab-button" onclick="app.switchModalTab(event, 'forms')">Склонение</button>
                    ${baseWord.examples ? '<button class="modal-tab-button" onclick="app.switchModalTab(event, \'examples\')">Примеры</button>' : ''}
                </div>

                <div id="info" class="modal-tab-content active">
                    ${baseWord.etymology ? `<p><strong>Этимология:</strong> ${baseWord.etymology}</p>` : ''}
                    ${baseWord.gender ? `<p><strong>Род:</strong> ${this.getGenderLabel(baseWord.gender)}</p>` : ''}
                </div>

                <div id="forms" class="modal-tab-content">
                    <h4>Склонение "${baseWord.base_form || data.redirect}"</h4>
                    ${this.generateCaseTable(baseWord.cases)}
                </div>

                ${baseWord.examples ? `
                    <div id="examples" class="modal-tab-content">
                        ${this.generateExamplesSection(baseWord.examples)}
                    </div>
                ` : ''}
            ` : this.generateBasicInfo(baseWord)}

            ${baseWord.related ? this.generateRelatedSection(baseWord.related) : ''}
        `;
    }

    generateRegularWordContent(wordKey, data) {
        const typeLabel = this.getWordTypeLabel(data.type);
        
        return `
            <div class="word-header">
                <h2 class="word-title">${wordKey}</h2>
                <span class="word-type-badge">${typeLabel}</span>
            </div>
            
            <div class="translation-section">
                <div class="translation-text">${data.translation}</div>
                ${data.gender ? `<div class="gender-info"><strong>Род:</strong> ${this.getGenderLabel(data.gender)}</div>` : ''}
            </div>

            ${data.pronunciation ? `
                <div class="pronunciation">
                    <strong>Произношение:</strong> ${data.pronunciation}
                </div>
            ` : ''}

            ${data.pronunciation_rule ? `
                <div class="pronunciation-rule">
                    <strong>Правило чтения:</strong> ${data.pronunciation_rule}
                </div>
            ` : ''}

            ${this.generateTabsSection(data)}

            ${data.related ? this.generateRelatedSection(data.related) : ''}
        `;
    }

    generateTabsSection(data) {
        const hasForms = data.cases || data.conjugation_table || data.declension;
        const hasExamples = data.examples;
        const hasEtymology = data.etymology || data.info;
        
        if (!hasForms && !hasExamples && !hasEtymology) {
            return this.generateBasicInfo(data);
        }

        let tabs = `
            <div class="modal-tabs">
                <button class="modal-tab-button active" onclick="app.switchModalTab(event, 'info')">Справка</button>
        `;

        if (hasForms) {
            const formLabel = data.cases ? 'Склонение' : (data.conjugation_table ? 'Спряжение' : 'Формы');
            tabs += `<button class="modal-tab-button" onclick="app.switchModalTab(event, 'forms')">${formLabel}</button>`;
        }

        if (hasExamples) {
            tabs += `<button class="modal-tab-button" onclick="app.switchModalTab(event, 'examples')">Примеры</button>`;
        }

        tabs += `</div>`;

        // Tab contents
        tabs += `
            <div id="info" class="modal-tab-content active">
                ${data.etymology ? `<div class="etymology-section"><strong>Этимология:</strong> ${data.etymology}</div>` : ''}
                ${data.info ? `<div><strong>Дополнительная информация:</strong><br>${data.info}</div>` : ''}
                ${data.aspect ? `<div><strong>Вид:</strong> ${data.aspect === 'dokonany' ? 'совершенный' : 'несовершенный'}</div>` : ''}
            </div>
        `;

        if (hasForms) {
            tabs += `<div id="forms" class="modal-tab-content">`;
            if (data.cases) {
                tabs += `<h4>Склонение "${data.key || 'слова'}"</h4>${this.generateCaseTable(data.cases)}`;
            } else if (data.conjugation_table) {
                tabs += `<h4>Спряжение "${data.key || 'глагола'}"</h4>${this.generateConjugationTable(data.conjugation_table)}`;
            } else if (data.declension) {
                tabs += `<h4>Склонение по родам</h4>${this.generateDeclensionTable(data.declension)}`;
            }
            tabs += `</div>`;
        }

        if (hasExamples) {
            tabs += `
                <div id="examples" class="modal-tab-content">
                    ${this.generateExamplesSection(data.examples)}
                </div>
            `;
        }

        return tabs;
    }

    generateBasicInfo(data) {
        return `
            <div class="basic-info">
                ${data.etymology ? `<div class="etymology-section"><strong>Этимология:</strong> ${data.etymology}</div>` : ''}
                ${data.info ? `<div style="margin-top: 15px;"><strong>Информация:</strong><br>${data.info}</div>` : ''}
                ${data.aspect ? `<div style="margin-top: 10px;"><strong>Вид:</strong> ${data.aspect === 'dokonany' ? 'совершенный' : 'несовершенный'}</div>` : ''}
            </div>
        `;
    }

    generateExamplesSection(examples) {
        if (!examples || examples.length === 0) return '';
        
        let html = '<div class="examples-section"><h4><i class="fas fa-lightbulb"></i> Примеры использования</h4>';
        
        examples.forEach(example => {
            html += `
                <div class="example-item">
                    <div class="example-polish">${example.polish}</div>
                    <div class="example-russian">${example.russian}</div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    generateRelatedSection(related) {
        if (!related || related.length === 0) return '';
        
        let html = '<div class="related-section"><h4><i class="fas fa-link"></i> Связанные слова</h4><div class="related-words">';
        
        related.forEach(word => {
            html += `
                <div class="related-word" onclick="app.showWordModal('${word}')">
                    ${word}
                </div>
            `;
        });
        
        html += '</div></div>';
        return html;
    }

    generateConjugationTable(tableData) {
        let html = '<table class="conjugation-table"><thead><tr><th>Время</th><th>Лицо</th><th>Форма</th></tr></thead><tbody>';

        for (const [tense, persons] of Object.entries(tableData)) {
            if (typeof persons === 'object' && persons.info) {
                html += `<tr><td colspan="3" style="font-style: italic;">${persons.info}</td></tr>`;
                continue;
            }

            const tenseLabel = this.getTenseLabel(tense);
            const personKeys = Object.keys(persons);
            
            personKeys.forEach((person, index) => {
                html += '<tr>';
                if (index === 0) {
                    html += `<td rowspan="${personKeys.length}" style="font-weight: 600;">${tenseLabel}</td>`;
                }
                html += `<td>${person}</td><td><strong>${persons[person]}</strong></td>`;
                html += '</tr>';
            });
        }

        html += '</tbody></table>';
        return html;
    }

    generateCaseTable(caseData) {
        let html = '<table class="conjugation-table"><thead><tr><th>Падеж</th><th>Форма</th></tr></thead><tbody>';

        for (const [caseName, form] of Object.entries(caseData)) {
            html += `<tr><td>${caseName}</td><td><strong>${form}</strong></td></tr>`;
        }

        html += '</tbody></table>';
        return html;
    }

    generateDeclensionTable(declensionData) {
        let html = '<table class="conjugation-table"><thead><tr><th>Род</th><th>Падеж</th><th>Форма</th></tr></thead><tbody>';

        for (const [gender, cases] of Object.entries(declensionData)) {
            const genderLabel = this.getGenderLabel(gender);
            const caseKeys = Object.keys(cases);
            
            caseKeys.forEach((caseName, index) => {
                html += '<tr>';
                if (index === 0) {
                    html += `<td rowspan="${caseKeys.length}" style="font-weight: 600;">${genderLabel}</td>`;
                }
                html += `<td>${caseName}</td><td><strong>${cases[caseName]}</strong></td>`;
                html += '</tr>';
            });
        }

        html += '</tbody></table>';
        return html;
    }

    showSentenceModal(text, translation, pronunciation) {
        const modalContent = `
            <div class="word-header">
                <h2 class="word-title">Предложение</h2>
                <span class="word-type-badge">фраза</span>
            </div>
            
            <div class="translation-section">
                <div class="sentence-polish" style="font-size: 1.3rem; margin-bottom: 15px; font-style: italic;">
                    "${text}"
                </div>
                <div class="translation-text">${translation}</div>
            </div>
            
            ${pronunciation ? `
                <div class="pronunciation">
                    <strong>Произношение:</strong> ${pronunciation}
                </div>
            ` : ''}
            
            <div class="sentence-analysis" style="margin-top: 20px;">
                <h4><i class="fas fa-search"></i> Анализ предложения</h4>
                <p>Нажмите на отдельные слова в тексте для изучения их значения и грамматических форм.</p>
            </div>
        `;
        
        document.getElementById('modalContent').innerHTML = modalContent;
        document.getElementById('wordModal').style.display = 'block';
    }

    // Tab switching functionality
    switchModalTab(event, tabName) {
        const modalContent = document.getElementById('modalContent');
        modalContent.querySelectorAll('.modal-tab-content').forEach(c => c.classList.remove('active'));
        modalContent.querySelectorAll('.modal-tab-button').forEach(b => b.classList.remove('active'));
        
        const targetTab = modalContent.querySelector(`#${tabName}`);
        if (targetTab) {
            targetTab.classList.add('active');
            event.currentTarget.classList.add('active');
        }
    }

    setupModalTabs() {
        // Already handled by onclick attributes in HTML
    }

    // Dialog tab switching
    showDialog(dialogId, event) {
        document.querySelectorAll('.dialog-container').forEach(dialog => dialog.classList.remove('active'));
        document.querySelectorAll('.tab-button').forEach(tab => tab.classList.remove('active'));
        document.getElementById(dialogId).classList.add('active');
        event.currentTarget.classList.add('active');
    }

    // Pronunciation simulation (could be enhanced with actual audio)
    playPronunciation() {
        // Placeholder for audio functionality
        console.log('Playing pronunciation...');
        // Could integrate with Web Speech API or external audio files
    }

    // Bookmark functionality
    toggleBookmark() {
        const currentWord = document.querySelector('.word-title')?.textContent;
        if (!currentWord) return;
        
        if (this.currentBookmarks.has(currentWord)) {
            this.currentBookmarks.delete(currentWord);
        } else {
            this.currentBookmarks.add(currentWord);
        }
        
        this.saveBookmarks();
        this.updateBookmarkButton(currentWord);
    }

    updateBookmarkButton(word) {
        const bookmarkBtn = document.querySelector('.bookmark-btn i');
        if (!bookmarkBtn) return;
        
        if (this.currentBookmarks.has(word)) {
            bookmarkBtn.className = 'fas fa-bookmark';
            bookmarkBtn.parentElement.classList.add('active');
        } else {
            bookmarkBtn.className = 'far fa-bookmark';
            bookmarkBtn.parentElement.classList.remove('active');
        }
    }

    saveBookmarks() {
        localStorage.setItem('polishLessonBookmarks', JSON.stringify([...this.currentBookmarks]));
    }

    loadBookmarks() {
        try {
            const saved = localStorage.getItem('polishLessonBookmarks');
            if (saved) {
                this.currentBookmarks = new Set(JSON.parse(saved));
            }
        } catch (e) {
            console.warn('Could not load bookmarks:', e);
        }
    }

    // Dictionary search functionality
    populateDictionary() {
        const tableBody = document.getElementById('dictionaryTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        dictionaryEntries.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="clickable-word" data-word="${entry.polish}" style="cursor: pointer; color: #8B4513;">${entry.polish}</span></td>
                <td>${entry.russian}</td>
                <td><em>${entry.example}</em></td>
            `;
            tableBody.appendChild(row);
        });

        // Add click events to dictionary words
        tableBody.querySelectorAll('.clickable-word').forEach(word => {
            word.addEventListener('click', (e) => {
                const wordKey = word.getAttribute('data-word');
                this.showWordModal(wordKey);
            });
        });
    }

    searchDictionary() {
        const searchInput = document.getElementById('dictionarySearch');
        const searchTerm = searchInput.value.toLowerCase();
        const tableBody = document.getElementById('dictionaryTableBody');
        
        const filteredEntries = dictionaryEntries.filter(entry => 
            entry.polish.toLowerCase().includes(searchTerm) ||
            entry.russian.toLowerCase().includes(searchTerm) ||
            entry.example.toLowerCase().includes(searchTerm)
        );
        
        tableBody.innerHTML = '';
        
        filteredEntries.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="clickable-word" data-word="${entry.polish}" style="cursor: pointer; color: #8B4513;">${entry.polish}</span></td>
                <td>${entry.russian}</td>
                <td><em>${entry.example}</em></td>
            `;
            tableBody.appendChild(row);
        });

        // Re-add click events
        tableBody.querySelectorAll('.clickable-word').forEach(word => {
            word.addEventListener('click', (e) => {
                const wordKey = word.getAttribute('data-word');
                this.showWordModal(wordKey);
            });
        });
    }

    // Exercise checking
    checkAnswers() {
        const inputs = document.querySelectorAll('.blank-input');
        inputs.forEach(input => {
            const userAnswer = input.value.trim().toLowerCase();
            const correctAnswer = input.getAttribute('data-answer').toLowerCase();
            
            input.classList.remove('correct', 'incorrect');

            if (userAnswer === correctAnswer) {
                input.classList.add('correct');
            } else {
                input.classList.add('incorrect');
            }
        });
    }

    closeModal() {
        document.getElementById('wordModal').style.display = 'none';
    }

    // Helper methods
    getWordTypeLabel(type) {
        const labels = {
            'noun': 'существительное',
            'verb': 'глагол',
            'verb_form': 'форма глагола',
            'adjective': 'прилагательное',
            'adverb': 'наречие',
            'phrase': 'фраза',
            'exclamation': 'восклицание'
        };
        return labels[type] || type;
    }

    getGenderLabel(gender) {
        const labels = {
            'm': 'мужской',
            'f': 'женский',
            'n': 'средний',
            'masculine': 'мужской',
            'feminine': 'женский', 
            'neuter': 'средний'
        };
        return labels[gender] || gender;
    }

    getTenseLabel(tense) {
        const labels = {
            'present': 'Настоящее время',
            'past': 'Прошедшее время',
            'future': 'Будущее время',
            'conditional': 'Условное наклонение',
            'imperative': 'Повелительное наклонение'
        };
        return labels[tense] || tense;
    }
}

// Global functions for onclick attributes
function showDialog(dialogId, event) {
    app.showDialog(dialogId, event);
}

function checkAnswers() {
    app.checkAnswers();
}

function closeModal() {
    app.closeModal();
}

function playPronunciation() {
    app.playPronunciation();
}

function toggleBookmark() {
    app.toggleBookmark();
}

function searchDictionary() {
    app.searchDictionary();
}

// Initialize the application
const app = new PolishLessonApp();
