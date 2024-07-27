import { appIsDemo, appLog } from "./log.js";
import { getCurrentDocumentId, getDocumentSelection, reloadDocument } from "./document.js";
import { getActivePersonaDescription } from "./persona.js";

const MAX_CHAT_MESSAGE_CHARS = 512;

function sanitize(str, max_length) {
    return DOMPurify.sanitize(str.substr(0, Math.min(str.length, max_length)));
}

function addChatMessage(justify, color, text) {
    var message = $('<div>', { 
        'class': 'd-flex ' + justify,
    });
    var content = $('<p>', { 
        'class': 'rounded p-2 m-1 text-break ' + color,
        'style': 'max-width: 250px;',
    });

    content.html(text);
    message.append(content);

    $('#pg-chat-history').append(message);
    $('#pg-chat-history').scrollTop($('#pg-chat-history').prop('scrollHeight'));
}

function addChatAIMessage(text) {
    //addChatMessage('', 'bg-body', text);
}

function addChatHumanMessage(text) {
    //addChatMessage('justify-content-end', 'bg-secondary-subtle', text);
}

function submitHumanMessage() {
    var message_text = $('#pg-chat-input').val();
    message_text = sanitize(message_text, MAX_CHAT_MESSAGE_CHARS);

    $('#pg-chat-input').val('');

    if (appIsDemo()) {    
        alert('Hello and welcome to PromptGarden!\n' + 
            'This is just a UI demo, so there\'s no AI or docs integration.');
    } else {
        $.ajax(`/editor/doc/${getCurrentDocumentId()}`, {
            method: 'PUT',
            data: JSON.stringify({ 
                query: message_text,
                selection: getDocumentSelection(),
                persona: getActivePersonaDescription(),
            }),
            contentType: 'application/json; charset=utf-8',
        }).done(function(data, status) {
            appLog(`PUT chat: ${status}`);
            reloadDocument();
        })
    }
}

export { submitHumanMessage };