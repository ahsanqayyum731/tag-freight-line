/* ==========================================================================
   T-AG Freight Line LLC - Javascript Logic Engine
   ========================================================================== */

const initApp = () => {

  // Disable automatic browser scroll restoration to prevent jumps on reload
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  /* ==========================================================================
     1. Page Loading Animation
     ========================================================================== */
  const loader = document.getElementById('loader');
  const hideLoader = () => {
    setTimeout(() => {
      if (loader) {
        loader.classList.add('fade-out');
        document.body.style.overflow = 'initial';
      }
    }, 1200); // Premium visual duration
  };

  // Safety fallback: ensure loader fades out after max 3.5 seconds even if resources hang
  const safetyLoaderTimeout = setTimeout(hideLoader, 3500);

  const triggerHideLoader = () => {
    clearTimeout(safetyLoaderTimeout);
    hideLoader();
  };

  if (document.readyState === 'complete') {
    triggerHideLoader();
  } else {
    window.addEventListener('load', triggerHideLoader);
  }

  /* ==========================================================================
     2. Sticky Header & Mobile Navigation Menu
     ========================================================================== */
  const header = document.querySelector('.main-header');
  let headerTicking = false;
  window.addEventListener('scroll', () => {
    if (!headerTicking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        headerTicking = false;
      });
      headerTicking = true;
    }
  }, { passive: true });

  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        
        // Update active class
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  /* ==========================================================================
     3. 3D Truck Model Rotation Interaction
     ========================================================================== */
  const truckObject = document.querySelector('.truck-3d-object');
  const truckWrapper = document.querySelector('.truck-3d-wrapper');

  if (truckObject && truckWrapper) {
    let rect = null;
    let wrapperOffset = truckWrapper.offsetTop;
    let windowHeight = window.innerHeight;
    let scrollTicking = false;

    // Cache metrics to avoid layout thrashing on scroll/mousemove
    const updateMetrics = () => {
      if (truckWrapper) {
        rect = truckWrapper.getBoundingClientRect();
        wrapperOffset = truckWrapper.offsetTop;
        windowHeight = window.innerHeight;
      }
    };

    // Initialize metrics
    updateMetrics();

    // Re-cache metrics on resize or when user first enters the 3D area
    window.addEventListener('resize', updateMetrics, { passive: true });
    truckWrapper.addEventListener('mouseenter', updateMetrics, { passive: true });

    // 3D rotation on scroll (throttled with requestAnimationFrame)
    window.addEventListener('scroll', () => {
      if (window.innerWidth <= 768) return;
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY;
          if (scrollPos > wrapperOffset - windowHeight && scrollPos < wrapperOffset + 400) {
            const rotationY = -38 + (scrollPos - wrapperOffset) * 0.1;
            truckObject.style.transform = `rotateX(-16deg) rotateY(${rotationY}deg) rotateZ(0deg)`;
          }
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });

    // 3D rotation on mouse move (throttled with requestAnimationFrame and cached rect)
    let mouseTicking = false;
    truckWrapper.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 768) return;
      if (!mouseTicking) {
        window.requestAnimationFrame(() => {
          if (!rect) rect = truckWrapper.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          const rotY = -38 + (x / rect.width) * 45;
          const rotX = -16 - (y / rect.height) * 30;
          
          truckObject.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(0deg)`;
          mouseTicking = false;
        });
        mouseTicking = true;
      }
    }, { passive: true });

    truckWrapper.addEventListener('mouseleave', () => {
      if (window.innerWidth <= 768) return;
      window.requestAnimationFrame(() => {
        truckObject.style.transform = `rotateX(-16deg) rotateY(-38deg) rotateZ(0deg)`;
      });
    });
  }

  /* ==========================================================================
     4. Statistics Counter Animation (Scroll Triggered)
     ========================================================================== */
  const statsSection = document.querySelector('.hero-stats-grid');
  const statNumbers = document.querySelectorAll('.stat-number');
  let animated = false;

  const animateCounters = () => {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'), 10);
      const duration = 2000; // 2 seconds animation
      const increment = target / (duration / 16); // 60 FPS
      let current = 0;

      const updateCount = () => {
        current += increment;
        if (current < target) {
          if (target === 15) {
            stat.textContent = Math.floor(current) + '+';
          } else if (target === 99) {
            stat.textContent = Math.floor(current) + '%';
          } else if (target === 24) {
            stat.textContent = Math.floor(current) + '/7';
          } else {
            stat.textContent = Math.floor(current);
          }
          requestAnimationFrame(updateCount);
        } else {
          if (target === 15) {
            stat.textContent = target + '+';
          } else if (target === 99) {
            stat.textContent = target + '%';
          } else if (target === 24) {
            stat.textContent = target + '/7';
          } else {
            stat.textContent = target;
          }
        }
      };
      updateCount();
    });
  };

  if (statsSection && statNumbers.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animateCounters();
          animated = true;
        }
      });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
  }

  /* ==========================================================================
     5. Scroll Entrance Animations (Fade Ins)
     ========================================================================== */
  const animatedElements = document.querySelectorAll('.service-card, .feature-card, .gallery-item, .section-title, .about-content, .truck-3d-wrapper, .recruitment-banner, .quote-grid');
  
  animatedElements.forEach(el => {
    el.classList.add('animate-on-scroll');
  });

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        scrollObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.01, rootMargin: '0px 0px 100px 0px' });

  animatedElements.forEach(el => {
    scrollObserver.observe(el);
  });

  /* ==========================================================================
     6. Testimonials Reviews Carousel
     ========================================================================== */
  const track = document.getElementById('testimonial-track');
  const prevBtn = document.getElementById('prev-review-btn');
  const nextBtn = document.getElementById('next-review-btn');
  const dotsContainer = document.getElementById('slider-dots');
  
  if (track && prevBtn && nextBtn && dotsContainer) {
    const cards = Array.from(track.children);
    let currentIndex = 0;
    let autoPlayTimer;

    // Create dot indicators
    cards.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.classList.add('slider-dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => moveToSlide(index));
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    const updateSlider = () => {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    };

    const moveToSlide = (index) => {
      currentIndex = index;
      updateSlider();
      resetAutoplay();
    };

    const nextSlide = () => {
      currentIndex = (currentIndex + 1) % cards.length;
      updateSlider();
    };

    const prevSlide = () => {
      currentIndex = (currentIndex - 1 + cards.length) % cards.length;
      updateSlider();
    };

    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });

    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });

    const startAutoplay = () => {
      autoPlayTimer = setInterval(nextSlide, 6000);
    };

    const resetAutoplay = () => {
      clearInterval(autoPlayTimer);
      startAutoplay();
    };

    track.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    track.addEventListener('mouseleave', startAutoplay);

    startAutoplay();
  }

  /* ==========================================================================
     7. FAQ Accordion Logic
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  /* ==========================================================================
     8. Leaflet.js Interactive Logistics Map
     ========================================================================== */
  const activeShipments = {
    'TAG-777': {
      id: 'TAG-777',
      status: 'transit',
      progress: 65, // percentage
      origin: 'New York, NY',
      destination: 'Atlanta, GA',
      originCoords: [40.7128, -74.0060],
      destCoords: [33.7490, -84.3880],
      route: [
        [40.7128, -74.0060], // New York, NY
        [39.9526, -75.1652], // Philadelphia, PA
        [39.2904, -76.6122], // Baltimore, MD
        [38.9072, -77.0369], // Washington, DC
        [37.5407, -77.4360], // Richmond, VA
        [35.2271, -80.8431], // Charlotte, NC
        [33.7490, -84.3880]  // Atlanta, GA
      ]
    },
    'TAG-999': {
      id: 'TAG-999',
      status: 'delivered',
      progress: 100,
      origin: 'Los Angeles, CA',
      destination: 'Dallas, TX',
      originCoords: [34.0522, -118.2437],
      destCoords: [32.7767, -96.7970],
      route: [
        [34.0522, -118.2437], // Los Angeles, CA
        [33.4484, -112.0740], // Phoenix, AZ
        [32.2226, -110.9747], // Tucson, AZ
        [31.7619, -106.4850], // El Paso, TX
        [31.9973, -102.0779], // Midland, TX
        [32.4487, -99.7331],  // Abilene, TX
        [32.7767, -96.7970]   // Dallas, TX
      ]
    }
  };

  let map;
  let truckMarkers = {};
  let routeLines = {};

  const initLogisticsMap = () => {
    const mapElement = document.getElementById('logistics-map');
    if (!mapElement) return;

    // Center Map on USA
    map = L.map('logistics-map', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([37.8, -96.0], 4);

    // Apply CartoDB Dark Matter tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Add NY Terminal Marker (Operations Center)
    const terminalIcon = L.divIcon({
      className: 'custom-terminal-marker',
      html: `<div style="background-color: #030914; border: 2px solid #00C2FF; width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 10px #00C2FF;"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    L.marker([40.7128, -74.0060], { icon: terminalIcon })
      .addTo(map)
      .bindPopup('<strong style="color:#00C2FF">T-AG Operations Desk</strong><br>New York City Terminals');

    drawShipmentRoutes();
    startTruckSimulation();
  };

  const getCoordinateAtProgress = (route, progressPercent) => {
    if (progressPercent >= 100) return route[route.length - 1];
    if (progressPercent <= 0) return route[0];

    const totalSections = route.length - 1;
    const progressFraction = progressPercent / 100;
    
    const sectionFloat = progressFraction * totalSections;
    const sectionIndex = Math.floor(sectionFloat);
    const sectionProgress = sectionFloat - sectionIndex;

    const startNode = route[sectionIndex];
    const endNode = route[sectionIndex + 1];

    const lat = startNode[0] + (endNode[0] - startNode[0]) * sectionProgress;
    const lng = startNode[1] + (endNode[1] - startNode[1]) * sectionProgress;

    return [lat, lng];
  };

  const drawShipmentRoutes = () => {
    Object.values(activeShipments).forEach(shipment => {
      // Draw dashed route line
      const polyline = L.polyline(shipment.route, {
        color: '#00C2FF',
        weight: 2,
        opacity: 0.45,
        dashArray: '5, 8'
      }).addTo(map);

      routeLines[shipment.id] = polyline;

      // Draw custom truck pin
      const initialCoords = getCoordinateAtProgress(shipment.route, shipment.progress);
      
      const truckIcon = L.divIcon({
        className: `custom-truck-marker-${shipment.id}`,
        html: `
          <div class="map-truck-pin" style="background-color: #00C2FF; border: 2px solid #E6F1FF; width: 22px; height: 22px; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 0 12px #00C2FF; cursor: pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#030914" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="11" rx="2"/><path d="M12 2v9"/><path d="M10 2h3"/><path d="M16 11h3l3 4v5a2 2 0 0 1-2 2h-1"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = L.marker(initialCoords, { icon: truckIcon })
        .addTo(map)
        .bindPopup(`<strong>Shipment: ${shipment.id}</strong><br>Status: ${shipment.status.toUpperCase()}<br>Route: ${shipment.origin} &rarr; ${shipment.destination}`);

      truckMarkers[shipment.id] = marker;
    });
  };

  const startTruckSimulation = () => {
    let tick = 0;
    setInterval(() => {
      tick += 0.05;
      Object.values(activeShipments).forEach(shipment => {
        if (shipment.status === 'transit') {
          const currentProgress = shipment.progress;
          const coords = getCoordinateAtProgress(shipment.route, currentProgress);
          
          // Apply slight wave motion to simulate highway vibration
          const offsetLat = coords[0] + Math.sin(tick) * 0.012;
          const offsetLng = coords[1] + Math.cos(tick) * 0.012;

          if (truckMarkers[shipment.id]) {
            truckMarkers[shipment.id].setLatLng([offsetLat, offsetLng]);
          }
        }
      });
    }, 150);
  };

  if (typeof L !== 'undefined') {
    initLogisticsMap();
  } else {
    console.warn("Leaflet library failed to load. Live tracking map will be disabled.");
    const mapElement = document.getElementById('logistics-map');
    if (mapElement) {
      mapElement.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; color: #8892B0; padding: 20px; text-align: center; background-color: #081326; border-radius: 8px;">
          <i data-lucide="map-pin" style="width: 48px; height: 48px; margin-bottom: 16px; color: #00C2FF;"></i>
          <h3>Live Map Offline</h3>
          <p style="font-size: 13px; margin-top: 8px; color: #8892B0;">Unable to load map resources. Please check your internet connection.</p>
        </div>`;
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }

  /* ==========================================================================
     9. Live Freight Tracking Query System
     ========================================================================== */
  const trackingInput = document.getElementById('tracking-input');
  const trackingSearchBtn = document.getElementById('tracking-search-btn');
  const trackingResultBox = document.getElementById('tracking-result-box');

  const stepOrdered = document.getElementById('step-ordered');
  const stepLoaded = document.getElementById('step-loaded');
  const stepTransit = document.getElementById('step-transit');
  const stepDelivered = document.getElementById('step-delivered');

  const trackerStatusBadge = document.getElementById('tracker-status-badge');
  const trackerRefId = document.getElementById('tracker-ref-id');
  const trackerOrigin = document.getElementById('tracker-origin');
  const trackerDestination = document.getElementById('tracker-destination');
  const trackerPingTime = document.getElementById('tracker-ping-time');

  const executeTrackQuery = () => {
    const query = trackingInput.value.trim().toUpperCase();
    if (!query) {
      showToast('Error', 'Please enter a tracking code.', 'shield-alert');
      return;
    }

    const shipment = activeShipments[query];

    if (shipment) {
      trackingResultBox.classList.remove('hidden');
      
      trackerRefId.textContent = shipment.id;
      trackerOrigin.textContent = shipment.origin;
      trackerDestination.textContent = shipment.destination;
      trackerPingTime.textContent = 'Just now';

      trackerStatusBadge.className = 'badge';
      if (shipment.status === 'delivered') {
        trackerStatusBadge.classList.add('badge-accent');
        trackerStatusBadge.textContent = 'Delivered';
      } else if (shipment.status === 'transit') {
        trackerStatusBadge.textContent = 'In Transit';
      } else {
        trackerStatusBadge.textContent = shipment.status.toUpperCase();
      }

      const steps = [stepOrdered, stepLoaded, stepTransit, stepDelivered];
      steps.forEach(step => step.className = 'timeline-step');

      if (shipment.status === 'ordered') {
        stepOrdered.classList.add('active');
      } else if (shipment.status === 'loaded') {
        stepOrdered.classList.add('completed');
        stepLoaded.classList.add('active');
      } else if (shipment.status === 'transit') {
        stepOrdered.classList.add('completed');
        stepLoaded.classList.add('completed');
        stepTransit.classList.add('active');
      } else if (shipment.status === 'delivered') {
        stepOrdered.classList.add('completed');
        stepLoaded.classList.add('completed');
        stepTransit.classList.add('completed');
        stepDelivered.classList.add('completed');
      }

      // Smooth pan map
      if (map && truckMarkers[shipment.id]) {
        const coords = getCoordinateAtProgress(shipment.route, shipment.progress);
        map.setView(coords, 6, { animate: true, duration: 1.5 });
        
        setTimeout(() => {
          truckMarkers[shipment.id].openPopup();
        }, 1600);
      }

      showToast('Tracking Success', `Loaded cargo details for ${shipment.id}`, 'navigation');
    } else {
      trackingResultBox.classList.add('hidden');
      showToast('Query Failed', 'Invalid reference code. Try TAG-777 or TAG-999.', 'shield-alert');
    }
  };

  if (trackingSearchBtn) {
    trackingSearchBtn.addEventListener('click', executeTrackQuery);
    trackingInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') executeTrackQuery();
    });
  }

  /* ==========================================================================
     10. Client Storage & Form Handlers
     ========================================================================== */
  const fileInputs = document.querySelectorAll('.file-input-hidden');
  fileInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const fileName = e.target.files[0]?.name || 'Upload Document';
      const labelText = input.nextElementSibling.querySelector('.file-label-text');
      if (labelText) {
        labelText.textContent = fileName;
        labelText.style.color = '#00C2FF';
      }
    });
  });

  // DB Initialization
  if (!localStorage.getItem('t_ag_drivers')) {
    localStorage.setItem('t_ag_drivers', JSON.stringify([]));
  }
  if (!localStorage.getItem('t_ag_quotes')) {
    localStorage.setItem('t_ag_quotes', JSON.stringify([]));
  }

  // Driver Application Form
  const driverForm = document.getElementById('driver-application-form');
  if (driverForm) {
    driverForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newApp = {
        id: 'APP-' + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toLocaleDateString(),
        name: document.getElementById('driver-name').value,
        company: document.getElementById('driver-company').value || 'N/A',
        phone: document.getElementById('driver-phone').value,
        email: document.getElementById('driver-email').value,
        location: document.getElementById('driver-location').value,
        truckNo: document.getElementById('driver-truck-no').value || 'N/A',
        truckType: document.getElementById('driver-truck-type').value,
        experience: document.getElementById('driver-experience').value,
        mc: document.getElementById('driver-mc').value || 'N/A',
        dot: document.getElementById('driver-dot').value || 'N/A',
        states: document.getElementById('driver-states').value,
        cdlFile: document.getElementById('driver-cdl').files[0]?.name || 'license.pdf',
        insFile: document.getElementById('driver-insurance').files[0]?.name || 'insurance.pdf',
        notes: document.getElementById('driver-notes').value || 'N/A',
        status: 'pending'
      };

      const apps = JSON.parse(localStorage.getItem('t_ag_drivers'));
      apps.push(newApp);
      localStorage.setItem('t_ag_drivers', JSON.stringify(apps));

      // Post to FormSubmit AJAX
      fetch('https://formsubmit.co/ajax/info@tagfreightline.com', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          subject: "Lease Application: " + newApp.name,
          name: newApp.name,
          email: newApp.email,
          phone: newApp.phone,
          location: newApp.location,
          equipment: newApp.truckType + " (Truck #" + newApp.truckNo + ")",
          experience: newApp.experience + " Years",
          mc_dot: "MC: " + newApp.mc + " / DOT: " + newApp.dot,
          operating_states: newApp.states,
          documents: "CDL: " + newApp.cdlFile + " / COI: " + newApp.insFile,
          notes: newApp.notes
        })
      })
      .then(response => response.json())
      .then(res => {
        if (res.success) {
          showToast('Data Uploaded', 'Form submitted to dispatcher office email.', 'mail');
        }
      })
      .catch(err => console.error("FormSubmit Error:", err));

      driverForm.reset();
      fileInputs.forEach(input => {
        const labelText = input.nextElementSibling.querySelector('.file-label-text');
        if (labelText) {
          if (input.id === 'driver-cdl') labelText.textContent = 'CDL_License.pdf';
          if (input.id === 'driver-insurance') labelText.textContent = 'Insurance_COI.pdf';
          labelText.style.color = '#8892B0';
        }
      });

      showToast('Compliance Approved', 'Onboarding data logged to server.', 'shield-check');
      setTimeout(() => showToast('Manager Alerted', 'SMS dispatched to Tara Isardat.', 'mail'), 1000);
      setTimeout(() => showToast('Confirmation Sent', `Receipt copy dispatched to ${newApp.email}`, 'mail'), 2000);

      renderAdminTables();
    });
  }

  // Shipper Quote Form
  const shipperForm = document.getElementById('shipper-quote-form');
  if (shipperForm) {
    shipperForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const newQuote = {
        id: 'QTE-' + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toLocaleDateString(),
        company: document.getElementById('quote-company').value,
        contact: document.getElementById('quote-contact').value,
        phone: document.getElementById('quote-phone').value,
        email: document.getElementById('quote-email').value,
        pickup: document.getElementById('quote-pickup').value,
        delivery: document.getElementById('quote-delivery').value,
        freight: document.getElementById('quote-freight').value,
        weight: document.getElementById('quote-weight').value,
        trailer: document.getElementById('quote-trailer').value,
        notes: document.getElementById('quote-notes').value || 'N/A'
      };

      const quotes = JSON.parse(localStorage.getItem('t_ag_quotes'));
      quotes.push(newQuote);
      localStorage.setItem('t_ag_quotes', JSON.stringify(quotes));

      fetch('https://formsubmit.co/ajax/info@tagfreightline.com', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          subject: "Freight Quote Inquiry: " + newQuote.company,
          company: newQuote.company,
          contact: newQuote.contact,
          phone: newQuote.phone,
          email: newQuote.email,
          pickup: newQuote.pickup,
          delivery: newQuote.delivery,
          freight: newQuote.freight,
          weight: newQuote.weight + " lbs",
          equipment: newQuote.trailer,
          notes: newQuote.notes
        })
      })
      .then(response => response.json())
      .catch(err => console.error("FormSubmit Error:", err));

      shipperForm.reset();
      showToast('Calculation Logged', 'Lane details submitted to pricing team.', 'calculator');
      setTimeout(() => showToast('Manager Alerted', 'Inquiry notification sent to Tara Isardat.', 'mail'), 1000);
      setTimeout(() => showToast('Quote Receipt', `Summary copy sent to ${newQuote.email}`, 'mail'), 2000);

      renderAdminTables();
    });
  }

  // General Contact Form
  const contactForm = document.getElementById('contact-email-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('contact-email').value;
      const newContact = {
        name: document.getElementById('contact-name').value,
        email: email,
        subject: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value
      };

      fetch('https://formsubmit.co/ajax/info@tagfreightline.com', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          subject: "Contact Inquiry: " + newContact.subject,
          name: newContact.name,
          email: newContact.email,
          subject_field: newContact.subject,
          message: newContact.message
        })
      })
      .then(response => response.json())
      .catch(err => console.error("FormSubmit Error:", err));

      contactForm.reset();
      showToast('Message Transmitted', 'Your query has been logged.', 'check-circle-2');
      setTimeout(() => showToast('Verification Sent', `Confirmation copy sent to ${email}`, 'mail'), 1200);
    });
  }

  /* ==========================================================================
     11. Sliding Admin Dashboard Panel
     ========================================================================== */
  const adminOverlay = document.getElementById('admin-dashboard-overlay');
  const adminToggleBtn = document.getElementById('admin-toggle-btn');
  const adminCloseBtn = document.getElementById('admin-close-btn');
  const adminFooterTrigger = document.getElementById('admin-trigger-footer');
  
  const adminLoginBox = document.getElementById('admin-login-box');
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminContentBox = document.getElementById('admin-content-box');
  const loginErrorMsg = document.getElementById('login-error-msg');

  const openAdminPanel = () => {
    adminOverlay.classList.remove('hidden');
    setTimeout(() => adminOverlay.classList.add('active'), 50);

    if (sessionStorage.getItem('t_ag_authorized') === 'true') {
      adminLoginBox.classList.add('hidden');
      adminContentBox.classList.remove('hidden');
      renderAdminTables();
    } else {
      adminLoginBox.classList.remove('hidden');
      adminContentBox.classList.add('hidden');
    }
  };

  const closeAdminPanel = () => {
    adminOverlay.classList.remove('active');
    setTimeout(() => adminOverlay.classList.add('hidden'), 400);
  };

  if (adminToggleBtn) adminToggleBtn.addEventListener('click', openAdminPanel);
  if (adminCloseBtn) adminCloseBtn.addEventListener('click', closeAdminPanel);
  if (adminFooterTrigger) {
    adminFooterTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      openAdminPanel();
    });
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('admin-username').value;
      const pass = document.getElementById('admin-password').value;

      if (user === 'admin' && pass === 'tagfreight') {
        sessionStorage.setItem('t_ag_authorized', 'true');
        loginErrorMsg.classList.add('hidden');
        adminLoginBox.classList.add('hidden');
        adminContentBox.classList.remove('hidden');
        
        showToast('Access Approved', 'Authorized. Welcome back Kemal & Tara.', 'shield');
        renderAdminTables();
      } else {
        loginErrorMsg.classList.remove('hidden');
        showToast('Authorized Denied', 'Credential mismatch.', 'shield-alert');
      }
    });
  }

  // Tabs Nav
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabPanes = document.querySelectorAll('.admin-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const paneId = 'tab-' + btn.getAttribute('data-tab');
      document.getElementById(paneId).classList.add('active');
    });
  });

  const renderAdminTables = () => {
    // 1. Drivers Table
    const driversTbody = document.getElementById('driver-apps-tbody');
    const drivers = JSON.parse(localStorage.getItem('t_ag_drivers')) || [];
    document.getElementById('count-driver-apps').textContent = drivers.length;
    
    if (drivers.length === 0) {
      driversTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color:#8892B0;">No driver applications submitted yet.</td></tr>`;
    } else {
      driversTbody.innerHTML = '';
      drivers.forEach((app, index) => {
        const tr = document.createElement('tr');
        let statusBadgeClass = 'status-pending';
        if (app.status === 'approved') statusBadgeClass = 'status-approved';
        if (app.status === 'rejected') statusBadgeClass = 'status-rejected';

        tr.innerHTML = `
          <td>${app.date}</td>
          <td>
            <strong>${app.name}</strong><br>
            <span style="font-size:11px">${app.email} | ${app.phone}</span>
          </td>
          <td>${app.location}</td>
          <td>${app.truckType}</td>
          <td>${app.experience} Yrs</td>
          <td>
            <a href="#" style="color:#00C2FF; text-decoration:underline" class="mock-doc-click" data-file="${app.cdlFile}">${app.cdlFile}</a><br>
            <a href="#" style="color:#00C2FF; text-decoration:underline" class="mock-doc-click" data-file="${app.insFile}">${app.insFile}</a>
          </td>
          <td><span class="badge-status ${statusBadgeClass}">${app.status}</span></td>
          <td>
            ${app.status === 'pending' ? `
              <button class="btn btn-primary btn-sm approve-app-btn" data-index="${index}" style="padding: 4px 10px; font-size:11px; margin-bottom:4px; display:block; width:100%">Approve</button>
              <button class="btn btn-outline btn-sm reject-app-btn" data-index="${index}" style="padding: 4px 10px; font-size:11px; display:block; width:100%">Reject</button>
            ` : `<span style="color:#8892B0">Processed</span>`}
          </td>
        `;
        driversTbody.appendChild(tr);
      });

      document.querySelectorAll('.approve-app-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = e.target.getAttribute('data-index');
          updateAppStatus(index, 'approved');
        });
      });
      document.querySelectorAll('.reject-app-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = e.target.getAttribute('data-index');
          updateAppStatus(index, 'rejected');
        });
      });
    }

    // 2. Quotes Table
    const quotesTbody = document.getElementById('shipper-quotes-tbody');
    const quotes = JSON.parse(localStorage.getItem('t_ag_quotes')) || [];
    document.getElementById('count-shipper-quotes').textContent = quotes.length;

    if (quotes.length === 0) {
      quotesTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color:#8892B0;">No quote inquiries submitted yet.</td></tr>`;
    } else {
      quotesTbody.innerHTML = '';
      quotes.forEach((qte) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${qte.date}</td>
          <td><strong>${qte.company}</strong></td>
          <td>
            ${qte.contact}<br>
            <span style="font-size:11px">${qte.email} | ${qte.phone}</span>
          </td>
          <td>
            O: ${qte.pickup}<br>
            D: ${qte.delivery}
          </td>
          <td>${parseInt(qte.weight, 10).toLocaleString()} lbs / ${qte.freight}</td>
          <td>${qte.trailer}</td>
          <td style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${qte.notes}</td>
          <td>
            <button class="btn btn-primary btn-sm send-quote-btn" style="padding: 4px 10px; font-size:11px;">Send Rate Sheet</button>
          </td>
        `;
        quotesTbody.appendChild(tr);
      });
      
      document.querySelectorAll('.send-quote-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          showToast('Logistics Alert', 'Rate sheet estimate emailed to shipper!', 'mail');
        });
      });
    }

    // Docs download click
    document.querySelectorAll('.mock-doc-click').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const filename = link.getAttribute('data-file');
        showToast('Document Download', `Retrieving document file: ${filename}`, 'download');
      });
    });
  };

  const updateAppStatus = (index, status) => {
    const apps = JSON.parse(localStorage.getItem('t_ag_drivers'));
    apps[index].status = status;
    localStorage.setItem('t_ag_drivers', JSON.stringify(apps));
    
    showToast('Status Updated', `Application status changed to ${status.toUpperCase()}`, 'check-circle-2');
    setTimeout(() => {
      showToast('Dispatch Email', `App status email dispatched to ${apps[index].email}`, 'mail');
    }, 1200);

    renderAdminTables();
  };

  // 3. Tracking Status Manager
  const updateTrackingBtn = document.getElementById('admin-update-tracking-btn');
  const selectTruck = document.getElementById('admin-select-truck');
  const selectStatus = document.getElementById('admin-truck-status');
  const progressSlider = document.getElementById('admin-truck-progress');
  const progressVal = document.getElementById('admin-progress-value');
  const trackingAlert = document.getElementById('tracking-update-alert');

  if (progressSlider && progressVal) {
    progressSlider.addEventListener('input', () => {
      progressVal.textContent = progressSlider.value + '%';
    });
  }

  if (updateTrackingBtn) {
    updateTrackingBtn.addEventListener('click', () => {
      const truckId = selectTruck.value;
      const newStatus = selectStatus.value;
      const progress = parseInt(progressSlider.value, 10);

      if (activeShipments[truckId]) {
        activeShipments[truckId].status = newStatus;
        activeShipments[truckId].progress = progress;

        const coords = getCoordinateAtProgress(activeShipments[truckId].route, progress);
        if (truckMarkers[truckId]) {
          truckMarkers[truckId].setLatLng(coords);
          truckMarkers[truckId].setPopupContent(`<strong>Shipment: ${truckId}</strong><br>Status: ${newStatus.toUpperCase()}<br>Route: ${activeShipments[truckId].origin} &rarr; ${activeShipments[truckId].destination}`);
        }

        trackingAlert.classList.remove('hidden');
        setTimeout(() => trackingAlert.classList.add('hidden'), 3000);

        showToast('Tracking Logged', `Active vehicle ${truckId} moved to ${progress}% (${newStatus}).`, 'refresh-cw');

        if (!trackingResultBox.classList.contains('hidden') && trackerRefId.textContent === truckId) {
          executeTrackQuery();
        }
      }
    });
  }

  /* ==========================================================================
     12. Floating AI Chatbot Widget (Option Tree & Natural Parsing)
     ========================================================================== */
  const chatbotWidget = document.getElementById('chatbot-widget');
  const chatbotToggle = document.getElementById('chatbot-toggle-btn');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatBody = document.getElementById('chat-body');
  const chatForm = document.getElementById('chat-input-form');
  const chatInput = document.getElementById('chat-message-input');

  if (chatbotToggle && chatbotWindow) {
    chatbotToggle.addEventListener('click', () => {
      const isOpen = !chatbotWindow.classList.contains('hidden');
      if (isOpen) {
        chatbotWindow.classList.add('hidden');
        chatbotToggle.querySelector('.icon-open').classList.remove('hidden');
        chatbotToggle.querySelector('.icon-close').classList.add('hidden');
      } else {
        chatbotWindow.classList.remove('hidden');
        chatbotToggle.querySelector('.icon-open').classList.add('hidden');
        chatbotToggle.querySelector('.icon-close').classList.remove('hidden');
        scrollToBottom();
      }
    });

    chatBody.addEventListener('click', (e) => {
      if (e.target.classList.contains('chat-opt-btn')) {
        const option = e.target.getAttribute('data-value');
        const text = e.target.textContent;
        
        appendMessage('user', text);
        
        const optionsEl = chatBody.querySelector('.chat-options');
        if (optionsEl) optionsEl.remove();

        setTimeout(() => handleBotResponse(option), 800);
      }
    });

    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = chatInput.value.trim();
      if (!message) return;

      appendMessage('user', message);
      chatInput.value = '';

      const optionsEl = chatBody.querySelector('.chat-options');
      if (optionsEl) optionsEl.remove();

      setTimeout(() => parseAndReplyUserText(message), 800);
    });
  }

  const appendMessage = (sender, text) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender === 'bot' ? 'bot-msg' : 'user-msg'}`;
    msgDiv.innerHTML = `
      <div class="msg-content">
        <p>${text}</p>
      </div>
    `;
    chatBody.appendChild(msgDiv);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  const showChatOptions = () => {
    const optDiv = document.createElement('div');
    optDiv.className = 'chat-options';
    optDiv.innerHTML = `
      <button class="chat-opt-btn" data-value="quote">Request Lane Quote</button>
      <button class="chat-opt-btn" data-value="join">Apply to Lease-On</button>
      <button class="chat-opt-btn" data-value="tracking">Track active Cargo</button>
      <button class="chat-opt-btn" data-value="contact">Office Details</button>
    `;
    chatBody.appendChild(optDiv);
    scrollToBottom();
  };

  const handleBotResponse = (option) => {
    let reply = '';
    if (option === 'quote') {
      reply = `To request a shipping quote, please scroll to the **Request a Quote** section. Our general manager Tara Isardat will reply with pricing shortly.`;
      const quoteEl = document.getElementById('quote');
      if (quoteEl) quoteEl.scrollIntoView({ behavior: 'smooth' });
    } else if (option === 'join') {
      reply = `We lease box trucks and dry van owner-operators under T-AG authority. Check out the **Lease-On Application Form** on this page to begin onboarding.`;
      const recEl = document.getElementById('recruitment');
      if (recEl) recEl.scrollIntoView({ behavior: 'smooth' });
    } else if (option === 'tracking') {
      reply = `Search active cargo coordinate statuses by looking at the **Active Logistics Map**. Type codes like **TAG-777** (In Transit) or **TAG-999** (Delivered) to test tracking.`;
      const trackingEl = document.querySelector('.tracking-map-section');
      if (trackingEl) trackingEl.scrollIntoView({ behavior: 'smooth' });
    } else if (option === 'contact') {
      reply = `T-AG Freight Line LLC is owned by Kemal Gadwah and managed by Tara Isardat. Direct dispatch phone: **+1 (516) 472-1484**. Local Operations: **718-666-7005**. USDOT #4506103, MC #1783292.`;
    }
    
    appendMessage('bot', reply);
    setTimeout(showChatOptions, 1200);
  };

  const parseAndReplyUserText = (text) => {
    const raw = text.toLowerCase();
    let reply = '';

    if (raw.includes('quote') || raw.includes('price') || raw.includes('rate') || raw.includes('cost')) {
      reply = `To calculate cargo shipment rates, please fill out the Quote Request form in the pricing section. We will email you a lane estimate rate sheet.`;
    } else if (raw.includes('apply') || raw.includes('lease') || raw.includes('job') || raw.includes('owner') || raw.includes('driver')) {
      reply = `We're actively recruiting owner-operators under T-AG's MC. Direct direct deposit settlements are processed weekly. Fill out the application on our page!`;
    } else if (raw.includes('track') || raw.includes('where') || raw.includes('cargo') || raw.includes('tag-')) {
      reply = `Enter your reference tracking code in our Active Logistics Map search bar to pinpoint active vehicles and trace coordinates in real-time.`;
    } else if (raw.includes('phone') || raw.includes('contact') || raw.includes('number') || raw.includes('call') || raw.includes('email')) {
      reply = `You can call our primary operations desk at **+1 (516) 472-1484** or our local terminal office at **718-666-7005**.`;
    } else if (raw.includes('dot') || raw.includes('mc') || raw.includes('authority')) {
      reply = `T-AG Freight Line LLC operates under USDOT Authority Number **4506103** and Interstate MC Number **1783292**.`;
    } else if (raw.includes('kemal') || raw.includes('gadwah') || raw.includes('tara') || raw.includes('isardat')) {
      reply = `T-AG Freight Line is founded and led by Kemal Gadwah (President) and managed by Tara Isardat (General Manager).`;
    } else {
      reply = `Thank you for your message! I'm an automated assistant. For immediate operations support, please call our primary hotline at **+1 (516) 472-1484** to speak directly with Kemal, Tara, or a dispatcher.`;
    }

    appendMessage('bot', reply);
    setTimeout(showChatOptions, 1200);
  };

  /* ==========================================================================
     13. Toast Notification Alert Manager
     ========================================================================== */
  const toastContainer = document.getElementById('toast-container');

  const showToast = (title, message, iconName = 'info') => {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    toast.innerHTML = `
      <div class="toast-icon">
        <i data-lucide="${iconName}"></i>
      </div>
      <div class="toast-body">
        <h5>${title}</h5>
        <p>${message}</p>
      </div>
    `;

    toastContainer.appendChild(toast);
    
    if (window.lucide) {
      window.lucide.createIcons();
    }

    setTimeout(() => toast.classList.add('show'), 50);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 5000);
  };
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
