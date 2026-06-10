function checkNavbarAuth() {
    const memberNationalId = localStorage.getItem('member_national_id');
    
    // اسم صورتك الشخصية المحلية
    const defaultAvatar = 'img/avatar.jpg'; 

    const loginBtn = document.getElementById('navLoginBtn');
    const avatarContainer = document.getElementById('navUserAvatarContainer');
    const navAvatarImg = document.getElementById('navUserAvatar');

    // لو العناصر مش موجودة في الصفحة الحالية (مثل صفحة تسجيل الدخول نفسها) يخرج فوراً
    if (!loginBtn || !avatarContainer) {
        return; 
    }

    // التحكم الذكي في الإخفاء والإظهار
    if (memberNationalId && memberNationalId !== "null" && memberNationalId !== "undefined") {
        // العضو مسجل دخول -> إخفاء الزر وإظهار البروفايل
        loginBtn.style.setProperty('display', 'none', 'important');
        avatarContainer.style.setProperty('display', 'flex', 'important'); 
        
        if (navAvatarImg) {
            navAvatarImg.src = defaultAvatar;
        }
        
        // ربط الضغط على الصورة بالتوجيه لملفه الشخصي
        avatarContainer.onclick = function() {
            window.location.href = `user-profile.html?nid=${memberNationalId}`;
        };
    } else {
        // العضو غير مسجل -> إظهار زر الدخول وإخفاء البروفايل
        loginBtn.style.setProperty('display', 'inline-block', 'important');
        avatarContainer.style.setProperty('display', 'none', 'important');
    }
}

// تشغيل الفحص التلقائي بأمان
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkNavbarAuth);
} else {
    checkNavbarAuth();
}