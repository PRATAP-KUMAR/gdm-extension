// import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
const PopupMenu = imports.ui.popupMenu;

var updateOrnament = (items, text) => {
    items.forEach(item => {
        if (item.label.get_text() === text)
            item.setOrnament(PopupMenu.Ornament.DOT);
        else
            item.setOrnament(PopupMenu.Ornament.NONE);
    });
};
