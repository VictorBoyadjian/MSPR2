import requests, os

class Authorization():
    @staticmethod
    def verify_token(token: str) -> bool:
        host = os.environ.get("LARAVEL_HOST", "")
        port = os.environ.get("LARAVEL_PORT", "")
        path = os.environ.get("LARAVEL_ME_URL", "")

        if not host:
            return False

        if not host.startswith(("http://", "https://")):
            host = "http://" + host

        url = f"{host}:{port}{path}" if port else f"{host}{path}"

        try:
            response = requests.get(
                url,
                headers={"Authorization": "Bearer " + token},
                timeout=5,
            )
            return response.status_code == 200
        except requests.exceptions.RequestException:
            return False