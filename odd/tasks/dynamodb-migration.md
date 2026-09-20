# DynamoDB migration

## Objective
Replace MongoDB/Mongoose with DynamoDB single-table; keep S3(+CloudFront) for static hosting. Preserve HTTP API shapes (`_id`) so characterization tests stay valid.

## Design (locked)
Single table `ShareSocialMedia` (env `TABLE_NAME`):
- User: PK=`USER#id` SK=`PROFILE`; GSI1 email `EMAIL#email` / `USER`
- Storage: PK=`FILE#id` SK=`META` (+ soft `deleted`)
- Post: PK=`POST#id` SK=`META`; GSI1 feed `FEED` / `POST#iso#id`; GSI2 user posts `USER#id` / `POST#iso#id`
- Comment: PK=`COMMENT#id` SK=`META`
- Item: PK=`ITEM#id` SK=`META`
- Default image id stays `63cf4d2242c5e33c105a87eb`

## Checklist
- [x] T1 Dynamo client + repository + rewrite services/controllers
- [x] T2 Tests on in-memory Dynamo adapter (`DYNAMODB_ENDPOINT=memory`) — 30/30 green
- [x] T3 CDK table PAY_PER_REQUEST + Lambda IAM; remove DB_URI secret
- [x] T4 Docs/README/.env_example

## Constraints
Low cost: on-demand billing. No DocumentDB. Search: in-memory filter after feed query (demo scale).
Hosting: S3 + CloudFront (not Render).
