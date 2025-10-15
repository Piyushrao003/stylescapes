// frontend/src/components/Orders/OrderAnimationFactory.js
// This file is adapted to function as a utility called by OrdersPage.js.

import "../../styles/OrderAnimation.css"; // Requested CSS Import

/**
 * Order Tracking Animation Module (DOM Manipulation Class)
 * Handles truck animation, progress indicators, and visual effects
 * NOTE: This class logic relies on the DOM being mounted by React first.
 */
class OrderTrackingAnimation {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    if (!this.container) {
      console.error(`Container element not provided.`);
      return;
    } // Initialize elements

    this.truckContainer = this.container.querySelector(".truck-container");
    this.progressDots = this.container.querySelector(".progress-dots");
    this.speedLines = this.container.querySelector(".speed-lines");
    this.exhaustSmoke = this.container.querySelector(".exhaust-smoke");
    this.dustTrail = this.container.querySelector(".dust-trail"); // Options

    this.options = {
      autoStart: options.autoStart || false,
      initialStatus: options.initialStatus || "placed",
      onStatusChange: options.onStatusChange || null,
      animationDuration: options.animationDuration || 2500,
      ...options,
    }; // Status mapping configuration (UNCHANGED)

    this.statusMapping = {
      placed: { position: "placed", index: 0, label: "Order Placed" },
      packed: { position: "packed", index: 1, label: "Order Packed" },
      shipped: { position: "shipped", index: 2, label: "Shipped" },
      "out-for-delivery": {
        position: "out-for-delivery",
        index: 3,
        label: "Out for Delivery",
      },
      delivered: { position: "delivered", index: 4, label: "Delivered" },
    };

    this.currentStatus = null;
    this.isAnimating = false; // Initialize

    this.init();
  }

  init() {
    if (this.options.autoStart) {
      setTimeout(() => {
        this.animateTo(this.options.initialStatus);
      }, 500);
    }
  }
  /**
   * Main animation function - animates truck to specified status
   * @param {string} status - Target status
   */

  animateTo(status) {
    const mapping = this.statusMapping[status];
    if (!mapping) {
      console.error(`Invalid status: ${status}`);
      return;
    }

    if (this.isAnimating) {
      console.warn("Animation already in progress");
      return;
    }

    this.isAnimating = true;
    this.currentStatus = status; // Callback for status change

    if (this.options.onStatusChange) {
      this.options.onStatusChange(status, mapping.label);
    } // Start animation sequence (UNCHANGED)

    this.resetTruck();
    this.startMovement(mapping);
    this.updateProgressDots(mapping.index);
    this.applyEffects(status); // Complete animation (UNCHANGED)

    setTimeout(() => {
      this.completeAnimation(status);
    }, this.options.animationDuration);
  }
  /**
   * Reset truck to prepare for new animation (UNCHANGED)
   */

  resetTruck() {
    this.truckContainer.className = "truck-container";
  }
  /**
   * Start truck movement animation (UNCHANGED)
   */

  startMovement(mapping) {
    // Add moving animation
    this.truckContainer.classList.add("moving"); // Set target position after brief delay for smooth transition

    setTimeout(() => {
      this.truckContainer.classList.add(mapping.position);
    }, 100);
  }
  /**
   * Update progress indicator dots (UNCHANGED)
   */

  updateProgressDots(activeIndex) {
    if (!this.progressDots) return;

    const dots = this.progressDots.querySelectorAll(".progress-dot");
    dots.forEach((dot, index) => {
      dot.className = "progress-dot";
      if (index < activeIndex) {
        dot.classList.add("completed");
      } else if (index === activeIndex) {
        dot.classList.add("active");
      }
    });
  }
  /**
   * Apply visual effects based on status (UNCHANGED)
   */

  applyEffects(status) {
    // Reset all effects first
    this.hideAllEffects();

    setTimeout(() => {
      switch (status) {
        case "placed":
        case "packed": // Minimal effects - only smoke
          this.showEffect(this.exhaustSmoke);
          break;

        case "shipped":
        case "out-for-delivery": // Full movement effects
          this.showEffect(this.speedLines);
          this.showEffect(this.exhaustSmoke);
          this.showEffect(this.dustTrail); // Extra speed for out-for-delivery

          if (status === "out-for-delivery") {
            this.truckContainer.style.animationDuration = "0.3s";
          }
          break;

        case "delivered": // No movement effects
          this.hideAllEffects();
          break;
      }
    }, 500);
  }
  /**
   * Complete animation and add finishing effects (UNCHANGED)
   */

  completeAnimation(status) {
    // Remove moving animation
    if (status !== "delivered") {
      this.truckContainer.classList.remove("moving");
    } // Add celebration effect for delivered status

    if (status === "delivered") {
      setTimeout(() => {
        this.truckContainer.classList.add("delivered-celebration");
        this.hideAllEffects();
      }, 500);
    }

    this.isAnimating = false;
  }
  /**
   * Hide all visual effects (UNCHANGED)
   */

  hideAllEffects() {
    this.hideEffect(this.speedLines);
    this.hideEffect(this.exhaustSmoke);
    this.hideEffect(this.dustTrail);
  }
  /**
   * Show a specific effect element (UNCHANGED)
   */

  showEffect(element) {
    if (element) {
      element.style.display = "block";
    }
  }
  /**
   * Hide a specific effect element (UNCHANGED)
   */

  hideEffect(element) {
    if (element) {
      element.style.display = "none";
    }
  }
  /**
   * Get current status (UNCHANGED)
   */

  getCurrentStatus() {
    return this.currentStatus;
  }
  /**
   * Check if animation is in progress (UNCHANGED)
   */

  isInProgress() {
    return this.isAnimating;
  }
  /**
   * Reset animation to initial state (UNCHANGED)
   */

  reset() {
    this.resetTruck();
    this.hideAllEffects();
    this.updateProgressDots(-1);
    this.currentStatus = null;
    this.isAnimating = false;
  }
  /**
   * Animate through all statuses sequentially (UNCHANGED)
   */

  playSequence(delayBetween = 3000) {
    const statuses = Object.keys(this.statusMapping);
    let currentIndex = 0;

    const playNext = () => {
      if (currentIndex < statuses.length) {
        this.animateTo(statuses[currentIndex]);
        currentIndex++;
        setTimeout(playNext, delayBetween);
      }
    };

    playNext();
  }
}

/**
 * Factory function to create animation instance linked to a DOM element.
 * This is the function OrdersPage.js should call via useRef/useEffect.
 * @param {HTMLElement} containerElement - The DOM container element (ref.current)
 * @param {object} options - Configuration options
 * @returns {OrderTrackingAnimation} Animation instance
 */
function createOrderAnimation(containerElement, options = {}) {
  return new OrderTrackingAnimation(containerElement, options);
}

// Export for module use
export { OrderTrackingAnimation, createOrderAnimation };
