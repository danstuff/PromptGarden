const MAX_PROMPTS = 64;

const MAX_PROMPT_HEADER_CHARS = 128;
const MAX_PROMPT_DESCRIPTION_CHARS = 512;

var last_clicked_prompt = null;

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
}

function savePromptFromModal(prompt) {
    var header_text = $('#pg-prompt-modal-edit-header').val();
    var description_text = $('#pg-prompt-modal-edit-description').val();

    header_text = sanitize(header_text, MAX_PROMPT_HEADER_CHARS);
    description_text = sanitize(description_text, MAX_PROMPT_DESCRIPTION_CHARS);

    prompt.children('.pg-prompt-header').html(header_text);
    prompt.children('.pg-prompt-description').html(description_text);

    postPrompt(prompt);
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
        clientLog('clicked prompt:');
        clientLog($(this));
        last_clicked_prompt = $(this);
        loadPromptToModal(last_clicked_prompt);
    });

    return prompt;
}

function postPrompts() {
    if (CLIENT_MODE == 'demo') {
        return;
    }

    var prompts = {};
    $('#pg-prompt-list').children().each(function() {
       prompts.append(getPromptContents($(this)));
    });

    $.ajax('/prompts', {
        method: 'PUT',
        data: prompts,
    }).done(function(data, status) {
        clientLog('PUT prompts: '+ status);
    });
}

function getPrompts() {
    $('#pg-prompt-list').empty();

    if (CLIENT_MODE == 'demo') {
        addPrompt('Example Prompt', 'Click here to provide some additional context for your AI chat.');
    }
    else {
        $.ajax('/prompts', {
            method: 'GET',
        }).done(function(data, status) {
            clientLog('GET prompts: '+ status);
            clientLog(data);
            for (var i = 0; i < data.prompts.length; i++) {
                addPrompt(data.prompts[i].header, data.prompts[i].description);
            }
        });
    }
}

$(function() {    
    // Save modal contents to clicked prompt
    $('#pg-prompt-modal-save').on('click', function() {
        clientLog('clicked Save');
        if (!last_clicked_prompt) {
            clientError('Last clicked prompt not found');
            return;
        }
        savePromptFromModal(last_clicked_prompt);
        postPrompts();
        last_clicked_prompt = null;
    });
    
    // Create a new prompt and load it into the modal
    $('#pg-prompt-new').on('click', function() {
        clientLog('clicked New Prompt');
        last_clicked_prompt = addPrompt('New Prompt', '');
        postPrompts();
        if (last_clicked_prompt) {
            loadPromptToModal(last_clicked_prompt);
        }
    });

    getPrompts();
});
