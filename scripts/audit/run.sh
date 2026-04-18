#!/bin/bash
set -a
source .env
set +a
npx tsx "$@"
