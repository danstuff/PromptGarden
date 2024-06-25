const MAX_CHAT_MESSAGE_CHARS = 1024;

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
    addChatMessage('', 'bg-body', text);
}

function addChatHumanMessage(text) {
    addChatMessage('justify-content-end', 'bg-secondary-subtle', text);
}

function submitHumanMessage() {
    var message_text = $('#pg-chat-input').val();
    message_text = sanitize(message_text, MAX_CHAT_MESSAGE_CHARS);

    addChatHumanMessage(message_text);
    $('#pg-chat-input').val('');

    if (CLIENT_MODE == 'demo') {    
        setTimeout(function() {
            addChatAIMessage('Hello and welcome to PromptGarden!');

            setTimeout(function() {
                addChatAIMessage('This is just a UI demo, so there\'s no AI or docs integration yet.');
            }, 1000);
        }, 1000);
    } else {
        $.ajax({
            method: 'POST',
            data: message_text,
        }).done(function(data, status) {
            clientLog('POST chat message: '+ status);
            // TODO break up data into doc content and chat message
            addChatAIMessage(data); 
        })
    }
}

$(function() {
    $('#pg-chat-send').on('click', function() {
        submitHumanMessage();
    });

    $('#pg-chat-input').on('keyup', function(e) {
        if (e.which == 13 && e.ctrlKey) {
            submitHumanMessage();
        }
    });
});