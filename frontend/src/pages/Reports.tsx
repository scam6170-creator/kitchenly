import { Layout } from '../components/Layout';
import { t } from '../i18n/translations';
import { useUIStore } from '../store/ui';

const Reports = () => {
  const language = useUIStore((state) => state.language);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('reports', language)}</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Reports coming soon...</p>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
