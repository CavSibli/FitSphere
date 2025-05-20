const mongoose = require('mongoose');

const guestOrderSchema = new mongoose.Schema({
  guestInfo: {
    name: String,
    email: String,
    phone: String
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  shippingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  billingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  status: {
    type: String,
    default: 'pending'
  },
  payment: {
    method: String,
    status: {
      type: String,
      default: 'pending'
    },
    amount: Number,
    transactionId: String,
    paymentDate: Date,
    paymentDetails: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  orderNumber: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Générer un numéro de commande unique avant la sauvegarde
guestOrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Trouver le dernier numéro de commande du jour
    const lastOrder = await this.constructor.findOne({
      orderNumber: new RegExp(`^G${year}${month}${day}`)
    }).sort({ orderNumber: -1 });

    let sequence = '0001';
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = (lastSequence + 1).toString().padStart(4, '0');
    }

    this.orderNumber = `G${year}${month}${day}${sequence}`;
  }
  next();
});

module.exports = mongoose.model('GuestOrder', guestOrderSchema); 