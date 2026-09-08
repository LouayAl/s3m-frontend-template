import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const ENTREPRISE_KEY = 'globalFilter.entrepriseId';
const YEARS_KEY = 'globalFilter.years';
const DEPARTEMENT_KEY = 'globalFilter.departementId';

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
  const [selectedDepartementId, setSelectedDepartementIdState] = useState(() =>
    readJson(DEPARTEMENT_KEY, '')
  );

  const setSelectedEntrepriseId = (id) => {
    setSelectedEntrepriseIdState(id);
    localStorage.setItem(ENTREPRISE_KEY, JSON.stringify(id));
    // A department belongs to one entreprise — a stale departementId from
    // the previous entreprise would silently scope the new one's KPIs wrong.
    setSelectedDepartementIdState('');
    localStorage.setItem(DEPARTEMENT_KEY, JSON.stringify(''));
  };

  const setSelectedYears = (years) => {
    setSelectedYearsState(years);
    localStorage.setItem(YEARS_KEY, JSON.stringify(years));
  };

  const setSelectedDepartementId = (id) => {
    setSelectedDepartementIdState(id);
    localStorage.setItem(DEPARTEMENT_KEY, JSON.stringify(id));
  };

  return (
    <GlobalFilterContext.Provider
      value={{
        selectedEntrepriseId,
        setSelectedEntrepriseId,
        selectedYears,
        setSelectedYears,
        selectedDepartementId,
        setSelectedDepartementId,
      }}
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