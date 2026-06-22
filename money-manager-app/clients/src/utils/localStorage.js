// src/utils/localStorage.js

const APP_PREFIX = 'moneyManagerApp_'; // Prefiks untuk menghindari konflik dengan kunci localStorage lain

// Fungsi untuk mendapatkan data dari localStorage
export const loadState = (key) => {
  try {
    const serializedState = localStorage.getItem(APP_PREFIX + key);
    if (serializedState === null) {
      return undefined; // Mengembalikan undefined jika tidak ada data
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Error loading state from localStorage:", err);
    return undefined;
  }
};

// Fungsi untuk menyimpan data ke localStorage
export const saveState = (key, state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(APP_PREFIX + key, serializedState);
  } catch (err) {
    console.error("Error saving state to localStorage:", err);
  }
};

// Fungsi untuk menghapus item dari localStorage
export const removeState = (key) => {
  try {
    localStorage.removeItem(APP_PREFIX + key);
  } catch (err) {
    console.error("Error removing state from localStorage:", err);
  }
};

// Fungsi untuk membersihkan semua data aplikasi dari localStorage
export const clearAllAppData = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(APP_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
    console.log("All app data cleared from localStorage.");
  } catch (err) {
    console.error("Error clearing all app data from localStorage:", err);
  }
};