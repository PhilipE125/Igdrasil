## Short answer

Igdrasil is a Swedish AI-powered accounting platform for bookkeeping, invoicing, payroll, VAT, reporting, budgeting, forecasting and other business insights. We use AI and automation to read source documents, suggest account coding, reconcile transactions and let users connect their preferred AI chat to financial data through the CLI. The platform combines accounting-specific guardrails, Swedish accounting logic and a comprehensive security programme. Data is stored within the EU and protected through encryption, role-based access, daily backups and clear audit trails. Igdrasil is working towards ISO 27001 certification and GDPR alignment and compliance.

We are building bookkeeping to be something you can use to run a business, not merely something to complete before a VAT return or year-end closing.

**[See how Igdrasil works](/)**

## Contents

- [What is Igdrasil?](#what-is-igdrasil)
- [Our vision: bookkeeping that helps you make better decisions](#our-vision-bookkeeping-that-helps-you-make-better-decisions)
- [What does Igdrasil do?](#what-does-igdrasil-do)
- [How Igdrasil works in three steps](#how-igdrasil-works-in-three-steps)
- [AI that helps without removing control](#ai-that-helps-without-removing-control)
- [Guardrails that govern agents](#guardrails-that-govern-agents)
- [From accounting data to new insights](#from-accounting-data-to-new-insights)
- [Built for Swedish rules and workflows](#built-for-swedish-rules-and-workflows)
- [Integrations, API and open data flows](#integrations-api-and-open-data-flows)
- [Fortnox sync for a gradual transition](#fortnox-sync-for-a-gradual-transition)
- [Accounting with Claude, ChatGPT and other AI models](#accounting-with-claude-chatgpt-and-other-ai-models)
- [Security, data and archiving](#security-data-and-archiving)
- [Who is Igdrasil for?](#who-is-igdrasil-for)
- [Frequently asked questions](#frequently-asked-questions)

## What is Igdrasil?

Igdrasil is an AI-powered accounting system for Swedish businesses. The platform connects what is otherwise often scattered across different places: receipts, supplier invoices, customer invoices, bank transactions, payroll data, VAT and reports.

The result is a shared financial source of truth, where supporting documentation can be traced all the way to the voucher, account, report and tax-return documentation. Rather than searching for documents and information across platforms and inboxes, the financial workflow should hold together from the beginning.

| With Igdrasil | What it means in practice |
|---|---|
| AI bookkeeping | Receipts and invoices can be read, classified and used as the basis for accounting proposals. |
| Bank reconciliation | Bank transactions are matched with invoices and documents, even where names differ. |
| Invoicing and ledgers | Customer invoices, supplier invoices, due dates and balances are handled in the same financial workflow. |
| Payroll, VAT and reporting | Financial data is used for payroll, VAT reporting and follow-up instead of being copied between systems. |
| Budgets and forecasts | Use current accounting data as a basis for budgeting, forecasts and forward-looking analysis. |
| Connect your AI chat | Use the CLI to ask about VAT, cash flow, costs or overdue customer invoices in the AI chat that suits you. |

## Our vision: bookkeeping that helps you make better decisions

Every business needs to keep accounts. For many, however, bookkeeping becomes a stressful and tedious task that is postponed until VAT, payroll or year-end closing makes it unavoidable.

We want to change that. Bookkeeping is one of a business’s richest data sources. It captures what you sell, what you buy, what is coming in and going out, which customers pay late, and how costs and profitability develop. When documents, bank data, invoices and the general ledger are not connected, that information becomes both time-consuming to administer and difficult to use in decisions.

Igdrasil is built for the opposite: a continuous, understandable and proactive view of finances. The right information should arrive without unnecessary manual work, every proposal should be understandable and reviewable, and you should be able to get answers while the question still matters. Bookkeeping should help you plan, prioritise and act, not merely record the past.

This is how we view **automated bookkeeping**: not as hiding accounting in a black box, but as reducing repetitive work and making the underlying records more accessible. The goal is to get the bookkeeping right from the outset, using agents that work within clear accounting rules and provide reviewable material for approval.

## What does Igdrasil do?

Igdrasil brings together the functions Swedish businesses normally need for day-to-day finance:

- double-entry bookkeeping using the BAS chart of accounts,
- receipts, supplier invoices and other accounting vouchers,
- customer invoicing, accounts receivable and accounts payable,
- bank connections and bank reconciliation,
- payroll administration and supporting data for employer declarations,
- VAT reporting and tax-return documentation,
- reports, budgeting, forecasts and business insights, including profit and loss, balance sheet, general ledger and financial analysis,
- export of accounting data in SIE4 and raw formats, including supporting documents.

For many businesses, the key difference is not one feature. It is that the features share the same data. When an invoice is paid, more than a payment status changes. The same event can be linked to the ledger, bank and accounting records.

## How Igdrasil works in three steps

### 1. Accounting logic for Swedish rules

Automation is only as useful as the accounting logic underneath it. Igdrasil is built on double-entry bookkeeping, the BAS chart of accounts, the general ledger and subsidiary ledgers. The platform is designed to support Swedish accounting rules and generally accepted accounting practice.

Under the [Swedish Bookkeeping Act](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/bokforingslag-19991078_sfs-1999-1078/), business transactions must be capable of presentation both in chronological order and in systematic order in the general ledger. The records must be traceable and reviewable. This is why Igdrasil links supporting documents to vouchers and maintains an audit trail of what has happened in the system.

BAS is Sweden’s most widely used chart of accounts. It structures accounts, VAT and links to SRU tax reporting codes. BAS itself is not mandatory, but an entity subject to bookkeeping obligations must have a suitable chart of accounts. [The Swedish Tax Agency explains BAS and VAT accounts here](https://www4.skatteverket.se/rattsligvagledning/edition/2026.3/411726.html).

### 2. Collect transactions and documents in one place

An accounting system cannot create order if important documentation remains outside it. Igdrasil gathers information where it actually arises: uploaded documents, email, WhatsApp, PSD2 bank connections and integrations with Stripe, Shopify and Zettle. Fortnox is handled as a dedicated sync flow for businesses that want a gradual transition, rather than as an ordinary integration.

When a document arrives, Igdrasil can extract information such as supplier, date, amount and VAT. That information is used to suggest account coding, check whether relevant information is present and link the document to the correct transaction. In bank reconciliation, the system can match bank lines with invoices even when the name in the bank description differs from the supplier name on the invoice.

This context also enables duplicate checking. Igdrasil can detect when the same invoice or receipt has arrived through several channels, so that it is not at risk of being processed or posted more than once.

### 3. Automate repetitive work and make finances queryable

Once accounting logic, documents and transactions exist in one system, automation can handle recurring work: reading documents, matching payments, detecting duplicates, suggesting BAS accounts and flagging exceptions.

Through the Igdrasil CLI, you can connect the AI chat or model that suits you best and ask questions about the company’s finances in plain language. For example:

- *How much VAT are we due to pay so far this quarter?*
- *Which customer invoices are overdue?*
- *Why is cash flow lower than last month?*
- *Which supplier costs have increased the most this year?*

You do not just receive a dashboard to interpret on your own. You have a way to retrieve the relevant view or analysis from the data already in the books.

## AI that helps without removing control

AI is useful for processing large volumes of unstructured information, but it should not obscure a business owner’s responsibility. Igdrasil uses AI agents to create, explain and prioritise accounting proposals. The agents do not operate freely. We have built accounting-specific guardrails that govern which data they may use, which proposals they may provide and when something should be flagged for review. Every accounting proposal is approved by a person before it is posted.

This is an intentional product principle. The party subject to the bookkeeping obligation remains responsible for the accounting even when work is carried out with the help of software or an accounting firm. AI can help you work faster and more consistently, but it cannot replace the judgement needed in an unusual or complex situation.

| AI can help with | You still need to do |
|---|---|
| Read documents and extract date, amount, VAT and counterparty | Ensure that supporting documentation is correct and complete |
| Suggest accounts, VAT treatment and matches | Approve accounting proposals and handle exceptions |
| Find patterns in data and answer questions | Make business and tax judgements where required |

This makes automation useful in a regulated part of the business. It frees up time while retaining a clear control step.

### Guardrails that govern agents

By **guardrails**, we mean technical and organisational constraints that govern how AI agents may work. In accounting, this is not mainly about generic content filters. It is about catching situations that could result in incorrect or insufficiently documented bookkeeping.

Guardrails can, for example:

- work from the company’s chart of accounts, VAT logic and the information actually present in supporting documents,
- check that an accounting proposal balances and can be linked to a voucher,
- flag missing or inconsistent date, counterparty, amount, VAT or business-purpose information,
- detect likely duplicates before the same invoice or receipt is at risk of being posted twice,
- limit access to sensitive financial data according to permissions and maintain an audit trail of actions,
- route uncertain, unusual or rule-sensitive cases to human review instead of treating them as certain facts.

This reduces the risk of an AI agent inventing information, reaching a conclusion without sufficient evidence or using data outside its intended context. Guardrails are therefore a prerequisite for automated bookkeeping that is both efficient and reliable. They do not guarantee that errors are impossible, but they help stop, explain and review errors before anything is posted.

### From accounting data to new insights

When documents, bank transactions, invoices and the general ledger are structured in the same system, AI can do more than automate entry. It can analyse the finances and create reports, explanations and insights that would otherwise require manual analysis.

For example, it can:

- create a report on cash flow, cost development or gross margin for a selected period,
- explain which accounts, suppliers or customers are driving a change in results,
- identify overdue customer invoices, unusual costs or recurring expenses,
- compare VAT, revenue and costs across months, quarters, projects or cost centres,
- turn a plain-language question into a clear financial summary or chart in common formats such as Excel or PDF.

A standard report often shows *what* the balance is. An AI chat connected to Igdrasil through the CLI can help you move on to *why* it looks that way and which details in the accounting records drive it. Insights are based on the company’s own financial data and should always be traceable to the transactions and documents analysed.

## Built for Swedish rules and workflows

Igdrasil is built for Swedish businesses and Swedish accounting workflows. This includes the BAS chart of accounts, Swedish VAT logic, payroll data, employer declarations, SRU links, and year-end routines.

A system can support compliance through order, traceability and the right reporting material, but it cannot take over a business’s statutory responsibility. We therefore describe Igdrasil as built to support the Swedish Bookkeeping Act, Swedish Tax Agency requirements and generally accepted accounting practice, not as a guarantee that every individual posting is correct without user review.

Every business transaction must have a voucher. The voucher must document, among other things, the date, the nature of the transaction, the amount and the counterparty. [The Swedish Bookkeeping Act’s voucher requirements are set out in Chapter 5](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/bokforingslag-19991078_sfs-1999-1078/). Igdrasil is designed to make that documentation easier to capture, link and find.

## Integrations, API and open data flows

Businesses rarely use one system only. Igdrasil is therefore API-first: integrations and custom workflows are part of the product, not an afterthought.

You can connect flows from banks, payments and commerce, and use the API, CLI and MCP server to build your own integrations and AI workflows. This makes Igdrasil relevant both for businesses that want a day-to-day workflow without a technical project and for teams that want to build on top of their financial data.

### Fortnox sync for a gradual transition

The Fortnox sync is designed for businesses that want to try Igdrasil or make parts of their financial work more efficient without immediately replacing their existing accounting system. Rather than an all-or-nothing change, the systems can be used side by side during a transition.

This is particularly useful for workflows such as retrospective bookkeeping, documentation from foreign payment systems, and analyses or financial insights that are difficult to produce efficiently in the existing system. A business can start where the value is greatest and then decide whether to move more of the workflow to Igdrasil.

### Accounting with Claude, ChatGPT and other AI models

Igdrasil has built the CLI and the connections so users can easily connect **Claude, ChatGPT, Gemini, Microsoft Copilot, Codex** and other AI models to their accounting data. It is a model-agnostic architecture in which Igdrasil acts as the controlled financial layer. Through the CLI, a model can have a scoped way to ask about financial data, create report drafts, analyse exceptions or suggest the next step. The API and MCP server are also available for custom integrations and workflows.

Permission controls, audit trails and accounting-specific guardrails govern the agents’ data and actions. They help agents work from actual supporting documents and Swedish accounting logic, rather than inventing information or acting outside their permitted scope.

Your data should also be portable. Igdrasil offers free exports in SIE4 and raw formats, including supporting documents, at any time. This matters for archiving, system changes and the basic principle that accounting records should not be locked into a subscription.

## Security, data and archiving

Accounting data is sensitive business information. Igdrasil places strong emphasis on security: data is stored within the EU and protected through encryption in transit and at rest, daily backups, role-based access and audit trails. We are working towards ISO 27001 certification and GDPR alignment and compliance.

Under the Swedish Bookkeeping Act, accounting information generally must be retained until the end of the seventh year after the end of the calendar year in which the financial year ended. Igdrasil structures the archive by financial year, supplier and relevant retention rules, with links to vouchers.

Technology and security features are support tools, not a reason to stop checking. The business must still manage permissions, review exceptions and follow up on its financial information.

## Who is Igdrasil for?

Igdrasil is built for accounting and bookkeeping firms that want to help their client companies work more efficiently without losing the personal relationship. The platform also suits Swedish businesses that want less administration and a better view of their finances.

### For accounting and bookkeeping firms

A strong firm-client relationship is not just about recording documents. It is about understanding the client’s business, asking the right questions and offering advice when it can make a real difference. Igdrasil helps firms set up and manage their clients’ financial workflows more efficiently, so less time is spent chasing receipts, entering data and resolving exceptions.

When documents, bank events, accounting proposals and reconciliations are gathered in one workflow, it becomes easier to work consistently across several client companies. This frees up time for the personal contact, follow-up and professional judgement that a good accounting firm should spend most of its time on.

### For Swedish businesses

Igdrasil also suits founders and finance leads who want to spend less time on administration and more time running the business. The platform brings together supporting documents, bank events, invoices and reports, giving the business a clearer and more current view of its finances.

You do not need to be an accounting expert to use the information. By asking about VAT, cash flow, costs, receivables or results, you can more quickly understand what is happening in the business and which questions need follow-up. Igdrasil can be used directly by the business or together with an accounting firm, depending on how you want to work.

## Frequently asked questions about Igdrasil

### What is Igdrasil?

Igdrasil is a Swedish AI-powered accounting platform. It brings together bookkeeping, invoicing, payroll, VAT, bank reconciliation and reporting, with support for AI automation and plain-language questions.

### Is Igdrasil an alternative to manual bookkeeping work?

Yes. Igdrasil automates repetitive parts of the process, including document reading, accounting proposals, bank matching and financial summaries. You review and approve accounting proposals before they are posted.

### Does Igdrasil work with the BAS chart of accounts and Swedish VAT?

Yes. The platform is built for Swedish double-entry accounting, the BAS chart of accounts, VAT and other core accounting workflows for Swedish businesses.

### Can I use Igdrasil with Fortnox, Stripe, Shopify and Zettle?

Yes. Igdrasil supports integrations with Stripe, Shopify and Zettle, as well as bank connections and documents through email and WhatsApp. Fortnox has a dedicated sync that lets you use Igdrasil for selected workflows and make a system transition gradually.

### Is my accounting data secure with Igdrasil?

Data is stored within the EU and protected with encryption, backups, role-based access and audit trails. Igdrasil is working towards ISO 27001 certification and GDPR alignment and compliance.

### Can I export my data from Igdrasil?

Yes. You can export accounting data in SIE4 and raw formats, including supporting documents, free of charge and at any time.

## Ready to make bookkeeping more useful?

Igdrasil brings together the fundamentals of bookkeeping and makes the numbers easier to act on, with automation where it helps and control where it is needed.

**[Explore Igdrasil](/)**

## Sources

- [Swedish Bookkeeping Act (1999:1078)](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/bokforingslag-19991078_sfs-1999-1078/)
- [Swedish Tax Agency: bookkeeping using different VAT accounts](https://www4.skatteverket.se/rattsligvagledning/edition/2026.3/411726.html)
- [Swedish Tax Agency: information about SRU data](https://www.skatteverket.se/foretag/etjansterochblanketter/allaetjanster/tjanster/filoverforing/informationomsruuppgifter.4.3dfca4f410f4fc63c86800020896.html)
- [Swedish Accounting Standards Board: Bookkeeping guidance](https://www.bfn.se/wp-content/uploads/vl13-2-bokforing.pdf)

*This page provides general information about Igdrasil and Swedish accounting workflows. It is not individual accounting, tax or legal advice.*
