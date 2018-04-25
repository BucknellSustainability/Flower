#!/bin/bash
module load python/3.6
cd ..

until python start_flask.py; do
    echo "'start_flask.py' crashed with exit code $?. Restarting..." >&2
    sleep 1
done
