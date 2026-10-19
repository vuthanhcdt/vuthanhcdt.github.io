#!/bin/sh
# Encrypt the private CV data (manuscripts under review / revision) for the password-protected full CV.
#   1. cp tools/under_review.example.json tools/private/under_review.json   and edit it
#   2. ./tools/encrypt_cv.sh                                               (asks for the password twice)
# Writes site/assets/cv-private.enc (AES-256-CBC, PBKDF2-SHA256, 200k iterations). The plain JSON stays in
# tools/private/ which is git-ignored, so only the encrypted file is ever published.
set -e
SRC="${1:-tools/private/under_review.json}"
OUT="site/assets/cv-private.enc"
[ -f "$SRC" ] || { echo "Missing $SRC — copy tools/under_review.example.json there and edit it."; exit 1; }
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); assert isinstance(d.get('manuscripts'),list); print(len(d['manuscripts']),'manuscript(s) found')" "$SRC"
printf "Password for the full CV: "; stty -echo; read -r P1; stty echo; echo
printf "Repeat the password: ";      stty -echo; read -r P2; stty echo; echo
[ "$P1" = "$P2" ] || { echo "The two passwords differ — nothing written."; exit 1; }
[ ${#P1} -ge 8 ] || { echo "Please use at least 8 characters — nothing written."; exit 1; }
CVPASS="$P1" openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -md sha256 -salt -pass env:CVPASS -base64 -A -in "$SRC" -out "$OUT"
unset P1 P2
echo "Encrypted → $OUT  (commit and push this file; never commit $SRC)"
