import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.FileEnumerator.prototype, 'next_files_async');

const enumerateDir = async dir => {
    const fileInfos = [];
    let fileEnum;
    try {
        fileEnum = await dir.enumerate_children_async(
            Gio.FILE_ATTRIBUTE_STANDARD_NAME,
            Gio.FileQueryInfoFlags.NONE,
            GLib.PRIORITY_DEFAULT, null);
    } catch (e) {
        if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND))
            logError(e);
        return [];
    }

    let infos;
    do {
        /* eslint-disable no-await-in-loop */
        infos = await fileEnum.next_files_async(100, GLib.PRIORITY_DEFAULT, null);
        const filterdInfos = infos.filter(info => info.get_file_type() === Gio.FileType.DIRECTORY);
        fileInfos.push(...filterdInfos);
    } while (infos.length > 0);

    return fileInfos.map(info => info.get_name());
};

export default enumerateDir;
