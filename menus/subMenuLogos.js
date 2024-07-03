import Gio from 'gi://Gio';
import St from 'gi://St';
import updateOrnament from '../utils/updateOrnament.js';

import * as AnimationUtils from 'resource:///org/gnome/shell/misc/animationUtils.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import GNOME_SHELL_VERSION from '../utils/shellVersion.js';
import GetLogos from '../getNamesAsync/getLogos.js';

const LOGIN_SCREEN_SCHEMA = 'org.gnome.login-screen';
const dconfLoginSettings = new Gio.Settings({ schema_id: LOGIN_SCREEN_SCHEMA });

const subMenuLogos = (gdmExtension) => {
    gdmExtension._subMenuMenuItemLogos = new PopupMenu.PopupSubMenuMenuItem('Logo (small icon at bottom of login screen)', false);
    setLogos(gdmExtension._subMenuMenuItemLogos)

    return gdmExtension._subMenuMenuItemLogos;
}

const setLogos = async (item) => {
    const scrollView = new St.ScrollView();
    const section = new PopupMenu.PopupMenuSection();

    if (GNOME_SHELL_VERSION === 45)
        scrollView.add_actor(section.actor);
    else
        scrollView.add_child(section.actor);

    item.menu.box.add_child(scrollView);

    const object = new GetLogos();
    const LOGOS = await object._collectLogos();

    const collectLogos = logos => {
        let _items = [];

        // Add None Item to not to show the logo
        const logoNoneItem = new PopupMenu.PopupMenuItem('None');
        logoNoneItem.connect('key-focus-in', () => {
            AnimationUtils.ensureActorVisibleInScrollView(scrollView, logoNoneItem);
        });
        logoNoneItem.connect('activate', () => {
            dconfLoginSettings.set_string('logo', '');
            updateOrnament(logoItems, 'None');
        });
        _items.push(logoNoneItem);
        section.addMenuItem(logoNoneItem);
        //

        logos.forEach(logoName => {
            const logoNameItem = new PopupMenu.PopupMenuItem(logoName);
            _items.push(logoNameItem);

            section.addMenuItem(logoNameItem);

            logoNameItem.connect('key-focus-in', () => {
                AnimationUtils.ensureActorVisibleInScrollView(scrollView, logoNameItem);
            });

            logoNameItem.connect('activate', () => {
                dconfLoginSettings.set_string('logo', logoName);
                updateOrnament(logoItems, logoName);
            });
        });
        return _items;
    };

    const logoItems = collectLogos(LOGOS);
    const text = dconfLoginSettings.get_string('logo') || 'None'
    updateOrnament(logoItems, text);
}

export default subMenuLogos;