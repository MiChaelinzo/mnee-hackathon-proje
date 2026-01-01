# Drag & Drop File Upload Guide

## Overview
The Marketplace Chat system now supports intuitive drag-and-drop file uploads, making it easier to share images, documents, and code files during conversations with service providers and agents.

## Features

### Drag-and-Drop Upload
- **Drop Zone**: The entire chat message area acts as a drop zone when files are dragged over it
- **Visual Feedback**: A prominent overlay appears with animated icons when dragging files, showing where to drop
- **Supported File Types**: 
  - Images (JPG, PNG, GIF, WebP, etc.)
  - Documents (PDF, DOC, DOCX, TXT)
  - Code Files (JS, TS, TSX, JSX, JSON, CSS, HTML)
- **File Size Limit**: Maximum 10MB per file
- **Multiple Files**: Upload multiple files at once

### Traditional Upload
- **Attach Button**: Click the paperclip icon to browse and select files
- **Keyboard Accessible**: Full keyboard navigation support for accessibility

### Attachment Management
- **Preview Before Sending**: Review all attachments with thumbnails before sending the message
- **Image Previews**: Full inline previews for image files
- **Document Icons**: Contextual icons for different document types (PDF, code, text)
- **File Info**: See file names and sizes for each attachment
- **Remove Attachments**: Remove individual files or clear all with one click
- **Send Without Text**: Can send attachments alone or with a message

### In-Message Display
- **Inline Images**: Images display directly in chat messages with click-to-expand
- **Document Cards**: Documents show as cards with download buttons
- **File Metadata**: File names and sizes displayed clearly
- **Sender/Recipient Styling**: Attachments match message styling for visual consistency

## Usage

### How to Upload via Drag & Drop

1. **Start a Conversation**: Select or start a chat conversation
2. **Prepare Your Files**: Locate the files you want to share
3. **Drag Files**: Click and drag files from your file explorer over the chat area
4. **Visual Indicator**: A blue overlay with "Drop files here" appears
5. **Drop**: Release the mouse button to upload the files
6. **Preview**: Review the attachment previews that appear above the message input
7. **Send**: Type an optional message and click Send

### How to Upload via Button

1. **Click Attach Button**: Click the paperclip icon in the message input area
2. **Select Files**: Choose one or more files from the file picker dialog
3. **Preview**: Review the attachment previews
4. **Send**: Add a message if desired and click Send

### Managing Attachments

- **Remove Single File**: Click the X button on any attachment preview
- **Clear All**: Click "Clear All" button to remove all attachments at once
- **Send Files Only**: You can send attachments without typing a message
- **Add More**: Upload additional files before sending to batch them together

### Downloading Attachments

- **Images**: Click on image to open in new tab
- **Documents**: Click the download icon to save the file
- **File Info**: Hover to see full file name and size

## Technical Details

### File Validation
- Files over 10MB are automatically rejected with an error message
- Unsupported file types are filtered based on accept attribute
- Multiple validation checks prevent invalid uploads

### Storage
- Attachment URLs are created using `URL.createObjectURL()` for efficient preview
- URLs are properly cleaned up when attachments are removed to prevent memory leaks
- Attachments persist in messages using the chat storage system

### Performance
- Lazy loading for attachment previews
- Efficient blob URL management
- Minimal re-renders during drag operations

## Visual Indicators

### Drop Zone Overlay
- **Background**: Semi-transparent blue backdrop with blur effect
- **Border**: Dashed blue border (4px) to indicate drop area
- **Icon**: Animated bouncing paperclip icon
- **Text**: Clear instructions "Drop files here"
- **Subtext**: Supported file types and size limit

### Attachment Previews
- **Grid Layout**: Responsive grid (2-3 columns) for multiple files
- **Image Previews**: Aspect-ratio boxes with full image thumbnails
- **Document Cards**: Icon + file name + file size
- **Hover States**: Remove button appears on hover
- **File Count**: Total attachment count displayed

### Helper Text
- Persistent hint below message input: "Drag & drop files anywhere or click Attach to upload"
- Icon-reinforced messaging for discoverability

## Best Practices

1. **Compress Large Files**: Reduce file sizes before uploading for faster transfers
2. **Use Descriptive Names**: Name files clearly so recipients understand the content
3. **Batch Related Files**: Upload multiple related files together in one message
4. **Add Context**: Include a message explaining what the attachments contain
5. **Check Previews**: Always review attachment previews before sending

## Limitations

- Maximum file size: 10MB per file
- Files are stored as blob URLs (client-side only)
- No server-side persistence (demo application)
- Limited to supported file types for security

## Future Enhancements

Potential improvements for future versions:
- Cloud storage integration for file persistence
- Virus scanning for uploaded files
- Advanced image editing tools
- Paste-to-upload from clipboard
- Progress indicators for large uploads
- Batch download for multiple attachments
- File compression/optimization
- Thumbnail generation for videos
