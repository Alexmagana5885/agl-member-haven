import os
os.environ['TERM'] = 'xterm'

from werkzeug.security import check_password_hash

stored_hash = '$2y$10$HXbddV.SQMA.6hrfnT4IwOHN2PQ2kOQZSZxnJmVjzdqEl/VkOFsVy'
print(f"Original hash: {stored_hash}")

# Replace $2y$ with $2b$
converted = stored_hash.replace('$2y$', '$2b$')
print(f"Converted hash: {converted}")

# Test verification
result = check_password_hash(converted, 'test123')
print(f"Verification result: {result}")

