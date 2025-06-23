-- Consultar todos los clientes
SELECT * FROM clientes;

-- Consultar todos los productos
SELECT * FROM productos;

-- Consultar todas las ventas (con nombre de producto y cliente)
SELECT v.id, p.nombre AS producto, v.cantidad, c.nombre AS cliente, v.total, v.fecha
FROM ventas v
LEFT JOIN productos p ON v.producto_id = p.id
LEFT JOIN clientes c ON v.cliente_id = c.id;

-- Consultar todos los gastos
SELECT * FROM gastos;
