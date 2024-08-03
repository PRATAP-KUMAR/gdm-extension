# gdm-extension
## A gnome-shell extension for customizing GDM Login Screen for GNOME v45 and v46.

## Please note that this extension is experimental and is being continously monitored on Arch Linux with gnome-shell v46, When you install this extension, it will reset all the gsettings/dconf for the  **`gdm`**  user.

## Warning: Though this extension is being tested since Dec 2023, In very very rare case there could be a chance of being unable to reach even to TTY. In such a case, a bootable USB is required to remove this extension. So please make sure you have a bootable USB and some experience on how to mount drives and remove files with command line. This gdm-extension installs at 

```
/usr/local/share/gnome-shell/extensions/gdm-extension@pratap.fastmail.fm
```

## prerequisites packages
1. zip
2. dbus-x11

## Installation
```
git clone https://github.com/PRATAP-KUMAR/gdm-extension/
cd gdm-extension
sudo make install
```

## Customize background colors, image, blur for each monitor upto 4 monitors for GDM Login Screen from the login screen itself.
## Customize Shell theme, Icon theme, Fonts, Logo, Banner message for GDM Login Screen from the login screen itself.

## Preview of the gdm-extension (pics from Ubuntu 24.04 GDM Login Screen)

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


## You can customize different colors/backgrounds with different blur for multiple monitors of upto 4.

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

If running from tty
```
sudo machinectl shell gdm@ /bin/bash # replace 'gdm' with 'Debian-gdm' if you are using debian
gsettings set org.gnome.shell.extensions.gdm-extension hide-gdm-settings-icon false
exit
```

If running from terminal
```
xhost si:localuser:gdm # replace 'gdm' with 'Debian-gdm' if you are using debian
sudo -u gdm dbus-launch gsettings set org.gnome.shell.extensions.gdm-extension hide-gdm-settings-icon false
```

## Known Issue
When you choose to Disable Restart Buttons, the buttons are hidden as expected, but when you toggle the switch, the buttons
are not shown. To sort out this, go to any tty by CTRL+AL+F4 etc and then run
`sudo systemctl restart gdm.service`.

## Troubleshoot
While customizing colors, gradient, wallpaper, or choosing shell themes or icon themes, if you encounter problems.  

if you want to operate from tty you need `systemd-container` package installed. Some distros ship it by default.  
If you dont have this package, install it first. Then run below commands.

If running from tty
```
sudo machinectl shell gdm@ /bin/bash # replace 'gdm' with 'Debian-gdm' if you are using debian
dconf reset -f / # This will reset all the settings for `gdm` user only, not the regular user.
gsettings set org.gnome.shell enabled-extensions "['gdm-extension@pratap.fastmail.fm']" # enabling the extension
```
      
If running from terminal
```
xhost si:localuser:gdm # replace 'gdm' with 'Debian-gdm' if you are using debian
sudo -u gdm dbus-launch dconf reset -f / # replace 'gdm' with 'Debian-gdm' if you are using debian
sudo -u gdm dbus-launch gsettings set org.gnome.shell enabled-extensions "['gdm-extension@pratap.fastmail.fm']" # replace 'gdm' with 'Debian-gdm' if you are using debian
```

## Disabling the extension
Since this is a special extension which runs only on GDM, disabling is not possible as normal extensions.
The best way is to remove the extension. from the downloaded repository, run
`sudo make uninstall` and to install again, run `sudo make install`

<hr/>

<a href="https://www.buymeacoffee.com/pratappanabaka"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=pratappanabaka&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
