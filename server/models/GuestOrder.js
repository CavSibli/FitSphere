const mongoose = require('mongoose');

const guestOrderSchema = new mongoose.Schema({
  guestInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
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
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  },
  billingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment: {
    method: {
      type: String,
      required: true,
      enum: ['credit_card', 'paypal']
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed', 'refunded']
    },
    amount: {
      type: Number,
      required: true
    },
    transactionId: {
      type: String
    },
    paymentDate: {
      type: Date
    },
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