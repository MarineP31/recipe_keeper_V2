# Spec Requirements: OCR Recipe Capture

## Initial Description
OCR Recipe Capture - A feature that allows users to capture recipes from physical sources (cookbooks, magazines, printed recipes) by taking photos and automatically extracting recipe information using optical character recognition.

## Requirements Discussion

### First Round Questions

**Q1:** Should users be able to capture recipes from taking a live photo with their camera, selecting an existing photo from their library, or both?
**Answer:** Users should be able to capture recipes from BOTH taking a live photo with their camera AND selecting an existing photo from their library.

**Q2:** What recipe information should the OCR attempt to extract - just the basics (title, ingredients, steps), or also metadata like prep time, cook time, servings, and source?
**Answer:** Extract ALL recipe fields that the OCR can detect: title, ingredients (with quantities and units), instruction steps, prep time, cook time, servings, and potentially source/cookbook name.

**Q3:** Which OCR service should we use?
**Answer:** Use Tesseract.js (free local option).

**Q4:** After OCR processing, should users immediately review and correct the extracted data before saving, or should we save it first and let them edit afterward?
**Answer:** Take/Select Photo → OCR Processing → Show Pre-filled Recipe Form → User Reviews/Corrects → Save Recipe. This allows users to fix any OCR mistakes before saving.

**Q5:** Should we show confidence scores or visual indicators for OCR-extracted fields that might be uncertain (e.g., highlighting fields with low confidence)?
**Answer:** Show confidence scores or visual indicators for OCR-extracted fields that might be uncertain (e.g., highlighting fields with low confidence in yellow).

**Q6:** Should users be able to capture multiple photos for one recipe (e.g., ingredients on one page, instructions on another)?
**Answer:** Keep it simple with one photo = one recipe capture for MVP.

**Q7:** Should we offer image pre-processing tools (crop, rotate, enhance contrast) before OCR processing to improve accuracy?
**Answer:** Just process the raw photo as-is (no pre-processing tools).

**Q8:** If OCR fails or produces poor results, how should we handle it?
**Answer:** Show a clear error message, allow users to retry with the same or new photo.

**Q9:** Are there any budget constraints or preferences regarding OCR API costs?
**Answer:** N/A (using free Tesseract.js)

**Q10:** Should the OCR capture be a separate flow accessed via a dedicated button, or integrated into the existing "Add Recipe" flow as an alternative input method?
**Answer:** The plus button on the center of the bottom tab should trigger OCR capture flow (or show options for Add Recipe vs Scan Recipe).

**Q11:** Should we implement smart parsing logic to detect different recipe formats (bulleted ingredients, numbered steps, etc.) and structure them correctly?
**Answer:** Implement smart parsing logic to detect different formats and structure them correctly.

**Q12:** Is there anything specifically OUT of scope that we should NOT build for this feature?
**Answer:** No recipe URL detection within photos.

### Existing Code to Reference

No similar existing features identified for reference.

### Follow-up Questions

No follow-up questions were necessary based on the comprehensive answers provided.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No visual files to analyze.

## Requirements Summary

### Functional Requirements

**Core Functionality:**
- OCR-powered recipe capture from photos
- Dual input methods: camera capture OR photo library selection
- Comprehensive field extraction: title, ingredients (with quantities and units), instruction steps, prep time, cook time, servings, source/cookbook name
- Local processing using Tesseract.js (no API calls, works offline)

**User Flow:**
1. User taps center plus button on bottom tab navigation
2. System presents options: "Add Recipe Manually" or "Scan Recipe"
3. User selects "Scan Recipe"
4. System presents camera/library options
5. User takes photo OR selects from library
6. System processes image with Tesseract.js OCR
7. System parses extracted text into recipe fields
8. System displays pre-filled recipe form with confidence indicators
9. User reviews and corrects any OCR mistakes
10. User saves recipe to database

**Confidence Indicators:**
- Visual indicators (e.g., yellow highlighting) for fields with low OCR confidence
- Helps users quickly identify which fields need review
- Confidence threshold to be determined during implementation

**Smart Parsing Logic:**
- Detect and parse bulleted ingredient lists
- Detect and parse numbered instruction steps
- Handle various recipe format variations (different bullet styles, numbering systems)
- Extract quantities and units from ingredient text
- Identify recipe metadata (times, servings) from various formats
- Structure unformatted text into proper recipe components

**Error Handling:**
- Clear error messages when OCR fails or produces poor results
- Retry capability with same photo
- Option to select/capture different photo
- Graceful degradation if OCR confidence is very low

### Reusability Opportunities

**Potential Code Reuse:**
- Existing recipe form components for displaying/editing extracted data
- Existing recipe model/database schema for saving captured recipes
- Existing camera/photo library access patterns (if implemented elsewhere in app)
- Existing bottom tab navigation component for integration

### Scope Boundaries

**In Scope:**
- Camera capture and photo library selection
- Tesseract.js OCR processing (local, offline)
- Extraction of all recipe fields: title, ingredients, steps, times, servings, source
- Smart parsing for various recipe formats
- Confidence indicators for uncertain fields
- Pre-filled form with review/edit capability
- Error handling and retry flow
- Integration with center plus button on bottom tab navigation
- One photo = one recipe (MVP approach)

**Out of Scope:**
- Multi-photo capture for single recipe (future enhancement)
- Image pre-processing tools (crop, rotate, contrast adjustment)
- URL detection within photos
- Multi-language OCR support (English only for MVP)
- Handwritten recipe recognition (printed text only)
- Batch processing multiple recipes at once
- Cloud-based OCR services
- Recipe format templates or guided capture
- Advanced image enhancement algorithms

### Technical Considerations

**Tesseract.js Implementation:**
- Client-side JavaScript OCR library
- No API costs or internet connection required
- Processing happens locally on device
- May require worker thread to avoid blocking UI during processing
- Performance considerations for mobile devices
- Memory management for image processing

**Smart Parsing Algorithms:**
- Regular expressions for quantity/unit detection
- Pattern matching for numbered/bulleted lists
- Natural language processing for recipe section identification
- Heuristics for time and serving size extraction
- Fallback strategies when parsing confidence is low

**Confidence Scoring:**
- Tesseract.js provides per-word confidence scores
- Aggregate scores per field
- Define threshold levels (e.g., <70% = low confidence, needs review)
- Visual feedback implementation (highlighting, icons, colors)

**Camera/Photo Library Integration:**
- Platform-specific APIs (iOS/Android camera access)
- Permission handling for camera and photo library
- Image size/quality optimization before OCR processing
- File handling and temporary storage

**Navigation Integration:**
- Center plus button behavior modification
- Modal or sheet presentation for Add vs Scan options
- Seamless transition from OCR flow to recipe form
- Back navigation and flow cancellation handling

**Performance Optimization:**
- Loading indicators during OCR processing
- Image compression to balance quality vs. processing time
- Background processing to keep UI responsive
- Error timeouts to prevent indefinite processing

**Data Validation:**
- Validate extracted data before pre-filling form
- Handle missing or malformed fields gracefully
- Ensure quantities and units are properly paired
- Verify time and serving formats

**Testing Considerations:**
- Test with various recipe formats (cookbooks, magazines, printed cards)
- Test with different lighting conditions and photo quality
- Test with various fonts and text sizes
- Test error scenarios (blurry photos, non-recipe images)
- Test offline functionality
- Test performance on low-end devices
