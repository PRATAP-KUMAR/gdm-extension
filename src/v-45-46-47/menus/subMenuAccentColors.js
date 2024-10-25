import Gio from 'gi://Gio';
import St from 'gi://St';

import * as AnimationUtils from 'resource:///org/gnome/shell/misc/animationUtils.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import updateOrnament from '../utils/updateOrnament.js';
import GNOME_SHELL_VERSION from '../utils/shellVersion.js';

const DESKTOP_SCHEMA = 'org.gnome.desktop.interface';
const dconfDesktopSettings = new Gio.Settings({ schema_id: DESKTOP_SCHEMA });

const subMenuAccentColors = (gdmExtension) => {
    gdmExtension._subMenuMenuItemAccentColors = new PopupMenu.PopupSubMenuMenuItem('Accent Colors', false);
    setAccentColors(gdmExtension._subMenuMenuItemAccentColors);

    return gdmExtension._subMenuMenuItemAccentColors;
}

const setAccentColors = async (item) => {
    const scrollView = new St.ScrollView();
    const section = new PopupMenu.PopupMenuSection();

    if (GNOME_SHELL_VERSION === 45)
        scrollView.add_actor(section.actor);
    else
        scrollView.add_child(section.actor);

    item.menu.box.add_child(scrollView);

    // const ACCENT_COLORS = ["blue", "teal", "green", "yellow", "orange", "red", "pink", "purple", "slate"]

    const ACCENT_COLORS =
        new Gio.Settings({ schema_id: "org.gnome.desktop.interface" })
            .get_range('accent-color')
            .print(true)
            .match(/\[[^\][]*]/)[0]
            .replace(/[\]\[\s']/g, '')
            .split(',') || []

    let _colors = [];
    ACCENT_COLORS.forEach(color => {
        const accentColorItem = new PopupMenu.PopupMenuItem(color);
        _colors.push(accentColorItem);

        section.addMenuItem(accentColorItem);

        accentColorItem.connect('key-focus-in', () => {
            AnimationUtils.ensureActorVisibleInScrollView(scrollView, accentColorItem);
        });

        accentColorItem.connect('activate', () => {
            dconfDesktopSettings.set_string('accent-color', color);
            updateOrnament(_colors, color);
        });
    });

    const accent_color = dconfDesktopSettings.get_string('accent-color');
    updateOrnament(_colors, accent_color);

    return _colors;
};

export default subMenuAccentColors;
