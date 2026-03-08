import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Mail, Lock, EyeOff, Eye, User } from 'lucide-react';
import api from '../api';
import { useAuth } from '../components/AuthContext';
import '../App.css';

export default function Register() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (loading) return;

        if (password !== passwordConfirm) {
            setError('Konfirmasi password tidak cocok.');
            return;
        }

        setLoading(true);
        setError('');
        setFieldErrors({});

        try {
            await api.post('/register', {
                name,
                username,
                email,
                phone_number: phoneNumber,
                password
            });

            const loginResponse = await api.post('/login', { email, password });
            login(loginResponse.data.user, loginResponse.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setFieldErrors(err.response.data.errors || {});
                setError(err.response.data.message || 'Data tidak valid.');
            } else {
                setError('Pendaftaran gagal. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container page-transition bg-slate-100 flex flex-col min-h-screen">

            {/* Top Logo and Back Button */}
            <div className="pt-14 pb-8 px-6 flex items-center justify-between relative">
                <Link to="/login" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-800 hover:bg-slate-50 transition-colors z-10 absolute left-6">
                    <ChevronLeft size={22} strokeWidth={2.5} />
                </Link>
                <div className="w-full flex justify-center">
                    <h1 className="text-xl font-medium text-slate-800 tracking-wide">Mini Wallet</h1>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="flex-1 bg-white rounded-t-[2.5rem] px-8 pt-10 pb-8 flex flex-col shadow-sm relative z-20 overflow-hidden">
                <div className="text-center mb-8 pb-2">
                    <h2 className="text-[1.7rem] font-semibold text-slate-900 leading-tight tracking-tight">Create an Account?</h2>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-500 text-sm font-medium border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="flex-1 flex flex-col gap-5 overflow-y-auto custom-scrollbar pb-6">

                    <div className="relative">
                        <label htmlFor="name" className="absolute -top-2.5 left-6 bg-white px-2 text-[11px] font-semibold text-slate-500 z-10 tracking-wide">
                            Full Name
                        </label>
                        <div className="relative flex items-center">
                            <User className="absolute left-5 text-slate-400" size={20} strokeWidth={1.5} />
                            <input
                                id="name"
                                type="text"
                                className={`w-full pl-12 pr-4 py-4.5 border rounded-full bg-transparent text-slate-900 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all placeholder:text-slate-400 font-medium ${fieldErrors.name ? 'border-red-500' : 'border-slate-200'}`}
                                placeholder="Micheal Breaks"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                        {fieldErrors.name && <p className="text-red-500 text-[10px] mt-1 ml-6">{fieldErrors.name[0]}</p>}
                    </div>

                    <div className="relative">
                        <label htmlFor="username" className="absolute -top-2.5 left-6 bg-white px-2 text-[11px] font-semibold text-slate-500 z-10 tracking-wide">
                            Username
                        </label>
                        <div className="relative flex items-center">
                            <User className="absolute left-5 text-slate-400" size={20} strokeWidth={1.5} />
                            <input
                                id="username"
                                type="text"
                                className={`w-full pl-12 pr-4 py-4.5 border rounded-full bg-transparent text-slate-900 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all placeholder:text-slate-400 font-medium ${fieldErrors.username ? 'border-red-500' : 'border-slate-200'}`}
                                placeholder="micheal_09"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                        {fieldErrors.username && <p className="text-red-500 text-[10px] mt-1 ml-6">{fieldErrors.username[0]}</p>}
                    </div>

                    <div className="relative">
                        <label htmlFor="phoneNumber" className="absolute -top-2.5 left-6 bg-white px-2 text-[11px] font-semibold text-slate-500 z-10 tracking-wide">
                            Phone Number
                        </label>
                        <div className="relative flex items-center">
                            <User className="absolute left-5 text-slate-400" size={20} strokeWidth={1.5} />
                            <input
                                id="phoneNumber"
                                type="tel"
                                className={`w-full pl-12 pr-4 py-4.5 border rounded-full bg-transparent text-slate-900 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all placeholder:text-slate-400 font-medium ${fieldErrors.phone_number ? 'border-red-500' : 'border-slate-200'}`}
                                placeholder="08123456789"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        {fieldErrors.phone_number && <p className="text-red-500 text-[10px] mt-1 ml-6">{fieldErrors.phone_number[0]}</p>}
                    </div>

                    <div className="relative">
                        <label htmlFor="email" className="absolute -top-2.5 left-6 bg-white px-2 text-[11px] font-semibold text-slate-500 z-10 tracking-wide">
                            Email
                        </label>
                        <div className="relative flex items-center">
                            <Mail className="absolute left-5 text-slate-400" size={20} strokeWidth={1.5} />
                            <input
                                id="email"
                                type="email"
                                className={`w-full pl-12 pr-4 py-4.5 border rounded-full bg-transparent text-slate-900 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all placeholder:text-slate-400 font-medium ${fieldErrors.email ? 'border-red-500' : 'border-slate-200'}`}
                                placeholder="micheal09@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                        {fieldErrors.email && <p className="text-red-500 text-[10px] mt-1 ml-6">{fieldErrors.email[0]}</p>}
                    </div>

                    <div className="relative">
                        <label htmlFor="password" className="absolute -top-2.5 left-6 bg-white px-2 text-[11px] font-semibold text-slate-500 z-10 tracking-wide">
                            Password
                        </label>
                        <div className="relative flex items-center">
                            <Lock className="absolute left-5 text-slate-400" size={20} strokeWidth={1.5} />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className={`w-full pl-12 pr-12 py-4.5 border rounded-full bg-transparent text-slate-900 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all placeholder:text-slate-400 font-medium ${fieldErrors.password ? 'border-red-500' : 'border-slate-200'}`}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                minLength={8}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-5 text-slate-400 hover:text-slate-600 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <Eye size={20} strokeWidth={1.5} /> : <EyeOff size={20} strokeWidth={1.5} />}
                            </button>
                        </div>
                        {fieldErrors.password && <p className="text-red-500 text-[10px] mt-1 ml-6">{fieldErrors.password[0]}</p>}
                    </div>

                    <div className="relative mb-2">
                        <label htmlFor="password-confirm" className="absolute -top-2.5 left-6 bg-white px-2 text-[11px] font-semibold text-slate-500 z-10 tracking-wide">
                            Password
                        </label>
                        <div className="relative flex items-center">
                            <Lock className="absolute left-5 text-slate-400" size={20} strokeWidth={1.5} />
                            <input
                                id="password-confirm"
                                type={showPasswordConfirm ? "text" : "password"}
                                className="w-full pl-12 pr-12 py-4.5 border border-slate-200 rounded-full bg-transparent text-slate-900 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all placeholder:text-slate-400 font-medium"
                                placeholder="••••••••"
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                disabled={loading}
                                minLength={8}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-5 text-slate-400 hover:text-slate-600 transition-colors"
                                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                            >
                                {showPasswordConfirm ? <Eye size={20} strokeWidth={1.5} /> : <EyeOff size={20} strokeWidth={1.5} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center mb-6 px-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#d4af37] focus:ring-[#d4af37] accent-[#d4af37] cursor-pointer" />
                            <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
                        </label>
                    </div>

                    <div className="mt-2 text-center pb-6">
                        <button
                            type="submit"
                            className="w-full py-4.5 bg-gradient-to-r from-[#fde047] via-[#d4af37] to-[#b48608] text-slate-900 rounded-full text-[15px] font-extrabold shadow-[0_8px_25px_rgba(212,175,55,0.4)] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mb-8"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Sign up'}
                        </button>



                        <span className="text-[13px] font-medium text-slate-500 block">
                            Already have an account? <Link to="/login" className="text-slate-800 font-bold ml-1 hover:text-[#d4af37] transition-colors">Login</Link>
                        </span>
                    </div>
                </form>
            </div>


        </div>
    );
}
