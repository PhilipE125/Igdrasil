# Igdrasil Sub-processors

**Last updated:** 2026-08-23
**Version:** 1.0

This page lists the sub-processors Igdrasil AB engages when processing personal data on behalf of our customers. It is Annex III to our [data processing agreement](/dpa/), and it is the named list referred to in section 8.4 of the [privacy notice](/privacy/).

We give customers reasonable advance notice before a new sub-processor starts processing Customer Data, as set out in section 9.4 of the [general terms](/terms/). A customer may object on reasonable grounds.

## 1. Always engaged

These providers are part of running the Service. Every customer's data passes through them.

| Sub-processor | Role | Data processed | Processing location |
|---|---|---|---|
| Amazon Web Services EMEA SARL | Hosting, database, document storage, backups, outbound transactional email | All Customer Data and account data | Europe (Stockholm), `eu-north-1` |
| Clerk, Inc. | User authentication, sessions, multi-factor authentication | Name, email address, user identifier, sign-in metadata | See section 4 |
| PostHog, Inc. | Product analytics inside the Service | User identifier, company identifier, feature usage events | See section 4 |

## 2. AI providers

The Service calls large language models to extract information from documents, suggest account postings, and answer in-product questions. Which provider handles a task is a configuration choice.

| Sub-processor | Role | Data processed | Processing location |
|---|---|---|---|
| Anthropic PBC | Document extraction, accounting suggestions, in-product assistance | Document content and transaction data relevant to the task | See section 4 |
| Google LLC | Document extraction, accounting suggestions, in-product assistance | Document content and transaction data relevant to the task | See section 4 |
| Amazon Web Services (Bedrock) | The same tasks, where the Service is configured to use it | Document content and transaction data relevant to the task | EU inference profiles only, enforced in application code |

We engage these providers under their business API terms, under which data submitted through the API is not used to train their general-purpose models.

## 3. Engaged only when a customer connects them

Nothing below receives any data unless the customer connects the integration and approves the access during the connection flow. Disconnecting the integration ends the transfer.

| Sub-processor | Role | Engaged when |
|---|---|---|
| Enable Banking Oy | Regulated account information service provider (PSD2) that mediates the connection to the customer's bank | The customer connects a bank account |
| Fortnox AB | Bookkeeping system, for pushing and reconciling accounting records | The customer connects Fortnox |
| Bokio Group AB | Bookkeeping system, for pushing and reconciling accounting records | The customer connects Bokio |
| Google LLC (Gmail API) | Reading receipts and invoices from a connected mailbox | The customer connects a mailbox |
| Stripe, Inc. | Reading payouts and transactions into the books | The customer connects Stripe |
| PayPal (Zettle) | Reading payouts and transactions into the books | The customer connects Zettle |
| Shopify Inc. | Reading orders and payouts into the books | The customer connects Shopify |

## 4. Processing locations and transfers

Our own infrastructure runs in the EU: application servers, the database, document storage and backups are all in the AWS Europe (Stockholm) region.

Some of the providers above process data outside the EU/EEA. Where that happens, the transfer is covered by the European Commission's Standard Contractual Clauses under GDPR Art. 46(2)(c), supplemented by technical measures including encryption in transit and at rest. Customers can request a copy of the safeguards, and the current processing region for any provider on this list, at privacy@igdrasil.se.

Where the Service is configured to use Amazon Bedrock, model routing is restricted to EU inference profiles. A model identifier that is not EU-scoped is rejected in code before the request leaves our systems.

## 5. Changes

Material changes to this list are notified to active customers by email or in-product message before the new sub-processor begins processing. The "Last updated" date above shows when this list last changed.

Questions: **privacy@igdrasil.se**.
