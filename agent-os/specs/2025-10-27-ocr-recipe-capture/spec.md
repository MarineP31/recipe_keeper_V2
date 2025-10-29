# Specification: OCR Recipe Capture

## Goal
Enable users to digitize physical recipes from cookbooks, magazines, and printed materials through camera or photo library selection, automatically extracting and parsing recipe information using Tesseract.js OCR with confidence indicators for review before saving.

## User Stories
- As a user, I want to take a photo of a recipe page so that I can quickly digitize recipes without manual typing
- As a user, I want to select existing recipe photos from my library so that I can process recipes I've already photographed
- As a user, I want the OCR to extract title, ingredients, steps, and metadata so that I don't have to enter every field manually
- As a user, I want to see which fields have low OCR confidence so that I can focus my review on uncertain data
- As a user, I want to review and correct OCR results before saving so that I can fix any mistakes
- As a user, I want to retry if OCR fails so that I can try a different photo or better lighting

## Core Requirements

### Photo Capture Options
- Dual input: camera capture OR photo library selection
- Camera permission handling with clear explanations if denied
- Photo library permission handling
- Image preview before OCR processing
- Option to retake or select different photo before processing

### OCR Processing with Tesseract.js
- Local on-device processing (no API calls, works offline)
- Non-blocking processing using worker threads
- Loading indicator during OCR extraction (5-15 seconds typical)
- Text extraction from captured/selected image
- Per-word confidence scores from Tesseract.js
- Error handling for blurry, low-quality, or non-recipe images
- Timeout after 30 seconds if processing hangs

### Smart Parsing Algorithms
- Recipe title detection (largest text at top, or first bold line)
- Ingredient parsing: detect list patterns (bulleted, dashed, asterisk)
- Ingredient extraction: separate name, quantity, unit from each line
- Instruction step parsing: handle numbered lists, bulleted lists, paragraph format
- Metadata extraction: prep time, cook time, servings, source/cookbook name
- Handle various formats: "2 cups flour", "flour - 2 cups", "2c flour", etc.
- Time format parsing: "30 min", "30 minutes", "1 hour 15 min", "1h 15m"
- Serving format parsing: "Serves 4", "4 servings", "Makes 12"

### Confidence Scoring System
- Aggregate confidence score per field based on Tesseract.js word-level scores
- Threshold levels: High (>80%), Medium (60-80%), Low (<60%)
- Visual indicators: Yellow highlight for low confidence fields (<70%)
- Icon indicators: Warning icon for fields needing review
- Overall recipe confidence score displayed at top of review form

### Pre-filled Form Review Flow
- Navigate to recipe form with all extracted data pre-populated
- Same recipe form structure as manual entry (from Recipe CRUD Operations spec)
- All fields editable with standard form controls
- Low-confidence fields highlighted in yellow
- Show original photo as thumbnail reference
- Option to view full-size source photo during review
- Standard form validation applies after user edits

### Error Handling and Retry
- Clear error message if OCR fails: "Unable to extract recipe. Please try again with better lighting or a clearer photo."
- Retry button to attempt same photo again
- "Try Different Photo" button to capture/select new image
- Graceful degradation: if minimal data extracted, show empty form with what was found
- Validation error if no title or ingredients extracted

### Navigation Integration
- Center plus button on bottom tab presents options: "Add Recipe Manually" or "Scan Recipe"
- "Scan Recipe" option launches OCR capture flow
- Flow: Options Modal -> Camera/Library Selection -> OCR Processing -> Pre-filled Form -> Save -> Recipe Detail
- Back button cancels OCR flow at any stage
- Cancel confirmation if OCR processing in progress

## Visual Design
No visual mockups provided. Implementation should follow:
- Standard mobile camera interface for photo capture
- Action sheet or modal for "Add Manually" vs "Scan Recipe" choice
- Action sheet for camera vs library selection
- Full-screen loading overlay during OCR processing with progress indicator
- Recipe form with yellow highlights on low-confidence fields
- Warning icons next to field labels that need review
- Confidence score badge at top of form (e.g., "85% Confidence - Review highlighted fields")

## Reusable Components

