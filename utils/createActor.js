import St from 'gi://St';
import Clutter from 'gi://Clutter';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

let getInput;

const createActor = (settings, label, hintText, key, permenentHint = null) => {
    const menuItem = new PopupMenu.PopupBaseMenuItem();

    const inputText = new St.Entry({
        hint_text: hintText,
        text: settings.get_string(key),
        track_hover: true,
        can_focus: true,
    });

    inputText.clutter_text.connect('activate', actor => {
        getInput = actor.get_text();
        settings.set_string(key, getInput);
    });
    menuItem.connect('notify::active', () => inputText.grab_key_focus());

    menuItem.add_child(new St.Label({ text: label, y_align: Clutter.ActorAlign.CENTER }));
    menuItem.add_child(inputText);
    
    if (permenentHint)
        menuItem.add_child(new St.Label({ text: permenentHint, y_align: Clutter.ActorAlign.CENTER }));

    return menuItem;
};

export default createActor;
