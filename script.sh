#!/usr/bin/env bash

if [ $# -eq 0 ]
  then
    echo "No arguments supplied"
fi

echo $1

python ./src/python/createClassDiagram.py -p $1 &
P1=$!
echo 'Running createClassDiagram.py to creating class diagram'

python ./src/python/createUserDictionary.py $1 &
P2=$!

echo 'Running createUserDictionary.py to creating user dictionary'
wait $P1 $P2

exit_status=0
wait $P1; (( exit_status |= $? ))
wait $P2; (( exit_status |= $? ))

# if [ $exit_status -eq 0 ]
#     then echo 'Done creating data, opening web page now' && open ./src/web/index.html
# fi

exit $exit_status