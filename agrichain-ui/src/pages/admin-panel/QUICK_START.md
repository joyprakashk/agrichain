# 🚀 Quick Start Guide - AgriChain Admin Dashboard

## 📦 Installation (One-Time Setup)

```bash
cd admin-panel
npm install
```

## ▶️ Running the Dashboard

### Option 1: Using npm
```bash
npm run dev
```

### Option 2: Using the batch file (Windows)
Double-click: `START_ADMIN_DASHBOARD.bat`

### Access URL
Open browser: **http://localhost:5174**

---

## 📋 File Structure Overview

```
admin-panel/
├── 📄 Configuration Files
│   ├── package.json          → Dependencies & scripts
│   ├── vite.config.js        → Vite configuration
│   ├── tailwind.config.js    → Tailwind CSS setup
│   └── postcss.config.js     → PostCSS setup
│
├── 🎨 Source Code (src/)
│   ├── main.jsx              → Entry point
│   ├── App.jsx               → Main app with routing
│   ├── index.css             → Global styles
│   │
│   ├── 🧩 components/
│   │   ├── Card.jsx          → Reusable stat card
│   │   ├── Navbar.jsx        → Top navigation bar
│   │   └── Sidebar.jsx       → Left sidebar menu
│   │
│   └── 📄 pages/
│       ├── Dashboard.jsx     → Main overview page
│       ├── Users.jsx         → User management
│       ├── Transactions.jsx  → Blockchain transactions
│       ├── Analytics.jsx     → Analytics & insights
│       └── Performance.jsx   → Performance metrics
│
└── 📚 Documentation
    ├── README.md             → Full documentation
    ├── VISUAL_GUIDE.md       → UI design guide
    ├── SETUP_CHECKLIST.md    → Testing checklist
    └── QUICK_START.md        → This file
```

---

## 🎯 Key Features

| Page | Description | Key Elements |
|------|-------------|--------------|
| **Dashboard** | Overview & metrics | 3 stat cards, recent activity, quick actions |
| **Users** | User management | User table, role badges, status indicators |
| **Transactions** | Blockchain txs | Transaction list, status tracking, hashes |
| **Analytics** | Performance data | Score cards, chart placeholders, insights |
| **Performance** | Supply chain KPIs | Metrics, progress bars, system health |

---

## 🎨 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **Vite** | 5.0.8 | Build tool & dev server |
| **React Router** | 6.20.0 | Client-side routing |
| **Tailwind CSS** | 3.3.6 | Styling framework |

---

## 🌐 Navigation Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | → `/dashboard` | Redirects to dashboard |
| `/dashboard` | Dashboard.jsx | Main overview page |
| `/users` | Users.jsx | User management |
| `/transactions` | Transactions.jsx | Transaction history |
| `/analytics` | Analytics.jsx | Analytics & charts |
| `/performance` | Performance.jsx | KPI metrics |

---

## 🎨 Component Props Reference

### Card Component
```jsx
<Card
  title="Total Farmers"      // Card title
  value="1,234"              // Main value to display
  icon="👨‍🌾"                  // Emoji icon
  bgColor="bg-blue-50"       // Background color class
/>
```

### Usage in Pages
```jsx
import Card from '../components/Card';

<Card title="..." value="..." icon="..." bgColor="..." />
```

---

## 💅 Tailwind Classes Quick Reference

### Common Color Classes
```css
bg-green-500    → Green background
text-gray-900   → Dark text
hover:bg-blue-600 → Blue on hover
border-gray-200 → Light border
```

### Layout Classes
```css
flex justify-between  → Flex with space between
grid grid-cols-3     → 3 column grid
p-6                  → Padding 1.5rem
rounded-lg           → Rounded corners
shadow-md            → Medium shadow
```

---

## 🧪 Testing the Dashboard

### 1. Navigation Test
- [ ] Click each sidebar link
- [ ] Verify active link is highlighted (green)
- [ ] Check all pages load correctly

### 2. Visual Test
- [ ] All cards display properly
- [ ] Tables are readable
- [ ] Hover effects work
- [ ] No layout issues

### 3. Data Verification
- [ ] Dashboard shows correct stats
- [ ] Users table has 10 users
- [ ] Transactions show 8 items
- [ ] All dummy data displays

---

## 🐛 Troubleshooting

### Problem: Dev server won't start
```bash
# Solution 1: Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Solution 2: Check Node version
node --version  # Should be v16 or higher
```

### Problem: Styles not working
```bash
# Restart dev server
# Press Ctrl+C then run again
npm run dev
```

### Problem: Port already in use
```bash
# Edit vite.config.js
# Change port: 5174 to another port
```

---

## 📊 Dummy Data Summary

### Dashboard
- **1,234** Total Farmers
- **8,567** Verified Batches
- **42** Fake Products Detected

### Users (10 total)
- **4** Farmers
- **3** Distributors
- **3** Retailers
- **9** Active, **1** Inactive

### Transactions (8 total)
- **6** Confirmed
- **1** Pending
- **1** Failed

---

## 🔄 Development Workflow

1. **Start Server**: `npm run dev`
2. **Make Changes**: Edit files in `src/`
3. **Auto Reload**: Browser updates automatically
4. **Check Browser**: Verify changes
5. **Repeat**: Continue development

---

## 🚀 Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview

# Output will be in dist/ folder
```

---

## 📞 Need Help?

1. **Check README.md** → Full documentation
2. **Check VISUAL_GUIDE.md** → UI design details
3. **Check SETUP_CHECKLIST.md** → Testing guide

---

## ✨ Next Steps

### Immediate
- [x] Install dependencies
- [x] Start dev server
- [x] Test all pages
- [x] Verify data display

### Future (Backend Integration)
- [ ] Connect to real blockchain
- [ ] Add authentication
- [ ] Implement CRUD operations
- [ ] Add real-time updates

### Enhancements
- [ ] Add chart libraries
- [ ] Implement search
- [ ] Add pagination
- [ ] Create forms & modals

---

**Ready to go!** Just run `npm run dev` and start exploring the dashboard! 🎉

---

**Quick Commands Reminder:**

```bash
npm install      # Install dependencies (first time)
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

**Dashboard URL:** http://localhost:5174
