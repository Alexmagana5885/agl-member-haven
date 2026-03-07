import bcrypt

# New password hash for "test123"
new_hash = '$2b$12$1gWHn0.xQTRIxRsfZOGCBeAalFbqYOQVqkFgCQL7UotrijkvGrEhi'
print(f"Testing new hash: {new_hash}")

# Test with bcrypt
result = bcrypt.checkpw(b'test123', new_hash.encode('utf-8'))
print(f"Password 'test123' matches: {result}")

