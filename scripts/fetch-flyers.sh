#!/usr/bin/env bash
# Pull new flyer photos out of the Telegram bot chat into ./flyers.
#
# There is no server in this setup: the bot is just an inbox. You send a poster from
# your phone whenever you see one, and this script collects whatever has arrived so
# Claude Code can read it here and write the seed migration.
#
# Telegram hands each update over once and then forgets it, so the offset is stored in
# flyers/.offset. Run it as often as you like; it only ever downloads what is new.
set -euo pipefail

cd "$(dirname "$0")/.."
set -a; . ./.env; set +a

: "${TG_TOKEN:?TG_TOKEN missing from .env}"
: "${TG_CHAT_ID:?TG_CHAT_ID missing from .env}"

API="https://api.telegram.org/bot$TG_TOKEN"
OUT="flyers"
OFFSET_FILE="$OUT/.offset"
mkdir -p "$OUT"

offset=$(cat "$OFFSET_FILE" 2>/dev/null || echo 0)
updates=$(curl -fsS "$API/getUpdates?offset=$offset&timeout=0")

if [ "$(printf '%s' "$updates" | python3 -c 'import sys,json; print(len(json.load(sys.stdin)["result"]))')" = "0" ]; then
    echo "Keine neuen Nachrichten."
    exit 0
fi

# One line per photo: <file_id> <date> <caption>. Anything that is not an image from the
# allowed chat is skipped, but still advances the offset so it is not re-fetched.
printf '%s' "$updates" | TG_CHAT_ID="$TG_CHAT_ID" python3 -c '
import json, os, sys
data = json.load(sys.stdin)
allowed = int(os.environ["TG_CHAT_ID"])
last = 0
for update in data["result"]:
    last = max(last, update["update_id"])
    message = update.get("message") or {}
    if message.get("chat", {}).get("id") != allowed:
        continue
    caption = (message.get("caption") or message.get("text") or "").replace("\n", " ")
    if message.get("photo"):
        best = message["photo"][-1]
        print("\t".join([best["file_id"], str(message["date"]), caption]))
    elif (message.get("document") or {}).get("mime_type", "").startswith("image/"):
        document = message["document"]
        print("\t".join([document["file_id"], str(message["date"]), caption]))
    elif caption:
        print("\t".join(["-", str(message["date"]), caption]))
print("OFFSET", last + 1, file=sys.stderr)
' 2>"$OUT/.last-offset" > "$OUT/.incoming"

awk '/^OFFSET/ {print $2}' "$OUT/.last-offset" > "$OFFSET_FILE"

count=0
while IFS=$'\t' read -r file_id date caption; do
    [ -z "${file_id:-}" ] && continue
    stamp=$(date -r "$date" +%Y-%m-%d_%H%M%S 2>/dev/null || echo "$date")

    if [ "$file_id" = "-" ]; then
        printf '%s\n' "$caption" > "$OUT/${stamp}.txt"
        echo "📝 $OUT/${stamp}.txt  $caption"
        continue
    fi

    path=$(curl -fsS "$API/getFile?file_id=$file_id" \
        | python3 -c 'import sys,json; print(json.load(sys.stdin)["result"]["file_path"])')
    ext="${path##*.}"
    target="$OUT/${stamp}.${ext}"
    curl -fsS -o "$target" "https://api.telegram.org/file/bot$TG_TOKEN/$path"

    [ -n "$caption" ] && printf '%s\n' "$caption" > "$OUT/${stamp}.caption.txt"
    echo "🖼  $target${caption:+  ($caption)}"
    count=$((count + 1))
done < "$OUT/.incoming"

rm -f "$OUT/.incoming" "$OUT/.last-offset"
echo "$count neue(s) Plakat(e) in $OUT/"
