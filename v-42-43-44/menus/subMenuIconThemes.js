
// import Gio from 'gi://Gio';
// import St from 'gi://St';

const { Gio, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

// import updateOrnament from '../utils/updateOrnament.js';
const { updateOrnament } = Me.imports.utils.updateOrnament;

// import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
const PopupMenu = imports.ui.popupMenu;

// import GNOME_SHELL_VERSION from '../utils/shellVersion.js';
const GNOME_SHELL_VERSION = Me.imports.utils.shellVersion;

// import GetIconThemes from '../getNamesAsync/getIconThemes.js';
const {GetIconThemes} = Me.imports.getNamesAsync.getIconThemes;

const DESKTOP_SCHEMA = 'org.gnome.desktop.interface';

const dconfDesktopSettings = new Gio.Settings({ schema_id: DESKTOP_SCHEMA });

var subMenuIconThemes = (gdmExtension) => {
    gdmExtension._subMenuMenuItemIconThemes = new PopupMenu.PopupSubMenuMenuItem('Icon Themes', false);
    setIconThemes(gdmExtension._subMenuMenuItemIconThemes)

    return gdmExtension._subMenuMenuItemIconThemes;
}

const setIconThemes = async (item) => {
    const scrollView = new St.ScrollView();
    const section = new PopupMenu.PopupMenuSection();

    if (GNOME_SHELL_VERSION === 45)
        scrollView.add_actor(section.actor);
    else
        scrollView.add_child(section.actor);

    item.menu.box.add_child(scrollView);

    const object = new GetIconThemes();
    const ICONS = await object._collectIconThemes();

    const collectIconThemes = icons => {
        let _items = [];
        icons.forEach(iconThemeName => {
            const iconThemeNameItem = new PopupMenu.PopupMenuItem(iconThemeName);
            _items.push(iconThemeNameItem);

            section.addMenuItem(iconThemeNameItem);

            iconThemeNameItem.connect('activate', () => {
                dconfDesktopSettings.set_string('icon-theme', iconThemeName);
                updateOrnament(iconItems, iconThemeName);
            });
        });
        return _items;
    };

    const iconItems = collectIconThemes(ICONS);
    const text = dconfDesktopSettings.get_string('icon-theme');
    updateOrnament(iconItems, text);
}
