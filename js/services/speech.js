export class SpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.polishVoices = [];
    this.currentUtterance = null;
    this.isInitialized = false;
    this.settings = {
      rate: 0.8,
      pitch: 1,
      volume: 1,
      language: 'pl-PL',
      voicePreference: 'female' // 'male', 'female', 'auto'
    };
    
    this.loadSettings();
  }

  async init() {
    if (!this.isSupported()) {
      console.warn('Speech Synthesis не поддерживается в этом браузере');
      return;
    }

    try {
      await this.loadVoices();
      this.setupEventListeners();
      this.isInitialized = true;
      console.log('✅ SpeechService инициализирован');
    } catch (error) {
      console.error('❌ Ошибка инициализации SpeechService:', error);
      throw error;
    }
  }

  isSupported() {
    return 'speechSynthesis' in window;
  }

  loadVoices() {
    return new Promise((resolve) => {
      // Голоса могут загружаться асинхронно
      const loadVoicesHandler = () => {
        this.voices = Array.from(this.synth.getVoices());
        this.polishVoices = this.voices.filter(voice => 
          voice.lang.startsWith('pl') || 
          voice.lang === 'pl-PL'
        );
        
        if (this.voices.length > 0) {
          this.synth.removeEventListener('voiceschanged', loadVoicesHandler);
          console.log(`📢 Загружено голосов: ${this.voices.length}, польских: ${this.polishVoices.length}`);
          resolve();
        }
      };

      // Проверяем, доступны ли голоса сразу
      if (this.synth.getVoices().length > 0) {
        loadVoicesHandler();
      } else {
        // Ждем события загрузки голосов
        this.synth.addEventListener('voiceschanged', loadVoicesHandler);
        
        // Таймаут на случай, если событие не сработает
        setTimeout(() => {
          if (this.voices.length === 0) {
            console.warn('Голоса не загрузились в течение таймаута');
            loadVoicesHandler();
          }
        }, 2000);
      }
    });
  }

  setupEventListeners() {
    // Переагружаем голоса при изменении
    this.synth.addEventListener('voiceschanged', () => {
      this.loadVoices();
    });
  }

  /**
   * Воспроизводит польский текст
   * @param {string} text - текст для озвучки
   * @param {Object} options - дополнительные настройки
   * @returns {Promise}
   */
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Speech Synthesis не поддерживается'));
        return;
      }

      if (!text || text.trim() === '') {
        reject(new Error('Пустой текст для озвучки'));
        return;
      }

      // Останавливаем текущее воспроизведение
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Применяем настройки
      this.applySettings(utterance, options);
      
      // Выбираем подходящий голос
      const voice = this.selectVoice(options.voicePreference);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = this.settings.language;
      }

      // Обработчики событий
      utterance.onstart = () => {
        console.log('🎵 Начало воспроизведения:', text.substring(0, 50));
      };

      utterance.onend = () => {
        console.log('✅ Завершение воспроизведения');
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('❌ Ошибка воспроизведения:', event.error);
        this.currentUtterance = null;
        reject(new Error(`Speech error: ${event.error}`));
      };

      utterance.onpause = () => {
        console.log('⏸️ Воспроизведение приостановлено');
      };

      utterance.onresume = () => {
        console.log('▶️ Воспроизведение возобновлено');
      };

      // Сохраняем ссылку на текущее воспроизведение
      this.currentUtterance = utterance;

      // Запускаем воспроизведение
      try {
        this.synth.speak(utterance);
        
        // Таймаут безопасности для старых браузеров
        setTimeout(() => {
          if (this.currentUtterance === utterance && !this.synth.speaking) {
            console.warn('Принудительное завершение воспроизведения по таймауту');
            this.currentUtterance = null;
            resolve();
          }
        }, text.length * 100 + 5000); // Примерное время + буфер
        
      } catch (error) {
        this.currentUtterance = null;
        reject(error);
      }
    });
  }

  /**
   * Останавливает текущее воспроизведение
   */
  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * Приостанавливает воспроизведение
   */
  pause() {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  /**
   * Возобновляет воспроизведение
   */
  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  /**
   * Проверяет, идет ли воспроизведение
   * @returns {boolean}
   */
  isSpeaking() {
    return this.synth.speaking;
  }

  /**
   * Проверяет, приостановлено ли воспроизведение
   * @returns {boolean}
   */
  isPaused() {
    return this.synth.paused;
  }

  applySettings(utterance, options) {
    utterance.rate = options.rate || this.settings.rate;
    utterance.pitch = options.pitch || this.settings.pitch;
    utterance.volume = options.volume || this.settings.volume;
  }

  selectVoice(preference = null) {
    if (this.polishVoices.length === 0) {
      console.warn('Польские голоса не найдены, используем голос по умолчанию');
      return null;
    }

    const voicePreference = preference || this.settings.voicePreference;
    
    // Пытаемся найти голос по предпочтениям
    let selectedVoice = null;
    
    if (voicePreference === 'female') {
      selectedVoice = this.polishVoices.find(voice => 
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('kobieta') ||
        voice.name.toLowerCase().includes('anna') ||
        voice.name.toLowerCase().includes('maja')
      );
    } else if (voicePreference === 'male') {
      selectedVoice = this.polishVoices.find(voice => 
        voice.name.toLowerCase().includes('male') ||
        voice.name.toLowerCase().includes('mężczyzna') ||
        voice.name.toLowerCase().includes('adam') ||
        voice.name.toLowerCase().includes('jakub')
      );
    }
    
    // Если не найден предпочтительный, берем первый доступный
    if (!selectedVoice) {
      selectedVoice = this.polishVoices[0];
    }

    console.log('🎤 Выбранный голос:', selectedVoice?.name || 'По умолчанию');
    return selectedVoice;
  }

  /**
   * Получает список доступных польских голосов
   * @returns {Array}
   */
  getAvailableVoices() {
    return this.polishVoices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      gender: this.detectGender(voice.name),
      local: voice.localService
    }));
  }

  detectGender(voiceName) {
    const nameLower = voiceName.toLowerCase();
    
    if (nameLower.includes('female') || 
        nameLower.includes('kobieta') ||
        nameLower.includes('anna') ||
        nameLower.includes('maja') ||
        nameLower.includes('ewa')) {
      return 'female';
    }
    
    if (nameLower.includes('male') ||
        nameLower.includes('mężczyzna') ||
        nameLower.includes('adam') ||
        nameLower.includes('jakub') ||
        nameLower.includes('tomasz')) {
      return 'male';
    }
    
    return 'unknown';
  }

  /**
   * Обновляет настройки речи
   * @param {Object} newSettings - новые настройки
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  /**
   * Получает текущие настройки
   * @returns {Object}
   */
  getSettings() {
    return { ...this.settings };
  }

  saveSettings() {
    try {
      localStorage.setItem('speechSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Не удалось сохранить настройки речи:', error);
    }
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('speechSettings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Не удалось загрузить настройки речи:', error);
    }
  }

  /**
   * Тестирует произношение с текущими настройками
   * @param {string} testText - тестовый текст
   * @returns {Promise}
   */
  async testVoice(testText = 'Cześć! Jak się masz?') {
    try {
      await this.speak(testText);
      return true;
    } catch (error) {
      console.error('Ошибка тестирования голоса:', error);
      return false;
    }
  }

  /**
   * Разбивает длинный текст на части для лучшего воспроизведения
   * @param {string} text - текст для разбивки
   * @param {number} maxLength - максимальная длина части
   * @returns {Array}
   */
  splitTextForSpeech(text, maxLength = 200) {
    if (text.length <= maxLength) {
      return [text];
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (currentChunk.length + trimmedSentence.length <= maxLength) {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + '.');
        }
        currentChunk = trimmedSentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk + '.');
    }

    return chunks;
  }

  /**
   * Воспроизводит длинный текст по частям
   * @param {string} longText - длинный текст
   * @param {Object} options - настройки
   * @returns {Promise}
   */
  async speakLongText(longText, options = {}) {
    const chunks = this.splitTextForSpeech(longText);
    const pauseBetweenChunks = options.pauseBetweenChunks || 500;

    for (let i = 0; i < chunks.length; i++) {
      await this.speak(chunks[i], options);
      
      // Пауза между частями (кроме последней)
      if (i < chunks.length - 1) {
        await this.delay(pauseBetweenChunks);
      }
    }
  }

  /**
   * Создает аудио-плеер для предварительного воспроизведения
   * @param {string} text - текст для воспроизведения
   * @returns {HTMLElement}
   */
  createAudioPlayer(text) {
    const container = document.createElement('div');
    container.className = 'speech-player';
    
    container.innerHTML = `
      <button class="speech-player__btn speech-player__play" title="Воспроизвести">
        <i class="fas fa-play"></i>
      </button>
      <button class="speech-player__btn speech-player__pause" title="Пауза" style="display: none;">
        <i class="fas fa-pause"></i>
      </button>
      <button class="speech-player__btn speech-player__stop" title="Остановить">
        <i class="fas fa-stop"></i>
      </button>
      <div class="speech-player__text">${text.substring(0, 50)}${text.length > 50 ? '...' : ''}</div>
    `;

    const playBtn = container.querySelector('.speech-player__play');
    const pauseBtn = container.querySelector('.speech-player__pause');
    const stopBtn = container.querySelector('.speech-player__stop');

    playBtn.addEventListener('click', async () => {
      try {
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-flex';
        await this.speak(text);
      } catch (error) {
        console.error('Ошибка воспроизведения:', error);
      } finally {
        playBtn.style.display = 'inline-flex';
        pauseBtn.style.display = 'none';
      }
    });

    pauseBtn.addEventListener('click', () => {
      this.pause();
      playBtn.style.display = 'inline-flex';
      pauseBtn.style.display = 'none';
    });

    stopBtn.addEventListener('click', () => {
      this.stop();
      playBtn.style.display = 'inline-flex';
      pauseBtn.style.display = 'none';
    });

    return container;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Получает статистику использования
   * @returns {Object}
   */
  getUsageStats() {
    const stats = JSON.parse(localStorage.getItem('speechUsageStats') || '{}');
    const totalRequests = stats.totalRequests || 0;
    const totalCharacters = stats.totalCharacters || 0;

    return {
      totalRequests,
      totalCharacters,
      totalSpeechRequests: totalRequests,
      totalCharactersSpoken: totalCharacters,
      averageTextLength: totalRequests > 0 ?
        Math.round(totalCharacters / totalRequests) : 0,
      lastUsed: stats.lastUsed || null
    };
  }

  /**
   * Обновляет статистику использования
   * @param {string} text - произнесенный текст
   */
  updateUsageStats(text) {
    const stats = JSON.parse(localStorage.getItem('speechUsageStats') || '{}');
    const updatedStats = {
      totalRequests: (stats.totalRequests || 0) + 1,
      totalCharacters: (stats.totalCharacters || 0) + text.length,
      lastUsed: Date.now()
    };

    try {
      localStorage.setItem('speechUsageStats', JSON.stringify(updatedStats));
    } catch (error) {
      console.warn('Не удалось сохранить статистику использования:', error);
    }
  }

  destroy() {
    this.stop();
    this.saveSettings();
    this.voices = [];
    this.polishVoices = [];
    this.currentUtterance = null;
    this.isInitialized = false;
  }
}