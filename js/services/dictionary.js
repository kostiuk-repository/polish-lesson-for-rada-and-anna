export class DictionaryService {
  constructor(api) {
    this.api = api;
    this.dictionary = new Map();
    this.phoneticRules = new Map();
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  async init() {
    if (this.isInitialized) {
      return;
    }
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    this.initializationPromise = (async () => {
      try {
        console.log('🔄 Начало инициализации DictionaryService...');
        
        // Загружаем фонетические правила и индекс словаря
        const [phoneticRules, dictionaryIndex] = await Promise.all([
          this.api.getPhoneticRules(),
          this.api.getDictionary()
        ]);
        
        // Загружаем фонетические правила
        if (phoneticRules && Array.isArray(phoneticRules)) {
          for (const rule of phoneticRules) {
            this.phoneticRules.set(rule.letter, rule.pronunciation);
          }
        }
        console.log(`✅ Фонетичні правила завантажено: ${this.phoneticRules.size} шт.`);
        
        // Загружаем основной словарь
        if (dictionaryIndex && typeof dictionaryIndex === 'object') {
          for (const [word, data] of Object.entries(dictionaryIndex)) {
            const normalizedWord = this.normalizeWord(word);
            if (!this.dictionary.has(normalizedWord)) {
              this.dictionary.set(normalizedWord, {
                lemma: word,
                ...data
              });
            }
          }
        }
        
        this.isInitialized = true;
        console.log(`✅ DictionaryService успішно ініціалізовано. Всього слів: ${this.dictionary.size}`);
      } catch (error) {
        console.error('❌ Помилка під час ініціалізації DictionaryService:', error);
        throw error; 
      } finally {
        this.initializationPromise = null;
      }
    })();
    
    return this.initializationPromise;
  }

  async loadDictionaryCategory(category, theme = 'basic') {
    try {
      const words = await this.api.getDictionaryCategory(category, theme);
      for (const [key, wordData] of Object.entries(words)) {
        this.dictionary.set(key.toLowerCase(), {
          lemma: key,
          ...wordData,
          category,
          theme
        });
      }
      console.log(`📚 Загружена категория: ${category}/${theme} (${Object.keys(words).length} слов)`);
    } catch (error) {
      console.error(`❌ Ошибка загрузки категории ${category}/${theme}:`, error);
    }
  }

  async getWord(word) {
    if (!this.isInitialized) {
      await this.init();
    }
    const normalizedWord = this.normalizeWord(word);
    const wordData = this.dictionary.get(normalizedWord);
    return wordData || null;
  }

  searchWords(query, limit = 10) {
    const normalizedQuery = query.toLowerCase().trim();
    const results = [];
    
    for (const [key, wordData] of this.dictionary) {
      if (results.length >= limit) break;
      
      if (key.includes(normalizedQuery)) {
        results.push({
          key,
          word: wordData,
          matchType: 'lemma',
          relevance: this.calculateRelevance(key, normalizedQuery)
        });
        continue;
      }
      
      if (wordData.translations?.ru?.toLowerCase().includes(normalizedQuery)) {
        results.push({
          key,
          word: wordData,
          matchType: 'translation',
          relevance: this.calculateRelevance(wordData.translations.ru, normalizedQuery)
        });
      }
    }
    
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  getPhoneticRule(ruleKey) {
    return this.phoneticRules.get(ruleKey) || null;
  }

  applyPhoneticRules(word) {
    let transcription = word.toLowerCase();
    const ruleOrder = [
      'ą', 'ę', 'ł', 'ć', 'ś', 'ź', 'ń',
      'rz', 'cz', 'sz', 'dz', 'dź', 'dż',
      'cie', 'sie', 'zie', 'nie',
      'ci', 'si', 'zi', 'ni'
    ];
    
    for (const ruleKey of ruleOrder) {
      const rule = this.phoneticRules.get(ruleKey);
      if (rule) {
        const regex = new RegExp(ruleKey, 'gi');
        transcription = transcription.replace(regex, rule.ru || rule);
      }
    }
    
    return transcription;
  }

  generatePronunciation(wordData) {
    if (wordData.pronunciation?.ru_transcription) {
      return wordData.pronunciation;
    }
    
    const transcription = this.applyPhoneticRules(wordData.lemma);
    return {
      ru_transcription: transcription,
      auto_generated: true
    };
  }

  getWordExamples(word) {
    const wordData = this.getWord(word);
    return wordData?.examples || [];
  }

  getRelatedWords(word) {
    const wordData = this.getWord(word);
    if (!wordData) return [];
    
    const related = [];
    const samePOS = this.getWordsByPartOfSpeech(wordData.part_of_speech);
    related.push(...samePOS.slice(0, 5));
    
    return related;
  }

  getWordsByPartOfSpeech(partOfSpeech) {
    const words = [];
    for (const [key, wordData] of this.dictionary) {
      if (wordData.part_of_speech === partOfSpeech) {
        words.push({ key, ...wordData });
      }
    }
    return words;
  }

  normalizeWord(word) {
    return word.toLowerCase()
      .replace(/[.,!?;:()]/g, '')
      .trim();
  }

  calculateRelevance(text, query) {
    const normalizedText = text.toLowerCase();
    if (normalizedText === query) return 100;
    if (normalizedText.startsWith(query)) return 80;
    if (normalizedText.includes(query)) return 60;
    return 0;
  }

  getStats() {
    const stats = {
      totalWords: this.dictionary.size,
      byPartOfSpeech: {},
      byCategory: {},
      byTheme: {}
    };
    
    for (const [key, wordData] of this.dictionary) {
      if (wordData.part_of_speech) {
        stats.byPartOfSpeech[wordData.part_of_speech] = 
          (stats.byPartOfSpeech[wordData.part_of_speech] || 0) + 1;
      }
      if (wordData.category) {
        stats.byCategory[wordData.category] = 
          (stats.byCategory[wordData.category] || 0) + 1;
      }
      if (wordData.theme) {
        stats.byTheme[wordData.theme] = 
          (stats.byTheme[wordData.theme] || 0) + 1;
      }
    }
    
    return stats;
  }

  getPartOfSpeechName(pos) {
    const names = {
      'verb': 'Глагол',
      'noun': 'Существительное',
      'adjective': 'Прилагательное',
      'adverb': 'Наречие',
      'pronoun': 'Местоимение',
      'preposition': 'Предлог',
      'conjunction': 'Союз',
      'particle': 'Частица',
      'modal': 'Модальное слово',
      'interjection': 'Междометие',
      'numeral': 'Числительное',
      'punctuation': 'Знак препинания'
    };
    return names[pos] || pos;
  }
}