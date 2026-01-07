# DidactaX - Structured Knowledge Creation Platform

A comprehensive web-based platform for creating structured books and notes with advanced features.

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

- **Book Creation**: Build comprehensive books with:
  - Multiple pages (auto-created based on user input)
  - Page navigation (Previous/Next)
  - Different input types per page
  - First page title inputs
  - Last page summary inputs
  - Body content for all pages

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

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS (CDN)
- **Database**: IndexedDB (via Dexie.js)
- **Libraries**:
  - Dexie.js - IndexedDB wrapper
  - D3.js - Data visualization (for future charts)
  - Chart.js - Charts (for future analytics)
  - Fabric.js - Canvas manipulation (for future diagrams)
- **Fonts**: Oswald (Google Fonts)
- **Icons**: Font Awesome 6.4.0

## File Structure

```
DidactaX/
├── index.html          # Main HTML file
├── css/
│   └── main.css       # Custom styles
├── js/
│   ├── database.js    # IndexedDB setup
│   ├── auth.js        # Authentication system
│   ├── router.js      # Routing system
│   ├── fileManager.js # File/folder management
│   ├── forms.js       # Form rendering
│   ├── editor.js      # Rich text editor
│   ├── payment.js     # Payment system
│   └── main.js        # Main app initialization
└── README.md          # This file
```

## Usage

1. **Getting Started**:
   - Open `index.html` in a modern web browser
   - Create an account or login
   - Start creating works

2. **Creating a Single Page**:
   - Go to Dashboard
   - Click "Create New"
   - Select "Single Page"
   - Enter title
   - Start filling in the 10 sections

3. **Creating a Book**:
   - Go to Dashboard
   - Click "Create New"
   - Select "Book"
   - Enter title and number of pages
   - System auto-creates pages
   - Navigate between pages using Previous/Next

4. **Adding Custom Inputs**:
   - Click "Add New Input" button
   - Enter label
   - Choose input type (text or textarea)
   - Input is added to current section

5. **Renaming/Removing Inputs**:
   - Use edit/trash buttons on each input
   - Confirm deletion when prompted

6. **Downloading Work**:
   - Complete payment via Services page
   - Click "Download" button in editor
   - Choose PDF or DOCX format

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires modern browser with IndexedDB support.

## Notes

- All data is stored locally in IndexedDB
- No server required - works offline
- Auto-save every 30 seconds
- Word/character/paragraph/page counters update in real-time
- Custom scrollbars for better UX
- Auto-focus on empty inputs for better workflow

## Future Enhancements

- Real PDF/DOCX generation libraries
- Payment gateway integration
- Cloud sync
- Collaboration features
- Advanced diagram creation
- Chart generation
- Export templates
- Print preview

## License

See LICENSE file for details.
