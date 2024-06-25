import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

/* Gio.File */
Gio._promisify(Gio.File.prototype, 'copy_async');
Gio._promisify(Gio.File.prototype, 'create_async');
Gio._promisify(Gio.File.prototype, 'delete_async');
Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.File.prototype, 'load_contents_async');
Gio._promisify(Gio.File.prototype, 'make_directory_async');
Gio._promisify(Gio.File.prototype, 'move_async');
Gio._promisify(Gio.File.prototype, 'open_readwrite_async');
Gio._promisify(Gio.File.prototype, 'query_info_async');
Gio._promisify(Gio.File.prototype, 'replace_contents_async');
Gio._promisify(Gio.File.prototype, 'replace_contents_bytes_async', 'replace_contents_finish');
Gio._promisify(Gio.File.prototype, 'trash_async');

/* Gio.FileEnumerator */
Gio._promisify(Gio.FileEnumerator.prototype, 'next_files_async');

/* Gio.InputStream */
Gio._promisify(Gio.InputStream.prototype, 'read_bytes_async');

/* Gio.OutputStream */
Gio._promisify(Gio.OutputStream.prototype, 'write_bytes_async');

/**
 * Callback signature for recursiveFileOperation().
 *
 * The example callback `recursiveDeleteCallback()` demonstrates how to
 * recursively delete a directory of files, while skipping unsupported file types.
 *
 * @param {Gio.File} file - the file to operate on
 * @param {Gio.FileType} fileType - the file type
 * @param {Gio.Cancellable} [cancellable] - optional cancellable
 * @returns {Promise|null} a Promise for the operation, or %null to ignore
 */

const recursiveDeleteCallback = async (file, fileType, cancellable = null, array) => {
    switch (fileType) {
        case Gio.FileType.REGULAR:
        case Gio.FileType.SYMBOLIC_LINK: {
            const fileInfo = await file.query_info_async('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_DEFAULT, null);
            array.push(fileInfo.get_name());
            return
        }

        case Gio.FileType.DIRECTORY:
            return recursiveFileOperation(file, recursiveDeleteCallback, cancellable, array);

        default:
            return null;
    }
}

/**
 * Recursively operate on @file and any children it may have.
 *
 * @param {Gio.File} file - the file or directory to delete
 * @param {Function} callback - a function that will be passed the file,
 *     file type (e.g. regular, directory), and @cancellable
 * @param {Gio.Cancellable} [cancellable] - optional cancellable
 * @returns {Promise} a Promise for the operation
 */
async function recursiveFileOperation(file, callback, cancellable = null, array) {

    const fileInfo = await file.query_info_async('standard::type',
        Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_DEFAULT,
        cancellable);

    const fileType = fileInfo.get_file_type();

    // If @file is a directory, collect all the operations as Promise branches
    // and resolve them in parallel
    if (fileType === Gio.FileType.DIRECTORY) {
        const iter = await file.enumerate_children_async('standard::type',
            Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_DEFAULT,
            cancellable);

        const branches = [];

        while (true) {
            // eslint-disable-next-line
            const fileInfos = await iter.next_files_async(100, GLib.PRIORITY_DEFAULT, cancellable);

            if (fileInfos.length === 0)
                break;

            for (const info of fileInfos) {
                const child = iter.get_child(info);
                const childType = info.get_file_type();

                // The callback decides whether to process a file, including
                // whether to recurse into a directory
                const branch = callback(child, childType, cancellable, array);

                if (branch)
                    branches.push(branch);
            }
        }

        await Promise.all(branches)
    }

    // Return the Promise for the top-level file
    return callback(file, cancellable, array);
}

export { recursiveFileOperation, recursiveDeleteCallback };
