# Developer Guide - Using Constants and Validators

This guide shows you how to use the new centralized constants and validation utilities in your code.

---

## Table of Contents

1. [Using Constants](#using-constants)
2. [Using Validators](#using-validators)
3. [Best Practices](#best-practices)
4. [Examples](#examples)

---

## Using Constants

### Importing Constants

```javascript
// Import specific constants you need
const { 
    HTTP_STATUS, 
    ERROR_MESSAGES, 
    SUCCESS_MESSAGES,
    CONTENT_TYPES,
    USER_ROLES 
} = require('../constants');

// Or import all constants
const constants = require('../constants');
```

### HTTP Status Codes

**Before:**
```javascript
res.status(200).json({ success: true });
res.status(400).json({ success: false });
res.status(401).json({ success: false });
```

**After:**
```javascript
res.status(HTTP_STATUS.OK).json({ success: true });
res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false });
res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false });
```

### Error Messages

**Before:**
```javascript
return res.status(401).json({
    success: false,
    message: 'Invalid email or password'
});
```

**After:**
```javascript
return res.status(HTTP_STATUS.UNAUTHORIZED).json({
    success: false,
    message: ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS
});
```

### Success Messages

**Before:**
```javascript
res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user, token }
});
```

**After:**
```javascript
res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: SUCCESS_MESSAGES.AUTH_REGISTER_SUCCESS,
    data: { user, token }
});
```

### Content Types

**Before:**
```javascript
if (contentType === 'text') {
    // handle text
} else if (contentType === 'video') {
    // handle video
}
```

**After:**
```javascript
if (contentType === CONTENT_TYPES.TEXT) {
    // handle text
} else if (contentType === CONTENT_TYPES.VIDEO) {
    // handle video
}
```

### User Roles

**Before:**
```javascript
if (user.role === 'instructor') {
    // instructor logic
}
```

**After:**
```javascript
if (user.role === USER_ROLES.INSTRUCTOR) {
    // instructor logic
}
```

---

## Using Validators

### Importing Validators

```javascript
const {
    validateRequiredFields,
    validateEmail,
    validateUserRole,
    validateContentType,
    validatePassword
} = require('../utils/validators');
```

### Validate Required Fields

```javascript
const requiredValidation = validateRequiredFields(req.body, ['email', 'password', 'name']);

if (!requiredValidation.valid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Missing required fields: ${requiredValidation.missingFields.join(', ')}`
    });
}
```

### Validate Email

```javascript
if (!validateEmail(email)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Please provide a valid email address'
    });
}
```

### Validate Password

```javascript
const passwordValidation = validatePassword(password);

if (!passwordValidation.valid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: passwordValidation.message
    });
}
```

### Validate User Role

```javascript
const roleValidation = validateUserRole(role);

if (!roleValidation.valid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: roleValidation.message
    });
}
```

### Validate Content Type

```javascript
const contentTypeValidation = validateContentType(contentType);

if (!contentTypeValidation.valid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: contentTypeValidation.message
    });
}
```

### Validate MCQ Options

```javascript
const optionsValidation = validateMCQOptions(options);

if (!optionsValidation.valid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: optionsValidation.message
    });
}
```

### Validate Price

```javascript
const priceValidation = validatePrice(price);

if (!priceValidation.valid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: priceValidation.message
    });
}
```

---

## Best Practices

### 1. Always Use Constants for Status Codes

❌ **Don't:**
```javascript
res.status(200).json({ success: true });
```

✅ **Do:**
```javascript
res.status(HTTP_STATUS.OK).json({ success: true });
```

### 2. Use Standardized Messages

❌ **Don't:**
```javascript
message: 'User created successfully'
message: 'User registered successfully'
message: 'Registration successful'
```

✅ **Do:**
```javascript
message: SUCCESS_MESSAGES.AUTH_REGISTER_SUCCESS
```

### 3. Validate Early, Return Early

✅ **Good Pattern:**
```javascript
const register = async (req, res, next) => {
    try {
        // Validate required fields first
        const requiredValidation = validateRequiredFields(req.body, ['email', 'password']);
        if (!requiredValidation.valid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: `Missing: ${requiredValidation.missingFields.join(', ')}`
            });
        }

        // Validate email format
        if (!validateEmail(email)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Continue with business logic...
    } catch (error) {
        next(error);
    }
};
```

### 4. Group Related Validations

```javascript
// Validate all input first
const requiredValidation = validateRequiredFields(req.body, ['email', 'password', 'role']);
const emailValidation = validateEmail(email);
const passwordValidation = validatePassword(password);
const roleValidation = validateUserRole(role);

