// =====================================================================
// shared.js - الأدوات المشتركة لجميع الصفحات
// =====================================================================

// ── Login & Modal ──
function showLoginModal() {
  document.getElementById('loginModal').style.display = 'flex';
}

function hideLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
}

function toggleMobileMenu() {
  document.querySelector('.nav-menu').classList.toggle('mobile-active');
}


document.addEventListener("DOMContentLoaded", () => {
    // تحديد كل القوائم المنسدلة بناءً على كلاس .dropdown الموجود في الـ CSS عندك
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const toggleLink = dropdown.querySelector('a'); // اللينك الأساسي (مثل: تعرف علينا)

        if (toggleLink) {
            toggleLink.addEventListener('click', (e) => {
                // التحقق من أننا في وضع الموبايل/التابلت (أقل من 992px بناءً على ملف الـ CSS)
                if (window.innerWidth < 992) {
                    e.preventDefault(); // منع فتح رابط اللينك الأساسي فوراً
                    e.stopPropagation(); // منع انتشار الحدث لباقي الصفحة

                    // إغلاق أي قائمة منسدلة أخرى مفتوحة ليكون الشكل متناسق
                    dropdowns.forEach(other => {
                        if (other !== dropdown) {
                            other.classList.remove('open');
                        }
                    });

                    // عمل Toggle لكلاس .open لتفعيل الـ display: block المكتوب عندك
                    dropdown.classList.toggle('open');
                }
            });
        }
    });

    // إغلاق القوائم المنسدلة تلقائياً إذا ضغط المستخدم في أي مكان خارجها
    document.addEventListener('click', () => {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('open');
        });
    });
});

// ── إصلاح: fakeLogin تستخدم Supabase Auth الحقيقي ──
// كانت غير معرّفة وتسبب ReferenceError في كل الصفحات
const _loginAttempts = { count: 0, resetAt: 0 };
function _checkLoginRateLimit() {
  const now = Date.now();
  if (now > _loginAttempts.resetAt) {
    _loginAttempts.count   = 0;
    _loginAttempts.resetAt = now + 60_000; // إعادة ضبط كل دقيقة
  }
  _loginAttempts.count++;
  return _loginAttempts.count <= 5; // 5 محاولات كحد أقصى
}

async function handleUserLogin() {
  const emailEl = document.getElementById('loginEmail');
  const passEl  = document.getElementById('loginPass');
  if (!emailEl || !passEl) return;

  const email    = emailEl.value.trim();
  const password = passEl.value;

  if (!email || !password) { showToast('يرجى إدخال البريد وكلمة المرور', 'error'); return; }

  if (!_checkLoginRateLimit()) {
    showToast('محاولات كثيرة، انتظر دقيقة ثم حاول مجدداً', 'error');
    return;
  }

  if (!window.supabaseClient) { showToast('خدمة تسجيل الدخول غير متاحة', 'error'); return; }

  try {
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.user) {
      showToast('تم تسجيل الدخول بنجاح!', 'success');
      hideLoginModal();
      setTimeout(() => { window.location.href = 'cms.html'; }, 800);
    }
  } catch (err) {
    showToast('بيانات غير صحيحة', 'error');
    console.warn('[Login] فشل:', err.message);
  }
}

// ── Scroll ──
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', () => {
  const btn = document.getElementById('scrollTopBtn');
  if (btn) btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
});

// ── Toast Notifications ──
function showToast(message, type = 'info', duration = 3000) {
  const safeMessage = escapeHtml(String(message)); // XSS protection
  let toast = document.querySelector('.toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.innerHTML = safeMessage;
  toast.className = `toast-notification ${type} show`;
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// اسم مختصر مستخدم في cms.js
function toast(msg, type = 'success') { showToast(msg, type); }

// ── Site Settings ──
window.siteSettings = {};

async function loadSiteSettings() {
  try {
    if (!window.supabaseClient) return {};

    // استخدام الـ Cache إن وُجد، وإلا استعلام عادي
    const queryFn = typeof window.sbCachedQuery === 'function'
      ? () => window.sbCachedQuery('site_settings_all', 'site_settings', (q) => q.select('key, value'))
      : async () => window.supabaseClient.from('site_settings').select('key, value');

    const result = await queryFn();
    if (result.error) throw result.error;

    window.siteSettings = {};
    (result.data || []).forEach(item => {
      window.siteSettings[item.key] = item.value;
    });

    if (window.siteSettings.site_name) {
      document.title = escapeHtml(window.siteSettings.site_name);
    }
    applySettings(window.siteSettings);
    return window.siteSettings;
  } catch (err) {
    console.error('[Settings] خطأ:', err.message);
    return {};
  }
}

function applySettings(settings) {
  if (settings.site_name) document.title = escapeHtml(settings.site_name);
  document.querySelectorAll('[data-setting]').forEach(el => {
    const key   = el.getAttribute('data-setting');
    const value = settings[key];
    if (!value) return;
    if (el.tagName === 'IMG' && key.includes('url')) {
      if (/^https?:\/\//i.test(value)) el.src = value;
    } else if (el.tagName === 'A' && key.includes('link')) {
      if (/^https?:\/\//i.test(value)) el.href = value;
    } else {
      el.textContent = value; // textContent بدلاً من innerHTML
    }
  });
}

// ── Skeleton Loading ──
function createSkeletonCard(cardClass = 'news-card') {
  const div = document.createElement('div');
  div.className = `${cardClass} skeleton`;
  div.style.minHeight = '320px';
  div.setAttribute('aria-hidden', 'true');
  return div;
}

function showSkeletonLoading(container, count = 4, cardClass = 'news-card') {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) container.appendChild(createSkeletonCard(cardClass));
}

// ── Empty State ──
function emptyState(message = 'لا توجد بيانات') {
  return `<div class="empty-state">
    <div class="empty-icon"><i class="fas fa-inbox"></i></div>
    <p>${escapeHtml(message)}</p>
  </div>`;
}

function showEmptyState(container, message) {
  container.innerHTML = emptyState(message);
}

// ── Utilities ──
function escapeHtml(text) {
  if (text == null) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return dateStr || ''; }
}

function formatDateShort(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  } catch { return dateStr || ''; }
}

// يمنع روابط javascript: الخطرة
function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const t = url.trim();
  if (/^javascript:/i.test(t) || /^data:/i.test(t)) return '#';
  return t;
}


