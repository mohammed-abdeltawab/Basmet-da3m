/**
 * ambassadors.js - عرض السفراء من Supabase على الصفحة العامة
 * نسخة معالجة ومحمية من التكرار اللانهائي (Infinite Loops Fix)
 */

async function loadAmbassadorsOnWebsite() {
  const container = document.getElementById('ambGrid');
  if (!container) return;

  // 1. التحقق الآمن بدون تكرار انفجاري: إذا لم يجهز سوبابيس بعد، ننتظر ونحاول مرة واحدة أخرى بنظافة
  if (!window.supabaseClient) {
    console.warn('[Ambassadors] العميل غير معرف بعد، سيتم المحاولة مجدداً خلال 200ms...');
    setTimeout(loadAmbassadorsOnWebsite, 200);
    return;
  }

  // 2. تفعيل الـ Skeleton Loading اللطيف أثناء جلب البيانات
  if (typeof showSkeletonLoading === 'function') {
    showSkeletonLoading(container, 4, 'amb-card');
  }

  const defaultAvatar = 'https://placehold.co/150?text=No+Image';

  try {
    // 3. جلب البيانات من جدول السفراء
    const { data, error } = await window.supabaseClient
      .from('ambassadors')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      renderAmbassadorsData(container, data, defaultAvatar);
      localStorage.setItem('bm_ambassadors', JSON.stringify(data));
    } else {
      handleAmbassadorsFallback(container, defaultAvatar);
    }
  } catch (err) {
    console.error('Error loading ambassadors from Supabase:', err.message);
    handleAmbassadorsFallback(container, defaultAvatar);
  }
}

// دالة العرض الأساسية للسفراء
function renderAmbassadorsData(targetContainer, ambassadorsList, defaultImg) {
  targetContainer.innerHTML = ambassadorsList
    .map(amb => {
      const img = (amb.image_url && amb.image_url.trim() !== "") ? amb.image_url.trim() : defaultImg;
      return `
        <div class="custom-card">
          <div class="card-header">
            ${escapeHtml(amb.full_name)}
          </div>
          
          <div class="card-body">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${escapeHtml(img)}" 
                   alt="${escapeHtml(amb.full_name)}" 
                   onerror="this.src='${defaultImg}'" 
                   style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 3px solid #F4A261;" />
            </div>
            
            <p style="text-align: center; font-weight: bold; color: #0066CC; margin-bottom: 10px;">
              <i class="fas fa-map-marker-alt"></i> المحافظة: ${escapeHtml(amb.city || 'غير محدد')}
            </p>
            
            ${amb.bio ? `<p style="text-align: center; font-style: italic; font-size: 15px;">"${escapeHtml(amb.bio)}"</p>` : ''}
          </div>
        </div>
      `;
    })
    .join('');
}

// دالة معالجة الاحتياط الـ Fallback
function handleAmbassadorsFallback(targetContainer, defaultImg) {
  const cached = localStorage.getItem('bm_ambassadors');
  if (cached) {
    try {
      renderAmbassadorsData(targetContainer, JSON.parse(cached), defaultImg);
      return;
    } catch (e) {
      console.warn('Cached data is corrupted');
    }
  }
  
  if (typeof showEmptyState === 'function') {
    showEmptyState(targetContainer, 'جاري تجهيز قائمة سفراء المحافظات قريباً.');
  } else {
    targetContainer.innerHTML = `
      <div class="empty-state">
        <p>جاري تجهيز قائمة السفراء قريباً...</p>
      </div>`;
  }
}

// ── تشغيل الدالة فور وسم الجاهزية لدعم الترتيب الصحيح للملفات ──
document.addEventListener('DOMContentLoaded', () => {
  loadAmbassadorsOnWebsite();
});