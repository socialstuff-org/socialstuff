#!/bin/sh

echo '{' > tsconfig.compodoc.json
echo '  "extends": "./tsconfig.json",' >> tsconfig.compodoc.json
echo '  "files": [' >> tsconfig.compodoc.json
for i in $(find src/app/ src/lib/ -name "*.ts")
do
   echo '    "'$i'",' >> tsconfig.compodoc.json
done
echo '  ],' >> tsconfig.compodoc.json
echo '}' >> tsconfig.compodoc.json
npx @compodoc/compodoc -p tsconfig.compodoc.json
rm tsconfig.compodoc.json