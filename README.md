# GDM-Extension for GNOME 45

## Customize colors, background, shell themes, icon themes, logo, banner message for GDM Login Screen from the login screen itself.

## Please note that this extension is experimental and is being continously monitored on Arch Linux and Ubuntu 23.10 for a week. When you install this extension,
   ### 1. it will reset all the gsettings/dconf-settings for the `gdm` user.

## Preview of the gdm-extension
![gdm-extension](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/8212d320-69e4-4351-9882-0055b2d248ac)

## ~~Upcoming Feature by Dec 25th~~ Blur feature implemented (Dec 16th)
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
Above `make install` command does below.
> 1. You have to install this extension as System Wide.
> 2. Install the extension in this path. `/usr/local/share/gnome-shell/extensions/`
> 3. Schemas - from the extension directory
>   1. compile the scheamas in the extension with the below command.
>   `sudo glib-compile-schemas schemas`
>   2. compile the schemas to `/usr/local/share/glib-2.0/schemas` directory.
>      1. First create the directories if they do not exist.
>     `sudo mkdir -p /usr/local/share/glib-2.0/schemas` then
>      2. compile the schemas.
>      `sudo glib-compile-schemas schemas --targetdir /usr/local/share/glib-2.0/schemas/`
>
> ### Enabling the Extension for `gdm` user.
> 1. `xhost si:localuser:gdm`
> 2. `sudo -u gdm dbus-launch dconf reset -f /`
> 3. `sudo -u gdm dbus-launch gsettings set org.gnome.shell enabled-extensions "['gdm-extension@pratap.fastmail.fm']"`

## Tweaking from GDM Login Screen
1. On the left side topbar, there is a preferences Icon shown. Click on it and it will popup the menu.
2. There are four main sections. Background, Shell Themes, Icon Themes, System Settings.
3. For Background, if you are satisfied with your shell theme, you dont need to change any thing. If you prefer to choose
   colors, gradient, wallpaper then you can enter the valid colors for example `#456789`, `blue` etc. You must be careful
   while entering these.
4. Important is that, you have to **hit Enter** when you write something in the entry box.
5. Shell themes are collected from `["/usr/local/share/themes/", "/usr/share/themes"]` directories.
6. Icon themes are collected from `["/usr/local/share/icons/", "/usr/share/icons"]` directories.
7. You can tweak some system settings from the System Settings menu like tap-to-click, show date, seconds, weekday,
   disable user list, disable restart buttons, show banner message.
8. You can type banner message on the entry box provided. Make sure you **hit Enter** when you write something in the entry box.
9. You can choose distribution logo or your prefered one by giving the path. This is generally in the `/usr/share/pixmaps/` path.
10. Optionally you can overrride styling with extensions css file. for example
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
`sudo make uninstall` which does below and to install again, run `sudo make install`

> ## Removing the extension
> 1. `sudo rm -r /usr/local/share/gnome-shell/extensions/gdm-extension@pratap.fastmail.fm`
> 2. `sudo rm /usr/local/share/glib-2.0/schemas/gschemas.compiled` # We compiled here, so remove this file.
> 3. `sudo glib-compile-schemas /usr/local/share/glib-2.0/schemas/` # Must Recompile to generate gschemas.compiled file.
> 4. Optionally reset dconf for `gdm` user as mentioned in the Troubleshoot above.

<hr/>

<a href="https://www.buymeacoffee.com/pratappanabaka"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=pratappanabaka&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
