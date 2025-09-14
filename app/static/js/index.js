/**
 * @fileoverview Main entry point for the course creation application.
 * This file imports all necessary modules and initializes the application's event listeners.
 */

import CourseBuilder from './course-builder.js';
import DataCollector from './data-collector.js';
import DomUtils from './dom-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get all the required top-level DOM elements
    const addChapterButton = document.getElementById('add-chapter-button');
    const courseForm = document.getElementById('create-course-form');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // Attach all event listeners to their respective modules
    addChapterButton.addEventListener('click', () => CourseBuilder.addChapter());
    courseForm.addEventListener('submit', (e) => DataCollector.handleFormSubmission(e));
    
    // Close modal listener
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            const customModal = document.getElementById('custom-modal');
            customModal.style.display = 'none';
        });
    }

    // Initialize CSRF token and other setup in DomUtils if needed
    // Note: DomUtils.getCsrfToken() is called when needed, so no initialization is required here.
});
