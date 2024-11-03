const { Clutter, St } = imports.gi;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { ConfirmDialog } = Me.imports.utils.confirmDialog;

var hideExtensionButton = (gdmExtension) => {
    gdmExtension._hideExtensionButton = new PopupMenu.PopupBaseMenuItem();
    let hideButton = new St.Button({ label: 'Hide gdm-extension button', style_class: "button", x_align: Clutter.ActorAlign.CENTER, x_expand: true });
    hideButton.connect('clicked', () => openModal(gdmExtension));
    gdmExtension._hideExtensionButton.add_child(hideButton);

    return gdmExtension._hideExtensionButton;
}

const confirmDialog = {
    subject: ('title', 'Hide gdm-extension button?'),
    description: "Are you sure to hide the gdm-extension button? To show the button back, please refere to the gsettings command provided in the README of github repository.",
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
        settings.set_boolean('hide-gdm-extension-button', true);
    });

    modal.open();
}
