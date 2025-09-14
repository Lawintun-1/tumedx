// tumedx_platform/app/static/js/create_course.js

document.addEventListener('DOMContentLoaded', () => {
    // Select the main form and containers
    const form = document.getElementById('create-course-form');
    const chaptersContainer = document.getElementById('chapters-container');
    const addChapterButton = document.getElementById('add-chapter-button');
    const courseContentJsonInput = document.getElementById('course-content-json');

    let chapterCounter = 0; // Tracks unique IDs for chapters
    let sessionCounter = 0; // Tracks unique IDs for all sessions (learning or quiz)

    // --- Helper functions for creating HTML elements ---

    // Creates a new chapter card HTML element
    const createChapterCard = () => {
        chapterCounter++;
        const chapterDiv = document.createElement('div');
        chapterDiv.className = 'chapter-card bg-white rounded-xl shadow-md p-6 mb-8';
        chapterDiv.setAttribute('data-chapter-id', chapterCounter);

        chapterDiv.innerHTML = `
            <div class="flex justify-between items-center mb-4 border-b pb-4 border-gray-200">
                <h3 class="text-xl font-bold text-indigo-700">Chapter ${chapterCounter}</h3>
                <button type="button" class="remove-button remove-chapter-btn" title="Remove Chapter">
                    <i class="fas fa-times-circle"></i>
                </button>
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Chapter Title</label>
                <input type="text" class="chapter-title-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-200">
                <div class="flex justify-between items-center mb-4">
                    <h4 class="text-lg font-semibold text-gray-800">Chapter Sessions</h4>
                    <button type="button" class="toggle-add-session-options-btn flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 transition duration-300">
                        <i class="fas fa-plus"></i>
                        <span>Add Session</span>
                    </button>
                </div>
                <div class="session-type-selector hidden mb-4 bg-gray-100 p-4 rounded-md shadow-inner">
                    <button type="button" class="add-learning-session-btn bg-green-500 text-white hover:bg-green-600 mb-2">
                        <i class="fas fa-book-reader mr-3"></i> Add Learning Session
                    </button>
                    <button type="button" class="add-quiz-session-btn bg-purple-500 text-white hover:bg-purple-600">
                        <i class="fas fa-question-circle mr-3"></i> Add Quiz Session
                    </button>
                </div>
                <div class="chapter-sessions-container space-y-4">
                    <!-- Dynamic session forms (learning or quiz) will be added here -->
                </div>
            </div>
        `;
        return chapterDiv;
    };

    // Creates a new individual session card (can be learning or quiz)
    const createSessionCard = (sessionType) => {
        sessionCounter++;
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-card bg-white rounded-lg shadow-md p-6 relative';
        sessionDiv.setAttribute('data-session-id', sessionCounter);
        sessionDiv.setAttribute('data-session-type', sessionType);

        let sessionContentHTML = '';
        if (sessionType === 'learning') {
            sessionContentHTML = `
                <h5 class="text-md font-bold text-blue-700 mb-4">Learning Session</h5>
                <div class="mb-3">
                    <label class="block text-sm font-medium text-gray-700">Learning Session Title</label>
                    <input type="text" class="learning-session-title-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required>
                </div>
                <div class="learning-materials-container space-y-4">
                    <!-- Materials will be added here -->
                </div>
                <button type="button" class="add-material-btn mt-4 flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 text-sm">
                    <i class="fas fa-plus-circle"></i> Add Material
                </button>
            `;
        } else if (sessionType === 'quiz') {
            sessionContentHTML = `
                <h5 class="text-md font-bold text-purple-700 mb-4">Quiz Session</h5>
                ${createQuizGeneratorFormContent(sessionCounter)}
            `;
        }

        sessionDiv.innerHTML = `
            <button type="button" class="remove-button remove-session-btn" title="Remove Session">
                <i class="fas fa-times-circle"></i>
            </button>
            ${sessionContentHTML}
        `;
        return sessionDiv;
    };

    // Creates a new material form HTML element
    const createMaterialForm = () => {
        const materialDiv = document.createElement('div');
        materialDiv.className = 'material-form-container bg-gray-50 rounded-lg p-4 relative';
        materialDiv.setAttribute('data-material-id', Date.now()); // Unique ID for material
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
                <textarea class="material-content-input mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm" rows="3"></textarea>
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

        // Initialize content field requirements and event listener for type change
        const typeSelect = materialDiv.querySelector('.material-type-select');
        typeSelect.addEventListener('change', () => {
            materialDiv.querySelectorAll('.material-content-field').forEach(field => {
                field.classList.add('hidden');
                const input = field.querySelector('textarea, input[type="url"]');
                if (input) {
                    input.removeAttribute('required');
                    input.value = ''; // Clear value when field is hidden
                }
            });
            const selectedType = typeSelect.value;
            const activeField = materialDiv.querySelector(`.material-content-field[data-type="${selectedType}"]`);
            if (activeField) {
                activeField.classList.remove('hidden');
                const input = activeField.querySelector('textarea, input[type="url"]');
                if (input) {
                    input.setAttribute('required', 'true');
                }
            }
        });
        // Set required for default 'text' field on initial creation
        materialDiv.querySelector('.material-content-field[data-type="text"] textarea').setAttribute('required', 'true');

        return materialDiv;
    };

    // Creates the content for the AI Question Generator form (reused within session card)
    const createQuizGeneratorFormContent = (sessionId) => {
        return `
            <div class="question-generator-container" data-quiz-id="${sessionId}">
                <div class="mb-3">
                    <label class="block text-xs font-medium text-gray-500">Quiz Name</label>
                    <input type="text" class="quiz-name-input mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm" required>
                </div>

                <div class="mb-3">
                    <label class="block text-xs font-medium text-gray-500">Content Source</label>
                    <select class="content-source-select mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm">
                        <option value="text_input">Text Input</option>
                        <option value="file_upload">File Upload</option>
                    </select>
                </div>
                <div class="mb-3 ai-content-input-container" data-source-type="text_input">
                    <label class="block text-xs font-medium text-gray-500">Content for AI (Provide text for question generation)</label>
                    <textarea class="ai-content-input mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm" rows="5" required></textarea>
                </div>
                <div class="mb-3 ai-content-input-container hidden" data-source-type="file_upload">
                    <label class="block text-xs font-medium text-gray-500">Upload Content File (PDF, DOCX, TXT)</label>
                    <input type="file" class="ai-content-file-input mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm">
                    <p class="text-xs text-gray-500 mt-1">Accepted formats: .txt, .pdf, .docx (max 5MB)</p>
                </div>

                <div class="mb-3 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
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

                <div class="mb-3 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <div class="flex-1">
                        <label class="block text-xs font-medium text-gray-500">Question Difficulty Level</label>
                        <select class="question-difficulty-select mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm">
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <div class="flex-1">
                        <label class="block text-xs font-medium text-gray-500">Number of Questions (1-5)</label>
                        <select class="num-questions-input mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm" required>
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3" selected>3</option> <!-- Default to 3 -->
    <option value="4">4</option>
    <option value="5">5</option>
    <option value="6">6</option>
    <option value="7">7</option>
    <option value="8">8</option>
    <option value="9">9</option>
    <option value="10">10</option>
</select>

                    </div>
                </div>

                <button type="button" class="generate-questions-btn w-full mt-4 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300">
                    <i class="fas fa-robot mr-2"></i> Generate Questions
                </button>
                <div class="generated-questions-container mt-6 pt-4 border-t border-gray-200 space-y-3">
                    <h6 class="text-md font-semibold text-gray-700">Generated Questions:</h6>
                    <div class="loading-indicator hidden text-center text-gray-500">
                        <i class="fas fa-spinner fa-spin mr-2"></i> Generating questions...
                    </div>
                    <div class="generated-questions-list space-y-3">
                        <!-- AI-generated questions will be displayed here -->
                    </div>
                </div>
            </div>
        `;
    };

    // --- Event Listeners ---

    // Event listener for adding a new chapter
    addChapterButton.addEventListener('click', () => {
        const chapterCard = createChapterCard();
        chaptersContainer.appendChild(chapterCard);
    });

    // Event delegation for dynamically added elements (chapters, sessions, materials, quiz generators)
    chaptersContainer.addEventListener('click', (e) => {
        // Remove Chapter
        if (e.target.closest('.remove-chapter-btn')) {
            e.target.closest('.chapter-card').remove();
        }

        // Toggle Add Session Options
        if (e.target.closest('.toggle-add-session-options-btn')) {
            const chapterCard = e.target.closest('.chapter-card');
            const sessionTypeSelector = chapterCard.querySelector('.session-type-selector');
            sessionTypeSelector.classList.toggle('hidden');
        }

        // Add Learning Session
        if (e.target.closest('.add-learning-session-btn')) {
            const chapterCard = e.target.closest('.chapter-card');
            const chapterSessionsContainer = chapterCard.querySelector('.chapter-sessions-container');
            const sessionCard = createSessionCard('learning');
            chapterSessionsContainer.appendChild(sessionCard);
            chapterCard.querySelector('.session-type-selector').classList.add('hidden'); // Hide options after selection
        }

        // Add Quiz Session
        if (e.target.closest('.add-quiz-session-btn')) {
            const chapterCard = e.target.closest('.chapter-card');
            const chapterSessionsContainer = chapterCard.querySelector('.chapter-sessions-container');
            const sessionCard = createSessionCard('quiz');
            chapterSessionsContainer.appendChild(sessionCard);
            chapterCard.querySelector('.session-type-selector').classList.add('hidden'); // Hide options after selection
            
            // Attach content source toggle listener for the newly added quiz session
            const contentSourceSelect = sessionCard.querySelector('.content-source-select');
            if (contentSourceSelect) {
                contentSourceSelect.addEventListener('change', (event) => {
                    const selectedSourceType = event.target.value;
                    const quizGeneratorContainer = event.target.closest('.question-generator-container');
                    quizGeneratorContainer.querySelectorAll('.ai-content-input-container').forEach(container => {
                        container.classList.add('hidden');
                        const inputField = container.querySelector('textarea, input[type="file"]');
                        if (inputField) {
                            inputField.removeAttribute('required');
                            inputField.value = ''; // Clear value
                        }
                    });
                    const activeContainer = quizGeneratorContainer.querySelector(`.ai-content-input-container[data-source-type="${selectedSourceType}"]`);
                    if (activeContainer) {
                        activeContainer.classList.remove('hidden');
                        const inputField = activeContainer.querySelector('textarea, input[type="file"]');
                        if (inputField) {
                            inputField.setAttribute('required', 'true');
                        }
                    }
                });
                // Initialize required state for default text input
                sessionCard.querySelector('.ai-content-input-container[data-source-type="text_input"] .ai-content-input').setAttribute('required', 'true');
            }
        }

        // Remove Session
        if (e.target.closest('.remove-session-btn')) {
            e.target.closest('.session-card').remove();
        }

        // Add Material (only within a learning session)
        if (e.target.closest('.add-material-btn')) {
            const learningSessionContainer = e.target.closest('.session-card[data-session-type="learning"]');
            const learningMaterialsContainer = learningSessionContainer.querySelector('.learning-materials-container');
            const materialDiv = createMaterialForm();
            learningMaterialsContainer.appendChild(materialDiv);
        }

        // Remove Material
        if (e.target.closest('.remove-material-btn')) {
            e.target.closest('.material-form-container').remove();
        }
        
        // Handle content source type change within quiz generator
     // Handle Generate Questions button click (UI-only simulation of API)
// Handle Generate Questions button click (OpenRouter integration)
// Handle Generate Questions button click (OpenRouter integration with strict JSON handling)
// Handle Generate Questions button click (OpenRouter integration + JSON extraction)
if (e.target.closest('.generate-questions-btn')) {
    const generateButton = e.target.closest('.generate-questions-btn');
    const quizGeneratorCard = generateButton.closest('.question-generator-container');
    
    const contentSourceSelect = quizGeneratorCard.querySelector('.content-source-select');
    const contentSourceType = contentSourceSelect.value;
    let aiContent = '';
    let aiFileName = '';

    if (contentSourceType === 'text_input') {
        aiContent = quizGeneratorCard.querySelector('.ai-content-input').value;
        if (!aiContent.trim()) {
            showErrorMessage('Please provide text content for AI to generate questions.');
            return;
        }
    } else {
        const fileInput = quizGeneratorCard.querySelector('.ai-content-file-input');
        if (fileInput.files.length > 0) {
            aiFileName = fileInput.files[0].name;
        } else {
            showErrorMessage('Please upload a file for AI to generate questions.');
            return;
        }
    }

    const questionType = quizGeneratorCard.querySelector('.question-type-select').value;
    const bloomLevel = quizGeneratorCard.querySelector('.bloom-level-select').value;
    const questionDifficulty = quizGeneratorCard.querySelector('.question-difficulty-select').value;
    const numQuestions = quizGeneratorCard.querySelector('.num-questions-input').value;

    const generatedQuestionsContainer = quizGeneratorCard.querySelector('.generated-questions-container');
    const loadingIndicator = generatedQuestionsContainer.querySelector('.loading-indicator');
    let questionsArea = generatedQuestionsContainer.querySelector('.generated-questions-list');
    if (!questionsArea) {
        questionsArea = document.createElement('div');
        questionsArea.className = 'generated-questions-list space-y-3';
        loadingIndicator.parentNode.insertBefore(questionsArea, loadingIndicator.nextSibling);
    }
    questionsArea.innerHTML = ''; 
    loadingIndicator.classList.remove('hidden');

    // --- OpenRouter API Call ---
    const API_URL = "https://openrouter.ai/api/v1/chat/completions";
    const MODEL = "tngtech/deepseek-r1t-chimera:free";
    const API_KEY = "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";

    const prompt = `
You are a quiz generator. Your ONLY task is to return valid JSON. 
Do NOT include explanations, commentary, or markdown. 
Generate ${numQuestions} ${questionType.toUpperCase()} questions 
at Bloom level: ${bloomLevel}, Difficulty: ${questionDifficulty}.
Source content: ${aiContent || aiFileName}.
Return an array of objects in this exact format:

[
  { "text": "Question text?", "type": "mcq", "choices": [ 
        { "text": "Option A", "is_correct": false },
        { "text": "Option B", "is_correct": true }
    ],
    "correct_answer": "Option B" 
  }
]
`;

    fetch(API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7
        })
    })
    .then(res => res.json())
    .then(data => {
        loadingIndicator.classList.add('hidden');
        
        const rawText = data?.choices?.[0]?.message?.content?.trim() || "";
        let sampleQuestions = null;

        // --- Combined approach: extract JSON from raw response ---
        let jsonMatch = rawText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (jsonMatch) {
            try {
                sampleQuestions = JSON.parse(jsonMatch[0]);
            } catch (err) {
                console.warn("Detected JSON but failed to parse:", err);
            }
        }

        // --- Fallback to raw display if JSON extraction fails ---
        if (!Array.isArray(sampleQuestions)) {
            showErrorMessage("AI response could not be parsed into JSON. Showing raw output.");
            questionsArea.innerHTML = `<pre class="p-2 bg-gray-100 rounded">${rawText}</pre>`;
            return;
        }

        // --- Render questions ---
        sampleQuestions.forEach((q, qIndex) => {
            const questionItemDiv = document.createElement('div');
            questionItemDiv.className = 'generated-question-item p-3 border border-gray-200 rounded-md bg-white';
            let choicesHtml = '';
            if (q.choices && q.choices.length > 0) {
                choicesHtml = `<ul class="list-disc pl-5 mt-1">
                    ${q.choices.map(choice => `<li>${choice.text} ${choice.is_correct ? '<i class="fas fa-check-circle text-green-500"></i>' : ''}</li>`).join('')}
                </ul>`;
            }
            questionItemDiv.innerHTML = `
                <p class="font-medium">Q${qIndex + 1} (${q.type.replace('_', ' ').toUpperCase()}): ${q.text}</p>
                ${choicesHtml}
                <p class="text-sm text-green-700 mt-1"><strong>Correct Answer:</strong> ${q.correct_answer}</p>
            `;
            questionsArea.appendChild(questionItemDiv);
        });

        // Save for later
        quizGeneratorCard.dataset.generatedQuestions = JSON.stringify(sampleQuestions);
    })
    .catch(err => {
        loadingIndicator.classList.add('hidden');
        showErrorMessage("Error generating questions. Check API key or network.");
        console.error(err);
    });
}


    });

    // --- Form Submission Logic ---
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default submission

        const allCourseContent = [];
        const chapterCards = chaptersContainer.querySelectorAll('.chapter-card');

        chapterCards.forEach(chapterCard => {
            const chapterTitle = chapterCard.querySelector('.chapter-title-input').value;
            const chapterSessions = [];

            chapterCard.querySelectorAll('.session-card').forEach(sessionCard => {
                const sessionType = sessionCard.dataset.sessionType;

                if (sessionType === 'learning') {
                    const learningSessionData = {
                        type: 'learning_session', // Distinguish type in JSON
                        title: sessionCard.querySelector('.learning-session-title-input').value,
                        materials: []
                    };

                    sessionCard.querySelectorAll('.material-form-container').forEach(materialCard => {
                        const materialType = materialCard.querySelector('.material-type-select').value;
                        let materialContent = '';

                        if (materialType === 'text') {
                            materialContent = materialCard.querySelector('.material-content-input').value;
                        } else { // image or video
                            materialContent = materialCard.querySelector('.material-url-input').value;
                        }

                        learningSessionData.materials.push({
                            type: materialType,
                            name: materialCard.querySelector('.material-name-input').value,
                            content: materialContent,
                        });
                    });
                    chapterSessions.push(learningSessionData);

                } else if (sessionType === 'quiz') {
                    const quizGeneratorCard = sessionCard.querySelector('.question-generator-container');
                    const generatedQuestions = JSON.parse(quizGeneratorCard.dataset.generatedQuestions || '[]');

                    const quizSessionData = {
                        type: 'quiz_session', // Distinguish type in JSON
                        quiz_name: quizGeneratorCard.querySelector('.quiz-name-input').value,
                        content_source_type: quizGeneratorCard.dataset.contentSourceType,
                        ai_content: quizGeneratorCard.dataset.aiContent || '', // Text content
                        ai_file_name: quizGeneratorCard.dataset.aiFileName || '', // File name if uploaded
                        question_type: quizGeneratorCard.querySelector('.question-type-select').value,
                        bloom_level: quizGeneratorCard.querySelector('.bloom-level-select').value,
                        question_difficulty: quizGeneratorCard.dataset.questionDifficulty, // New
                        num_questions: quizGeneratorCard.dataset.numQuestions, // New
                        generated_questions: generatedQuestions
                    };
                    chapterSessions.push(quizSessionData);
                }
            });

            allCourseContent.push({
                title: chapterTitle,
                sessions: chapterSessions
            });
        });

        // Set the value of the hidden input field to the JSON string
        courseContentJsonInput.value = JSON.stringify(allCourseContent);

        // Now submit the form
        form.submit();
    });

    // Helper function for displaying custom error messages
    function showErrorMessage(message) {
        const errorMessageDiv = document.createElement('div');
        errorMessageDiv.className = 'fixed inset-0 bg-red-100 bg-opacity-75 flex items-center justify-center z-50';
        errorMessageDiv.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-xl text-center">
                <p class="text-lg font-semibold text-red-700 mb-4">Error!</p>
                <p class="mb-4">${message}</p>
                <button type="button" class="close-error-btn px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition">Close</button>
            </div>
        `;
        document.body.appendChild(errorMessageDiv);
        errorMessageDiv.querySelector('.close-error-btn').addEventListener('click', () => {
            errorMessageDiv.remove();
        });
    }
});
