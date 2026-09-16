const fs = require('fs');
let content = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

const oldUpdate = `  const updateProfileData = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    try {
      await updateUserProfileDoc(user.uid, updates);
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      showToast('Đã cập nhật hồ sơ cá nhân thành công!', 'success');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      showToast('Lỗi khi lưu thông tin hồ sơ.', 'error');
    }
  };`;

const newUpdate = `  const updateProfileData = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    try {
      await updateUserProfileDoc(user.uid, updates);
      
      // Tell backend to update author names in memory
      if (updates.display_name || updates.avatar_url) {
        try {
          await fetch('/api/users/sync-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: user.uid,
              name: updates.display_name,
              avatar: updates.avatar_url
            })
          });
        } catch (syncErr) {
          console.error('Failed to sync profile to backend:', syncErr);
        }
      }

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      showToast('Đã cập nhật hồ sơ cá nhân thành công!', 'success');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      showToast('Lỗi khi lưu thông tin hồ sơ.', 'error');
    }
  };`;

content = content.replace(oldUpdate, newUpdate);
fs.writeFileSync('src/context/AuthContext.tsx', content);
