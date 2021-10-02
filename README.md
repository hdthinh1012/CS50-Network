# Network
Source: https://cs50.harvard.edu/web/2020/

## Description:
Project 4 Web Django Tutorial

## Requirement: 
Install dependent tools
```
pip install -r requirements.txt
```
Create python virtual machine in project directory
```
virtualenv -p python3 envname
```
Run redis for channels layer store 
```
sudo docker run -p 6379:6379 -d redis:5
```
## Run command:
```
python manage.py migrate
python manage.py runserver
```
