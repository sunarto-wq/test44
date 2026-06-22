// src/App.jsx

import React, { useState, useEffect } from 'react';
import { loadState, saveState, clearAllAppData } from './utils/localStorage';
import { v4 as uuidv4 } from 'uuid'; // Untuk menghasilkan ID unik
import * as XLSX from 'xlsx'; // Untuk ekspor Excel

function App() {
  // State untuk menyimpan daftar pengeluaran
  const [expenses, setExpenses] = useState(() => {
    // Memuat pengeluaran dari localStorage saat inisialisasi
    return loadState('expenses') || [];
  });

  // State untuk menyimpan batas anggaran harian dan bulanan
  const [budgetLimits, setBudgetLimits] = useState(() => {
    // Memuat batas anggaran dari localStorage saat inisialisasi
    return loadState('budgetLimits') || { dailyLimit: 0, monthlyLimit: 0 };
  });

  // State untuk input form pengeluaran baru
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
  });

  // State untuk input form pengaturan batas anggaran
  const [newLimits, setNewLimits] = useState({
    dailyLimit: budgetLimits.dailyLimit,
    monthlyLimit: budgetLimits.monthlyLimit
  });

  // Efek samping untuk menyimpan expenses ke localStorage setiap kali expenses berubah
  useEffect(() => {
    saveState('expenses', expenses);
  }, [expenses]);

  // Efek samping untuk menyimpan budgetLimits ke localStorage setiap kali budgetLimits berubah
  useEffect(() => {
    saveState('budgetLimits', budgetLimits);
  }, [budgetLimits]);

  // Handler untuk perubahan input form pengeluaran
  const handleExpenseInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({ ...newExpense, [name]: value });
  };

  // Handler untuk perubahan input form batas anggaran
  const handleLimitInputChange = (e) => {
    const { name, value } = e.target;
    setNewLimits({ ...newLimits, [name]: parseFloat(value) || 0 });
  };

  // Handler untuk menambah pengeluaran baru
  const addExpense = (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.category) {
      alert('Mohon lengkapi semua field pengeluaran.');
      return;
    }
    const expenseToAdd = {
      id: uuidv4(), // ID unik untuk setiap pengeluaran
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date,
      createdAt: new Date().toISOString()
    };
    setExpenses([...expenses, expenseToAdd]);
    // Reset form
    setNewExpense({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Handler untuk menghapus pengeluaran
  const deleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  // Handler untuk mengatur batas anggaran
  const setLimits = (e) => {
    e.preventDefault();
    setBudgetLimits(newLimits);
    alert('Batas anggaran berhasil diperbarui!');
  };

  // Hitung total pengeluaran harian dan bulanan
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const totalDailyExpense = expenses
    .filter(exp => exp.date === today)
    .reduce((sum, exp) => sum + exp.amount, 0);

  const totalMonthlyExpense = expenses
    .filter(exp => exp.date.startsWith(thisMonth))
    .reduce((sum, exp) => sum + exp.amount, 0);

  // Fungsi Ekspor Excel (Sisi Klien)
  const exportToExcel = () => {
    if (expenses.length === 0) {
      alert('Tidak ada data pengeluaran untuk diekspor.');
      return;
    }

    const dataToExport = expenses.map(exp => ({
      ID: exp.id,
      Deskripsi: exp.description,
      Jumlah: exp.amount,
      Kategori: exp.category,
      Tanggal: new Date(exp.date).toLocaleDateString('id-ID')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pengeluaran');

    XLSX.writeFile(workbook, 'pengeluaran_money_manager.xlsx');
  };

  const handleClearAllData = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua data pengeluaran dan batas anggaran? Tindakan ini tidak dapat dibatalkan.")) {
      clearAllAppData(); // Hapus dari localStorage
      setExpenses([]); // Reset state
      setBudgetLimits({ dailyLimit: 0, monthlyLimit: 0 }); // Reset state
      setNewLimits({ dailyLimit: 0, monthlyLimit: 0 }); // Reset form
      alert("Semua data berhasil dihapus!");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        <header className="bg-gray-800 text-white p-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">💰 Money Manager (Client-Side)</h1>
          <p className="text-sm sm:text-base text-gray-300">Data Anda tersimpan lokal di browser ini dan dapat diinstal!</p>
        </header>

        {/* Ringkasan Batas & Pengeluaran */}
        <section className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-center">Ringkasan Keuangan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="bg-blue-100 p-4 rounded-lg shadow-md">
              <p className="text-md font-semibold">Batas Harian: <span className="font-bold text-blue-700">Rp {budgetLimits.dailyLimit.toLocaleString('id-ID')}</span></p>
              <p className={`text-md font-semibold ${totalDailyExpense > budgetLimits.dailyLimit && budgetLimits.dailyLimit > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                Pengeluaran Hari Ini: <span className="font-bold">Rp {totalDailyExpense.toLocaleString('id-ID')}</span>
              </p>
              {budgetLimits.dailyLimit > 0 && (
                 <p className="text-sm text-gray-600">Sisa: Rp {(budgetLimits.dailyLimit - totalDailyExpense).toLocaleString('id-ID')}</p>
              )}
            </div>
            <div className="bg-green-100 p-4 rounded-lg shadow-md">
              <p className="text-md font-semibold">Batas Bulanan: <span className="font-bold text-green-700">Rp {budgetLimits.monthlyLimit.toLocaleString('id-ID')}</span></p>
              <p className={`text-md font-semibold ${totalMonthlyExpense > budgetLimits.monthlyLimit && budgetLimits.monthlyLimit > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                Pengeluaran Bulan Ini: <span className="font-bold">Rp {totalMonthlyExpense.toLocaleString('id-ID')}</span>
              </p>
              {budgetLimits.monthlyLimit > 0 && (
                <p className="text-sm text-gray-600">Sisa: Rp {(budgetLimits.monthlyLimit - totalMonthlyExpense).toLocaleString('id-ID')}</p>
              )}
            </div>
          </div>
        </section>

        {/* Form Tambah Pengeluaran */}
        <section className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Tambah Pengeluaran Baru</h2>
          <form onSubmit={addExpense} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi</label>
              <input
                type="text"
                id="description"
                name="description"
                value={newExpense.description}
                onChange={handleExpenseInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="Mis: Beli kopi"
                required
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={newExpense.amount}
                onChange={handleExpenseInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="50000"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Kategori</label>
              <input
                type="text"
                id="category"
                name="category"
                value={newExpense.category}
                onChange={handleExpenseInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                placeholder="Mis: Makanan, Transportasi"
                required
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Tanggal</label>
              <input
                type="date"
                id="date"
                name="date"
                value={newExpense.date}
                onChange={handleExpenseInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300"
              >
                Tambah Pengeluaran
              </button>
            </div>
          </form>
        </section>

        {/* Form Atur Batas Anggaran */}
        <section className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Atur Batas Anggaran</h2>
          <form onSubmit={setLimits} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dailyLimit" className="block text-sm font-medium text-gray-700">Batas Harian (Rp)</label>
              <input
                type="number"
                id="dailyLimit"
                name="dailyLimit"
                value={newLimits.dailyLimit}
                onChange={handleLimitInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="monthlyLimit" className="block text-sm font-medium text-gray-700">Batas Bulanan (Rp)</label>
              <input
                type="number"
                id="monthlyLimit"
                name="monthlyLimit"
                value={newLimits.monthlyLimit}
                onChange={handleLimitInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300"
              >
                Simpan Batas Anggaran
              </button>
            </div>
          </form>
        </section>

        {/* Daftar Pengeluaran */}
        <section className="p-6">
          <h2 className="text-2xl font-bold mb-4">Daftar Pengeluaran</h2>
          {expenses.length === 0 ? (
            <p className="text-gray-600 italic text-center">Belum ada pengeluaran dicatat.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Deskripsi</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Jumlah</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Kategori</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Tanggal</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.slice().reverse().map((expense) => ( // Tampilkan yang terbaru di atas
                    <tr key={expense.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-800">{expense.description}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">Rp {expense.amount.toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{expense.category}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{new Date(expense.date).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-full transition duration-300"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Tombol Aksi Tambahan */}
        <section className="p-6 border-t border-gray-200 bg-gray-50 flex flex-wrap justify-center gap-4">
            <button
              onClick={exportToExcel}
              className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Export ke Excel
            </button>
            <button
              onClick={handleClearAllData}
              className="flex items-center bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300"
            >
             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              Hapus Semua Data
            </button>
        </section>

        <footer className="bg-gray-800 text-white p-4 text-center text-sm">
          Aplikasi Dibuat dengan ❤️ Menggunakan React & Tailwind CSS
        </footer>
      </div>
    </div>
  );
}

export default App;