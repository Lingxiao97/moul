"use strict";(()=>{var e={};e.id=898,e.ids=[898],e.modules={85890:e=>{e.exports=require("better-sqlite3")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},92048:e=>{e.exports=require("fs")},55315:e=>{e.exports=require("path")},70370:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>N,patchFetch:()=>l,requestAsyncStorage:()=>c,routeModule:()=>u,serverHooks:()=>_,staticGenerationAsyncStorage:()=>R});var E={};r.r(E),r.d(E,{DELETE:()=>p,GET:()=>o,PUT:()=>n});var a=r(49303),s=r(88716),d=r(60670),T=r(87070),i=r(9487);async function o(e,{params:t}){try{let e=i.K0.getById(parseInt(t.id));if(!e)return T.NextResponse.json({error:"商品不存在"},{status:404});return T.NextResponse.json(e)}catch(e){return T.NextResponse.json({error:"获取商品失败"},{status:500})}}async function n(e,{params:t}){try{let r=await e.json(),E=i.K0.update(parseInt(t.id),r);if(!E)return T.NextResponse.json({error:"商品不存在"},{status:404});return T.NextResponse.json(E)}catch(e){return T.NextResponse.json({error:"更新商品失败"},{status:500})}}async function p(e,{params:t}){try{if(!i.K0.delete(parseInt(t.id)))return T.NextResponse.json({error:"商品不存在"},{status:404});return T.NextResponse.json({success:!0})}catch(e){return T.NextResponse.json({error:"删除商品失败"},{status:500})}}let u=new a.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/products/[id]/route",pathname:"/api/products/[id]",filename:"route",bundlePath:"app/api/products/[id]/route"},resolvedPagePath:"/Users/duanlingxiao/test/app/api/products/[id]/route.ts",nextConfigOutput:"",userland:E}),{requestAsyncStorage:c,staticGenerationAsyncStorage:R,serverHooks:_}=u,N="/api/products/[id]/route";function l(){return(0,d.patchFetch)({serverHooks:_,staticGenerationAsyncStorage:R})}},9487:(e,t,r)=>{r.d(t,{Dy:()=>u,K0:()=>R,P4:()=>_,_9:()=>N,eN:()=>c});var E=r(85890),a=r.n(E),s=r(55315),d=r.n(s),T=r(92048),i=r.n(T);let o=d().join(process.cwd(),"data","knowledge_base.db"),n=d().dirname(o);i().existsSync(n)||i().mkdirSync(n,{recursive:!0});let p=new(a())(o);p.exec(`
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
`);let u={getAll:()=>p.prepare("SELECT * FROM knowledge_items ORDER BY updated_at DESC").all(),getById:e=>p.prepare("SELECT * FROM knowledge_items WHERE id = ?").get(e),create:e=>{let t=p.prepare(`
      INSERT INTO knowledge_items (title, content, category, tags, author)
      VALUES (?, ?, ?, ?, ?)
    `).run(e.title,e.content,e.category||null,e.tags||null,e.author||null);return u.getById(t.lastInsertRowid)},update:(e,t)=>{let r=u.getById(e);if(r)return p.prepare(`
      UPDATE knowledge_items
      SET title = ?, content = ?, category = ?, tags = ?, author = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(t.title??r.title,t.content??r.content,t.category??r.category,t.tags??r.tags,t.author??r.author,e),u.getById(e)},delete:e=>p.prepare("DELETE FROM knowledge_items WHERE id = ?").run(e).changes>0,search:e=>{let t=p.prepare(`
      SELECT * FROM knowledge_items
      WHERE title LIKE ? OR content LIKE ? OR tags LIKE ?
      ORDER BY updated_at DESC
    `),r=`%${e}%`;return t.all(r,r,r)},getByCategory:e=>p.prepare("SELECT * FROM knowledge_items WHERE category = ? ORDER BY updated_at DESC").all(e),getCategories:()=>p.prepare("SELECT DISTINCT category FROM knowledge_items WHERE category IS NOT NULL").all().map(e=>e.category).filter(Boolean)},c={getAll:()=>p.prepare("SELECT * FROM mcp_servers ORDER BY created_at DESC").all(),getById:e=>p.prepare("SELECT * FROM mcp_servers WHERE id = ?").get(e),create:e=>{let t=p.prepare(`
      INSERT INTO mcp_servers (name, description, server_type, config, status, enabled)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(e.name,e.description||null,e.server_type,e.config,e.status||"inactive",void 0!==e.enabled?e.enabled:1);return c.getById(t.lastInsertRowid)},update:(e,t)=>{let r=c.getById(e);if(r)return p.prepare(`
      UPDATE mcp_servers
      SET name = ?, description = ?, server_type = ?, config = ?, status = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(t.name??r.name,t.description??r.description,t.server_type??r.server_type,t.config??r.config,t.status??r.status,void 0!==t.enabled?t.enabled:r.enabled,e),c.getById(e)},delete:e=>p.prepare("DELETE FROM mcp_servers WHERE id = ?").run(e).changes>0,toggleEnabled:e=>{let t=c.getById(e);if(!t)return;let r=1===t.enabled?0:1;return c.update(e,{enabled:r})}},R={getAll:()=>p.prepare("SELECT * FROM products ORDER BY created_at DESC").all(),getById:e=>p.prepare("SELECT * FROM products WHERE id = ?").get(e),getByCategory:e=>p.prepare("SELECT * FROM products WHERE category = ? ORDER BY created_at DESC").all(e),create:e=>{let t=p.prepare(`
      INSERT INTO products (name, description, price, image_url, category, stock)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(e.name,e.description||null,e.price,e.image_url||null,e.category||null,e.stock||0);return R.getById(t.lastInsertRowid)},update:(e,t)=>{let r=R.getById(e);if(r)return p.prepare(`
      UPDATE products
      SET name = ?, description = ?, price = ?, image_url = ?, category = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(t.name??r.name,t.description??r.description,t.price??r.price,t.image_url??r.image_url,t.category??r.category,t.stock??r.stock,e),R.getById(e)},delete:e=>p.prepare("DELETE FROM products WHERE id = ?").run(e).changes>0,getCategories:()=>p.prepare("SELECT DISTINCT category FROM products WHERE category IS NOT NULL").all().map(e=>e.category).filter(Boolean)},_={getBySession:e=>p.prepare(`
      SELECT c.*, p.name, p.price, p.image_url, p.stock, p.description
      FROM cart_items c
      LEFT JOIN products p ON c.product_id = p.id
      WHERE c.session_id = ?
      ORDER BY c.created_at DESC
    `).all(e),add:e=>{let t=p.prepare("SELECT * FROM cart_items WHERE product_id = ? AND session_id = ?").get(e.product_id,e.session_id);if(t)return p.prepare("UPDATE cart_items SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(e.quantity,t.id),_.getById(t.id);{let t=p.prepare("INSERT INTO cart_items (product_id, quantity, session_id) VALUES (?, ?, ?)").run(e.product_id,e.quantity,e.session_id||null);return _.getById(t.lastInsertRowid)}},getById:e=>p.prepare("SELECT * FROM cart_items WHERE id = ?").get(e),update:(e,t)=>{if(t<=0){_.delete(e);return}return p.prepare("UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(t,e),_.getById(e)},delete:e=>p.prepare("DELETE FROM cart_items WHERE id = ?").run(e).changes>0,clear:e=>p.prepare("DELETE FROM cart_items WHERE session_id = ?").run(e).changes>0},N={getAll:()=>p.prepare("SELECT * FROM orders ORDER BY created_at DESC").all(),getById:e=>{let t=p.prepare("SELECT * FROM orders WHERE id = ?").get(e);if(!t)return;let r=p.prepare("SELECT * FROM order_items WHERE order_id = ?");return t.items=r.all(e),t},create:(e,t)=>{let r=p.prepare(`
      INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, total_amount, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(e.customer_name,e.customer_email,e.customer_phone||null,e.customer_address,e.total_amount,e.status||"pending").lastInsertRowid,E=p.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity)
      VALUES (?, ?, ?, ?, ?)
    `);for(let e of t)E.run(r,e.product_id,e.product_name,e.product_price,e.quantity);return N.getById(r)},updateStatus:(e,t)=>(p.prepare("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(t,e),N.getById(e))}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),E=t.X(0,[276,972],()=>r(70370));module.exports=E})();