import { useState } from 'react';
import { User, Mail, Building2, Briefcase, MapPin, Camera, Save } from 'lucide-react';
import { motion } from 'motion/react';

export function Profile({ user, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Only send fields that exist in the database model
    const updatePayload = {
      _id: user._id || user.id,
      name: formData.name,
      email: formData.email,
      department: formData.department,
      position: formData.position,
      role: formData.role,
      avatar: formData.avatar || null,
    };
    console.log('📝 [Profile] Submitting data:', updatePayload);
    onUpdateUser(updatePayload);
    setIsEditing(false);
  };

  // Avatar upload handler with size validation (max 500KB)
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 500 * 1024; // 500KB
      if (file.size > maxSize) {
        alert('Image is too large. Please select an image under 500KB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData({ ...formData, avatar: ev.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-emerald-900 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src={formData.avatar || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              {isEditing && (
                <label className="absolute bottom-1 right-1 bg-emerald-600 text-white p-1.5 rounded-lg shadow-lg cursor-pointer opacity-100 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-3 h-3" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="pt-16 p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-500 font-medium uppercase text-xs tracking-widest mt-1">{user.role}</p>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`px-6 py-2 rounded-xl font-bold transition-all ${
                isEditing ? 'bg-gray-100 text-gray-600' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
              }`}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-xl px-4 py-3 focus:border-emerald-500 focus:bg-white transition-all font-medium disabled:opacity-60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input 
                  type="email" 
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-xl px-4 py-3 focus:border-emerald-500 focus:bg-white transition-all font-medium disabled:opacity-60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Address
                </label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.address || ''}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-xl px-4 py-3 focus:border-emerald-500 focus:bg-white transition-all font-medium disabled:opacity-60"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-3 h-3" /> Position
                </label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-xl px-4 py-3 focus:border-emerald-500 focus:bg-white transition-all font-medium disabled:opacity-60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-3 h-3" /> Department
                </label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-xl px-4 py-3 focus:border-emerald-500 focus:bg-white transition-all font-medium disabled:opacity-60"
                />
              </div>
              {isEditing && (
                <div className="pt-6">
                  <button 
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
