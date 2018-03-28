#!/bin/bash
#source activate e2
#source .conda/envs/e2/bin/activate e2
module load python/3.6
cd ..

until python start_flask.py; do
    echo "'start_flask.py' crashed with exit code $?. Restarting..." >&2
    sleep 1
done
