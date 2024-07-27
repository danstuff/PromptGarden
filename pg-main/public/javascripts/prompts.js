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

    return {  name: header_text, description: description_text };
}

function clearPromptModal() {
    $('#pg-prompt-modal-header').html('New Prompt');
    $('#pg-prompt-modal-edit-header').val('');
    $('#pg-prompt-modal-edit-header').show();
    $('#pg-prompt-modal-edit-description').val('');
}

function loadPromptToModal(prompt) {
    var contents = getPromptContents(prompt);

    $('#pg-prompt-modal-header').html('Edit \''+contents.name+'\'');
    $('#pg-prompt-modal-edit-header').val(contents.name);
    $('#pg-prompt-modal-edit-header').hide();
    $('#pg-prompt-modal-edit-description').val(contents.description);

    last_modal_prompt = prompt;
}

function savePromptFromModal() {
    var header_text = $('#pg-prompt-modal-edit-header').val();
    var description_text = $('#pg-prompt-modal-edit-description').val();

    header_text = sanitize(header_text, MAX_PROMPT_HEADER_CHARS);
    description_text = sanitize(description_text, MAX_PROMPT_DESCRIPTION_CHARS);

    if (last_modal_prompt && description_text) {
        last_modal_prompt.children('.pg-prompt-description').html(description_text);
        putPrompt(last_modal_prompt);
    }
    else if (header_text && description_text) {
        putPrompt(addPrompt(header_text, description_text));
    }
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


function getPrompts() {
    $('#pg-prompt-list').empty();

    if (appIsDemo()) {
        addPrompt(
            'Example Prompt',
            'Click here to provide some additional context for your AI chat.'
        );
    }
    else {
        $.ajax(`/editor/list/doc/${getCurrentDocumentId()}/prompts`, {
            method: 'GET',
        }).done(function(data, status) {
            appLog(`GET prompts: ${status}`);
            for (var i = 0; i < data.prompts?.length; i++) {
                addPrompt(data.prompts[i].name, data.prompts[i].description);
            }
        });
    }
}

function putPrompt(prompt) {
    if (appIsDemo()) {
        return;
    }

    var contents = getPromptContents(prompt);
    $.ajax(`/editor/doc/${getCurrentDocumentId()}/prompt/${contents.name}`, {
        method: 'PUT',
        data: JSON.stringify({ 
            description: contents.description,
        }),
        contentType: 'application/json; charset=utf-8',
    }).done(function(data, status) {
        appLog(`PUT prompt: ${status}`);
    });
}

function deleteCurrentPrompt() {
    if (appIsDemo()) {
        return;
    }

    if (!last_modal_prompt) {
        appError('Last modal prompt not found');
        return;
    }

    var prompt = getPromptContents(last_modal_prompt);
    $.ajax(`/editor/doc/${getCurrentDocumentId()}/prompt/${prompt.name}`, {
        method: 'DELETE',
    }).done(function(data, status) {
        appLog(`DELETE prompt: ${status}`);
    });

    last_modal_prompt.remove();
    last_modal_prompt = null;
}

export { clearPromptModal, savePromptFromModal, getPrompts, addPrompt, deleteCurrentPrompt };