# Part 3: Media Upload Widget Integration

## Changes Made
- **Validation**: Updated `lib/storage/validation.ts` to explicitly allow MP4 files and increased the file size limit to 20MB for short animations as requested.
- **MediaPicker Component**: Created a reusable `MediaPicker` component in `components/admin/MediaPicker.tsx` that provides an integrated search, preview grid, and an inline upload dropzone calling the `uploadMediaAction`.
- **Form Integration**:
  - **Service Edit (`ServiceForm.tsx`)**: Replaced the native select fields with styled UI components and integrated `<MediaPicker>` for `featuredImageId`. Added additive schema change (`featuredImageId`) to the `Service` model.
  - **Profile Edit (`ProfileForm.tsx`)**: Refactored the form to use design-system UI components (instead of plain HTML) and integrated `<MediaPicker>` for the avatar. Added additive schema change (`avatarId`) to the `Profile` model.
  - **Project Edit (`ProjectForm.tsx`)**: Integrated `<MediaPicker>` to select the project's featured image. Updated the server action and service layer (`setProjectFeaturedMedia`) to elegantly translate this selection into a `ProjectMedia` relationship with `order: 0`.
  - **Blog Edit (`BlogForm.tsx`)**: Assessed that `MediaPicker` was already included and successfully wired.

## Testing & Proof
- Executed Prisma schema pushes (`npx prisma db push` and `npx prisma generate`) to synchronize the database with the additive fields.
- Drafted a Playwright End-to-End test (`tests/e2e/part3-media-upload.spec.ts`) that logs into the admin panel, navigates to the Profile editor, uploads a test image through the new widget, saves the profile, and asserts that the new avatar correctly renders in the public `/about` page (`app/[locale]/(public)/about/page.tsx`).

Screenshot evidence captured by the E2E test is available in `docs/evidence/day14-5/partD/part3/proof-avatar-rendered.png`.
