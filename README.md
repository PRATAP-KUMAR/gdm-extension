# GDM-Extension for GNOME 45
## Tweak few things of GDM Login Screen from the login screen itself.

## Installation
1. You have to install this extension as System Wide.
2. Install the extension in this path. `/usr/local/share/gnome-shell/extensions/`
3. Schemas - compile the schemas to `/usr/local/share/glib-2.0/schemas` directory.
4. First create the directories if they dont exist.
   `sudo mkdir -p /usr/local/share/glib-2.0/schemas` then
5. compile the schemas. From the extensions directory
   ```
   sudo glib-compile-schemas schemas --targetdir /usr/local/share/glib-2.0/schemas/
   ```

## Enabling the Extension for `gdm` user.
1. `sudo machinectl shell gdm@ /bin/bash`
2. `gsettings set org.gnome.shell enabled-extensions "['gdm-extension@pratap.fastmail.fm']"`

## Tweaking from GDM Login Screen
1. On the left side topbar, there is a preferences Icon shown. Click on it and it will popup the menu.
2. There are four main sections Background, Shell Themes, Icon Themes, System Settings.
3. For Background, if you are satisfied with your shell theme, you dont need to change any thing. If you prefer to choose
   colors, gradient, wallpaper then you can enter the valid colors for example `#456789`, `blue` etc. You must be careful
   while entering these.
4. Important is that, you have to **hit Enter** when you write something in the entry box.
5. Shell themes are collected from `["/usr/local/share/themes/", "/usr/share/themes"]` directories.
6. Icon themes are collected from `["/usr/local/share/icons/", "/usr/share/icons"]` directories.
7. You can click on any theme and it will be applied instantly.
8. You can tweak some system settings from the System Settings menu like tap-to-click, show date, seconds, weekday,
   disable user list, disable restart buttons, show banner message.
9. You can type banner message on the entry box provided. Make sure you **hit Enter** when you write something in the entry box.
10. You can choose distribution logo or your prefered one by giving the path. This is generally in the `/usr/share/pixmaps/` path.
11. Optionally you can overrride styling of any shell theme you select from dropdown with extensions css file. for example
    ```
    #panel {
      background-color: #000000;
    }
    ```

## Hiding the Preferences Icon from GDM Login Screen
Once you enable the extension it is available for regular users too on the Login Screen. To prevent tweaking the Login Screen,
you can hide the extension by clicking the Hide button at the bottom of popup menu.

## Showing the Prefernces Icon from terminal
1. `sudo machinectl shell gdm@ /bin/bash`
2. `gsettings set org.gnome.shell.extensions.gdm-extension hide-gdm-settings-icon false`

## Known Issue
When you choose to Disable Restart Buttons, the buttons are hidden as expected, but when you toggle the switch, the buttons
are not shown. To sort out this, Choose any Icon theme from the list. Choosing Icon themes will refresh the shell.
This way the buttons can be shown.

![GDM-Extension-1](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/b3e815c8-803b-4dd7-8ade-74876e5d2669)

![GDM-Extension-2](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/877c1606-68d6-42b5-850a-257371dc9486)

![GDM-Extension-3](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/ce22896b-8faa-42a2-a27a-d52c7c6366e3)

![GDM-Extension-4](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/e03ec12e-59d3-4f2a-8d2c-6b246c1f2dbf)

![GDM-Extension-5](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/09ed0202-6f23-4677-a84b-adb4c69ea349)

![GDM-Extension-6](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/bf3ade6c-0538-4530-879c-9b2d3004f7eb)

![GDM-Extension-7](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/01954bd5-992c-42b5-ad4e-210fe18f14dd)

![GDM-Extension-8](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/aaef329d-13b8-4948-a2f2-2b0e1e3e7fa1)

![GDM-Extension-9](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/0160c263-08e9-4cc9-988f-5375deeb025d)

![GDM-Extension-10](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/8f21a9d8-88a2-4969-9b06-146817cc6dc2)

![GDM-Extension-11](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/11154dff-627f-4b38-afc3-5a4a4e17885e)

![GDM-Extension-12](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/9eddae24-6bee-4586-82d4-841b16e878f2)

![GDM-Extension-13](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/be5914c4-a0cc-451a-b819-c143565b070d)

![GDM-Extension-14](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/47ba48e8-c19f-4d2d-b3b1-48b574551931)

![GDM-Extension-15](https://github.com/PRATAP-KUMAR/gdm-extension/assets/40719899/c4930830-a148-45ac-b5e3-a137aebef522)

## Troubleshoot
While customizing colors, gradient, wallpaper, if you encounter problems
1. `sudo machinectl shell gdm@ /bin/bash`
2. `dconf reset -f /` # This will reset all the settings for `gdm` user only, not the regular user.
   Make sure if you configured any other settings yourself for `gdm` user. Make a dconf dump way for that.
3. enable the extension `gsettings set org.gnome.shell enabled-extensions "['gdm-extension@pratap.fastmail.fm']"`

## Disabling the extension
1. `sudo machinectl shell gdm@ /bin/bash`
2. `gsettings set org.gnome.shell disabled-extensions "['gdm-extension@pratap.fastmail.fm']"` when you want to enable please
   make sure you reset above key first and then check enabling method in this document.

## Removing the extension
1. `sudo rm -r /usr/local/share/gnome-shell/extensions/gdm-extension@pratap.fastmail.fm`
2. `sudo rm /usr/local/share/glib-2.0/schemas/gschemas.compiled` # We compiled here, so remove this file.
3. `sudo glib-compile-schemas /usr/local/share/glib-2.0/schemas/` # Must Recompile to generate gschemas.compiled file.
4. Optionally reset dconf for `gdm` user as mentioned in the Troubleshoot above.

<hr/>

<a href="https://www.buymeacoffee.com/pratappanabaka"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=pratappanabaka&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
