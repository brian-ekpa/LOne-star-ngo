/**
 * ============================================================
 * LSHI WEBSITE — MAIN JAVASCRIPT FILE
 * Lone Star Hope Initiative
 * ============================================================
 *
 * This file handles all interactive behavior on the website:
 *
 * 1. Fetching data from data.json (objectives + team members)
 * 2. Populating the objectives card grid
 * 3. Populating the leadership team section
 * 4. Populating stats, address, social links from data
 * 5. Sticky navigation (adds .scrolled class on scroll)
 * 6. Mobile hamburger menu toggle
 * 7. Smooth scroll for nav links
 * 8. Scroll-triggered fade-in animations (IntersectionObserver)
 *
 * HOW TO CHANGE CONTENT:
 * - To add/remove objectives: edit data.json → "objectives" array
 * - To add/remove team members: edit data.json → "team" array
 * - To update address/social links: edit data.json → "organization"
 * - To change the Paystack donation URL: edit data.json → "organization.paystackUrl"
 * ============================================================
 */

/* ============================================================
   STEP 1: Wait for the entire HTML document to load before
   running any JavaScript. This ensures all elements exist.
   Since this file is imported as an ES module in React,
   we check if DOM is already ready (readyState) before
   adding the event listener.
   ============================================================ */
function initSite() {

  /* ============================================================
     STEP 2: FETCH DATA FROM data.json
     We use the browser's built-in fetch() to read the JSON file.
     Once loaded, we call all the "populate" functions below.
     ============================================================ */
  /* Load main content (objectives, team, contact info) from data.json */
  fetch('./data.json')
    .then(response => {
      if (!response.ok) throw new Error('Could not load data.json: ' + response.status);
      return response.json();
    })
    .then(data => {
      populateObjectives(data.objectives);
      populateTeam(data.team);
      populateStats(data.stats);
      populateAddress(data.organization);
      populateSocialLinks(data.organization.socialMedia);
      setupDonationButton(data.organization.paystackUrl);
    })
    .catch(error => {
      console.error('Error loading data.json:', error);
      const grid = document.getElementById('objectives-grid');
      if (grid) grid.innerHTML = '<p class="loading-text">Unable to load objectives. Please refresh the page.</p>';
    });

  /* ============================================================
     Load gallery (photos + videos) from gallery.json
     To edit gallery content: open public/gallery.json
     and add, remove, or reorder items in the "items" array.
     ============================================================ */
  fetch('./gallery.json')
    .then(response => {
      if (!response.ok) throw new Error('Could not load gallery.json: ' + response.status);
      return response.json();
    })
    .then(data => {
      populateGallery(data.items);
    })
    .catch(error => {
      console.error('Error loading gallery.json:', error);
      const grid = document.getElementById('gallery-grid');
      if (grid) grid.innerHTML = '<p class="loading-text">Unable to load gallery. Please refresh the page.</p>';
    });


  /* ============================================================
     STEP 3: POPULATE OBJECTIVES CARDS
     Takes the "objectives" array from data.json and creates
     a card for each item in the grid.
     ============================================================ */
  function populateObjectives(objectives) {
    /* Find the container div where cards will be placed */
    const grid = document.getElementById('objectives-grid');
    if (!grid) return;

    /* Start with empty grid */
    grid.innerHTML = '';

    /* Loop through each objective and create a card */
    objectives.forEach((obj, index) => {
      /* Create the card element */
      const card = document.createElement('div');
      card.className = 'objective-card fade-up';

      /* Build the inner HTML for the card */
      card.innerHTML = `
        <span class="card-icon" aria-hidden="true">${obj.icon}</span>
        <h3 class="card-title">${obj.title}</h3>
        <p class="card-description">${obj.description}</p>
      `;

      /* Add the card to the grid */
      grid.appendChild(card);
    });

    /* Trigger animation observer on new cards */
    observeFadeElements();
  }


  /* ============================================================
     STEP 4: POPULATE TEAM SECTION
     Takes the "team" array from data.json and creates
     profile cards for each member. The featured member
     (founder) gets a larger, full-width card.
     ============================================================ */
  function populateTeam(members) {
    const grid = document.getElementById('team-grid');
    if (!grid) return;
    grid.innerHTML = '';

    members.forEach(member => {
      const card = document.createElement('div');

      if (member.featured) {
        /* ---- FEATURED FOUNDER CARD (large, full-width) ---- */
        card.className = 'team-card featured fade-up';
        card.innerHTML = `
          <div class="team-photo-wrapper">
            <img
              class="team-photo"
              src="${member.image}"
              alt="Photo of ${member.name}"
              loading="lazy"
            />
          </div>
          <div class="team-info">
            <span class="founder-badge">Executive Director</span>
            <h3 class="team-name">${member.name}</h3>
            <p class="team-role">${member.role}</p>
            <p class="team-bio">${member.bio}</p>
          </div>
        `;
      } else {
        /* ---- REGULAR TEAM MEMBER CARD ---- */
        card.className = 'team-card fade-up';
        card.innerHTML = `
          <div class="team-photo-wrapper">
            <img
              class="team-photo"
              src="${member.image}"
              alt="Photo of ${member.name}"
              loading="lazy"
            />
          </div>
          <div class="team-info">
            <h3 class="team-name">${member.name}</h3>
            <p class="team-role">${member.role}</p>
            <p class="team-bio">${member.bio}</p>
          </div>
        `;
      }

      grid.appendChild(card);
    });

    observeFadeElements();
  }


  /* ============================================================
     GALLERY: POPULATE FROM gallery.json
     Renders both image and video items into the gallery grid.

     HOW TO CHANGE THE GALLERY:
     Open public/gallery.json and edit the "items" array.
     - type "image" → renders a <img> with hover overlay
     - type "video" → renders a <video> player with controls
     Each item needs: id, type, src, alt (images) or title (videos),
     category (shown on hover), and caption (shown below).
     ============================================================ */
  function populateGallery(items) {
    const grid = document.getElementById('gallery-grid');
    if (!grid || !items) return;
    grid.innerHTML = '';

    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'gallery-item fade-up';

      if (item.type === 'video') {
        /* ---- VIDEO ITEM ---- */
        el.innerHTML = `
          <div class="gallery-img-wrapper gallery-video-wrapper">
            <video
              class="gallery-video"
              src="${item.src}"
              ${item.poster ? `poster="${item.poster}"` : ''}
              controls
              preload="metadata"
              aria-label="${item.title || 'LSHI video'}"
            ></video>
            <div class="gallery-overlay gallery-video-badge">
              <p class="gallery-overlay-text">▶ ${item.category || 'Video'}</p>
            </div>
          </div>
          <p class="gallery-caption">${item.caption || ''}</p>
        `;
      } else {
        /* ---- IMAGE ITEM ---- */
        el.innerHTML = `
          <div class="gallery-img-wrapper">
            <img
              class="gallery-img"
              src="${item.src}"
              alt="${item.alt || item.caption || 'LSHI photo'}"
              loading="lazy"
            />
            <div class="gallery-overlay">
              <p class="gallery-overlay-text">${item.category || ''}</p>
            </div>
          </div>
          <p class="gallery-caption">${item.caption || ''}</p>
        `;
      }

      grid.appendChild(el);
    });

    /* Trigger scroll animations on newly added items */
    observeFadeElements();
  }


  /* ============================================================
     STEP 5: POPULATE STATS BAR
     Takes the "stats" array from data.json and fills in
     the four impact numbers in the gold stats strip.
     ============================================================ */
  function populateStats(stats) {
    const grid = document.getElementById('stats-grid');
    if (!grid || !stats) return;
    grid.innerHTML = '';

    stats.forEach(stat => {
      const item = document.createElement('div');
      item.className = 'stat-item';
      item.innerHTML = `
        <div class="stat-value">${stat.value}</div>
        <div class="stat-label">${stat.label}</div>
      `;
      grid.appendChild(item);
    });
  }


  /* ============================================================
     STEP 6: POPULATE ADDRESS & CONTACT DETAILS
     Reads organization address and contact from data.json
     and inserts them into the contact section.
     ============================================================ */
  function populateAddress(org) {
    /* Physical address */
    const addressEl = document.getElementById('org-address');
    if (addressEl && org.address) {
      addressEl.innerHTML = `
        ${org.address.line1}<br>
        ${org.address.line2}<br>
        ${org.address.country}
      `;
    }

    /* Phone number */
    const phoneEl = document.getElementById('org-phone');
    if (phoneEl && org.phone) {
      phoneEl.textContent = org.phone;
    }

    /* Email address */
    const emailEl = document.getElementById('org-email');
    if (emailEl && org.email) {
      emailEl.innerHTML = `<a href="mailto:${org.email}" style="color: var(--color-text-secondary)">${org.email}</a>`;
    }

    /* Footer address */
    const footerAddressEl = document.getElementById('footer-address');
    if (footerAddressEl && org.address) {
      footerAddressEl.innerHTML = `
        ${org.address.line1}<br>
        ${org.address.line2}<br>
        ${org.address.country}
      `;
    }
  }


  /* ============================================================
     STEP 7: POPULATE SOCIAL MEDIA LINKS
     Reads social media URLs from data.json and updates
     all social link elements on the page.
     ============================================================ */
  function populateSocialLinks(social) {
    if (!social) return;

    /* Map platform name to emoji icon */
    const icons = {
      facebook: 'f',
      twitter: '𝕏',
      instagram: '📷',
      linkedin: 'in'
    };

    /* Update every element with class .social-links */
    document.querySelectorAll('.social-links').forEach(container => {
      container.innerHTML = '';

      /* Create a link for each platform */
      Object.entries(social).forEach(([platform, url]) => {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'social-link';
        link.setAttribute('aria-label', platform);
        link.textContent = icons[platform] || platform[0].toUpperCase();
        container.appendChild(link);
      });
    });
  }


  /* ============================================================
     STEP 8: SETUP DONATION BUTTON LINK
     Sets the Paystack checkout URL on all donation buttons.
     To change the payment destination, update "paystackUrl"
     in data.json.
     ============================================================ */
  function setupDonationButton(paystackUrl) {
    document.querySelectorAll('[data-donate-link]').forEach(el => {
      el.href = paystackUrl;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    });
  }


  /* ============================================================
     STEP 9: STICKY NAVIGATION
     Adds a .scrolled class to the navbar when the user
     scrolls down more than 60px. This triggers the
     background to appear (see CSS #navbar.scrolled rules).
     ============================================================ */
  const navbar = document.getElementById('navbar');

  function handleNavScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  /* Listen for scroll events */
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  /* Run once on load in case page is already scrolled */
  handleNavScroll();


  /* ============================================================
     STEP 10: MOBILE HAMBURGER MENU
     Toggles the mobile nav menu open/closed when the
     hamburger button is clicked.
     ============================================================ */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      /* Toggle the .open class on the nav links panel */
      navLinks.classList.toggle('open');
      /* Toggle the .active class on the hamburger icon */
      navToggle.classList.toggle('active');
    });

    /* Close the menu when any nav link is clicked */
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
      });
    });
  }


  /* ============================================================
     STEP 11: CONTACT FORM SUBMISSION
     Intercepts the form submit and shows a confirmation message.
     Replace the TODO comment below with your actual form
     submission logic (e.g., Formspree, EmailJS, or your server).
     ============================================================ */
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault(); /* Prevent default form reload */

      /* Get form field values */
      const name = document.getElementById('field-name').value;
      const email = document.getElementById('field-email').value;
      const message = document.getElementById('field-message').value;

      /* TODO: Replace this with actual form submission */
      /* Example: POST to Formspree, EmailJS, or your own server */

      /* Show a success message */
      const submitBtn = contactForm.querySelector('.btn-submit');
      submitBtn.textContent = 'Message Sent! ✓';
      submitBtn.style.background = 'linear-gradient(135deg, #2a7a2a, #3a9a3a)';
      submitBtn.disabled = true;

      /* Reset after 4 seconds */
      setTimeout(() => {
        contactForm.reset();
        submitBtn.textContent = 'Send Message';
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 4000);
    });
  }


  /* ============================================================
     STEP 12: SCROLL-TRIGGERED FADE-IN ANIMATIONS
     Uses IntersectionObserver to watch elements with the
     class .fade-up and adds .visible when they enter the viewport.
     This creates the smooth slide-up effect as users scroll.
     ============================================================ */
  function observeFadeElements() {
    /* Create the observer */
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            /* Element is visible — trigger animation */
            entry.target.classList.add('visible');
            /* Stop watching once animated */
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,    /* Trigger when 10% of element is visible */
        rootMargin: '0px 0px -40px 0px' /* Slight offset from bottom */
      }
    );

    /* Watch all elements with .fade-up class */
    document.querySelectorAll('.fade-up').forEach(el => {
      observer.observe(el);
    });
  }

  /* Run once on page load for static elements */
  observeFadeElements();


  /* ============================================================
     STEP 13: VIDEO PLACEHOLDER HANDLER
     Checks if the YouTube embed iframe still has the placeholder
     URL. If so, replaces it with a styled placeholder message
     so it doesn't show an ugly browser error page.

     TO ACTIVATE THE VIDEO:
     Open index.html and find the <iframe> element
     inside .video-embed-wrapper. Replace the src value:
       src="YOUR_VIDEO_EMBED_URL_HERE"
     with your actual YouTube embed URL, e.g.:
       src="https://www.youtube.com/embed/dQw4w9WgXcQ"
     ============================================================ */
  const videoIframe = document.querySelector('.video-embed-wrapper iframe');
  if (videoIframe) {
    const src = videoIframe.getAttribute('src') || '';
    /* If the src is still the placeholder, swap with a nice visual */
    if (src.includes('YOUR_VIDEO') || src === '' || src === '#') {
      videoIframe.style.display = 'none';
      const placeholder = document.createElement('div');
      placeholder.className = 'video-placeholder-msg';
      placeholder.innerHTML = `
        <div style="
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 12px; padding: 24px; text-align: center;
        ">
          <svg style="width:48px;height:36px;opacity:0.4;fill:var(--color-gold)" viewBox="0 0 24 24">
            <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8z"/>
            <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="rgba(240,192,64,0.6)"/>
          </svg>
          <p style="color:var(--color-text-muted);font-size:0.85rem;max-width:280px;line-height:1.6">
            Video coming soon — paste your YouTube embed URL in<br>
            <code style="color:var(--color-gold);font-size:0.78rem">Home.tsx → iframe src</code>
          </p>
        </div>
      `;
      videoIframe.parentElement.appendChild(placeholder);
    }
  }


  /* ============================================================
     STEP 14: SMOOTH SCROLL FOR ALL NAV ANCHOR LINKS
     Ensures clicking any #section link scrolls smoothly and
     accounts for the sticky navbar height offset.
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      /* Offset by nav height so content isn't hidden under the sticky bar */
      const navHeight = navbar ? navbar.offsetHeight : 80;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

} /* End initSite function */

/* ============================================================
   Run initSite once the HTML document is fully loaded.
   ============================================================ */
document.addEventListener('DOMContentLoaded', initSite);
