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
import enumerateFiles from '../utils/enumerateFiles.js';

const LOGO_DIRECTORIES = ['/usr/local/share/pixmaps', '/usr/share/pixmaps'];

const GetLogos = GObject.registerClass(
    class GetLogs extends GObject.Object {
        async _collectLogos() {
            const logos = [];
            for (const dirName of LOGO_DIRECTORIES) {
                const dir = Gio.File.new_for_path(dirName);
                if (dir.query_exists(null))
                    for (const name of await enumerateFiles(dir))
                        logos.push(`${dirName}/${name}`); // push all file names
            }

            const filtered = logos
                .map(path => path.trim())
                .filter(path =>
                    path.endsWith('.jpg') ||
                    path.endsWith('.jpeg') ||
                    path.endsWith('.png') ||
                    path.endsWith('.gif') ||
                    path.endsWith('.JPG') ||
                    path.endsWith('.JPEG') ||
                    path.endsWith('.PNG') ||
                    path.endsWith('GIF'));

            return filtered;
        }
    }
);

export default GetLogos;
