const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      data: {
        orders,
        count: orders.length
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.userId })
      .populate('productId', 'name price stock');

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const orderProducts = [];
    let totalPrice = 0;

    for (const item of cartItems) {
      const product = item.productId;

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in cart'
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      orderProducts.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });

      totalPrice += product.price * item.quantity;

      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    const order = await Order.create({
      userId: req.userId,
      products: orderProducts,
      totalPrice,
      status: 'pending'
    });

    await Cart.deleteMany({ userId: req.userId });

    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order: populatedOrder
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

module.exports = {
  getOrders,
  createOrder
};
