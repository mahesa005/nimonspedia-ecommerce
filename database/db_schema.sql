CREATE TYPE user_role AS ENUM ('BUYER', 'SELLER', 'ADMIN');

CREATE TYPE order_status AS ENUM (
    'waiting_approval',
    'approved',
    'rejected',
    'on_delivery',
    'received'
);

CREATE TABLE "user" (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    balance INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "store" (
    store_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    store_name VARCHAR(255) NOT NULL UNIQUE,
    store_description TEXT,
    store_logo_path VARCHAR(255),
    balance INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES "user"(user_id)
);

CREATE TABLE "product" (
    product_id SERIAL PRIMARY KEY,
    store_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    main_image_path VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP DEFAULT NULL,

    FOREIGN KEY (store_id) REFERENCES "store"(store_id)
);

-- Soft delete
ALTER TABLE product ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_product_name ON product(product_name);
CREATE INDEX IF NOT EXISTS idx_product_store ON product(store_id);
CREATE INDEX IF NOT EXISTS idx_product_deleted ON product(deleted_at);

CREATE TABLE "category" (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE "category_item" (
    category_id INT NOT NULL,
    product_id INT NOT NULL,

    PRIMARY KEY (category_id, product_id),
    FOREIGN KEY (category_id) REFERENCES "category"(category_id),
    FOREIGN KEY (product_id) REFERENCES "product"(product_id)
);

CREATE TABLE "cart_item" (
    cart_item_id SERIAL PRIMARY KEY,
    buyer_id INT NOT NULL, 
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    FOREIGN KEY (buyer_id) REFERENCES "user"(user_id),
    FOREIGN KEY (product_id) REFERENCES "product"(product_id)
);

CREATE TABLE "order" (
    order_id SERIAL PRIMARY KEY,
    buyer_id INT NOT NULL,
    store_id INT NOT NULL,
    total_price INT NOT NULL,
    shipping_address TEXT NOT NULL,
    status order_status NOT NULL DEFAULT 'waiting_approval',
    reject_reason TEXT,
    confirmed_at TIMESTAMP,
    delivery_time TIMESTAMP,
    received_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (buyer_id) REFERENCES "user"(user_id),
    FOREIGN KEY (store_id) REFERENCES "store"(store_id)
);

CREATE TABLE "order_items" (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_order INT NOT NULL, 
    subtotal INT NOT NULL,

    FOREIGN KEY (order_id) REFERENCES "order"(order_id),
    FOREIGN KEY (product_id) REFERENCES "product"(product_id)
);

INSERT INTO "category" (name) VALUES
('Rumah Tangga'),
('Buku'),
('Dapur'),
('Elektronik'),
('Mainan'),
('Fashion Anak & Bayi'),
('Fashion Pria'),
('Fashion Wanita'),
('Film dan Musik'),
('Gaming'),
('Handphone & Tablet'),
('Ibu & Bayi'),
('Kecantikan'),
('Kesehatan'),
('Mainan & Hobi'),
('Komputer & Laptop'),
('Office & Stationery'),
('Olahraga'),
('Otomotif'),
('Perawatan Tubuh'),
('Perawatan Hewan'),
('Lainnya');

-- MILESTONE 2 SCHEMA UPDATES
CREATE TABLE IF NOT EXISTS "auctions" (
    auction_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    starting_price INT NOT NULL,
    current_price INT NOT NULL,
    min_increment INT NOT NULL,
    quantity INT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(20) NOT NULL CHECK (status IN ('scheduled', 'active', 'ongoing', 'ended', 'cancelled')),
    winner_id INT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (product_id) REFERENCES "product"(product_id),
    FOREIGN KEY (winner_id) REFERENCES "user"(user_id)
);

CREATE TABLE IF NOT EXISTS "auction_bids" (
    bid_id SERIAL PRIMARY KEY,
    auction_id INT NOT NULL,
    bidder_id INT NOT NULL,
    bid_amount INT NOT NULL,
    bid_time TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (auction_id) REFERENCES "auctions"(auction_id),
    FOREIGN KEY (bidder_id) REFERENCES "user"(user_id)
);

CREATE TABLE IF NOT EXISTS "chat_room" (
    store_id INT NOT NULL,
    buyer_id INT NOT NULL,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (store_id, buyer_id),
    FOREIGN KEY (store_id) REFERENCES "store"(store_id),
    FOREIGN KEY (buyer_id) REFERENCES "user"(user_id)
);

CREATE TABLE IF NOT EXISTS "chat_messages" (
    message_id SERIAL PRIMARY KEY,
    store_id INT NOT NULL,
    buyer_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('text', 'image', 'item_preview')),
    content TEXT NOT NULL,
    product_id INT, -- Nullable
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (store_id, buyer_id) REFERENCES "chat_room"(store_id, buyer_id),
    FOREIGN KEY (sender_id) REFERENCES "user"(user_id),
    FOREIGN KEY (product_id) REFERENCES "product"(product_id)
);

CREATE TABLE IF NOT EXISTS "push_subscriptions" (
    subscription_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh_key VARCHAR(255) NOT NULL,
    auth_key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES "user"(user_id)
);

CREATE TABLE IF NOT EXISTS "user_feature_access" (
    access_id SERIAL PRIMARY KEY,
    user_id INT NULL, -- Null -> Global Flag
    feature_name VARCHAR(50) NOT NULL CHECK (feature_name IN ('checkout_enabled', 'chat_enabled', 'auction_enabled')),
    is_enabled BOOLEAN DEFAULT TRUE,
    reason TEXT,
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE SET NULL
);

ALTER TABLE "auctions"
ADD COLUMN cancel_reason TEXT,
ADD COLUMN cancelled_at TIMESTAMP;

ALTER TABLE "auctions"
ADD CONSTRAINT cancel_reason_required CHECK (
    status != 'cancelled' OR cancel_reason IS NOT NULL
);