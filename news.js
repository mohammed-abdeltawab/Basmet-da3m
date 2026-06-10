// =====================================================================
// news.js - إدارة وجلب الأخبار سحابياً لمبادرة بصمة دعم
// =====================================================================

// البيانات الاحتياطية الثابتة في حال عدم توفر اتصال بالخادم أو الكاش
const _fallbackNews = [
  { id: 1, title: 'إطلاق برنامج «بصمة مستقبل» في 7 محافظات جديدة', date: '5 أبريل 2026', category: 'فعاليات', image_url: 'https://picsum.photos/id/1015/800/600', content: 'بدأت المبادرة تنفيذ أكبر برنامج تدريبي للشباب بمشاركة أكثر من 1200 شاب وشابة.' },
  { id: 2, title: 'توقيع شراكة استراتيجية مع وزارة الشباب والرياضة', date: '3 أبريل 2026', category: 'شراكات', image_url: 'https://picsum.photos/id/237/800/600', content: 'اتفاقية تعاون لدعم 5000 شاب في مجال ريادة الأعمال والتطوير المهني.' },
  { id: 3, title: 'نجاح دورة «مهارات القيادة الشبابية» بمشاركة 420 متطوع', date: '30 مارس 2026', category: 'تدريب', image_url: 'https://picsum.photos/id/180/800/600', content: 'اختتمت الدورة بتخريج 420 قائد شاب من مختلف المحافظات.' },
  { id: 4, title: 'معرض الإبداع الشبابي في جامعة القاهرة يجذب 8000 زائر', date: '28 مارس 2026', category: 'فعاليات', image_url: 'https://picsum.photos/id/251/800/600', content: 'أكثر من 120 مشروع إبداعي تم عرضها تحت رعاية مبادرة بصمة دعم.' },
  { id: 5, title: 'حملة «بصمة بيئية» تنظف 12 منطقة ساحلية في الدلتا', date: '25 مارس 2026', category: 'مجتمع', image_url: 'https://picsum.photos/id/29/800/600', content: 'شارك أكثر من 650 متطوع في أكبر حملة تنظيف ساحلية هذا العام.' },
  { id: 6, title: 'تكريم أفضل 10 سفراء لمبادرة بصمة دعم 2026', date: '20 مارس 2026', category: 'شراكات', image_url: 'https://picsum.photos/id/312/800/600', content: 'احتفال كبير بتكريم السفراء المتميزين في قاعة المؤتمرات الرئيسية.' },
  { id: 7, title: 'ورشة عمل «ريادة الأعمال» بالتعاون مع بنك مصر', date: '18 مارس 2026', category: 'تدريب', image_url: 'https://picsum.photos/id/870/800/600', content: 'أكثر من 280 شاب تعلموا كيفية إنشاء مشاريعهم الخاصة.' },
];

let newsData = [];

// جلب الأخبار من سوبابيس مع تفعيل الحماية والـ Skeleton
async function loadNews() {
  const container = document.getElementById('newsGrid');
  if (!container) return;

  // 1. تشغيل الـ Skeleton Loading المكتوب في ملف الـ CSS الخاص بك فوراً
  renderNewsSkeleton(container, 3);

  try {
    // 2. المحاولة من سوبابيس
    if (window.supabaseClient) {
      const { data, error } = await window.supabaseClient
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        newsData = data;
        localStorage.setItem('bm_news', JSON.stringify(data));
        renderNews(newsData);
        return;
      }
    }
  } catch (e) {
    console.warn('[news.js] فشل الاتصال بسوبابيس، جاري الانتقال للذاكرة الاحتياطية:', e.message);
  }

  // 3. الحل الاحتياطي الأول: LocalStorage الكاش
  try {
    const stored = localStorage.getItem('bm_news');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        newsData = parsed.filter(n => n.is_visible !== false);
        renderNews(newsData);
        return;
      }
    }
  } catch (e) { /* تجاهل الخطأ البسيط */ }

  // 4. الحل الاحتياطي النهائي: مصفوفة كود الـ Fallback
  newsData = _fallbackNews;
  renderNews(newsData);
}

// دالة طباعة هياكل الانتظار (Skeleton) المتوافقة مع ستايلك الخاص
function renderNewsSkeleton(targetContainer, cardsCount) {
  let skeletonsHtml = '';
  for (let i = 0; i < cardsCount; i++) {
    skeletonsHtml += `
      <div class="news-card skeleton" style="height: 420px; border: none; opacity: 0.7;">
        <div style="width: 100%; height: 220px; background: #e2e8f0;"></div>
        <div style="padding: 24px; flex: 1; display: flex; flex-direction: column; gap: 15px;">
          <div style="width: 100px; height: 25px; background: #e2e8f0; border-radius: 50px;"></div>
          <div style="width: 80%; height: 25px; background: #e2e8f0; border-radius: 4px;"></div>
          <div style="width: 100%; height: 45px; background: #e2e8f0; border-radius: 4px; flex-grow:1;"></div>
        </div>
      </div>`;
  }
  targetContainer.innerHTML = skeletonsHtml;
}

