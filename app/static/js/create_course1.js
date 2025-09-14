// tumedx_platform/app/static/js/create_course.js

document.addEventListener('DOMContentLoaded', () => {
    // Select the main form and containers
    const form = document.getElementById('create-course-form');
    const sessionsContainer = document.getElementById('sessions-container');
    const addSessionButton = document.getElementById('add-session-button');
    const sessionsJsonInput = document.getElementById('sessions-json');
    const sessionModal = document.getElementById('session-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addLearningSessionBtn = document.getElementById('add-learning-session-btn');
    const addQuizSessionBtn = document.getElementById('add-quiz-session-btn');

    let sessionCounter = 0;

    // Helper function to create a new session card HTML element
    const createSessionCard = (sessionType) => {
        sessionCounter++;
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-card bg-white rounded-lg shadow-md mb-6';
        sessionDiv.setAttribute('data-session-id', sessionCounter);
        sessionDiv.setAttribute('data-session-type', sessionType);

        sessionDiv.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h4 class="text-xl font-bold text-gray-700">New ${sessionType === 'learning' ? 'Learning' : 'Quiz'} Session</h4>
                <button type="button" class="remove-button remove-session-btn" title="Remove Session">
                    <i class="fas fa-times-circle"></i>
                </button>
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Session Title</label>
                <input type="text" class="session-title-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required>
            </div>
            <div class="session-items-container space-y-4">
                <!-- Materials/Questions will be added here -->
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200 text-center">
                <button type="button" class="add-item-button add-material-btn text-sm font-medium text-blue-600 hover:text-blue-800 transition duration-300" data-session-id="${sessionCounter}">
                    <i class="fas fa-plus-circle mr-2"></i> Add Material
                </button>
                <button type="button" class="add-item-button add-quiz-btn text-sm font-medium text-purple-600 hover:text-purple-800 transition duration-300" data-session-id="${sessionCounter}">
                    <i class="fas fa-question-circle mr-2"></i> Add Quiz
                </button>
            </div>
        `;
        return sessionDiv;
    };

    // Helper function to create a new material form HTML element
    const createMaterialForm = (sessionId, materialId) => {
        const materialDiv = document.createElement('div');
        materialDiv.className = 'material-form-container bg-gray-50 rounded-lg p-4 relative';
        materialDiv.setAttribute('data-material-id', materialId);
        materialDiv.innerHTML = `
            <button type="button" class="remove-button remove-material-btn" title="Remove Material"><i class="fas fa-times-circle"></i></button>
            <h5 class="text-md font-semibold text-gray-700 mb-2">New Material</h5>
            <div class="mb-3">
                <label class="block text-xs font-medium text-gray-500">Material Name</label>
                <input type="text" class="material-name-input mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm" required>
            </div>
            <div class="mb-3">
                <label class="block text-xs font-medium text-gray-500">Content</label>
                <textarea class="material-content-input mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm" rows="3" required></textarea>
            </div>
        `;
        return materialDiv;
    };
    
    // Helper function to create a new quiz form HTML element
    const createQuizForm = (sessionId, quizId) => {
        const quizDiv = document.createElement('div');
        quizDiv.className = 'quiz-form-container bg-gray-50 rounded-lg p-4 relative';
        quizDiv.setAttribute('data-quiz-id', quizId);
        quizDiv.innerHTML = `
            <button type="button" class="remove-button remove-quiz-btn" title="Remove Quiz"><i class="fas fa-times-circle"></i></button>
            <h5 class="text-md font-semibold text-gray-700 mb-2">New Quiz</h5>
            <div class="mb-3">
                <label class="block text-xs font-medium text-gray-500">Quiz Name</label>
                <input type="text" class="quiz-name-input mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm" required>
            </div>
            <div class="quiz-questions-container space-y-3 mt-4">
                <!-- Questions will be added here -->
            </div>
            <button type="button" class="add-question-button mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition duration-300">
                <i class="fas fa-plus-circle mr-2"></i> Add Question
            </button>
        `;
        return quizDiv;
    };
    
    // Helper function to create a new question form HTML element
    const createQuestionForm = (questionId) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-form-container bg-white rounded-lg p-3 relative';
        questionDiv.setAttribute('data-question-id', questionId);
        questionDiv.innerHTML = `
            <button type="button" class="remove-button remove-question-btn" title="Remove Question"><i class="fas fa-times-circle"></i></button>
            <h6 class="text-sm font-semibold text-gray-600 mb-2">Question Text</h6>
            <input type="text" class="question-text-input mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm" required>
            <div class="question-choices-container space-y-2 mt-3">
                <h6 class="text-sm font-medium text-gray-600 mb-1">Choices</h6>
                <!-- Choices will be added here -->
            </div>
            <button type="button" class="add-choice-button mt-2 text-xs font-medium text-green-600 hover:text-green-800 transition duration-300">
                <i class="fas fa-plus-circle mr-1"></i> Add Choice
            </button>
        `;
        return questionDiv;
    };

    // Helper function to create a new choice form HTML element
    const createChoiceForm = (choiceId) => {
        const choiceDiv = document.createElement('div');
        choiceDiv.className = 'flex items-center space-x-2';
        choiceDiv.innerHTML = `
            <input type="checkbox" class="choice-is-correct-input form-checkbox h-4 w-4 text-blue-600 rounded">
            <input type="text" class="choice-text-input mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm" placeholder="Choice Text" required>
            <button type="button" class="remove-choice-btn text-red-500 hover:text-red-700" title="Remove Choice">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        return choiceDiv;
    };

    // Event listener for opening the session type modal
    addSessionButton.addEventListener('click', () => {
        sessionModal.classList.remove('hidden');
    });

    // Event listener for closing the modal
    closeModalBtn.addEventListener('click', () => {
        sessionModal.classList.add('hidden');
    });

    // Event listener for adding a learning session
    addLearningSessionBtn.addEventListener('click', () => {
        const sessionCard = createSessionCard('learning');
        sessionsContainer.appendChild(sessionCard);
        sessionModal.classList.add('hidden');
    });
    
    // Event listener for adding a quiz session
    addQuizSessionBtn.addEventListener('click', () => {
        const sessionCard = createSessionCard('quiz');
        sessionsContainer.appendChild(sessionCard);
        sessionModal.classList.add('hidden');
    });

    // Event delegation for dynamically added elements
    sessionsContainer.addEventListener('click', (e) => {
        // Remove Session
        if (e.target.closest('.remove-session-btn')) {
            const sessionCard = e.target.closest('.session-card');
            if (sessionCard) {
                sessionCard.remove();
            }
        }
        // Add Material
        if (e.target.closest('.add-material-btn')) {
            const sessionCard = e.target.closest('.session-card');
            if (sessionCard) {
                const sessionItemsContainer = sessionCard.querySelector('.session-items-container');
                const materialDiv = createMaterialForm(sessionCard.dataset.sessionId, Date.now());
                sessionItemsContainer.appendChild(materialDiv);
            }
        }
        // Add Quiz
        if (e.target.closest('.add-quiz-btn')) {
            const sessionCard = e.target.closest('.session-card');
            if (sessionCard) {
                const sessionItemsContainer = sessionCard.querySelector('.session-items-container');
                const quizDiv = createQuizForm(sessionCard.dataset.sessionId, Date.now());
                sessionItemsContainer.appendChild(quizDiv);
            }
        }
        // Remove Material
        if (e.target.closest('.remove-material-btn')) {
            const materialCard = e.target.closest('.material-form-container');
            if (materialCard) {
                materialCard.remove();
            }
        }
        // Remove Quiz
        if (e.target.closest('.remove-quiz-btn')) {
            const quizCard = e.target.closest('.quiz-form-container');
            if (quizCard) {
                quizCard.remove();
            }
        }
        // Add Question
        if (e.target.closest('.add-question-button')) {
            const quizCard = e.target.closest('.quiz-form-container');
            if (quizCard) {
                const questionsContainer = quizCard.querySelector('.quiz-questions-container');
                const questionDiv = createQuestionForm(Date.now());
                questionsContainer.appendChild(questionDiv);
            }
        }
        // Remove Question
        if (e.target.closest('.remove-question-btn')) {
            const questionCard = e.target.closest('.question-form-container');
            if (questionCard) {
                questionCard.remove();
            }
        }
        // Add Choice
        if (e.target.closest('.add-choice-button')) {
            const questionCard = e.target.closest('.question-form-container');
            if (questionCard) {
                const choicesContainer = questionCard.querySelector('.question-choices-container');
                const choiceDiv = createChoiceForm(Date.now());
                choicesContainer.appendChild(choiceDiv);
            }
        }
        // Remove Choice
        if (e.target.closest('.remove-choice-btn')) {
            const choiceDiv = e.target.closest('.flex');
            if (choiceDiv) {
                choiceDiv.remove();
            }
        }
    });

    // Form submission listener to serialize the data
    form.addEventListener('submit', (e) => {
        // Prevent default submission to first serialize the data
        e.preventDefault();

        const allSessions = [];
        const sessionCards = sessionsContainer.querySelectorAll('.session-card');

        sessionCards.forEach(sessionCard => {
            const sessionTitle = sessionCard.querySelector('.session-title-input').value;
            const sessionItems = [];

            const materialCards = sessionCard.querySelectorAll('.material-form-container');
            materialCards.forEach(materialCard => {
                sessionItems.push({
                    type: 'material',
                    name: materialCard.querySelector('.material-name-input').value,
                    content: materialCard.querySelector('.material-content-input').value,
                });
            });
            
            const quizCards = sessionCard.querySelectorAll('.quiz-form-container');
            quizCards.forEach(quizCard => {
                const questions = [];
                const questionCards = quizCard.querySelectorAll('.question-form-container');
                questionCards.forEach(questionCard => {
                    const choices = [];
                    const choiceInputs = questionCard.querySelectorAll('.flex');
                    choiceInputs.forEach(choiceInput => {
                        choices.push({
                            text: choiceInput.querySelector('.choice-text-input').value,
                            is_correct: choiceInput.querySelector('.choice-is-correct-input').checked,
                        });
                    });
                    questions.push({
                        text: questionCard.querySelector('.question-text-input').value,
                        choices: choices
                    });
                });
                sessionItems.push({
                    type: 'quiz',
                    quiz_name: quizCard.querySelector('.quiz-name-input').value,
                    questions: questions
                });
            });

            allSessions.push({
                title: sessionTitle,
                items: sessionItems
            });
        });

        // Set the value of the hidden input field to the JSON string
        sessionsJsonInput.value = JSON.stringify(allSessions);

        // Now submit the form
        form.submit();
    });
});