### Existing Code to Leverage
- **Recipe Form**: Complete form structure from Recipe CRUD Operations (app/recipes/form.tsx)
- **Recipe Schema**: Use same TypeScript interfaces and Zod validation from lib/validations/recipe-form-schema.ts
- **Database Service**: RecipeService.create() to save parsed recipe
- **Image Handling**: Image optimization utilities from lib/utils/image-processor.ts (if exists)
- **Bottom Tab Navigation**: Existing tab bar structure in app/(tabs)/_layout.tsx
- **UI Components**: ThemedText, ThemedView from components/ directory
- **Enums**: DishCategory, MeasurementUnit from constants/enums.ts (Local Storage Foundation spec)
- **Form Validation**: React Hook Form + Zod pattern established in Recipe CRUD Operations

### New Components Required
- **OCR Capture Flow Screen**: New screen to manage photo capture and processing (app/ocr/capture.tsx)
- **Camera/Library Picker Component**: Action sheet to select photo source (components/ocr/photo-source-picker.tsx)
- **OCR Processing Service**: Tesseract.js wrapper with worker thread management (lib/ocr/tesseract-service.ts)
- **Recipe Parser Service**: Smart parsing algorithms for recipe text (lib/ocr/recipe-parser.ts)
- **Confidence Scorer**: Calculate and aggregate confidence scores (lib/ocr/confidence-scorer.ts)
- **Loading Overlay Component**: OCR processing indicator (components/ocr/ocr-loading-overlay.tsx)
- **Confidence Indicator Components**: Highlight wrapper and warning icons (components/ocr/confidence-indicator.tsx)
- **Options Modal**: "Add Manually" vs "Scan Recipe" selection (components/recipes/add-recipe-modal.tsx)

## Technical Approach

### File Structure
```
app/
├── ocr/
│   ├── capture.tsx                 # Photo capture/selection + OCR processing screen
│   └── _layout.tsx                 # Stack navigator for OCR flow

components/
├── ocr/
│   ├── photo-source-picker.tsx     # Camera vs Library action sheet
│   ├── ocr-loading-overlay.tsx     # Processing indicator with progress
│   ├── confidence-indicator.tsx    # Yellow highlight wrapper + warning icons
│   └── image-preview.tsx           # Image preview before OCR
├── recipes/
│   └── add-recipe-modal.tsx        # "Add Manually" vs "Scan Recipe" options

lib/
├── ocr/
│   ├── tesseract-service.ts        # Tesseract.js setup and worker management
│   ├── recipe-parser.ts            # Smart parsing algorithms
│   ├── confidence-scorer.ts        # Confidence calculation
│   └── ingredient-parser.ts        # Ingredient text parsing utilities
└── utils/
    └── text-utils.ts               # String manipulation for parsing
```

### Tesseract.js Implementation

**Setup and Configuration:**
- Install dependencies: `tesseract.js` and `@types/tesseract.js`
- Configure for React Native environment (may need react-native-fs for asset loading)
- Use English language data (eng.traineddata)
- PSM (Page Segmentation Mode) 3: Auto page segmentation with OSD (Orientation and Script Detection)
- OEM (OCR Engine Mode) 3: LSTM neural net mode (best accuracy)

**Worker Thread Management:**
- Initialize worker on app startup (or lazy load on first OCR use)
- Keep worker alive for duration of OCR session
- Terminate worker after OCR completion to free memory
- Handle worker errors and automatic restart
- Queue system if multiple OCR requests (though MVP is single photo)

**Code Pattern:**
```typescript
// lib/ocr/tesseract-service.ts structure
class TesseractService {
  private worker: Tesseract.Worker | null;

  async initialize(): Promise<void>
  async recognizeImage(imageUri: string): Promise<RecognitionResult>
  async terminate(): Promise<void>
  getProgress(): number
}

interface RecognitionResult {
  text: string;
  confidence: number;
  words: WordData[];
}

interface WordData {
  text: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
}
```

### Smart Parsing Algorithms

**Title Detection Logic:**
1. Split OCR text into lines
2. Find first non-empty line
3. If bold or larger font (check bbox height), use as title
4. If first line is short (<5 words) and not an ingredient pattern, use as title
5. Fallback: prompt user to enter title (empty field)

