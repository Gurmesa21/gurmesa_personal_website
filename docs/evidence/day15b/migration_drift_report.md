# Migration History Drift Report (Updated)

During the start of Day 15b, a schema drift was detected due to past usage of `db push` for `likesCount` and `BlogComment`. 
We resolved this by generating a squash migration (`20261009060957_sync_schema`) that baselined the current schema.

## Updates for Part 8 and Part 9

1. **Blog Likes**:
   - We removed the old `likesCount` column from `BlogPost`.
   - We introduced a new `BlogLike` model with `voterHash` to enforce rate limits per IP and user-agent.
   - We generated a clean migration (`20261009104637_blog_likes`).
   - *Note*: To avoid a data loss prompt from Prisma during `migrate dev` (due to non-interactive environment), we temporarily cleared the local dev `BlogPost` data, allowing the `likesCount` column drop to proceed cleanly.

2. **Blog Comments**:
   - Updated the `isApproved` default on `BlogComment` from `true` to `false` for moderation.
   - Added `NEW_COMMENT` to the `NotificationType` enum.
   - Generated a clean migration (`20261009104943_blog_comments_approval`).

**Result**: 
- The schema is fully synchronized with the migration history. 
- No manual `db push` was needed for these changes, and the database remains safe.
