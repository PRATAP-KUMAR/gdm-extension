// import St from 'gi://St';
// import Clutter from 'gi://Clutter';

const { St, Clutter } = imports.gi;

// import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

// import updateOrnament from './updateOrnament.js';
const {updateOrnament} = Me.imports.utils.updateOrnament;

var createMenuItem = (title, keys, settings, dconfKey, catchArray = null) => {
    const menuItem = new PopupMenu.PopupBaseMenuItem();
    menuItem.add_child(new St.Label({ text: title, y_align: Clutter.ActorAlign.CENTER }))

    let _items = []
    keys.forEach(key => {
        const item = new PopupMenu.PopupMenuItem(key);
        _items.push(item);
        if (catchArray) {
            catchArray.push(item);
        }

        item.connect('activate', () => {
            settings.set_string(dconfKey, key)
            updateOrnament(_items, key)
        })
        menuItem.add_child(item);
    })

    updateOrnament(_items, settings.get_string(dconfKey));
    return menuItem;
}
