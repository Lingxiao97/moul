import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'knowledge_base.db');
const dbDir = path.dirname(dbPath);

// 确保数据目录存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// 初始化数据库表
db.exec(`
  CREATE TABLE IF NOT EXISTS knowledge_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT,
    author TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS mcp_servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    server_type TEXT NOT NULL,
    config TEXT NOT NULL,
    status TEXT DEFAULT 'inactive',
    enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_category ON knowledge_items(category);
  CREATE INDEX IF NOT EXISTS idx_created_at ON knowledge_items(created_at);
  CREATE INDEX IF NOT EXISTS idx_mcp_status ON mcp_servers(status);
  CREATE INDEX IF NOT EXISTS idx_mcp_enabled ON mcp_servers(enabled);

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    category TEXT,
    stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    session_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    product_price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  CREATE INDEX IF NOT EXISTS idx_cart_session ON cart_items(session_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
`);

export interface KnowledgeItem {
  id?: number;
  title: string;
  content: string;
  category?: string;
  tags?: string;
  author?: string;
  created_at?: string;
  updated_at?: string;
}

export const knowledgeDB = {
  // 获取所有知识条目
  getAll: (): KnowledgeItem[] => {
    const stmt = db.prepare('SELECT * FROM knowledge_items ORDER BY updated_at DESC');
    return stmt.all() as KnowledgeItem[];
  },

  // 根据ID获取知识条目
  getById: (id: number): KnowledgeItem | undefined => {
    const stmt = db.prepare('SELECT * FROM knowledge_items WHERE id = ?');
    return stmt.get(id) as KnowledgeItem | undefined;
  },

  // 创建知识条目
  create: (item: Omit<KnowledgeItem, 'id' | 'created_at' | 'updated_at'>): KnowledgeItem => {
    const stmt = db.prepare(`
      INSERT INTO knowledge_items (title, content, category, tags, author)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      item.title,
      item.content,
      item.category || null,
      item.tags || null,
      item.author || null
    );
    return knowledgeDB.getById(result.lastInsertRowid as number)!;
  },

  // 更新知识条目
  update: (id: number, item: Partial<Omit<KnowledgeItem, 'id' | 'created_at'>>): KnowledgeItem | undefined => {
    const existing = knowledgeDB.getById(id);
    if (!existing) return undefined;

    const stmt = db.prepare(`
      UPDATE knowledge_items
      SET title = ?, content = ?, category = ?, tags = ?, author = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      item.title ?? existing.title,
      item.content ?? existing.content,
      item.category ?? existing.category,
      item.tags ?? existing.tags,
      item.author ?? existing.author,
      id
    );
    return knowledgeDB.getById(id);
  },

  // 删除知识条目
  delete: (id: number): boolean => {
    const stmt = db.prepare('DELETE FROM knowledge_items WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  // 搜索知识条目
  search: (keyword: string): KnowledgeItem[] => {
    const stmt = db.prepare(`
      SELECT * FROM knowledge_items
      WHERE title LIKE ? OR content LIKE ? OR tags LIKE ?
      ORDER BY updated_at DESC
    `);
    const searchTerm = `%${keyword}%`;
    return stmt.all(searchTerm, searchTerm, searchTerm) as KnowledgeItem[];
  },

  // 根据分类获取
  getByCategory: (category: string): KnowledgeItem[] => {
    const stmt = db.prepare('SELECT * FROM knowledge_items WHERE category = ? ORDER BY updated_at DESC');
    return stmt.all(category) as KnowledgeItem[];
  },

  // 获取所有分类
  getCategories: (): string[] => {
    const stmt = db.prepare('SELECT DISTINCT category FROM knowledge_items WHERE category IS NOT NULL');
    const rows = stmt.all() as { category: string }[];
    return rows.map(row => row.category).filter(Boolean);
  },
};

export interface MCPServer {
  id?: number;
  name: string;
  description?: string;
  server_type: string;
  config: string; // JSON string
  status?: string;
  enabled?: number;
  created_at?: string;
  updated_at?: string;
}

export const mcpDB = {
  // 获取所有MCP服务器
  getAll: (): MCPServer[] => {
    const stmt = db.prepare('SELECT * FROM mcp_servers ORDER BY created_at DESC');
    return stmt.all() as MCPServer[];
  },

  // 根据ID获取MCP服务器
  getById: (id: number): MCPServer | undefined => {
    const stmt = db.prepare('SELECT * FROM mcp_servers WHERE id = ?');
    return stmt.get(id) as MCPServer | undefined;
  },

  // 创建MCP服务器
  create: (server: Omit<MCPServer, 'id' | 'created_at' | 'updated_at'>): MCPServer => {
    const stmt = db.prepare(`
      INSERT INTO mcp_servers (name, description, server_type, config, status, enabled)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      server.name,
      server.description || null,
      server.server_type,
      server.config,
      server.status || 'inactive',
      server.enabled !== undefined ? server.enabled : 1
    );
    return mcpDB.getById(result.lastInsertRowid as number)!;
  },

  // 更新MCP服务器
  update: (id: number, server: Partial<Omit<MCPServer, 'id' | 'created_at'>>): MCPServer | undefined => {
    const existing = mcpDB.getById(id);
    if (!existing) return undefined;

    const stmt = db.prepare(`
      UPDATE mcp_servers
      SET name = ?, description = ?, server_type = ?, config = ?, status = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      server.name ?? existing.name,
      server.description ?? existing.description,
      server.server_type ?? existing.server_type,
      server.config ?? existing.config,
      server.status ?? existing.status,
      server.enabled !== undefined ? server.enabled : existing.enabled,
      id
    );
    return mcpDB.getById(id);
  },

  // 删除MCP服务器
  delete: (id: number): boolean => {
    const stmt = db.prepare('DELETE FROM mcp_servers WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  // 切换启用状态
  toggleEnabled: (id: number): MCPServer | undefined => {
    const existing = mcpDB.getById(id);
    if (!existing) return undefined;
    const newEnabled = existing.enabled === 1 ? 0 : 1;
    return mcpDB.update(id, { enabled: newEnabled });
  },
};

// 商品相关接口和数据库操作
export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  stock?: number;
  created_at?: string;
  updated_at?: string;
}

export const productDB = {
  getAll: (): Product[] => {
    const stmt = db.prepare('SELECT * FROM products ORDER BY created_at DESC');
    return stmt.all() as Product[];
  },

  getById: (id: number): Product | undefined => {
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    return stmt.get(id) as Product | undefined;
  },

  getByCategory: (category: string): Product[] => {
    const stmt = db.prepare('SELECT * FROM products WHERE category = ? ORDER BY created_at DESC');
    return stmt.all(category) as Product[];
  },

  create: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product => {
    const stmt = db.prepare(`
      INSERT INTO products (name, description, price, image_url, category, stock)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      product.name,
      product.description || null,
      product.price,
      product.image_url || null,
      product.category || null,
      product.stock || 0
    );
    return productDB.getById(result.lastInsertRowid as number)!;
  },

  update: (id: number, product: Partial<Omit<Product, 'id' | 'created_at'>>): Product | undefined => {
    const existing = productDB.getById(id);
    if (!existing) return undefined;

    const stmt = db.prepare(`
      UPDATE products
      SET name = ?, description = ?, price = ?, image_url = ?, category = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      product.name ?? existing.name,
      product.description ?? existing.description,
      product.price ?? existing.price,
      product.image_url ?? existing.image_url,
      product.category ?? existing.category,
      product.stock ?? existing.stock,
      id
    );
    return productDB.getById(id);
  },

  delete: (id: number): boolean => {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  getCategories: (): string[] => {
    const stmt = db.prepare('SELECT DISTINCT category FROM products WHERE category IS NOT NULL');
    const rows = stmt.all() as { category: string }[];
    return rows.map(row => row.category).filter(Boolean);
  },
};

// 购物车相关接口和数据库操作
export interface CartItem {
  id?: number;
  product_id: number;
  quantity: number;
  session_id?: string;
  created_at?: string;
  updated_at?: string;
  product?: Product;
}

export const cartDB = {
  getBySession: (sessionId: string): CartItem[] => {
    const stmt = db.prepare(`
      SELECT c.*, p.name, p.price, p.image_url, p.stock, p.description
      FROM cart_items c
      LEFT JOIN products p ON c.product_id = p.id
      WHERE c.session_id = ?
      ORDER BY c.created_at DESC
    `);
    return stmt.all(sessionId) as any[];
  },

  add: (item: Omit<CartItem, 'id' | 'created_at' | 'updated_at'>): CartItem => {
    // 检查是否已存在
    const existing = db.prepare('SELECT * FROM cart_items WHERE product_id = ? AND session_id = ?').get(item.product_id, item.session_id) as CartItem | undefined;
    
    if (existing) {
      // 更新数量
      const stmt = db.prepare('UPDATE cart_items SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      stmt.run(item.quantity, existing.id);
      return cartDB.getById(existing.id!)!;
    } else {
      // 新增
      const stmt = db.prepare('INSERT INTO cart_items (product_id, quantity, session_id) VALUES (?, ?, ?)');
      const result = stmt.run(item.product_id, item.quantity, item.session_id || null);
      return cartDB.getById(result.lastInsertRowid as number)!;
    }
  },

  getById: (id: number): CartItem | undefined => {
    const stmt = db.prepare('SELECT * FROM cart_items WHERE id = ?');
    return stmt.get(id) as CartItem | undefined;
  },

  update: (id: number, quantity: number): CartItem | undefined => {
    if (quantity <= 0) {
      cartDB.delete(id);
      return undefined;
    }
    const stmt = db.prepare('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(quantity, id);
    return cartDB.getById(id);
  },

  delete: (id: number): boolean => {
    const stmt = db.prepare('DELETE FROM cart_items WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  clear: (sessionId: string): boolean => {
    const stmt = db.prepare('DELETE FROM cart_items WHERE session_id = ?');
    const result = stmt.run(sessionId);
    return result.changes > 0;
  },
};

// 订单相关接口和数据库操作
export interface Order {
  id?: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address: string;
  total_amount: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id?: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
}

export const orderDB = {
  getAll: (): Order[] => {
    const stmt = db.prepare('SELECT * FROM orders ORDER BY created_at DESC');
    return stmt.all() as Order[];
  },

  getById: (id: number): Order | undefined => {
    const orderStmt = db.prepare('SELECT * FROM orders WHERE id = ?');
    const order = orderStmt.get(id) as Order | undefined;
    if (!order) return undefined;

    const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    order.items = itemsStmt.all(id) as OrderItem[];
    return order;
  },

  create: (order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'items'>, items: Omit<OrderItem, 'id' | 'order_id'>[]): Order => {
    const orderStmt = db.prepare(`
      INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, total_amount, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = orderStmt.run(
      order.customer_name,
      order.customer_email,
      order.customer_phone || null,
      order.customer_address,
      order.total_amount,
      order.status || 'pending'
    );
    const orderId = result.lastInsertRowid as number;

    // 插入订单项
    const itemStmt = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const item of items) {
      itemStmt.run(orderId, item.product_id, item.product_name, item.product_price, item.quantity);
    }

    return orderDB.getById(orderId)!;
  },

  updateStatus: (id: number, status: string): Order | undefined => {
    const stmt = db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(status, id);
    return orderDB.getById(id);
  },
};

export default db;
