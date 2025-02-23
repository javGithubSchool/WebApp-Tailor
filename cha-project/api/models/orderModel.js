const db = require('./dbconnection');

const orders = {
    // Get all orders
    getAll: (type, callback) => {
        var query = `
            SELECT 
                o.order_id AS id,
                SUM(op.qty) AS qty,
                o.status,
                o.date as date,
                FORMAT(o.subtotal, 2) AS subtotal,
                org.name AS "placed by",
                COUNT(m.name) AS measurementNo
            FROM 
                \`orders\` o
            JOIN 
                \`organization\` org ON o.org_id = org.org_id
            LEFT JOIN
				\`measurements\` m ON m.order_id = o.order_id
            JOIN 
				\`order_products\` op ON op.order_id = o.order_id
        `;
        if (type) {
            query += ` WHERE org.type = ?`
        }

        query += " GROUP BY o.order_id ORDER BY o.order_id DESC"

        db.query(query, type ? [type] : [], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });

    },

    getLatestOrder: (type, callback) => {
        var query = `
            SELECT 
                o.order_id,
                SUM(op.qty) AS qty,
                o.status,
                o.date,
                FORMAT(o.subtotal,2) AS subtotal,
                org.name AS "placed by",
                COUNT(m.name) AS measurementNo
            FROM 
                \`orders\` o
            JOIN 
                \`organization\` org ON o.org_id = org.org_id
            LEFT JOIN
				\`measurements\` m ON m.order_id = o.order_id
            JOIN 
				\`order_products\` op ON op.order_id = o.order_id
            WHERE 
                o.status != "Ready"`
        if (type) {
            query += `AND org.type = ?`
        }

        query += `GROUP BY o.order_id
                ORDER BY
                o.order_id DESC
                LIMIT 5;`

        db.query(query, type ? [type] : [], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    getReadyOrder: (type, limit, callback) => {
        var query = `SELECT
            o.order_id,
            SUM(op.qty) AS qty,
            o.status,
            o.date,
            FORMAT(o.subtotal, 2) AS subtotal,
            org.name AS "placed by",
            COUNT(m.name) AS measurementNo
            FROM
                \`orders\` o
            JOIN 
                \`organization\` org ON o.org_id = org.org_id
            LEFT JOIN
				\`measurements\` m ON m.order_id = o.order_id
            JOIN 
				\`order_products\` op ON op.order_id = o.order_id
            WHERE o.status = "Ready"`
        if (type) {
            query += ` AND org.type = ?`
        }
        query += `GROUP BY o.order_id
                ORDER BY
                o.order_id DESC`
        if (limit)
            query += " LIMIT ?"

        const params = [];
        if (type) params.push(type);
        if (limit) params.push(parseInt(limit));
        db.query(query, params, (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    getMeasurements: (id, callback) => {
        const query = `SELECT measurement, p.name as product_name, m.name as employee_name, p.product_id, address, qty
                        FROM measurements m INNER JOIN products p ON m.product_id = p.product_id WHERE order_id = ?`
        db.query(query, [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results); // Assuming orders_ID is unique, we return the first (and only) result
        });
    },

    // Get a single orders by ID
    getById: (id, callback) => {
        const query = 'SELECT * FROM `orders` WHERE orders_id = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results[0]); // Assuming orders_ID is unique, we return the first (and only) result
        });
    },

    create: (newOrder, callback) => {
        const { org_id, subtotal, status, date, orderData } = newOrder;

        // Start by inserting into the `orders` table
        const insertOrderQuery = `
            INSERT INTO orders (org_id, subtotal, status, date)
            VALUES (?, ?, ?, ?)
        `;

        db.query(insertOrderQuery, [org_id, subtotal, status, date], (err, orderResult) => {
            if (err) {
                return callback(err, null);
            }

            const orderId = orderResult.insertId; // Get the newly created `order_id`

            // Now, insert products into `order_products`
            const insertOrderProductsQuery = `
                INSERT INTO order_products (product_id, order_id, qty)
                VALUES ?
            `;

            // Prepare data for bulk insertion
            const orderProductsData = orderData.map(orderData => [
                orderId, // order_id
                orderData.id, // product_id
                orderData.quantity // qty
            ]);

            db.query(insertOrderProductsQuery, [orderProductsData], (err, orderProductsResult) => {
                if (err) {
                    return callback(err, null);
                }

                callback(null, { orderId, message: "Order created successfully" });
            });
        });
    },





    cancelOrder: (id, callback) => {
        console.log(id)
        const query = 'UPDATE `orders` SET status = "Cancelled" WHERE order_id = ?'
        db.query(query, [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    // Update an existing orders
    update: (id, updatedOrders, callback) => {
        const query = 'UPDATE `orders` SET org_id = ?, date = ?, quantity = ?, type = ?, subtotal = ?, measurementNo = ?, status = ? WHERE order_id = ?';
        const { org_id, date, quantity, type, subtotal, measurementNo, status } = updatedOrders;

        db.query(query, [org_id, date, quantity, type, subtotal, measurementNo, status, id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results.affectedRows); // Return number of affected rows
        });
    },

    // Delete an orders
    delete: (id, callback) => {
        const query = 'DELETE FROM `orders` WHERE order_id = ?';
        db.query(query, [id], (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results.affectedRows); // Return number of affected rows
        });
    },

    // Get total Revenue
    sumSubtotal: (callback) => {
        const query = 'SELECT SUM(subtotal) AS grandTotal FROM `orders`'; // Assuming Price is the column name
        db.query(query, (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results[0].grandTotal);
        });
    }
};

module.exports = orders;
