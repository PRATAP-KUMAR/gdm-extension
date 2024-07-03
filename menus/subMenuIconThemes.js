
import Gio from 'gi://Gio';
import St from 'gi://St';
import updateOrnament from '../utils/updateOrnament.js';
import * as AnimationUtils from 'resource:///org/gnome/shell/misc/animationUtils.js';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import GNOME_SHELL_VERSION from '../utils/shellVersion.js';
import GetIconThemes from './getIconThemes.js';

const DESKTOP_SCHEMA = 'org.gnome.desktop.interface';

const dconfDesktopSettings = new Gio.Settings({ schema_id: DESKTOP_SCHEMA });

const subMenuIconThemes = (gdmExtension) => {
    gdmExtension._subMenuMenuItemIconThemes = new PopupMenu.PopupSubMenuMenuItem('Icon Theme', false);
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

            iconThemeNameItem.connect('key-focus-in', () => {
                AnimationUtils.ensureActorVisibleInScrollView(scrollView, iconThemeNameItem);
            });

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

export default subMenuIconThemes;