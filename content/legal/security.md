# Security and Infrastructure Overview

**Last updated:** 2026-08-23
**Version:** 1.0
**Scope:** The Igdrasil production environment

This page describes the technical and organisational measures Igdrasil applies to protect Customer Data. It is Annex II to our [data processing agreement](/dpa/), and it is written to be checked rather than admired: every measure below is one we can evidence today. Section 9 lists what we deliberately do not claim.

## 1. Where your data lives

The production environment runs in the Amazon Web Services Europe (Stockholm) region, `eu-north-1`. Application servers, the primary database, document storage and backups are all located there.

Data leaves the EU only through the third-party providers listed on the [sub-processor page](/subprocessors/), under the safeguards described in section 10 of the [privacy notice](/privacy/).

## 2. Encryption

| Layer | Measure |
|---|---|
| In transit, public | TLS on every connection to the website, the application and the API |
| In transit, internal | Traffic between application components stays inside a private network segment |
| Database at rest | Storage encryption enabled on every production database instance, using a customer-managed KMS key rather than a shared default key |
| Disks at rest | Encryption enabled on all attached block storage volumes |
| Documents at rest | Server-side encryption enabled on the object storage buckets that hold uploaded documents |
| Third-party credentials | Access tokens for connected integrations are encrypted with a dedicated application key before they are written to the database |

## 3. Access control

Sign-in, session handling and multi-factor authentication are provided by a dedicated authentication provider rather than implemented in-house. Every request to the API is verified against the issuing authority before it reaches application logic.

Data is separated by company. Every query that touches Customer Data is scoped to the company the signed-in user belongs to, and that scoping is enforced in the data layer rather than left to individual endpoints.

Production databases are not reachable from the public internet. Administrative access is limited to named individuals who need it, and is granted through cloud identity roles rather than shared credentials.

## 4. Audit trail

Accounting actions write to an append-only audit log. Entries are hash-chained, so that removing or altering an entry after the fact breaks the chain and is detectable. The chain can be verified on demand, and the audit trail can be exported for a given period.

This exists because Swedish bookkeeping law requires that recorded entries cannot be quietly changed. It also means that a customer, or an auditor, can establish what happened and when.

## 5. Backups and recovery

Production databases are backed up automatically with a 7-day retention window and point-in-time recovery enabled, which allows restoring to a specific moment within that window rather than only to the last nightly snapshot.

Backups inherit the encryption of the source database. They are deleted on their ordinary rotation schedule.

## 6. AI features

The AI features described in section 7 of the privacy notice are provided by third-party model APIs under business terms that exclude the use of submitted data for training general-purpose models.

Where the Service is configured to use an EU-hosted inference service, the model route is validated in application code before the request is sent, and a route that is not EU-scoped is rejected. This is a code-level check, not a configuration convention.

AI output is a suggestion. Accounting entries are recorded when a person or a configured rule accepts them, and every entry remains correctable through the audit trail described in section 4.

## 7. Software and change management

The platform is built and deployed from version-controlled source. Changes go through pull requests and automated checks before release. Dependencies are pinned and updated deliberately rather than floating.

Secrets are held in the cloud provider's managed parameter and secret storage, not in source control.

## 8. Incident response

If we become aware of a personal data breach affecting Customer Data, we notify affected customers without undue delay and in any event within 48 hours, with the information set out in section 13 of the [data processing agreement](/dpa/). Where the law requires it, we notify the Swedish Authority for Privacy Protection within 72 hours.

Security concerns can be reported at **security@igdrasil.se**. We aim to acknowledge a report within one business day. We will not pursue legal action against anyone who reports a vulnerability to us in good faith, gives us reasonable time to fix it, and does not access or alter data beyond what is needed to demonstrate the issue.

## 9. What we do not claim

We would rather be checked than trusted, so it is worth being explicit about the limits.

- **We are not certified.** Igdrasil does not hold a SOC 2 report or an ISO/IEC 27001 certificate today. Any statement to the contrary anywhere else is wrong, and we would like to know about it.
- **We have not commissioned an external penetration test.** When we do, this page will say so and give the date.
- **We do not operate a 24/7 staffed security operations centre.** We are a small company, and pretending otherwise would be the kind of claim this page exists to avoid.
- **This page is not a warranty.** It describes measures in place on the date above. The contractual commitments are in the [general terms](/terms/) and the [data processing agreement](/dpa/).

## 10. Questions

Security: **security@igdrasil.se**
Data protection: **privacy@igdrasil.se**

Customers evaluating Igdrasil can request our current security questionnaire responses and a copy of the countersigned data processing agreement at either address.
