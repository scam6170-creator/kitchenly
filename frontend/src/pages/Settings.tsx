import { Layout } from '../components/Layout';
import { t } from '../i18n/translations';
import { useUIStore } from '../store/ui';

const Settings = () => {
  const language = useUIStore((state) => state.language);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('settings', language)}</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Settings coming soon...</p>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
