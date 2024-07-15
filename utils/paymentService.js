const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const processPayment = async (amount, token) => {
  try {
    const charge = await stripe.charges.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency: "usd",
      source: token,
      description: "Salon appointment payment",
    });
    return charge;
  } catch (error) {
    throw new Error("Payment processing failed");
  }
};

module.exports = {
  processPayment,
};
