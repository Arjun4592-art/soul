import type { Timestamp } from "firebase/firestore";

export type Role = "admin" | "coach" | "student";

export type UserDoc = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  status: "active" | "blocked";
  coursesEnrolled?: number;
  createdAt?: Timestamp;
};

export type CategoryDoc = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  courseCount?: number;
  createdAt?: Timestamp;
};

export type CourseStatus = "draft" | "published" | "archived";

export type CourseDoc = {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  compareAtPrice?: number;
  status: CourseStatus;
  thumbnailUrl?: string;
  description?: string;
  moduleCount?: number;
  lessonCount?: number;
  enrollCount?: number;
  createdAt?: Timestamp;
};

export type EnrollmentDoc = {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  progress: number; // 0-100
  status: "active" | "completed" | "expired";
  enrolledAt?: Timestamp;
};

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderDoc = {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  couponCode?: string;
  createdAt?: Timestamp;
};

export type CouponDoc = {
  id: string;
  code: string;
  type: "percent" | "flat";
  value: number;
  maxUses?: number;
  usedCount?: number;
  expiresAt?: Timestamp;
  active: boolean;
  createdAt?: Timestamp;
};

export type TestimonialDoc = {
  id: string;
  name: string;
  role?: string;
  quote: string;
  avatarUrl?: string;
  rating?: number;
  featured?: boolean;
  createdAt?: Timestamp;
};

export type ContactMessageDoc = {
  id: string;
  name: string;
  email: string;
  interest?: string;
  message?: string;
  status?: "new" | "read" | "archived";
  createdAt?: Timestamp;
};

export type NewsletterSubscriberDoc = {
  id: string;
  email: string;
  source?: string;
  createdAt?: Timestamp;
};

export type PostStatus = "draft" | "published";

export type PostDoc = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverUrl?: string;
  status: PostStatus;
  author?: string;
  createdAt?: Timestamp;
};

export type LiveClassDoc = {
  id: string;
  title: string;
  courseId?: string;
  courseTitle?: string;
  zoomLink?: string; // Zoom meeting link, pasted in by staff
  zoomPasscode?: string;
  scheduledAt?: Timestamp;
  durationMinutes?: number;
  status: "scheduled" | "live" | "completed" | "cancelled";
};

// ---- Course content (modules / lessons) ----

export type ModuleDoc = {
  id: string;
  courseId: string;
  title: string;
  order: number;
  createdAt?: Timestamp;
};

export type LessonType = "video" | "text" | "quiz";

export type LessonResource = { name: string; url: string };

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

export type LessonDoc = {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  type: LessonType;
  order: number;
  videoUrl?: string;
  content?: string;
  durationMinutes?: number;
  resources?: LessonResource[];
  quiz?: QuizQuestion[];
  createdAt?: Timestamp;
};

// One doc per (user, lesson) — tracks completion for the course player.
export type LessonProgressDoc = {
  id: string; // `${userId}_${lessonId}`
  userId: string;
  courseId: string;
  lessonId: string;
  moduleId: string;
  completed: boolean;
  completedAt?: Timestamp;
};

// Student's personal notes against a lesson.
export type NoteDoc = {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  lessonTitle?: string;
  content: string;
  updatedAt?: Timestamp;
};

export type CertificateDoc = {
  id: string;
  userId: string;
  userName?: string;
  courseId: string;
  courseTitle: string;
  issuedAt?: Timestamp;
  certificateUrl?: string;
};

// ---- Call bookings ----
// A visitor asks for a call on /book (status "requested"). Staff then picks
// the final date/time and pastes a Zoom meeting link from Admin → Bookings,
// which flips it to "scheduled" and emails the guest. No third-party
// scheduler is involved.

export type BookingStatus = "requested" | "scheduled" | "completed" | "cancelled";

export type BookingTopic = "heal" | "lead" | "coach" | "unsure";

export type BookingDoc = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  topic: BookingTopic;
  message?: string;
  preferredTime?: string; // free text from the guest, e.g. "Weekday evenings"
  timezone?: string; // guest's IANA timezone, used when emailing the time
  status: BookingStatus;
  startTime?: Timestamp;
  durationMinutes?: number;
  zoomLink?: string;
  zoomPasscode?: string;
  adminNote?: string;
  cancelReason?: string;
  source?: "website" | "admin";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

// ---- Community forum ----

export type ForumThreadDoc = {
  id: string;
  title: string;
  body: string;
  category: string;
  authorId: string;
  authorName: string;
  pinned?: boolean;
  createdAt?: Timestamp;
};

export type ForumReplyDoc = {
  id: string;
  threadId: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt?: Timestamp;
};
