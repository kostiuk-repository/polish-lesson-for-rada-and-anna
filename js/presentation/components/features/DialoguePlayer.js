import { SoundButton } from '../composite/SoundButton.js';
import { Button } from '../base/Button.js';
import { Icon } from '../base/Icon.js';

/**
 * DialoguePlayer Component
 * Feature component for playing dialogue lines
 */
export class DialoguePlayer {
  constructor(speechAdapter, dictionaryService) {
    this.speechAdapter = speechAdapter;
    this.dictionaryService = dictionaryService;
    this.element = null;
    this.dialogueLines = [];
    this.currentLineIndex = 0;
    this.onWordClick = null;
  }

  /**
   * Create dialogue player
   * @param {Object} options
   * @returns {HTMLElement}
   */
  create({
    dialogueLines = [],
    showTranslation = true,
    showTranscription = false,
    onWordClick = null,
    className = ''
  } = {}) {
    this.dialogueLines = dialogueLines;
    this.onWordClick = onWordClick;

    const container = document.createElement('div');
    container.className = `dialogue-player ${className}`.trim();

    // Controls
    const controls = this.createControls({ showTranslation, showTranscription });
    container.appendChild(controls);

    // Dialogue lines container
    const linesContainer = document.createElement('div');
    linesContainer.className = 'dialogue-lines';

    dialogueLines.forEach((line, index) => {
      const lineElement = this.createDialogueLine(line, index, showTranslation, showTranscription);
      linesContainer.appendChild(lineElement);
    });

    container.appendChild(linesContainer);

    this.element = container;
    this.linesContainer = linesContainer;

    return container;
  }

  /**
   * Create controls bar
   * @param {Object} options
   * @returns {HTMLElement}
   */
  createControls({ showTranslation, showTranscription }) {
    const controls = document.createElement('div');
    controls.className = 'dialogue-controls';

    // Play all button
    const playAllBtn = Button.create({
      text: 'Play All',
      icon: Icon.icons.play,
      type: 'primary',
      onClick: () => this.playAll()
    });

    // Toggle translation
    const toggleTransBtn = Button.create({
      text: showTranslation ? 'Hide Translation' : 'Show Translation',
      type: 'secondary',
      onClick: (e) => this.toggleTranslation(e.target)
    });

    // Toggle transcription
    const toggleTranscBtn = Button.create({
      text: showTranscription ? 'Hide Transcription' : 'Show Transcription',
      type: 'secondary',
      onClick: (e) => this.toggleTranscription(e.target)
    });

    controls.appendChild(playAllBtn);
    controls.appendChild(toggleTransBtn);
    controls.appendChild(toggleTranscBtn);

    return controls;
  }

  /**
   * Create a dialogue line element
   * @param {DialogueLine} line
   * @param {number} index
   * @param {boolean} showTranslation
   * @param {boolean} showTranscription
   * @returns {HTMLElement}
   */
  createDialogueLine(line, index, showTranslation, showTranscription) {
    const lineEl = document.createElement('div');
    lineEl.className = 'dialogue-line';
    lineEl.dataset.index = index;

    // Speaker
    const speaker = document.createElement('div');
    speaker.className = 'dialogue-speaker';
    speaker.textContent = line.getSpeaker();
    lineEl.appendChild(speaker);

    // Content container
    const content = document.createElement('div');
    content.className = 'dialogue-content';

    // Polish sentence with clickable words
    const sentence = document.createElement('div');
    sentence.className = 'dialogue-sentence';

    line.getWords().forEach(wordData => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'clickable-word';
      wordSpan.textContent = wordData.text;
      wordSpan.dataset.wordKey = wordData.wordKey;

      if (this.onWordClick) {
        wordSpan.addEventListener('click', () => {
          this.onWordClick(wordData.wordKey);
        });
      }

      sentence.appendChild(wordSpan);
      sentence.appendChild(document.createTextNode(' '));
    });

    content.appendChild(sentence);

    // Translation
    const translation = document.createElement('div');
    translation.className = 'dialogue-translation';
    translation.textContent = line.getTranslation();
    translation.style.display = showTranslation ? 'block' : 'none';
    content.appendChild(translation);

    // Transcription
    const transcription = document.createElement('div');
    transcription.className = 'dialogue-transcription';
    transcription.textContent = line.getTranscription();
    transcription.style.display = showTranscription ? 'block' : 'none';
    content.appendChild(transcription);

    lineEl.appendChild(content);

    // Sound button
    const soundBtn = SoundButton.create(this.speechAdapter, {
      text: line.getSentence(),
      type: 'secondary',
      size: 'small'
    });
    lineEl.appendChild(soundBtn);

    return lineEl;
  }

  /**
   * Play all dialogue lines sequentially
   */
  async playAll() {
    for (let i = 0; i < this.dialogueLines.length; i++) {
      await this.playLine(i);
      // Small pause between lines
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  /**
   * Play a specific line
   * @param {number} index
   */
  async playLine(index) {
    if (index < 0 || index >= this.dialogueLines.length) return;

    const line = this.dialogueLines[index];
    await this.speechAdapter.speak(line.getSentence());
  }

  /**
   * Toggle translation visibility
   * @param {HTMLElement} button
   */
  toggleTranslation(button) {
    if (!this.linesContainer) return;

    const translations = this.linesContainer.querySelectorAll('.dialogue-translation');
    const isVisible = translations[0]?.style.display !== 'none';

    translations.forEach(el => {
      el.style.display = isVisible ? 'none' : 'block';
    });

    button.textContent = isVisible ? 'Show Translation' : 'Hide Translation';
  }

  /**
   * Toggle transcription visibility
   * @param {HTMLElement} button
   */
  toggleTranscription(button) {
    if (!this.linesContainer) return;

    const transcriptions = this.linesContainer.querySelectorAll('.dialogue-transcription');
    const isVisible = transcriptions[0]?.style.display !== 'none';

    transcriptions.forEach(el => {
      el.style.display = isVisible ? 'none' : 'block';
    });

    button.textContent = isVisible ? 'Show Transcription' : 'Hide Transcription';
  }

  /**
   * Destroy component
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
