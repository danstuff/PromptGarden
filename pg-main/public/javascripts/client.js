import { appLog } from './log.js';
import { savePromptFromModal, putPrompts, deleteCurrentPrompt, clearPromptModal } from './prompts.js';
import { listDocuments, reloadDocument } from './document.js';
import { clearPersonaModal, deleteCurrentPersona, savePersonaFromModal, getPersonae } from './persona.js';
import { submitHumanMessage } from './chat.js';

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
        clearPromptModal();
    });

    // Delete the prompt currently in the modal
    $('#pg-prompt-delete').on('click', function() {
        deleteCurrentPrompt();
        putPrompts();
    });

    // DOCUMENT
    // Load in the document list when modal is opened
    $('#pg-document-view-open').on('click', function() {
        appLog('Click document view');
        $('#pg-document-modal-list').empty();

        var loading = $('<p>');
        loading.html('Loading...');
        $('#pg-document-modal-list').append(loading);

        listDocuments();
    });

    // Reload from the file menu
    $('#pg-document-reload').on('click', function() {
        reloadDocument();
    });

    // TODO undo and redo

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

    // PERSONAE
    // Save modal contents to clicked persona
    $('#pg-persona-modal-save').on('click', function() {
        appLog('Clicked save');
        savePersonaFromModal();
    });
    
    // Create a new persona and load it into the modal
    $('#pg-persona-new').on('click', function() {
        appLog('Clicked New Persona');
        clearPersonaModal();
    });

    // Delete the persona currently in the modal
    $('#pg-persona-delete').on('click', function() {
        deleteCurrentPersona();
        clearPersonaModal();
    });

    getPersonae();
});