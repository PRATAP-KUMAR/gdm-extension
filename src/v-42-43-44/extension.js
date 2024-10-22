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

const { Gio, St, Shell } = imports.gi;
const Main = imports.ui.main;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { GdmExtension } = Me.imports.gdmExtension;

const THEME_DIRECTORIES = ['/usr/local/share/themes', '/usr/share/themes'];

let m1BgColorCid = null;
let m1BgGrDirCid = null;
let m1BgGrEndColorCid = null;
let m1BgImagePathCid = null;
let m1BgImageSizeCid = null;
let m1BgImageBlurBrightnessCid = null;
let m1BgImageBlurSigmaCid = null;

const MONITOR_ONE = [m1BgColorCid, m1BgGrDirCid, m1BgGrEndColorCid, m1BgImagePathCid, m1BgImageSizeCid, m1BgImageBlurBrightnessCid, m1BgImageBlurSigmaCid];

let m2BgColorCid = null;
let m2BgGrDirCid = null;
let m2BgGrEndColorCid = null;
let m2BgImagePathCid = null;
let m2BgImageSizeCid = null;
let m2BgImageBlurBrightnessCid = null;
let m2BgImageBlurSigmaCid = null;

const MONITOR_TWO = [m2BgColorCid, m2BgGrDirCid, m2BgGrEndColorCid, m2BgImagePathCid, m2BgImageSizeCid, m2BgImageBlurBrightnessCid, m2BgImageBlurSigmaCid];

let m3BgColorCid = null;
let m3BgGrDirCid = null;
let m3BgGrEndColorCid = null;
let m3BgImagePathCid = null;
let m3BgImageSizeCid = null;
let m3BgImageBlurBrightnessCid = null;
let m3BgImageBlurSigmaCid = null;

const MONITOR_THREE = [m3BgColorCid, m3BgGrDirCid, m3BgGrEndColorCid, m3BgImagePathCid, m3BgImageSizeCid, m3BgImageBlurBrightnessCid, m3BgImageBlurSigmaCid];

let m4BgColorCid = null;
let m4BgGrDirCid = null;
let m4BgGrEndColorCid = null;
let m4BgImagePathCid = null;
let m4BgImageSizeCid = null;
let m4BgImageBlurBrightnessCid = null;
let m4BgImageBlurSigmaCid = null;

const MONITOR_FOUR = [m4BgColorCid, m4BgGrDirCid, m4BgGrEndColorCid, m4BgImagePathCid, m4BgImageSizeCid, m4BgImageBlurBrightnessCid, m4BgImageBlurSigmaCid];

let m1Widget = null;
let m2Widget = null;
let m3Widget = null;
let m4Widget = null;

let shellThemeChangedId = null;
let visibilityChangedId = null;


class GdmExtensionExtension {
    enable() {
        this._settings = ExtensionUtils.getSettings();

        this._indicator = new GdmExtension(this._settings); // Gdm Extension button
        Main.panel.addToStatusArea(this.uuid, this._indicator, 0, 'left'); // Added to panel left

        this._onVisibilityChange(); // show the extension settings icon on Admin decision

        this._connectionSettings(); // trigger setting changes

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

        this._starupPreparedId = Main.layoutManager.connect('startup-prepared', () => this._applyMonitorSettings());
        this._monitorsChangedId = Main.layoutManager.connect('monitors-changed', () => this._applyMonitorSettings());
    }

    _applyMonitorSettings() {
        let nMonitors = Main.layoutManager.monitors.length;
        nMonitors = nMonitors > 4 ? 4 : nMonitors;
        let n = 1;
        while (nMonitors > 0) {
            this._onChangesFromGDMScreen(n);
            n += 1;
            nMonitors -= 1;
        }
    }

    _callMonitorConnectionSettings(n) {
        [
            `background-color-${n}`,
            `background-gradient-direction-${n}`,
            `background-gradient-end-color-${n}`,
            `background-image-path-${n}`,
            `background-size-${n}`,
            `blur-brightness-${n}`,
            `blur-sigma-${n}`,
        ]
            .map(key => this._settings.connect(`changed::${key}`, this._onChangesFromGDMScreen.bind(this, n)));
    }

