const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  payment: {
    method: { type: String, required: true },
    status: { type: String, required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String },
    paymentDate: { type: Date },
    paymentDetails: { type: mongoose.Schema.Types.Mixed }
  },
  billingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  }
}, {
  timestamps: true
});

// Middleware pour générer le numéro de commande avant la sauvegarde
orderSchema.pre('validate', async function(next) {
  try {
    if (!this.orderNumber) {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      
      // Trouver la dernière commande du jour
      const lastOrder = await this.constructor.findOne({
        orderNumber: new RegExp(`^O${year}${month}${day}`)
      }).sort({ orderNumber: -1 });

      let sequence = '0001';
      if (lastOrder) {
        const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
        sequence = (lastSequence + 1).toString().padStart(4, '0');
      }

      this.orderNumber = `O${year}${month}${day}${sequence}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Order', orderSchema); 