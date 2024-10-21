#! /bin/bash
set -e

NAME=gdm-extension
DOMAIN=pratap.fastmail.fm
UUID=$NAME@$DOMAIN
ZIP_NAME=$UUID.zip

# Findout gnome-shell version
SHELL_VERSION=$(gnome-shell --version | cut -d ' ' -f3 | cut -d '.' -f1)

if [[ $SHELL_VERSION -lt 42 ]]
then
    echo "This script is not for the gnome-shell versions below 42, Exiting with no changes."
    exit 1
fi

if [[ $(id -u) -ne 0 ]]
then
    echo "You must be root to perform this action".
    exit 1
fi

echo -e "\n     ~~~~~~~~~~~~~~~~\n     running script\n     ~~~~~~~~~~~~~~~~\n"

echo -e "\n     ~~~~~~~~~~~~~~~~\n     gnome-shell version $SHELL_VERSION detected\n     ~~~~~~~~~~~~~~~~\n"


# Findout if 'Debian-gdm' user exists, other wise use 'gdm'
if [[ $(getent passwd Debian-gdm > /dev/null 2&>1 && echo 1 || echo 0) -eq 1 ]]
then
	GDM_USER=Debian-gdm
else
	GDM_USER=gdm
fi

if [[ $SHELL_VERSION -ge 42 && $SHELL_VERSION -le 44 ]]
then
    cd src/v-42-43-44
else
    cd src/v-45-46-47
fi

echo -e "\n     ~~~~~~~~~~~~~~~~\n     Creating zip file from the directory ${PWD##*/}\n     ~~~~~~~~~~~~~~~~\n"

zip -qr $ZIP_NAME ./* && echo -e "\n     ~~~~~~~~~~~~~~~~\n     zip file created\n     ~~~~~~~~~~~~~~~~\n"

echo -e "\n     ~~~~~~~~~~~~~~~~\n     Doing the main stuff\n     ~~~~~~~~~~~~~~~~\n"

rm -rf /usr/local/share/gnome-shell/extensions/$UUID
rm -rf /usr/local/share/glib-2.0/schemas/gschemas.compiled
mkdir -p /usr/local/share/gnome-shell/extensions
mkdir -p /usr/local/share/glib-2.0/schemas
gnome-extensions install -f $ZIP_NAME
mv -f $HOME/.local/share/gnome-shell/extensions/$UUID/ /usr/local/share/gnome-shell/extensions/
glib-compile-schemas /usr/local/share/gnome-shell/extensions/$UUID/schemas --targetdir /usr/local/share/glib-2.0/schemas
xhost si:localuser:$GDM_USER
sudo -u $GDM_USER dbus-launch gsettings set org.gnome.shell enabled-extensions "['$UUID']"
xhost -si:localuser:$GDM_USER
rm -rf $ZIP_NAME
echo -e "\n     ~~~~~~~~~~~~~~~~\n     gdm-extension is installed, you can tweak few things of GDM login screen from the login screen itself with this extension\n     ~~~~~~~~~~~~~~~~\n"
exit 0
