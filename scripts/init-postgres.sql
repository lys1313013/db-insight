CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.id IS '用户ID';
COMMENT ON COLUMN users.username IS '用户名';
COMMENT ON COLUMN users.email IS '邮箱';
COMMENT ON COLUMN users.created_at IS '创建时间';

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE orders IS '订单表';
COMMENT ON COLUMN orders.id IS '订单ID';
COMMENT ON COLUMN orders.user_id IS '用户ID';
COMMENT ON COLUMN orders.amount IS '订单金额';
COMMENT ON COLUMN orders.status IS '订单状态';
COMMENT ON COLUMN orders.created_at IS '创建时间';

CREATE INDEX idx_orders_user_id ON orders(user_id);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE products IS '产品表';
COMMENT ON COLUMN products.id IS '产品ID';
COMMENT ON COLUMN products.name IS '产品名称';
COMMENT ON COLUMN products.price IS '价格';
COMMENT ON COLUMN products.stock IS '库存';
COMMENT ON COLUMN products.created_at IS '创建时间';

INSERT INTO users (username, email) VALUES
('alice', 'alice@example.com'),
('bob', 'bob@example.com'),
('charlie', 'charlie@example.com');

INSERT INTO products (name, price, stock) VALUES
('iPhone 15', 7999.00, 100),
('MacBook Pro', 14999.00, 50),
('AirPods Pro', 1899.00, 200);

INSERT INTO orders (user_id, amount, status) VALUES
(1, 7999.00, 'completed'),
(2, 1899.00, 'pending'),
(1, 14999.00, 'shipped');
