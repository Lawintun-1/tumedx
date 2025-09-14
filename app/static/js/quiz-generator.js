/**
 * @fileoverview Module for handling all AI quiz question generation logic and UI.
 * This module is responsible for creating the generator form, calling the backend API,
 * and displaying the generated questions to the user.
 */

import DomUtils from './dom-utils.js';

const QuizGenerator = {
    /**
     * Creates and adds the AI quiz generator form to a quiz session's container.
     * @param {HTMLElement} sessionCard The session card to add the form to.
     */
    createGeneratorForm(sessionCard) {
        const questionsContainer = sessionCard.querySelector('.quiz-questions-container');
        questionsContainer.innerHTML = this.getGeneratorFormHtml();
        const generateBtn = questionsContainer.querySelector('.generate-questions-btn');
        generateBtn.addEventListener('click', () => this.generateQuestions(questionsContainer));
    },

    /**
     * Returns the HTML string for the AI quiz generator form.
     * @returns {string} The HTML string.
     */
    getGeneratorFormHtml() {
        return `
            <div class="question-generator-container relative p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h6 class="text-md font-medium text-gray-800">Generate Questions with AI</h6>
                <div class="mt-4 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Content Source</label>
                        <textarea id="ai-content-textarea" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" rows="5" placeholder="Paste your text content here..."></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Question Type</label>
                        <select id="question-type-select" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                            <option value="mcq">Multiple Choice</option>
                            <option value="true_false">True/False</option>
                            <option value="fill_blank">Fill in the Blank</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Bloom's Level</label>
                        <select id="bloom-level-select" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                            <option value="remember">Remember</option>
                            <option value="understand">Understand</option>
                            <option value="apply">Apply</option>
                            <option value="analyze">Analyze</option>
                            <option value="evaluate">Evaluate</option>
                            <option value="create">Create</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Difficulty</label>
                        <select id="question-difficulty-select" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Number of Questions</label>
                        <input type="number" id="num-questions-input" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" value="5" min="1" max="20" required>
                    </div>
                </div>
                <button type="button" class="generate-questions-btn mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 w-full">
                    Generate Questions
                </button>
                <div class="questions-output mt-4 space-y-4">
                    <!-- Generated questions will be displayed here -->
                </div>
            </div>
        `;
    },

    /**
     * Calls the backend to generate questions based on user input.
     * @param {HTMLElement} container The generator form container.
     */
    async generateQuestions(container) {
        const content = container.querySelector('#ai-content-textarea').value;
        const questionType = container.querySelector('#question-type-select').value;
        const bloomLevel = container.querySelector('#bloom-level-select').value;
        const difficulty = container.querySelector('#question-difficulty-select').value;
        const numQuestions = container.querySelector('#num-questions-input').value;
        const questionsOutput = container.querySelector('.questions-output');
        const csrfToken = DomUtils.getCsrfToken();

        if (!content) {
            DomUtils.showCustomModal('Please provide some content to generate questions from.', 'error');
            return;
        }

        const generateBtn = container.querySelector('.generate-questions-btn');
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Generating...';
        questionsOutput.innerHTML = ''; // Clear previous questions

        try {
            const response = await fetch('/teacher/generate-questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    content,
                    question_type: questionType,
                    bloom_level: bloomLevel,
                    difficulty,
                    num_questions: numQuestions
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                this.displayQuestions(questionsOutput, result);
                container.dataset.generatedQuestions = JSON.stringify(result);
            } else {
                DomUtils.showCustomModal('Failed to generate questions: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error generating questions:', error);
            DomUtils.showCustomModal('An unexpected error occurred during question generation.', 'error');
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = 'Generate Questions';
        }
    },

    /**
     * Displays the generated questions in the UI.
     * @param {HTMLElement} container The container to display questions in.
     * @param {array} questions The array of question objects.
     */
    displayQuestions(container, questions) {
        if (!questions || questions.length === 0) {
            container.innerHTML = '<p class="text-gray-500">No questions were generated. Please try again with different content or settings.</p>';
            return;
        }

        questions.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'generated-question-item p-3 border border-gray-300 rounded-md bg-white shadow-sm';
            let optionsHtml = '';
            if (q.options) {
                optionsHtml = `<ul class="list-disc pl-5 mt-1 text-sm text-gray-600">
                    ${q.options.map(opt => `<li>${opt} ${opt === q.correctAnswer ? '<i class="fas fa-check-circle text-green-500 ml-1"></i>' : ''}</li>`).join('')}
                </ul>`;
            }
            const blanksHtml = q.blanks ? `<p class="mt-1 text-sm text-gray-600"><strong>Blanks:</strong> ${q.blanks.join(', ')}</p>` : '';

            questionDiv.innerHTML = `
                <p class="font-semibold text-gray-800">Q${index + 1}: ${q.question}</p>
                ${optionsHtml}
                ${blanksHtml}
                <p class="mt-2 text-sm text-green-700"><strong>Correct Answer:</strong> ${q.correctAnswer}</p>
            `;
            container.appendChild(questionDiv);
        });
    }
};

export default QuizGenerator;
