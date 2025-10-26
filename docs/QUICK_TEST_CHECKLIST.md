# ✅ Career Trajectory - Quick Test Checklist

**Copy this and check off as you test!**

---

## 🚀 **5-MINUTE SMOKE TEST**

- [ ] 1. Login to application
- [ ] 2. Click "Career Trajectory" in sidebar
- [ ] 3. Dashboard loads without errors
- [ ] 4. Click "Create New Goal"
- [ ] 5. Complete wizard (all 4 steps)
- [ ] 6. Enable AI generation checkbox
- [ ] 7. Goal created with milestones/skills
- [ ] 8. Goal detail page loads
- [ ] 9. All visualizations render
- [ ] 10. No console errors

**If all ✅ = Feature is working!**

---

## 📋 **15-MINUTE FULL TEST**

### **Dashboard**
- [ ] Overview stats display correctly
- [ ] Filter tabs work (All, Active, Achieved, Postponed)
- [ ] Goal cards show correct data
- [ ] "Create New Goal" button works
- [ ] Goal card click navigates to detail page

### **Goal Creation**
- [ ] Step 1: Required field validation works
- [ ] Step 2: All fields accept input
- [ ] Step 3: Quick select buttons work
- [ ] Step 4: Review shows all data
- [ ] AI checkbox toggles
- [ ] Create button works
- [ ] AI generation completes (5-10s)

### **Goal Detail - Overview Tab**
- [ ] Hero section displays goal info
- [ ] 4 stats cards show correct data
- [ ] Trajectory visualization renders
- [ ] Milestone timeline displays
- [ ] Skill gap radar chart shows (if 3+ skills)
- [ ] Progress chart displays
- [ ] All charts are responsive

### **Goal Detail - Milestones Tab**
- [ ] Milestone list displays
- [ ] Click to expand/collapse works
- [ ] Progress slider adjustable
- [ ] "Mark Complete" button works
- [ ] Completion updates goal progress
- [ ] AI guidance displays

### **Goal Detail - Skills Tab**
- [ ] Skill cards display
- [ ] Dual progress bars show
- [ ] Gap indicators correct
- [ ] Level slider adjustable (0-10)
- [ ] Updates persist after refresh
- [ ] Summary stats update

### **Goal Detail - Resources Tab**
- [ ] Resource cards display
- [ ] Type filter works
- [ ] Status filter works
- [ ] Status toggle works (To Do/Learning/Done)
- [ ] External links work (if present)
- [ ] Filters can be cleared

### **Actions**
- [ ] Edit button (if implemented)
- [ ] Delete button shows confirmation
- [ ] Delete confirmation works
- [ ] Redirect after delete
- [ ] Goal removed from dashboard

---

## 📱 **MOBILE TEST** (5 minutes)

**Open on phone or use DevTools responsive mode**

- [ ] Dashboard: 1-column layout
- [ ] Cards stack vertically
- [ ] Tabs are scrollable
- [ ] Buttons are touch-friendly (44x44px min)
- [ ] Charts resize correctly
- [ ] No horizontal scroll
- [ ] Text is readable
- [ ] Navigation works

---

## 🎨 **VISUAL TEST** (3 minutes)

- [ ] Colors: Emerald (primary), Blue (secondary), Amber (accent)
- [ ] Dark mode toggle works
- [ ] No overlapping text
- [ ] Images/icons load
- [ ] Gradients render smoothly
- [ ] Hover states work on buttons/cards
- [ ] Loading spinners show during async
- [ ] No layout shifts

---

## 🔌 **API TEST** (Optional - 10 minutes)

**Use browser DevTools Network tab**

- [ ] POST /api/v1/career/goals (Create goal)
- [ ] GET /api/v1/career/goals (List goals)
- [ ] GET /api/v1/career/goals/:id (Get goal)
- [ ] POST /api/v1/career/goals/:id/generate (AI)
- [ ] PATCH /api/v1/career/goals/:id/milestones/:id/complete
- [ ] PATCH /api/v1/career/goals/:id/skills/:id/progress
- [ ] PATCH /api/v1/career/goals/:id/resources/:id/status
- [ ] DELETE /api/v1/career/goals/:id
- [ ] All return 200/201 status codes
- [ ] JWT authentication works on all

---

## 🚨 **ERROR TEST** (5 minutes)

- [ ] Try to create goal without required fields → Error shown
- [ ] Try to access without login → Redirect or error
- [ ] Stop backend, try action → Error handled gracefully
- [ ] Invalid goal ID → 404 or error message
- [ ] Network timeout → Loading state → Error message

---

## ♿ **ACCESSIBILITY TEST** (5 minutes)

- [ ] Tab key navigates through elements
- [ ] Focus indicators visible
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Buttons have clear labels
- [ ] Form inputs have labels
- [ ] Color contrast is sufficient
- [ ] Works without mouse (keyboard only)

---

## 🎯 **PASS CRITERIA**

### **Critical (Must Pass)**
- ✅ Goal creation works
- ✅ AI generation completes
- ✅ All tabs load
- ✅ Progress updates work
- ✅ No console errors
- ✅ Mobile responsive

### **Important (Should Pass)**
- ✅ All visualizations render
- ✅ Filters work
- ✅ Delete works
- ✅ Dark mode works
- ✅ Validation works

### **Nice-to-Have**
- ✅ Smooth animations
- ✅ Fast load times (< 2s)
- ✅ Perfect accessibility
- ✅ All browsers tested

---

## 📊 **TEST RESULT**

**Date**: ___________  
**Tester**: ___________  
**Environment**: ___________  

**Critical Tests Passed**: ___ / 6  
**Important Tests Passed**: ___ / 5  
**Nice-to-Have Tests Passed**: ___ / 4  

**Overall Status**:
- [ ] ✅ **PASS** - Ready for production
- [ ] ⚠️ **PASS WITH ISSUES** - Minor bugs, can deploy
- [ ] ❌ **FAIL** - Critical issues, needs fixes

**Issues Found**:
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

**Notes**:
___________________________________________
___________________________________________
___________________________________________

---

## 🚀 **QUICK COMMANDS**

```bash
# Start Backend
cd careerforge-ai
npm run dev

# Start Frontend (new terminal)
cd careerforge-ai/frontend
npm run dev

# Check Database
npx prisma studio

# View Logs
# Check terminal output for errors
```

---

## 💡 **TESTING TIPS**

1. **Open DevTools** (F12) - Check Console and Network tabs
2. **Use incognito mode** - Fresh state, no cache
3. **Test in order** - Dashboard → Create → Detail → Actions
4. **Note down issues** - Screenshot or write description
5. **Try edge cases** - Empty data, max values, special characters
6. **Test both** - Dark mode and light mode
7. **Verify data persists** - Refresh page after changes
8. **Check mobile** - Use DevTools responsive mode or real device

---

## ✅ **DONE!**

Once all tests pass:
1. Fill out test result above
2. Document any issues
3. Share results with team
4. Proceed to deployment or fixes

**Thank you for testing! 🎉**
