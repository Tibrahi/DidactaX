# DidactaX - Structured Knowledge Creation Platform

A comprehensive web-based platform for creating structured  notes with advanced features.

## Features

### Core Functionality
- **Single Page Input**: Create structured notes with 10 customizable sections
  - Title (Topic name, Lesson/Chapter number, Date)
  - Objective
  - Keywords
  - Key Concepts
  - Vocabulary
  - Examples
  - Questions
  - Summary
  - Practice/Action
  - References

### User Interface
- **VS Code-like Layout**: 3-panel interface
  - Left Panel: File/Folder explorer
  - Main Panel: Editor with rich text formatting
  - Right Panel: Live preview

- **Modern Design**:
  - Dark theme with night shades color palette
  - Oswald font family
  - Custom scrollbars
  - Custom popups and success messages
  - Responsive layout

### Authentication & User Management
- User registration and login
- Streak tracking (daily login counter)
- Profile management
- Settings (auto-correct toggle)

### File Management
- Create folders and files
- Support for .docx and .pdf file types
- Rename and delete files/folders
- Hierarchical organization

### Rich Text Editor
- MS Word-like toolbar:
  - Bold, Italic, Underline
  - Text alignment (Left, Center, Right)
  - Lists (Bullet, Numbered)
  - Heading styles (H1, H2, H3)
  - Font size control
  - Text and background colors

### Auto-Correct
- Built-in dictionary for common misspellings
- Real-time correction as you type
- Toggle on/off in settings

### Payment System
- Page-based pricing:
  - Up to 250 pages: 500 (local currency)
  - Above 250 pages: 1000+ (based on calculation)
- Payment methods:
  - MTN Mobile Money
  - Airtel Money
  - Bank Transfer (BK)
- Payment required for PDF/DOCX downloads

### Export & Download
- Download as PDF
- Download as DOCX
- Payment verification before download

### Dashboard
- List all created works
- Streak indicator
- Recent works
- Create new works
- Edit and delete works

### Home Page
- Modern hero carousel (3 slides)
- Features section
- Modern footer
- Call-to-action buttons

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript + (Angukar cdn link)
- **Styling**: Tailwind CSS (CDN)
- **Database**: IndexedDB (via Dexie.js)
- **Libraries**:
  - Dexie.js - IndexedDB wrapper
  - D3.js - Data visualization (for future charts)
  - Chart.js - Charts (for future analytics)
  - Fabric.js - Canvas manipulation (for future diagrams)
- **Fonts**: Oswald (Google Fonts)
- **Icons**: Font Awesome 6.4.0

```

## 🚀 Usage

### 1. Getting Started

- Open `index.html` in a modern web browser
- Create an account or log in
- Begin creating and managing your work

---

### 2. Creating a Single Page

- Navigate to the **Dashboard**
- Click **Create New**
- Select **Single Page**
- Enter a title for your work
- Start filling in the **10 structured sections**

---

### 3. Working With Sections

- Each page is divided into predefined sections
- Inputs added are scoped to the currently active section
- Sections support dynamic content and layout expansion

---

### 4. Adding Custom Inputs

- Click the **Add New Input** button
- Enter an input label
- Select an input type:
  - Text
  - Textarea
  - Number
  - Date
  - Header (users can define custom headers)
- The input is instantly added to the current section

---

### 5. Editing or Removing Inputs

- Use the **Edit** or **Delete (Trash)** icons on each input
- Confirm deletion when prompted to prevent accidental loss

---

### 6. Downloading Your Work

- Complete payment via the **Services** page
- Open the editor
- Click the **Download** button
- Choose an export format:
  - PDF
  - DOCX

---

## 🌐 Browser Compatibility

Supported browsers:

- Chrome / Edge (recommended)
- Firefox
- Safari
- Opera

> **Note:** A modern browser with **IndexedDB support** is required.

---

## 📝 Notes & Behavior

- All data is stored locally using **IndexedDB**
- No server required — fully functional **offline**
- Automatic save every **30 seconds**
- Real-time counters for:
  - Words
  - Characters
  - Paragraphs
  - Pages
- Custom scrollbars for improved user experience
- Dashboard pagination:
  - **5 pages per slide**
- Auto-focus on empty inputs to streamline workflow

---

## 🔮 Future Enhancements

Planned improvements include:

- Production-grade PDF and DOCX generation libraries
- Secure payment gateway integration
- Cloud synchronization
- Real-time collaboration features
- Advanced diagram and visual content creation
- Exportable templates
- Print preview support
