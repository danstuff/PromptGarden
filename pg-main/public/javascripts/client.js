import { appLog } from './log.js';
import { savePromptFromModal, loadPromptToModal, addPrompt, putPrompts } from './prompts.js';
import { listDocuments } from './document.js';

$(function() {    
    // PROMPTS
    // Save modal contents to clicked prompt
    $('#pg-prompt-modal-save').on('click', function() {
        appLog('Clicked save');
        savePromptFromModal();
        putPrompts();
    });
    
    // Create a new prompt and load it into the modal
    $('#pg-prompt-new').on('click', function() {
        appLog('Clicked New Prompt');
        loadPromptToModal(addPrompt('New Prompt', ''));
        putPrompts();
    });

    // DOCUMENT
    // Load in the document list when modal is opened
    $('#pg-document-view-modal-open').on('click', function() {
        appLog('Click document view');
        $('#pg-document-modal-list').empty();

        var loading = $('<p>');
        loading.html('Loading...');
        $('#pg-document-modal-list').append(loading);

        listDocuments();
    });

    // CHAT
    // Click to submit human message
    $('#pg-chat-send').on('click', function() {
        submitHumanMessage();
    });

    // Ctrl+Enter to submit human message
    $('#pg-chat-input').on('keyup', function(e) {
        if (e.which == 13 && e.ctrlKey) {
            submitHumanMessage();
        }
    });
});