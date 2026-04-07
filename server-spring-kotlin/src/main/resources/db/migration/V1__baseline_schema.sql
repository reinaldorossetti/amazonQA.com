CREATE TABLE IF NOT EXISTS products (
    id           SERIAL        PRIMARY KEY,
    name         TEXT          NOT NULL,
    price        NUMERIC(10,2) NOT NULL,
    description  TEXT,
    category     TEXT,
    image        TEXT,
    manufacturer TEXT,
    line         TEXT,
    model        TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id                       SERIAL       PRIMARY KEY,
    person_type              TEXT         NOT NULL DEFAULT 'PF',
    first_name               TEXT         NOT NULL,
    last_name                TEXT         NOT NULL,
    email                    TEXT         NOT NULL UNIQUE,
    phone                    TEXT,
    password                 TEXT         NOT NULL,
    cpf                      TEXT         UNIQUE,
    cnpj                     TEXT         UNIQUE,
    company_name             TEXT,
    address_zip              TEXT,
    address_street           TEXT,
    address_number           TEXT,
    address_complement       TEXT,
    address_neighborhood     TEXT,
    address_city             TEXT,
    address_state            TEXT,
    residence_proof_filename TEXT,
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ,
    is_active                BOOLEAN      NOT NULL DEFAULT TRUE,
    account_closed_at        TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS user_roles (
    id         SERIAL       PRIMARY KEY,
    user_id    INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       TEXT         NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id         SERIAL      PRIMARY KEY,
    user_id    INT         NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    product_id INT         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INT         NOT NULL DEFAULT 1,
    added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id               SERIAL        PRIMARY KEY,
    order_number     TEXT          UNIQUE,
    user_id          INT           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status           TEXT          NOT NULL DEFAULT 'created',
    subtotal         NUMERIC(10,2) NOT NULL,
    shipping_total   NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_total   NUMERIC(10,2) NOT NULL DEFAULT 0,
    grand_total      NUMERIC(10,2) NOT NULL,
    currency         TEXT          NOT NULL DEFAULT 'BRL',
    payment_method   TEXT,
    idempotency_key  TEXT,
    shipping_address JSONB,
    billing_info     JSONB,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    cancelled_at     TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_orders_user_idempotency
    ON orders(user_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS order_items (
    id                    SERIAL        PRIMARY KEY,
    order_id              INT           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id            INT           NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name_snapshot TEXT          NOT NULL,
    unit_price_snapshot   NUMERIC(10,2) NOT NULL,
    quantity              INT           NOT NULL,
    line_total            NUMERIC(10,2) NOT NULL,
    created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id                 SERIAL        PRIMARY KEY,
    order_id           INT           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id            INT           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    method             TEXT          NOT NULL,
    amount             NUMERIC(10,2) NOT NULL,
    status             TEXT          NOT NULL,
    card_brand         TEXT,
    provider_reference TEXT,
    metadata           JSONB,
    created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
