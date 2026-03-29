#!/bin/bash

URL="http://localhost:3000/api/users/current"

TOKENS=($(cat tokens.txt))

TOTAL=${#TOKENS[@]}

echo "Total tokens: $TOTAL"

autocannon -c 1000 -d 20 \
  -H "Authorization: ${TOKENS[$RANDOM % $TOTAL]}" \
  $URL
