import { appIsDemo, appLog } from "./log.js";

const MAX_PERSONAE = 32;

const MAX_PERSONA_NAME_CHARS = 128;
const MAX_PERSONA_DESCRIPTION_CHARS = 512;

var active_persona = null;
var last_modal_persona = null;

function sanitize(str, max_length) {
    return DOMPurify.sanitize(str.substr(0, Math.min(str.length, max_length)));
}

function addPersona(name, description) {
    if (name == '') {
        return null;
    }

    name = sanitize(name, MAX_PERSONA_NAME_CHARS);
    description = sanitize(description, MAX_PERSONA_DESCRIPTION_CHARS);

    var persona = $('<li>', { 
        'class': 'dropdown-item d-flex align-items-center',
        'data-pg-description': description,
    });

    var persona_link = $('<a>', { 
        'class': 'text-decoration-none text-reset d-flex gap-2',
        'href': '#',
    });
    var persona_image = $('<img>', {
        'class': 'rounded-circle',
        'src': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/ChatGPT-Logo.svg',
        'width': '32',
        'height': '32',
    });
    var persona_text = $('<p>', {
        'class': 'lh-lg mb-0'
    });
    persona_text.text(name);

    persona_link.append(persona_image);
    persona_link.append(persona_text);

    persona.append(persona_link);

    var edit_link = $('<a>', { 
        'class': 'ps-4',
        'href': '#',
        'data-bs-toggle': 'modal',
        'data-bs-target': '#pg-persona-modal',
    });
    var edit_image = $('<img>', {
        'src': 'images/pencil.svg',
        'width': '16',
        'height': '16',
    });

    edit_link.append(edit_image);
    persona.append(edit_link);

    $('#pg-persona-list').append(persona);

    // Add callback to select person when clicked
    persona_link.on('click', function() {
        appLog('Clicked persona');
        setActivePersona($(this).parent());
    });
    edit_link.on('click', function() {
        appLog('Clicked edit persona');
        loadPersonaToModal($(this).parent());
    });

    return persona;
}

function setActivePersona(persona) {
    active_persona?.removeClass('active');
    active_persona = persona;
    active_persona.addClass('active');
}

function getActivePersonaDescription() {
    return active_persona?.attr('data-pg-description');
}

function clearPersonaModal() {
    $('#pg-persona-modal-header').text('New Persona');
    $('#pg-persona-modal-edit-header').val('');
    $('#pg-persona-modal-edit-header').show();
    $('#pg-persona-modal-edit-description').val('');
    last_modal_persona = null;
}

function loadPersonaToModal(persona) {
    const name = persona.children('a').first().children('p').first().text();
    const description = persona.attr('data-pg-description');

    $('#pg-persona-modal-header').text(`Edit Persona '${name}'`);
    $('#pg-persona-modal-edit-header').val(name);
    $('#pg-persona-modal-edit-header').hide();
    $('#pg-persona-modal-edit-description').val(description);

    last_modal_persona = persona;
}

function savePersonaFromModal() {
    const name = $('#pg-persona-modal-edit-header').val();
    const description = $('#pg-persona-modal-edit-description').val();

    if (last_modal_persona) {
        last_modal_persona.children('a').first().children('p').first().text(name);
        last_modal_persona.attr('data-pg-description', description);
    }
    else {
        last_modal_persona = addPersona(name, description);
    }
    putPersona(last_modal_persona);
    last_modal_persona = null;
}

function putPersona(persona) {
    if (appIsDemo() || !persona) {
        return;
    }

    const name = persona.children('a').first().children('p').first().text();
    const description = persona.attr('data-pg-description');

    $.ajax(`/editor/persona/${name}`, {
        method: 'PUT',
        data: JSON.stringify({ 
            description: description
        }),
        contentType: 'application/json; charset=utf-8',
    }).done(function(data, status) {
        appLog(`PUT persona: ${status}`);
    });
}

function deleteCurrentPersona() {
    if (!last_modal_persona) {
        return;
    }

    const name = last_modal_persona.children('a').first().children('p').first().text();
    if (name) {
        $.ajax(`/editor/persona/${name}`, {
            method: 'DELETE',
        });
    }
    last_modal_persona.remove();
    last_modal_persona = null;
}

function getPersonae() {
    addPersona(
        'Standard',
        ''
    );
    if (!appIsDemo()) {
        $.ajax(`/editor/list/personae`, {
            method: 'GET',
        }).done(function(data, status) {
            appLog(`GET personae: ${status}`);
            appLog(data.personae);
            $('#pg-persona-list').empty();
            for (var i = 0; i < data.personae?.length; i++) {
                const persona = addPersona(data.personae[i].name, data.personae[i].description);
                if (i == 0) {
                    setActivePersona(persona);
                }
            }
        });
    }
}

export { clearPersonaModal, savePersonaFromModal, deleteCurrentPersona, getActivePersonaDescription, getPersonae };