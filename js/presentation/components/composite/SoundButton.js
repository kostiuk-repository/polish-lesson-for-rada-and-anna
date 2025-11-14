import { Button } from '../base/Button.js';
import { Icon } from '../base/Icon.js';

/**
 * SoundButton Component
 * Button with audio playback functionality
 */
export class SoundButton {
  constructor(speechAdapter) {
    this.speechAdapter = speechAdapter;
    this.element = null;
    this.isPlaying = false;
  }

  /**
   * Create sound button
   * @param {Object} options
   * @returns {HTMLElement}
   */
  create({
    text,
    type = 'secondary',
    size = 'medium',
    className = '',
    showProgress = false
  } = {}) {
    const container = document.createElement('div');
    container.className = `sound-button-container ${className}`.trim();

    // Create button
    const button = Button.createIconButton({
      icon: Icon.icons.volume,
      type,
      size,
      ariaLabel: `Play "${text}"`,
      onClick: () => this.handleClick(text)
    });

    container.appendChild(button);

    // Add progress indicator if needed
    if (showProgress) {
      const progress = document.createElement('div');
      progress.className = 'sound-progress';
      progress.style.display = 'none';
      container.appendChild(progress);
      this.progressElement = progress;
    }

    this.element = container;
    this.button = button;

    return container;
  }

  /**
   * Handle button click
   * @param {string} text - Text to speak
   */
  async handleClick(text) {
    if (this.isPlaying) {
      this.stop();
      return;
    }

    try {
      this.setPlayingState(true);

      await this.speechAdapter.speak(text);

      this.setPlayingState(false);
    } catch (error) {
      console.error('Error playing audio:', error);
      this.setPlayingState(false);
    }
  }

  /**
   * Set playing state
   * @param {boolean} playing
   */
  setPlayingState(playing) {
    this.isPlaying = playing;

    if (!this.button) return;

    const icon = this.button.querySelector('i');
    if (!icon) return;

    if (playing) {
      icon.className = `fas fa-${Icon.icons.pause}`;
      this.button.classList.add('playing');

      if (this.progressElement) {
        this.progressElement.style.display = 'block';
      }
    } else {
      icon.className = `fas fa-${Icon.icons.volume}`;
      this.button.classList.remove('playing');

      if (this.progressElement) {
        this.progressElement.style.display = 'none';
      }
    }
  }

  /**
   * Stop playback
   */
  stop() {
    this.speechAdapter.stop();
    this.setPlayingState(false);
  }

  /**
   * Destroy component
   */
  destroy() {
    if (this.isPlaying) {
      this.stop();
    }
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  /**
   * Static factory method
   * @param {Object} speechAdapter
   * @param {Object} options
   * @returns {HTMLElement}
   */
  static create(speechAdapter, options) {
    const soundButton = new SoundButton(speechAdapter);
    return soundButton.create(options);
  }
}
