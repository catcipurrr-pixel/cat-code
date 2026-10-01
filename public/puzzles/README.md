Cipher files are fetched by the site only after the countdown reaches zero.

Upload `round-<id>.json` here (or wherever NEXT_PUBLIC_CIPHER_URL_TEMPLATE points) **at unlock time**, e.g.:

    { "title": "Round 0", "cipher": "<cipher text with the salt hidden inside>", "hint": "optional" }

Never put the plaintext answer (or anything that is the answer) in these files. Files in `public/` are publicly
downloadable as soon as they are deployed, so do not deploy a round's file before its unlock time.
