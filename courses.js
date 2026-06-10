// =====================================================================
// courses.js - تحميل الكورسات من Supabase
// =====================================================================

(async function () {
  const grid = document.querySelector('.courses-grid') || document.getElementById('coursesGrid');
  if (!grid) return;

  // 1. عرض الـ Skeleton Loading قبل جلب البيانات
  renderCoursesSkeleton(grid, 3);

  // التأكد من وجود عميل Supabase
  if (!window.supabaseClient) {
    console.warn('[courses.js] supabaseClient غير متاح');
    grid.innerHTML = '<p style="text-align:center;color:#64748B;padding:40px;">عذراً، تعذر الاتصال بخادم الكورسات.</p>';
    return;
  }

  try {
    const { data, error } = await window.supabaseClient
      .from('courses')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    const courses = data || [];

    if (!courses.length) {
      grid.innerHTML = '<p style="text-align:center;color:#64748B;font-size:18px;padding:40px;">لا توجد دورات متاحة حالياً، تابعنا قريباً!</p>';
      return;
    }

    // 2. عرض البيانات بجودة عالية
    grid.innerHTML = courses.map(c => `
      <div class="course-card">
        <div style="position:relative;">
          <img src="${sanitizeUrl(c.image_url || 'https://placehold.co/800x500?text=Course')}"
               alt="${escapeHtml(c.title)}" loading="lazy"
               onerror="this.src='https://placehold.co/800x500?text=No+Image'">
          <span class="course-badge ${c.status === 'قادمة' ? 'upcoming' : 'ended'}">${escapeHtml(c.status || 'مكتمل')}</span>
        </div>
        <div class="course-info">
          <div class="course-date">
            <i class="far fa-calendar-alt"></i> ${escapeHtml(c.date_text || 'يحدد لاحقاً')}
            ${c.time_text ? ' • ' + escapeHtml(c.time_text) : ''}
          </div>
          <div class="course-title">${escapeHtml(c.title)}</div>
          <p style="color:#475569;line-height:1.6; margin-bottom: 15px;">${escapeHtml(c.description || '')}</p>
          
          ${c.status === 'قادمة'
            ? `<a href="${sanitizeUrl(c.register_link || '#')}" class="register-btn"
                 ${c.register_link ? 'target="_blank" rel="noopener"' : 'onclick="alert(\'رابط التسجيل سيتاح قريباً!\');return false;"'}>
                 سجل الآن <i class="fas fa-arrow-left"></i>
               </a>`
            : `<span class="register-btn" style="background:#f1f5f9;color:#94a3b8;pointer-events:none;cursor:default;">انتهت الفعالية</span>`
          }
        </div>
      </div>`).join('');

  } catch (e) {
    console.error('[courses.js]', e.message);
    grid.innerHTML = '<p style="text-align:center;color:#ef4444;padding:40px;">حدث خطأ أثناء تحميل الكورسات، يرجى المحاولة لاحقاً.</p>';
  }
})();

// دالة الـ Skeleton لتعطي شعوراً بالسرعة والاحترافية
function renderCoursesSkeleton(container, count) {
  let skeletons = '';
  for(let i=0; i<count; i++) {
    skeletons += `
      <div class="course-card" style="height: 450px; background: #f8fafc; animation: pulse 1.5s infinite;">
        <div style="height: 220px; background: #e2e8f0;"></div>
        <div style="padding: 22px;">
          <div style="height: 20px; width: 60%; background: #e2e8f0; margin-bottom: 10px; border-radius: 4px;"></div>
          <div style="height: 30px; width: 90%; background: #e2e8f0; margin-bottom: 15px; border-radius: 4px;"></div>
          <div style="height: 50px; width: 100%; background: #e2e8f0; border-radius: 50px;"></div>
        </div>
      </div>`;
  }
  container.innerHTML = skeletons;
}