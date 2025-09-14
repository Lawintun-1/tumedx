/**
 * @fileoverview A collection of utility functions for DOM manipulation and UI feedback.
 * This module is designed to be imported by other parts of the application.
 */

const DomUtils = {
    /**
     * Displays a custom modal with a given message and style.
     * @param {string} message The message to display in the modal.
     * @param {string} type The type of message ('success' or 'error') to determine the modal's color.
     */
    showCustomModal(message, type) {
        const customModal = document.getElementById('custom-modal');
        const modalMessage = document.getElementById('modal-message');
        if (!customModal || !modalMessage) return;

        modalMessage.textContent = message;
        customModal.classList.remove('bg-green-500', 'bg-red-500');
        if (type === 'success') {
            customModal.classList.add('bg-green-500');
        } else {
            customModal.classList.add('bg-red-500');
        }
        customModal.style.display = 'flex';
    },

    /**
     * Gets the CSRF token from a hidden input field in the document.
     * @returns {string|null} The CSRF token or null if not found.
     */
    getCsrfToken() {
        const csrfTokenInput = document.querySelector('input[name="csrf_token"]');
        return csrfTokenInput ? csrfTokenInput.value : null;
    }
};

export default DomUtils;
