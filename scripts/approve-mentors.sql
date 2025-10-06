-- Quick Mentor Approval SQL Script
-- Use this to quickly approve pending mentors directly in the database

-- ============================================
-- 1. VIEW ALL PENDING MENTORS
-- ============================================
SELECT 
  mp.id AS mentor_profile_id,
  u.name,
  u.email,
  mp.company,
  mp.jobTitle,
  mp.yearsOfExperience,
  mp.isVerified,
  mp.status,
  mp.createdAt,
  mp.verificationExpiry
FROM mentor_profiles mp
JOIN users u ON mp.userId = u.id
WHERE mp.isVerified = 1 AND mp.status = 'PENDING'
ORDER BY mp.createdAt DESC;

-- ============================================
-- 2. APPROVE ALL PENDING MENTORS (Verified)
-- ============================================
-- CAUTION: This approves ALL verified pending mentors
UPDATE mentor_profiles
SET status = 'ACTIVE'
WHERE isVerified = 1 AND status = 'PENDING';

-- ============================================
-- 3. APPROVE SPECIFIC MENTOR BY EMAIL
-- ============================================
-- Replace 'mentor@example.com' with actual email
UPDATE mentor_profiles
SET status = 'ACTIVE'
WHERE id IN (
  SELECT mp.id 
  FROM mentor_profiles mp
  JOIN users u ON mp.userId = u.id
  WHERE u.email = 'mentor@example.com'
);

-- ============================================
-- 4. APPROVE SPECIFIC MENTOR BY ID
-- ============================================
-- Replace 'mentor_id_here' with actual mentor profile ID
UPDATE mentor_profiles
SET status = 'ACTIVE'
WHERE id = 'mentor_id_here';

-- ============================================
-- 5. VIEW ALL ACTIVE MENTORS
-- ============================================
SELECT 
  mp.id AS mentor_profile_id,
  u.name,
  u.email,
  mp.company,
  mp.jobTitle,
  mp.isVerified,
  mp.status,
  mp.activeConnections,
  mp.totalConnections,
  mp.averageRating
FROM mentor_profiles mp
JOIN users u ON mp.userId = u.id
WHERE mp.isVerified = 1 AND mp.status = 'ACTIVE'
ORDER BY mp.createdAt DESC;

-- ============================================
-- 6. CHECK MENTOR VERIFICATION STATUS
-- ============================================
-- See if verification tokens are expired
SELECT 
  mp.id,
  u.email,
  mp.isVerified,
  mp.status,
  mp.verificationToken,
  mp.verificationExpiry,
  CASE 
    WHEN mp.verificationExpiry > datetime('now') THEN 'VALID'
    ELSE 'EXPIRED'
  END AS token_status
FROM mentor_profiles mp
JOIN users u ON mp.userId = u.id
WHERE mp.verificationToken IS NOT NULL;

-- ============================================
-- 7. DELETE EXPIRED UNVERIFIED PROFILES
-- ============================================
-- Clean up profiles that never verified (older than 48 hours)
DELETE FROM mentor_profiles
WHERE isVerified = 0 
  AND verificationExpiry < datetime('now', '-24 hours');

-- ============================================
-- 8. RESET MENTOR TO PENDING (If needed)
-- ============================================
-- If you accidentally approved wrong mentor
UPDATE mentor_profiles
SET status = 'PENDING'
WHERE id = 'mentor_id_here';

-- ============================================
-- 9. VIEW MENTOR WITH FULL DETAILS
-- ============================================
SELECT 
  mp.*,
  u.name,
  u.email,
  u.role
FROM mentor_profiles mp
JOIN users u ON mp.userId = u.id
WHERE mp.id = 'mentor_id_here';

-- ============================================
-- 10. COUNT MENTORS BY STATUS
-- ============================================
SELECT 
  status,
  isVerified,
  COUNT(*) as count
FROM mentor_profiles
GROUP BY status, isVerified;
