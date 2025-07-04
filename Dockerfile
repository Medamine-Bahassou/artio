# Dockerfile for Flask app

# 1. Install dependencies
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

# 2. Copy app files
COPY . .

# 3. Run app
EXPOSE 5000
CMD ["python", "flask_app.py"]
