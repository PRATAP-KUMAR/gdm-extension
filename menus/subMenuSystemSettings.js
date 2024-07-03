import Gio from 'gi://Gio';

import {
    addTapToClick,
    addShowBannerMessage,
    addClockShowDate,
    addClockShowSeconds,
    addClockShowWeekday,
    addShowBatteryPercentage,
    addDisableRestartButtons,
    addDisableUserList
} from '../systemSettings.js';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import createActor from "../utils/createActor.js";
import createMenuItem from "../utils/createMenuItem.js";

const LOGIN_SCREEN_SCHEMA = 'org.gnome.login-screen';
const DESKTOP_SCHEMA = 'org.gnome.desktop.interface';

const dconfLoginSettings = new Gio.Settings({ schema_id: LOGIN_SCREEN_SCHEMA });
const dconfDesktopSettings = new Gio.Settings({ schema_id: DESKTOP_SCHEMA });

const subMenuSystemSettings = (gdmExtension) => {
    gdmExtension._subMenuMenuItemSystemSettings = new PopupMenu.PopupSubMenuMenuItem('System Settings', false);

    gdmExtension._subMenuMenuItemSystemSettings.menu.box.add_child(addTapToClick());

    gdmExtension._subMenuMenuItemSystemSettings.menu.box.add_child(addClockShowDate());
    gdmExtension._subMenuMenuItemSystemSettings.menu.box.add_child(addClockShowSeconds());
    gdmExtension._subMenuMenuItemSystemSettings.menu.box.add_child(addClockShowWeekday());

    gdmExtension._clockFormat = createMenuItem('Clock - Format', ['12h', '24h'], dconfDesktopSettings, 'clock-format')
    gdmExtension._subMenuMenuItemSystemSettings.menu.box.add_child(gdmExtension._clockFormat);

    gdmExtension._subMenuMenuItemSystemSettings.menu.box.add_child(addShowBatteryPercentage());
    gdmExtension._subMenuMenuItemSystemSettings.menu.box.add_child(addDisableRestartButtons());
    gdmExtension._subMenuMenuItemSystemSettings.menu.box.add_child(addDisableUserList());
    gdmExtension._subMenuMenuItemSystemSettings.menu.box.add_child(addShowBannerMessage());

    gdmExtension._subMenuMenuItemSystemSettings.menu.box.add_child(createActor(dconfLoginSettings, 'Banner Message Text', 'Banner Message', 'banner-message-text'));

    return gdmExtension._subMenuMenuItemSystemSettings;
}

export default subMenuSystemSettings;