// بديل آمن لـ confirm() المدمج
function confirm2(message, onConfirm) {
  if (window.confirm(message)) onConfirm();
}



document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.show'); // افترضنا أن الـ class المفتوح هو .show
        if (activeModal) {
            closeModal(activeModal); // استدعِ دالة الإغلاق الخاصة بك
        }
    }
});

function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) { // إذا ضغط Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else { // إذا ضغط Tab فقط
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
    // اجعل التركيز يذهب لأول عنصر عند فتح الـ Modal
    firstElement.focus();
}

// ── جلب وعرض شركاء النجاح للموقع الأساسي (نسخة مأمنة ضد أخطاء التحميل) ──
async function loadPartnersOnWebsite(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. إذا لم تكن مكتبة Supabase جاهزة بعد، انتظر 100 ملي ثانية وحاول مجدداً تلقائياً
    if (!window.supabaseClient) {
        console.warn('[Partners] العميل غير معرف بعد، جاري إعادة المحاولة خلال 100ms...');
        setTimeout(() => loadPartnersOnWebsite(containerId), 100);
        return;
    }

    // 2. استخدام خاصية الـ Skeleton Loading أثناء جلب البيانات
    showSkeletonLoading(container, 4, 'partner-skeleton-card');

    try {
        // 3. سحب البيانات: المفعلين فقط ومرتبين تصاعدياً
        const { data: partners, error } = await window.supabaseClient
            .from('partners')
            .select('name, image_url, link')
            .eq('is_visible', true)
            .order('display_order', { ascending: true });

        if (error) throw error;

        // 4. إذا كان الجدول فارغاً
        if (!partners || partners.length === 0) {
            showEmptyState(container, 'نتشرف دائماً بجميع شركاء النجاح قريباً.');
            return;
        }

        // تفريغ حاوية الـ Skeleton للبدء في ضخ الداتا الحقيقية
        container.innerHTML = '';

        // 5. رسم وتوزيع الشعارات سحابياً
        partners.forEach(partner => {
            const safeLink = sanitizeUrl(partner.link);
            const defaultImg = "https://placeholder.co/150?text=Partner";
            const imgUrl = (partner.image_url && partner.image_url.trim() !== "") ? partner.image_url : defaultImg;
            const hasValidLink = safeLink && safeLink !== '#';
            
            const cardHtml = hasValidLink 
                ? `<a href="${safeLink}" target="_blank" class="partner-item-box" title="${escapeHtml(partner.name)}">
                     <img src="${imgUrl}" alt="${escapeHtml(partner.name)}" onerror="this.src='${defaultImg}'">
                   </a>`
                : `<div class="partner-item-box" title="${escapeHtml(partner.name)}">
                     <img src="${imgUrl}" alt="${escapeHtml(partner.name)}" onerror="this.src='${defaultImg}'">
                   </div>`;

            container.innerHTML += cardHtml;
        });

    } catch (err) {
        console.error('[Partners Website] خطأ في جلب البيانات:', err.message);
        showEmptyState(container, 'عذراً، حدث خطأ أثناء تحميل شركاء النجاح.');
    }
}

// ====================== دالة التحكم الديناميكي في الفوتر ======================
function updateFooterContent(settings) {
    // مصفوفة تحتوي على الـ IDs الخاصة بالفوتر والـ Keys الخاصة بقاعدة البيانات
    const footerMappings = [
        { id: 'footerTagline', key: 'footer_tagline' },
        { id: 'footerEmail', key: 'contact_email' },
        { id: 'footerWhatsapp', key: 'contact_whatsapp' },
        { id: 'footerInstagram', key: 'contact_instagram' },
        { id: 'footerFacebook', key: 'contact_facebook' }
    ];

    footerMappings.forEach(item => {
        const element = document.getElementById(item.id);
        // التحديث فقط إذا كان العنصر موجوداً في الصفحة الحالية
        if (element && settings[item.key]) {
            element.textContent = settings[item.key];
        }
    });

    // تحديث روابط السوشيال ميديا الخاصة
    const socialLinks = [
        { id: 'linkInstagram', key: 'social_instagram' },
        { id: 'linkFacebook', key: 'social_facebook' },
        { id: 'linkLinkedin', key: 'social_linkedin' },
        { id: 'linkTiktok', key: 'social_tiktok' }
    ];

    socialLinks.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
            if (settings[item.key] && settings[item.key] !== 'EMPTY') {
                element.href = settings[item.key];
                element.style.display = 'inline-flex';
            } else {
                element.style.display = 'none';
            }
        }
    });
}