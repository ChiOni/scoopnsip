import React from 'react';

/**
 * 국가 마커 컴포넌트
 */
function CountryMarker({ code, country, count, onClick }) {
  return (
    <div
      className="country-marker absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${country.x}%`,
        top: `${country.y}%`
      }}
      onClick={onClick}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl"
        style={{ backgroundColor: country.color }}
      >
        {count}
      </div>
      <div className="absolute top-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded shadow">
          {country.name}
        </span>
      </div>
    </div>
  );
}

export default CountryMarker;
