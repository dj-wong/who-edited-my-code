#!/usr/bin/env bash
# generate JSON with class structures with functions
# http://bl.ocks.org/d3noob/8375092

python ./src/python/createClassDiagram.py &
P1=$!
echo 'Running createClassDiagram.py to creating class diagram'

python ./src/python/createUserDictionary.py &
P2=$!

echo 'Running createUserDictionary.py to creating user dictionary'
wait $P1 $P2

echo 'Done creating data, opening web page now'

open ./src/web/index.html



# open html which also runs JS