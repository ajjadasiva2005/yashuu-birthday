/**
 * Yashuu Romantic Floating Photo-Hearts System
 * Continuous dynamic photo-stream atmospheric layer for Yashuu's birthday celebration
 */

(function() {
  'use strict';

  // =========================================================================
  // 1. Photo Manifest & Shuffled Pool Management
  // Exact 22 photos located in /yashu/
  // =========================================================================
  const YASHU_PHOTOS = [
    "yashu/sfuge.jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 10.57.40 PM.jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 10.57.42 PM.jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 10.57.44 .jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 10.57.44 PM...jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 10.57.45 PMdfuh.jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 10.57.45 PMdigfeigv.jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 10.57.46 PMegf.jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 10.57.46 PMiug.jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 10.57.46 PMyeg.jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 10.57.47 PM3ed.jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 10.57.47 PMegwf.jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 10.57.48 PMeuwgvw.jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 10.57.48 PMiowhnvco.jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 10.57.49 PMwfehs.jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 10.57.50 PMfcgb.jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 10.57.51 PMiegi.jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 11.01.48 PM (1).jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 11.01.48 PM.jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 11.02.51 PM (1).jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 11.02.51 PM (2).jpeg",
    "yashu/WhatsApp Image 2026-09-03 at 11.02.51 PM.jpeg"
  ];

  let photoPool = [];
  let lastPhoto = null;
  let activeHeartsCount = 0;
  let yashuHeartsStarted = false;
  let spawnTimeoutId = null;

  // Track sides to ensure organic 50/50 balance without rigid alternating
  let consecutiveLeft = 0;
  let consecutiveRight = 0;

  /**
   * Fisher-Yates shuffle with consecutive cycle duplicate avoidance
   */
  function refreshPhotoPool() {
    photoPool = YASHU_PHOTOS.slice();
    for (let i = photoPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = photoPool[i];
      photoPool[i] = photoPool[j];
      photoPool[j] = temp;
    }
    // Prevent immediate repeat if the new top item matches the last photo from the previous cycle
    if (photoPool.length > 1 && photoPool[photoPool.length - 1] === lastPhoto) {
      const swapIdx = Math.floor(Math.random() * (photoPool.length - 1));
      const temp = photoPool[photoPool.length - 1];
      photoPool[photoPool.length - 1] = photoPool[swapIdx];
      photoPool[swapIdx] = temp;
    }
  }

  function getNextPhoto() {
    if (photoPool.length === 0) {
      refreshPhotoPool();
    }
    const photo = photoPool.pop();
    lastPhoto = photo;
    return photo;
  }

  // =========================================================================
  // 2. Device Responsive Configuration
  // Desktop: Target 8-12 active (Cap: 12), Spawn: 500-800ms, Initial Burst: 6-7
  // Tablet:  Target 6-9 active (Cap: 9),  Spawn: 650-950ms, Initial Burst: 4-5
  // Mobile:  Target 4-6 active (Cap: 6),  Spawn: 900-1300ms, Initial Burst: 3-4
  // =========================================================================
  function getDeviceConfig() {
    const width = window.innerWidth || document.documentElement.clientWidth || 1024;
    if (width < 768) {
      return {
        type: 'mobile',
        maxActiveHearts: 6,
        initialBurstCount: 4,
        minSpawnDelay: 900,
        maxSpawnDelay: 1300,
        leftZoneMin: 0.02,
        leftZoneMax: 0.16,
        rightZoneMin: 0.84,
        rightZoneMax: 0.98,
        sizeScale: 0.70
      };
    } else if (width < 1024) {
      return {
        type: 'tablet',
        maxActiveHearts: 9,
        initialBurstCount: 5,
        minSpawnDelay: 650,
        maxSpawnDelay: 950,
        leftZoneMin: 0.02,
        leftZoneMax: 0.20,
        rightZoneMin: 0.80,
        rightZoneMax: 0.98,
        sizeScale: 0.86
      };
    } else {
      return {
        type: 'desktop',
        maxActiveHearts: 12,
        initialBurstCount: 7,
        minSpawnDelay: 500,
        maxSpawnDelay: 800,
        leftZoneMin: 0.02,
        leftZoneMax: 0.22,
        rightZoneMin: 0.78,
        rightZoneMax: 0.98,
        sizeScale: 1.0
      };
    }
  }

  // =========================================================================
  // 3. Size Category Selection & 3D Depth Attributes
  // Target categories:
  // - 10% VERY SMALL: 35-55px
  // - 25% SMALL:      55-80px
  // - 35% MEDIUM:     80-110px
  // - 20% LARGE:      110-150px
  // - 10% VERY LARGE: 150-200px
  // =========================================================================
  function pickSizeCategory(scale) {
    const rand = Math.random();
    let baseMin, baseMax, categoryClass, depthTier, durationRange, baseOpacity, zIndex;

    if (rand < 0.10) {
      // Very Small
      baseMin = 35; baseMax = 55;
      categoryClass = 'yashu-size-vsmall';
      depthTier = 'vsmall';
      durationRange = [6.5, 8.5]; // nimble
      baseOpacity = 0.76;
      zIndex = 1;
    } else if (rand < 0.35) {
      // Small
      baseMin = 55; baseMax = 80;
      categoryClass = 'yashu-size-small';
      depthTier = 'small';
      durationRange = [7.2, 9.2];
      baseOpacity = 0.82;
      zIndex = 2;
    } else if (rand < 0.70) {
      // Medium
      baseMin = 80; baseMax = 110;
      categoryClass = 'yashu-size-medium';
      depthTier = 'medium';
      durationRange = [8.2, 10.5];
      baseOpacity = 0.88;
      zIndex = 3;
    } else if (rand < 0.90) {
      // Large
      baseMin = 110; baseMax = 150;
      categoryClass = 'yashu-size-large';
      depthTier = 'large';
      durationRange = [9.5, 11.8];
      baseOpacity = 0.93;
      zIndex = 4;
    } else {
      // Very Large
      baseMin = 150; baseMax = 195;
      categoryClass = 'yashu-size-vlarge';
      depthTier = 'vlarge';
      durationRange = [10.5, 13.0]; // stately, majestic float
      baseOpacity = 0.96;
      zIndex = 5;
    }

    const finalPx = Math.round((baseMin + Math.random() * (baseMax - baseMin)) * scale);
    const duration = (durationRange[0] + Math.random() * (durationRange[1] - durationRange[0])).toFixed(2);
    const opacity = (baseOpacity + (Math.random() * 0.05 - 0.025)).toFixed(2);

    return {
      px: finalPx,
      categoryClass,
      depthTier,
      duration: parseFloat(duration),
      opacity: parseFloat(opacity),
      zIndex
    };
  }

  // =========================================================================
  // 4. Side Origin & Organic Balance
  // =========================================================================
  function pickSpawnSide() {
    let side;
    if (consecutiveLeft >= 2) {
      side = 'right';
    } else if (consecutiveRight >= 2) {
      side = 'left';
    } else {
      side = Math.random() < 0.5 ? 'left' : 'right';
    }

    if (side === 'left') {
      consecutiveLeft++;
      consecutiveRight = 0;
    } else {
      consecutiveRight++;
      consecutiveLeft = 0;
    }
    return side;
  }

  // =========================================================================
  // 5. Dynamic Trajectories & Safe Peripheral Zones
  // Preserves center birthday content (cake, messages, candle, buttons)
  // Variants for LEFT:
  //   0: left -> right with slight upward drift
  //   1: left -> right with slight downward drift
  //   2: left -> upper-right
  //   3: left -> mostly horizontal
  //   4: left -> gentle diagonal
  // Variants for RIGHT:
  //   0: right -> left with slight upward drift
  //   1: right -> left with slight downward drift
  //   2: right -> upper-left
  //   3: right -> mostly horizontal
  //   4: right -> gentle diagonal
  // =========================================================================
  function calculateTrajectory(side, config) {
    const vw = window.innerWidth || document.documentElement.clientWidth || 1024;
    const vh = window.innerHeight || document.documentElement.clientHeight || 768;

    let startX, startY, midX, midY, endX, endY;
    const variant = Math.floor(Math.random() * 5);

    if (side === 'left') {
      const minX = config.leftZoneMin * vw;
      const maxX = config.leftZoneMax * vw;
      startX = minX + Math.random() * (maxX - minX);

      switch (variant) {
        case 0:
          // 1. left -> right with slight upward drift
          startY = vh * (0.60 + Math.random() * 0.25);
          midX = startX + (0.03 * vw + Math.random() * 0.03 * vw);
          midY = startY - vh * 0.18;
          endX = startX + (0.06 * vw + Math.random() * 0.04 * vw);
          endY = startY - vh * 0.38;
          break;

        case 1:
          // 2. left -> right with slight downward drift
          startY = vh * (0.15 + Math.random() * 0.20);
          midX = startX + (0.03 * vw + Math.random() * 0.03 * vw);
          midY = startY + vh * 0.14;
          endX = startX + (0.06 * vw + Math.random() * 0.03 * vw);
          endY = startY + vh * 0.28;
          break;

        case 2:
          // 3. left -> upper-right
          startY = vh * (0.88 + Math.random() * 0.15);
          midX = startX + (0.04 * vw + Math.random() * 0.04 * vw);
          midY = vh * (0.42 + Math.random() * 0.15);
          endX = startX + (0.07 * vw + Math.random() * 0.05 * vw);
          endY = -120 - Math.random() * 30;
          break;

        case 3:
          // 4. left -> mostly horizontal
          startY = vh * (0.25 + Math.random() * 0.45);
          midX = startX + (0.04 * vw + Math.random() * 0.03 * vw);
          midY = startY + (Math.random() * 30 - 15);
          endX = startX + (0.08 * vw + Math.random() * 0.04 * vw);
          endY = startY + (Math.random() * 40 - 20);
          break;

        default:
          // 5. left -> gentle diagonal (floats from bottom up with subtle flank wave)
          startY = vh * (1.02 + Math.random() * 0.05);
          midX = startX + (Math.random() * 35 - 10);
          midY = vh * (0.50 + Math.random() * 0.12);
          endX = startX + (Math.random() * 40 - 15);
          endY = -120 - Math.random() * 40;
          break;
      }
    } else {
      // Right side
      const minX = config.rightZoneMin * vw;
      const maxX = config.rightZoneMax * vw;
      startX = minX + Math.random() * (maxX - minX);

      switch (variant) {
        case 0:
          // 1. right -> left with slight upward drift
          startY = vh * (0.60 + Math.random() * 0.25);
          midX = startX - (0.03 * vw + Math.random() * 0.03 * vw);
          midY = startY - vh * 0.18;
          endX = startX - (0.06 * vw + Math.random() * 0.04 * vw);
          endY = startY - vh * 0.38;
          break;

        case 1:
          // 2. right -> left with slight downward drift
          startY = vh * (0.15 + Math.random() * 0.20);
          midX = startX - (0.03 * vw + Math.random() * 0.03 * vw);
          midY = startY + vh * 0.14;
          endX = startX - (0.06 * vw + Math.random() * 0.03 * vw);
          endY = startY + vh * 0.28;
          break;

        case 2:
          // 3. right -> upper-left
          startY = vh * (0.88 + Math.random() * 0.15);
          midX = startX - (0.04 * vw + Math.random() * 0.04 * vw);
          midY = vh * (0.42 + Math.random() * 0.15);
          endX = startX - (0.07 * vw + Math.random() * 0.05 * vw);
          endY = -120 - Math.random() * 30;
          break;

        case 3:
          // 4. right -> mostly horizontal
          startY = vh * (0.25 + Math.random() * 0.45);
          midX = startX - (0.04 * vw + Math.random() * 0.03 * vw);
          midY = startY + (Math.random() * 30 - 15);
          endX = startX - (0.08 * vw + Math.random() * 0.04 * vw);
          endY = startY + (Math.random() * 40 - 20);
          break;

        default:
          // 5. right -> gentle diagonal
          startY = vh * (1.02 + Math.random() * 0.05);
          midX = startX - (Math.random() * 35 - 10);
          midY = vh * (0.50 + Math.random() * 0.12);
          endX = startX - (Math.random() * 40 - 15);
          endY = -120 - Math.random() * 40;
          break;
      }
    }

    return {
      startX: Math.round(startX),
      startY: Math.round(startY),
      midX: Math.round(midX),
      midY: Math.round(midY),
      endX: Math.round(endX),
      endY: Math.round(endY)
    };
  }

  // =========================================================================
  // 6. Heart Element Creation, DOM Attachment & Lifecycle Cleanup
  // =========================================================================
  function spawnHeart(initialWarmup) {
    const config = getDeviceConfig();

    // Respect maximum concurrent elements
    if (activeHeartsCount >= config.maxActiveHearts) {
      return;
    }

    const container = document.getElementById('yashu-photo-heart-layer');
    if (!container) return;

    const side = pickSpawnSide();
    const traj = calculateTrajectory(side, config);
    const sizeInfo = pickSizeCategory(config.sizeScale);
    const photoPath = getNextPhoto();
    if (!photoPath) return;

    // Varied natural rotation (-18 deg to +18 deg)
    const startRot = (Math.random() * 36 - 18).toFixed(1);
    const midRot = (parseFloat(startRot) + (Math.random() * 12 - 6)).toFixed(1);
    const endRot = (parseFloat(midRot) + (Math.random() * 14 - 7)).toFixed(1);

    // Subtle natural breathing scale
    const startScale = (0.86 + Math.random() * 0.08).toFixed(2);
    const midScale = (1.00 + Math.random() * 0.04).toFixed(2);
    const endScale = (0.88 + Math.random() * 0.08).toFixed(2);

    // Build Heart Item DOM
    const heart = document.createElement('div');
    heart.className = 'yashu-heart-item ' + sizeInfo.categoryClass;
    heart.style.width = sizeInfo.px + 'px';
    heart.style.height = sizeInfo.px + 'px';
    heart.style.animationDuration = sizeInfo.duration + 's';
    heart.style.zIndex = sizeInfo.zIndex;

    // GPU translate3d CSS variables
    heart.style.setProperty('--startX', traj.startX + 'px');
    heart.style.setProperty('--startY', traj.startY + 'px');
    heart.style.setProperty('--midX', traj.midX + 'px');
    heart.style.setProperty('--midY', traj.midY + 'px');
    heart.style.setProperty('--endX', traj.endX + 'px');
    heart.style.setProperty('--endY', traj.endY + 'px');
    heart.style.setProperty('--startRot', startRot + 'deg');
    heart.style.setProperty('--midRot', midRot + 'deg');
    heart.style.setProperty('--endRot', endRot + 'deg');
    heart.style.setProperty('--startScale', startScale);
    heart.style.setProperty('--midScale', midScale);
    heart.style.setProperty('--endScale', endScale);
    heart.style.setProperty('--targetOpacity', sizeInfo.opacity);

    const mask = document.createElement('div');
    mask.className = 'yashu-heart-mask';

    const img = document.createElement('img');
    img.className = 'yashu-heart-img';
    img.alt = 'Yashuu';
    img.loading = 'eager';

    // Safe lifecycle cleanup
    let cleanedUp = false;
    const cleanup = function() {
      if (cleanedUp) return;
      cleanedUp = true;
      if (heart.parentNode) {
        heart.remove();
      }
      activeHeartsCount = Math.max(0, activeHeartsCount - 1);
    };

    img.onerror = function() {
      cleanup();
    };

    img.src = encodeURI(photoPath);

    mask.appendChild(img);
    heart.appendChild(mask);
    container.appendChild(heart);

    activeHeartsCount++;

    heart.addEventListener('animationend', cleanup);
    // Fallback safety timeout in case tab backgrounded
    setTimeout(cleanup, (sizeInfo.duration + 1.8) * 1000);
  }

  // =========================================================================
  // 7. Continuous Non-Mechanical Dynamic Replenish Scheduler
  // Continuously spawns while previous hearts are still flying.
  // =========================================================================
  function scheduleNextHeart() {
    if (!yashuHeartsStarted) return;
    const config = getDeviceConfig();

    const delay = Math.round(config.minSpawnDelay + Math.random() * (config.maxSpawnDelay - config.minSpawnDelay));
    spawnTimeoutId = setTimeout(function() {
      spawnHeart(false);
      scheduleNextHeart();
    }, delay);
  }

  // =========================================================================
  // 8. Lights-On Activation Hook & Instant Warmup Burst
  // =========================================================================
  function startYashuPhotoHearts() {
    if (yashuHeartsStarted) return;
    yashuHeartsStarted = true;

    const layer = document.getElementById('yashu-photo-heart-layer');
    if (layer) {
      layer.classList.add('active');
    }

    refreshPhotoPool();

    const config = getDeviceConfig();
    const burstCount = config.initialBurstCount;

    // Rapid initial burst so 5-7 hearts immediately populate the peripheral scene
    for (let i = 0; i < burstCount; i++) {
      setTimeout(function() {
        if (yashuHeartsStarted) {
          spawnHeart(true);
        }
      }, i * 260 + 50);
    }

    // Start continuous non-mechanical replenishment loop
    setTimeout(function() {
      scheduleNextHeart();
    }, burstCount * 260 + 100);
  }

  function stopYashuPhotoHearts() {
    yashuHeartsStarted = false;
    if (spawnTimeoutId) {
      clearTimeout(spawnTimeoutId);
      spawnTimeoutId = null;
    }
  }

  // Expose on window for diagnostics or tests
  window.startYashuPhotoHearts = startYashuPhotoHearts;
  window.stopYashuPhotoHearts = stopYashuPhotoHearts;
  window.getYashuHeartsActiveCount = function() {
    return activeHeartsCount;
  };
  window.getYashuPhotosTotal = function() {
    return YASHU_PHOTOS.length;
  };

  // =========================================================================
  // 9. Event Listener on #turn_on (Lights ON)
  // =========================================================================
  function attachTurnOnListener() {
    const turnOnBtn = document.getElementById('turn_on');
    if (turnOnBtn) {
      turnOnBtn.addEventListener('click', function() {
        startYashuPhotoHearts();
      }, { once: true });
    }

    if (window.jQuery) {
      window.jQuery('#turn_on').one('click', function() {
        startYashuPhotoHearts();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachTurnOnListener);
  } else {
    attachTurnOnListener();
  }

})();
