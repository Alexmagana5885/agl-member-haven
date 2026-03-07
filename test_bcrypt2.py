import bcrypt

# Test with original PHP $2y$ hash directly
original_hash = '$2y$10$HXbddV.SQMA.6hrfnT4IwOHN2PQ2kOQZSZxnJmVjzdqEl/VkOFsVy'
print(f"Original hash: {original_hash}")

try:
    result = bcrypt.checkpw(b'test123', original_hash.encode('utf-8'))
    print(f"Password 'test123' matches: {result}")
except Exception as e:
    print(f"Error with original hash: {e}")

# Test with converted $2b$ hash
converted_hash = original_hash.replace('$2y$', '$2b$')
print(f"\nConverted hash: {converted_hash}")

try:
    result = bcrypt.checkpw(b'test123', converted_hash.encode('utf-8'))
    print(f"Password 'test123' matches: {result}")
except Exception as e:
    print(f"Error with converted hash: {e}")

