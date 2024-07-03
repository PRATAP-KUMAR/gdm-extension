# gdm-extension - gnome-shell extension for GNOME v45 and v46

## 1. Customize background colors, image, blur for each monitor upto 4 monitors max for GDM Login Screen from the login screen itself.
## 2. Customize Shell theme, Icon theme, Logo, Banner message for GDM Login Screen from the login screen itself.

## Please note that this extension is experimental and is being continously monitored on Arch Linux with gnome-shell v46, When you install this extension, it will reset all the gsettings/dconf-settings for the `gdm` user.

## Warning: Though this extension is bening tested since Dec 2023, In very rare case there could be a chance of being unable to reach even to TTY. In such a case, a bootable USB is required to remove this extension. So please make sure you have a bootable USB and some experience on how to mount drives and remove files with command line.

## Preview of the gdm-extension
![gdm-extension](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/4d847964-12b5-405d-b7ff-52960e3afd6e)

![gdm-extension](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/bba74942-5f22-48e5-bc22-8ef6d4e93a0d)

## You can customize different colors/backgrounds with different blur for multiple monitors of upto 4.

## Blur Feature, you can apply blur.
Apply blur to background image instantly from the login screen itself.

Blur value 0
![gdm-extension-blur-0](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/4d1b7734-f1f4-4d63-9188-daeb98e2c6f5)

Blur value 45
![gdm-extension-blur-45](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/61ff7133-9454-436f-abc2-c906c5fd7646)

## Installation
```
git clone https://github.com/PRATAP-KUMAR/gdm-extension/
cd gdm-extension
sudo make install
```
## Tweaking from GDM Login Screen
1. On the left side topbar, there is a preferences Icon shown. Click on it and it will popup the menu.
2. Based on number of monitors connected, it will popup a menu for all monitors like `Monitor - 1`, `Monitor - 2` upto 4 monitors.
3. For Each monitor you can choose different colors, backgroud image, blur, gradient horizontal and gradient vertical.
4. For Background, if you are satisfied with your shell theme, you dont need to change any thing. If you prefer to choose
   colors, you have to enter a valid color for example,`#456789`, `blue` etc. You must be careful
   while entering these.
5. Important is that, you have to **hit Enter** when you write something in the entry box.
6. Icon themes are collected from `["/usr/local/share/icons/", "/usr/share/icons"]` directories.
7. Shell themes are collected from `["/usr/local/share/themes/", "/usr/share/themes"]` directories.
8. Fonts are collected from `["/usr/local/share/fonts", "/usr/share/fonts]` directories.
9. Fonts are filtered by `FontFamilyName` based on font file naming convention and `StyleName` is ignored by this extension.
10. You can choose distribution logo from `["/usr/local/share/pixmaps", "/usr/share/pixmaps]`
11. You can tweak some system settings from the System Settings menu like tap-to-click, show date, seconds, weekday,
   disable user list, disable restart buttons, show banner message.
12. You can type banner message on the entry box provided. Make sure you **hit Enter** when you write something in the entry box.
13. Optionally you can overrride styling with extensions css file. for example
    ```
    #panel {
      background-color: #000000;
    }
    ```
    Topbar/Panel color is black now
    ![GDM-Extension-16](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/fa87d7ef-bb1a-47f1-a903-0e3f62aa1dcf)

## Hiding the Preferences Icon from GDM Login Screen
Once you enable the extension it is available for regular users too on the Login Screen.
Once you set colors, background, logo, banner message etc, then to prevent tweaking from non sudo users,
you can hide the extension settings icon from the topbar by clicking the Hide button at the bottom of popup menu.

## Showing the Prefernces Icon
if you want to operate from tty you need `systemd-container` package installed. Some distros ship it by default.
If you dont have this package, install it first. Then run below commands.

from tty 
1. `sudo machinectl shell gdm@ /bin/bash`
2. `gsettings set org.gnome.shell.extensions.gdm-extension hide-gdm-settings-icon false`
3. `exit`

If from terminal
1. `xhost si:localuser:gdm`
2. `sudo -u gdm dbus-launch gsettings set org.gnome.shell.extensions.gdm-extension hide-gdm-settings-icon false`

## Known Issue
When you choose to Disable Restart Buttons, the buttons are hidden as expected, but when you toggle the switch, the buttons
are not shown. To sort out this, go to any tty by CTRL+AL+F4 etc and then run
`sudo systemctl restart gdm.service`.

![gdm-extension-1](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/3b4d6492-92d0-4324-a09a-a8abf5631bad)

![gdm-extension-2](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/d1dec679-8795-44a2-a07d-af4f961e59a3)

![gdm-extension-3](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/d0dd7451-dfda-4d2d-858b-f3a064c09c39)

## Troubleshoot
While customizing colors, gradient, wallpaper, or choosing shell themes or icon themes, if you encounter problems.  

if you want to operate from tty you need `systemd-container` package installed. Some distros ship it by default.  
If you dont have this package, install it first. Then run below commands.

from tty
   1. `sudo machinectl shell gdm@ /bin/bash`
   2. `dconf reset -f /` # This will reset all the settings for `gdm` user only, not the regular user.
   Make sure if you configured any other settings yourself for `gdm` user. Make a dconf dump way for that.
   3. `gsettings set org.gnome.shell enabled-extensions "['gdm-extension@pratap.fastmail.fm']"` # enabling the extension
      
from terminal
   1. `xhost si:localuser:gdm`
   2. `sudo -u gdm dbus-launch dconf reset -f /`
   3. `sudo -u gdm dbus-launch gsettings set org.gnome.shell enabled-extensions "['gdm-extension@pratap.fastmail.fm']"`

## Disabling the extension
Since this is a special extension which runs only on GDM, disabling is not possible as normal extensions. There is a way to disable it. but its bit different.
the best way is to remove the extension. from the downloaded repository, run
`sudo make uninstall` and to install again, run `sudo make install`

<hr/>

<a href="https://www.buymeacoffee.com/pratappanabaka"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=pratappanabaka&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff" /></a>