import { SpeechService } from '../../services/speech.js';

/**
 * SpeechApiAdapter
 * Infrastructure adapter for Speech Synthesis API
 * Provides a clean interface for text-to-speech functionality
 */
export class SpeechApiAdapter {
  constructor() {
    this.speechService = new SpeechService();
    this.isInitialized = false;
  }

  /**
   * Initialize the speech service
   * @returns {Promise<void>}
   */
  async init() {
    if (this.isInitialized) return;

    try {
      await this.speechService.init();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize SpeechApiAdapter:', error);
      throw error;
    }
  }

  /**
   * Check if speech synthesis is supported
   * @returns {boolean}
   */
  isSupported() {
    return this.speechService.isSupported();
  }

  /**
   * Speak Polish text
   * @param {string} text - Text to speak
   * @param {Object} options - Speech options
   * @returns {Promise<void>}
   */
  async speak(text, options = {}) {
    if (!this.isInitialized) {
      await this.init();
    }
    return this.speechService.speak(text, options);
  }

  /**
   * Stop current speech
   */
  stop() {
    this.speechService.stop();
  }

  /**
   * Pause current speech
   */
  pause() {
    this.speechService.pause();
  }

  /**
   * Resume paused speech
   */
  resume() {
    this.speechService.resume();
  }

  /**
   * Check if currently speaking
   * @returns {boolean}
   */
  isSpeaking() {
    return this.speechService.isSpeaking();
  }

  /**
   * Check if speech is paused
   * @returns {boolean}
   */
  isPaused() {
    return this.speechService.isPaused();
  }

  /**
   * Get available Polish voices
   * @returns {Array}
   */
  getPolishVoices() {
    return this.speechService.polishVoices;
  }

  /**
   * Update speech settings
   * @param {Object} settings - New settings
   */
  updateSettings(settings) {
    this.speechService.updateSettings(settings);
  }

  /**
   * Get current settings
   * @returns {Object}
   */
  getSettings() {
    return this.speechService.getSettings();
  }
}
