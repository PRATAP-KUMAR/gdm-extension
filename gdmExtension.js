import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as config from 'resource:///org/gnome/shell/misc/config.js';

import * as AnimationUtils from 'resource:///org/gnome/shell/misc/animationUtils.js';

import GetFonts from './menus/getFonts.js';

import updateOrnament from './utils/updateOrnament.js';

import GNOME_SHELL_VERSION from './utils/shellVersion.js';

import GetLogos from './menus/getLogos.js';

import subMenuSystemSettings from './menus/subMenuSystemSettings.js';
import subMenuMonitorBackground from './menus/subMenuMonitorBackgrounds.js';

import hideExtensionButton from './buttons/hideExtensionButton.js';
import subMenuIconThemes from './menus/subMenuIconThemes.js';
import subMenuShellThemes from './menus/subMenuShellThemes.js';

const LOGIN_SCREEN_SCHEMA = 'org.gnome.login-screen';
const DESKTOP_SCHEMA = 'org.gnome.desktop.interface';

const dconfLoginSettings = new Gio.Settings({ schema_id: LOGIN_SCREEN_SCHEMA });
const dconfDesktopSettings = new Gio.Settings({ schema_id: DESKTOP_SCHEMA });

let subMenuItem = null;

const GdmExtension = GObject.registerClass(
    class GdmExtension extends PanelMenu.Button {
        _init(settings) {
            super._init(0.0, 'GDM Settings Icon Indicator');
            this._settings = settings;

            this._box = new St.BoxLayout();
            this.add_child(this._box);

            this._box.add_child(new St.Icon({
                icon_name: 'preferences-system-symbolic',
                style_class: 'system-status-icon',
            }));

            this._customLabel = `${GLib.get_os_info('PRETTY_NAME')} | ${config.PACKAGE_NAME.toUpperCase()} ${config.PACKAGE_VERSION}`;
            this._box.add_child(new St.Label({ text: this._customLabel, y_align: Clutter.ActorAlign.CENTER }));

            this._subMenuMonitorBackgrounds();  // Monitor background settings
            
            this._subMenuFonts();
            this._subMenuLogos();
            
            this.menu.addMenuItem(subMenuIconThemes(this)); // Icon Themes
            this.menu.addMenuItem(subMenuShellThemes(this)); // Shell Themes
            this.menu.addMenuItem(subMenuSystemSettings(this)); // System Settings Menu
            this.menu.addMenuItem(hideExtensionButton(this)); // Extension Hide Button
        }

        _subMenuMonitorBackgrounds() {
            let nMonitors = Main.layoutManager.monitors.length;
            nMonitors = nMonitors > 4 ? 4 : nMonitors;
            let n = 1;
            while (nMonitors > 0) {
                this.menu.addMenuItem(subMenuMonitorBackground(this, n)); // Add per Monitor background settings
                n += 1;
                nMonitors -= 1;
            }
        }

        _subMenuLogos() {
            subMenuItem = new PopupMenu.PopupSubMenuMenuItem('Logo (small icon at bottom of login screen)', false);
            this.menu.addMenuItem(subMenuItem);
            this._getLogos(subMenuItem);
        }

        _subMenuFonts() {
            subMenuItem = new PopupMenu.PopupSubMenuMenuItem('Fonts', false);
            this.menu.addMenuItem(subMenuItem);
            this._getFonts(subMenuItem);
        }

        async _getLogos(item) {
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

        async _getFonts(item) {
            const scrollView = new St.ScrollView();
            const section = new PopupMenu.PopupMenuSection();

            if (GNOME_SHELL_VERSION === 45)
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

                    fontNameItem.connect('key-focus-in', () => {
                        AnimationUtils.ensureActorVisibleInScrollView(scrollView, fontNameItem);
                    });

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
    }
);

export default GdmExtension;
