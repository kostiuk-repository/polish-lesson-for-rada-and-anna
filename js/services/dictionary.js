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
        
        // Загружаем фонетические правила
        const phoneticRules = await this.api.getPhoneticRules();
        
        // Загружаем фонетические правила
        if (phoneticRules && Array.isArray(phoneticRules)) {
          for (const rule of phoneticRules) {
            this.phoneticRules.set(rule.letter, rule.pronunciation);
          }
        }
        console.log(`✅ Фонетические правила загружено: ${this.phoneticRules.size} шт.`);
        
        // ИСПРАВЛЕНИЕ: Загружаем основной словарь из dictionary.json (не index.json!)
        const mainDictionary = await this.api.fetchJSON('dictionary.json');
        
        if (mainDictionary && typeof mainDictionary === 'object') {
          for (const [word, data] of Object.entries(mainDictionary)) {
            const normalizedWord = this.normalizeWord(word);
            if (!this.dictionary.has(normalizedWord)) {
              this.dictionary.set(normalizedWord, {
                lemma: word,
                ...data
              });
            }
          }
        }
        
        // Дополнительно загружаем словари по категориям
        await this.loadAllCategories();
        
        this.isInitialized = true;
        console.log(`✅ DictionaryService успешно инициализован. Всего слов: ${this.dictionary.size}`);
      } catch (error) {
        console.error('❌ Ошибка при инициализации DictionaryService:', error);
        throw error; 
      } finally {
        this.initializationPromise = null;
      }
    })();
    
    return this.initializationPromise;
  }

  async loadAllCategories() {
    try {
      // Загружаем индекс категорий для определения какие файлы загружать
      const dictionaryIndex = await this.api.getDictionary();
      
      const loadPromises = [];
      
      if (dictionaryIndex.categories) {
        for (const [categoryName, categoryData] of Object.entries(dictionaryIndex.categories)) {
          if (categoryData.themes) {
            for (const [themeName, themeData] of Object.entries(categoryData.themes)) {
              if (themeData.words_count > 0) {
                loadPromises.push(
                  this.loadDictionaryCategory(categoryName, themeName)
                );
              }
            }
          }
        }
      }
      
      await Promise.all(loadPromises);
    } catch (error) {
      console.warn('Не удалось загрузить дополнительные категории:', error);
    }
  }

  async loadDictionaryCategory(category, theme = 'basic') {
    try {
      const words = await this.api.getDictionaryCategory(category, theme);
      if (!words) return;
      
      for (const [key, wordData] of Object.entries(words)) {
        const normalizedKey = this.normalizeWord(key);
        if (!this.dictionary.has(normalizedKey)) {
          this.dictionary.set(normalizedKey, {
            lemma: key,
            ...wordData,
            category,
            theme
          });
        }
      }
      console.log(`📚 Загружена категория: ${category}/${theme} (${Object.keys(words).length} слов)`);
    } catch (error) {
      console.warn(`❌ Ошибка загрузки категории ${category}/${theme}:`, error);
    }
  }

  async getWord(word) {
    if (!this.isInitialized) {
      await this.init();
    }
    const normalizedWord = this.normalizeWord(word);
    const wordData = this.dictionary.get(normalizedWord);
    
    if (wordData) {
      // Увеличиваем счетчик просмотров
      this.trackWordView(word);
    }
    
    return wordData || null;
  }

  // Остальные методы остаются без изменений...
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

  trackWordView(word) {
    if (window.PolishApp?.storage) {
      window.PolishApp.storage.updateWordProgress(word, {
        viewCount: (window.PolishApp.storage.getWordProgress(word).viewCount || 0) + 1
      });
    }
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
}