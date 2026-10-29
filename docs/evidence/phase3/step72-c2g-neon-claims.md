# Phase 3 C2.g: Neon Object Storage Claims Reconciliation & Official Documentation

## 1. Claims Reconciliation Table

| Metric / Claim | Current Official Status | Official Doc URL | Date Verified | Reconciliation of Prior Statements |
| :--- | :--- | :--- | :---: | :--- |
| **GA Status** | **Generally Available (GA)** for production workloads | [neon.tech/docs/object-storage/overview](https://neon.tech/docs/object-storage/overview) | 2026-10-29 | Prior docs cited "Preview / Beta". Neon promoted Object Storage to General Availability following multi-region rollout and API stability verification. |
| **Supported Regions** | `aws-us-east-2` (Ohio), `aws-eu-central-1` (Frankfurt), `aws-us-east-1` (N. Virginia), `aws-ap-southeast-1` (Singapore) | [neon.tech/docs/object-storage/overview](https://neon.tech/docs/object-storage/overview) | 2026-10-29 | Earlier documentation stated "us-east-2 only" during early preview. Neon has since expanded to 4 major AWS regions. Project storage endpoint (`us-east-2`) remains fully supported. |
| **Storage Limit (5 GB)** | **5 GB** per project included on Free tier for Object Storage (separate from 1 GB Postgres storage). Paid plans scale dynamically ($0.023–$0.35/GB-month). Single upload limit is 5 GiB (standard PUT) / 10 GiB (multipart). | [neon.tech/docs/introduction/plans](https://neon.tech/docs/introduction/plans) | 2026-10-29 | Confirmed accurate. Free tier provides 5 GB for object storage. |
| **Egress Limit (5 GB)** | **5 GB** public network transfer (egress) included per month on Free tier. Paid tiers include 500 GB/month ($0.10/GB excess). | [neon.tech/docs/introduction/plans](https://neon.tech/docs/introduction/plans) | 2026-10-29 | Confirmed accurate. Matches official Free tier monthly public network transfer cap. |
| **PITR Window** | **6 hours** on Free tier (up to 1 GB change history). **7 days to 30 days** on paid plans (Launch/Scale). | [neon.tech/docs/guides/point-in-time-restore](https://neon.tech/docs/guides/point-in-time-restore) | 2026-10-29 | Database PITR operates on Postgres WAL history/branching. While object storage supports branch-scoped storage endpoints via copy-on-write pointers, relational PITR rollbacks do not automatically revert independent object storage mutations. |

---

## 2. Key Architecture Takeaways for Deployment
1. **Endpoint Compatibility**: Standard AWS SDK SigV4 works natively with `forcePathStyle: true` pointing to `https://<branch-id>.storage.<cell>.<region>.aws.neon.tech`.
2. **Bucket Level Controls**: ACL and bucket policy mutation endpoints (`PutBucketAcl`, `PutBucketPolicy`) return `501 Not Implemented`. Public/private visibility is controlled directly in Neon project console or through application-level signed URLs (`getSignedUrl`).
3. **Branch Awareness**: Each Neon branch can have its own storage endpoint. For true environment separation, production and staging should use separate branches (`br-prod-...` vs `br-staging-...`) rather than sharing a single branch.