**Ingredient Parsing Logic:**
1. Detect ingredient section: look for headers like "Ingredients:", "You'll need:", etc.
2. Identify list pattern: lines starting with bullet (•, -, *, ○), numbers, or consistent indentation
3. For each ingredient line:
   - Extract quantity: match numbers, fractions (1, 2, 1/2, 0.5, ½)
   - Extract unit: match against MeasurementUnit enum (cup, tbsp, oz, etc.)
   - Extract name: remaining text after quantity/unit
   - Handle formats: "2 cups flour", "flour (2 cups)", "2c flour"
4. Store as structured Ingredient objects: { name, quantity, unit }

**Instruction Step Parsing Logic:**
1. Detect instruction section: look for headers like "Instructions:", "Directions:", "Method:", "Steps:"
2. Identify step format:
   - Numbered: lines starting with "1.", "2.", "Step 1", etc.
   - Bulleted: lines starting with bullet characters
   - Paragraph: continuous text, split on periods followed by capital letters
3. Clean each step: remove numbering, trim whitespace
4. Store as array of strings

**Metadata Extraction Logic:**
- Prep Time: regex for "prep: X min", "preparation time: X minutes", "prep time X min"
- Cook Time: regex for "cook: X min", "cooking time: X minutes", "bake X minutes at"
- Servings: regex for "serves X", "X servings", "makes X", "yield: X"
- Source: if text contains "from", "source:", "adapted from", extract that line

**Regular Expression Patterns:**
```typescript
// Quantity patterns
const QUANTITY_PATTERN = /(\d+(?:\/\d+)?(?:\.\d+)?|\½|\⅓|\⅔|\¼|\¾)/;

// Unit patterns (match against MeasurementUnit enum)
const UNIT_PATTERN = /(cup|cups|c\.|tbsp|tablespoon|tsp|teaspoon|oz|ounce|lb|pound|g|gram|kg|ml|l|liter)/i;

// Time patterns
const TIME_PATTERN = /(\d+)\s*(min|mins|minute|minutes|hour|hours|h|hr)/i;

// Serving patterns
const SERVING_PATTERN = /(serves|servings|makes|yield)[\s:]*(\d+)/i;
```

### Confidence Scoring System

**Word-Level Confidence (from Tesseract.js):**
- Tesseract.js provides confidence score (0-100) for each recognized word
- Use word.confidence property from recognition result

**Field-Level Aggregation:**
```typescript
interface FieldConfidence {
  field: string;
  confidence: number;
  needsReview: boolean;
}

function calculateFieldConfidence(words: WordData[]): number {
  const avgConfidence = words.reduce((sum, w) => sum + w.confidence, 0) / words.length;
  return Math.round(avgConfidence);
}

function aggregateConfidenceScores(parsedRecipe: ParsedRecipe): FieldConfidence[] {
  // Calculate confidence for each field based on source words
  // Return array of field-level confidence scores
}
```

**Thresholds:**
- High confidence (>80%): Green checkmark icon, no highlight
- Medium confidence (60-80%): Yellow highlight, info icon
- Low confidence (<60%): Yellow highlight, warning icon, "Review Recommended"

**Visual Indicators:**
- Wrap form fields in ConfidenceIndicator component
- Pass confidence score as prop
- Render yellow background for low/medium confidence
- Show icon next to label
- Display overall recipe confidence at form top

### Camera and Photo Library Integration

**Dependencies:**
- Install: `expo-image-picker` (handles both camera and library)
- Install: `expo-camera` permissions (included in expo-image-picker)

**Permission Handling:**
```typescript
async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Camera Permission', 'Camera access is required to scan recipes.');
    return false;
  }
  return true;
}

async function requestLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Photo Library Permission', 'Photo library access is required.');
    return false;
  }
  return true;
}
```

**Image Capture:**
- Camera: `ImagePicker.launchCameraAsync()`
- Library: `ImagePicker.launchImageLibraryAsync()`
- Options: allowsEditing: false, quality: 1, base64: false
- Return imageUri (not base64) for processing

