{% extends 'includes/base.html'%}
{% block content %}

    <div class="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Create New Course</h1>
        <form id="course-form" action="{{ url_for('teacher.create_course') }}" method="post">
            <div class="mb-4">
                <label for="course-title" class="block text-gray-700 font-semibold mb-2">Course Title</label>
                <input type="text" id="course-title" name="title" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Introduction to Python Programming" required>
            </div>
            <div class="mb-6">
                <label for="course-description" class="block text-gray-700 font-semibold mb-2">Course Description</label>
                <textarea id="course-description" name="description" class="w-full px-4 py-2 h-24 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="A brief description of the course content and goals." required></textarea>
            </div>

            <div id="chapters-container" class="space-y-6">
                <!-- Chapters will be added here dynamically -->
            </div>

            <button type="button" id="add-chapter-btn" class="mt-6 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition">
                <i class="fas fa-plus mr-2"></i>Add Chapter
            </button>

            <input type="hidden" id="course-content-json" name="course_content_json">
            <button type="submit" class="mt-6 w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 transition">
                Save Course
            </button>
        </form>
    </div>

    <script>
        // --- Helper Functions to create dynamic elements ---
        let chapterCounter = 0;
        function createChapterCard() {
            chapterCounter++;
            const chapterCard = document.createElement('div');
            chapterCard.className = 'chapter-card p-6 border border-gray-300 rounded-lg bg-gray-50 shadow-sm';
            chapterCard.dataset.chapterId = chapterCounter;
            chapterCard.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-gray-800">Chapter ${chapterCounter}</h3>
                    <button type="button" class="remove-chapter-btn text-red-500 hover:text-red-700 transition">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 font-semibold mb-2">Chapter Title</label>
                    <input type="text" class="chapter-title-input w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Variables and Data Types" required>
                </div>
                <div class="sessions-container space-y-4">
                    <!-- Sessions will be added here -->
                </div>
                <div class="flex space-x-4 mt-4">
                    <button type="button" class="add-learning-btn flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                        <i class="fas fa-book-open mr-2"></i>Add Learning Session
                    </button>
                    <button type="button" class="add-quiz-btn flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                        <i class="fas fa-question-circle mr-2"></i>Add Quiz Session
                    </button>
                </div>
            `;
            return chapterCard;
        }

        let sessionCounter = 0;
        function createSessionCard(type) {
            sessionCounter++;
            const sessionCard = document.createElement('div');
            sessionCard.className = 'session-card p-4 border border-gray-200 rounded-lg bg-white shadow-sm';
            sessionCard.dataset.sessionId = sessionCounter;
            sessionCard.dataset.sessionType = type;
            let contentHtml = '';
            if (type === 'learning') {
                contentHtml = `
                    <div class="mb-4">
                        <label class="block text-gray-700 font-semibold mb-2">Learning Session Title</label>
                        <input type="text" class="learning-session-title-input w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Introduction to Variables" required>
                    </div>
                    <div class="materials-container space-y-3">
                        <!-- Materials will be added here -->
                    </div>
                    <button type="button" class="add-material-btn mt-4 w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition">
                        <i class="fas fa-plus mr-2"></i>Add Material
                    </button>
                `;
            } else if (type === 'quiz') {
                contentHtml = `
                    <div class="question-generator-container space-y-4">
                        <div class="mb-2">
                            <label class="block text-gray-700 font-semibold mb-2">Quiz Name</label>
                            <input type="text" class="quiz-name-input w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Chapter 1 Quiz" required>
                        </div>
                        <div class="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                            <div class="flex-1">
                                <label class="block text-sm font-medium text-gray-700">Source Type</label>
                                <select class="content-source-select mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    <option value="text_input">Text Input</option>
                                    <option value="file_upload">File Upload</option>
                                </select>
                            </div>
                            <div class="flex-1">
                                <label class="block text-sm font-medium text-gray-700">Question Type</label>
                                <select class="question-type-select mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    <option value="mcq">Multiple Choice</option>
                                    <option value="true_false">True/False</option>
                                    <option value="fill_blank">Fill in the Blanks</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                            <div class="flex-1">
                                <label class="block text-sm font-medium text-gray-700">Bloom's Taxonomy Level</label>
                                <select class="bloom-level-select mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    <option value="1">1. Remembering</option>
                                    <option value="2">2. Understanding</option>
                                    <option value="3">3. Applying</option>
                                    <option value="4">4. Analyzing</option>
                                    <option value="5">5. Evaluating</option>
                                    <option value="6">6. Creating</option>
                                </select>
                            </div>
                            <div class="flex-1">
                                <label class="block text-sm font-medium text-gray-700">Difficulty Level</label>
                                <select class="question-difficulty-select mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                            <div class="flex-1">
                                <label class="block text-sm font-medium text-gray-700">Number of Questions</label>
                                <input type="number" class="num-questions-input mt-1 block w-full rounded-md border-gray-300 shadow-sm" min="1" max="10" value="3" required>
                            </div>
                        </div>
                        <div class="ai-content-input-container space-y-2" data-source-type="text_input">
                            <label class="block text-gray-700 font-semibold">Source Text</label>
                            <textarea class="ai-content-input w-full h-32 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Paste your text content here..." required></textarea>
                        </div>
                        <div class="ai-content-input-container space-y-2 hidden" data-source-type="file_upload">
                            <label class="block text-gray-700 font-semibold">Upload Text File</label>
                            <input type="file" class="ai-content-file-input w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" accept=".txt">
                        </div>
                        <button type="button" class="generate-questions-btn w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-md hover:bg-purple-700 transition">
                            <i class="fas fa-magic mr-2"></i>Generate Questions
                        </button>
                        <div class="generated-questions-container mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                            <div class="loading-indicator hidden">
                                <i class="fas fa-spinner fa-2x text-blue-500"></i>
                            </div>
                        </div>
                    </div>
                `;
            }
            sessionCard.innerHTML = `<div class="flex justify-between items-center mb-4">
                <h4 class="text-md font-bold text-gray-800">Session ${sessionCounter}</h4>
                <button type="button" class="remove-session-btn text-red-500 hover:text-red-700 transition">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            ${contentHtml}`;
            return sessionCard;
        }

        function createMaterialCard() {
            const materialCard = document.createElement('div');
            materialCard.className = 'material-form-container p-3 border border-gray-200 rounded-md bg-white shadow-sm';
            materialCard.innerHTML = `
                <div class="flex justify-between items-center mb-3">
                    <h5 class="text-sm font-semibold text-gray-800">New Material</h5>
                    <button type="button" class="remove-material-btn text-red-500 hover:text-red-700 transition">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="mb-2">
                    <label class="block text-xs font-medium text-gray-700">Material Type</label>
                    <select class="material-type-select mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="text">Text</option>
                        <option value="video">Video</option>
                        <option value="article">Article</option>
                    </select>
                </div>
                <div class="mb-2">
                    <label class="block text-xs font-medium text-gray-700">Material Name</label>
                    <input type="text" class="material-name-input mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                </div>
                <div class="material-content-field space-y-2" data-type="text">
                    <label class="block text-xs font-medium text-gray-700">Content</label>
                    <textarea class="material-content-input w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
                </div>
                <div class="material-content-field space-y-2 hidden" data-type="video">
                    <label class="block text-xs font-medium text-gray-700">URL</label>
                    <input type="url" class="material-content-input mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="https://example.com/video" required>
                </div>
                <div class="material-content-field space-y-2 hidden" data-type="article">
                    <label class="block text-xs font-medium text-gray-700">URL</label>
                    <input type="url" class="material-content-input mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="https://example.com/article" required>
                </div>
            `;
            return materialCard;
        }

        // --- Event Listeners ---
        const form = document.getElementById('course-form');
        const chaptersContainer = document.getElementById('chapters-container');
        const addChapterBtn = document.getElementById('add-chapter-btn');
        const courseContentJsonInput = document.getElementById('course-content-json');
        
        addChapterBtn.addEventListener('click', () => {
            const newChapterCard = createChapterCard();
            chaptersContainer.appendChild(newChapterCard);
        });

        // Event delegation for dynamically added elements (chapters, sessions, materials, quiz generators)
        chaptersContainer.addEventListener('click', async (e) => {
            // Handle Add Learning Session button click
            if (e.target.closest('.add-learning-btn')) {
                const addSessionBtn = e.target.closest('.add-learning-btn');
                const sessionsContainer = addSessionBtn.closest('.chapter-card').querySelector('.sessions-container');
                const newSessionCard = createSessionCard('learning');
                sessionsContainer.appendChild(newSessionCard);
            }

            // Handle Add Quiz Session button click
            if (e.target.closest('.add-quiz-btn')) {
                const addSessionBtn = e.target.closest('.add-quiz-btn');
                const sessionsContainer = addSessionBtn.closest('.chapter-card').querySelector('.sessions-container');
                const newSessionCard = createSessionCard('quiz');
                sessionsContainer.appendChild(newSessionCard);
            }

            // Handle Add Material button click
            if (e.target.closest('.add-material-btn')) {
                const addMaterialBtn = e.target.closest('.add-material-btn');
                const materialsContainer = addMaterialBtn.closest('.session-card').querySelector('.materials-container');
                const newMaterialCard = createMaterialCard();
                materialsContainer.appendChild(newMaterialCard);
            }

            // Handle remove buttons
            if (e.target.closest('.remove-chapter-btn')) {
                e.target.closest('.chapter-card').remove();
            } else if (e.target.closest('.remove-session-btn')) {
                e.target.closest('.session-card').remove();
            } else if (e.target.closest('.remove-material-btn')) {
                e.target.closest('.material-form-container').remove();
            }
        });

        chaptersContainer.addEventListener('change', (e) => {
            // Handle material type change
            if (e.target.closest('.material-type-select')) {
                const materialTypeSelect = e.target.closest('.material-type-select');
                const selectedType = materialTypeSelect.value;
                const materialCard = materialTypeSelect.closest('.material-form-container');
                materialCard.querySelectorAll('.material-content-field').forEach(field => {
                    field.classList.add('hidden');
                    const inputField = field.querySelector('textarea, input[type="url"]');
                    if (inputField) inputField.removeAttribute('required');
                });
                const activeField = materialCard.querySelector(`.material-content-field[data-type="${selectedType}"]`);
                if (activeField) {
                    activeField.classList.remove('hidden');
                    const inputField = activeField.querySelector('textarea, input[type="url"]');
                    if (inputField) inputField.setAttribute('required', 'true');
                }
            }

            // Handle content source type change for quiz generator
            if (e.target.closest('.content-source-select')) {
                const contentSourceSelect = e.target.closest('.content-source-select');
                const selectedSourceType = contentSourceSelect.value;
                const quizGeneratorContainer = contentSourceSelect.closest('.question-generator-container');
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
            }
        });

        chaptersContainer.addEventListener('click', async (e) => {
            // Handle Generate Questions button click (API call will go here)
            if (e.target.closest('.generate-questions-btn')) {
                const generateButton = e.target.closest('.generate-questions-btn');
                const quizGeneratorCard = generateButton.closest('.question-generator-container');

                const contentSourceSelect = quizGeneratorCard.querySelector('.content-source-select');
                const contentSourceType = contentSourceSelect.value;
                let aiContent = '';

                if (contentSourceType === 'text_input') {
                    aiContent = quizGeneratorCard.querySelector('.ai-content-input').value;
                    if (!aiContent.trim()) {
                        showErrorMessage('Please provide text content for AI to generate questions.');
                        return;
                    }
                } else { // file_upload
                    const fileInput = quizGeneratorCard.querySelector('.ai-content-file-input');
                    if (fileInput.files.length > 0) {
                        const aiFile = fileInput.files[0];
                        try {
                            const fileReader = new FileReader();
                            aiContent = await new Promise((resolve, reject) => {
                                fileReader.onload = event => resolve(event.target.result);
                                fileReader.onerror = error => reject(error);
                                fileReader.readAsText(aiFile);
                            });
                        } catch (error) {
                            console.error('Error reading file:', error);
                            showErrorMessage('Error reading file. Please try again.');
                            return;
                        }
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
                    generatedQuestionsContainer.appendChild(questionsArea);
                }
                questionsArea.innerHTML = ''; // Clear previous questions

                loadingIndicator.style.display = 'flex'; // Show loading indicator

                try {
                    const payload = {
                        contents: [{
                            parts: [{ text: `Generate ${numQuestions} ${questionDifficulty} ${questionType} questions at Bloom's Taxonomy level ${bloomLevel} based on the following content:\n\n${aiContent}` }]
                        }],
                        tools: [{ "google_search": {} }],
                        systemInstruction: {
                            parts: [{ text: "You are a helpful assistant specialized in generating educational quizzes. Your output must be a JSON array of objects. Each object represents a question and must have 'question', 'correctAnswer', and 'options' properties. The options should be an array of strings." }]
                        },
                        generationConfig: {
                            responseMimeType: "application/json",
                            responseSchema: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        "question": { "type": "STRING" },
                                        "correctAnswer": { "type": "STRING" },
                                        "options": {
                                            "type": "ARRAY",
                                            "items": { "type": "STRING" }
                                        }
                                    }
                                }
                            }
                        }
                    };
                    const apiKey = "";
                    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to generate questions.');
                    }

                    const result = await response.json();
                    const json = result?.candidates?.[0]?.content?.parts?.[0]?.text;
                    const questions = JSON.parse(json);
                    
                    questions.forEach((q, qIndex) => {
                        const questionItemDiv = document.createElement('div');
                        questionItemDiv.className = 'generated-question-item p-3 border border-gray-200 rounded-md bg-white';
                        let choicesHtml = '';
                        if (q.options && q.options.length > 0) {
                            choicesHtml = `<ul class="list-disc pl-5 mt-1">
                                ${q.options.map(choice => `<li>${choice} ${choice === q.correctAnswer ? '<i class="fas fa-check-circle text-green-500"></i>' : ''}</li>`).join('')}
                            </ul>`;
                        }
                        questionItemDiv.innerHTML = `
                            <p class="font-medium">Q${qIndex + 1}: ${q.question}</p>
                            ${choicesHtml}
                            <p class="text-sm text-green-700 mt-1"><strong>Correct Answer:</strong> ${q.correctAnswer}</p>
                        `;
                        questionsArea.appendChild(questionItemDiv);
                    });

                    quizGeneratorCard.dataset.generatedQuestions = JSON.stringify(questions);
                } catch (error) {
                    console.error('Error generating questions:', error);
                    showErrorMessage(`Error: ${error.message}`);
                } finally {
                    loadingIndicator.style.display = 'none'; // Hide loading indicator
                }
            }
        });

        // --- Form Submission Logic ---
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Check if there are any chapters before submitting
            const chapterCards = chaptersContainer.querySelectorAll('.chapter-card');
            if (chapterCards.length === 0) {
                showErrorMessage('Please add at least one chapter before saving your course.');
                return; // Stop the function here
            }

            const allCourseContent = [];
            

            chapterCards.forEach(chapterCard => {
                const chapterTitle = chapterCard.querySelector('.chapter-title-input').value;
                const chapterSessions = [];

                chapterCard.querySelectorAll('.session-card').forEach(sessionCard => {
                    const sessionType = sessionCard.dataset.sessionType;

                    if (sessionType === 'learning') {
                        const learningSessionData = {
                            type: 'learning_session',
                            title: sessionCard.querySelector('.learning-session-title-input').value,
                            materials: []
                        };

                        sessionCard.querySelectorAll('.material-form-container').forEach(materialCard => {
                            const materialType = materialCard.querySelector('.material-type-select').value;
                            const materialName = materialCard.querySelector('.material-name-input').value;
                            const activeContentField = materialCard.querySelector(`.material-content-field[data-type="${materialType}"]`);
                            let materialContent = '';
                            if (activeContentField) {
                                const inputElement = activeContentField.querySelector('textarea, input[type="url"]');
                                if (inputElement) {
                                    materialContent = inputElement.value;
                                }
                            }
                            learningSessionData.materials.push({
                                type: materialType,
                                name: materialName,
                                content: materialContent,
                            });
                        });
                        chapterSessions.push(learningSessionData);

                    } else if (sessionType === 'quiz') {
                        const quizGeneratorCard = sessionCard.querySelector('.question-generator-container');
                        const generatedQuestions = JSON.parse(quizGeneratorCard.dataset.generatedQuestions || '[]');

                        const quizSessionData = {
                            type: 'quiz_session',
                            quiz_name: quizGeneratorCard.querySelector('.quiz-name-input').value,
                            content_source_type: quizGeneratorCard.querySelector('.content-source-select').value,
                            question_type: quizGeneratorCard.querySelector('.question-type-select').value,
                            bloom_level: quizGeneratorCard.querySelector('.bloom-level-select').value,
                            question_difficulty: quizGeneratorCard.querySelector('.question-difficulty-select').value,
                            num_questions: quizGeneratorCard.querySelector('.num-questions-input').value,
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

            courseContentJsonInput.value = JSON.stringify(allCourseContent);
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
    </script>
    {% endblock %}