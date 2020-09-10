#!/bin/bash
apt-get update -y
apt-get install jq -y
for file in /data/app/data/toImport/*
do
    echo $file
    response=$(curl -F file=@$file -H "X-Rewrite-URL: test" http://file/files | jq '.data.id')
    echo $response
done