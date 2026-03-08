import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, EyeOff, Eye } from 'lucide-react';
import api from '../api';
import { useAuth } from '../components/AuthContext';
import '../App.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError('');
        setFieldErrors({});

        try {
            const response = await api.post('/login', { email, password });
            login(response.data.user, response.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setFieldErrors(err.response.data.errors || {});
                setError(err.response.data.message || 'Validation failed.');
            } else if (err.response && err.response.status === 401) {
                setError('Email atau password salah.');
            } else {
                setError('Koneksi ke server gagal. Pastikan backend berjalan.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container page-transition bg-slate-100 flex flex-col min-h-screen">

            {/* Top Logo */}
            <div className="pt-14 pb-8 flex justify-center items-center">
                <h1 className="text-xl font-medium text-slate-800 tracking-wide">Mini Wallet</h1>
            </div>

            {/* Main Content Card */}
            <div className="flex-1 bg-white rounded-t-[2.5rem] px-8 pt-10 pb-8 flex flex-col shadow-sm relative z-20">
                <div className="text-center mb-8 pb-2">
                    <h2 className="text-[1.7rem] font-semibold text-slate-900 mb-1 leading-tight tracking-tight">Welcome to Mini Wallet</h2>
                    <h2 className="text-[1.7rem] font-semibold text-slate-900 leading-tight tracking-tight">Login now!</h2>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-500 text-sm font-medium border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex-1 flex flex-col">
                    <div className="relative mb-6">
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

                    <div className="relative mb-5">
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

                    <div className="flex justify-between items-center mb-8 px-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#d4af37] focus:ring-[#d4af37] accent-[#d4af37] cursor-pointer" />
                            <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
                        </label>
                        <Link to="#" className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4.5 bg-gradient-to-r from-[#fde047] via-[#d4af37] to-[#b48608] text-slate-900 rounded-full text-[15px] font-extrabold shadow-[0_8px_25px_rgba(212,175,55,0.4)] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Login'}
                    </button>



                    <div className="mt-auto pt-0 text-center">
                        <span className="text-[13px] font-medium text-slate-500">
                            Didn't have an account? <Link to="/register" className="text-slate-800 font-bold ml-1 hover:text-[#d4af37] transition-colors">Create an account</Link>
                        </span>
                    </div>
                </form>
            </div>


        </div>
    );
}
