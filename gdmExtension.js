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

import createActor from './utils/createActor.js';
import Slider from './utils/slider.js';

import GetFonts from './menus/getFonts.js';
import GetIcons from './menus/getIcons.js';
import GetThemes from './menus/getThemes.js';

import updateOrnament from './utils/updateOrnament.js';

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

import GetBackgrounds from './menus/getBackgrounds.js';

import ConfirmDialog from './utils/confirmDialog.js';
import createMenuItem from './utils/createMenuItem.js';
import GetLogos from './menus/getLogos.js';

const THEME_DIRECTORIES = ['/usr/local/share/themes', '/usr/share/themes'];

const LOGIN_SCREEN_SCHEMA = 'org.gnome.login-screen';
const DESKTOP_SCHEMA = 'org.gnome.desktop.interface';

const dconfLoginSettings = new Gio.Settings({ schema_id: LOGIN_SCREEN_SCHEMA });
const dconfDesktopSettings = new Gio.Settings({ schema_id: DESKTOP_SCHEMA });

let subMenuItem = null;
let menuItem = null;

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

            const clockFormat = createMenuItem('Clock - Format', ['12h', '24h'], dconfDesktopSettings, 'clock-format')
            subMenuItem.menu.box.add_child(clockFormat);

            subMenuItem.menu.box.add_child(addShowBatteryPercentage());
            subMenuItem.menu.box.add_child(addDisableRestartButtons());
            subMenuItem.menu.box.add_child(addDisableUserList());
            subMenuItem.menu.box.add_child(addShowBannerMessage());

            subMenuItem.menu.box.add_child(createActor(dconfLoginSettings, 'Banner Message Text', 'Banner Message', 'banner-message-text'));

            menuItem = new PopupMenu.PopupBaseMenuItem();
            menuItem.add_child(new St.Label({ text: 'Logo (at bottom of login screen)', y_align: Clutter.ActorAlign.CENTER }));
            subMenuItem.menu.box.add_child(menuItem);

            this._subMenuLogos(subMenuItem);

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
                this._subMenuBackgrounds(n);
                n += 1;
                nMonitors -= 1;
            }
        }

        _createBackgroundPrefs(smItem, n) {

            smItem.menu.box.add_child(createActor(this._settings, 'Background Color/Gradient Start Color', '#123456', `background-color-${n}`, 'Must be a valid color'));
            smItem.menu.box.add_child(createActor(this._settings, 'Background End Color', '#456789', `background-gradient-end-color-${n}`, 'Must be a valid color or same as above color'));

            this._catchGradientDirection = [];
            const gradientDirectionMenuItem = createMenuItem('Gradient Direction', ['none', 'horizontal', 'vertical'], this._settings, `background-gradient-direction-${n}`, this._catchGradientDirection)
            smItem.menu.box.add_child(gradientDirectionMenuItem);

            const backgroundSizeMenuItem = createMenuItem('Background size', ['center', 'cover', 'contain'], this._settings, `background-size-${n}`);
            smItem.menu.box.add_child(backgroundSizeMenuItem);

            // Blur Brightness
            menuItem = new PopupMenu.PopupBaseMenuItem();
            menuItem.add_child(new St.Label({ text: 'Blur Brightness 0 to 1', y_align: Clutter.ActorAlign.CENTER }));
            smItem.menu.box.add_child(menuItem);

            smItem.menu.box.add_child(new Slider(this._settings, `blur-brightness-${n}`));
            //

            // Blur Sigma
            menuItem = new PopupMenu.PopupBaseMenuItem();
            menuItem.add_child(new St.Label({ text: 'Blur Sigma 0 to 100', y_align: Clutter.ActorAlign.CENTER }));
            smItem.menu.box.add_child(menuItem);

            smItem.menu.box.add_child(new Slider(this._settings, `blur-sigma-${n}`));
            //

            menuItem = new PopupMenu.PopupBaseMenuItem();
            menuItem.add_child(new St.Label({ text: 'Backgrounds', y_align: Clutter.ActorAlign.CENTER }));
            smItem.menu.box.add_child(menuItem);
        }

        _subMenuIcons() {
            subMenuItem = new PopupMenu.PopupSubMenuMenuItem('Icon Themes', false);
            this.menu.addMenuItem(subMenuItem);
            this._getIcons(subMenuItem);
        }

        _subMenuLogos(subMenuItem) {
            this.menu.addMenuItem(subMenuItem);
            this._getLogos(subMenuItem);
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

        _subMenuThemes() {
            subMenuItem = new PopupMenu.PopupSubMenuMenuItem('Shell Themes', false);
            this.menu.addMenuItem(subMenuItem);
            this._getThemes(subMenuItem);
        }

        _subMenuFonts() {
            subMenuItem = new PopupMenu.PopupSubMenuMenuItem('Fonts', false);
            this.menu.addMenuItem(subMenuItem);
            this._getFonts(subMenuItem);
        }

        _subMenuBackgrounds(n) {
            subMenuItem = new PopupMenu.PopupSubMenuMenuItem(`Monitor - ${n}`, false);
            this.menu.addMenuItem(subMenuItem);
            this._createBackgroundPrefs(subMenuItem, n);
            this._getBackgrounds(subMenuItem, n);
        }

        async _getThemes(item) {
            const scrollView = new St.ScrollView();
            const section = new PopupMenu.PopupMenuSection();

            if (GNOME_SHELL_VERSION === 45)
                scrollView.add_actor(section.actor);
            else
                scrollView.add_child(section.actor);

            item.menu.box.add_child(scrollView);

            const object = new GetThemes();
            const shellThemes = await object._collectThemes();

            const collectShellThemes = themes => {
                let _items = [];

                // Add Default Theme Item
                const shellDefaultThemeItem = new PopupMenu.PopupMenuItem('Default');
                shellDefaultThemeItem.connect('key-focus-in', () => {
                    AnimationUtils.ensureActorVisibleInScrollView(scrollView, shellDefaultThemeItem);
                });
                shellDefaultThemeItem.connect('activate', () => {
                    Main.setThemeStylesheet(null);
                    Main.loadTheme();
                    this._settings.set_string('shell-theme', '');
                    updateOrnament(shellThemeItems, 'Default');
                });
                _items.push(shellDefaultThemeItem);
                section.addMenuItem(shellDefaultThemeItem);
                //

                themes.forEach(themeName => {
                    const shellThemeNameItem = new PopupMenu.PopupMenuItem(themeName);
                    _items.push(shellThemeNameItem);

                    section.addMenuItem(shellThemeNameItem);

                    shellThemeNameItem.connect('key-focus-in', () => {
                        AnimationUtils.ensureActorVisibleInScrollView(scrollView, shellThemeNameItem);
                    });

                    shellThemeNameItem.connect('activate', () => {
                        let styleSheet = null;
                        const stylesheetPaths = THEME_DIRECTORIES
                            .map(dir => `${dir}/${themeName}/gnome-shell/gnome-shell.css`);

                        styleSheet = stylesheetPaths.find(path => {
                            let file = Gio.file_new_for_path(path);
                            return file.query_exists(null);
                        });

                        if (styleSheet) {
                            this._settings.set_string('shell-theme', themeName);
                            updateOrnament(shellThemeItems, themeName);
                        } else {
                            this._settings.set_string('shell-theme', '');
                            updateOrnament(shellThemeItems, 'Default');
                        }

                        Main.setThemeStylesheet(styleSheet);
                        Main.loadTheme();
                    });
                });
                return _items;
            };

            const shellThemeItems = collectShellThemes(shellThemes);
            const text = this._settings.get_string('shell-theme') || 'Default';
            updateOrnament(shellThemeItems, text);
        }

        async _getIcons(item) {

            const scrollView = new St.ScrollView();
            const section = new PopupMenu.PopupMenuSection();

            if (GNOME_SHELL_VERSION === 45)
                scrollView.add_actor(section.actor);
            else
                scrollView.add_child(section.actor);

            item.menu.box.add_child(scrollView);

            const object = new GetIcons();
            const ICONS = await object._collectIcons();

            const collectIcons = icons => {
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

            const iconItems = collectIcons(ICONS);
            const text = dconfDesktopSettings.get_string('icon-theme');
            updateOrnament(iconItems, text);
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

        async _getBackgrounds(item, n) {
            const scrollView = new St.ScrollView();
            const section = new PopupMenu.PopupMenuSection();

            if (GNOME_SHELL_VERSION === 45)
                scrollView.add_actor(section.actor);
            else
                scrollView.add_child(section.actor);

            item.menu.box.add_child(scrollView);

            const object = new GetBackgrounds();
            const BACKGROUNDS = await object._collectBackgrounds();

            const collectBackgrounds = backgrounds => {
                let _items = [];
                backgrounds.forEach(backgroundName => {
                    const backgroundNameItem = new PopupMenu.PopupMenuItem(backgroundName);
                    _items.push(backgroundNameItem);

                    section.addMenuItem(backgroundNameItem);

                    backgroundNameItem.connect('key-focus-in', () => {
                        AnimationUtils.ensureActorVisibleInScrollView(scrollView, backgroundNameItem);
                    });

                    backgroundNameItem.connect('activate', () => {
                        this._settings.set_string(`background-image-path-${n}`, backgroundName);
                        this._settings.set_string(`background-gradient-direction-${n}`, 'none')
                        updateOrnament(backgroundItems, backgroundName);
                        updateOrnament(this._catchGradientDirection, 'none');
                    });
                });
                return _items;
            };

            const backgroundItems = collectBackgrounds(BACKGROUNDS);
            const text = this._settings.get_string(`background-image-path-${n}`)
            updateOrnament(backgroundItems, text);
        }
    }
);

export default GdmExtension;
