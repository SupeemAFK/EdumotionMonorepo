# TeacherFlowBuilder File Upload Guide

## Overview
The TeacherFlowBuilder now supports comprehensive file upload functionality for each node in the learning flow. Users can upload both video files and supporting materials directly through the interface.

## 🎯 Key Features

### ✅ **Dual File Support**
- **Video Files**: MP4, MOV, AVI, MKV, WebM
- **Material Files**: PDF, DOC, DOCX, TXT, Images (PNG, JPG, JPEG, GIF)

### ✅ **Multiple Upload Methods**
1. **Drag & Drop**: Drag files directly onto the upload area
2. **File Browser**: Click "Choose Files" to open file browser
3. **Video Segments**: Automatic integration with video editor segments

### ✅ **Smart File Handling**
- Files are categorized automatically (Videos vs Materials)
- Original File objects are preserved for upload
- Visual indicators show file types in nodes
- Fallback support for URL-based files (video segments)

## 🚀 How to Use

### Step 1: Create/Select a Node
1. **Add Node**: Right-click on empty space → "Add Step Node"
2. **Select Node**: Click on any existing node to configure it

### Step 2: Upload Files
1. **Open Sidebar**: Click on a node to open the configuration sidebar
2. **Upload Area**: Scroll to "Learning Materials" section
3. **Add Files**: Either:
   - Drag files into the dashed area
   - Click "Choose Files" to browse
   - Files from video editor are automatically added

### Step 3: Organize Files
- **Video Files**: Displayed with red background and video icon
- **Material Files**: Displayed with blue background and file-type icons
- **Delete Files**: Click trash icon to remove unwanted files

### Step 4: Save Configuration
1. Click "Save Changes" in the sidebar
2. Files are now attached to the node
3. Node will show visual indicators for uploaded files

### Step 5: Save Entire Flow
1. Click "Save Flow" button in top-right
2. All files are uploaded to server automatically
3. Database records are created with file references

## 📁 File Organization

### Video Files (Red Theme)
```
🎥 Video Files (2)
├── intro-video.mp4 (15.2 MB)
└── demo-video.mov (8.7 MB)
```

### Material Files (Blue Theme)
```
📄 Materials (3)
├── lesson-plan.pdf (2.1 MB)
├── worksheet.docx (1.5 MB)
└── diagram.png (800 KB)
```

## 🎨 Visual Indicators

### In Node Display
- **Red Dot**: Node has video files
- **Blue Dot**: Node has material files
- **File Count**: Shows total number of files
- **Preview**: Shows first few files with icons

### Empty State
- **Amber Warning**: "No files uploaded"
- **Helper Text**: "Click to configure and upload video/materials"

## ⚙️ Technical Implementation

### File Storage
```typescript
export type UploadedFile = {
  id: string;           // Unique identifier
  name: string;         // Original filename
  size: number;         // File size in bytes
  type: string;         // MIME type
  url: string;          // Blob URL for preview
  uploadedAt: Date;     // Upload timestamp
  file?: File;          // Original File object for upload
};
```

### Upload Process
1. **Local Storage**: Files stored as blob URLs for preview
2. **File Reference**: Original File objects preserved
3. **API Upload**: Files sent as multipart form data
4. **S3 Storage**: Files uploaded to cloud storage
5. **Database**: File URLs stored in node records

### API Integration
```javascript
// FormData structure sent to API
{
  saveLearningGraphDto: JSON.stringify({
    learningId: "uuid",
    nodes: [...],
    edges: [...]
  }),
  "node-123_video": File,      // Video file for node-123
  "node-123_materials": File,  // Materials file for node-123
  "node-456_video": File,      // Video file for node-456
}
```

## 🔧 Configuration Options

### Accepted File Types
```javascript
accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.mp4,.mov,.avi,.mkv,.webm"
```

### File Size Limits
- No client-side limits (handled by server)
- Recommended: Videos < 100MB, Materials < 10MB

### Upload Guidelines
- **Required**: At least one video file per learning node
- **Optional**: Supporting materials (PDFs, documents, images)
- **Best Practice**: Keep file sizes reasonable for faster uploads

## 🎭 User Experience

### Upload Feedback
- **Drag State**: Visual feedback when dragging files
- **File Preview**: Immediate preview after upload
- **Categorization**: Automatic sorting by file type
- **Error Handling**: Clear error messages for failed uploads

### Progress Indicators
- **Node Status**: Visual dots show file availability
- **Upload Progress**: Loading states during save
- **Success Feedback**: Confirmation messages

## 🐛 Troubleshooting

### Common Issues

1. **Files Not Uploading**
   - Check file types are supported
   - Ensure files aren't corrupted
   - Verify network connection

2. **Large File Problems**
   - Compress videos before upload
   - Split large materials into smaller files
   - Check server upload limits

3. **Video Segments Not Working**
   - Ensure video editor integration is working
   - Check blob URLs are valid
   - Verify file references are preserved

### Debug Information
- Check browser console for upload errors
- Monitor network tab for failed requests
- Verify FormData contents before sending

## 📋 Testing Checklist

### ✅ File Upload
- [ ] Drag and drop works
- [ ] File browser works
- [ ] Multiple files can be uploaded
- [ ] Files are categorized correctly
- [ ] File deletion works

### ✅ Visual Feedback
- [ ] Nodes show file indicators
- [ ] File previews display correctly
- [ ] Empty states show appropriate messages
- [ ] File counts are accurate

### ✅ Integration
- [ ] Video segments integrate properly
- [ ] Save flow uploads all files
- [ ] API receives files correctly
- [ ] Database stores file references

### ✅ Error Handling
- [ ] Invalid file types rejected
- [ ] Network errors handled gracefully
- [ ] User feedback for all states
- [ ] Recovery from failed uploads

## 🚀 Advanced Features

### Future Enhancements
- **Multiple Materials**: Support multiple material files per node
- **File Preview**: In-app preview for videos and documents
- **Progress Bars**: Individual upload progress for large files
- **Compression**: Automatic video compression
- **Validation**: File content validation and virus scanning

### Integration Points
- **Video Editor**: Seamless segment integration
- **Cloud Storage**: S3/CDN integration for file serving
- **Database**: File metadata and relationships
- **API**: RESTful file upload endpoints

This comprehensive file upload system provides a seamless experience for educators to create rich, multimedia learning flows with both video content and supporting materials.