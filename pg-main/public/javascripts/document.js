import { appLog } from "./log.js";
import { getPrompts } from "./prompts.js";

// TODO undo and redo

var current_documentid = 0;
var current_selected_div = null;

function getCurrentDocumentId() {
    return current_documentid;
}

function countLettersBefore(parent, target) {
    var sum = 0;
    var saw_child = false;
    if (!saw_child) {
        parent.children().each(function() {
            if (saw_child || $(this).get(0) === target.get(0)) {
                saw_child = true;
            } else if ($(this).children().length > 0) {
                var result = countLettersBefore($(this), target);
                sum += result.sum;
                saw_child = saw_child || result.saw_child;
            }
            else {
                sum += saw_child ? 0 : $(this).text().length + 1;  
                console.log($(this).text(), sum);
            }
        });
    }
    return { sum: sum, saw_child: saw_child };
}

function getDocumentSelection() {
    if (!current_selected_div) {
        return null;
    }

    const text = current_selected_div.text();
    const selection_start = countLettersBefore($('#pg-document-view'), current_selected_div).sum+1;

    return {
        text: text,
        start: selection_start,
        end: selection_start + text.length,
    }
}

function registerChildClickEvent(div) {
    div.addClass('pg-pointer');
    div.on('click', function() {
        $(this).addClass('pg-highlight');
        current_selected_div?.removeClass('pg-highlight');
        
        if (current_selected_div?.get(0) === $(this).get(0)) {
            current_selected_div = null;
        } else {
            current_selected_div = $(this);
        }
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

function getDocument(name, id) {
    $.ajax('/editor/doc/'+id, {
        method: 'GET',
    }).done(function(data, status) {
        current_documentid = id;
        appLog(`GET document ${id}: ${status}`);

        $('#pg-document-view').html(DOMPurify.sanitize(data));
        registerParentClickEvents($('#pg-document-view'));

        if (name) {
            $('#pg-document-title').text(DOMPurify.sanitize(name));
        }

        getPrompts(id);
    });
}

function reloadDocument() {
    if (current_documentid != 0) {
        getDocument(null, current_documentid);
    }
}

function addDocLink(name, id) {
    var link = $('<a>', {
        'href' : '#',
        'data-bs-dismiss' : 'modal',
    });
    link.html(name);    
    link.on('click', function() {
        getDocument(name, id);
    });
    
    var newline = $('<br>');
    $('#pg-document-modal-list').append(link);
    $('#pg-document-modal-list').append(newline);
}

function listDocuments() {
    $.ajax('/editor/list/docs', {
        method: 'GET',
    }).done(function(data, status) {
        appLog(`GET document list: ${status}`);
        $('#pg-document-modal-list').empty();

        for (var i = 0; i < data.files?.length; i++) {
            addDocLink(data.files[i].name, data.files[i].id);
        }
    });
}


export { getCurrentDocumentId, reloadDocument, listDocuments, getDocumentSelection };