// دالة رص كروت الأخبار الحقيقية في الجريد
function renderNews(data) {
  const container = document.getElementById('newsGrid');
  const noResultsEl = document.getElementById('noResults');
  
  if (noResultsEl) {
    noResultsEl.style.display = data.length === 0 ? 'block' : 'none';
  }
  
  container.innerHTML = data.map(n => {
    const img = n.image_url && n.image_url.trim() !== "" ? n.image_url : 'https://placehold.co/800x600?text=No+Image';
    // استخدام دالة الفورمات الآمنة للتاريخ إذا كان مسحوباً من قاعدة البيانات
    const displayDate = n.date ? n.date : (typeof formatDateShort === 'function' ? formatDateShort(n.created_at) : 'حديثاً');
    
    return `
      <div class="news-card">
        <img src="${sanitizeUrl(img)}"
             alt="${escapeHtml(n.title)}" 
             loading="lazy"
             onerror="this.src='https://placehold.co/800x600?text=No+Image'">
        <div class="news-card-content">
          <div class="news-date">
            <i class="fas fa-calendar"></i> ${escapeHtml(displayDate)}
          </div>
          <h3>${escapeHtml(n.title)}</h3>
          <p>${escapeHtml(n.content || n.description || '')}</p>
          <a href="#" onclick="viewDetail(${Number(n.id)});return false;" class="read-more">
            اقرأ المزيد <i class="fas fa-arrow-left"></i>
          </a>
        </div>
      </div>`;
  }).join('');
}

// دالة الفلترة والبحث الفوري (تعمل مع الـ الـ Input والـ Select)
function filterNews() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  const cat = document.getElementById('categoryFilter').value;
  
  const filtered = newsData.filter(n => {
    const matchesQuery = !q || 
                         (n.title || '').toLowerCase().includes(q) || 
                         (n.content || '').toLowerCase().includes(q);
    const matchesCategory = !cat || n.category === cat;
    return matchesQuery && matchesCategory;
  });
  
  renderNews(filtered);
}

// عرض تفاصيل الخبر بالكامل في نافذة منبثقة (Popup Overlay)
function viewDetail(id) {
  const n = newsData.find(x => x.id === id);
  if (!n) return;

  const displayDate = n.date ? n.date : (typeof formatDateShort === 'function' ? formatDateShort(n.created_at) : 'حديثاً');
  const img = n.image_url && n.image_url.trim() !== "" ? n.image_url : 'https://placehold.co/800x600?text=No+Image';

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter: blur(5px);padding: 15px;';
  
  overlay.innerHTML = `
    <div style="background:white;max-width:720px;width:100%;border-radius:24px;overflow:hidden;box-shadow: 0 20px 50px rgba(0,0,0,0.3); animation: modalFadeIn 0.3s ease;">
      <img src="${sanitizeUrl(img)}"
           style="width:100%;height:320px;object-fit:cover;"
           onerror="this.src='https://placehold.co/800x600?text=No+Image'">
      <div style="padding:30px; max-height: 60vh; overflow-y: auto;">
        <div style="background:#F4A261;color:#004488;padding:6px 18px;border-radius:50px;display:inline-block;margin-bottom:15px;font-weight:700;font-size:14px;">
          <i class="fas fa-calendar-alt"></i> ${escapeHtml(displayDate)}
        </div>
        <h2 style="margin-bottom:15px;color:#1A2A44;font-size:26px;font-weight:700;line-height:1.4;">${escapeHtml(n.title)}</h2>
        <p style="font-size:17px;line-height:1.8;color:#334155;white-space: pre-line;">${escapeHtml(n.content || n.description || '')}</p>
        <button onclick="this.closest('div').parentElement.parentElement.remove()"
          style="margin-top:25px;width:100%;background:linear-gradient(135deg,#F4A261,#f0c14b);color:#004488;padding:16px;font-size:18px;border:none;border-radius:50px;cursor:pointer;font-weight:700;transition:all 0.2s;"
          onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
          إغلاق النافذة
        </button>
      </div>
    </div>`;

  // إغلاق عند الضغط على المساحة الخلفية السوداء
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

// أنيميشن سريع للـ Popup عند الفتح
const styleSheet = document.createElement("style");
styleSheet.innerText = `@keyframes modalFadeIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`;
document.head.appendChild(styleSheet);

// التشغيل الآمن فور جاهزية الـ DOM لضمان السرعة ومنع التعارضات
document.addEventListener('DOMContentLoaded', () => {
  loadNews();
});