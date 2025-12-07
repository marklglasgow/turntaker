# 🔄 TurnTaker

**Manage turns, fairly & simply**

A web app for groups to manage any turn-taking activity using a simple round-robin system. Perfect for coffee rounds, meal prep, chores, organizing events, and more!

---

## ✨ Features

### Core Functionality
- ✅ **User Registration & Login** - Secure account system
- ✅ **Create TurnTakers** - Set up turn-taking for any activity
- ✅ **Invite Participants** - Add friends by email
- ✅ **Round-Robin System** - Fair, automatic turn rotation
- ✅ **Skip Tracking** - Keep count of skipped turns (+1, +2, etc.)
- ✅ **Extra Turns** - Volunteer to go extra (−1, −2, etc.)
- ✅ **Turn History** - Complete audit trail of all turns
- ✅ **Export Data** - Download history as CSV
- ✅ **Admin Controls** - Multiple admins per TurnTaker
- ✅ **Cycle Management** - Keep order or randomize each cycle
- ✅ **Status Tracking** - Pending, Active, Closed states

### UI/UX
- 🎨 Clean, modern design (Splitwise-inspired)
- 📱 Mobile-first responsive design
- ⚡ Fast & lightweight
- 🎯 Intuitive navigation
- 🌈 Color-coded turn statuses

---

## 🚀 Quick Start

### Option 1: Deploy Online (Recommended)
See [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) for full instructions

**Quick Deploy to Vercel:**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Upload this folder
4. Deploy!

### Option 2: Run Locally
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

---

## 📖 How to Use

### 1. Register an Account
- Sign up with name, email, and password
- Or log in if you already have an account

### 2. Create a TurnTaker
- Give it a name (e.g., "Coffee Fridays")
- Set preferences:
  - Notification settings
  - Summary email frequency
  - End-of-cycle order (keep or randomize)

### 3. Invite Participants
- Add friends by their registered email
- They must register first!

### 4. Start the Turn Cycle
- Need at least 2 participants
- Click "Start Turn Cycle"
- First person is up!

### 5. Take Turns
- **Turn Taken** - Current person marks turn complete
- **Skip Turn** - Admin can skip someone's turn (adds +1 skip counter)
- **Extra Turn** - Anyone can volunteer to take an extra turn (adds −1 counter)

### 6. Track Everything
- View turn history
- Export to CSV
- See stats (completed, skipped, extra)
- Monitor who's ahead/behind

### 7. Close When Done
- Admin can close TurnTaker
- History is preserved
- Can still view and export data

---

## 📊 Turn Types

| Icon | Type | Description |
|------|------|-------------|
| ✓ | Completed | Turn successfully taken |
| ⊘ | Skipped | Turn was skipped (+1 skip counter) |
| ★ | Extra | Voluntary extra turn (−1 counter) |

---

## 🏗️ Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Storage:** localStorage (browser-based)
- **State Management:** React Hooks (useState, useEffect)

---

## 📁 Project Structure

```
turntaker/
├── index.html              # Main HTML file
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS config
├── postcss.config.js      # PostCSS config
└── src/
    ├── main.jsx           # React entry point
    ├── App.jsx            # Main application component
    └── index.css          # Global styles
```

---

## 🔮 Future Enhancements

### Planned Features
- 🔔 Real push notifications
- 🔄 Real-time sync between users
- 📧 Automated summary emails
- 📱 Native Android app
- 🍎 Native iOS app
- 🌐 Backend database (Firebase/Supabase)
- 👥 Social features (profile pics, chat)
- 📈 Advanced analytics
- 🎮 Gamification (badges, streaks)
- 🔗 Deep linking for invites

---

## ⚠️ Current Limitations

### Browser Storage
- Data stored locally in each browser
- Not synced across devices
- Clearing browser data = lost data

### No Real-Time Sync
- Users need to refresh to see updates
- Not ideal for large groups

### No Backend
- Can't send real emails
- No push notifications
- No central database

**Want these features?** Contact me to upgrade to a full backend solution!

---

## 🤝 Use Cases

Perfect for:
- ☕ Office coffee rounds
- 🍕 Team lunch orders
- 🏠 Household chores rotation
- 🎉 Event organizing duties
- 🎮 Game night hosting
- 🚗 Carpool driving schedule
- 💼 Meeting facilitation
- 🧹 Cleaning schedules
- 🛒 Grocery shopping runs
- 🎵 DJ rotation at parties

---

## 📝 License

This project is provided as-is for personal and commercial use.

---

## 🐛 Bug Reports & Feature Requests

Found a bug or want a feature? Let me know!

---

## 💡 Tips for Best Experience

1. **Add 2-10 participants** - Works best with small groups
2. **Check history regularly** - Keep track of fairness
3. **Use skip sparingly** - Only when truly necessary
4. **Celebrate extra turns** - Acknowledge volunteers!
5. **Export data monthly** - Back up your history
6. **Set clear rules** - Discuss expectations upfront

---

## 🎉 Credits

Designed & developed to make turn-taking fair, transparent, and effortless.

**Inspired by:** Splitwise, YNAB, and fair-share principles

---

**Ready to take turns fairly? Deploy now and share with your group!** 🚀