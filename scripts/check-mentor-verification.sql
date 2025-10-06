-- Check Mentor Profiles with Verification Status
-- Run this in your database to diagnose verification issues

-- 1. Check all mentor profiles
SELECT 
    id,
    userId,
    status,
    isVerified,
    verificationToken,
    verificationExpiry,
    createdAt
FROM MentorProfile
ORDER BY createdAt DESC
LIMIT 10;

-- 2. Check expired tokens
SELECT 
    id,
    userId,
    status,
    isVerified,
    verificationExpiry,
    CASE 
        WHEN verificationExpiry < datetime('now') THEN 'EXPIRED'
        WHEN verificationExpiry IS NULL THEN 'NO TOKEN'
        ELSE 'VALID'
    END as token_status
FROM MentorProfile
WHERE isVerified = 0;

-- 3. Clean up expired verification tokens (optional)
-- Uncomment to run:
-- UPDATE MentorProfile
-- SET 
--     verificationToken = NULL,
--     verificationExpiry = NULL,
--     status = 'EXPIRED'
-- WHERE 
--     isVerified = 0 
--     AND verificationExpiry < datetime('now');

-- 4. Find duplicate mentor profiles for same user
SELECT 
    userId,
    COUNT(*) as profile_count
FROM MentorProfile
GROUP BY userId
HAVING COUNT(*) > 1;

-- 5. Check recently verified profiles
SELECT 
    mp.id,
    mp.userId,
    u.email,
    u.name,
    mp.status,
    mp.isVerified,
    mp.createdAt as registered_at,
    mp.verificationExpiry as token_expires
FROM MentorProfile mp
JOIN User u ON mp.userId = u.id
WHERE mp.isVerified = 1
ORDER BY mp.createdAt DESC
LIMIT 5;