    _connectionSettings() {
        let nMonitors = Main.layoutManager.monitors.length;
        nMonitors = nMonitors > 4 ? 4 : nMonitors;
        let n = 1;
        while (nMonitors > 0) {
            switch (n) {
                case 1:
                    this._callMonitorConnectionSettings(n);
                    break;
                case 2:
                    this._callMonitorConnectionSettings(n);
                    break;
                case 3:
                    this._callMonitorConnectionSettings(n);
                    break;
                case 4:
                    this._callMonitorConnectionSettings(n);
                    break;
                default:
                    break;
            }
            n += 1;
            nMonitors -= 1;
        }

        visibilityChangedId = this._settings.connect('changed::hide-gdm-settings-icon', this._onVisibilityChange.bind(this));
        shellThemeChangedId = this._settings.connect('changed::shell-theme', this._onShellThemeChanged.bind(this));
    }

    _createWidget(n) {
        let monitors = Main.layoutManager.monitors;
        let monitorIdx = n - 1;
        let monitor = monitors[monitorIdx];

        let imagePath = this._settings.get_string(`background-image-path-${n}`);
        let file = Gio.file_new_for_uri(imagePath);
        let isPathExists = file.query_exists(null);

        let blurBrightness = this._settings.get_double(`blur-brightness-${n}`);
        let blurSigma = this._settings.get_int(`blur-sigma-${n}`);

        let themeContext = St.ThemeContext.get_for_stage(global.stage);
        let blurEffect = {
            name: 'gdm-extension-blur',
            brightness: blurBrightness,
            sigma: blurSigma * themeContext.scale_factor,
        }

        let widget = new St.Widget({
            style: `
            background-color: ${this._settings.get_string(`background-color-${n}`)};
            background-gradient-direction: ${this._settings.get_string(`background-gradient-direction-${n}`)};
            background-gradient-start: ${this._settings.get_string(`background-color-${n}`)};
            background-gradient-end: ${this._settings.get_string(`background-gradient-end-color-${n}`)};
            background-image: ${isPathExists ? `url(${imagePath})` : 'none'};
            background-size: ${this._settings.get_string(`background-size-${n}`)};
            `,
            x: monitor.x,
            y: monitor.y,
            width: monitor.width,
            height: monitor.height,
            effect: new Shell.BlurEffect(blurEffect),
        });

        switch (n) {
            case 1:
                m1Widget = widget;
                break;
            case 2:
                m2Widget = widget;
                break;
            case 3:
                m3Widget = widget;
                break;
            case 4:
                m4Widget = widget;
                break;
            default:
                break;
        }
        return widget;
    }

    _onChangesFromGDMScreen(n) {
        switch (n) {
            case 1:
                if (m1Widget)
                    m1Widget.destroy();
                break;
            case 2:
                if (m2Widget)
                    m2Widget.destroy();
                break;
            case 3:
                if (m3Widget)
                    m3Widget.destroy();
                break;
            case 4:
                if (m4Widget)
                    m4Widget.destroy();
                break;
            default:
                break;
        }
        Main.screenShield._lockDialogGroup.insert_child_below(this._createWidget(n), null);
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

    _onVisibilityChange() {
        if (this._settings.get_boolean('hide-gdm-settings-icon'))
            this._indicator.hide();
        else
            this._indicator.show();
    }

    _disconnectSignals() {
        MONITOR_ONE.forEach(id => {
            if (id)
                this._settings.disconnect(id);
        });
        MONITOR_TWO.forEach(id => {
            if (id)
                this._settings.disconnect(id);
        });
        MONITOR_THREE.forEach(id => {
            if (id)
                this._settings.disconnect(id);
        });
        MONITOR_FOUR.forEach(id => {
            if (id)
                this._settings.disconnect(id);
        });
    }

    // session-mode used is ['gdm'] only because this extension purpose
    // is to tweak the settings of GDM Login screen itself
    disable() {
        this._indicator.destroy();
        this._indicator = null;

        this._disconnectSignals();

        if (shellThemeChangedId)
            this._settings.disconnect(shellThemeChangedId);
        if (visibilityChangedId)
            this._settings.disconnect(visibilityChangedId);

        Main.layoutManager.disconnect(this._starupPreparedId);
        Main.layoutManager.disconnect(this._monitorsChangedId);

        this._settings = null;
    }
}

function init() {
    return new GdmExtensionExtension();
}

