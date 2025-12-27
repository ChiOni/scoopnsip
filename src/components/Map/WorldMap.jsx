import React from 'react';
import CountryMarker from './CountryMarker';
import { COUNTRIES } from '../../lib/constants';

/**
 * 세계 지도 컴포넌트
 */
function WorldMap({ wines, onCountryClick }) {
  // 국가별 와인 개수 계산
  const getCountryWineCount = (countryCode) => {
    return wines.filter(wine => wine.country === countryCode).length;
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* 세계 지도 배경 (SVG 또는 이미지) */}
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" fill="#9333EA" opacity="0.1" />
        </svg>
      </div>

      {/* 국가 마커들 */}
      {Object.entries(COUNTRIES).map(([code, country]) => {
        const count = getCountryWineCount(code);
        if (count === 0) return null;

        return (
          <CountryMarker
            key={code}
            code={code}
            country={country}
            count={count}
            onClick={() => onCountryClick(code)}
          />
        );
      })}
    </div>
  );
}

export default WorldMap;
