import St from 'gi://St';
import Gio from 'gi://Gio';
import Clutter from 'gi://Clutter';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const CreateActor = (SCHEMA_ID, label, hintText, key, permenentHint = null) => {
    const settings = new Gio.Settings({schema_id: SCHEMA_ID});
    const menuItem = new PopupMenu.PopupBaseMenuItem({
        reactive: false,
    });

    const inputText = new St.Entry({
        hint_text: hintText,
        text: settings.get_string(key),
        track_hover: true,
        can_focus: true,
    });

    inputText.clutter_text.connect('activate', actor => {
        settings.set_string(key, actor.get_text());
    });

    menuItem.add_actor(new St.Label({text: label, y_align: Clutter.ActorAlign.CENTER}));
    menuItem.add_actor(inputText);
    if (permenentHint)
        menuItem.add_actor(new St.Label({text: permenentHint, y_align: Clutter.ActorAlign.CENTER}));

    return menuItem;
};

export default CreateActor;
