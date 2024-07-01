import { appLog } from "./log.js";
import { getPrompts } from "./prompts.js";

// TODO select range in document
// TODO undo and redo

var current_documentid = 0;
var current_selected_div = null;

function getCurrentDocumentId() {
    return current_documentid;
}

function countLettersBefore(parent, target, saw_child) {
    var sum = 0;
    if (!saw_child) {
        parent.children().each(function() {
            if ($(this).get(0) === target.get(0)) {
                saw_child = true;
            } else if ($(this).children().length > 0) {
                sum += countLettersBefore($(this), target, saw_child);
            }
            else {
                sum += saw_child ? 0 : $(this).text().length;  
            }
        });
    }
    return sum;
}

function getDocumentSelection() {
    if (!current_selected_div) {
        return null;
    }

    const text = current_selected_div.text();
    const selection_start = countLettersBefore($('#pg-document-view'), current_selected_div)+1;

    return {
        text: text,
        start: selection_start,
    }
}

function registerChildClickEvent(div) {
    div.on('click', function() {
        $(this).addClass('pg-highlight');
        
        current_selected_div?.removeClass('pg-highlight');
        current_selected_div = $(this);
    });
}

function registerParentClickEvents(parent) {
    parent.children().each(function() {
        if ($(this).children().length > 0) {
            registerParentClickEvents($(this));
        }
        else {
            registerChildClickEvent($(this));
        }
    });
}

function getDocument(id) {
    $.ajax('/editor/doc/'+id, {
        method: 'GET',
    }).done(function(data, status) {
        current_documentid = id;
        appLog(`GET document ${id}: ${status}`);

        $('#pg-document-view').html(DOMPurify.sanitize(data));
        registerParentClickEvents($('#pg-document-view'));

        getPrompts(id);
    });
}

function reloadDocument() {
    getDocument(current_documentid);
}

/*function putDocument(start, end, text) {
    $.ajax('/editor/doc/'+id, {
        method: 'PUT',
        data: {
            start: start, 
            end: end,
            text: text,
        }
    }).done(function(data, status) {
        appLog(`PUT document ${id}: ${status}`);
    });
}*/

function addDocLink(name, id) {
    var link = $('<a>', {
        'href' : '#',
        'data-bs-dismiss' : 'modal',
    });
    link.html(name);    
    link.on('click', function() {
        getDocument(id);
    });
    
    var newline = $('<br>');
    $('#pg-document-modal-list').append(link);
    $('#pg-document-modal-list').append(newline);
}

function listDocuments() {
    $.ajax('/editor/doc/list', {
        method: 'GET',
    }).done(function(data, status) {
        appLog(`GET document list: ${status}`);
        $('#pg-document-modal-list').empty();
        
        for (var i = 0; i < data.files.length; i++) {
            addDocLink(data.files[i].name, data.files[i].id);
        }
    });
}


export { getCurrentDocumentId, getDocument, reloadDocument, listDocuments, getDocumentSelection };