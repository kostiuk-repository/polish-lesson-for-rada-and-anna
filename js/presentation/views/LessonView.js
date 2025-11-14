import { TabBar } from '../components/composite/TabBar.js';
import { Button } from '../components/base/Button.js';
import { DialoguePlayer } from '../components/features/DialoguePlayer.js';
import { ExerciseSheet } from '../components/features/ExerciseSheet.js';
import { WordDetailsPanel } from '../components/features/WordDetailsPanel.js';

/**
 * LessonView
 * View for displaying a lesson
 */
export class LessonView {
  constructor(viewModel, speechAdapter, dictionaryService, progressService) {
    this.viewModel = viewModel;
    this.speechAdapter = speechAdapter;
    this.dictionaryService = dictionaryService;
    this.progressService = progressService;
    this.container = null;
    this.tabBar = null;
    this.wordDetailsPanel = null;
  }

  /**
   * Render the lesson view
   * @param {HTMLElement} container
   * @param {string} lessonId
   */
  async render(container, lessonId) {
    this.container = container;
    container.innerHTML = '<div class="loading">Loading lesson...</div>';

    // Load lesson
    await this.viewModel.loadLesson(lessonId);

    // Subscribe to state changes
    this.viewModel.subscribe((state) => {
      this.renderContent(state);
    });

    // Initial render
    this.renderContent(this.viewModel.getState());
  }

  /**
   * Render content based on state
   * @param {Object} state
   */
  renderContent(state) {
    if (!this.container) return;

    this.container.innerHTML = '';

    // Error state
    if (state.error) {
      const error = document.createElement('div');
      error.className = 'error';
      error.textContent = `Error: ${state.error}`;
      this.container.appendChild(error);
      return;
    }

    // Loading state
    if (state.isLoading) {
      const loading = document.createElement('div');
      loading.className = 'loading';
      loading.textContent = 'Loading...';
      this.container.appendChild(loading);
      return;
    }

    if (!state.lesson) return;

    const lesson = state.lesson;

    // Header
    const header = this.createHeader(lesson);
    this.container.appendChild(header);

    // Tab bar
    this.tabBar = new TabBar();
    const tabs = this.createTabs(lesson);
    const tabBarEl = this.tabBar.create({
      tabs,
      activeTabId: state.activeTab,
      onTabChange: (tabId) => this.viewModel.setActiveTab(tabId)
    });
    this.container.appendChild(tabBarEl);

    // Tab content
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';
    this.renderTabContent(tabContent, state.activeTab, lesson);
    this.container.appendChild(tabContent);
  }

  /**
   * Create header
   * @param {Lesson} lesson
   * @returns {HTMLElement}
   */
  createHeader(lesson) {
    const header = document.createElement('div');
    header.className = 'lesson-header';

    // Back button
    const backBtn = Button.create({
      text: '← Back to Catalog',
      type: 'link',
      onClick: () => this.viewModel.navigateToCatalog()
    });
    header.appendChild(backBtn);

    // Title
    const title = document.createElement('h1');
    title.textContent = lesson.getTitle();
    header.appendChild(title);

    // Description
    const description = document.createElement('p');
    description.className = 'lesson-description';
    description.textContent = lesson.getDescription();
    header.appendChild(description);

    return header;
  }

  /**
   * Create tabs configuration
   * @param {Lesson} lesson
   * @returns {Array}
   */
  createTabs(lesson) {
    const tabs = [
      { id: 'dialogue', label: 'Dialogue', icon: 'fas fa-comments' }
    ];

    if (lesson.getGrammar().length > 0) {
      tabs.push({ id: 'grammar', label: 'Grammar', icon: 'fas fa-book' });
    }

    if (lesson.getExercises().length > 0) {
      tabs.push({ id: 'exercises', label: 'Exercises', icon: 'fas fa-pencil-alt', badge: lesson.getExercises().length });
    }

    return tabs;
  }

  /**
   * Render tab content
   * @param {HTMLElement} container
   * @param {string} tabId
   * @param {Lesson} lesson
   */
  renderTabContent(container, tabId, lesson) {
    container.innerHTML = '';

    switch (tabId) {
      case 'dialogue':
        this.renderDialogueTab(container, lesson);
        break;
      case 'grammar':
        this.renderGrammarTab(container, lesson);
        break;
      case 'exercises':
        this.renderExercisesTab(container, lesson);
        break;
    }
  }

  /**
   * Render dialogue tab
   * @param {HTMLElement} container
   * @param {Lesson} lesson
   */
  renderDialogueTab(container, lesson) {
    const dialoguePlayer = new DialoguePlayer(this.speechAdapter, this.dictionaryService);

    const playerEl = dialoguePlayer.create({
      dialogueLines: lesson.getContent(),
      showTranslation: this.viewModel.getState().showTranslations,
      showTranscription: this.viewModel.getState().showTranscriptions,
      onWordClick: (wordKey) => this.handleWordClick(wordKey)
    });

    container.appendChild(playerEl);
  }

  /**
   * Render grammar tab
   * @param {HTMLElement} container
   * @param {Lesson} lesson
   */
  renderGrammarTab(container, lesson) {
    const grammarSection = document.createElement('div');
    grammarSection.className = 'grammar-section';

    lesson.getGrammar().forEach(topic => {
      const topicEl = document.createElement('div');
      topicEl.className = 'grammar-topic';

      const title = document.createElement('h3');
      title.textContent = topic.getTitle();
      topicEl.appendChild(title);

      const content = document.createElement('div');
      content.className = 'grammar-content';
      content.innerHTML = topic.getContent();
      topicEl.appendChild(content);

      grammarSection.appendChild(topicEl);
    });

    container.appendChild(grammarSection);
  }

  /**
   * Render exercises tab
   * @param {HTMLElement} container
   * @param {Lesson} lesson
   */
  renderExercisesTab(container, lesson) {
    const exercises = lesson.getExercises();

    if (exercises.length === 0) {
      container.innerHTML = '<p>No exercises available</p>';
      return;
    }

    // For now, render the first exercise
    const exercise = exercises[0];

    const exerciseSheet = new ExerciseSheet(this.viewModel.exerciseService);
    const sheetEl = exerciseSheet.create({
      exercise,
      onComplete: (results) => this.viewModel.completeExercise(results)
    });

    container.appendChild(sheetEl);
  }

  /**
   * Handle word click
   * @param {string} wordKey
   */
  handleWordClick(wordKey) {
    if (!this.wordDetailsPanel) {
      this.wordDetailsPanel = new WordDetailsPanel(
        this.dictionaryService,
        this.speechAdapter,
        this.progressService
      );
    }

    this.wordDetailsPanel.show(wordKey);
  }

  /**
   * Destroy view
   */
  destroy() {
    if (this.tabBar) {
      this.tabBar.destroy();
    }
    if (this.wordDetailsPanel) {
      this.wordDetailsPanel.close();
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
