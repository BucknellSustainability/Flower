module load python/3.6
#pip install --user --upgrade google-auth flask-mysql flask-cors
cd ../backend
export FLASK_APP=api.py
flask run --host=0.0.0.0 --port=5001

