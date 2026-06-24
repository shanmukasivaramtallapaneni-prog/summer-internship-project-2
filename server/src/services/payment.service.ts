export interface PaymentResult {
  success: boolean;
  paymentId: string;
}

export async function processPayment(
  amount: number,
  userId: string
): Promise<PaymentResult> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (amount <= 0) {
    return { success: false, paymentId: "" };
  }

  const paymentId = `mock_pay_${userId.slice(0, 8)}_${Date.now()}`;

  return {
    success: true,
    paymentId,
  };
}
