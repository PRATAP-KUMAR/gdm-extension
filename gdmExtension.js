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

import ConfirmDialog from './confirmDialog.js';
import CreateActor from './createActor.js';
import GetFonts from './utils/getFonts.js';
import GetIcons from './utils/getIcons.js';
import GetThemes from './utils/getThemes.js';
import GNOME_SHELL_VERSION from './utils/shellVersion.js';

import {
    addTapToClick,
    addShowBannerMessage,
    addClockShowDate,
    addClockShowSeconds,
    addClockShowWeekday,
    addShowBatteryPercentage,
    addDisableRestartButtons,
    addDisableUserList
} from './systemSettings.js';

const THEME_DIRECTORIES = ['/usr/local/share/themes', '/usr/share/themes'];
const LOGIN_SCREEN_SCHEMA = 'org.gnome.login-screen';
const INTERFACE_SCHEMA = 'org.gnome.desktop.interface';
const EXTENSION_SCHEMA = 'org.gnome.shell.extensions.gdm-extension';
const DESKTOP_INTERFACE_SCHEMA = 'org.gnome.desktop.interface';

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
            this._box.add_child(new St.Label({text: this._customLabel, y_align: Clutter.ActorAlign.CENTER}));

            this._confirmDialog = {
                subject: ('title', 'Hide GDM Settings Icon?'),
                description: 'Are you sure to Hide the preferences icon?\n' +
                    'If you hide it now, you can not access the settings any more for now.\n\n' +
                    'You can show it later from dconf/gsettings key as mentioned in the README of this extensions repository and can change the settings again',
                confirmButtons: [
                    {
                        signal: 'cancel',
                        label: ('button', 'Cancel'),
                        key: Clutter.KEY_Escape,
                    },
                    {
                        signal: 'proceed',
                        label: ('button', 'Hide'),
                        default: true,
                    },
                ],
            };

            this._subMenuBackground();
            this._subMenuThemes();
            this._subMenuIcons();
            this._subMenuFonts();
            this._subMenuSystemSettings();

            const hideExtensionMenuItem = new PopupMenu.PopupMenuItem('Hide Extension Settings Button from Topbar');
            hideExtensionMenuItem.connect('activate', () => this._openModal(this._settings));
            this.menu.addMenuItem(hideExtensionMenuItem);
        }

        _subMenuSystemSettings() {
            subMenuItem = new PopupMenu.PopupSubMenuMenuItem('System Settings', false);

            subMenuItem.menu.box.add_child(addTapToClick());
            subMenuItem.menu.box.add_child(addClockShowDate());
            subMenuItem.menu.box.add_child(addClockShowSeconds());
            subMenuItem.menu.box.add_child(addClockShowWeekday());
            subMenuItem.menu.box.add_child(addShowBatteryPercentage());
            subMenuItem.menu.box.add_child(addDisableRestartButtons());
            subMenuItem.menu.box.add_child(addDisableUserList());
            subMenuItem.menu.box.add_child(addShowBannerMessage());

            subMenuItem.menu.box.add_child(CreateActor(LOGIN_SCREEN_SCHEMA, 'Banner Message Text', 'Banner Message', 'banner-message-text'));
            subMenuItem.menu.box.add_child(CreateActor(LOGIN_SCREEN_SCHEMA, 'Logo', '/usr/share/pixmaps/logo.svg', 'logo'));
            subMenuItem.menu.box.add_child(CreateActor(INTERFACE_SCHEMA, 'clock format', '12h or 24h', 'clock-format', 'must be one of [12h, 24h]'));

            this.menu.addMenuItem(subMenuItem);
        }

        _openModal(settings) {
            let modal = new ConfirmDialog(this._confirmDialog);

            modal.connect('proceed', () => {
                settings.set_boolean('hide-gdm-settings-icon', true);
            });

            modal.open();
        }

        _subMenuBackground() {
            let nMonitors = Main.layoutManager.monitors.length;
            nMonitors = nMonitors > 4 ? 4 : nMonitors;
            let n = 1;
            while (nMonitors > 0) {
                subMenuItem = new PopupMenu.PopupSubMenuMenuItem(`Monitor - ${n}`, false);
                this.menu.addMenuItem(subMenuItem);
                this._createBackgroundPrefs(subMenuItem, n);
                n += 1;
                nMonitors -= 1;
            }
        }

        _createBackgroundPrefs(smItem, n) {
            smItem.menu.box.add_child(CreateActor(EXTENSION_SCHEMA, 'Background Color/Gradient Start Color', '#123456', `background-color-${n}`, 'Must be a valid color'));
            smItem.menu.box.add_child(CreateActor(EXTENSION_SCHEMA, 'Background End Color', '#456789', `background-gradient-end-color-${n}`, 'Must be a valid color or same as above color'));
            smItem.menu.box.add_child(CreateActor(EXTENSION_SCHEMA, 'Gradient Direction', 'none, horizontal, vertical', `background-gradient-direction-${n}`, 'Must be one of [none, horizontal, vertical]'));
            smItem.menu.box.add_child(CreateActor(EXTENSION_SCHEMA, 'Background Image Path', '/usr/local/share/backgrounds/wp.jpg', `background-image-path-${n}`, 'Make sure gadient-direction is set to "none"\nif you provide valid image path here'));
            smItem.menu.box.add_child(CreateActor(EXTENSION_SCHEMA, 'Background Size', 'cover', `background-size-${n}`, 'Must be one of [center, cover, contain]'));
            smItem.menu.box.add_child(CreateActor(EXTENSION_SCHEMA, 'Blur Brightness', '0.65', `blur-brightness-${n}`, 'must be between 0 to 1, ex: 0.25, 0.4, 0.65, 0.8'));
            smItem.menu.box.add_child(CreateActor(EXTENSION_SCHEMA, 'Blur Sigma', '45', `blur-sigma-${n}`, 'must be >= 0'));
        }

        _subMenuIcons() {
            subMenuItem = new PopupMenu.PopupSubMenuMenuItem('Icon Themes', false);
            this.menu.addMenuItem(subMenuItem);
            this._getIcons(subMenuItem);
        }

        _subMenuThemes() {
            subMenuItem = new PopupMenu.PopupSubMenuMenuItem('Shell Themes', false);
            this.menu.addMenuItem(subMenuItem);
            this._getThemes(subMenuItem);
        }

        _subMenuFonts() {
            subMenuItem = new PopupMenu.PopupSubMenuMenuItem('Select Font', false);
            this.menu.addMenuItem(subMenuItem);
            this._getFonts(subMenuItem);
        }

        async _getFonts(item) {
            const scrollView = new St.ScrollView();
            const section = new PopupMenu.PopupMenuSection();

            if (GNOME_SHELL_VERSION === 45)
                scrollView.add_actor(section.actor);
            else
                scrollView.add_child(section.actor);

            const object = new GetFonts();
            const fonts = await object._collectFonts();
            fonts.forEach(font => {
                const fontNameItem = new PopupMenu.PopupMenuItem(font);
                fontNameItem.connect('key-focus-in', () => {
                    AnimationUtils.ensureActorVisibleInScrollView(scrollView, fontNameItem);
                });
                fontNameItem.connect('activate', () => {
                    const dconf = new Gio.Settings({schema_id: DESKTOP_INTERFACE_SCHEMA});
                    dconf.set_string('font-name', `${font} 11`);
                });
                section.addMenuItem(fontNameItem);
            });
            item.menu.box.add_child(scrollView);
        }

        async _getThemes(item) {
            const scrollView = new St.ScrollView();
            const section = new PopupMenu.PopupMenuSection();

            if (GNOME_SHELL_VERSION === 45)
                scrollView.add_actor(section.actor);
            else
                scrollView.add_child(section.actor);

            // Add Default Theme Item
            const shellDefaultThemeItem = new PopupMenu.PopupMenuItem('Default');
            shellDefaultThemeItem.connect('key-focus-in', () => {
                AnimationUtils.ensureActorVisibleInScrollView(scrollView, shellDefaultThemeItem);
            });
            shellDefaultThemeItem.connect('activate', () => {
                Main.setThemeStylesheet(null);
                Main.loadTheme();
            });
            section.addMenuItem(shellDefaultThemeItem);
            //

            const object = new GetThemes();
            const shellThemes = await object._collectThemes();
            shellThemes.forEach(themeName => {
                const fontNameItem = new PopupMenu.PopupMenuItem(themeName);
                fontNameItem.connect('key-focus-in', () => {
                    AnimationUtils.ensureActorVisibleInScrollView(scrollView, fontNameItem);
                });
                fontNameItem.connect('activate', () => {
                    let styleSheet = null;
                    const stylesheetPaths = THEME_DIRECTORIES
                        .map(dir => `${dir}/${themeName}/gnome-shell/gnome-shell.css`);

                    styleSheet = stylesheetPaths.find(path => {
                        let file = Gio.file_new_for_path(path);
                        return file.query_exists(null);
                    });

                    if (styleSheet)
                        this._settings.set_string('shell-theme', themeName);
                    else
                        this._settings.set_string('shell-theme', '');

                    Main.setThemeStylesheet(styleSheet);
                    Main.loadTheme();
                });
                section.addMenuItem(fontNameItem);
            });
            item.menu.box.add_child(scrollView);
        }

        async _getIcons(item) {
            const settings = new Gio.Settings({schema_id: INTERFACE_SCHEMA});
            const key = 'icon-theme';

            const scrollView = new St.ScrollView();
            const section = new PopupMenu.PopupMenuSection();

            if (GNOME_SHELL_VERSION === 45)
                scrollView.add_actor(section.actor);
            else
                scrollView.add_child(section.actor);

            const object = new GetIcons();
            const themes = await object._collectIcons();
            themes.forEach(themeName => {
                const iconThemeNameItem = new PopupMenu.PopupMenuItem(themeName);
                iconThemeNameItem.connect('key-focus-in', () => {
                    AnimationUtils.ensureActorVisibleInScrollView(scrollView, iconThemeNameItem);
                });
                iconThemeNameItem.connect('activate', () => settings.set_string(key, themeName));
                section.addMenuItem(iconThemeNameItem);
            });
            item.menu.box.add_child(scrollView);
        }
    }
);

export default GdmExtension;
