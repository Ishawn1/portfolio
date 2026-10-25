/**
 * ISHAWN MEHTA — PORTFOLIO APPLICATION LOGIC
 * Architecture: Clean, zero-dependency ES6 module.
 * Hardened against focus loss, missing attributes, injection, and email client failure.
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // Accessible Modal Manager (Native <dialog> + Stored ActiveElement)
  // --------------------------------------------------------------------------
  let lastFocusedElement = null;

  function initModals() {
    const dialogs = document.querySelectorAll('dialog.case-dialog');
    const triggers = document.querySelectorAll('[data-open-dialog]');

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const dialogId = trigger.getAttribute('data-open-dialog');
        const dialog = document.getElementById(dialogId);
        if (!dialog) return;

        lastFocusedElement = document.activeElement || null;
        dialog.showModal();

        // Focus first interactive element or close button
        const focusable = dialog.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable) {
          focusable.focus();
        }
      });
    });

    dialogs.forEach((dialog) => {
      // Handle close buttons inside dialog
      const closeButtons = dialog.querySelectorAll('.dialog-close, [data-close-dialog]');
      closeButtons.forEach((btn) => {
        btn.addEventListener('click', () => dialog.close());
      });

      // Close when clicking outside on backdrop
      dialog.addEventListener('click', (event) => {
        const rect = dialog.getBoundingClientRect();
        const isInDialog =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;

        if (!isInDialog) {
          dialog.close();
        }
      });

      // Restore focus on close (whether via ESC or explicit button)
      dialog.addEventListener('close', () => {
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
          lastFocusedElement.focus();
        }
        lastFocusedElement = null;
      });
    });
  }

  // --------------------------------------------------------------------------
  // Deterministic Filter System (DOM-Preserving & Screen-Reader Accessible)
  // --------------------------------------------------------------------------
  function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const liveRegion = document.getElementById('filter-status');

    if (!filterButtons.length || !projectCards.length) {
      console.warn('[filters] No .filter-btn or .project-card found');
      return;
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selectedCategory = (btn.getAttribute('data-filter') || 'all').toLowerCase().trim();

        // Update button states
        filterButtons.forEach((b) => {
          const isActive = b === btn;
          b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          b.classList.toggle('active', isActive);
        });

        // Filter cards using both .is-hidden class and HTML5 hidden attribute
        let visibleCount = 0;
        projectCards.forEach((card) => {
          const rawCategories = card.getAttribute('data-category') || '';
          const cardCategories = rawCategories.toLowerCase().trim().split(/\s+/);
          const isMatch = selectedCategory === 'all' || cardCategories.includes(selectedCategory);

          card.hidden = !isMatch;
          card.classList.toggle('is-hidden', !isMatch);
          if (isMatch) visibleCount++;
        });

        // Announce count to assistive technology
        if (liveRegion) {
          liveRegion.textContent = '';
          requestAnimationFrame(() => {
            liveRegion.textContent = `Showing ${visibleCount} ${
              visibleCount === 1 ? 'project' : 'projects'
            }`;
          });
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // Interactive Edge AI Quantization & Latency Benchmark Studio
  // --------------------------------------------------------------------------
  const benchmarkMatrix = {
    'smartkheti-yolo': {
      name: 'YOLO26n Vision (SmartKheti Crop Diagnosis)',
      target: 'Mobile NPU / GPU Delegate',
      fp32: {
        size: '14.8 MB',
        latency: '64 ms',
        bandwidth: '100% baseline',
        accuracy: '94.2% mAP',
        throughput: '15.6 FPS',
        note: 'Full FP32 weights on Snapdragon 8 Gen 2 CPU. High thermal load; unsuited for continuous on-device crop video scanning.'
      },
      fp16: {
        size: '7.4 MB',
        latency: '28 ms',
        bandwidth: '-50% memory',
        accuracy: '94.0% mAP',
        throughput: '35.7 FPS',
        note: 'Half-precision FP16 running on Adreno GPU delegate. Smooth live camera viewfinder with zero visible frame drops.'
      },
      int8: {
        size: '3.7 MB',
        latency: '14 ms',
        bandwidth: '-75% memory',
        accuracy: '93.6% mAP',
        throughput: '71.4 FPS',
        note: 'INT8 Post-Training Quantization (PTQ) mapped to Hexagon NPU. Sub-15ms inference enables 60 FPS real-time detection with minimal battery drain.'
      }
    },
    'esp32-mlp': {
      name: '3-Layer Neural Net (ESP32-S3 Microcontroller)',
      target: 'Xtensa LX7 Dual-Core @ 240MHz (C++ Native)',
      fp32: {
        size: '48.2 KB',
        latency: '0.12 ms',
        bandwidth: '100% baseline',
        accuracy: '99.1% test',
        throughput: '8,300 inf/s',
        note: 'Standard 32-bit floating point C++ matrix multiplications. Exceeds internal SRAM allocation if scaled up.'
      },
      int8: {
        size: '12.1 KB',
        latency: '0.02 ms',
        bandwidth: '-74.9% memory',
        accuracy: '98.9% test',
        throughput: '50,000 inf/s',
        note: 'SIMD-accelerated INT8 arithmetic directly inside ESP32-S3 SRAM. Predicts water stress & disease risk in ~20 microseconds with zero cloud latency.'
      }
    }
  };

  let currentModelKey = 'smartkheti-yolo';
  let currentPrecision = 'int8';

  function updateBenchmarkUI() {
    const modelData = benchmarkMatrix[currentModelKey];
    if (!modelData) return;

    // Check if the current precision exists for this model (e.g. esp32-mlp might not have fp16)
    let precisionData = modelData[currentPrecision];
    if (!precisionData) {
      currentPrecision = 'int8';
      precisionData = modelData[currentPrecision];
      // update precision button state
      document.querySelectorAll('[data-bench-precision]').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-bench-precision') === currentPrecision);
      });
    }

    // Toggle FP16 button visibility/disabled state if not supported
    const fp16Btn = document.querySelector('[data-bench-precision="fp16"]');
    if (fp16Btn) {
      const isSupported = Boolean(modelData.fp16);
      fp16Btn.disabled = !isSupported;
      fp16Btn.style.opacity = isSupported ? '1' : '0.4';
      fp16Btn.title = isSupported ? '' : 'FP16 not applicable for microcontroller architecture';
    }

    // Safely update DOM text
    const sizeEl = document.getElementById('bench-size');
    const latencyEl = document.getElementById('bench-latency');
    const bandwidthEl = document.getElementById('bench-bandwidth');
    const accuracyEl = document.getElementById('bench-accuracy');
    const fpsEl = document.getElementById('bench-fps');
    const targetEl = document.getElementById('bench-target');
    const noteEl = document.getElementById('bench-note');

    if (sizeEl) sizeEl.textContent = precisionData.size;
    if (latencyEl) latencyEl.textContent = precisionData.latency;
    if (bandwidthEl) bandwidthEl.textContent = precisionData.bandwidth;
    if (accuracyEl) accuracyEl.textContent = precisionData.accuracy;
    if (fpsEl) fpsEl.textContent = precisionData.throughput;
    if (targetEl) targetEl.textContent = modelData.target;
    if (noteEl) noteEl.textContent = precisionData.note;
  }

  function initBenchmarkStudio() {
    const modelButtons = document.querySelectorAll('[data-bench-model]');
    const precisionButtons = document.querySelectorAll('[data-bench-precision]');

    modelButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        modelButtons.forEach((b) => b.classList.toggle('active', b === btn));
        currentModelKey = btn.getAttribute('data-bench-model') || 'smartkheti-yolo';
        updateBenchmarkUI();
      });
    });

    precisionButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        precisionButtons.forEach((b) => b.classList.toggle('active', b === btn));
        currentPrecision = btn.getAttribute('data-bench-precision') || 'int8';
        updateBenchmarkUI();
      });
    });

    updateBenchmarkUI();
  }

  // --------------------------------------------------------------------------
  // Email Copy & Contact Form Safety
  // --------------------------------------------------------------------------
  function initContactUtilities() {
    const copyBtn = document.getElementById('btn-copy-email');
    const copyToast = document.getElementById('copy-toast');
    const emailToCopy = 'ishawn23@protonmail.com';

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(emailToCopy);
          } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = emailToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
          }
          if (copyToast) {
            copyToast.classList.add('visible');
            setTimeout(() => copyToast.classList.remove('visible'), 2800);
          }
        } catch (err) {
          console.warn('Clipboard copy failed:', err);
        }
      });
    }

    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Honeypot anti-bot validation
        const honeypot = contactForm.querySelector('input[name="_verification_code"]');
        if (honeypot && honeypot.value.trim() !== '') {
          // Silent drop for automated bots
          return;
        }

        // 2. Client-side input validation
        const nameInput = document.getElementById('sender-name');
        const emailInput = document.getElementById('sender-email');
        const messageInput = document.getElementById('sender-message');

        const nameVal = nameInput ? nameInput.value.trim().replace(/[\r\n]/g, ' ') : '';
        const emailVal = emailInput ? emailInput.value.trim() : '';
        const messageVal = messageInput ? messageInput.value.trim() : '';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailVal || !emailRegex.test(emailVal) || emailVal.length > 254) {
          if (formStatus) {
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Please provide a valid email address.';
          }
          if (emailInput) emailInput.focus();
          return;
        }

        if (!messageVal) {
          if (formStatus) {
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Please enter a message or inquiry details.';
          }
          if (messageInput) messageInput.focus();
          return;
        }

        // 3. Construct safe mailto URI
        const cleanName = nameVal || 'Engineering Collaborator';
        const subject = encodeURIComponent(`Portfolio Inquiry from ${cleanName}`);
        const body = encodeURIComponent(
          `Hi Ishawn,\n\n${messageVal}\n\n---\nSender: ${cleanName}\nEmail: ${emailVal}`
        );
        const mailtoUrl = `mailto:${emailToCopy}?subject=${subject}&body=${body}`;

        // 4. Update UI with explicit user confirmation and fallback button
        if (formStatus) {
          formStatus.className = 'form-status success';
          formStatus.innerHTML = `
            <strong>Inquiry prepared.</strong> If your email client does not launch automatically, 
            <a href="${mailtoUrl}" style="text-decoration: underline; color: inherit; font-weight: 600;">click here to launch</a> 
            or email directly at <code>${emailToCopy}</code>.
          `;
        }

        // Attempt launch
        window.location.href = mailtoUrl;
      });
    }
  }

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initModals();
    initProjectFilters();
    initBenchmarkStudio();
    initContactUtilities();
  });
})();
