# AgriChain Admin Dashboard

A complete React admin dashboard for managing a Blockchain-Based Agricultural Supply Chain Transparency System.

## 🚀 Features

- **Dashboard**: Overview with key metrics (Total Farmers, Verified Batches, Fake Products Detected)
- **Users Management**: View and manage all users (Farmers, Distributors, Retailers)
- **Transactions**: List of blockchain transaction hashes with status tracking
- **Analytics**: Performance analytics with placeholder for future charts
- **Performance Metrics**: Supply chain KPIs and system health monitoring
- **Responsive Design**: Clean, professional UI with Tailwind CSS
- **Dark Sidebar**: Fixed navigation with active state highlighting

## 🛠️ Tech Stack

- **React 18** - Frontend library
- **Vite** - Build tool and development server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling

## 📁 Project Structure

```
admin-panel/
├── src/
│   ├── components/
│   │   ├── Card.jsx          # Reusable card component
│   │   ├── Navbar.jsx        # Top navigation bar
│   │   └── Sidebar.jsx       # Left sidebar navigation
│   ├── pages/
│   │   ├── Dashboard.jsx     # Main dashboard page
│   │   ├── Users.jsx         # Users management page
│   │   ├── Transactions.jsx  # Blockchain transactions page
│   │   ├── Analytics.jsx     # Analytics and insights page
│   │   └── Performance.jsx   # Performance metrics page
│   ├── App.jsx               # Main app component with routing
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles and Tailwind imports
├── index.html                # HTML template
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── postcss.config.js         # PostCSS configuration
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the admin-panel directory:
```bash
cd admin-panel
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:5174
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🎨 UI Components

### Sidebar
- Fixed left navigation with dark theme
- Active link highlighting
- Logout button at bottom
- Icons for each section

### Navbar
- Welcome message
- Search bar (placeholder)
- Notification bell
- User profile section

### Pages

#### Dashboard
- 3 key metric cards
- Recent activity feed
- System status indicators
- Quick action buttons

#### Users
- User statistics
- Comprehensive user table
- Role-based badges
- Status indicators

#### Transactions
- Transaction statistics by status
- Detailed transaction table
- Blockchain hash display
- Status badges

#### Analytics
- Performance score cards
- Chart placeholders for future implementation
- Key insights section
- Trend indicators

#### Performance
- KPI metrics with progress bars
- Supply chain stage performance
- System health monitoring
- Target vs actual comparisons

## 🎯 Current Status

This is a **frontend-only implementation** using dummy data. Backend integration will be added in future phases.

### Dummy Data Includes:
- 10 sample users
- 8 blockchain transactions
- Performance metrics
- System health indicators

## 🔮 Future Enhancements

1. **Backend Integration**
   - Connect to actual blockchain network
   - Real-time data updates
   - User authentication

2. **Charts & Visualization**
   - Integrate Chart.js or Recharts
   - Interactive dashboards
   - Real-time analytics

3. **Advanced Features**
   - Real-time notifications
   - Advanced search and filters
   - Export functionality
   - Role-based access control

4. **Mobile Optimization**
   - Responsive sidebar
   - Touch-friendly interactions
   - Mobile-specific layouts

## 🎨 Color Scheme

- **Primary**: Green (#10B981) - Agricultural theme
- **Dark**: Gray 900 (#111827) - Sidebar
- **Background**: Gray 100 (#F3F4F6)
- **Cards**: White with subtle shadows
- **Status Colors**: Green (success), Yellow (pending), Red (error)

## 📝 Notes

- All navigation links are functional
- Search functionality shows alert (to be implemented)
- Logout shows confirmation alert (to be implemented)
- Table actions (Edit/Delete) are placeholders
- All data is currently hardcoded (dummy data)

## 🤝 Contributing

This project is part of an academic agricultural supply chain system. Future updates will include backend integration and advanced features.

## 📄 License

This project is created for educational purposes.
