"use strict";exports.id=752,exports.ids=[752],exports.modules={9487:(e,t,r)=>{r.d(t,{Dy:()=>u,K0:()=>p,P4:()=>R,_9:()=>_,eN:()=>T});var a=r(85890),s=r.n(a),o=r(55315),d=r.n(o),n=r(92048),i=r.n(n);let E=d().join(process.cwd(),"data","knowledge_base.db"),c=d().dirname(E);i().existsSync(c)||i().mkdirSync(c,{recursive:!0});let l=new(s())(E);l.exec(`
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
`);let u={getAll:()=>l.prepare("SELECT * FROM knowledge_items ORDER BY updated_at DESC").all(),getById:e=>l.prepare("SELECT * FROM knowledge_items WHERE id = ?").get(e),create:e=>{let t=l.prepare(`
      INSERT INTO knowledge_items (title, content, category, tags, author)
      VALUES (?, ?, ?, ?, ?)
    `).run(e.title,e.content,e.category||null,e.tags||null,e.author||null);return u.getById(t.lastInsertRowid)},update:(e,t)=>{let r=u.getById(e);if(r)return l.prepare(`
      UPDATE knowledge_items
      SET title = ?, content = ?, category = ?, tags = ?, author = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(t.title??r.title,t.content??r.content,t.category??r.category,t.tags??r.tags,t.author??r.author,e),u.getById(e)},delete:e=>l.prepare("DELETE FROM knowledge_items WHERE id = ?").run(e).changes>0,search:e=>{let t=l.prepare(`
      SELECT * FROM knowledge_items
      WHERE title LIKE ? OR content LIKE ? OR tags LIKE ?
      ORDER BY updated_at DESC
    `),r=`%${e}%`;return t.all(r,r,r)},getByCategory:e=>l.prepare("SELECT * FROM knowledge_items WHERE category = ? ORDER BY updated_at DESC").all(e),getCategories:()=>l.prepare("SELECT DISTINCT category FROM knowledge_items WHERE category IS NOT NULL").all().map(e=>e.category).filter(Boolean)},T={getAll:()=>l.prepare("SELECT * FROM mcp_servers ORDER BY created_at DESC").all(),getById:e=>l.prepare("SELECT * FROM mcp_servers WHERE id = ?").get(e),create:e=>{let t=l.prepare(`
      INSERT INTO mcp_servers (name, description, server_type, config, status, enabled)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(e.name,e.description||null,e.server_type,e.config,e.status||"inactive",void 0!==e.enabled?e.enabled:1);return T.getById(t.lastInsertRowid)},update:(e,t)=>{let r=T.getById(e);if(r)return l.prepare(`
      UPDATE mcp_servers
      SET name = ?, description = ?, server_type = ?, config = ?, status = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(t.name??r.name,t.description??r.description,t.server_type??r.server_type,t.config??r.config,t.status??r.status,void 0!==t.enabled?t.enabled:r.enabled,e),T.getById(e)},delete:e=>l.prepare("DELETE FROM mcp_servers WHERE id = ?").run(e).changes>0,toggleEnabled:e=>{let t=T.getById(e);if(!t)return;let r=1===t.enabled?0:1;return T.update(e,{enabled:r})}},p={getAll:()=>l.prepare("SELECT * FROM products ORDER BY created_at DESC").all(),getById:e=>l.prepare("SELECT * FROM products WHERE id = ?").get(e),getByCategory:e=>l.prepare("SELECT * FROM products WHERE category = ? ORDER BY created_at DESC").all(e),create:e=>{let t=l.prepare(`
      INSERT INTO products (name, description, price, image_url, category, stock)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(e.name,e.description||null,e.price,e.image_url||null,e.category||null,e.stock||0);return p.getById(t.lastInsertRowid)},update:(e,t)=>{let r=p.getById(e);if(r)return l.prepare(`
      UPDATE products
      SET name = ?, description = ?, price = ?, image_url = ?, category = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(t.name??r.name,t.description??r.description,t.price??r.price,t.image_url??r.image_url,t.category??r.category,t.stock??r.stock,e),p.getById(e)},delete:e=>l.prepare("DELETE FROM products WHERE id = ?").run(e).changes>0,getCategories:()=>l.prepare("SELECT DISTINCT category FROM products WHERE category IS NOT NULL").all().map(e=>e.category).filter(Boolean)},R={getBySession:e=>l.prepare(`
      SELECT c.*, p.name, p.price, p.image_url, p.stock, p.description
      FROM cart_items c
      LEFT JOIN products p ON c.product_id = p.id
      WHERE c.session_id = ?
      ORDER BY c.created_at DESC
    `).all(e),add:e=>{let t=l.prepare("SELECT * FROM cart_items WHERE product_id = ? AND session_id = ?").get(e.product_id,e.session_id);if(t)return l.prepare("UPDATE cart_items SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(e.quantity,t.id),R.getById(t.id);{let t=l.prepare("INSERT INTO cart_items (product_id, quantity, session_id) VALUES (?, ?, ?)").run(e.product_id,e.quantity,e.session_id||null);return R.getById(t.lastInsertRowid)}},getById:e=>l.prepare("SELECT * FROM cart_items WHERE id = ?").get(e),update:(e,t)=>{if(t<=0){R.delete(e);return}return l.prepare("UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(t,e),R.getById(e)},delete:e=>l.prepare("DELETE FROM cart_items WHERE id = ?").run(e).changes>0,clear:e=>l.prepare("DELETE FROM cart_items WHERE session_id = ?").run(e).changes>0},_={getAll:()=>l.prepare("SELECT * FROM orders ORDER BY created_at DESC").all(),getById:e=>{let t=l.prepare("SELECT * FROM orders WHERE id = ?").get(e);if(!t)return;let r=l.prepare("SELECT * FROM order_items WHERE order_id = ?");return t.items=r.all(e),t},create:(e,t)=>{let r=l.prepare(`
      INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, total_amount, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(e.customer_name,e.customer_email,e.customer_phone||null,e.customer_address,e.total_amount,e.status||"pending").lastInsertRowid,a=l.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity)
      VALUES (?, ?, ?, ?, ?)
    `);for(let e of t)a.run(r,e.product_id,e.product_name,e.product_price,e.quantity);return _.getById(r)},updateStatus:(e,t)=>(l.prepare("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(t,e),_.getById(e))}},71615:(e,t,r)=>{var a=r(88757);r.o(a,"cookies")&&r.d(t,{cookies:function(){return a.cookies}})},33085:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"DraftMode",{enumerable:!0,get:function(){return o}});let a=r(45869),s=r(6278);class o{get isEnabled(){return this._provider.isEnabled}enable(){let e=a.staticGenerationAsyncStorage.getStore();return e&&(0,s.trackDynamicDataAccessed)(e,"draftMode().enable()"),this._provider.enable()}disable(){let e=a.staticGenerationAsyncStorage.getStore();return e&&(0,s.trackDynamicDataAccessed)(e,"draftMode().disable()"),this._provider.disable()}constructor(e){this._provider=e}}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},88757:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{cookies:function(){return u},draftMode:function(){return T},headers:function(){return l}});let a=r(68996),s=r(53047),o=r(92044),d=r(72934),n=r(33085),i=r(6278),E=r(45869),c=r(54580);function l(){let e="headers",t=E.staticGenerationAsyncStorage.getStore();if(t){if(t.forceStatic)return s.HeadersAdapter.seal(new Headers({}));(0,i.trackDynamicDataAccessed)(t,e)}return(0,c.getExpectedRequestStore)(e).headers}function u(){let e="cookies",t=E.staticGenerationAsyncStorage.getStore();if(t){if(t.forceStatic)return a.RequestCookiesAdapter.seal(new o.RequestCookies(new Headers({})));(0,i.trackDynamicDataAccessed)(t,e)}let r=(0,c.getExpectedRequestStore)(e),s=d.actionAsyncStorage.getStore();return(null==s?void 0:s.isAction)||(null==s?void 0:s.isAppRoute)?r.mutableCookies:r.cookies}function T(){let e=(0,c.getExpectedRequestStore)("draftMode");return new n.DraftMode(e.draftMode)}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},53047:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{HeadersAdapter:function(){return o},ReadonlyHeadersError:function(){return s}});let a=r(38238);class s extends Error{constructor(){super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers")}static callable(){throw new s}}class o extends Headers{constructor(e){super(),this.headers=new Proxy(e,{get(t,r,s){if("symbol"==typeof r)return a.ReflectAdapter.get(t,r,s);let o=r.toLowerCase(),d=Object.keys(e).find(e=>e.toLowerCase()===o);if(void 0!==d)return a.ReflectAdapter.get(t,d,s)},set(t,r,s,o){if("symbol"==typeof r)return a.ReflectAdapter.set(t,r,s,o);let d=r.toLowerCase(),n=Object.keys(e).find(e=>e.toLowerCase()===d);return a.ReflectAdapter.set(t,n??r,s,o)},has(t,r){if("symbol"==typeof r)return a.ReflectAdapter.has(t,r);let s=r.toLowerCase(),o=Object.keys(e).find(e=>e.toLowerCase()===s);return void 0!==o&&a.ReflectAdapter.has(t,o)},deleteProperty(t,r){if("symbol"==typeof r)return a.ReflectAdapter.deleteProperty(t,r);let s=r.toLowerCase(),o=Object.keys(e).find(e=>e.toLowerCase()===s);return void 0===o||a.ReflectAdapter.deleteProperty(t,o)}})}static seal(e){return new Proxy(e,{get(e,t,r){switch(t){case"append":case"delete":case"set":return s.callable;default:return a.ReflectAdapter.get(e,t,r)}}})}merge(e){return Array.isArray(e)?e.join(", "):e}static from(e){return e instanceof Headers?e:new o(e)}append(e,t){let r=this.headers[e];"string"==typeof r?this.headers[e]=[r,t]:Array.isArray(r)?r.push(t):this.headers[e]=t}delete(e){delete this.headers[e]}get(e){let t=this.headers[e];return void 0!==t?this.merge(t):null}has(e){return void 0!==this.headers[e]}set(e,t){this.headers[e]=t}forEach(e,t){for(let[r,a]of this.entries())e.call(t,a,r,this)}*entries(){for(let e of Object.keys(this.headers)){let t=e.toLowerCase(),r=this.get(t);yield[t,r]}}*keys(){for(let e of Object.keys(this.headers)){let t=e.toLowerCase();yield t}}*values(){for(let e of Object.keys(this.headers)){let t=this.get(e);yield t}}[Symbol.iterator](){return this.entries()}}},68996:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{MutableRequestCookiesAdapter:function(){return l},ReadonlyRequestCookiesError:function(){return d},RequestCookiesAdapter:function(){return n},appendMutableCookies:function(){return c},getModifiedCookieValues:function(){return E}});let a=r(92044),s=r(38238),o=r(45869);class d extends Error{constructor(){super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#cookiessetname-value-options")}static callable(){throw new d}}class n{static seal(e){return new Proxy(e,{get(e,t,r){switch(t){case"clear":case"delete":case"set":return d.callable;default:return s.ReflectAdapter.get(e,t,r)}}})}}let i=Symbol.for("next.mutated.cookies");function E(e){let t=e[i];return t&&Array.isArray(t)&&0!==t.length?t:[]}function c(e,t){let r=E(t);if(0===r.length)return!1;let s=new a.ResponseCookies(e),o=s.getAll();for(let e of r)s.set(e);for(let e of o)s.set(e);return!0}class l{static wrap(e,t){let r=new a.ResponseCookies(new Headers);for(let t of e.getAll())r.set(t);let d=[],n=new Set,E=()=>{let e=o.staticGenerationAsyncStorage.getStore();if(e&&(e.pathWasRevalidated=!0),d=r.getAll().filter(e=>n.has(e.name)),t){let e=[];for(let t of d){let r=new a.ResponseCookies(new Headers);r.set(t),e.push(r.toString())}t(e)}};return new Proxy(r,{get(e,t,r){switch(t){case i:return d;case"delete":return function(...t){n.add("string"==typeof t[0]?t[0]:t[0].name);try{e.delete(...t)}finally{E()}};case"set":return function(...t){n.add("string"==typeof t[0]?t[0]:t[0].name);try{return e.set(...t)}finally{E()}};default:return s.ReflectAdapter.get(e,t,r)}}})}}}};