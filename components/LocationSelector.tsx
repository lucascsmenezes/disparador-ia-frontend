import React from 'react';
import type { Location } from '../types';
import { BRAZILIAN_STATES } from '../constants';

interface LocationSelectorProps {
  location: Location;
  setLocation: (location: Location) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ location, setLocation }) => {
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocation({ state: e.target.value, city: '' });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocation({ ...location, city: e.target.value });
  };

  const selectStyles = "w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 transition-colors duration-300";

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="state-select" className="block mb-2 text-sm font-medium text-slate-400">Estado</label>
        <select
          id="state-select"
          value={location.state}
          onChange={handleStateChange}
          className={selectStyles}
        >
          <option value="">Selecione um estado</option>
          {Object.keys(BRAZILIAN_STATES).map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="city-select" className="block mb-2 text-sm font-medium text-slate-400">Cidade</label>
        <select
          id="city-select"
          value={location.city}
          onChange={handleCityChange}
          disabled={!location.state}
          className={`${selectStyles} disabled:bg-slate-800/50 disabled:cursor-not-allowed`}
        >
          <option value="">Selecione uma cidade</option>
          {location.state && BRAZILIAN_STATES[location.state]?.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LocationSelector;