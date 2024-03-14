import St from 'gi://St';
import Gio from 'gi://Gio';
import Clutter from 'gi://Clutter';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

let getInput;
let convert;

const CreateActor = (SCHEMA_ID, label, hintText, key, permenentHint = null) => {
    const settings = new Gio.Settings({schema_id: SCHEMA_ID});
    const menuItem = new PopupMenu.PopupBaseMenuItem();

    if (key.startsWith('blur-brightness')) {
        getInput = settings.get_double(key);
        convert = String(getInput);
    } else if (key.startsWith('blur-sigma')) {
        getInput = settings.get_int(key);
        convert = String(getInput);
    } else {
        convert = settings.get_string(key);
    }

    const inputText = new St.Entry({
        hint_text: hintText,
        text: convert,
        track_hover: true,
        can_focus: true,
    });

    inputText.clutter_text.connect('activate', actor => {
        getInput = actor.get_text();
        if (key.startsWith('blur-brightness'))
            settings.set_double(key, parseFloat(getInput));
        else if (key.startsWith('blur-sigma'))
            settings.set_int(key, Number(getInput));
        else
            settings.set_string(key, getInput);
    });
    menuItem.connect('notify::active', () => inputText.grab_key_focus());

    menuItem.add_child(new St.Label({text: label, y_align: Clutter.ActorAlign.CENTER}));
    menuItem.add_child(inputText);
    if (permenentHint)
        menuItem.add_child(new St.Label({text: permenentHint, y_align: Clutter.ActorAlign.CENTER}));

    return menuItem;
};

export default CreateActor;
