# Database Migration Guide

This guide provides instructions for migrating your database to remove the unused `mcqContent` column from the `courses` table.

---

## Overview

The `mcqContent` field in the `courses` table is no longer used. The LMS now uses a separate `questions` table for exam management, making this field obsolete.

**Field to Remove:**
- Table: `courses`
- Column: `mcqContent`
- Type: JSONB
- Status: Unused (safe to remove)

---

## Before You Begin

### 1. Backup Your Database

**IMPORTANT:** Always backup your database before running migrations!

```bash
# PostgreSQL backup
pg_dump -U your_username -d lms_database > backup_$(date +%Y%m%d_%H%M%S).sql

# Or using environment variables
pg_dump -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Verify No Data in mcqContent

Run this query to check if any courses are using the `mcqContent` field:

```sql
SELECT COUNT(*) as count_with_mcq
FROM courses
WHERE "mcqContent" IS NOT NULL;
```

**Expected Result:** `count_with_mcq = 0`

If the count is greater than 0, you may want to migrate that data to the `questions` table first.

---

## Migration Options

### Option 1: Direct SQL (Recommended for Production)

#### Step 1: Create Migration File

Create a new file: `migrations/remove_mcqContent_column.sql`

```sql
-- Migration: Remove unused mcqContent column from courses table
-- Date: 2026-01-16
-- Description: The mcqContent field is no longer used. Exams are now managed
--              through the separate questions table.

BEGIN;

-- Check if column exists before dropping
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'courses' 
        AND column_name = 'mcqContent'
    ) THEN
        -- Drop the column
        ALTER TABLE courses DROP COLUMN "mcqContent";
        RAISE NOTICE 'Column mcqContent dropped successfully';
    ELSE
        RAISE NOTICE 'Column mcqContent does not exist, skipping';
    END IF;
END $$;

COMMIT;
```

#### Step 2: Run Migration

```bash
# Connect to your database and run the migration
psql -U your_username -d lms_database -f migrations/remove_mcqContent_column.sql

# Or using environment variables
psql -U $DB_USER -d $DB_NAME -f migrations/remove_mcqContent_column.sql
```

#### Step 3: Verify

```sql
-- Verify the column is removed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND column_name = 'mcqContent';

-- Expected: 0 rows returned
```

---

### Option 2: Using Sequelize CLI

If you're using Sequelize migrations:

#### Step 1: Create Migration

```bash
npx sequelize-cli migration:generate --name remove-mcqContent-column
```

#### Step 2: Edit Migration File

Edit the generated file in `migrations/XXXXXXXXXXXXXX-remove-mcqContent-column.js`:

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if column exists
    const tableDescription = await queryInterface.describeTable('courses');
    
    if (tableDescription.mcqContent) {
      await queryInterface.removeColumn('courses', 'mcqContent');
      console.log('✅ Column mcqContent removed successfully');
    } else {
      console.log('ℹ️  Column mcqContent does not exist, skipping');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback: Re-add the column if needed
    await queryInterface.addColumn('courses', 'mcqContent', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Legacy MCQ content (deprecated)'
    });
    console.log('⚠️  Column mcqContent restored (rollback)');
  }
};
```

#### Step 3: Run Migration

```bash
npx sequelize-cli db:migrate
```

#### Step 4: Verify

```bash
npx sequelize-cli db:migrate:status
```

---

### Option 3: Manual SQL (Quick Method)

For development environments, you can run this directly:

```sql
-- Simple drop column
ALTER TABLE courses DROP COLUMN IF EXISTS "mcqContent";
```

**Note:** This is the quickest method but doesn't provide rollback capability.

---

## Verification Steps

After running the migration, verify everything is working:

### 1. Check Database Schema

```sql
-- List all columns in courses table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'courses'
ORDER BY ordinal_position;
```

**Expected:** `mcqContent` should NOT be in the list.

### 2. Test Application

