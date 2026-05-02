with open('routes.py', 'r') as f:
    content = f.read()

# Fix the literal newlines in the inserted code
content = content.replace('\\\\n', '\\n').replace('\\\"\\\"\\\"', '\"\"\"')

with open('routes_fixed.py', 'w') as f:
    f.write(content)

print("Fixed syntax in routes_fixed.py - rename to routes.py")