// Check all validations
if (!requiredValidation.valid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Missing: ${requiredValidation.missingFields.join(', ')}`
    });
}

if (!emailValidation) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid email format'
    });
}

// ... continue
```

### 5. Use Descriptive Variable Names

✅ **Good:**
```javascript
const requiredValidation = validateRequiredFields(req.body, ['email', 'password']);
const passwordValidation = validatePassword(password);
const roleValidation = validateUserRole(role);
```

❌ **Bad:**
```javascript
const result1 = validateRequiredFields(req.body, ['email', 'password']);
const result2 = validatePassword(password);
const result3 = validateUserRole(role);
```

---

## Complete Example

Here's a complete example of a well-structured controller function:

```javascript
/**
 * Register a new user
 * 
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
    try {
        const { email, password, name, role } = req.body;

        // ========================================
        // VALIDATION
        // ========================================
        
        // Check required fields
        const requiredValidation = validateRequiredFields(
            req.body, 
            ['email', 'password', 'name', 'role']
        );
        
        if (!requiredValidation.valid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: `Missing: ${requiredValidation.missingFields.join(', ')}`
            });
        }

        // Validate email format
        if (!validateEmail(email)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: passwordValidation.message
            });
        }

        // Validate role
        const roleValidation = validateUserRole(role);
        if (!roleValidation.valid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: roleValidation.message
            });
        }

        // ========================================
        // BUSINESS LOGIC
        // ========================================

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: ERROR_MESSAGES.RESOURCE_ALREADY_EXISTS
            });
        }

        // Create user
        const user = await User.create({ email, password, name, role });

        // Generate token
        const token = generateToken({ 
            id: user.id, 
            email: user.email, 
            role: user.role 
        });

        // ========================================
        // RESPONSE
        // ========================================

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.AUTH_REGISTER_SUCCESS,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        next(error);
    }
};
```

---

## Available Constants Reference

### HTTP_STATUS
- `OK` - 200
- `CREATED` - 201
- `BAD_REQUEST` - 400
- `UNAUTHORIZED` - 401
- `FORBIDDEN` - 403
- `NOT_FOUND` - 404
- `CONFLICT` - 409
- `INTERNAL_SERVER_ERROR` - 500

### CONTENT_TYPES
- `TEXT` - 'text'
- `VIDEO` - 'video'
- `AUDIO` - 'audio'

### USER_ROLES
- `INSTRUCTOR` - 'instructor'
- `LEARNER` - 'learner'

### QUESTION_TYPES
- `MCQ` - 'mcq'
- `QUIZ` - 'quiz'

### COURSE_STATUS
- `ACTIVE` - 'active'
- `INACTIVE` - 'inactive'

### TRANSACTION_STATUS
- `PENDING` - 'pending'
- `COMPLETED` - 'completed'
- `FAILED` - 'failed'
- `CANCELLED` - 'cancelled'

### Configuration Constants
- `DEFAULT_PASSING_SCORE` - 70
- `DEFAULT_COURSE_PRICE` - 100
- `READING_SPEED_WPM` - 200
- `MIN_READING_TIME_SECONDS` - 10
- `MIN_MCQ_OPTIONS` - 2
- `DEFAULT_QUESTION_POINTS` - 1

---

## Available Validators Reference

### validateRequiredFields(data, fields)
Returns: `{ valid: boolean, missingFields: string[] }`

### validateEmail(email)
Returns: `boolean`

### validatePassword(password)
Returns: `{ valid: boolean, message: string }`

### validateUserRole(role)
Returns: `{ valid: boolean, message: string }`

### validateContentType(contentType)
Returns: `{ valid: boolean, message: string }`

### validateQuestionType(questionType)
Returns: `{ valid: boolean, message: string }`

### validateMCQOptions(options)
Returns: `{ valid: boolean, message: string }`

### validateUUID(uuid)
Returns: `boolean`

### validateRange(value, min, max)
Returns: `{ valid: boolean, message: string }`

### validatePrice(price)
Returns: `{ valid: boolean, message: string }`

### sanitizeString(str)
Returns: `string`

---

## Questions?

If you have questions about using constants or validators, please refer to:
- `src/constants/index.js` - All available constants
- `src/utils/validators.js` - All validation functions
- `REFACTORING_SUMMARY.md` - Overview of changes

---

**Last Updated:** 2026-01-16
