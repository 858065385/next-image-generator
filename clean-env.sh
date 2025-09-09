#!/usr/bin/env bash
# clean-env.sh
# 用法：./clean-env.sh preview   或   ./clean-env.sh production

set -e

ENV_TARGET=${1:-preview}         # 默认删 preview，传 prod 则删 prod
KEEP_PREFIX="^VERCEL_"           # 想保留的变量前缀，按需改

echo ">>> Deleting env vars in [$ENV_TARGET] (except $KEEP_PREFIX*)"

vercel env ls "$ENV_TARGET" --json \
| jq -r --arg KEEP "$KEEP_PREFIX" '
    .envs[]
    | select(.key | test($KEEP) | not)
    | .key
' \
| xargs -I {} vercel env rm {} "$ENV_TARGET" --yes