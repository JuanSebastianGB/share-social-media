# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audiences (both confirmed):

1. **Portfolio visitors** evaluating the author's AWS and full-stack engineering skills — they need a real, signed-in product experience, not screenshots or a fake demo shell.
2. **End users** who want to share posts with friends — they need a working social loop (auth, feed, profiles, friends, media).

## Product Purpose

Share Social Media is a real social web app backed by an AWS serverless stack. It exists so visitors can sign in and use the product, and so the same surface doubles as credible portfolio proof of production-shaped AWS work. Success means a stranger can authenticate and complete the core social loop without the experience collapsing into "demo theater."

## Positioning

A real AWS serverless stack you can sign into and use — not a mockup, and not a category clone whose only claim is "another social feed."

## Operating Context

- Web SPA in the `client` package (React + Vite + MUI + Redux).
- Auth: Cognito in AWS; local HS256 JWT when Cognito env is unset (local/dev).
- Core routes: login `/`, register `/register`, home feed `/home`, profile `/profile/:id`.
- Capabilities in use today: posts with likes and comments, friends, profile info, media uploads, light/dark mode toggle.
- Hosted as a static SPA on S3 + CloudFront, API on HTTP API + Lambda, data in DynamoDB, media via S3 + CloudFront.

## Capabilities and Constraints

- Canonical product name: **Share Social Media**. Short mark / document title: **S.S.Media**. Do not use the header wording "social media share" as brand copy.
- Must remain a usable signed-in product (Cognito in AWS; local JWT for local/dev).
- Must preserve the working social loop: posts, likes, comments, friends, media uploads.
- Must remain honest about the live AWS serverless deployment shape (SPA + API + DynamoDB + media).
- UI language: English.
- Do not invent testimonials, customers, benchmarks, metrics, or other social proof.
- Visual world (palette, typography, layout language) is not pinned here; incumbent UI is evidence for later design work, not product law.
- Dark/light mode exists in the incumbent UI; whether it remains a durable product requirement is undecided.

## Brand Commitments

- Product name: Share Social Media
- Short mark: S.S.Media
- Existing icon: `client/public/icon.svg`
- Author attribution in repo: Sebastian Gonzalez

## Evidence on Hand

- Runnable client implementation under `client/src` (auth, home, profile, posts, friends, media).
- Live AWS hosting path documented in repo README (S3 + CloudFront SPA; not Vercel as the target host).
- No real customer testimonials, press, case studies, or fabricated social proof on hand — future work must not invent them.

## Product Principles

1. **Real over theatrical** — every primary flow should be something a visitor can actually sign into and complete.
2. **Dual audience without splitting the product** — portfolio credibility and friend-sharing usefulness share one honest surface.
3. **AWS truth stays visible** — the serverless stack is part of the product claim, not hidden scenery.
4. **No fake proof** — never invent customers, metrics, or testimonials to dress the experience.
5. **Keep the social loop intact** — auth, posts, reactions, comments, friends, and media remain first-class.
