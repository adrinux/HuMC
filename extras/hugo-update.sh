#!/bin/bash
# Version 0.21.2  8:26 PST, Nov 9, 2018

# Adjusted by Adrian Simmons (aka adrinux) and bumped by .2
# because Arch based distros have no 'arch' command and
# need to use 'uname -m' instead
# Also now only downloads extended hugo version

# Original by David Kebler aka dkebler see gist:
# https://gist.github.com/dkebler/1188d098d62166fdc6065fb2658a71dd

# Inspired from this forum post  https://discourse.gohugo.io/t/script-to-install-latest-hugo-release-on-macos-and-ubuntu/14774/10

# If you have run into github api anonymous access limits which happens during debugging/dev then add user and token here or sourced from a separate file
# . githubapitoken
#GITHUB_USER=""
#GITHUB_TOKEN=""

if [ "$GITHUB_TOKEN" != "" ]; then
echo using access token with script
echo "$GITHUB_USER $GITHUB_TOKEN"
fi

FORCE=false

# options
# f - force download/overwrite of same version


while getopts 'ecf' OPTION; do
  case "$OPTION" in
    f)
        echo "FORCING download/overwrite"
        FORCE=true
      ;;
    *)
        echo "Unrecognised command line option, aborting..."
        exit 1
  esac
done

shift $(( OPTIND - 1 ))

DEFAULT_BIN_DIR="/usr/local/bin"
# Single optional argument is directory in which to install hugo
BIN_DIR=${1:-"$DEFAULT_BIN_DIR"}

BIN_PATH="$(which hugo)"
declare -A ARCHES
ARCHES=( ["arm64"]="arm64" ["aarch64"]="arm64"  ["x86_64"]="64bit" ["arm32"]="arm"  ["armhf"]="arm" )
if command -v arch &> /dev/null
then
  ARCH=$(arch)
else
  ARCH=$(uname -m)
fi

if [ -z "${ARCHES[$ARCH]}" ]; then
  echo  "Your machine kernel architecture $ARCH is not supported by this script, aborting"
  exit 1
fi


INSTALLED="$(hugo version 2>/dev/null | cut -d'v' -f2 | cut -c 1-6)"
CUR_VERSION=${INSTALLED:-"None"}
echo $(curl -u "$GITHUB_USER":"$GITHUB_TOKEN" -s https://api.github.com/repos/gohugoio/hugo/releases/latest | grep tag_name)
NEW_VERSION="$(curl -u "$GITHUB_USER:$GITHUB_TOKEN" -s https://api.github.com/repos/gohugoio/hugo/releases/latest  \
             | grep tag_name \
             | cut -d'v' -f2 | cut -c 1-6)"

echo "Hugo Extended Current Version : $CUR_VERSION => New Version: $NEW_VERSION"

if [ -z "$NEW_VERSION" ]; then
  echo  Unable to retrieve new version number - Likely you have reached github anonymous limit
  echo  set environment variable "$GITHUB_USER" and "$GITHUB_TOKEN" and try again
  exit 1
fi

if ! [ "$NEW_VERSION" = "$CUR_VERSION" ] || [ $FORCE = true ]; then

  pushd /tmp/ > /dev/null || exit

  # https://github.com/gohugoio/hugo/releases/download/v0.122.0/hugo_extended_0.122.0_linux-arm64.tar.gz

  URL=$(curl -u "$GITHUB_USER":"$GITHUB_TOKEN" -s https://api.github.com/repos/gohugoio/hugo/releases/latest \
  | grep "browser_download_url.*hugo_extended.*._[Ll]inux-${ARCHES[$ARCH]}\.tar\.gz" \
  | cut -d ":" -f 2,3 \
  | tr -d \" \
  )

  echo "Download URL: $URL"

  echo "Installing version $NEW_VERSION"
  echo "This machine's architecture is $ARCH"
  echo "Downloading Tarball $URL"

  #wget --user=-u "$GITHUB_USER" --password="$GITHUB_TOKEN" -q "$URL"
  # shellcheck disable=SC2086
  wget $URL

  TARBALL=$(basename "$URL")
  # TARBALL="$(find . -name "*Linux-${ARCHES[$ARCH]}.tar.gz" 2>/dev/null)"
  echo Expanding Tarball, "$TARBALL"
  tar -xzf "$TARBALL" hugo

  chmod +x hugo

if [ -w "$BIN_DIR" ]; then
  echo "Installing hugo to $BIN_DIR"
  mv hugo -f "$BIN_DIR"/hugo
else
    echo "installing hugo to $BIN_DIR (sudo)"
    sudo mv -f hugo "$BIN_DIR"/hugo
fi

rm "$TARBALL"

  popd > /dev/null || exit

  echo Installing hugo

  BIN_PATH="$(which hugo)"
  if [ -z "$BIN_PATH" ]; then
  printf "WARNING: Installed Hugo Binary in $BIN_DIR is not in your environment path\nPATH=$PATH\n"
else
  if [ "$BIN_DIR/hugo" != "$BIN_PATH" ]; then
  echo "WARNING: Just installed Hugo binary hugo to, $BIN_DIR , conflicts with existing Hugo in $BIN_PATH"
  echo "add $BIN_DIR to path and delete $BIN_PATH"
else
  echo "--- Installation Confirmation ---"
  printf "New Hugo binary version at $BIN_PATH is\n $($BIN_PATH version)\n"
  fi
fi

else
  echo "Latest version already installed at $BIN_PATH"
fi
