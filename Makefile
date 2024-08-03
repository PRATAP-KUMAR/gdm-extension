SHELL := /bin/bash

# Replace these with the name and domain of your extension!
NAME     := gdm-extension
DOMAIN   := pratap.fastmail.fm
UUID	 := $(NAME)@$(DOMAIN)
ZIP_NAME := $(UUID).zip

# Findout if 'Debian-gdm' user exists, other wise use 'gdm'
ifeq ($(shell getent passwd Debian-gdm > /dev/null 2&>1 && echo 1 || echo 0), 1)
	GDM_USER = Debian-gdm
else
	GDM_USER = gdm
endif

# Some of the recipes below depend on some of these files.
JS_FILES = $(shell find -type f -and \( -name "*.js" \))

# These files will be included in the extension zip file.
ZIP_CONTENT = $(JS_FILES) \
              schemas/* \
			  metadata.json \
			  stylesheet.css

.PHONY: install uninstall

zip: $(ZIP_NAME)

install: $(ZIP_NAME)
ifneq ($(shell id -u), 0)
	@echo "You must be root to perform this action."
else
	@rm -rf /usr/local/share/gnome-shell/extensions/$(UUID)
	@rm -rf /usr/local/share/glib-2.0/schemas/gschemas.compiled
	@mkdir -p /usr/local/share/gnome-shell/extensions
	@mkdir -p /usr/local/share/glib-2.0/schemas
	gnome-extensions install -f "$(ZIP_NAME)"
	@mv -f $(HOME)/.local/share/gnome-shell/extensions/$(UUID)/ /usr/local/share/gnome-shell/extensions/
	@glib-compile-schemas /usr/local/share/gnome-shell/extensions/$(UUID)/schemas --targetdir /usr/local/share/glib-2.0/schemas
	@xhost si:localuser:$(GDM_USER)
	@sudo -u $(GDM_USER) dbus-launch dconf reset -f /
	@sudo -u $(GDM_USER) dbus-launch gsettings set org.gnome.shell enabled-extensions "['$(UUID)']"
	@sudo -u $(GDM_USER) dbus-launch gsettings set org.gnome.desktop.peripherals.touchpad tap-to-click true
	@echo "gdm-extension is installed, you can tweak few things of GDM login screen from login screen itself."
	@exit
endif

uninstall:
ifneq ($(shell id -u), 0)
	@echo "You must be root to perform this action."
else
	@rm -rf $(ZIP_NAME)
	@rm -rf /usr/local/share/gnome-shell/extensions/$(UUID)
	@rm -rf /usr/local/share/glib-2.0/schemas/gschemas.compiled
	@glib-compile-schemas /usr/local/share/glib-2.0/schemas/
	@echo "gdm-extension is uninstalled, you may reset dconf for gdm user as mentioned in the README"
	@exit
endif

$(ZIP_NAME): $(ZIP_CONTENT)
ifneq ($(shell id -u), 0)
	@echo "You must be root to perform this action."
else
	@echo "Packing zip file..."
	@rm --force $(ZIP_NAME)
	@zip $(ZIP_NAME) -- $(ZIP_CONTENT)
endif