import { adminDb } from "@/lib/firebase-admin";
import type { CouponDoc } from "@/lib/types";

type CouponResult =
  | { valid: true; coupon: CouponDoc; discount: number; finalAmount: number }
  | { valid: false; message: string };

/**
 * Looks up a coupon by code and checks it's active, unexpired, and under
 * its usage limit. Returns the discounted final amount for `price`.
 */
export async function validateCoupon(code: string, price: number): Promise<CouponResult> {
  const normalized = code.trim().toUpperCase();
  const snap = await adminDb().collection("coupons").where("code", "==", normalized).limit(1).get();

  if (snap.empty) {
    return { valid: false, message: "This coupon code is not valid." };
  }

  const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() } as CouponDoc;

  if (!coupon.active) {
    return { valid: false, message: "This coupon is not active yet." };
  }
  if (coupon.expiresAt && coupon.expiresAt.toDate().getTime() < Date.now()) {
    return { valid: false, message: "This coupon has expired." };
  }
  if (coupon.maxUses && (coupon.usedCount ?? 0) >= coupon.maxUses) {
    return { valid: false, message: "This coupon has reached its usage limit." };
  }

  const discount = coupon.type === "percent" ? Math.round((price * coupon.value) / 100) : coupon.value;
  const finalAmount = Math.max(0, Math.round(price - discount));

  return { valid: true, coupon, discount, finalAmount };
}
