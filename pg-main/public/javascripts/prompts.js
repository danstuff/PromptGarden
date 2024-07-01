import { getCurrentDocumentId } from "./document.js";
import { appError, appIsDemo, appLog } from "./log.js";

const MAX_PROMPTS = 64;

const MAX_PROMPT_HEADER_CHARS = 128;
const MAX_PROMPT_DESCRIPTION_CHARS = 512;

var last_modal_prompt = null;

// TODO drag and drop

function sanitize(str, max_length) {
    return DOMPurify.sanitize(str.substr(0, Math.min(str.length, max_length)));
}

function getPromptContents(prompt) {
    var header_text = prompt.children('.pg-prompt-header').html();
    var description_text = prompt.children('.pg-prompt-description').html();

    header_text = sanitize(header_text, MAX_PROMPT_HEADER_CHARS);
    description_text = sanitize(description_text, MAX_PROMPT_DESCRIPTION_CHARS);

    return {  header: header_text, description: description_text };
}

function loadPromptToModal(prompt) {
    var contents = getPromptContents(prompt);

    $('#pg-prompt-modal-header').html('Edit \''+contents.header+'\'');
    $('#pg-prompt-modal-edit-header').val(contents.header);
    $('#pg-prompt-modal-edit-description').val(contents.description);

    last_modal_prompt = prompt;
}

function savePromptFromModal() {
    if (!last_modal_prompt) {
        appError('Modal prompt not found');
        return;
    }

    var header_text = $('#pg-prompt-modal-edit-header').val();
    var description_text = $('#pg-prompt-modal-edit-description').val();

    header_text = sanitize(header_text, MAX_PROMPT_HEADER_CHARS);
    description_text = sanitize(description_text, MAX_PROMPT_DESCRIPTION_CHARS);

    last_modal_prompt.children('.pg-prompt-header').html(header_text);
    last_modal_prompt.children('.pg-prompt-description').html(description_text);

    last_modal_prompt = null;
}

function addPrompt(header_text, description_text) {
    if ($('#pg-prompt-list').children().length > MAX_PROMPTS) {
        return null;
    }

    var prompt = $('<a>', { 
        'class': 'pg-prompt list-group-item list-group-item-action py-3 lh-sm',
        'style': 'width: 300px; height: 75px; cursor: pointer;', 
        'draggable': 'true', 
        'data-bs-toggle': 'modal',
        'data-bs-target': '#pg-prompt-modal'
    });
    var header = $('<strong>', {
        'class': 'pg-prompt-header',
    });
    var description = $('<div>', {
        'class': 'pg-prompt-description col-10 mb-1 small w-100',
        'style': 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;', 
    });

    header_text = sanitize(header_text, MAX_PROMPT_HEADER_CHARS);
    description_text = sanitize(description_text, MAX_PROMPT_DESCRIPTION_CHARS);

    header.html(header_text);
    description.html(description_text);

    prompt.append(header);
    prompt.append(description);

    $('#pg-prompt-list').append(prompt);

    // Add callback to load modal contents from clicked prompt
    prompt.on('click', function() {
        appLog('Clicked prompt');
        loadPromptToModal($(this));
    });

    return prompt;
}

function putPrompts() {
    if (appIsDemo()) {
        return;
    }

    var prompts = [];
    $('#pg-prompt-list').children().each(function() {
       prompts.push(getPromptContents($(this)));
    });

    $.ajax(`/editor/doc/${getCurrentDocumentId()}/prompts`, {
        method: 'PUT',
        data: JSON.stringify({ 
            prompts: prompts
        }),
        contentType: 'application/json; charset=utf-8',
    }).done(function(data, status) {
        appLog(`PUT prompts: ${status}`);
    });
}

function getPrompts() {
    $('#pg-prompt-list').empty();

    if (appIsDemo()) {
        addPrompt(
            'Example Prompt',
            'Click here to provide some additional context for your AI chat.'
        );
    }
    else {
        $.ajax(`/editor/doc/${getCurrentDocumentId()}/prompts`, {
            method: 'GET',
        }).done(function(data, status) {
            appLog(`GET prompts: ${status}`);
            for (var i = 0; i < data.prompts?.length; i++) {
                addPrompt(data.prompts[i].header, data.prompts[i].description);
            }
        });
    }
}

export { loadPromptToModal, savePromptFromModal, getPrompts, addPrompt, putPrompts };