import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as config from 'resource:///org/gnome/shell/misc/config.js';

import ConfirmDialog from './confirmDialog.js';
import GetThemes from './getThemes.js';
import GetIcons from './getIcons.js';
import CreateActor from './createActor.js';

import {
    addTapToClick,
    addShowBannerMessage,
    addClockShowDate,
    addClockShowSeconds,
    addClockShowWeekday,
    addDisableRestartButtons,
    addDisableUserList
} from './systemSettings.js';


const THEME_DIRECTORIES = ['/usr/local/share/themes', '/usr/share/themes'];
const LOGIN_SCREEN_SCHEMA = 'org.gnome.login-screen';

let subMenuItem = null;

const GdmExtensionSettingsButton = GObject.registerClass(
    class GdmExtensionSettingsButton extends PanelMenu.Button {
        _init(settings) {
            super._init(0.0, 'GDM Settings Icon Indicator');
            this._settings = settings;

            this._warningMessage = false;

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
            this._subMenuSystemSettings();

            const menuItem = new PopupMenu.PopupBaseMenuItem();
            const button = new St.Button({
                label: 'Hide Extension Settings Button from Topbar',
            });
            button.connect('clicked', () => this._openModal(this._settings));
            menuItem.add_actor(button);
            this.menu.addMenuItem(menuItem);
        }

        _subMenuSystemSettings() {
            subMenuItem = new PopupMenu.PopupSubMenuMenuItem('System Settings', true);

            subMenuItem.menu.box.add_child(addTapToClick());
            subMenuItem.menu.box.add_child(addClockShowDate());
            subMenuItem.menu.box.add_child(addClockShowSeconds());
            subMenuItem.menu.box.add_child(addClockShowWeekday());
            subMenuItem.menu.box.add_child(addDisableRestartButtons());
            subMenuItem.menu.box.add_child(addDisableUserList());
            subMenuItem.menu.box.add_child(addShowBannerMessage());

            subMenuItem.menu.box.add_child(CreateActor(LOGIN_SCREEN_SCHEMA, 'Banner Message Text', 'Banner Message', 'banner-message-text'));
            subMenuItem.menu.box.add_child(CreateActor(LOGIN_SCREEN_SCHEMA, 'Logo', '/usr/share/pixmaps/logo.svg', 'logo'));

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
            subMenuItem = new PopupMenu.PopupSubMenuMenuItem('Background', true);
            this.menu.addMenuItem(subMenuItem);
            this._createBackgroundPrefs(subMenuItem);
            subMenuItem.menu.connect('open-state-changed', () => {
                if (this._warningMessage === false) {
                    this._warningPopup();
                    this._warningMessage = true;
                }
            });
        }

        _createBackgroundPrefs(item) {
            const SCHEMA_ID = 'org.gnome.shell.extensions.gdm-extension';
            item.menu.box.add_child(CreateActor(SCHEMA_ID, 'Background Color/Gradient Start Color', '#123456', 'background-color', 'Must be a valid color'));
            item.menu.box.add_child(CreateActor(SCHEMA_ID, 'Background End Color', '#456789', 'background-gradient-end-color', 'Must be a valid color or same as above color'));
            item.menu.box.add_child(CreateActor(SCHEMA_ID, 'Gradient Direction', 'none, horizontal, vertical', 'background-gradient-direction', 'Must be one of [horizontal, vertical]'));
            item.menu.box.add_child(CreateActor(SCHEMA_ID, 'Background Image Path', '/usr/local/share/backgrounds/wp.jpg', 'background-image-path'));
            item.menu.box.add_child(CreateActor(SCHEMA_ID, 'Background Size', 'none, cover, contain', 'background-size', 'Must be one of [center, cover, contain]'));
        }

        _subMenuIcons() {
            subMenuItem = new PopupMenu.PopupSubMenuMenuItem('Icon Themes', true);
            this.menu.addMenuItem(subMenuItem);
            this.getIcons(subMenuItem);
        }

        _subMenuThemes() {
            subMenuItem = new PopupMenu.PopupSubMenuMenuItem('Shell Themes', true);
            const button = new St.Button({
                style_class: 'datemenu-today-button',
                can_focus: true,
                reactive: true,
                label: 'Default',
            });
            subMenuItem.menu.box.add_child(button);
            button.connect('clicked', () => {
                Main.setThemeStylesheet(null);
                Main.loadTheme();
            });
            this.menu.addMenuItem(subMenuItem);
            this.getThemes(subMenuItem);
        }

        async getThemes(item, array = []) {
            await new GetThemes(array)._collectThemes();
            array.forEach(directory => {
                const button = new St.Button({
                    style_class: 'datemenu-today-button',
                    can_focus: true,
                    reactive: true,
                    label: directory,
                });
                button.connect('clicked', () => {
                    let styleSheet = null;
                    const stylesheetPaths = THEME_DIRECTORIES
                        .map(dir => `${dir}/${button.label}/gnome-shell/gnome-shell.css`);

                    styleSheet = stylesheetPaths.find(path => {
                        let file = Gio.file_new_for_path(path);
                        return file.query_exists(null);
                    });

                    if (styleSheet)
                        this._settings.set_string('shell-theme', button.label);
                    else
                        this._settings.set_string('shell-theme', '');

                    Main.setThemeStylesheet(styleSheet);
                    Main.loadTheme();
                });
                item.menu.box.add_child(button);
            });
        }

        async getIcons(item, array = []) {
            const settings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
            const key = 'icon-theme';

            await new GetIcons(array)._collectIconThemes();
            array.forEach(d => {
                const button = new St.Button({
                    style_class: 'datemenu-today-button',
                    can_focus: true,
                    reactive: true,
                    label: d,
                });
                button.connect('clicked', () => {
                    settings.set_string(key, button.label);
                    Meta.restart('', global.context);
                });
                item.menu.box.add_child(button);
            });
        }
    }
);

export default GdmExtensionSettingsButton;
