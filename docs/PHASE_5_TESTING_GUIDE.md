# 🧪 Phase 5 Testing Guide

## Quick Test Plan for Rating & Feedback System

---

## 🚀 Setup

Before testing, ensure:
- Backend server is running
- Frontend dev server is running
- Database is migrated with MentorReview model
- You have test accounts (student and mentor)

---

## 📋 Test Scenarios

### Scenario 1: Student Rates Completed Session ⭐

**Prerequisites:**
- Student account logged in
- At least one completed session with a mentor

**Steps:**
1. Navigate to **"My Sessions"** page
2. Find a session with status **"COMPLETED"**
3. Look for yellow **"Rate Session"** button
4. Click the button

**Expected:**
- RatingModal opens
- Session and mentor info displayed
- Overall rating stars are clickable
- Emoji changes based on rating selection

**Test Rating Submission:**
1. Click on 5 stars for overall rating (should see 😍 emoji)
2. Optionally add detailed ratings (Communication, Knowledge, Helpfulness)
3. Write a comment: "Great mentor! Very helpful and knowledgeable."
4. Toggle public/private (default: public)
5. Click **"Submit Review"**

**Expected:**
- Success message appears
- Modal closes
- Session list refreshes
- "Rate Session" button may disappear (already rated)

---

### Scenario 2: View Reviews on Mentor Profile 👀

**Steps:**
1. Navigate to **"Find Mentors"** page
2. Click on any mentor card (preferably one with rating)

**Expected:**
- MentorProfile modal opens
- Rating stats card shows average rating
- **ReviewList component** displays:
  - Rating summary (large average rating number)
  - Rating distribution bars (5-star breakdown)
  - Individual review cards with:
    - Anonymous student name
    - Star rating
    - Date
    - Comment
    - Detailed ratings (if provided)

**Test Empty State:**
1. Click on a mentor with no reviews (shows "New" badge)

**Expected:**
- Empty state message appears
- "No reviews yet" with friendly message
- Gray star icon displayed

---

### Scenario 3: Filter Mentors by Rating 🔍

**Steps:**
1. Go to **"Find Mentors"** page
2. Locate the **rating filter dropdown** (next to search bar)
3. Select **"4+ Stars"**

**Expected:**
- Mentor list filters immediately
- Only mentors with ≥4.0 rating shown
- Mentors without ratings (New) are hidden
- Result count updates

**Test Different Filters:**
1. Select "All Ratings" → All mentors appear
2. Select "3+ Stars" → More mentors appear
3. Select "1+ Stars" → Nearly all mentors with any rating

**Combine with Search:**
1. Type "React" in search bar
2. Select "4+ Stars" filter

**Expected:**
- Both filters apply simultaneously
- Shows only high-rated React mentors

---

### Scenario 4: Mentor Responds to Review 💬

**Prerequisites:**
- Mentor account logged in
- At least one review received

**Steps:**
1. Navigate to mentor dashboard (or implement review management page)
2. View received reviews
3. Find a review without a response
4. Click **"Respond to Review"** button
5. Type response: "Thank you for your kind feedback! It was a pleasure working with you."
6. Submit response

**Expected:**
- Response saved successfully
- Response appears in **blue-highlighted box** below review
- **"Mentor's Response"** header shown
- Timestamp of response displayed
- Response visible to all users viewing the review

---

### Scenario 5: Update Existing Review ✏️

**Prerequisites:**
- Student account with submitted review

**Steps:**
1. Go to **"My Reviews"** page (implement if not exists)
2. Find a review you created
3. Click **"Edit Review"**
4. Change overall rating from 5 to 4 stars
5. Update comment
6. Submit changes

**Expected:**
- Review updates successfully
- Mentor's average rating recalculates
- Updated review appears on mentor profile
- Timestamp shows "Updated" indicator

---

### Scenario 6: Delete Review 🗑️

**Steps:**
1. Go to your reviews list
2. Click **"Delete"** on a review
3. Confirm deletion

**Expected:**
- Review removed from list
- Mentor's average rating recalculates
- Review no longer appears on mentor profile
- Success confirmation message

---

### Scenario 7: Rating Distribution Chart 📊

**Steps:**
1. Find a mentor with multiple reviews (5+)
2. Open their profile
3. Scroll to reviews section

**Expected:**
- Rating distribution chart displays:
  - 5 bars (one for each star level)
  - Bar length represents percentage
  - Number count shown for each level
  - Percentages add up to 100%
  
**Example Distribution:**
```
5 ⭐ ████████████████████ 60% (12 reviews)
4 ⭐ ████████████░░░░░░░░ 30% (6 reviews)
3 ⭐ ████░░░░░░░░░░░░░░░░ 10% (2 reviews)
2 ⭐ ░░░░░░░░░░░░░░░░░░░░  0% (0 reviews)
1 ⭐ ░░░░░░░░░░░░░░░░░░░░  0% (0 reviews)
```

---

### Scenario 8: Public vs Private Reviews 🔒

**Test Private Review:**
1. Create a review
2. **Uncheck** "Make this review public" checkbox
3. Submit

