# Registration Module

This module handles user registration for both organizations and individuals.

## Structure

- `__init__.py` - Package initialization
- `service.py` - Registration business logic and database operations
- `routes.py` - Flask blueprint with registration endpoints

## API Endpoints

### POST `/api/auth/register/organisation`
Register a new organization.

**Form Data:**
```
organizationName: string
organizationEmail: string
contactPerson: string
contactPhone: string
organizationAddress: string
country: string
county: string
town: string
organizationType: string
startDate: date
whatYouDo: string
password: string
registrationDate: date (optional)

Files:
logoFile: image
certificateFile: document
```

**Response:**
```json
{
  "status": "success",
  "id": "organization_id",
  "message": "Organization registered successfully"
}
```

### POST `/api/auth/register/individual`
Register a new individual member.

**Form Data:**
```
name: string
email: string
phone: string
gender: string
homeAddress: string
highestDegree: string
institution: string
graduationYear: integer
profession: string
experience: string
currentCompany: string
position: string
workAddress: string
password: string

Files:
passportFile: image
completionLetterFile: document
```

**Response:**
```json
{
  "status": "success",
  "id": "person_id",
  "message": "Individual registered successfully"
}
```

## Features

✅ Secure password hashing before storage
✅ File upload handling with security (secure_filename)
✅ organized file storage (logos, certificates, passports, completion_letters)
✅ Error handling and validation
✅ Database integration
