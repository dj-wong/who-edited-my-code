#!/usr/bin/env bash

if [ $# -eq 0 ]
  then
    echo "No arguments supplied"
fi

echo $1

python ./src/gen-data/python/createClassDiagram.py -p $1 &
P1=$!
echo 'Running createClassDiagram.py to creating class diagram'

exit_status=0
wait $P1; (( exit_status |= $? ))

# if [ $exit_status -eq 0 ]
#     then echo 'Done creating data, opening web page now' && open ./src/web/index.html
# fi

exit $exit_status
