#!/bin/sh
# Encrypt the private CV data (manuscripts under review / revision) for the password-protected full CV.
#   1. cp tools/under_review.example.json tools/private/under_review.json   and edit it
#   2. ./tools/encrypt_cv.sh                                               (asks for the password twice)
# Writes site/assets/cv-private.enc (AES-256-CBC, PBKDF2-SHA256, 200k iterations). The plain JSON stays in
# tools/private/ which is git-ignored, so only the encrypted file is ever published.
exec python3 - "${1:-tools/private/under_review.json}" <<'PY'
import getpass, json, os, subprocess, sys

src, out = sys.argv[1], "site/assets/cv-private.enc"
if not os.path.isfile(src):
    sys.exit(f"Missing {src} — copy tools/under_review.example.json there and edit it.")
data = json.load(open(src))
items = data.get("manuscripts")
if not isinstance(items, list):
    sys.exit('The JSON needs a "manuscripts" list.')
print(f"{len(items)} manuscript(s) found:")
for m in items:
    print(f"  - [{m.get('status', '?')}] {m.get('short') or m.get('venue', '')}: {m.get('title', '')[:70]}")

print("\nType the password (nothing is shown while typing), then press Enter.")
p1 = getpass.getpass("Password for the full CV: ")
p2 = getpass.getpass("Repeat the password:      ")
if p1 != p2:
    sys.exit("The two passwords differ — nothing written.")
if len(p1) < 8:
    sys.exit("Please use at least 8 characters — nothing written.")

env = dict(os.environ, CVPASS=p1)
subprocess.run(["openssl", "enc", "-aes-256-cbc", "-pbkdf2", "-iter", "200000", "-md", "sha256", "-salt",
                "-pass", "env:CVPASS", "-base64", "-A", "-in", src, "-out", out], env=env, check=True)
print(f"\nDone. Encrypted → {out}  (commit and push this file; never commit {src})")
PY
