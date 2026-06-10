// =====================================================================
// partners-public.js - تحميل الشركاء للصفحة العامة بالتصميم الجديد
// =====================================================================

(async function () {
  const grid = document.getElementById('partnersGrid')
               || document.querySelector('.partners-grid')
               || document.querySelector('[data-partners-grid]');
  if (!grid) return;

  if (!window.supabaseClient) {
    console.warn('[partners-public.js] supabaseClient غير متاح');
    return;
  }

  // استخدام الـ Skeleton Loading اللطيف أثناء جلب البيانات إذا كانت الدالة معرفة
  if (typeof showSkeletonLoading === 'function') {
    showSkeletonLoading(grid, 4, 'custom-card');
  }

  const defaultImg = "https://placehold.co/150?text=Partner";

  try {
    const { data, error } = await window.supabaseClient
      .from('partners')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    const partners = data || [];

    if (!partners.length) {
      if (typeof showEmptyState === 'function') {
        showEmptyState(grid, 'نتشرف دائماً بجميع شركاء النجاح قريباً.');
      } else {
        grid.innerHTML = '<p style="text-align:center;color:#64748B;font-size:16px;padding:40px;">لا يوجد شركاء معروضون حالياً</p>';
      }
      return;
    }

    grid.innerHTML = partners.map(p => {
      // جلب الحقول بدقة بناءً على مسميات جدولك القديم
      const name = p.name || p.entity_name || 'شريك النجاح';
      const rawImg = p.image_url || p.logo_url || '';
      const imgUrl = (rawImg && rawImg.trim() !== "") ? rawImg.trim() : defaultImg;
      const description = p.description || p.partnership_desc || '';
      const webLink = p.link || p.website_url || '';

      return `
        <div class="custom-card" style="display: flex; flex-direction: column; height: 100%;">
          <div class="card-header">
            ${escapeHtml(name)}
          </div>
          
          <div class="card-body" style="display: flex; flex-direction: column; justify-content: space-between; flex-grow: 1; padding: 24px;">
            
            <div>
              <div style="text-align: center; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px dashed #e2e8f0;">
                <img src="${sanitizeUrl(imgUrl)}" 
                     alt="${escapeHtml(name)}" 
                     onerror="this.src='${defaultImg}'" 
                     style="max-width: 100%; height: 80px; object-fit: contain; filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.05)); display: block; margin: 0 auto;" />
              </div>
              
              ${description ? `<p style="text-align: center; font-size: 15px; color: #334155; line-height: 1.6; margin-bottom: 20px;">${escapeHtml(description)}</p>` : ''}
            </div>

            ${webLink ? `
              <div style="text-align: center; margin-top: auto;">
                <a href="${sanitizeUrl(webLink)}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="btn-link" 
                   style="display: inline-block; padding: 10px 20px; background-color: #0066CC; color: white; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 15px; transition: background 0.3s;">
                   زيارة الموقع <i class="fas fa-external-link-alt" style="font-size: 13px; margin-right: 5px;"></i>
                </a>
              </div>
            ` : ''}
            
          </div>
        </div>
      `;
    }).join('');

  } catch (e) {
    console.error('[partners-public.js]', e.message);
    if (grid && typeof showEmptyState === 'function') {
      showEmptyState(grid, 'عذراً، حدث خطأ أثناء تحميل شركاء النجاح.');
    }
  }
})();