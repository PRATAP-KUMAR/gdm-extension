// SPDX-FileCopyrightText: 2020 Florian Müllner <fmuellner@gnome.org>
//
// SPDX-License-Identifier: GPL-2.0-or-later

// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-

// we use async/await here to not block the mainloop, not to parallelize
/* eslint-disable no-await-in-loop */

// source code: https://extensions.gnome.org/extension/19/user-themes/
// Below code is edited by PRATAP PANABAKA <pratap@fastmail.fm>

import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import enumerateDir from './enumerateDir.js';

const ICON_DIRECTORIES = ['/usr/local/share/icons', '/usr/share/icons'];

// Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
// Gio._promisify(Gio.File.prototype, 'query_info_async');
// Gio._promisify(Gio.FileEnumerator.prototype, 'next_files_async');

const GetIcons = GObject.registerClass(
    class GetIcons extends GObject.Object {
        async _collectIcons() {
            const icons = [];
            for (const dirName of ICON_DIRECTORIES) {
                const dir = Gio.File.new_for_path(dirName);
                for (const name of await enumerateDir(dir))
                    icons.push(name); // push all Icon folder names
            }
            return icons;
        }
    }
);

export default GetIcons;
