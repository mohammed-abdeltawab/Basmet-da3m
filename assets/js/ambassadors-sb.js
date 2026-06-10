(function(){
  if (!window.supabaseClient) {
    console.error('supabaseClient not available. ambassadors-sb.js requires supabase-config.js and Supabase UMD client.');
    return;
  }

  const sb = window.supabaseClient;
  const bucketName = 'ambassadors';
  const state = {
    editId: null,
    isSaving: false,
    currentImageUrl: ''
  };

  // 🎯 تم تعديل المستهدف هنا ليطابق وسم الـ HTML القياسي الموحد لديك
  const ambassadorsTableBody = document.getElementById('amb-tbody') || document.getElementById('ambassadorsTableBody');
  const ambassadorModal = document.getElementById('ambassadorModal') || document.getElementById('modal-partner'); // دعم للمودال المتوفر
  const ambassadorForm = document.getElementById('ambassadorForm');
  const addBtn = document.getElementById('addBtn');
  const fullNameInput = document.getElementById('full_name');
  const cityInput = document.getElementById('city');
  const bioInput = document.getElementById('bio');
  const imageFileInput = document.getElementById('imageFile');
  const isVisibleInput = document.getElementById('is_visible');
  const imagePreview = document.getElementById('imagePreview');
  const currentImageUrlInput = document.getElementById('current_image_url');
  const toastElement = document.getElementById('toast');
  const closeModalBtn = document.getElementById('closeModal');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToast(message, type = 'success', duration = 3000) {
    if (typeof window.toast === 'function') {
      window.toast(message, type === 'error' ? 'error' : 'success');
      return;
    }
    if (!toastElement) return;
    toastElement.textContent = message;
    toastElement.className = `toast ${type}`;
    toastElement.style.display = 'block';
    setTimeout(() => {
      toastElement.style.display = 'none';
    }, duration);
  }

  function storagePathFromUrl(url) {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      const searchString = `/storage/v1/object/public/${bucketName}/`;
      const index = parsed.pathname.indexOf(searchString);
      if (index === -1) return null;
      return decodeURIComponent(parsed.pathname.substring(index + searchString.length));
    } catch (error) {
      return null;
    }
  }

  function resetForm() {
    state.editId = null;
    state.currentImageUrl = '';
    ambassadorForm?.reset();
    if (isVisibleInput) isVisibleInput.checked = true;
    if (imagePreview) {
      imagePreview.src = '';
      imagePreview.style.display = 'none';
    }
    if (currentImageUrlInput) currentImageUrlInput.value = '';
  }

  function openModal() {
    resetForm();
    if (ambassadorModal) {
      ambassadorModal.style.display = 'block';
      ambassadorModal.classList.add('open');
    }
  }

  function closeModal() {
    if (ambassadorModal) {
      ambassadorModal.style.display = 'none';
      ambassadorModal.classList.remove('open');
    }
  }

  function populateForm(record) {
    if (!record) return;
    state.editId = record.id;
    state.currentImageUrl = record.image_url || '';
    if (fullNameInput) fullNameInput.value = record.full_name || '';
    if (cityInput) cityInput.value = record.city || '';
    if (bioInput) bioInput.value = record.bio || '';
    if (isVisibleInput) isVisibleInput.checked = record.is_visible === true;
    if (currentImageUrlInput) currentImageUrlInput.value = record.image_url || '';
    if (imagePreview) {
      if (record.image_url) {
        imagePreview.src = record.image_url;
        imagePreview.style.display = 'block';
      } else {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
      }
    }
  }

  // 🛠️ تحديث مظهر شارة الظهور الدائرية الملونة لتطابق صورتك المفضلة تماماً
  function renderBadge(visible) {
    const bgColor = visible ? '#2e7d32' : '#b71c1c';
    return `<span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:${bgColor}; border:2px solid #fff; box-shadow:0 0 4px rgba(0,0,0,0.2); vertical-align:middle;"></span>`;
  }

  // 🎨 تعديل هيكلية السطر والمظهر ليكون مطابقاً 100% لصورة جدول الشركاء الفاخر
  function renderRow(item) {
    // حل نهائي مدمج لرابط الصورة التالفة واستبدالها بالرابط الحديث الشغال المستقر
    const imgUrl = item.image_url && item.image_url.trim() !== '' ? item.image_url : 'https://placehold.co/150?text=No+Image';

    return `
      <tr>
        <td><img src="${escapeHtml(imgUrl)}" class="avatar" alt="Avatar" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" onerror="this.onerror=null;this.src='https://placehold.co/150?text=No+Image';"></td>
        <td class="cell-title" style="font-weight:bold; color:var(--dark);">${escapeHtml(item.full_name)}</td>
        <td style="font-size:13px; color:var(--muted); max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(item.bio || '—')}</td>
        <td style="font-size:13px; color:var(--muted);">${escapeHtml(item.city)}</td>
        <td style="text-align:center;">${renderBadge(item.is_visible)}</td>
        <td>
          <div class="act-btns">
            <button type="button" class="act-btn act-edit" data-id="${escapeHtml(item.id)}" style="background:#e3f2fd; color:#1976d2; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; margin-left:4px;"><i class="fas fa-edit"></i></button>
            <button type="button" class="act-btn act-delete" data-id="${escapeHtml(item.id)}" data-url="${escapeHtml(item.image_url)}" style="background:#ffebee; color:#c62828; border:none; padding:6px 10px; border-radius:6px; cursor:pointer;"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
  }

  function attachRowActions() {
    const target = document.getElementById('amb-tbody') || document.getElementById('ambassadorsTableBody');
    if (!target) return;
    
    target.querySelectorAll('button.act-edit').forEach(btn => {
      btn.addEventListener('click', () => editAmbassador(btn.dataset.id));
    });
    target.querySelectorAll('button.act-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteAmbassador(btn.dataset.id, btn.dataset.url));
    });
  }

  async function renderAmbassadors() {
    try {
      const targetBody = document.getElementById('amb-tbody') || document.getElementById('ambassadorsTableBody');
      if (!targetBody) {
        console.warn("⚠️ [DOM Warning] لا يوجد حاوية جدول للسفراء حالياً في هذه الصفحة.");
        return;
      }

      const { data, error } = await sb.from('ambassadors').select('*').order('created_at', { ascending: false });
      if (error) {
        showToast('خطأ في جلب السفراء: ' + error.message, 'error');
        return;
      }
      const rows = data || [];
      targetBody.innerHTML = rows.length 
        ? rows.map(renderRow).join('') 
        : '<tr><td colspan="6" style="padding:24px;text-align:center;color:var(--muted);">لا يوجد سفراء حتى الآن.</td></tr>';
      
      attachRowActions();
    } catch (error) {
      showToast('خطأ في عرض السفراء: ' + error.message, 'error');
    }
  }

  async function uploadImageFile(file) {
    if (!file) return null;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}_${safeName}`;
    const { error: uploadError } = await sb.storage.from(bucketName).upload(filePath, file);
    if (uploadError) {
      showToast('خطأ في رفع الصورة: ' + uploadError.message, 'error');
      return null;
    }
    const { data: publicData, error: publicError } = await sb.storage.from(bucketName).getPublicUrl(filePath);
    if (publicError || !publicData?.publicUrl) {
      showToast('خطأ في الحصول على رابط الصورة.', 'error');
      return null;
    }
    return publicData.publicUrl;
  }

  async function deleteImageFromBucket(imageUrl) {
    const path = storagePathFromUrl(imageUrl);
    if (!path) return;
    const { error } = await sb.storage.from(bucketName).remove([path]);
    if (error) {
      console.warn('Unable to delete old image from storage:', error.message);
    }
  }

  function updateImagePreview() {
    const file = imageFileInput?.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('الرجاء اختيار ملف صورة صالحة.', 'error');
        imageFileInput.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = function(event) {
        if (imagePreview) {
          imagePreview.src = event.target.result;
          imagePreview.style.display = 'block';
        }
      };
      reader.readAsDataURL(file);
      return;
    }
    if (state.currentImageUrl && imagePreview) {
      imagePreview.src = state.currentImageUrl;
      imagePreview.style.display = 'block';
      return;
    }
    if (imagePreview) {
      imagePreview.src = '';
      imagePreview.style.display = 'none';
    }
  }

  async function onSave(event) {
    event?.preventDefault();
    if (state.isSaving) return;

    const fullName = fullNameInput?.value?.trim() || '';
    const city = cityInput?.value?.trim() || '';
    const bio = bioInput?.value?.trim() || '';
    const isVisible = isVisibleInput?.checked === true;

    if (!fullName || !city) {
      showToast('الاسم والمدينة مطلوبان.', 'error');
      return;
    }

    const file = imageFileInput?.files?.[0];
    if (file && file.size > 2 * 1024 * 1024) {
      showToast('حجم الصورة كبير جداً، الحد الأقصى 2 ميجابايت.', 'error');
      return;
    }

    state.isSaving = true;
    const submitBtn = ambassadorForm?.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'جاري الحفظ...';
    }

    const payload = {
      full_name: fullName,
      city,
      bio: bio || null,
      is_visible: isVisible,
      updated_at: new Date().toISOString()
    };

    const oldImageUrl = currentImageUrlInput?.value || state.currentImageUrl;

    try {
      if (file) {
        const uploadedUrl = await uploadImageFile(file);
        if (!uploadedUrl) return;
        payload.image_url = uploadedUrl;
      }

      if (state.editId) {
        const { error } = await sb.from('ambassadors').update(payload).eq('id', state.editId);
        if (error) {
          showToast('خطأ في تحديث السفير: ' + error.message, 'error');
          return;
        }
        if (file && oldImageUrl) {
          await deleteImageFromBucket(oldImageUrl);
        }
        showToast('تم تحديث السفير بنجاح.');
      } else {
        const { error } = await sb.from('ambassadors').insert([payload]);
        if (error) {
          showToast('خطأ في إضافة السفير: ' + error.message, 'error');
          return;
        }
        showToast('تم إضافة السفير بنجاح.');
      }

      resetForm();
      closeModal();
      await renderAmbassadors();
    } catch (error) {
      showToast('خطأ عند حفظ السفير: ' + error.message, 'error');
    } finally {
      state.isSaving = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'حفظ';
      }
    }
  }

  async function editAmbassador(id) {
    if (!id) return;
    try {
      const { data, error } = await sb.from('ambassadors').select('*').eq('id', id).single();
      if (error) {
        showToast('خطأ في جلب بيانات السفير: ' + error.message, 'error');
        return;
      }
      populateForm(data);
      if (ambassadorModal) {
        ambassadorModal.style.display = 'block';
        ambassadorModal.classList.add('open');
      }
    } catch (error) {
      showToast('خطأ في تحميل بيانات السفير: ' + error.message, 'error');
    }
  }

  async function deleteAmbassador(id, imageUrl) {
    if (!id) return;
    
    // استخدام دالة التأكيد المدمجة المتناسقة مع الـ CMS الخاص بك
    const confirmFn = window.confirm2 || ((msg, cb) => { if (window.confirm(msg)) cb(); });
    
    confirmFn('هل تريد حذف هذا السفير نهائياً؟', async () => {
      try {
        const { error } = await sb.from('ambassadors').delete().eq('id', id);
        if (error) {
          showToast('خطأ في حذف السفير: ' + error.message, 'error');
          return;
        }
        if (imageUrl) await deleteImageFromBucket(imageUrl);
        showToast('تم حذف السفير بنجاح.', 'info');
        await renderAmbassadors();
      } catch (error) {
        showToast('فشل الحذف: ' + error.message, 'error');
      }
    });
  }

  function enableRealtime() {
    if (!sb.channel || typeof sb.channel !== 'function') return;
    try {
      sb.channel('public:ambassadors')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ambassadors' }, () => {
          renderAmbassadors();
        })
        .subscribe();
    } catch (error) {
      console.warn('Realtime setup failed:', error.message);
    }
  }

  function bindUI() {
    addBtn?.addEventListener('click', openModal);
    closeModalBtn?.addEventListener('click', closeModal);
    ambassadorForm?.addEventListener('submit', onSave);
    imageFileInput?.addEventListener('change', updateImagePreview);
  }

  function init() {
    bindUI();
    renderAmbassadors();
    enableRealtime();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // إتاحة الدوال للنظام الخارجي والـ onclick في الـ HTML لمنع الـ Uncaught ReferenceError
  window.renderAmbassadors = renderAmbassadors;
  window.renderAmb = renderAmbassadors; // اسم بديل متوافق مع نداءات الـ HTML القديمة والـ goPage
  window.onSave = onSave;
  window.saveAmb = onSave; // اسم بديل متوافق لزر الحفظ داخل المودال القديم
  window.editAmbassador = editAmbassador;
  window.openAmbModal = function(id) { if(id) editAmbassador(id); else openModal(); };
  window.deleteAmbassador = deleteAmbassador;
  window.deleteAmb = function(id) { deleteAmbassador(id, null); };
  window.enableRealtime = enableRealtime;
  window.bindUI = bindUI;
  window.initAmbassadorsSB = init;
})();