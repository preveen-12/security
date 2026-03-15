import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, Camera, CheckCircle2, AlertCircle, ShieldAlert, Save, MapPin, Phone, Hash } from 'lucide-react';
import api from '../api';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [gender, setGender] = useState('');
    const [profilePicUrl, setProfilePicUrl] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [address, setAddress] = useState({ area: '', city: '', state: '', country: 'India', pincode: '' });

    // OTP State
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/users/profile');
            setProfile(data);
            setGender(data.gender || '');
            setProfilePicUrl(data.profilePicUrl || '');
            setMobileNumber(data.mobileNumber || '');
            if (data.address) setAddress(data.address);
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setLoading(false);
        }
    };

    // INTELLIGENT GEOCODING (Auto-fill on 6 digit pincode)
    useEffect(() => {
        if (address.pincode.length === 6) {
            const fetchGeodata = async () => {
                try {
                    const res = await fetch(`https://api.postalpincode.in/pincode/${address.pincode}`);
                    const data = await res.json();
                    if (data[0].Status === 'Success') {
                        const postOffice = data[0].PostOffice[0];
                        setAddress(prev => ({
                            ...prev,
                            city: postOffice.District,
                            state: postOffice.State,
                            country: 'India'
                        }));
                    }
                } catch (error) {
                    console.error('Geocoding error:', error);
                }
            };
            fetchGeodata();
        }
    }, [address.pincode]);

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const payload = { gender, address, profilePicUrl, mobileNumber };
            await api.post('/users/profile/update', payload);
            fetchProfile(); // Refresh session data
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSendOtp = async () => {
        try {
            await api.post('/users/profile/send-otp', { mobileNumber });
            setOtpSent(true);
        } catch (error) {
            console.error('Error sending OTP:', error);
        }
    };

    const handleVerifyOtp = async () => {
        setVerifying(true);
        try {
            await api.post('/users/profile/verify-otp', { otp: otpCode });
            setOtpSent(false);
            fetchProfile(); // Re-fetch to confirm isMobileVerified locally
        } catch (error) {
            console.error('Error verifying OTP:', error);
        } finally {
            setVerifying(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center pt-24">
            <div className="w-10 h-10 border-4 border-lavender border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const isProfileIncomplete = !profile.gender || !profile.address?.pincode || !profile.isMobileVerified;

    return (
        <div className="max-w-4xl w-[95%] mx-auto pb-12 pt-24 min-h-screen">

            {/* Action Required Banner */}
            <AnimatePresence>
                {isProfileIncomplete && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.35 }}
                        className="bg-lavender/20 border border-lavender/50 p-4 rounded-xl mb-6 flex items-start gap-4 backdrop-blur-md"
                    >
                        <ShieldAlert className="text-lavender shrink-0" size={24} />
                        <div>
                            <h3 className="text-white font-bold text-lg">Enhanced Security Required</h3>
                            <p className="text-white/70 text-sm mt-1">Please complete your profile details and verify your mobile number to fully secure this command session.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="glass-card bg-black/40 overflow-hidden"
            >
                {/* Header Profile Block */}
                <div className="bg-black/40 border-b border-white/10 p-8 flex flex-col md:flex-row items-center gap-8 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet/20 blur-3xl rounded-full pointer-events-none"></div>

                    <div className="relative group">
                        <div className="w-[150px] h-[150px] rounded-full overflow-hidden border-4 border-white/10 shadow-[0_0_20px_rgba(138,43,226,0.3)] bg-black/50 flex items-center justify-center transition-all hover:border-lavender/50">
                            {profilePicUrl ? (
                                <img src={profilePicUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircle size={80} className="text-white/30" />
                            )}
                        </div>
                        <button className="absolute bottom-2 right-2 p-3 bg-lavender rounded-full text-black hover:bg-white transition-colors shadow-lg shadow-black/50">
                            <Camera size={18} />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left z-10 w-full relative">
                        <label className="text-xs text-white/50 uppercase tracking-widest font-mono">Image URL Payload</label>
                        <input
                            type="text"
                            placeholder="https://imgur.com/your-avatar.jpg"
                            value={profilePicUrl}
                            onChange={(e) => setProfilePicUrl(e.target.value)}
                            className="glass-input mt-2 mb-4 w-full md:w-2/3"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-white/50 uppercase tracking-widest font-mono">Verified Identity</label>
                                <div className="text-white font-bold text-xl uppercase tracking-wide mt-1">{profile.name}</div>
                            </div>
                            <div>
                                <label className="text-xs text-white/50 uppercase tracking-widest font-mono">Comm Link</label>
                                <div className="text-white/80 mt-1">{profile.email}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Settings Form */}
                <div className="p-8 space-y-8">

                    {/* Demographics & Comm */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-white/70 mb-2">Gender Classification</label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="glass-input w-full appearance-none bg-transparent"
                            >
                                <option value="" disabled className="text-black">Select Specification</option>
                                <option value="Male" className="text-black">Male</option>
                                <option value="Female" className="text-black">Female</option>
                                <option value="Other" className="text-black">Other</option>
                                <option value="Prefer Not to Say" className="text-black">Classified</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-white/70 mb-2">Secondary MFA Link (Mobile)</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                                    <input
                                        type="tel"
                                        placeholder="Mobile Number"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        className="glass-input w-full pl-10"
                                        disabled={profile.isMobileVerified}
                                    />
                                    {profile.isMobileVerified && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-green-500/20 px-2 py-1 rounded">
                                            <CheckCircle2 size={12} /> Verified
                                        </div>
                                    )}
                                </div>
                                {!profile.isMobileVerified && mobileNumber.length >= 10 && (
                                    <button
                                        onClick={handleSendOtp}
                                        className="px-4 py-2 bg-lavender/20 text-lavender hover:bg-lavender hover:text-black rounded-lg transition-colors font-medium border border-lavender/30 whitespace-nowrap"
                                    >
                                        Send OTP
                                    </button>
                                )}
                            </div>

                            {/* OTP Validation Dropdown */}
                            <AnimatePresence>
                                {otpSent && !profile.isMobileVerified && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 overflow-hidden"
                                    >
                                        <div className="bg-black/30 p-4 border border-violet/30 rounded-xl relative">
                                            <div className="absolute top-2 right-4 text-[10px] text-white/40 font-mono">*Check Node Console</div>
                                            <label className="block text-xs text-white/60 uppercase tracking-widest font-mono mb-2">Enter Transport PIN</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    maxLength="6"
                                                    placeholder="______"
                                                    value={otpCode}
                                                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                                    className="glass-input font-mono tracking-[0.5em] text-center w-32"
                                                />
                                                <button
                                                    onClick={handleVerifyOtp}
                                                    disabled={otpCode.length !== 6 || verifying}
                                                    className="flex-1 glass-button !border-green-500/50 text-green-400 hover:bg-green-500/20 disabled:opacity-50"
                                                >
                                                    {verifying ? 'Validating...' : 'Validate Link'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="h-px bg-white/10 w-full my-6"></div>

                    {/* Geolocation Architecture */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <MapPin className="text-violet" size={20} />
                            <h3 className="text-white font-bold text-lg">Physical Node Architecture</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-white/70 mb-2">Location Pincode</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                                    <input
                                        type="text"
                                        name="pincode"
                                        maxLength="6"
                                        value={address.pincode}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            handleAddressChange({ target: { name: 'pincode', value: val } });
                                        }}
                                        placeholder="6 Digits (Triggers Auto-Fill)"
                                        className="glass-input w-full pl-10"
                                    />
                                </div>
                                <span className="text-[10px] text-violet ml-2 mt-1 block">Live Geocoding Active</span>
                            </div>

                            <div>
                                <label className="block text-sm text-white/70 mb-2">Local Area / Sector</label>
                                <input
                                    type="text"
                                    name="area"
                                    value={address.area}
                                    onChange={handleAddressChange}
                                    placeholder="Sector, Street, or Tech Park"
                                    className="glass-input w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-white/70 mb-2">City / District</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={address.city}
                                    onChange={handleAddressChange}
                                    className="glass-input w-full bg-black/20"
                                    readOnly={address.city.length > 0}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-white/70 mb-2">State / Territory</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={address.state}
                                    onChange={handleAddressChange}
                                    className="glass-input w-full bg-black/20"
                                    readOnly={address.state.length > 0}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="glass-button flex items-center gap-2 px-8 shadow-[0_0_20px_rgba(230,230,250,0.2)] hover:shadow-[0_0_30px_rgba(230,230,250,0.4)]"
                        >
                            <Save size={18} />
                            {saving ? 'Syncing...' : 'Commit Protocol Update'}
                        </button>
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default ProfilePage;
