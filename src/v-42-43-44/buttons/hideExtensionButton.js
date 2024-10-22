const { Clutter } = imports.gi;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { ConfirmDialog } = Me.imports.utils.confirmDialog;

var hideExtensionButton = (gdmExtension) => {
    gdmExtension._hideExtensionButton = new PopupMenu.PopupMenuItem('Hide Extension Settings Button from Topbar');
    gdmExtension._hideExtensionButton.connect('activate', () => openModal(gdmExtension));

    return gdmExtension._hideExtensionButton;
}

const confirmDialog = {
    subject: ('title', 'Hide GDM Settings Icon?'),
    description: 'Are you sure to Hide the preferences icon?\n' +
        'If you hide it now, you can not access the settings for now.\n\n' +
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

const openModal = (gdmExtension) => {
    const settings = gdmExtension._settings;
    const modal = new ConfirmDialog(confirmDialog);

    modal.connect('proceed', () => {
        settings.set_boolean('hide-gdm-settings-icon', true);
    });

    modal.open();
}
