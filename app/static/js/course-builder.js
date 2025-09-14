/**
 * @fileoverview Module for handling the dynamic creation of course chapters and sessions.
 * This module exports functions to add chapters, learning sessions, and quiz sessions to the DOM.
 */

import QuizGenerator from './quiz-generator.js';

let chapterCounter = 0;

const CourseBuilder = {
    /**
     * Adds a new chapter section to the DOM.
     */
    addChapter() {
        chapterCounter++;
        const chapterHtml = this.createChapterCard(chapterCounter);
        const chaptersContainer = document.getElementById('chapters-container');
        chaptersContainer.insertAdjacentHTML('beforeend', chapterHtml);
        
        const newChapterCard = chaptersContainer.lastElementChild;
        this.addChapterEventListeners(newChapterCard);
    },

    /**
     * Creates the HTML string for a new chapter card.
     * @param {number} chapterNumber
     * @returns {string} The HTML for the chapter card.
     */
    createChapterCard(chapterNumber) {
        return `
            <div class="chapter-card relative p-6 border border-gray-300 rounded-lg shadow-md bg-white">
                <button type="button" class="remove-button absolute top-2 right-2 text-red-500 hover:text-red-700 z-10" onclick="this.closest('.chapter-card').remove();">
                    <i class="fas fa-times-circle"></i>
                </button>
                <h4 class="text-lg font-semibold mb-2 text-indigo-700">Chapter ${chapterNumber}</h4>
                <label class="block text-sm font-medium text-gray-700">Chapter Title</label>
                <input type="text" class="chapter-title mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g., Introduction to Python" required>
                
                <div class="sessions-container mt-4 space-y-4" data-chapter-id="${chapterNumber}">
                    <!-- Sessions will be appended here -->
                </div>
                
                <div class="session-type-selector mt-4 space-x-2">
                    <button type="button" class="add-learning-session-btn px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300">
                        <i class="fas fa-book mr-2"></i> Add Learning Session
                    </button>
                    <button type="button" class="add-quiz-session-btn px-4 py-2 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600 transition duration-300">
                        <i class="fas fa-question-circle mr-2"></i> Add Quiz Session
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Adds event listeners to the buttons within a new chapter card.
     * @param {HTMLElement} chapterCard - The new chapter card element.
     */
    addChapterEventListeners(chapterCard) {
        const sessionsContainer = chapterCard.querySelector('.sessions-container');
        const addLearningBtn = chapterCard.querySelector('.add-learning-session-btn');
        const addQuizBtn = chapterCard.querySelector('.add-quiz-session-btn');

        addLearningBtn.addEventListener('click', () => this.addSession(sessionsContainer, 'learning_session'));
        addQuizBtn.addEventListener('click', () => this.addSession(sessionsContainer, 'quiz_session'));
    },

    /**
     * Adds a new session (learning or quiz) to the specified chapter.
     * @param {HTMLElement} container - The sessions container element.
     * @param {string} type - The type of session.
     */
    addSession(container, type) {
        const sessionHtml = this.createSessionCard(type);
        container.insertAdjacentHTML('beforeend', sessionHtml);
        const newSessionCard = container.lastElementChild;
        this.addSessionEventListeners(newSessionCard, type);
    },

    /**
     * Creates the HTML string for a new session card.
     * @param {string} type - The session type.
     * @returns {string} The HTML for the session card.
     */
    createSessionCard(type) {
        if (type === 'learning_session') {
            return `
                <div class="session-card relative learning-session-card p-4 border border-gray-200 rounded-lg shadow-md bg-white">
                    <button type="button" class="remove-button absolute top-2 right-2 text-red-500 hover:text-red-700" onclick="this.closest('.session-card').remove();">
                        <i class="fas fa-times-circle"></i>
                    </button>
                    <h5 class="text-md font-semibold mb-2 text-green-700">Learning Session</h5>
                    <label class="block text-sm font-medium text-gray-700">Session Title</label>
                    <input type="text" class="session-title mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required>
                    <div class="materials-container mt-4 space-y-4">
                        <!-- Materials will be appended here -->
                    </div>
                    <button type="button" class="add-material-btn mt-4 flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300">
                        <i class="fas fa-plus"></i>
                        <span>Add Material</span>
                    </button>
                </div>
            `;
        } else if (type === 'quiz_session') {
            return `
                <div class="session-card relative quiz-session-card p-4 border border-gray-200 rounded-lg shadow-md bg-white">
                    <button type="button" class="remove-button absolute top-2 right-2 text-red-500 hover:text-red-700" onclick="this.closest('.session-card').remove();">
                        <i class="fas fa-times-circle"></i>
                    </button>
                    <h5 class="text-md font-semibold mb-2 text-purple-700">Quiz Session</h5>
                    <label class="block text-sm font-medium text-gray-700">Quiz Name</label>
                    <input type="text" class="quiz-name mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required>
                    
                    <div class="quiz-questions-container mt-4 space-y-4">
                        <!-- AI quiz generator will be appended here -->
                    </div>
                    
                    <button type="button" class="add-quiz-btn mt-4 flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600 transition duration-300">
                        <i class="fas fa-wand-magic-sparkles"></i>
                        <span>Generate Questions with AI</span>
                    </button>
                </div>
            `;
        }
        return '';
    },

    /**
     * Adds event listeners to buttons within a new session card.
     * @param {HTMLElement} sessionCard - The new session card element.
     * @param {string} type - The type of session.
     */
    addSessionEventListeners(sessionCard, type) {
        if (type === 'learning_session') {
            const addMaterialBtn = sessionCard.querySelector('.add-material-btn');
            addMaterialBtn.addEventListener('click', () => this.addMaterial(sessionCard));
        } else if (type === 'quiz_session') {
            const addQuizBtn = sessionCard.querySelector('.add-quiz-btn');
            addQuizBtn.addEventListener('click', () => QuizGenerator.createGeneratorForm(sessionCard));
        }
    },

    /**
     * Adds a new material to the specified learning session.
     * @param {HTMLElement} sessionCard - The session card element.
     */
    addMaterial(sessionCard) {
        const materialsContainer = sessionCard.querySelector('.materials-container');
        const materialHtml = this.createMaterialForm();
        materialsContainer.insertAdjacentHTML('beforeend', materialHtml);
    },

    /**
     * Creates the HTML string for a new material form.
     * @returns {string} The HTML for the material form.
     */
    createMaterialForm() {
        return `
            <div class="material-form-container relative p-3 border border-gray-200 rounded-md bg-gray-50">
                <button type="button" class="remove-button absolute top-1 right-1 text-red-500 hover:text-red-700 text-sm" onclick="this.closest('.material-form-container').remove();">
                    <i class="fas fa-times-circle"></i>
                </button>
                <h6 class="text-sm font-medium text-gray-800 mb-2">Material</h6>
                <label class="block text-xs font-medium text-gray-700">Material Name</label>
                <input type="text" class="material-name mt-1 block w-full px-3 py-1 text-xs border border-gray-300 rounded-md" required>
                <label class="block text-xs font-medium text-gray-700 mt-2">Material Type</label>
                <select class="material-type mt-1 block w-full px-3 py-1 text-xs border border-gray-300 rounded-md" required>
                    <option value="text">Text</option>
                    <option value="video">Video</option>
                </select>
                <label class="block text-xs font-medium text-gray-700 mt-2">Material Content</label>
                <textarea class="material-content mt-1 block w-full px-3 py-1 text-xs border border-gray-300 rounded-md" rows="3" required></textarea>
            </div>
        `;
    }
};

export default CourseBuilder;
