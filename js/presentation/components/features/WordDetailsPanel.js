import { Modal } from '../composite/Modal.js';
import { Button } from '../base/Button.js';
import { Icon } from '../base/Icon.js';
import { SoundButton } from '../composite/SoundButton.js';

/**
 * WordDetailsPanel Component
 * Feature component for displaying word details
 */
export class WordDetailsPanel {
  constructor(dictionaryService, speechAdapter, progressService) {
    this.dictionaryService = dictionaryService;
    this.speechAdapter = speechAdapter;
    this.progressService = progressService;
    this.modal = null;
  }

  /**
   * Show word details in a modal
   * @param {string} wordKey
   */
  show(wordKey) {
    const word = this.dictionaryService.lookupWord(wordKey);

    if (!word) {
      console.warn(`Word not found: ${wordKey}`);
      return;
    }

    const content = this.createWordContent(word, wordKey);

    this.modal = new Modal();
    const modalElement = this.modal.create({
      title: word.getLemma(),
      content,
      size: 'large',
      className: 'word-details-modal'
    });

    document.body.appendChild(modalElement);
    this.modal.open();
  }

  /**
   * Create word content
   * @param {Word} word
   * @param {string} wordKey
   * @returns {HTMLElement}
   */
  createWordContent(word, wordKey) {
    const container = document.createElement('div');
    container.className = 'word-details';

    // Header with lemma and sound button
    const header = document.createElement('div');
    header.className = 'word-details-header';

    const lemma = document.createElement('h2');
    lemma.textContent = word.getLemma();
    header.appendChild(lemma);

    const soundBtn = SoundButton.create(this.speechAdapter, {
      text: word.getLemma(),
      type: 'primary'
    });
    header.appendChild(soundBtn);

    // Bookmark button
    const isBookmarked = this.progressService.isBookmarked(wordKey);
    const bookmarkBtn = Button.createIconButton({
      icon: isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark',
      onClick: () => this.toggleBookmark(wordKey, bookmarkBtn),
      ariaLabel: isBookmarked ? 'Remove bookmark' : 'Add bookmark',
      type: 'secondary'
    });
    header.appendChild(bookmarkBtn);

    container.appendChild(header);

    // Part of speech
    const pos = document.createElement('p');
    pos.className = 'word-pos';
    pos.textContent = this.formatPartOfSpeech(word.getPartOfSpeech());
    container.appendChild(pos);

    // Translation
    const translation = document.createElement('div');
    translation.className = 'word-translation';
    translation.innerHTML = `<strong>Translation:</strong> ${word.getTranslation()}`;
    container.appendChild(translation);

    // Pronunciation
    const pronunciation = word.getPronunciation();
    if (pronunciation) {
      const pronEl = document.createElement('div');
      pronEl.className = 'word-pronunciation';
      pronEl.innerHTML = `<strong>Pronunciation:</strong> ${pronunciation}`;
      container.appendChild(pronEl);
    }

    // Inflection/Conjugation
    if (word.inflection.exists()) {
      const inflectionEl = this.createInflectionTable(word);
      container.appendChild(inflectionEl);
    }

    // Examples
    const examples = word.getExamples();
    if (examples.length > 0) {
      const examplesEl = this.createExamplesSection(examples);
      container.appendChild(examplesEl);
    }

    return container;
  }

  /**
   * Create inflection table
   * @param {Word} word
   * @returns {HTMLElement}
   */
  createInflectionTable(word) {
    const section = document.createElement('div');
    section.className = 'word-inflection';

    const title = document.createElement('h3');
    title.textContent = word.isVerb() ? 'Conjugation' : 'Declension';
    section.appendChild(title);

    const table = document.createElement('table');
    table.className = 'inflection-table';

    if (word.isVerb()) {
      // Verb conjugation
      const tenses = ['present', 'past', 'future'];
      tenses.forEach(tense => {
        const forms = word.inflection.getAllForms(tense);
        if (Object.keys(forms).length > 0) {
          const row = document.createElement('tr');
          row.innerHTML = `
            <th>${this.capitalize(tense)}</th>
            <td>${this.formatInflectionForms(forms)}</td>
          `;
          table.appendChild(row);
        }
      });
    } else {
      // Noun/adjective declension
      const cases = word.inflection.getAllForms('cases');
      if (Object.keys(cases).length > 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <th>Cases</th>
          <td>${this.formatInflectionForms(cases)}</td>
        `;
        table.appendChild(row);
      }
    }

    section.appendChild(table);
    return section;
  }

  /**
   * Create examples section
   * @param {Array<Example>} examples
   * @returns {HTMLElement}
   */
  createExamplesSection(examples) {
    const section = document.createElement('div');
    section.className = 'word-examples';

    const title = document.createElement('h3');
    title.textContent = 'Examples';
    section.appendChild(title);

    const list = document.createElement('ul');

    examples.forEach(example => {
      const item = document.createElement('li');
      item.innerHTML = `
        <div class="example-pl">${example.getPolish()}</div>
        <div class="example-translation">${example.getTranslation()}</div>
      `;
      list.appendChild(item);
    });

    section.appendChild(list);
    return section;
  }

  /**
   * Toggle bookmark
   * @param {string} wordKey
   * @param {HTMLElement} button
   */
  toggleBookmark(wordKey, button) {
    const isBookmarked = this.progressService.toggleBookmark(wordKey);

    const icon = button.querySelector('i');
    if (icon) {
      icon.className = isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark';
    }

    button.setAttribute('aria-label', isBookmarked ? 'Remove bookmark' : 'Add bookmark');
  }

  /**
   * Format part of speech
   * @param {string} pos
   * @returns {string}
   */
  formatPartOfSpeech(pos) {
    const posMap = {
      'verb': 'Verb',
      'noun': 'Noun',
      'adjective': 'Adjective',
      'adverb': 'Adverb',
      'pronoun': 'Pronoun',
      'preposition': 'Preposition',
      'conjunction': 'Conjunction'
    };
    return posMap[pos] || pos;
  }

  /**
   * Format inflection forms
   * @param {Object} forms
   * @returns {string}
   */
  formatInflectionForms(forms) {
    return Object.entries(forms)
      .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
      .join(', ');
  }

  /**
   * Capitalize string
   * @param {string} str
   * @returns {string}
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Close the modal
   */
  close() {
    if (this.modal) {
      this.modal.close();
      this.modal.destroy();
      this.modal = null;
    }
  }
}
