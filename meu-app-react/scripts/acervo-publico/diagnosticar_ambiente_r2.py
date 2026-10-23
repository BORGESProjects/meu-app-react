import os
from pathlib import Path


CHAVES = (
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEY",
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
)


def main():
    local = {}
    env_path = Path(".env.local")
    if env_path.is_file():
        for line in env_path.read_text(encoding="utf-8-sig").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                key, value = line.split("=", 1)
                local[key.strip()] = value.strip().strip('"\'')
    for key in CHAVES:
        print(f"{key}: .env.local={'configurada' if local.get(key) else 'ausente'}, ambiente={'configurado' if os.environ.get(key) else 'ausente'}")


if __name__ == "__main__":
    main()
