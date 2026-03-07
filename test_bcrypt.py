import bcrypt

# Original PHP bcrypt hash
original_hash = '$2y$10$HXbddV.SQMA.6hrfnT4IwOHN2PQ2kOQZSZxnJmVjzdqEl/VkOFsVy'
print(f"Original hash: {original_hash}")

# Convert PHP $2y$ to standard $2b$
converted_hash = original_hash.replace('$2y$', '$2b$')
print(f"Converted hash: {converted_hash}")

# Test with bcrypt
password = b'test123'
result = bcrypt.checkpw(password, converted_hash.encode('utf-8'))
print(f"Password 'test123' matches: {result}")

