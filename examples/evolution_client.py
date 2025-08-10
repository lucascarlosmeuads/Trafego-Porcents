
# Simple Python client (Python 3.11+ recommended)
# Usage:
#   BASE_URL=http://72.60.7.194:8081 API_KEY=51bf0f74a62dac67f6ad9f45ae2c319a python examples/evolution_client.py

import os
import json
import urllib.request

BASE_URL = os.getenv("BASE_URL", "http://72.60.7.194:8081").rstrip("/")
API_KEY = os.getenv("API_KEY", "51bf0f74a62dac67f6ad9f45ae2c319a")

def http(path: str, method: str = "GET", body: dict | None = None, timeout: int = 10):
    req = urllib.request.Request(
        url=f"{BASE_URL}{path}",
        method=method,
        headers={
            "apikey": API_KEY,
            "Content-Type": "application/json",
        },
        data=json.dumps(body).encode("utf-8") if body is not None else None,
    )
    with urllib.request.urlopen(req, timeout=timeout) as res:
        status = res.status
        text = res.read().decode("utf-8")
    try:
        data = json.loads(text) if text else {}
    except Exception:
        data = text
    return {"status": status, "data": data}

def get_health():
    return http("/")

def get_connection_state(instance: str):
    return http(f"/instance/connectionState/{instance}")

def send_text(instance: str, number: str, text: str):
    return http(f"/message/sendText/{instance}", method="POST", body={"number": number, "text": text})

if __name__ == "__main__":
    print("Health:", get_health())
    instance = os.getenv("INSTANCE", "lucas")
    number = os.getenv("NUMBER", "554892095244")
    print("State:", get_connection_state(instance))
    print("Send:", send_text(instance, number, "Teste via Evolution ✅"))
