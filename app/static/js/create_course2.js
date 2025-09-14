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

    let sessionCounter = 0; // Tracks unique IDs for sessions
    let quizCounter = 0; // Tracks unique IDs for quizzes within sessions

    // Helper function to create a new session card HTML element
    const createSessionCard = (sessionType) => {
        sessionCounter++;
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-card bg-white rounded-lg shadow-md mb-6';
        sessionDiv.setAttribute('data-session-id', sessionCounter);
        sessionDiv.setAttribute('data-session-type', sessionType);

        let itemButtonsHTML = '';
        if (sessionType === 'learning') {
            itemButtonsHTML = `
                <button type="button" class="add-item-button add-material-btn text-sm font-medium text-blue-600 hover:text-blue-800 transition duration-300" data-session-id="${sessionCounter}">
                    <i class="fas fa-plus-circle mr-2"></i> Add Material
                </button>
            `;
        } else if (sessionType === 'quiz') {
            itemButtonsHTML = `
                <button type="button" class="add-item-button add-quiz-generator-btn text-sm font-medium text-purple-600 hover:text-purple-800 transition duration-300" data-session-id="${sessionCounter}">
                    <i class="fas fa-question-circle mr-2"></i> Add Question Generator
                </button>
            `;
        }

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
                <!-- Materials/Quiz Generators will be added here -->
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200 text-center">
                ${itemButtonsHTML}
            </div>
        `;
        return sessionDiv;
    };

    // Helper function to create a new material form HTML element
    const createMaterialForm = (materialId) => {
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
                <label class="block text-xs font-medium text-gray-500">Material Type</label>
                <select class="material-type-select mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm" required>
                    <option value="text">Text</option>
                    <option value="image">Image URL</option>
                    <option value="video">Video URL</option>
                </select>
            </div>
            <div class="mb-3 material-content-field" data-type="text">
                <label class="block text-xs font-medium text-gray-500">Content</label>
                <textarea class="material-content-input mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm" rows="3" required></textarea>
            </div>
            <div class="mb-3 material-content-field hidden" data-type="image">
                <label class="block text-xs font-medium text-gray-500">Image URL</label>
                <input type="url" class="material-url-input mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm" placeholder="e.g., https://example.com/image.jpg">
            </div>
            <div class="mb-3 material-content-field hidden" data-type="video">
                <label class="block text-xs font-medium text-gray-500">Video URL</label>
                <input type="url" class="material-url-input mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm" placeholder="e.g., https://youtube.com/watch?v=...">
            </div>
        `;

        // Add event listener to toggle content fields based on material type selection
        const typeSelect = materialDiv.querySelector('.material-type-select');
        typeSelect.addEventListener('change', () => {
            materialDiv.querySelectorAll('.material-content-field').forEach(field => {
                field.classList.add('hidden');
                // Also clear content and remove required attribute when hidden
                const input = field.querySelector('textarea, input[type="url"]');
                if (input) {
                    input.removeAttribute('required');
                    input.value = ''; // Clear value
                }
            });
            const selectedType = typeSelect.value;
            const activeField = materialDiv.querySelector(`.material-content-field[data-type="${selectedType}"]`);
            if (activeField) {
                activeField.classList.remove('hidden');
                // Set required attribute for the active field
                const input = activeField.querySelector('textarea, input[type="url"]');
                if (input) {
                    input.setAttribute('required', 'true');
                }
            }
        });

        // Initialize the correct field as required for the default (text)
        materialDiv.querySelector('.material-content-field[data-type="text"] .material-content-input').setAttribute('required', 'true');


        return materialDiv;
    };

    // Helper function to create the AI Question Generator form HTML element
    const createQuizGeneratorForm = (quizId) => {
        quizCounter++;
        const quizDiv = document.createElement('div');
        quizDiv.className = 'question-generator-container bg-gray-50 rounded-lg p-4 relative';
        quizDiv.setAttribute('data-quiz-id', quizId);
        quizDiv.innerHTML = `
            <button type="button" class="remove-button remove-quiz-generator-btn" title="Remove Quiz Generator"><i class="fas fa-times-circle"></i></button>
            <h5 class="text-md font-semibold text-gray-700 mb-2">AI Quiz Generator</h5>
            <div class="mb-3">
                <label class="block text-xs font-medium text-gray-500">Quiz Name</label>
                <input type="text" class="quiz-name-input mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm" required>
            </div>
            <div class="mb-3">
                <label class="block text-xs font-medium text-gray-500">Content for AI (Provide text for question generation)</label>
                <textarea class="ai-content-input mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm" rows="5" required></textarea>
            </div>
            <div class="mb-3 flex space-x-4">
                <div class="flex-1">
                    <label class="block text-xs font-medium text-gray-500">Question Type</label>
                    <select class="question-type-select mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm">
                        <option value="mcq">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="fill_blank">Fill-in-the-Blank</option>
                    </select>
                </div>
                <div class="flex-1">
                    <label class="block text-xs font-medium text-gray-500">Bloom's Taxonomy Level</label>
                    <select class="bloom-level-select mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm">
                        <option value="remember">Remember</option>
                        <option value="understand">Understand</option>
                    </select>
                </div>
            </div>
            <button type="button" class="generate-questions-btn w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300">
                <i class="fas fa-robot mr-2"></i> Generate Questions
            </button>
            <div class="generated-questions-container mt-6 pt-4 border-t border-gray-200 space-y-3">
                <h6 class="text-md font-semibold text-gray-700">Generated Questions:</h6>
                <!-- AI-generated questions will be displayed here -->
                <div class="loading-indicator hidden text-center text-gray-500">
                    <i class="fas fa-spinner fa-spin mr-2"></i> Generating questions...
                </div>
            </div>
        `;
        return quizDiv;
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
        // Add Material (only for learning sessions)
        if (e.target.closest('.add-material-btn')) {
            const sessionCard = e.target.closest('.session-card');
            if (sessionCard && sessionCard.dataset.sessionType === 'learning') {
                const sessionItemsContainer = sessionCard.querySelector('.session-items-container');
                const materialDiv = createMaterialForm(Date.now());
                sessionItemsContainer.appendChild(materialDiv);
            }
        }
        // Add Quiz Generator (only for quiz sessions)
        if (e.target.closest('.add-quiz-generator-btn')) {
            const sessionCard = e.target.closest('.session-card');
            if (sessionCard && sessionCard.dataset.sessionType === 'quiz') {
                const sessionItemsContainer = sessionCard.querySelector('.session-items-container');
                const quizGeneratorDiv = createQuizGeneratorForm(Date.now());
                sessionItemsContainer.appendChild(quizGeneratorDiv);
            }
        }
        // Remove Material
        if (e.target.closest('.remove-material-btn')) {
            const materialCard = e.target.closest('.material-form-container');
            if (materialCard) {
                materialCard.remove();
            }
        }
        // Remove Quiz Generator
        if (e.target.closest('.remove-quiz-generator-btn')) {
            const quizGeneratorCard = e.target.closest('.question-generator-container');
            if (quizGeneratorCard) {
                quizGeneratorCard.remove();
            }
        }

        // Handle Generate Questions button click (API call will go here)
        if (e.target.closest('.generate-questions-btn')) {
            const generateButton = e.target.closest('.generate-questions-btn');
            const quizGeneratorCard = generateButton.closest('.question-generator-container');
            const aiContent = quizGeneratorCard.querySelector('.ai-content-input').value;
            const questionType = quizGeneratorCard.querySelector('.question-type-select').value;
            const bloomLevel = quizGeneratorCard.querySelector('.bloom-level-select').value;
            const generatedQuestionsContainer = quizGeneratorCard.querySelector('.generated-questions-container');
            const loadingIndicator = quizGeneratorCard.querySelector('.loading-indicator');

            if (!aiContent.trim()) {
                // Using a more user-friendly message box instead of alert()
                const errorMessage = document.createElement('div');
                errorMessage.className = 'fixed inset-0 bg-red-100 bg-opacity-75 flex items-center justify-center z-50';
                errorMessage.innerHTML = `
                    <div class="bg-white p-6 rounded-lg shadow-xl text-center">
                        <p class="text-lg font-semibold text-red-700 mb-4">Error!</p>
                        <p class="mb-4">Please provide content for AI to generate questions.</p>
                        <button type="button" class="close-error-btn px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition">Close</button>
                    </div>
                `;
                document.body.appendChild(errorMessage);
                errorMessage.querySelector('.close-error-btn').addEventListener('click', () => {
                    errorMessage.remove();
                });
                return;
            }

            // Show loading indicator
            loadingIndicator.classList.remove('hidden');
            // Clear previous questions, but keep the "Generated Questions:" title
            const questionsDisplayArea = generatedQuestionsContainer.querySelector('.generated-questions-container > div:last-child');
            if (questionsDisplayArea) {
                 questionsDisplayArea.innerHTML = ''; // Clear only the dynamically added questions
            } else {
                generatedQuestionsContainer.innerHTML = `<h6 class="text-md font-semibold text-gray-700">Generated Questions:</h6>`;
            }


            // --- Placeholder for AI API Call ---
            // In a real application, you'd make an AJAX call to your Flask backend here,
            // which would then interact with the Gemini API.
            // For now, we'll simulate a response.

            console.log("Generating questions with:", { aiContent, questionType, bloomLevel });

            // Simulate API call delay
            setTimeout(() => {
                loadingIndicator.classList.add('hidden');

                const sampleQuestions = [];

                if (questionType === 'mcq') {
                    sampleQuestions.push(
                        { text: `What is the capital of France based on your content? (${bloomLevel})`, type: 'mcq', choices: [{ text: 'Berlin', is_correct: false }, { text: 'Paris', is_correct: true }, { text: 'Rome', is_correct: false }], correct_answer: 'Paris' },
                        { text: `Which famous landmark is in Paris? (${bloomLevel})`, type: 'mcq', choices: [{ text: 'Colosseum', is_correct: false }, { text: 'Eiffel Tower', is_correct: true }, { text: 'Great Wall', is_correct: false }], correct_answer: 'Eiffel Tower' }
                    );
                } else if (questionType === 'true_false') {
                    sampleQuestions.push(
                        { text: `The capital of France is Paris. (${bloomLevel})`, type: 'true_false', correct_answer: true },
                        { text: `The Eiffel Tower is in London. (${bloomLevel})`, type: 'true_false', correct_answer: false }
                    );
                } else if (questionType === 'fill_blank') {
                    sampleQuestions.push(
                        { text: `The city of ________ is known for its romantic atmosphere. (${bloomLevel})`, type: 'fill_blank', correct_answer: 'Paris' },
                        { text: `The famous Mona Lisa painting is housed in the ________ Museum. (${bloomLevel})`, type: 'fill_blank', correct_answer: 'Louvre' }
                    );
                }

                // Append the generated questions to the container
                sampleQuestions.forEach((q, qIndex) => {
                    const questionItemDiv = document.createElement('div');
                    questionItemDiv.className = 'generated-question-item p-3 border border-gray-200 rounded-md bg-white';
                    let choicesHtml = '';
                    if (q.choices) {
                        choicesHtml = `<ul class="list-disc pl-5 mt-1">
                            ${q.choices.map(choice => `<li>${choice.text} ${choice.is_correct ? '<i class="fas fa-check-circle text-green-500"></i>' : ''}</li>`).join('')}
                        </ul>`;
                    }
                    questionItemDiv.innerHTML = `
                        <p class="font-medium">Q${qIndex + 1}: ${q.text}</p>
                        ${choicesHtml}
                        <p class="text-sm text-green-700 mt-1"><strong>Correct Answer:</strong> ${q.correct_answer}</p>
                    `;
                    generatedQuestionsContainer.appendChild(questionItemDiv);
                });

                // Store generated questions in a data attribute for later serialization
                quizGeneratorCard.dataset.generatedQuestions = JSON.stringify(sampleQuestions);

            }, 2000); // Simulate 2-second API call
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
            const sessionType = sessionCard.dataset.sessionType; // Get session type
            const sessionItems = [];

            // Handle Learning Session Materials
            if (sessionType === 'learning') {
                const materialCards = sessionCard.querySelectorAll('.material-form-container');
                materialCards.forEach(materialCard => {
                    const materialType = materialCard.querySelector('.material-type-select').value;
                    let materialContent = '';

                    // Get content based on selected type
                    if (materialType === 'text') {
                        materialContent = materialCard.querySelector('.material-content-input').value;
                    } else { // image or video
                        materialContent = materialCard.querySelector('.material-url-input').value;
                    }

                    sessionItems.push({
                        type: materialType, // 'text', 'image', or 'video'
                        name: materialCard.querySelector('.material-name-input').value,
                        content: materialContent, // This will be content for text, or URL for image/video
                    });
                });
            }
            // Handle Quiz Session Generators
            else if (sessionType === 'quiz') {
                const quizGeneratorCards = sessionCard.querySelectorAll('.question-generator-container');
                quizGeneratorCards.forEach(quizGeneratorCard => {
                    const generatedQuestions = JSON.parse(quizGeneratorCard.dataset.generatedQuestions || '[]');
                    sessionItems.push({
                        type: 'quiz_generator', // Distinguish from manual quiz, if any
                        quiz_name: quizGeneratorCard.querySelector('.quiz-name-input').value,
                        ai_content: quizGeneratorCard.querySelector('.ai-content-input').value,
                        question_type: quizGeneratorCard.querySelector('.question-type-select').value,
                        bloom_level: quizGeneratorCard.querySelector('.bloom-level-select').value,
                        generated_questions: generatedQuestions // Store the array of generated questions
                    });
                });
            }

            allSessions.push({
                type: sessionType,
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
