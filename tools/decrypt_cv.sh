#!/bin/sh
# Recover the plain private CV data from site/assets/cv-private.enc (the reverse of encrypt_cv.sh).
# Writes tools/private/under_review.json (git-ignored). Edit it, then run ./tools/encrypt_cv.sh again.
set -e
out="${1:-tools/private/under_review.json}"
mkdir -p "$(dirname "$out")"
printf "Password for the full CV: "; stty -echo; read -r CVPASS; stty echo; echo
export CVPASS
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -md sha256 -base64 -A -pass env:CVPASS \
  -in site/assets/cv-private.enc -out "$out" || { rm -f "$out"; echo "Wrong password — nothing written."; exit 1; }
echo "Decrypted → $out"
