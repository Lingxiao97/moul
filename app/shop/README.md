# 购物网站使用说明

## 功能特性

- ✅ 商品列表展示（支持分类筛选和搜索）
- ✅ 商品详情页面
- ✅ 购物车管理（添加、删除、更新数量）
- ✅ 订单结算
- ✅ 订单详情查看
- ✅ 响应式设计，支持移动端

## 页面结构

- `/shop` - 商品列表页面
- `/shop/products/[id]` - 商品详情页面
- `/shop/cart` - 购物车页面
- `/shop/checkout` - 结账页面
- `/shop/orders/[id]` - 订单详情页面

## 初始化示例数据

访问以下 API 端点来初始化示例商品数据：

```bash
POST /api/products/init
```

或者使用 curl：

```bash
curl -X POST http://localhost:3000/api/products/init
```

## API 端点

### 商品相关
- `GET /api/products` - 获取所有商品（支持 `?category=分类名` 筛选）
- `GET /api/products/[id]` - 获取商品详情
- `POST /api/products` - 创建商品
- `PUT /api/products/[id]` - 更新商品
- `DELETE /api/products/[id]` - 删除商品

### 购物车相关
- `GET /api/cart` - 获取购物车
- `POST /api/cart` - 添加商品到购物车
- `PUT /api/cart/[id]` - 更新购物车商品数量
- `DELETE /api/cart/[id]` - 删除购物车商品
- `DELETE /api/cart?item_id=xxx` - 删除指定商品
- `DELETE /api/cart` - 清空购物车

### 订单相关
- `GET /api/orders` - 获取所有订单
- `GET /api/orders/[id]` - 获取订单详情
- `POST /api/orders` - 创建订单
- `PUT /api/orders/[id]` - 更新订单状态

## 数据库表结构

### products（商品表）
- id: 主键
- name: 商品名称
- description: 商品描述
- price: 价格
- image_url: 图片URL
- category: 分类
- stock: 库存
- created_at: 创建时间
- updated_at: 更新时间

### cart_items（购物车表）
- id: 主键
- product_id: 商品ID
- quantity: 数量
- session_id: 会话ID
- created_at: 创建时间
- updated_at: 更新时间

### orders（订单表）
- id: 主键
- customer_name: 客户姓名
- customer_email: 客户邮箱
- customer_phone: 客户电话
- customer_address: 客户地址
- total_amount: 总金额
- status: 订单状态（pending/processing/completed/cancelled）
- created_at: 创建时间
- updated_at: 更新时间

### order_items（订单项表）
- id: 主键
- order_id: 订单ID
- product_id: 商品ID
- product_name: 商品名称
- product_price: 商品价格
- quantity: 数量

## 使用流程

1. 访问 `/shop` 浏览商品
2. 点击商品查看详情
3. 添加到购物车
4. 在购物车中管理商品
5. 点击"去结算"填写收货信息
6. 提交订单
7. 查看订单详情

## 注意事项

- 购物车使用 session_id（存储在 cookie 中）来区分不同用户
- 订单提交后会自动清空购物车
- 商品库存会在前端显示，但后端暂未实现库存扣减逻辑（可根据需要添加）
