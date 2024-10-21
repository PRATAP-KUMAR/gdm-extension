import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as config from 'resource:///org/gnome/shell/misc/config.js';

import subMenuSystemSettings from './menus/subMenuSystemSettings.js';
import subMenuMonitorBackgrounds from './menus/subMenuMonitorBackgrounds.js';

import hideExtensionButton from './buttons/hideExtensionButton.js';
import subMenuIconThemes from './menus/subMenuIconThemes.js';
import subMenuShellThemes from './menus/subMenuShellThemes.js';
import subMenuLogos from './menus/subMenuLogos.js';
import subMenuFonts from './menus/subMenuFonts.js';

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

            const generateIconThemes = subMenuIconThemes(this);
            this.menu.addMenuItem(generateIconThemes); // Icon Themes
            
            const generateShellThemes = subMenuShellThemes(this);
            this.menu.addMenuItem(generateShellThemes); // Shell Themes

            const generateFonts = subMenuFonts(this);
            this.menu.addMenuItem(generateFonts); // Font Themes
            
            const generateSystemSettings = subMenuSystemSettings(this);
            this.menu.addMenuItem(generateSystemSettings); // System Settings Menu

            const generateLogos = subMenuLogos(this);
            this.menu.addMenuItem(generateLogos); // Logos

            const generateHideExtensionButton = hideExtensionButton(this);
            this.menu.addMenuItem(generateHideExtensionButton); // Extension Hide Button
        }

        _subMenuMonitorBackgrounds() {
            let nMonitors = Main.layoutManager.monitors.length;
            nMonitors = nMonitors > 4 ? 4 : nMonitors;
            let n = 1;
            while (nMonitors > 0) {
                const generateMonitorBackgrounds = subMenuMonitorBackgrounds(this, n);
                this.menu.addMenuItem(generateMonitorBackgrounds); // Add per Monitor background settings
                n += 1;
                nMonitors -= 1;
            }
        }
    }
);

export default GdmExtension;
