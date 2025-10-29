## UX design best practices

### Core Principles

- **Consistency** → Same component for same function
- **User expectations** → Follow established patterns
- **Accessibility** → Never disable built-in a11y features
- **Immediate feedback** → Instant response to user actions
- **Purposeful, not decorative** → Micro-interactions must solve a UX problem
- **Enhance usability** → Guide, confirm, and inform user actions

### Micro-interactions

- **Consistency over novelty**: Reuse patterns to reinforce brand identity
- **Lightweight & fast**: Keep interactions short (100–500ms)
- **Accessible & inclusive**: Must work for all users, even with animations disabled
- **Clear, intentional triggers**: Should be clear, intentional, and user-driven. Avoid accidental activation; ensure touch targets are large enough. Examples: click, tap, hover, swipe, voice command
- **Immediate feedback**: Provide immediate response to confirm recognition of input. Feedback can be visual (color shift), auditory (click sound), or haptic (vibration). Always relevant to the action performed
- **Short, predictable loops & modes**: Keep loops short, predictable, and informative (e.g., progress indicators). Avoid endless or uninterruptible cycles. Offer exit or undo options where mistakes are likely
- **Contextual enhancement**: Place interactions where they enhance flow in the user journey. Support discovery, guidance, or completion without distracting
- **Discoverability**: Reveal hidden features with subtle cues (e.g., swipe hints). Use micro-interactions for onboarding instead of lengthy tutorials
- **Action acknowledgment & status**: Always acknowledge actions (e.g., "Message sent" checkmark). Show progress clearly during waiting states. Provide distinct success, error, and warning states
- **Clarity in interactions**: Match user expectations—avoid surprising effects. Keep animations simple, direct, and non-intrusive. Communicate cause and effect transparently
- **Consistency across product**: Apply the same logic and motion style across the product. Align tone (playful, formal, calm) with brand voice. Standardize duration and easing functions for familiarity
- **Accessibility compliance**: Respect reduced-motion preferences. Ensure non-visual alternatives (text, sound, vibration). Test interactions on multiple devices and input types
- **Common patterns**: Button states (hover/pressed/disabled), form validation, notifications, loading indicators, onboarding highlights, navigation transitions
- **Appropriate timing**: Keep interactions between 100–500ms
- **Performance optimization**: Animations should be smooth and not affect responsiveness
- **Delight without distraction**: Must enhance, not compete with primary tasks
- **User testing**: Validate clarity, accessibility, and emotional impact
- **Cross-platform testing**: Test on different devices, browsers, and assistive tools

### Component Selection

**Quick Decision Tree:**

1. **Action type:**
   - Immediate → Switch, Toggle
   - Validation → Checkbox, Radio, Button
2. **Options count:**
   - 1 → Button, Switch
   - 2-5 → Radio Group, Toggle Group
   - 5-15 → Select
   - 15+ → Combobox
3. **Information priority:**
   - Critical → Alert, Alert Dialog
   - Important → Badge, Alert
   - Informative → Toast, Tooltip
4. **Space constraints:**
   - Yes → Accordion, Tabs, Popover
   - No → Standard layout, Cards
5. **Destructive action:**
   - Yes → Alert Dialog with confirmation
   - No → Direct action or Dialog

### Buttons & Controls

- **Button:** Primary/secondary actions, form submission. Variants: `default` (primary), `outline` (secondary), `destructive` (dangerous), `ghost` (tertiary). Avoid >3 buttons side by side, ambiguous text.
- **Toggle/Switch:** Toggle for immediate binary states, mutually exclusive options. Switch for settings with immediate effect, binary preferences. Avoid choices requiring validation (use Checkbox).

### Form Components

- **Input:** Short text entry, use Input Group for prefixes/suffixes. Placeholder = example, Label = description. Avoid long text (use Textarea), placeholder as sole label.
- **Select/Combobox:** Select for 5-15 options with explicit default/placeholder. Combobox for 15+ options with real-time filtering. Radio Group for <5 options, mutually exclusive.
- **Date Picker:** Specific dates, ranges, reservations. Localized format, disable unavailable dates, presets for "Today", "Tomorrow".
- **Slider:** Continuous ranges, visual adjustments. Display current value, logical steps (5, 10, 25...). Avoid precise values (use number Input).

### Navigation

- **Navigation Menu:** Main site navigation, mega menus. Max 7±2 items, highlight active, responsive hamburger on mobile.
- **Tabs:** Related content, 2-7 sections. Short descriptive labels, icons + text. Avoid main navigation, >7 tabs, critical content in hidden tabs.
- **Breadcrumb:** Deep hierarchy (>3 levels). Start with "Home", current page non-clickable, truncate if too long.
- **Sidebar:** Complex apps, permanent secondary navigation. Collapsible on mobile, icons + labels, group related sections.
- **Pagination:** Long lists (>20 items), data tables. Display "1-10 of 234", items per page options (10, 25, 50).

### Feedback & Dialogs

- **Alert:** Persistent important messages, page status. Variants: default, destructive, warning, success.
- **Toast:** Action confirmations, temporary messages. 3-5s duration, bottom-right position, max 3 simultaneous.
- **Alert Dialog:** Destructive confirmations, critical choices. Always include Cancel button, focus on safe action.
- **Dialog:** Short forms, confirmations. Modal interactions with backdrop, close on Escape and outside click.
- **Sheet:** Side panels, filters, details. Mobile-friendly (slides from edge).
- **Tooltip:** Short explanations (<10 words), icon labels. 500ms delay to avoid spam. Avoid on mobile.
- **Popover:** Rich temporary content, mini-forms, complex menus. Arrow pointing to trigger.

### Presentation

- **Card:** Group information, item lists, action containers. Clear hierarchy (header, body, footer), consistent spacing, hover state if clickable.
- **Table:** Structured data, >3 columns, sort/filter. Sticky headers, pagination for >20 rows. Avoid on mobile (use Cards), <3 columns (use List).
- **Badge:** Status indicators, tags, counters. Consistent colors by type, short text, context-appropriate variant.
- **Progress:** Long loads (>2s), process steps, show percentage if known.
- **Skeleton:** Loading structured content, mimics final structure, avoids layout shift.
- **Spinner:** Short actions (<2s), atomic operations.

### Contextual Components

- **Context Menu:** Right-click actions, desktop apps. Most common actions first, separators to group, display keyboard shortcuts. Avoid on mobile.
- **Dropdown Menu:** Secondary actions, user menus. Menu icon (3 dots, chevron), max 2 depth levels, dividers between sections.
- **Command:** Command palette (Cmd+K), global search. Visible keyboard shortcut, real-time results, recent/favorite actions first.

### Layout Components

- **Separator:** Separate logical sections, visual content division. Moderate use, consistency (horizontal/vertical), subtle color.
- **Aspect Ratio:** Responsive images, embedded videos. Standard ratios (16:9, 4:3, 1:1), placeholder during loading.
- **Scroll Area:** Long content in fixed spaces, lists in sidebars. Always visible scrollbar if scrollable, smooth scrolling.
- **Resizable:** Adjustable panels, editors with preview. Visible resize handle, min/max limits, persist preferences.

### Mobile Adaptations

- **Navigation Menu** → Hamburger menu
- **Hover** → Touch/Long press
- **Table** → Cards or list
- **Sidebar** → Sheet from bottom
- **Tooltip** → Avoid, use direct labels
- **Context Menu** → Long press or action menu
- **Multiple columns** → Vertical stack
