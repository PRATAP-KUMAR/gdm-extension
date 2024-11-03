# gdm-extension

### Warning: 
Please note that this extension is experimental and is continously monitored on Arch Linux with gnome-shell ~~v45~~ ~~v46~~ v47.

Though this extension is being tested since Dec 2023, In very very rare case there could be a chance of being unable to reach even to TTY. In such a case, a bootable USB is required to remove this extension. So please make sure you have a bootable USB and some experience on how to mount drives and remove files with command line. This gdm-extension installs at 
```
/usr/local/share/gnome-shell/extensions/gdm-extension@pratap.fastmail.fm
```
 
### A gnome-shell extension for customizing GDM Login Screen for GNOME v42 and above.
Customize background colors, images, blur for each monitor upto 4 monitors for GDM Login Screen from the login screen itself.
Customize Shell themes, Accent Colors, Icon themes, Fonts, Logo, Banner messages for GDM Login Screen from the login screen itself.

### prerequisite packages
1. `zip`
2. `dbus-x11`
3. `systemd-container`

### Installation
```
git clone https://github.com/PRATAP-KUMAR/gdm-extension/
cd gdm-extension
sudo ./install.sh

# Observation: Occassionaly when system is updated or due to someother system errors, this extension stops working. In such a case you need to run `sudo ./install.sh` again.
```

### Preview of the gdm-extension (pics from Ubuntu 24.04 GDM Login Screen)