**Expected:**
- Review saved to database
- Review **NOT shown** on mentor's public profile
- Review **visible** in student's "My Reviews"
- Review **visible** to mentor in "Received Reviews"
- Does **NOT affect** mentor's average rating

**Test Public Review:**
1. Create another review
2. **Keep** "Make this review public" checked
3. Submit

**Expected:**
- Review shown on mentor's public profile
- Included in average rating calculation
- Visible to all users

---

### Scenario 9: Duplicate Prevention 🚫

**Steps:**
1. Rate a completed session
2. Go back to "My Sessions"
3. Try to rate the **same session** again

**Expected:**
- "Rate Session" button should be **disabled** or **hidden**
- If API is called, error message: "You have already reviewed this session"
- No duplicate reviews in database

---

### Scenario 10: Rating Validation ✅

**Test Invalid Ratings:**

1. **No rating selected:**
   - Try to submit without selecting stars
   - **Expected:** Error message "Overall rating is required"

2. **Comment too long:**
   - Write 600 characters in comment field
   - **Expected:** Character counter turns red, submit disabled

3. **Rating out of bounds:**
   - (Backend test) Try API call with rating = 0 or 6
   - **Expected:** 400 Bad Request error

---

## 🎯 Checklist

### Backend Tests
- [ ] Create review API works
- [ ] Get mentor reviews returns correct data
- [ ] Average rating calculates correctly
- [ ] Rating distribution stats are accurate
- [ ] Update review recalculates average
- [ ] Delete review updates average
- [ ] Mentor response saves correctly
- [ ] Authorization checks work (author only, mentor only)
- [ ] Validation rejects invalid ratings
- [ ] Duplicate prevention works

### Frontend Tests
- [ ] RatingModal opens correctly
- [ ] Star selection works (click and hover)
- [ ] Detailed ratings are optional
- [ ] Comment character counter works
- [ ] Public/private toggle functions
- [ ] Form validation prevents invalid submission
- [ ] Success/error messages display
- [ ] ReviewList fetches and displays reviews
- [ ] Rating distribution chart renders correctly
- [ ] Mentor responses show in blue boxes
- [ ] Rating filter works on MentorsPage
- [ ] Filter combines with search
- [ ] Dark mode displays correctly
- [ ] Responsive on mobile devices
- [ ] Loading states show during API calls

---

## 🐛 Common Issues & Fixes

### Issue 1: "Rate Session" button not appearing
**Possible Causes:**
- Session is not COMPLETED status
- User is mentor (not student)
- Review already exists

**Fix:** Check session status in database

### Issue 2: Average rating not updating
**Possible Causes:**
- Only private reviews exist
- updateMentorAverageRating() not called
- Database transaction failed

**Fix:** Check backend logs, verify public reviews exist

### Issue 3: Reviews not showing on profile
**Possible Causes:**
- Reviews are private
- API endpoint not returning data
- Component not fetching correctly

**Fix:** Check network tab, verify review.isPublic = true

### Issue 4: Rating filter not working
**Possible Causes:**
- averageRating field is null
- Filter logic incorrect
- State not updating

**Fix:** Check mentor data structure, verify state updates

---

## 📱 Mobile Testing

Test on mobile devices (or Chrome DevTools mobile view):

- [ ] RatingModal is responsive
- [ ] Star selection works on touch
- [ ] ReviewList scrolls correctly
- [ ] Rating filter dropdown accessible
- [ ] Cards stack properly on small screens
- [ ] Text remains readable
- [ ] Buttons are touch-friendly (min 44x44px)

---

## 🌙 Dark Mode Testing

Toggle dark mode and verify:

- [ ] RatingModal has proper contrast
- [ ] ReviewList cards are readable
- [ ] Stars are visible (yellow on dark)
- [ ] Rating filter dropdown styled correctly
- [ ] Mentor response box has good contrast
- [ ] All text is readable
- [ ] No white flashes during transitions

---

## 🔐 Security Testing

- [ ] Cannot create review for someone else's session
- [ ] Cannot update another user's review
- [ ] Cannot delete another user's review
- [ ] Only mentor can respond to their reviews
- [ ] Authentication required for all endpoints
- [ ] XSS prevention (try `<script>alert('xss')</script>` in comment)
- [ ] SQL injection prevention (try SQL in comment)

---

## 📊 Performance Testing

- [ ] ReviewList loads within 2 seconds
- [ ] Pagination works for large review sets
- [ ] Rating filter applies instantly
- [ ] No memory leaks on repeated modal open/close
- [ ] Star hover animations are smooth
- [ ] Average rating updates in real-time

---

## ✅ Sign-Off

**Phase 5 Testing Completed:**

- Date: _______________
- Tester: _______________
- Backend Status: ⬜ Pass ⬜ Fail
- Frontend Status: ⬜ Pass ⬜ Fail
- Integration Status: ⬜ Pass ⬜ Fail

**Notes:**
_________________________________
_________________________________
_________________________________

---

**Ready to Deploy Phase 5!** 🚀
