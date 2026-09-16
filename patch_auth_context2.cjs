const fs = require('fs');
let content = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

const target = `      setProfile(prev => prev ? { ...prev, ...updates } : null);
      showToast('Đã cập nhật hồ sơ cá nhân thành công!', 'success');`;

const replacement = `      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      // Dispatch an event so App.tsx can refetch recipes and other data
      if (updates.display_name || updates.avatar_url) {
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      }

      showToast('Đã cập nhật hồ sơ cá nhân thành công!', 'success');`;

content = content.replace(target, replacement);
fs.writeFileSync('src/context/AuthContext.tsx', content);
