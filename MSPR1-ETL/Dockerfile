FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p data/raw data/cleaned

EXPOSE 5000

CMD gunicorn --bind 0.0.0.0:${PORT:-5000} --workers 1 --timeout 120 -k uvicorn.workers.UvicornWorker app:app