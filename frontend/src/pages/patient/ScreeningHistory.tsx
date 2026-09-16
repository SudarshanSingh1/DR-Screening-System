import React, { useState } from 'react';
import { useScreenings } from '../../hooks/usePatient';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export const ScreeningHistory: React.FC = () => {
  const { screenings, loading, error } = useScreenings();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const filteredScreenings = screenings.filter(s => 
    s.facility.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('my_screenings')}</h1>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search_facilities')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            {t('filter')}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
             <LoadingState message={t('loading_records')} />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
             <ErrorState message={t('error_load_screenings')} />
          </div>
        ) : filteredScreenings.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <EmptyState 
              title={searchQuery ? t('no_matching_records') : t('no_screening_records')} 
              message={searchQuery ? t('try_adjusting_search') : t('no_screening_records_desc')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('date')}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('facility')}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('actions')}</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredScreenings.map((screening) => (
                    <tr key={screening.id}>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{screening.date}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{screening.facility}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm">
                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                           screening.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                         }`}>
                           {screening.status === 'Processing' ? t('in_progress') : t('completed')}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <button 
                           onClick={() => navigate(`/patient/screenings/${screening.id}`)}
                           className="text-blue-600 hover:text-blue-900"
                         >
                           {t('view_details')}
                         </button>
                       </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
};