```bash
# Start your application
npm start

# Test these endpoints:
# - POST /api/instructor/courses (create course)
# - GET /api/courses (list courses)
# - GET /api/courses/:id (get course details)
```

### 3. Check for Errors

Monitor your application logs for any errors related to `mcqContent`.

---

## Rollback (If Needed)

If you need to rollback the migration:

### Using Sequelize CLI

```bash
npx sequelize-cli db:migrate:undo
```

### Using SQL

```sql
-- Restore the column
ALTER TABLE courses ADD COLUMN "mcqContent" JSONB;
```

---

## Production Deployment Checklist

- [ ] Backup database
- [ ] Verify no data in `mcqContent` column
- [ ] Test migration in staging environment
- [ ] Schedule maintenance window (if needed)
- [ ] Run migration
- [ ] Verify application functionality
- [ ] Monitor for errors
- [ ] Update documentation

---

## Troubleshooting

### Error: Column does not exist

**Cause:** The column has already been removed.

**Solution:** This is fine! The migration has already been applied.

### Error: Permission denied

**Cause:** Database user doesn't have ALTER TABLE permissions.

**Solution:** Run as a superuser or grant necessary permissions:

```sql
GRANT ALTER ON TABLE courses TO your_username;
```

### Application Errors After Migration

**Cause:** Code is still trying to access `mcqContent`.

**Solution:** 
1. Search codebase for `mcqContent` references
2. Update or remove those references
3. Restart application

```bash
# Search for mcqContent references
grep -r "mcqContent" src/
```

---

## Post-Migration Cleanup

After successful migration:

### 1. Update Model Definition

The Course model has already been updated to remove `mcqContent`. Verify:

```javascript
// src/models/course.model.js
// Should NOT contain mcqContent field
```

### 2. Update API Documentation

Verify Swagger/OpenAPI docs don't reference `mcqContent`:

```bash
# Check for references
grep -r "mcqContent" src/routes/
```

### 3. Update Tests

If you have tests that reference `mcqContent`, update them:

```bash
# Find test files
grep -r "mcqContent" test/ tests/ __tests__/
```

---

## FAQ

### Q: Will this affect existing courses?

**A:** No. The `mcqContent` field was never used in production. Exams are managed through the `questions` table.

### Q: Can I rollback if something goes wrong?

**A:** Yes, if you used the Sequelize migration method. Otherwise, you can manually re-add the column.

### Q: Do I need downtime for this migration?

**A:** No. This is a non-breaking change. The column is not used by the application.

### Q: What if I have data in mcqContent?

**A:** First migrate that data to the `questions` table, then run this migration.

---

## Data Migration (If Needed)

If you have data in `mcqContent` that needs to be preserved:

```javascript
// Script to migrate mcqContent to questions table
const { Course, Question } = require('./src/models');

async function migrateMCQContent() {
    const coursesWithMCQ = await Course.findAll({
        where: {
            mcqContent: { [Op.ne]: null }
        }
    });

    for (const course of coursesWithMCQ) {
        const mcqContent = course.mcqContent;
        
        // Assuming mcqContent is an array of questions
        if (Array.isArray(mcqContent)) {
            for (let i = 0; i < mcqContent.length; i++) {
                const mcq = mcqContent[i];
                
                await Question.create({
                    courseId: course.id,
                    questionText: mcq.question,
                    questionType: 'mcq',
                    options: mcq.options,
                    points: mcq.points || 1,
                    order: i + 1
                });
            }
        }
        
        console.log(`Migrated MCQ content for course: ${course.title}`);
    }
    
    console.log('Migration complete!');
}

// Run migration
migrateMCQContent().catch(console.error);
```

---

## Support

If you encounter issues during migration:

1. Check the error logs
2. Verify database connection
3. Ensure you have proper permissions
4. Review the troubleshooting section above

---

**Migration Version:** 1.0  
**Date:** 2026-01-16  
**Status:** Ready for Production
