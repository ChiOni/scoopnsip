import { COUNTRIES } from '../../lib/constants';

export default function WineForm({
  wine,
  onChange,
  onSubmit,
  onCancel,
  onImageUpload,
  onAIAutoFill,
  aiLoading,
  isEditMode = false
}) {
  const handleChange = (field, value) => {
    onChange({ ...wine, [field]: value });
  };

  const handleImageChange = (e) => {
    if (onImageUpload) {
      onImageUpload(e);
    }
  };

  const handleRemoveImage = () => {
    onChange({ ...wine, image: null, imagePreview: null });
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className="font-serif text-xl font-semibold text-gray-900">
        {isEditMode ? '와인 수정' : '새 와인 추가'}
      </h3>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">최초 판매 일자</label>
        <input
          type="date"
          value={wine.date || ''}
          onChange={(e) => handleChange('date', e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="미입력 시 추후 등록 가능"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">와인 사진</label>
        {wine.imagePreview || wine.image ? (
          <div className="relative">
            <img
              src={wine.imagePreview || wine.image}
              alt="Preview"
              className="w-full rounded-lg"
              style={{aspectRatio: '1'}}
            />
            {isEditMode ? (
              <label className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </label>
            ) : (
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition" style={{aspectRatio: '1'}}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm">사진 업로드</span>
            </div>
          </label>
        )}
      </div>

      {/* Wine Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">와인 이름 *</label>
        <input
          type="text"
          value={wine.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="예: Château Margaux 2015"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* AI Auto-fill Button (only in create mode) */}
      {!isEditMode && (wine.imagePreview || wine.image) && wine.name && (
        <button
          onClick={onAIAutoFill}
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

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">원산지 *</label>
        <select
          value={wine.country || ''}
          onChange={(e) => handleChange('country', e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">선택하세요</option>
          {Object.entries(COUNTRIES).map(([key, country]) => (
            <option key={key} value={key}>{country.name}</option>
          ))}
        </select>
      </div>

      {/* Wine Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">와인 종류 *</label>
        <select
          value={wine.type || ''}
          onChange={(e) => handleChange('type', e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">선택하세요</option>
          <option value="Red">레드</option>
          <option value="White">화이트</option>
          <option value="Rosé">로제</option>
          <option value="Sparkling">스파클링</option>
        </select>
      </div>

      {/* Winery */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">와이너리 이름 *</label>
        <input
          type="text"
          value={wine.winery || ''}
          onChange={(e) => handleChange('winery', e.target.value)}
          placeholder="예: Château Margaux"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Winery Info */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">와이너리 정보</label>
        <textarea
          value={wine.wineryInfo || ''}
          onChange={(e) => handleChange('wineryInfo', e.target.value)}
          placeholder="와이너리의 역사, 특징 등"
          rows={3}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
      </div>

      {/* Sweetness */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">당도: {wine.sweetness || 3}</label>
        <input
          type="range"
          min="1"
          max="5"
          value={wine.sweetness || 3}
          onChange={(e) => handleChange('sweetness', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Acidity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">산도: {wine.acidity || 3}</label>
        <input
          type="range"
          min="1"
          max="5"
          value={wine.acidity || 3}
          onChange={(e) => handleChange('acidity', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">바디: {wine.body || 3}</label>
        <input
          type="range"
          min="1"
          max="5"
          value={wine.body || 3}
          onChange={(e) => handleChange('body', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">와인 설명</label>
        <textarea
          value={wine.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="와인의 특징, 향, 맛 등"
          rows={4}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
      </div>

      {/* Reviews */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">고객 후기</label>
        <textarea
          value={wine.reviews || ''}
          onChange={(e) => handleChange('reviews', e.target.value)}
          placeholder="고객들의 감상"
          rows={4}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
      </div>

      {/* Price and Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">가격 (원)</label>
          <input
            type="number"
            value={wine.price || ''}
            onChange={(e) => handleChange('price', e.target.value)}
            placeholder="예: 45000"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">재고 여부</label>
          <select
            value={wine.inStock !== undefined ? wine.inStock : true}
            onChange={(e) => handleChange('inStock', e.target.value === 'true')}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="true">재고 있음</option>
            <option value="false">품절</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          취소
        </button>
        <button
          onClick={onSubmit}
          className="flex-1 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
        >
          {isEditMode ? '수정' : '저장'}
        </button>
      </div>
    </div>
  );
}
