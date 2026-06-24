# Database Model

The MVP will use PostgreSQL with Drizzle ORM. Database work must use controlled
migrations and must not run migrations automatically on every service start
without a documented strategy.

Initial entities are defined in the feature data model, including users,
producer profiles, products, offers, orders, payments, enrollments, webhook
events, domain events, and job logs.
