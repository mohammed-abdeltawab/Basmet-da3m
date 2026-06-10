// =====================================================================
// join.js - نموذج الانضمام (المعدل والمحمي - نسخة الديالوج)
// =====================================================================

(function () {

  const form = document.getElementById('joinForm');
  if (!form) return;

  const sb = window.supabaseClient;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = form.querySelector('.submit-btn');
    btn.disabled = true;
    btn.textContent = 'جاري الإرسال...';

    const data = {
      name_ar: form.name_ar.value.trim(),
      name_en: form.name_en.value.trim(),
      governorate: form.governorate.value,
      whatsapp: form.whatsapp.value.trim(),
      national_id: form.national_id.value.trim(),
      address: form.address.value.trim(),
      nationality: form.nationality.value.trim(),
      status_work: form.querySelector('[name="status_work"]:checked')?.value || '',
      experience: form.experience.value.trim(),
      courses: form.courses.value.trim(),
      skill_video: form.skill_video.checked,
      skill_design: form.skill_design.checked,
      skill_voice: form.skill_voice.checked,
      skill_media: form.skill_media.checked,
      skill_social: form.skill_social.checked,
      skill_content: form.skill_content.checked,
      agreed: form.agreed.checked,
    };

    try {
      const { error } = await sb.from('registrations').insert([data]);
      if (error) throw error;

      showSuccessModal();
      form.reset();
    } catch (err) {
      console.error("خطأ Supabase المكتشف:", err);
      // إضافة معالجة الأخطاء الخاصة بالـ Rate Limit اللي اتفقنا عليها
      if (err.message.includes('COOLDOWN')) {
          alert('عذراً، يرجى الانتظار 10 دقائق قبل محاولة التسجيل مرة أخرى.');
      } else if (err.message.includes('MAX_LIMIT')) {
          alert('عذراً، لقد استنفدت الحد الأقصى (3 تسجيلات) من هذا الجهاز اليوم.');
      } else {
          alert('حدث خطأ أثناء الإرسال، يرجى المحاولة لاحقاً.');
      }
      btn.disabled = false;
      btn.textContent = 'إرسال النموذج';
    }
  });

  function showSuccessModal() {
    // إنشاء طبقة التعتيم (Overlay)
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(4px);';
    
    // إنشاء صندوق الديالوج
    const modal = document.createElement('div');
    modal.style.cssText = 'background:#fff;padding:30px;border-radius:20px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,0.2);max-width:400px;width:90%;font-family:Tajawal,sans-serif;';
    
    modal.innerHTML = `
      <div style="font-size:50px;margin-bottom:15px;">🎉</div>
      <h2 style="color:#004488;margin-bottom:10px;">تم الإرسال بنجاح!</h2>
      <p style="color:#666;margin-bottom:25px;">شكراً لاهتمامك، تم استلام بياناتك بنجاح وسيتم التواصل معك قريباً.</p>
      <button id="closeModal" style="background:#0066CC;color:#fff;border:none;padding:12px 30px;border-radius:10px;font-weight:700;cursor:pointer;width:100%;">حسناً</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // زر الإغلاق
    document.getElementById('closeModal').addEventListener('click', () => {
      overlay.remove();
    });
  }
})();