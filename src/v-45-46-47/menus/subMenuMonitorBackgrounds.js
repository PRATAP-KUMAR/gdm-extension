import St from 'gi://St';
import Clutter from 'gi://Clutter';

import * as AnimationUtils from 'resource:///org/gnome/shell/misc/animationUtils.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import createActor from '../utils/createActor.js';
import createMenuItem from '../utils/createMenuItem.js';
import updateOrnament from '../utils/updateOrnament.js';
import Slider from '../utils/slider.js';
import GNOME_SHELL_VERSION from '../utils/shellVersion.js';

import GetBackgrounds from '../getNamesAsync/getBackgrounds.js';

const subMenuMonitorBackgrounds = (gdmExtension, n) => {
    gdmExtension._subMenuMenuItemMonitorBackground = new PopupMenu.PopupSubMenuMenuItem(`Monitor - ${n}`, false);
    createBackgroundPrefs(gdmExtension, n);
    setBackgrounds(gdmExtension, n);

    return gdmExtension._subMenuMenuItemMonitorBackground;
}

let menuItem = null;

const createBackgroundPrefs = (gdmExtension, n) => {
    gdmExtension._subMenuMenuItemMonitorBackground.menu.box.add_child(createActor(gdmExtension._settings, 'Background Color/Gradient Start Color', '#123456', `background-color-${n}`, 'Must be a valid color'));
    gdmExtension._subMenuMenuItemMonitorBackground.menu.box.add_child(createActor(gdmExtension._settings, 'Background End Color', '#456789', `background-gradient-end-color-${n}`, 'Must be a valid color or same as above color'));

    gdmExtension._catchGradientDirection = [];
    const gradientDirectionMenuItem = createMenuItem('Gradient Direction', ['none', 'horizontal', 'vertical'], gdmExtension._settings, `background-gradient-direction-${n}`, gdmExtension._catchGradientDirection)
    gdmExtension._subMenuMenuItemMonitorBackground.menu.box.add_child(gradientDirectionMenuItem);

    const backgroundSizeMenuItem = createMenuItem('Background size', ['center', 'cover', 'contain'], gdmExtension._settings, `background-size-${n}`);
    gdmExtension._subMenuMenuItemMonitorBackground.menu.box.add_child(backgroundSizeMenuItem);

    // Blur Sigma
    menuItem = new PopupMenu.PopupBaseMenuItem();
    menuItem.add_child(new St.Label({ text: 'Blur Sigma 0 to 100', y_align: Clutter.ActorAlign.CENTER }));
    gdmExtension._subMenuMenuItemMonitorBackground.menu.box.add_child(menuItem);
    gdmExtension._subMenuMenuItemMonitorBackground.menu.box.add_child(new Slider(gdmExtension._settings, `blur-sigma-${n}`));
    //

    // Blur Brightness
    menuItem = new PopupMenu.PopupBaseMenuItem();
    menuItem.add_child(new St.Label({ text: 'Blur Brightness 0 to 1 (Only applicable if Blur Sigma is > 0)', y_align: Clutter.ActorAlign.CENTER }));
    gdmExtension._subMenuMenuItemMonitorBackground.menu.box.add_child(menuItem);
    gdmExtension._subMenuMenuItemMonitorBackground.menu.box.add_child(new Slider(gdmExtension._settings, `blur-brightness-${n}`));
    //
}

const setBackgrounds = async (gdmExtension, n) => {
    const item = gdmExtension._subMenuMenuItemMonitorBackground;

    menuItem = new PopupMenu.PopupBaseMenuItem();
    menuItem.add_child(new St.Label({ text: 'Backgrounds', y_align: Clutter.ActorAlign.CENTER }));
    item.menu.box.add_child(menuItem);

    const scrollView = new St.ScrollView();
    const section = new PopupMenu.PopupMenuSection();

    if (GNOME_SHELL_VERSION === 45)
        scrollView.add_actor(section.actor);
    else
        scrollView.add_child(section.actor);

    item.menu.box.add_child(scrollView);

    const object = new GetBackgrounds();
    const BACKGROUNDS = await object._collectBackgrounds();

    const collectBackgrounds = backgrounds => {
        let _items = [];
        backgrounds.forEach(backgroundName => {
            const backgroundNameItem = new PopupMenu.PopupMenuItem(backgroundName);
            _items.push(backgroundNameItem);

            section.addMenuItem(backgroundNameItem);

            backgroundNameItem.connect('key-focus-in', () => {
                AnimationUtils.ensureActorVisibleInScrollView(scrollView, backgroundNameItem);
            });

            backgroundNameItem.connect('activate', () => {
                gdmExtension._settings.set_string(`background-image-path-${n}`, backgroundName);
                gdmExtension._settings.set_string(`background-gradient-direction-${n}`, 'none')
                updateOrnament(backgroundItems, backgroundName);
                updateOrnament(gdmExtension._catchGradientDirection, 'none');
            });
        });
        return _items;
    };

    const backgroundItems = collectBackgrounds(BACKGROUNDS);
    const text = gdmExtension._settings.get_string(`background-image-path-${n}`)
    updateOrnament(backgroundItems, text);
}

export default subMenuMonitorBackgrounds;