const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.userId })
      .populate('productId', 'name description price image stock')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        cart: cartItems,
        count: cartItems.length
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const quantityToAdd = quantity || 1;

    if (product.stock < quantityToAdd) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    let cartItem = await Cart.findOne({
      userId: req.userId,
      productId
    });

    if (cartItem) {
      cartItem.quantity += quantityToAdd;
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        userId: req.userId,
        productId,
        quantity: quantityToAdd
      });
    }

    const populatedCartItem = await Cart.findById(cartItem._id)
      .populate('productId', 'name description price image stock');

    res.status(201).json({
      success: true,
      message: 'Product added to cart',
      data: {
        cartItem: populatedCartItem
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to cart',
      error: error.message
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cartItem = await Cart.findOne({
      _id: id,
      userId: req.userId
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const product = await Product.findById(cartItem.productId);
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    const populatedCartItem = await Cart.findById(cartItem._id)
      .populate('productId', 'name description price image stock');

    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: {
        cartItem: populatedCartItem
      }
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart item',
      error: error.message
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await Cart.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from cart',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
};
