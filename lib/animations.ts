import { Variants, Transition } from "framer-motion";

// Page transitions
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const pageTransition: Transition = {
  duration: 0.3,
  ease: "easeInOut",
};

// Card hover effect
export const cardVariants: Variants = {
  rest: { scale: 1, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
  hover: {
    scale: 1.03,
    boxShadow: "0 10px 20px rgba(212,175,55,0.3)",
    transition: { duration: 0.2 },
  },
};

// Stagger children animation
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Button press animation
export const buttonVariants: Variants = {
  tap: { scale: 0.95 },
};

// Drawer slide animation
export const drawerVariants: Variants = {
  closed: { x: "100%" },
  open: {
    x: 0,
    transition: { type: "spring", damping: 20, stiffness: 300 },
  },
};

// Modal/Dialog animation
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

// Backdrop animation
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Toast notification animation
export const toastVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.3 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, type: "spring" },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: { duration: 0.2 },
  },
};

// Success checkmark animation
export const checkmarkVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

// Fade in up animation
export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};