**Image Optimization:**
- Resize to max 1600px width before OCR (balance quality vs processing time)
- Convert to JPEG format
- Maintain aspect ratio
- Store original in temp directory for OCR processing
- After successful save, move to permanent storage or delete

### Navigation Flows

**OCR Capture Flow:**
1. User taps center plus button on bottom tab
2. Show modal: "Add Recipe Manually" or "Scan Recipe"
3. User selects "Scan Recipe"
4. Navigate to app/ocr/capture.tsx
5. Show action sheet: "Take Photo" or "Choose from Library"
6. User captures/selects photo
7. Show image preview with "Process" and "Retake" buttons
8. User taps "Process"
9. Show full-screen loading overlay with progress
10. OCR processing completes
11. Navigate to app/recipes/form.tsx with pre-filled data and confidence scores
12. User reviews and edits fields
13. User taps "Save"
14. Navigate to app/recipes/[id].tsx with new recipe

**Error/Retry Flow:**
1. If OCR fails or low confidence on all fields
2. Show error alert with options: "Retry", "Try Different Photo", "Cancel"
3. "Retry": attempt OCR again with same photo
4. "Try Different Photo": return to photo source selection
5. "Cancel": return to recipe list

**Back Navigation:**
- From OCR capture screen: return to recipe list
- From recipe form with OCR data: confirm "Discard OCR results?" before navigating away

### Performance Considerations

**OCR Processing Optimization:**
- Image compression before OCR: resize to 1600px max width
- Use worker threads to prevent UI blocking
- Show progress indicator (Tesseract.js provides progress events)
- Timeout after 30 seconds, show retry option
- Free memory after OCR completion (terminate worker)

**Memory Management:**
- Limit image size for OCR processing (max 2000x2000px)
- Use imageUri references, not base64
- Clear temp images after processing
- Monitor memory usage on low-end devices

**Background Processing:**
- OCR runs on worker thread (non-blocking)
- UI remains responsive during processing
- Progress updates every 500ms
- Cancel button available during processing

### Integration with Recipe Form

**Pre-filling Data:**
- Pass parsed recipe data to form via route params or context
- Use React Hook Form's reset() method to populate fields
- Add confidence scores as metadata to form state
- Render confidence indicators on relevant fields

**Confidence Indicator Integration:**
```typescript
// Wrap form inputs with confidence indicator
<ConfidenceIndicator confidence={fieldConfidence} fieldName="title">
  <Input label="Recipe Title" {...register('title')} />
</ConfidenceIndicator>
```

**Form State Management:**
- Store original OCR text and confidence scores
- Track user edits separately from OCR data
- Show "Edited" badge on modified fields
- Maintain parsed data structure for saving

## Out of Scope
- Multi-photo capture for single recipe (future enhancement)
- Image pre-processing tools (crop, rotate, contrast adjustment)
- URL or website detection within photos
- Multi-language OCR support (English only for MVP)
- Handwritten recipe recognition (printed text only)
- Batch processing multiple recipes at once
- Cloud-based OCR services (Google Vision, AWS Textract)
- Recipe format templates or guided capture
- Advanced image enhancement algorithms (auto-rotate, perspective correction)
- Nutritional information extraction or calculation
- OCR accuracy training or custom models
- Recipe duplicate detection from OCR results
- Social sharing of OCR-captured recipes

## Success Criteria
- User can capture and process a recipe photo in under 30 seconds
- OCR extracts recipe title with >75% success rate on clear printed recipes
- OCR extracts ingredients with >70% success rate (name, quantity, unit)
- OCR extracts instruction steps with >70% success rate
- Confidence indicators accurately highlight fields needing review
- User can edit all OCR-extracted fields before saving
- OCR processing doesn't block UI or cause app freeze
- Clear error messages with retry options for failed OCR
- Form pre-fills correctly with all extracted data
- Worker threads properly initialize and terminate without memory leaks
- Permission requests work correctly on iOS and Android
- Camera and photo library access function smoothly
- All navigation flows work without unexpected behavior
- Saved recipes from OCR match manual entry quality after review
- Zero crashes during OCR capture flow in testing
