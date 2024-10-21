// import Gio from 'gi://Gio';
// import St from 'gi://St';

const {Gio, St} = imports.gi;

// import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

// import updateOrnament from '../utils/updateOrnament.js';
const {updateOrnament} = Me.imports.utils.updateOrnament;

// import GNOME_SHELL_VERSION from '../utils/shellVersion.js';
const {GNOME_SHELL_VERSION} = Me.imports.utils.shellVersion;

// import GetFonts from '../getNamesAsync/getFonts.js';
const {GetFonts} = Me.imports.getNamesAsync.getFonts;

const DESKTOP_SCHEMA = 'org.gnome.desktop.interface';
const dconfDesktopSettings = new Gio.Settings({ schema_id: DESKTOP_SCHEMA });

var subMenuFonts = (gdmExtension) => {
    gdmExtension._subMenuMenuItemFonts = new PopupMenu.PopupSubMenuMenuItem('Fonts', false);
    setFonts(gdmExtension._subMenuMenuItemFonts)

    return gdmExtension._subMenuMenuItemFonts;
}

const setFonts = async (item) => {
    const scrollView = new St.ScrollView();
    const section = new PopupMenu.PopupMenuSection();

    if (GNOME_SHELL_VERSION === 42)
        scrollView.add_actor(section.actor);
    else
        scrollView.add_child(section.actor);

    item.menu.box.add_child(scrollView);

    const object = new GetFonts();
    const FONTS = await object._collectFonts();

    const colletFonts = fonts => {
        let _items = [];
        fonts.forEach(fontName => {
            const fontNameItem = new PopupMenu.PopupMenuItem(fontName);
            _items.push(fontNameItem);

            section.addMenuItem(fontNameItem);

            fontNameItem.connect('activate', () => {
                dconfDesktopSettings.set_string('font-name', `${fontName} 11`);
                updateOrnament(fontItems, fontName);
            });
        });
        return _items;
    };

    const fontItems = colletFonts(FONTS);
    const text = dconfDesktopSettings.get_string('font-name').split(' ').slice(0, -1).join(' ');
    updateOrnament(fontItems, text);
}
