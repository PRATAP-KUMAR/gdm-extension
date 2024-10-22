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

rm -rf /usr/local/share/gnome-shell/extensions/$UUID
echo -e "\n~~~~~ gdm-extension is uninstalled ~~~~~\n"
