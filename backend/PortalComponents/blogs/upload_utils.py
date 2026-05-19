import os
import uuid
from werkzeug.utils import secure_filename


def allowed_image_file(filename: str) -> bool:
    filename = filename.lower()
    return filename.endswith((".png", ".jpg", ".jpeg", ".webp", ".gif"))


def save_uploaded_file(file_storage, *, upload_dir: str, subdir: str) -> str:
    """Save an uploaded file and return a relative path used by the DB/front-end."""
    if not os.path.isdir(upload_dir):
        os.makedirs(upload_dir, exist_ok=True)

    original_name = file_storage.filename or "upload"
    original_name = secure_filename(original_name)
    ext = os.path.splitext(original_name)[1].lower()

    filename = f"{int(uuid.uuid4().int)}{ext}"
    save_path = os.path.join(upload_dir, filename)
    file_storage.save(save_path)

    # return path relative to repo public/assets, matching existing code style
    return os.path.join("..", "assets", subdir, filename).replace("\\", "/")

