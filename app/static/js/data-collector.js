/**
 * @fileoverview Module for collecting all form data and handling the final submission.
 * This module is responsible for traversing the DOM to gather all course information
 * and sending it to the backend via a fetch request.
 */

import DomUtils from './dom-utils.js';

const DataCollector = {
    /**
     * Handles the form submission by building a JSON object and sending it via fetch.
     * @param {Event} event - The form submission event.
     */
    async handleFormSubmission(event) {
        event.preventDefault();

        const courseForm = document.getElementById('create-course-form');
        const submitBtn = courseForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Creating...';

        try {
            const courseData = this.collectCourseData();
            if (!courseData.title) {
                DomUtils.showCustomModal('Please provide a course title.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Create Course';
                return;
            }
            
            const response = await fetch(courseForm.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': DomUtils.getCsrfToken()
                },
                body: JSON.stringify(courseData)
            });

            const result = await response.json();

            if (response.ok) {
                DomUtils.showCustomModal('Course created successfully!', 'success');
                window.location.href = result.redirect_url || '/teacher/dashboard';
            } else {
                DomUtils.showCustomModal('Failed to create course: ' + (result.message || 'Unknown error.'), 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            DomUtils.showCustomModal('An unexpected error occurred. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Create Course';
        }
    },

    /**
     * Collects all course data from the DOM and formats it into a JSON object.
     * @returns {object} The structured course data.
     */
    collectCourseData() {
        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();
        const chapters = [];
        
        document.querySelectorAll('.chapter-card').forEach((chapterCard) => {
            const chapterTitle = chapterCard.querySelector('.chapter-title').value.trim();
            const sessions = [];

            chapterCard.querySelectorAll('.session-card').forEach((sessionCard) => {
                const sessionType = sessionCard.classList.contains('learning-session-card') ? 'learning_session' : 'quiz_session';
                const sessionTitle = sessionCard.querySelector('.session-title')?.value.trim() || sessionCard.querySelector('.quiz-name')?.value.trim();
                let sessionContent;

                if (sessionType === 'learning_session') {
                    const materials = [];
                    sessionCard.querySelectorAll('.material-form-container').forEach((materialForm) => {
                        materials.push({
                            name: materialForm.querySelector('.material-name').value.trim(),
                            type: materialForm.querySelector('.material-type').value,
                            content: materialForm.querySelector('.material-content').value.trim()
                        });
                    });
                    sessionContent = { materials };
                } else if (sessionType === 'quiz_session') {
                    const generatorContainer = sessionCard.querySelector('.question-generator-container');
                    if (generatorContainer) {
                        const generatedQuestions = JSON.parse(generatorContainer.dataset.generatedQuestions || '[]');
                        const questionType = generatorContainer.querySelector('#question-type-select').value;
                        const bloomLevel = generatorContainer.querySelector('#bloom-level-select').value;
                        const difficulty = generatorContainer.querySelector('#question-difficulty-select').value;
                        const numQuestions = generatorContainer.querySelector('#num-questions-input').value;

                        sessionContent = {
                            questions: generatedQuestions,
                            generation_params: {
                                question_type: questionType,
                                bloom_level: bloomLevel,
                                difficulty: difficulty,
                                num_questions: numQuestions
                            }
                        };
                    } else {
                        sessionContent = { questions: [] }; // No questions generated
                    }
                }

                sessions.push({
                    type: sessionType,
                    title: sessionTitle,
                    content: sessionContent
                });
            });

            chapters.push({
                title: chapterTitle,
                sessions: sessions
            });
        });

        return { title, description, chapters };
    }
};

export default DataCollector;
