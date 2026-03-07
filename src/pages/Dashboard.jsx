import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Eye, EyeOff, Landmark, Send, Wallet, Download,
    PieChart, ShoppingBag, ArrowDownToLine, Home, CreditCard,
    FileText, Settings, ArrowLeft, Scan, BarChart2
} from 'lucide-react';
import api from '../api';

export default function Dashboard() {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [user, setUser] = useState(null);

    const [topupAmount, setTopupAmount] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferTarget, setTransferTarget] = useState('');
    const [transferRef, setTransferRef] = useState('');

    const [activeView, setActiveView] = useState('home'); // home, topup, transfer, duitin, scan, statistic, profile
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showBalance, setShowBalance] = useState(true);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', username: '', email: '', phone_number: '' });
    const [profileLoading, setProfileLoading] = useState(false);

    // State untuk Pengguna Terakhir (Recent Transfers)
    const [recentTransfers, setRecentTransfers] = useState([]);
    const [loadingRecents, setLoadingRecents] = useState(false);

    useEffect(() => {
        const isAuth = localStorage.getItem('isAuthenticated');
        if (!isAuth) {
            navigate('/login');
            return;
        }

        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        fetchWalletData();
        fetchTransactions();
    }, [navigate]);

    const fetchWalletData = async () => {
        try {
            const response = await api.get('/wallet');
            setBalance(response.data.balance || 0);
        } catch (error) {
            console.error('Failed to fetch balance', error);
            if (error.response && error.response.status === 401) {
                handleLogout();
            }
        }
    };

    const fetchTransactions = async () => {
        setLoadingHistory(true);
        try {
            const response = await api.get('/transactions');
            setHistory(response.data.transactions || []);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchRecentTransfers = async () => {
        setLoadingRecents(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/recent-transfers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecentTransfers(response.data.recent_transfers);
        } catch (error) {
            console.error('Failed to fetch recent transfers', error);
        } finally {
            setLoadingRecents(false);
        }
    };


    useEffect(() => {
        if (activeView === 'transfer') {
            fetchRecentTransfers();
        }
    }, [activeView]);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            console.error('Logout error', e);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleTopup = async (e) => {
        e.preventDefault();
        if (actionLoading) return;

        const amount = parseInt(topupAmount);
        if (!amount || amount < 10000) return showMessage('Minimal Top Up adalah Rp 10.000', 'error');

        setActionLoading(true);
        try {
            await api.post('/topup', { amount });
            showMessage('Top Up Berhasil!');
            setTopupAmount('');
            setActiveView('home');
            fetchWalletData();
            fetchTransactions();
        } catch (error) {
            showMessage(error.response?.data?.message || 'Top Up gagal', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        if (actionLoading) return;

        const amount = parseInt(transferAmount);
        if (!transferTarget) return showMessage('Tujuan transfer tidak boleh kosong', 'error');
        if (!amount || amount < 10000) return showMessage('Minimal nominal transfer adalah Rp 10.000', 'error');
        if (amount > balance) return showMessage('Saldo tidak mencukupi', 'error');

        setActionLoading(true);
        try {
            await api.post('/transfer', {
                amount: amount,
                target: transferTarget,
                description: transferRef || 'Transfer Keluar'
            });
            showMessage('Transfer Berhasil!');
            setTransferAmount('');
            setTransferTarget('');
            setTransferRef('');
            setActiveView('home');
            fetchWalletData();
            fetchTransactions();
        } catch (error) {
            showMessage(error.response?.data?.message || 'Transfer gagal', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const openProfileEdit = () => {
        setProfileForm({
            name: user?.name || '',
            username: user?.username || '',
            email: user?.email || '',
            phone_number: user?.phone_number || ''
        });
        setIsEditingProfile(true);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (profileLoading) return;

        setProfileLoading(true);
        try {
            const response = await api.put('/profile', profileForm);
            showMessage('Profil berhasil diperbarui!');

            const updatedUser = response.data.user;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setIsEditingProfile(false);
        } catch (error) {
            showMessage(error.response?.data?.message || 'Gagal memperbarui profil', 'error');
        } finally {
            setProfileLoading(false);
        }
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    };

    const totalExpense = history
        .filter(item => item.type && item.type.includes('out'))
        .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const totalIncome = history
        .filter(item => item.type && (item.type.includes('in') || item.type.includes('top_up') || item.type.includes('topup')))
        .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const groupTransactionsByDate = (transactions) => {
        const groups = {};
        transactions.forEach(item => {
            const date = new Date(item.created_at || item.date);
            const dateKey = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(item);
        });
        return groups;
    };


    const renderTransactionItem = (item) => {
        const type = item.type || '';
        const isOut = type === 'transfer_out';
        const isIn = type === 'transfer_in';
        const isTopup = type === 'top_up';

        const amountPrefix = isOut ? '-' : '+';
        const date = new Date(item.created_at || item.date);

        let iconBgColor = 'bg-slate-100';
        let iconTextColor = 'text-slate-500';
        let badgeBgColor = 'bg-slate-100';
        let badgeTextColor = 'text-slate-700';
        let IconElement = <ShoppingBag size={20} />;
        let fallbackName = 'Transaksi';

        if (isTopup) {
            iconBgColor = 'bg-emerald-100';
            iconTextColor = 'text-emerald-600';
            badgeBgColor = 'bg-emerald-100';
            badgeTextColor = 'text-emerald-700';
            IconElement = <ArrowDownToLine size={20} />;
            fallbackName = 'Top Up Saldo';
        } else if (isIn) {
            iconBgColor = 'bg-blue-100';
            iconTextColor = 'text-blue-600';
            badgeBgColor = 'bg-blue-100';
            badgeTextColor = 'text-blue-700';
            IconElement = <ArrowDownToLine size={20} />;
            fallbackName = 'Transfer Masuk';
        } else if (isOut) {
            iconBgColor = 'bg-rose-100';
            iconTextColor = 'text-rose-600';
            badgeBgColor = 'bg-rose-100';
            badgeTextColor = 'text-rose-700';
            IconElement = <ShoppingBag size={20} />;
            fallbackName = 'Transfer Keluar';
        }

        const name = item.reference || item.description || fallbackName;

        return (
            <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-full ${iconBgColor} ${iconTextColor} flex items-center justify-center`}>
                        {IconElement}
                    </div>
                    <div>
                        <div className="font-semibold text-slate-900 text-[0.95rem] mb-0.5">{name}</div>
                        <div className="text-xs text-text-muted">
                            {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(',', '')}
                        </div>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                    <div className={`font-semibold text-[0.95rem] ${isOut ? 'text-slate-900' : 'text-emerald-600'}`}>
                        {amountPrefix}{formatRupiah(item.amount)}
                    </div>
                    <div className={`text-[0.7rem] font-semibold px-2.5 py-1 rounded-full ${badgeBgColor} ${badgeTextColor}`}>
                        Success
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="app-container bg-surface flex flex-col min-h-screen relative">

            {
                // TAMPILAN UTAMA DASHBOARD (HOME)
            }
            {activeView === 'home' && (
                <div className="page-transition flex flex-col min-h-screen bg-slate-900 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-white relative">

                    {
                        // Bagian Header Atas
                    }
                    <div className="px-6 pt-10 pb-6 flex justify-between items-start text-white">
                        <div>
                            <h2 className="m-0 mb-1 text-xl font-extrabold">{user?.name || 'Elliana J. Ottley'}</h2>
                            <p className="m-0 text-sm text-text-muted">
                                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="relative">
                            <div className="w-11 h-11 rounded-full bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center">
                                <User size={24} strokeWidth={2} />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-secondary flex items-center justify-center text-primary text-[10px]">✦</div>
                        </div>
                    </div>

                    {
                        // Bagian Saldo Total
                    }
                    <div className="px-6 pt-2 pb-8">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-[1.5rem] py-6 px-4 text-center shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                            <p className="text-slate-300 text-sm mb-2 font-medium tracking-wide">Total Balance</p>
                            <div className="flex justify-center items-center gap-2">
                                <h1 className="text-5xl font-extrabold m-0 tracking-tight text-white">
                                    {showBalance ? formatRupiah(balance) : '••••••••'}
                                </h1>
                                <button onClick={() => setShowBalance(!showBalance)} className="bg-transparent text-slate-400 flex items-center px-2 hover:text-white transition-colors cursor-pointer border-none">
                                    {showBalance ? <Eye size={24} strokeWidth={2} /> : <EyeOff size={24} strokeWidth={2} />}
                                </button>
                            </div>
                        </div>
                    </div>


                    <div className="px-6 flex justify-between mb-10">
                        {[
                            { id: 'withdraw', label: 'Withdraw', icon: <Landmark size={24} strokeWidth={1.5} />, action: () => alert('Fitur Withdraw segera hadir') },
                            { id: 'transfer', label: 'Transfer', icon: <Send size={24} strokeWidth={1.5} />, action: () => setActiveView('transfer') },
                            { id: 'topup', label: 'Top Up', icon: <Wallet size={24} strokeWidth={1.5} />, action: () => setActiveView('topup') },
                            { id: 'deposit', label: 'Deposit', icon: <Download size={24} strokeWidth={1.5} />, action: () => alert('Fitur Deposit segera hadir') }
                        ].map(item => (
                            <button key={item.id} onClick={item.action} className="bg-transparent flex flex-col items-center gap-2 flex-1 hover:opacity-80 transition-opacity">
                                <div className="w-[60px] h-[60px] rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-[0_8px_15px_rgba(0,0,0,0.25)] hover:bg-white/20 transition-colors">
                                    {item.icon}
                                </div>
                                <span className="text-xs font-semibold text-slate-300">{item.label}</span>
                            </button>
                        ))}
                    </div>


                    <div className="mx-6 mb-8 relative overflow-hidden rounded-2xl gold-gradient p-6 text-slate-900 shadow-[0_10px_20px_rgba(212,175,55,0.2)]">
                        <div className="relative z-10 max-w-[65%]">
                            <h3 className="text-base font-extrabold m-0 mb-2 leading-tight">Explore your financial report and see the highlights!</h3>
                            <button onClick={() => setActiveView('statistic')} className="bg-slate-900 border-none px-4 py-2.5 mt-2 rounded-xl text-white font-bold text-xs cursor-pointer shadow-[0_4px_10px_rgba(15,23,42,0.3)] transition-transform hover:-translate-y-0.5">
                                Check Now!
                            </button>
                        </div>
                        <div className="absolute -right-2 -bottom-5 text-secondary opacity-20 z-0">
                            <PieChart size={120} strokeWidth={1.5} />
                        </div>
                    </div>


                    {message.text && (
                        <div className={`mx-6 mb-6 p-4 rounded-2xl text-center text-sm font-semibold shadow-[0_4px_10px_rgba(0,0,0,0.1)] ${message.type === 'error' ? 'bg-red-100 text-danger' : 'bg-emerald-100 text-emerald-700'}`}>
                            {message.text}
                        </div>
                    )}


                    <div className="flex-1 px-6 pb-28 bg-white rounded-t-[2.5rem] pt-8 shadow-[0_-10px_25px_rgba(0,0,0,0.1)]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-extrabold text-slate-900 m-0">Transaction</h3>
                            <button onClick={() => setActiveView('statistic')} className="bg-transparent text-text-muted text-sm font-semibold hover:text-primary transition-colors cursor-pointer border-none p-0">View All</button>
                        </div>

                        {loadingHistory ? (
                            <p className="text-center text-text-muted py-4">Memuat riwayat...</p>
                        ) : history.length === 0 ? (
                            <p className="text-center text-text-muted py-4">Belum ada transaksi.</p>
                        ) : (
                            <div className="flex flex-col gap-5">
                                {history.slice(0, 5).map(renderTransactionItem)}
                            </div>
                        )}
                    </div>
                </div>
            )}


            {activeView === 'duitin' && (
                <div className="page-transition flex-1 pb-[90px] p-6 min-h-screen bg-slate-50">
                    <div className="blue-gradient rounded-3xl p-6 text-white mb-6 shadow-[0_10px_25px_rgba(15,23,42,0.4)]">
                        <div className="flex justify-between items-center mb-8">
                            <p className="m-0 font-semibold text-secondary">Digital Wallet</p>
                            <span className="bg-[rgba(212,175,55,0.2)] px-3 py-1.5 rounded-full text-sm font-bold text-secondary">Active</span>
                        </div>
                        <h2 className="m-0 mb-2 text-[2rem] font-extrabold">{showBalance ? formatRupiah(balance) : 'Rp ••••••••'}</h2>
                        <p className="m-0 opacity-80 text-sm text-slate-400">Valid Thru: 12/28</p>
                    </div>

                    <h3 className="text-xl mb-4 text-slate-900 font-extrabold">Wallet Features</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div onClick={() => alert('Fitur Virtual Card segera hadir!')} className="cursor-pointer bg-white p-5 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex flex-col items-center gap-2 transition-transform hover:-translate-y-1">
                            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-full text-secondary"><CreditCard size={24} /></div>
                            <span className="font-semibold text-sm text-slate-900">Virtual Card</span>
                        </div>
                        <div onClick={() => alert('Fitur Statements segera hadir!')} className="cursor-pointer bg-white p-5 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex flex-col items-center gap-2 transition-transform hover:-translate-y-1">
                            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-full text-secondary"><FileText size={24} /></div>
                            <span className="font-semibold text-sm text-slate-900">Statements</span>
                        </div>
                    </div>
                </div>
            )}


            {activeView === 'scan' && (
                <div className="flex-1 bg-slate-900 absolute inset-0 z-[200] flex flex-col">
                    <div className="p-6 flex justify-between items-center text-white">
                        <button onClick={() => setActiveView('home')} className="bg-white/20 border-none p-3 rounded-full text-white flex items-center justify-center hover:bg-white/30 transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <h2 className="text-xl m-0 font-bold">Scan QRIS</h2>
                        <div className="w-11"></div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <div className="w-[250px] h-[250px] border-4 border-white/50 rounded-3xl relative mb-8 overflow-hidden">

                                // Efek Animasi Scanner (Masih Demo)

                            <div className="absolute top-[10%] left-[5%] right-[5%] h-[2px] bg-emerald-500 shadow-[0_0_10px_#10B981] animate-[scan_2.5s_infinite_linear]"></div>
                            <style>{`@keyframes scan { 0% { top: 5%; } 50% { top: 95%; } 100% { top: 5%; } }`}</style>
                        </div>
                        <p className="text-white text-center text-base opacity-80 font-medium">Arahkan kamera ke kode QR / QRIS untuk membayar.</p>
                    </div>
                </div>
            )}


            {activeView === 'statistic' && (
                <div className="page-transition flex-1 pb-[90px] p-6 min-h-screen bg-slate-50">
                    <h2 className="text-2xl mb-6 text-slate-900 font-extrabold">Financial Report</h2>



                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
                            <ArrowDownToLine size={24} className="text-emerald-500 mb-3 mx-auto" />
                            <p className="text-xs text-text-muted m-0 mb-1 font-semibold">Income</p>
                            <p className="text-lg text-slate-900 m-0 font-extrabold">{formatRupiah(totalIncome)}</p>
                        </div>
                        <div className="bg-red-50 p-6 rounded-2xl text-center shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-red-100">
                            <ShoppingBag size={24} className="text-red-500 mb-3 mx-auto" />
                            <p className="text-xs text-text-muted m-0 mb-1 font-semibold">Expense</p>
                            <p className="text-lg text-slate-900 m-0 font-extrabold">{formatRupiah(totalExpense)}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] h-[400px] flex flex-col">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 m-0">Riwayat Transaksi</h3>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {loadingHistory ? (
                                <p className="text-center text-text-muted py-8 text-sm">Memuat riwayat...</p>
                            ) : history.length === 0 ? (
                                <div className="text-center py-8">
                                    <BarChart2 size={32} className="text-slate-300 mx-auto mb-2" />
                                    <p className="text-text-muted text-sm m-0">Belum ada transaksi</p>
                                </div>
                            ) : (
                                <div className="pb-4">
                                    {Object.entries(groupTransactionsByDate(history)).map(([date, items]) => (
                                        <div key={date} className="mb-6 last:mb-0">
                                            <h4 className="text-[11px] font-bold text-slate-400 mb-4 tracking-wider uppercase px-1">{date}</h4>
                                            <div className="flex flex-col gap-5">
                                                {items.map(renderTransactionItem)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            )}


            {activeView === 'profile' && (
                <div className="page-transition flex-1 pb-[90px] p-6 min-h-screen bg-slate-50">
                    <h2 className="text-2xl mb-8 text-slate-900 font-extrabold">Akun Saya</h2>

                    {isEditingProfile ? (
                        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                            <h3 className="font-bold text-lg mb-4 text-slate-900 m-0">Edit Profil</h3>
                            <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Nama Lengkap</label>
                                    <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-secondary transition-colors" required />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Username</label>
                                    <input type="text" value={profileForm.username} onChange={e => setProfileForm({ ...profileForm, username: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-secondary transition-colors" required />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email</label>
                                    <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-secondary transition-colors" required />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Nomor HP</label>
                                    <input type="tel" value={profileForm.phone_number} onChange={e => setProfileForm({ ...profileForm, phone_number: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-secondary transition-colors" />
                                </div>
                                <div className="flex gap-3 mt-2">
                                    <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm cursor-pointer hover:bg-slate-50 transition-colors">Batal</button>
                                    <button type="submit" disabled={profileLoading} className="flex-1 py-3 px-4 rounded-xl border-none gold-gradient text-primary font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50">{profileLoading ? 'Menyimpan...' : 'Simpan'}</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 pb-8 border-b border-slate-200 mb-6">
                                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 text-secondary flex items-center justify-center">
                                    <User size={32} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="m-0 mb-1 text-xl font-extrabold text-slate-900">{user?.name || 'Loading'}</h3>
                                    <p className="m-0 text-sm text-text-muted font-medium">{user?.email || 'Loading'}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div onClick={openProfileEdit} className="cursor-pointer bg-white py-4 px-5 rounded-2xl flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-transform hover:-translate-y-0.5 border border-transparent hover:border-slate-100">
                                    <Settings size={20} className="text-slate-500" />
                                    <span className="font-semibold text-slate-700 flex-1">Pengaturan Akun</span>
                                </div>
                                <div onClick={() => alert('Syarat & Ketentuan belum tersedia.')} className="cursor-pointer bg-white py-4 px-5 rounded-2xl flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-transform hover:-translate-y-0.5 border border-transparent hover:border-slate-100">
                                    <FileText size={20} className="text-slate-500" />
                                    <span className="font-semibold text-slate-700 flex-1">Syarat & Ketentuan</span>
                                </div>
                                <button onClick={handleLogout} className="bg-red-50 border-none py-4 px-5 rounded-2xl flex items-center gap-4 text-left w-full cursor-pointer mt-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors hover:bg-red-100">
                                    <ArrowLeft size={20} className="text-red-500" />
                                    <span className="font-bold text-red-500 flex-1">Logout Keluar</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}


            {activeView !== 'scan' && (
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[80px] flex justify-center items-end z-[100]">

                    <svg width="100%" height="100%" viewBox="0 0 375 80" preserveAspectRatio="none" className="absolute bottom-0 left-0 drop-shadow-[0px_-5px_20px_rgba(0,0,0,0.3)] -z-10">
                        <defs>
                            <linearGradient id="navGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#1e293b" /> {/* slate-800 */}
                                <stop offset="100%" stopColor="#0f172a" /> {/* slate-900 */}
                            </linearGradient>
                        </defs>
                        <path d="M0,20 C0,9 9,0 20,0 L135,0 C145,0 152,15 160,25 C170,38 180,45 187.5,45 C195,45 205,38 215,25 C223,15 230,0 240,0 L355,0 C366,0 375,9 375,20 L375,80 L0,80 Z" fill="url(#navGradient)" />
                    </svg>

                    <div className="w-full flex justify-between px-4 relative h-full items-center">
                        <button onClick={() => setActiveView('home')} className={`bg-transparent border-none flex flex-col items-center gap-1.5 flex-1 pb-2 transition-colors cursor-pointer ${activeView === 'home' || activeView === 'topup' || activeView === 'transfer' ? 'text-secondary' : 'text-slate-400 hover:text-slate-300'}`}>
                            <Home size={24} strokeWidth={activeView === 'home' ? 3 : 2} />
                            <span className="text-[0.75rem] font-extrabold">Home</span>
                        </button>
                        <button onClick={() => setActiveView('duitin')} className={`bg-transparent border-none flex flex-col items-center gap-1.5 flex-1 pb-2 transition-colors cursor-pointer ${activeView === 'duitin' ? 'text-secondary' : 'text-slate-400 hover:text-slate-300'}`}>
                            <Wallet size={24} strokeWidth={activeView === 'duitin' ? 3 : 2} />
                            <span className="text-[0.75rem] font-extrabold">Duitin</span>
                        </button>

                        <div className="flex-1 flex justify-center relative">
                            <button onClick={() => setActiveView('scan')} className="absolute bottom-5 w-16 h-16 rounded-full gold-gradient text-primary flex items-center justify-center border-none shadow-[0_8px_15px_rgba(212,175,55,0.3)] z-10 cursor-pointer transition-transform hover:scale-105 hover:-translate-y-1">
                                <Scan size={28} strokeWidth={2.5} />
                            </button>
                        </div>

                        <button onClick={() => setActiveView('statistic')} className={`bg-transparent border-none flex flex-col items-center gap-1.5 flex-1 pb-2 transition-colors cursor-pointer ${activeView === 'statistic' ? 'text-secondary' : 'text-slate-400 hover:text-slate-300'}`}>
                            <BarChart2 size={24} strokeWidth={activeView === 'statistic' ? 3 : 2} />
                            <span className="text-[0.75rem] font-extrabold">Statistic</span>
                        </button>
                        <button onClick={() => setActiveView('profile')} className={`bg-transparent border-none flex flex-col items-center gap-1.5 flex-1 pb-2 transition-colors cursor-pointer ${activeView === 'profile' ? 'text-secondary' : 'text-slate-400 hover:text-slate-300'}`}>
                            <User size={24} strokeWidth={activeView === 'profile' ? 3 : 2} />
                            <span className="text-[0.75rem] font-extrabold">Profile</span>
                        </button>
                    </div>
                </div>
            )}




            {
                activeView === 'topup' && (
                    <div className="page-transition flex flex-col min-h-screen bg-slate-50 relative z-[110]">
                        <div className="blue-gradient pt-10 pb-6 px-6 flex items-center gap-4 text-secondary rounded-b-3xl shadow-[0_4px_15px_rgba(15,23,42,0.2)]">
                            <button onClick={() => setActiveView('home')} className="bg-transparent text-secondary flex items-center hover:opacity-80 transition-opacity p-0"><ArrowLeft size={28} strokeWidth={2} /></button>
                            <h2 className="text-xl font-bold m-0 text-white">Top Up Saldo</h2>
                        </div>

                        <div className="p-6 flex-1">
                            <div className="bg-white rounded-3xl p-8 mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-center">
                                <p className="text-[0.95rem] text-text-muted mb-2 font-semibold">Saldo Saat Ini</p>
                                <h3 className="text-4xl m-0 text-slate-900 font-extrabold tracking-tight">{formatRupiah(balance)}</h3>
                            </div>

                            {message.text && (
                                <div className={`mb-6 p-4 rounded-2xl text-center text-sm font-semibold ${message.type === 'error' ? 'bg-red-100 text-danger' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleTopup} className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                                <div className="form-group mb-10">
                                    <label className="form-label font-bold text-slate-900 mb-4 block">Nominal Top Up</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-extrabold text-secondary text-xl">Rp</span>
                                        <input
                                            type="number"
                                            className="form-input pl-14 text-2xl font-extrabold h-16 rounded-2xl bg-slate-50 border border-slate-200 text-primary w-full transition-colors focus:border-secondary focus:ring-4 focus:ring-slate-100"
                                            placeholder="0"
                                            value={topupAmount}
                                            onChange={(e) => setTopupAmount(e.target.value)}
                                            disabled={actionLoading}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary w-full p-4.5 text-lg rounded-2xl gold-gradient text-primary border-none font-extrabold shadow-[0_4px_15px_rgba(212,175,55,0.4)] transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed" disabled={actionLoading}>
                                    {actionLoading ? 'Memproses...' : 'Konfirmasi Top Up'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }





            {
                activeView === 'transfer' && (
                    <div className="page-transition flex flex-col min-h-screen bg-slate-50 relative z-[110]">
                        <div className="blue-gradient pt-10 pb-6 px-6 flex items-center gap-4 text-secondary rounded-b-3xl shadow-[0_4px_15px_rgba(15,23,42,0.2)]">
                            <button onClick={() => setActiveView('home')} className="bg-transparent text-secondary flex items-center hover:opacity-80 transition-opacity p-0"><ArrowLeft size={28} strokeWidth={2} /></button>
                            <h2 className="text-xl font-bold m-0 text-white">Transfer Dana</h2>
                        </div>

                        <div className="p-6 flex-1">
                            <div className="bg-white rounded-3xl p-6 mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex justify-between items-center">
                                <p className="text-[0.95rem] text-text-muted m-0 font-semibold">Saldo Tunai</p>
                                <h3 className="text-2xl m-0 text-primary font-extrabold tracking-tight">{formatRupiah(balance)}</h3>
                            </div>

                            {message.text && (
                                <div className={`mb-6 p-4 rounded-2xl text-center text-sm font-semibold ${message.type === 'error' ? 'bg-red-100 text-danger' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleTransfer} className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                             
                                <div className="mb-8">
                                    <h4 className="text-sm font-bold text-slate-900 mb-4 tracking-wide">Pernah Transfer Ke</h4>
                                    {loadingRecents ? (
                                        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="flex flex-col items-center gap-2 min-w-[70px] animate-pulse">
                                                    <div className="w-14 h-14 rounded-full bg-slate-200"></div>
                                                    <div className="w-12 h-3 bg-slate-200 rounded"></div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : recentTransfers.length > 0 ? (
                                        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                            {recentTransfers.map((recentUser) => (
                                                <div
                                                    key={recentUser.id}
                                                    onClick={() => setTransferTarget(recentUser.phone_number || recentUser.email)}
                                                    className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group"
                                                >
                                                    <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-secondary font-bold text-lg transition-transform group-hover:-translate-y-1 group-hover:border-secondary group-hover:shadow-[0_4px_10px_rgba(212,175,55,0.2)]">
                                                        {recentUser.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-600 truncate w-full text-center group-hover:text-primary transition-colors">
                                                        {recentUser.name.split(' ')[0]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 italic">Belum ada riwayat transfer sebelumnya.</p>
                                    )}
                                </div>

                                <div className="form-group mb-6">
                                    <label className="form-label font-bold text-slate-900 mb-3 block">Tujuan Transfer</label>
                                    <input
                                        type="text"
                                        className="form-input w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 font-medium transition-colors focus:border-secondary focus:ring-4 focus:ring-slate-100"
                                        placeholder="Email atau No. HP Penerima"
                                        value={transferTarget}
                                        onChange={(e) => setTransferTarget(e.target.value)}
                                        disabled={actionLoading}
                                    />
                                </div>

                                <div className="form-group mb-6">
                                    <label className="form-label font-bold text-slate-900 mb-3 block">Nominal</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-secondary text-lg">Rp</span>
                                        <input
                                            type="number"
                                            className="form-input pl-12 text-xl font-bold rounded-2xl bg-slate-50 border border-slate-200 h-14 text-primary w-full transition-colors focus:border-secondary focus:ring-4 focus:ring-slate-100"
                                            placeholder="0"
                                            value={transferAmount}
                                            onChange={(e) => setTransferAmount(e.target.value)}
                                            disabled={actionLoading}
                                        />
                                    </div>
                                </div>

                                <div className="form-group mb-10">
                                    <label className="form-label font-bold text-slate-900 mb-3 block">Catatan</label>
                                    <input
                                        type="text"
                                        className="form-input w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 font-medium text-primary transition-colors focus:border-secondary focus:ring-4 focus:ring-slate-100"
                                        placeholder="Cth: Bayar hutang (Opsional)"
                                        value={transferRef}
                                        onChange={(e) => setTransferRef(e.target.value)}
                                        disabled={actionLoading}
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary w-full p-4.5 text-lg rounded-2xl gold-gradient text-primary border-none font-extrabold shadow-[0_4px_15px_rgba(212,175,55,0.4)] transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed" disabled={actionLoading}>
                                    {actionLoading ? 'Memproses...' : 'Kirim Dana Sekarang'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

        </div >
    );
}
