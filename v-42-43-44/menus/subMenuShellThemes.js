
const { Gio, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

// import updateOrnament from '../utils/updateOrnament.js';
const { updateOrnament } = Me.imports.utils.updateOrnament;

// import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
const PopupMenu = imports.ui.popupMenu;

// import GNOME_SHELL_VERSION from '../utils/shellVersion.js';
const GNOME_SHELL_VERSION = Me.imports.utils.shellVersion;

const Main = imports.ui.main;


// import GetShellThemes from '../getNamesAsync/getShellThemes.js';
const { GetShellThemes } = Me.imports.getNamesAsync.getShellThemes;

const THEME_DIRECTORIES = ['/usr/local/share/themes', '/usr/share/themes'];

var subMenuShellThemes = (gdmExtension) => {
    gdmExtension._subMenuMenuItemShellThemes = new PopupMenu.PopupSubMenuMenuItem('Shell Themes', false);
    setShellThemes(gdmExtension)

    return gdmExtension._subMenuMenuItemShellThemes;
}

const setShellThemes = async (gdmExtension) => {

    const item = gdmExtension._subMenuMenuItemShellThemes;
    const settings = gdmExtension._settings;

    const scrollView = new St.ScrollView();
    const section = new PopupMenu.PopupMenuSection();

    if (GNOME_SHELL_VERSION === 45)
        scrollView.add_actor(section.actor);
    else
        scrollView.add_child(section.actor);

    item.menu.box.add_child(scrollView);

    const object = new GetShellThemes();
    const shellThemes = await object._collectShellThemes();

    const collectShellThemes = themes => {
        let _items = [];

        // Add Default Theme Item
        const shellDefaultThemeItem = new PopupMenu.PopupMenuItem('Default');
        shellDefaultThemeItem.connect('activate', () => {
            Main.setThemeStylesheet(null);
            Main.loadTheme();
            settings.set_string('shell-theme', '');
            updateOrnament(shellThemeItems, 'Default');
        });
        _items.push(shellDefaultThemeItem);
        section.addMenuItem(shellDefaultThemeItem);
        //

        themes.forEach(themeName => {
            const shellThemeNameItem = new PopupMenu.PopupMenuItem(themeName);
            _items.push(shellThemeNameItem);

            section.addMenuItem(shellThemeNameItem);

            shellThemeNameItem.connect('activate', () => {
                let styleSheet = null;
                const stylesheetPaths = THEME_DIRECTORIES
                    .map(dir => `${dir}/${themeName}/gnome-shell/gnome-shell.css`);

                styleSheet = stylesheetPaths.find(path => {
                    let file = Gio.file_new_for_path(path);
                    return file.query_exists(null);
                });

                if (styleSheet) {
                    settings.set_string('shell-theme', themeName);
                    updateOrnament(shellThemeItems, themeName);
                } else {
                    settings.set_string('shell-theme', '');
                    updateOrnament(shellThemeItems, 'Default');
                }

                Main.setThemeStylesheet(styleSheet);
                Main.loadTheme();
            });
        });
        return _items;
    };

    const shellThemeItems = collectShellThemes(shellThemes);
    const text = settings.get_string('shell-theme') || 'Default';
    updateOrnament(shellThemeItems, text);
}
