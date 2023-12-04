/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

// GI
import Gio from 'gi://Gio';

// Resources
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

// Local
import GdmExtensionSettingsButton from './gdmExtensionSettingsButton.js';

const THEME_DIRECTORIES = ['/usr/local/share/themes', '/usr/share/themes'];

let backgroundColorChanged = null;
let backgroundGradientDirectionChanged = null;
let backgroundGradientStartChanged = null;
let backgroundGradientEndChanged = null;
let backgroundImageChanged = null;
let backgroundSizeChanged = null;

let shallThemeChangedId = null;
let visibilityChangedId = null;

export default class GdmExtension extends Extension {
    enable() {
        this._settings = this.getSettings();

        Main.notify(JSON.stringify(this._settings));

        this._indicator = new GdmExtensionSettingsButton(this._settings); // Gdm Extension button
        Main.panel.addToStatusArea(this.uuid, this._indicator, 0, 'left'); // Added to panel left

        this._onVisibilityChange(); // show the extension settings icon on Admin decision

        this._connectionSettings(); // trigger setting changes

        this._onChangesFromGDMScreen(); // Its like extension prefs

        let styleSheet = null;
        let themeName = this._settings.get_string('shell-theme');

        const stylesheetPaths = THEME_DIRECTORIES
            .map(dir => `${dir}/${themeName}/gnome-shell/gnome-shell.css`);

        styleSheet = stylesheetPaths.find(path => {
            let file = Gio.file_new_for_path(path);
            return file.query_exists(null);
        });

        Main.setThemeStylesheet(styleSheet);
        Main.loadTheme();
    }

    _connectionSettings() {
        [
            backgroundColorChanged,
            backgroundGradientDirectionChanged,
            backgroundGradientEndChanged,
            backgroundImageChanged,
            backgroundSizeChanged,
        ] = [
            'background-color',
            'background-gradient-direction',
            'background-gradient-end-color',
            'background-image-path',
            'background-size',
        ]
            .map(key => {
                return this._settings.connect(`changed::${key}`, this._onChangesFromGDMScreen.bind(this));
            });

        visibilityChangedId = this._settings.connect('changed::hide-gdm-settings-icon', this._onVisibilityChange.bind(this));
        shallThemeChangedId = this._settings.connect('changed::shell-theme', this._onShellThemeChanged.bind(this));
    }

    _onShellThemeChanged() {
        let themeName = this._settings.get_string('shell-theme');
        if (themeName) {
            Main.setThemeStylesheet(themeName);
            Main.loadTheme();
        } else {
            Main.loadTheme();
        }
    }

    _onChangesFromGDMScreen() {
        Main.screenShield._lockDialogGroup.set_style(`
        background-color: ${this._settings.get_string('background-color')};
        background-gradient-direction: ${this._settings.get_string('background-gradient-direction')};
        background-gradient-start: ${this._settings.get_string('background-color')};
        background-gradient-end: ${this._settings.get_string('background-gradient-end-color')};
        background-image: url("file://${this._settings.get_string('background-image-path')}");
        background-size: ${this._settings.get_string('background-size')};
        `);
    }

    _onVisibilityChange() {
        if (this._settings.get_boolean('hide-gdm-settings-icon'))
            this._indicator.hide();
        else
            this._indicator.show();
    }

    // session-mode used is ['gdm'] only because this extension purpose
    // is to tweak the settings of GDM Login screen itself
    disable() {
        this._indicator.destroy();
        this._indicator = null;

        this._settings.disconnect(backgroundColorChanged);
        this._settings.disconnect(backgroundGradientDirectionChanged);
        this._settings.disconnect(backgroundGradientStartChanged);
        this._settings.disconnect(backgroundGradientEndChanged);
        this._settings.disconnect(backgroundImageChanged);
        this._settings.disconnect(backgroundSizeChanged);

        this._settings.disconnect(visibilityChangedId);
        this._settings.disconnect(shallThemeChangedId);

        this._settings = null;
    }
}
