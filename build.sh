#!/bin/bash

SOURCE="${BASH_SOURCE[0]}"
while [[ -h "${SOURCE}" ]]; do # resolve ${SOURCE} until the file is no longer a symlink
    DIR="$( cd -P "$( dirname "${SOURCE}" )" && pwd )"
    SOURCE="$(readlink "${SOURCE}")"
    [[ ${SOURCE} != /* ]] && SOURCE="${DIR}/${SOURCE}" # if ${SOURCE} was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
CURRENT_DIR="$( cd -P "$( dirname "${SOURCE}" )" && pwd )"

cd "${CURRENT_DIR}"

NAME="hell-inc"

ARG="$1"
if [[ "${ARG}" == "--dev" ]];then
  IS_DEV_MODE="TRUE"
fi
if [[ "${ARG}" == "--dist" ]] || [[ "${ARG}" == "" ]];then
  IS_DIST="TRUE"
fi

rm -r ./app

if [[ "${IS_DEV_MODE}" == "TRUE" ]]; then
    ./node_modules/webpack/bin/webpack.js --mode development
else
    ./node_modules/webpack/bin/webpack.js
fi

cp -r ./static/* ./app/
cat ./static/index.html | tr '\n' ' ' | sed 's/  //g' > ./app/index.html

if [[ "${IS_DIST}" == "TRUE" ]]; then
  rm -r ./dist
  mkdir ./dist
  7z a -r ./dist/${NAME}.zip ./app/* -xr!*.map
  size=`du -b ./dist/${NAME}.zip | awk '{print $1}'`
  size_diff=$((size - 13312))
  if [[ ${size_diff} -gt 0 ]]; then
    echo -e "\e[93m\e[1m[WARNING] TOO BIG! File size is ${size} (${size_diff} over).\e[39m"
  else
  size_left=$((size_diff*-1))
    echo -e "\e[92m\e[1m[SUCCESS] File size under 13k: ${size} (${size_left} left).\e[39m"
  fi
fi