![1](https://github.com/user-attachments/assets/b96664f1-582c-4b67-b7b0-1f4f80459e14)
![2](https://github.com/user-attachments/assets/d797c2fc-5aec-4f49-9798-2b4cc586ee23)
![3](https://github.com/user-attachments/assets/0591b2ea-08f5-4249-b5e4-51ba18aba3ac)
![4](https://github.com/user-attachments/assets/29b205c6-c774-43f2-9772-27a86b729073)
![5](https://github.com/user-attachments/assets/7463e143-b1d0-441b-a11f-e5c225f30e6b)
![6](https://github.com/user-attachments/assets/24ba45f8-38c7-4e60-a422-30494ab9fa00)
![7](https://github.com/user-attachments/assets/04412af0-b5af-4f53-8a2c-0821d6fd9621)
![9](https://github.com/user-attachments/assets/a8d2f693-fe68-486e-b017-1588de538d7f)
![8](https://github.com/user-attachments/assets/51aeaa67-f0f3-4b1b-8d48-d007c1385241)
![10](https://github.com/user-attachments/assets/4fe29c40-b65f-43ec-a367-74cf3497030f)

### Tweaking from GDM Login Screen
1. On the left side topbar, there is a preferences Icon shown. Click on it and it will popup the menu.
2. Based on number of monitors connected, it will popup a menu for all monitors like `Monitor - 1`, `Monitor - 2` upto 4 monitors.
3. For Each monitor you can choose different colors, backgroud image, blur, gradient horizontal and gradient vertical.
4. For Background, if you are satisfied with your shell theme, you dont need to change any thing. If you prefer to choose
   colors, you have to enter a valid color for example,`#456789`, `blue` etc. You must be careful
   while entering these.
5. Important is that, you have to **hit Enter** when you write something in the entry box.
6. Icon themes are collected from `["/usr/local/share/icons/", "/usr/share/icons"]` directories.
7. Shell themes are collected from `["/usr/local/share/themes/", "/usr/share/themes"]` directories.
8. Accent Colors - For GNOME 47 accent-colors feature added. If you wish to set topbar color with respect to accent-colors
   uncomment the code for `#panel` in this extensions `stylesheet.css` file.
9. Fonts are collected from `["/usr/local/share/fonts", "/usr/share/fonts]` directories.
10. Fonts are filtered by `FontFamilyName` based on font file naming convention and `StyleName` is ignored by this extension.
11. You can choose distribution logo from `["/usr/local/share/pixmaps", "/usr/share/pixmaps]`
12. You can tweak some system settings from the System Settings menu like tap-to-click, show date, seconds, weekday,
   disable user list, disable restart buttons, show banner message.
13. You can type banner message on the entry box provided. Make sure you **hit Enter** when you write something in the entry box.
14. Optionally you can overrride styling with extensions css file. for example
    ```
    #panel {
      background-color: -st-accent-color;
    }
    ```
    Topbar/Panel color will syncronize with the accent-color now (Note that accent-color is introduced in GNOME 47, so for earlier versions Accent Color option will not be shown in this extensions menu.)

### Hiding the Preferences Icon from GDM Login Screen
Once you enable the extension it is available for regular users too on the Login Screen.
Once you set colors, background, logo, banner message etc, then to prevent tweaking from non sudo users,
you can hide the extension settings button from the topbar by clicking the Hide button at the bottom of popup menu.

### Showing the Prefernces Icon

Please note that `gdm` user is named `Debian-gdm` for debian OS. If you are using Debian OS, please replace `gdm` user with `Debian-gdm` where ever applicable in below commands.

If running from tty
```
sudo machinectl shell gdm@ /bin/bash # gdm || Debian-gdm
dconf write /org/gnome/shell/extensions/gdm-extension/hide-gdm-extension-button false
exit
sudo systemctl restart gdm
```

If running from terminal
```
xhost si:localuser:gdm # gdm || Debian-gdm
sudo -u gdm dbus-launch dconf write /org/gnome/shell/extensions/gdm-extension/hide-gdm-extension-button false # gdm || Debian-gdm
xhost -si:localuser:gdm # gdm || Debian-gdm
```

### Known Issue
When you choose to Disable Restart Buttons, the buttons are hidden as expected, but when you toggle the switch, the buttons
are not shown. To sort out this, go to any tty by CTRL+AL+F4 etc and then run
`sudo systemctl restart gdm`.

### Troubleshoot
While customizing colors, gradient, wallpaper, or choosing shell themes or icon themes, if you encounter problems.  

if you want to operate from tty you need `systemd-container` package installed. Some distros ship it by default.  
If you dont have this package, install it first. Then run below commands.

If running from tty
```
sudo machinectl shell gdm@ /bin/bash # gdm || Debian-gdm
dconf read /org/gnome/shell/enabled-extensions # read if you have any other extensions enabled for GDM login screen
dconf reset -f /org/gnome/shell/enabled-extensions # This will reset the key for enabled-extensions
dconf write /org/gnome/shell/enabled-extensions "@as ['gdm-extension@pratap.fastmail.fm']" # enabling the extension
# Also add any other extensions UUID those are enabled(before discovering this extension) for gdm login screen in the above array.
```

If running from terminal
```
xhost si:localuser:gdm # gdm || Debian-gdm
sudo -u gdm dbus-launch dconf read /org/gnome/shell/enabled-extensions # read if you have any other extensions enabled for GDM login screen
sudo -u gdm dbus-launch dconf reset -f /org/gnome/shell/enabled-extensions # This will reset the key for enabled-extensions
sudo -u gdm dbus-launch dconf write /org/gnome/shell/enabled-extensions "@as ['gdm-extension@pratap.fastmail.fm']" # enabling the extension
# Also add any other extensions UUID those are enabled(before discovering this extension) for gdm login screen in the above array.
xhost -si:localuser:gdm # gdm || Debian-gdm
```

### Disabling the extension
Since this is a special extension which runs only on GDM, disabling is not possible as normal extensions.
The best way is to remove the extension. from the downloaded repository, run
`sudo ./uninstall.sh` and to install again, run `sudo ./install.sh`

### Issues
If you find any issues please raise [here](https://github.com/PRATAP-KUMAR/gdm-extension/issues)

<hr/>

<a href="https://www.buymeacoffee.com/pratappanabaka"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=pratappanabaka&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
