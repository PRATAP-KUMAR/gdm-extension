// SPDX-FileCopyrightText: 2020 Florian Müllner <fmuellner@gnome.org>
//
// SPDX-License-Identifier: GPL-2.0-or-later

// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-

// we use async/await here to not block the mainloop, not to parallelize
/* eslint-disable no-await-in-loop */

// source code: https://extensions.gnome.org/extension/19/user-themes/
// Below code is tweaked by PRATAP PANABAKA <pratap@fastmail.fm>

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import enumerateDir from './enumerateDir.js';

const THEME_DIRECTORIES = ['/usr/local/share/themes', '/usr/share/themes'];

Gio._promisify(Gio.File.prototype, 'query_info_async');

const GetThemes = GObject.registerClass(
    class GetThemes extends GObject.Object {
        async _collectThemes() {
            const themes = [];
            for (const dirName of THEME_DIRECTORIES) {
                const dir = Gio.File.new_for_path(dirName);
                for (const name of await enumerateDir(dir)) {
                    const file = dir.resolve_relative_path(
                        `${name}/gnome-shell/gnome-shell.css`);
                    try {
                        await file.query_info_async(
                            Gio.FILE_ATTRIBUTE_STANDARD_NAME,
                            Gio.FileQueryInfoFlags.NONE,
                            GLib.PRIORITY_DEFAULT, null);
                        themes.push(name); // push valid names only
                    } catch (e) {
                        if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND))
                            logError(e);
                    }
                }
            }
            return themes;
        }
    }
);

export default GetThemes;
