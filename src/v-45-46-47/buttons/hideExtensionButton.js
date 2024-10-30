import Clutter from 'gi://Clutter';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import ConfirmDialog from "../utils/confirmDialog.js";

const hideExtensionButton = (gdmExtension) => {
    gdmExtension._hideExtensionButton = new PopupMenu.PopupMenuItem('Hide Extension Settings Button from Topbar');
    gdmExtension._hideExtensionButton.connect('activate', () => openModal(gdmExtension));

    return gdmExtension._hideExtensionButton;
}

const confirmDialog = {
    subject: ('title', 'Hide GDM Settings Icon?'),
    description: "Are you sure to hide the gdm-extension icon? To show the icon back, please refere to the gsettings command provided in the README of github repository.",
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
        settings.set_boolean('hide-gdm-extension-icon', true);
    });

    modal.open();
}

export default hideExtensionButton;
