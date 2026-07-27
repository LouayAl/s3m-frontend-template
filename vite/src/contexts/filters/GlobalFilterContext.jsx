// frontend-template/vite/src/contexts/filters/GlobalFilterContext.jsx
import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const ENTREPRISE_KEY = 'globalFilter.entrepriseId';
const YEARS_KEY = 'globalFilter.years';

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const GlobalFilterContext = createContext(undefined);

export function GlobalFilterProvider({ children }) {
  const [selectedEntrepriseId, setSelectedEntrepriseIdState] = useState(() =>
    readJson(ENTREPRISE_KEY, '')
  );
  const [selectedYears, setSelectedYearsState] = useState(() =>
    readJson(YEARS_KEY, [2026])
  );

  const setSelectedEntrepriseId = (id) => {
    setSelectedEntrepriseIdState(id);
    localStorage.setItem(ENTREPRISE_KEY, JSON.stringify(id));
  };

  const setSelectedYears = (years) => {
    setSelectedYearsState(years);
    localStorage.setItem(YEARS_KEY, JSON.stringify(years));
  };

  return (
    <GlobalFilterContext.Provider
      value={{ selectedEntrepriseId, setSelectedEntrepriseId, selectedYears, setSelectedYears }}
    >
      {children}
    </GlobalFilterContext.Provider>
  );
}

GlobalFilterProvider.propTypes = { children: PropTypes.node };

export function useGlobalFilter() {
  const ctx = useContext(GlobalFilterContext);
  if (!ctx) throw new Error('useGlobalFilter must be used within a GlobalFilterProvider');
  return ctx;
}