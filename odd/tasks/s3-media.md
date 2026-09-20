# S3 media (replace Cloudinary)

## Objective
Replace Cloudinary with S3 for user/post image uploads. Keep API shape `req.image.secure_url`.

## Design
- Dedicated media bucket (CDK), public GetObject on `uploads/*`
- Middleware `uploadToS3` replaces Cloudinary
- Env: `MEDIA_BUCKET`, `MEDIA_BASE_URL`, `MEDIA_ENDPOINT=memory` for local/tests

## Checklist
- [x] Replace cloudinary utility + routes
- [x] CDK media bucket + IAM Put/Delete
- [x] Tests, env examples, docs (30/30 green)
