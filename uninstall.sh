#!/bin/bash
set -e

NAME=gdm-extension
DOMAIN=pratap.fastmail.fm
UUID=$NAME@$DOMAIN
ZIP_NAME=$UUID.zip

if [[ $(id -u) -ne 0 ]]
then
    echo "You must be root to perform this action".
    exit 1
fi

# Findout if 'Debian-gdm' user exists, other wise use 'gdm'
if [[ -z $(getent passwd Debian-gdm) ]]
then
	GDM_USER=gdm
else
	GDM_USER=Debian-gdm
fi

rm -rf /usr/local/share/gnome-shell/extensions/$UUID
xhost si:localuser:$GDM_USER > /dev/null
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/shell/enabled-extensions
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/shell/disabled-extensions
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/desktop/peripherals/touchpad/tap-to-click
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/desktop/interface/show-battery-percentage
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/desktop/interface/clock-show-date
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/desktop/interface/clock-show-seconds
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/desktop/interface/clock-show-weekday
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/desktop/interface/clock-format
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/login-screen/disable-restart-buttons
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/login-screen/disable-user-list
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/login-screen/banner-message-enable
sudo -u $GDM_USER dbus-launch dconf reset /org/gnome/login-screen/logo
xhost -si:localuser:$GDM_USER > /dev/null

echo -e "\n~~~~~ gdm-extension is uninstalled ~~~~~\n"
