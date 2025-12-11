# 🏓 Brainwave Sportstech Pickleball

A comprehensive Next.js web application for tennis and racquet sports enthusiasts, featuring AIPA-approved equipment listings, court certifications, testing services, and more.

![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-11.0.2-orange?style=for-the-badge&logo=firebase)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.16-38B2AC?style=for-the-badge&logo=tailwind-css)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Key Modules](#-key-modules)
- [Firebase Configuration](#-firebase-configuration)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🎾 Core Features
- **AIPA-Approved Equipment Listings** - Browse certified pickleballs and racquet sports equipment
- **Court Certification Services** - Apply for official court certification
- **Equipment Testing Services** - Submit equipment for professional testing
- **User Authentication** - Secure login and signup with Firebase
- **Shopping Cart & Orders** - Complete e-commerce functionality
- **Blog System** - Stay updated with latest news and articles
- **Contact & Support** - FAQ and contact forms for customer support

### 🔐 Admin Features
- **Admin Dashboard** - Comprehensive management interface
- **User Management** - Manage user accounts and permissions
- **Content Management** - Update products, blogs, and services
- **Order Processing** - Handle customer orders and payments

### 📱 User Experience
- **Responsive Design** - Optimized for all screen sizes (mobile, tablet, desktop)
- **Modern UI/UX** - Built with Tailwind CSS and Framer Motion animations
- **Fast Performance** - Optimized with Next.js 15 and React 19
- **SEO Optimized** - Server-side rendering for better search visibility

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15.1.0
- **UI Library:** React 19.0.0
- **Styling:** Tailwind CSS 3.4.16
- **Animations:** Framer Motion 11.15.0
- **Icons:** Lucide React, React Icons
- **Carousel:** React Slick, Swiper

### Backend & Services
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Storage:** Firebase Storage
- **Email:** EmailJS, Nodemailer
- **Payments:** Razorpay

### Additional Libraries
- **PDF Generation:** jsPDF, html2pdf.js, pdf-lib
- **Date Handling:** date-fns
- **Form Components:** React Select
- **Notifications:** React Toastify
- **Markdown:** React Markdown

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tri-app.git
   cd tri-app
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
my-app/
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── about/         # About page
│   │   ├── admin/         # Admin dashboard
│   │   ├── aipa-approved/ # AIPA approved equipment
│   │   ├── api/           # API routes
│   │   ├── blogs/         # Blog pages
│   │   ├── contact/       # Contact page
│   │   ├── contexts/      # React contexts
│   │   ├── forms/         # Application forms
│   │   │   ├── court-certification/
│   │   │   └── pickle-ball-testing/
│   │   ├── login/         # Authentication
│   │   ├── my-cart/       # Shopping cart
│   │   ├── my-orders/     # Order history
│   │   ├── services/      # Services pages
│   │   └── signup/        # User registration
│   ├── components/        # Reusable components
│   ├── firebase/          # Firebase configuration
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   └── utils/             # Helper functions
├── functions/             # Firebase Cloud Functions
├── .env                   # Environment variables
├── firebase.json          # Firebase configuration
├── next.config.mjs        # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── package.json           # Project dependencies
```

## 🔑 Environment Variables

Create a `.env` file with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# EmailJS (Optional)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_USER_ID=

# Razorpay (Optional)
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

## 🎯 Key Modules

### 1. AIPA-Approved Equipment
Browse and purchase certified pickleballs and equipment that meet AIPA standards.

### 2. Court Certification
Apply for official court certification with a comprehensive application form.

### 3. Equipment Testing
Submit equipment for professional testing and certification.

### 4. E-commerce
- Shopping cart functionality
- Order management
- Payment integration with Razorpay
- Order history and tracking

### 5. User Management
- Secure authentication
- User profiles
- Role-based access control (Admin/User)

### 6. Content Management
- Blog system
- Service pages
- FAQ section
- Policy pages (Privacy, Terms, Shipping, etc.)

## 🔥 Firebase Configuration

This project uses Firebase for:
- **Authentication** - User login/signup
- **Firestore** - Database for products, orders, users
- **Storage** - File uploads (images, documents)
- **Hosting** - Deployment (optional)

Make sure to set up Firebase rules for security:
- Configure Firestore security rules
- Set up Storage security rules
- Enable required authentication methods

## 🎨 Styling & UI

- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **Radix UI** for accessible components
- **Custom components** built with shadcn/ui patterns
- **Responsive design** optimized for mobile, tablet, and desktop

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Breakpoint-specific layouts
- Touch-friendly interfaces
- Optimized images and assets

## 🔒 Security Features

- Firebase Authentication
- Protected routes
- Role-based access control
- Secure API endpoints
- Environment variable protection

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Deploy to Firebase Hosting

```bash
npm run build
firebase deploy
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for backend services
- Tailwind CSS for the styling system
- All contributors and supporters

## 📞 Support

For support, email support@tri-app.com or join our Slack channel.

---

<div align="center">
  <p>Made with ❤️ for the racquet sports community</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
