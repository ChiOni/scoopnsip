import { useState, useEffect } from 'react';
import useWineStore from './store/wineStore';
import useFilterStore from './store/filterStore';
import WorldMap from './components/Map/WorldMap';
import FilterPanel from './components/Filter/FilterPanel';
import { COUNTRIES, PASSWORD_HASH } from './lib/constants';
import { sha256 } from './lib/utils';
import { analyzeWine } from './features/wine-analysis/api';

function App() {
  // Zustand stores
  const { wines, loading, saving, loadWines, addWine, updateWine, deleteWine: deleteWineStore } = useWineStore();
  const { showFilterPanel, toggleFilterPanel, applyFilters, hasActiveFilters } = useFilterStore();

  // Local UI state
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedWine, setSelectedWine] = useState(null);
  const [drawerView, setDrawerView] = useState('list');
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editWine, setEditWine] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  // New wine form state
  const [newWine, setNewWine] = useState({
    date: '',
    name: '',
    image: null,
    imagePreview: null,
    winery: '',
    wineryInfo: '',
    country: '',
    sweetness: 3,
    acidity: 3,
    body: 3,
    description: '',
    reviews: '',
    price: '',
    inStock: true
  });

  // Load wines on mount
  useEffect(() => {
    loadWines();
  }, [loadWines]);

  // Event Handlers
  function handleCountryClick(countryKey) {
    setSelectedCountry(countryKey);
    setDrawerView('list');
    setIsAuthenticated(false);
    setPasswordInput('');
  }

  function closeDrawer() {
    setSelectedCountry(null);
    setSelectedWine(null);
    setDrawerView('list');
    setPasswordInput('');
  }

  async function handlePasswordSubmit() {
    const inputHash = await sha256(passwordInput);
    if (inputHash === PASSWORD_HASH) {
      setIsAuthenticated(true);
      setDrawerView('create');
      setPasswordInput('');
      setNewWine({
        ...newWine,
        country: selectedCountry
      });
    } else {
      alert('비밀번호가 올바르지 않습니다.');
      setPasswordInput('');
    }
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max size 800px
          const maxSize = 800;
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG with 0.8 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setNewWine({
            ...newWine,
            image: compressedDataUrl,
            imagePreview: compressedDataUrl
          });

          console.log('이미지 압축 완료:', {
            원본크기: file.size,
            압축후크기: Math.round(compressedDataUrl.length * 0.75),
            해상도: `${width}x${height}`
          });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleAIAutoFill() {
    if (!newWine.name) {
      alert('먼저 와인 이름을 입력해주세요!');
      return;
    }

    const apiKey = localStorage.getItem('claude_api_key');
    if (!apiKey) {
      alert('먼저 Claude API 키를 설정해주세요!');
      setShowApiKeyModal(true);
      return;
    }

    setAiLoading(true);
    try {
      const wineData = await analyzeWine({
        image: newWine.image ? newWine.image.split(',')[1] : null,
        wineName: newWine.name,
        reviews: newWine.reviews,
        apiKey: apiKey
      });

      console.log('AI Response:', wineData);
      console.log('Current newWine state:', newWine);

      const updatedWine = {
        ...newWine,
        name: wineData.name || newWine.name,
        winery: wineData.winery || newWine.winery,
        wineryInfo: wineData.wineryInfo || newWine.wineryInfo,
        // country는 사용자가 선택한 값 유지 (AI 결과로 덮어쓰지 않음)
        country: newWine.country,
        sweetness: wineData.sweetness || newWine.sweetness,
        acidity: wineData.acidity || newWine.acidity,
        body: wineData.body || newWine.body,
        description: wineData.description || newWine.description
      };

      console.log('Updated wine data:', updatedWine);
      setNewWine(updatedWine);

      alert('AI 분석 완료! 정보를 확인하고 필요시 수정해주세요.');
    } catch (error) {
      console.error('AI 분석 오류:', error);
      alert(`AI 분석에 실패했습니다.\n\n오류: ${error.message}\n\nF12를 눌러 콘솔을 확인하거나 수동으로 입력해주세요.`);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleCreateWine() {
    if (!newWine.name || !newWine.winery) {
      alert('와인 이름과 와이너리 이름은 필수입니다.');
      return;
    }

    try {
      const wine = {
        date: newWine.date || null,
        name: newWine.name,
        image: newWine.image || null,
        winery: newWine.winery,
        wineryInfo: newWine.wineryInfo,
        country: newWine.country,
        sweetness: newWine.sweetness,
        acidity: newWine.acidity,
        body: newWine.body,
        description: newWine.description,
        reviews: newWine.reviews,
        price: newWine.price || null,
        inStock: newWine.inStock,
        timestamp: Date.now()
      };

      await addWine(wine);

      setNewWine({
        date: '',
        name: '',
        image: null,
        imagePreview: null,
        winery: '',
        wineryInfo: '',
        country: '',
        sweetness: 3,
        acidity: 3,
        body: 3,
        description: '',
        reviews: '',
        price: '',
        inStock: true
      });
      setPasswordInput('');
      setIsAuthenticated(false);
      setDrawerView('list');

      alert('와인이 성공적으로 저장되었습니다! 🍷');
    } catch (error) {
      console.error('Error:', error);
      alert('저장에 실패했습니다: ' + error.message);
    }
  }

  async function handleEditWine() {
    if (!editWine.name || !editWine.image || !editWine.winery) {
      alert('와인 이름, 사진, 와이너리 이름은 필수입니다.');
      return;
    }

    try {
      const updatedWine = {
        date: editWine.date,
        name: editWine.name,
        image: editWine.image,
        winery: editWine.winery,
        wineryInfo: editWine.wineryInfo,
        country: editWine.country,
        sweetness: editWine.sweetness,
        acidity: editWine.acidity,
        body: editWine.body,
        description: editWine.description,
        reviews: editWine.reviews,
        price: editWine.price || null,
        inStock: editWine.inStock !== undefined ? editWine.inStock : true,
        timestamp: editWine.timestamp
      };

      await updateWine(editWine.id, updatedWine);

      // Optimistic UI update - update selectedWine immediately
      setSelectedWine({ ...editWine, ...updatedWine });

      setEditWine(null);
      setPasswordInput('');
      setDrawerView('detail');

      alert('와인이 성공적으로 수정되었습니다!');
    } catch (error) {
      console.error('Error:', error);
      alert('수정에 실패했습니다: ' + error.message);
    }
  }

  async function handleDeleteWine() {
    if (!confirm('정말로 이 와인을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteWineStore(selectedWine.id);

      setSelectedWine(null);
      setPasswordInput('');
      setDrawerView('list');

      alert('와인이 성공적으로 삭제되었습니다!');
    } catch (error) {
      console.error('Error:', error);
      alert('삭제에 실패했습니다: ' + error.message);
    }
  }

  function handleImageUploadForEdit(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const maxSize = 800;
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setEditWine({ ...editWine, image: compressedDataUrl });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Apply filters
  const filteredWines = applyFilters(wines);
  const countryWines = filteredWines
    .filter(w => w.country === selectedCountry)
    .sort((a, b) => b.timestamp - a.timestamp);

  // Loading screen
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🍷</div>
          <p className="text-gray-400 text-sm font-light">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="favicon.jpg" alt="Scoop&sip Logo" className="w-12 h-12 rounded-lg" />
            <div>
              <h1 className="font-serif text-2xl font-bold text-gray-900">SCOOPNSIP</h1>
              <p className="text-xs text-gray-500 mt-1">Wine Journey Around The World</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFilterPanel}
              className="p-2 rounded-full hover:bg-gray-100 transition relative"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {hasActiveFilters() && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-purple-600 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* World Map */}
      <div className="w-full h-full pt-16 pb-4 px-4 flex items-center justify-center">
        <div className="relative w-full h-full max-w-none">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/2560px-World_map_-_low_resolution.svg.png"
            alt="World Map"
            className="w-full h-full absolute inset-0 object-contain opacity-20"
            style={{ filter: 'grayscale(100%)' }}
          />

          {Object.entries(COUNTRIES).map(([key, country]) => {
            const wineCount = filteredWines.filter(w => w.country === key).length;
            return (
              <div
                key={key}
                className="country-marker absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${country.x}%`, top: `${country.y}%` }}
                onClick={() => handleCountryClick(key)}
              >
                <div className="relative">
                  <div
                    className="w-6 h-6 rounded-full shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: country.color }}
                  >
                    {wineCount > 0 && <span className="text-white text-xs font-bold">{wineCount}</span>}
                  </div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs font-medium text-gray-700 bg-white/90 px-2 py-1 rounded shadow">
                      {country.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drawer */}
      {selectedCountry && (
        <>
          <div className="fixed inset-0 bg-black/30 z-30 fade-in" onClick={closeDrawer} />

          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-40 drawer scale-in overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <button
                onClick={() => {
                  if (drawerView === 'detail' || drawerView === 'password' || drawerView === 'create' || drawerView === 'edit' || drawerView === 'delete-password' || drawerView === 'edit-password') {
                    setDrawerView('list');
                    setSelectedWine(null);
                    setEditWine(null);
                    setPasswordInput('');
                    // Reset form
                    setNewWine({
                      date: new Date().toISOString().split('T')[0],
                      name: '',
                      image: null,
                      imagePreview: null,
                      winery: '',
                      wineryInfo: '',
                      country: '',
                      sweetness: 3,
                      acidity: 3,
                      body: 3,
                      description: '',
                      reviews: '',
                      price: '',
                      inStock: true
                    });
                  } else {
                    closeDrawer();
                  }
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="font-serif text-xl font-semibold text-gray-900">{COUNTRIES[selectedCountry].name}</h2>
              {drawerView === 'list' && (
                <button
                  onClick={() => setDrawerView('password')}
                  className="text-gray-600 hover:text-gray-900 active:scale-95 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
              {drawerView !== 'list' && <div className="w-6" />}
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* List View */}
              {drawerView === 'list' && (
                <div>
                  {countryWines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6">
                      <div className="text-6xl mb-4 opacity-20">🍷</div>
                      <p className="text-gray-400 text-sm">아직 와인이 없습니다</p>
                    </div>
                  ) : (
                    countryWines.map(wine => (
                      <div
                        key={wine.id}
                        className="wine-card cursor-pointer"
                        onClick={() => {
                          setSelectedWine(wine);
                          setDrawerView('detail');
                        }}
                      >
                        <div className="flex items-center p-4 gap-4">
                          <img src={wine.image} alt={wine.name} className="w-16 h-16 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-1">{wine.date}</p>
                            <h3 className="font-medium text-gray-900 truncate">{wine.name}</h3>
                            <p className="text-sm text-gray-600 truncate">{wine.winery}</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Password View */}
              {drawerView === 'password' && (
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  <div className="w-full max-w-xs">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">비밀번호 입력</h3>
                    <p className="text-sm text-gray-500 mb-6 text-center">관리자만 와인을 추가할 수 있습니다</p>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                      placeholder="6자리 비밀번호"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={handlePasswordSubmit}
                      className="w-full mt-4 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
                    >
                      확인
                    </button>
                    <button
                      onClick={() => setDrawerView('list')}
                      className="w-full mt-2 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}

              {/* Create View */}
              {drawerView === 'create' && (
                <div className="p-6 space-y-6">
                  <h3 className="font-serif text-xl font-semibold text-gray-900">새 와인 추가</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">판매 일자 *</label>
                    <input
                      type="date"
                      value={newWine.date}
                      onChange={(e) => setNewWine({ ...newWine, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">와인 사진 *</label>
                    {newWine.imagePreview ? (
                      <div className="relative">
                        <img src={newWine.imagePreview} alt="Preview" className="w-full rounded-lg" style={{ aspectRatio: '1' }} />
                        <button
                          onClick={() => setNewWine({ ...newWine, image: null, imagePreview: null })}
                          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition" style={{ aspectRatio: '1' }}>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-sm">사진 업로드</span>
                        </div>
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">와인 이름 *</label>
                    <input
                      type="text"
                      value={newWine.name}
                      onChange={(e) => setNewWine({ ...newWine, name: e.target.value })}
                      placeholder="예: Château Margaux 2015"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {newWine.imagePreview && newWine.name && (
                    <button
                      onClick={handleAIAutoFill}
                      disabled={aiLoading}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {aiLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>AI 분석 중...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>AI 자동 완성</span>
                        </>
                      )}
                    </button>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">와이너리 이름 *</label>
                    <input
                      type="text"
                      value={newWine.winery}
                      onChange={(e) => setNewWine({ ...newWine, winery: e.target.value })}
                      placeholder="예: Château Margaux"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">와이너리 정보</label>
                    <textarea
                      value={newWine.wineryInfo}
                      onChange={(e) => setNewWine({ ...newWine, wineryInfo: e.target.value })}
                      placeholder="와이너리의 역사, 특징 등"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">당도: {newWine.sweetness}</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={newWine.sweetness}
                      onChange={(e) => setNewWine({ ...newWine, sweetness: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">산도: {newWine.acidity}</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={newWine.acidity}
                      onChange={(e) => setNewWine({ ...newWine, acidity: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">바디: {newWine.body}</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={newWine.body}
                      onChange={(e) => setNewWine({ ...newWine, body: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">와인 설명</label>
                    <textarea
                      value={newWine.description}
                      onChange={(e) => setNewWine({ ...newWine, description: e.target.value })}
                      placeholder="와인의 특징, 향, 맛 등"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">고객 후기</label>
                    <textarea
                      value={newWine.reviews}
                      onChange={(e) => setNewWine({ ...newWine, reviews: e.target.value })}
                      placeholder="고객들의 감상"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">가격 (원)</label>
                      <input
                        type="number"
                        value={newWine.price}
                        onChange={(e) => setNewWine({ ...newWine, price: e.target.value })}
                        placeholder="예: 45000"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">재고 여부</label>
                      <select
                        value={newWine.inStock}
                        onChange={(e) => setNewWine({ ...newWine, inStock: e.target.value === 'true' })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="true">재고 있음</option>
                        <option value="false">품절</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setDrawerView('list');
                        setNewWine({
                          date: new Date().toISOString().split('T')[0],
                          name: '',
                          image: null,
                          imagePreview: null,
                          winery: '',
                          wineryInfo: '',
                          country: '',
                          sweetness: 3,
                          acidity: 3,
                          body: 3,
                          description: '',
                          reviews: '',
                          price: '',
                          inStock: true
                        });
                      }}
                      disabled={saving}
                      className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleCreateWine}
                      disabled={saving}
                      className="flex-1 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>저장 중...</span>
                        </>
                      ) : '저장'}
                    </button>
                  </div>
                </div>
              )}

              {/* Edit View */}
              {drawerView === 'edit' && editWine && (
                <div className="p-6 space-y-6">
                  <h3 className="font-serif text-xl font-semibold text-gray-900">와인 수정</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">판매 일자 *</label>
                    <input
                      type="date"
                      value={editWine.date}
                      onChange={(e) => setEditWine({ ...editWine, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">와인 사진 *</label>
                    <div className="relative">
                      <img src={editWine.image} alt="Preview" className="w-full rounded-lg" style={{ aspectRatio: '1' }} />
                      <label className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleImageUploadForEdit} className="hidden" />
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">와인 이름 *</label>
                    <input
                      type="text"
                      value={editWine.name}
                      onChange={(e) => setEditWine({ ...editWine, name: e.target.value })}
                      placeholder="예: Château Margaux 2015"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">와이너리 이름 *</label>
                    <input
                      type="text"
                      value={editWine.winery}
                      onChange={(e) => setEditWine({ ...editWine, winery: e.target.value })}
                      placeholder="예: Château Margaux"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">와이너리 정보</label>
                    <textarea
                      value={editWine.wineryInfo}
                      onChange={(e) => setEditWine({ ...editWine, wineryInfo: e.target.value })}
                      placeholder="와이너리의 역사, 특징 등"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">당도: {editWine.sweetness}</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={editWine.sweetness}
                      onChange={(e) => setEditWine({ ...editWine, sweetness: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">산도: {editWine.acidity}</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={editWine.acidity}
                      onChange={(e) => setEditWine({ ...editWine, acidity: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">바디: {editWine.body}</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={editWine.body}
                      onChange={(e) => setEditWine({ ...editWine, body: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">와인 설명</label>
                    <textarea
                      value={editWine.description}
                      onChange={(e) => setEditWine({ ...editWine, description: e.target.value })}
                      placeholder="와인의 특징, 향, 맛 등"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">고객 후기</label>
                    <textarea
                      value={editWine.reviews}
                      onChange={(e) => setEditWine({ ...editWine, reviews: e.target.value })}
                      placeholder="고객들의 감상"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">가격 (원)</label>
                      <input
                        type="number"
                        value={editWine.price || ''}
                        onChange={(e) => setEditWine({ ...editWine, price: e.target.value })}
                        placeholder="예: 45000"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">재고 여부</label>
                      <select
                        value={editWine.inStock !== undefined ? editWine.inStock : true}
                        onChange={(e) => setEditWine({ ...editWine, inStock: e.target.value === 'true' })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="true">재고 있음</option>
                        <option value="false">품절</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setDrawerView('detail');
                        setEditWine(null);
                      }}
                      disabled={saving}
                      className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleEditWine}
                      disabled={saving}
                      className="flex-1 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>수정 중...</span>
                        </>
                      ) : '수정'}
                    </button>
                  </div>
                </div>
              )}

              {/* Detail View */}
              {drawerView === 'detail' && selectedWine && (
                <div>
                  <img src={selectedWine.image} alt={selectedWine.name} className="w-full object-cover" style={{ aspectRatio: '1' }} />
                  <div className="p-6 space-y-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{selectedWine.date}</p>
                      <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">{selectedWine.name}</h2>
                      <p className="text-lg text-gray-600">{selectedWine.winery}</p>
                    </div>

                    {selectedWine.wineryInfo && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">와이너리</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{selectedWine.wineryInfo}</p>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">특성</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">당도</span>
                            <span className="font-medium">{selectedWine.sweetness}/5</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(selectedWine.sweetness / 5) * 100}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">산도</span>
                            <span className="font-medium">{selectedWine.acidity}/5</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-pink-500 rounded-full" style={{ width: `${(selectedWine.acidity / 5) * 100}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">바디</span>
                            <span className="font-medium">{selectedWine.body}/5</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${(selectedWine.body / 5) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedWine.description && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">테이스팅 노트</h3>
                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{selectedWine.description}</p>
                      </div>
                    )}

                    {selectedWine.reviews && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">고객 후기</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line italic">{selectedWine.reviews}</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {selectedWine.price && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">가격</h3>
                          <p className="text-2xl font-bold text-purple-600">{parseInt(selectedWine.price).toLocaleString()}원</p>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">재고</h3>
                        <p className={`text-sm font-medium ${selectedWine.inStock !== false ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedWine.inStock !== false ? '✓ 재고 있음' : '✕ 품절'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setDrawerView('edit-password')}
                        className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => setDrawerView('delete-password')}
                        className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Password View */}
              {drawerView === 'edit-password' && (
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  <div className="w-full max-w-xs">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">비밀번호 입력</h3>
                    <p className="text-sm text-gray-500 mb-6 text-center">수정하려면 관리자 비밀번호가 필요합니다</p>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      onKeyPress={async (e) => {
                        if (e.key === 'Enter') {
                          const hash = await sha256(passwordInput);
                          if (hash === PASSWORD_HASH) {
                            setEditWine({ ...selectedWine });
                            setDrawerView('edit');
                          } else {
                            alert('비밀번호가 올바르지 않습니다.');
                            setPasswordInput('');
                          }
                        }
                      }}
                      placeholder="6자리 비밀번호"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={async () => {
                        const hash = await sha256(passwordInput);
                        if (hash === PASSWORD_HASH) {
                          setEditWine({ ...selectedWine });
                          setDrawerView('edit');
                        } else {
                          alert('비밀번호가 올바르지 않습니다.');
                          setPasswordInput('');
                        }
                      }}
                      className="w-full mt-4 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
                    >
                      확인
                    </button>
                  </div>
                </div>
              )}

              {/* Delete Password View */}
              {drawerView === 'delete-password' && (
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  <div className="w-full max-w-xs">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">비밀번호 입력</h3>
                    <p className="text-sm text-gray-500 mb-6 text-center">삭제하려면 관리자 비밀번호가 필요합니다</p>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      onKeyPress={async (e) => {
                        if (e.key === 'Enter') {
                          const hash = await sha256(passwordInput);
                          if (hash === PASSWORD_HASH) {
                            await handleDeleteWine();
                          } else {
                            alert('비밀번호가 올바르지 않습니다.');
                            setPasswordInput('');
                          }
                        }
                      }}
                      placeholder="6자리 비밀번호"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      onClick={async () => {
                        const hash = await sha256(passwordInput);
                        if (hash === PASSWORD_HASH) {
                          await handleDeleteWine();
                        } else {
                          alert('비밀번호가 올바르지 않습니다.');
                          setPasswordInput('');
                        }
                      }}
                      className="w-full mt-4 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition"
                    >
                      확인
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="font-serif text-xl font-semibold text-gray-900 mb-4">Claude API 키 설정</h3>
            <p className="text-sm text-gray-600 mb-4">
              AI 자동 완성 기능을 사용하려면 Claude API 키가 필요합니다.<br />
              <a href="https://console.anthropic.com" target="_blank" className="text-purple-600 hover:underline">console.anthropic.com</a>에서 발급받으세요.
            </p>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApiKeyModal(false);
                  setApiKeyInput('');
                }}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (apiKeyInput.trim()) {
                    localStorage.setItem('claude_api_key', apiKeyInput.trim());
                    alert('API 키가 저장되었습니다!');
                    setShowApiKeyModal(false);
                    setApiKeyInput('');
                  } else {
                    alert('API 키를 입력해주세요.');
                  }
                }}
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilterPanel && <FilterPanel />}
    </div>
  );
}

export default App;
